import { GoogleGenAI, Modality, Type } from "@google/genai";
import { blobToBase64 } from "../utils/audioUtils";

// Lazy initialization to prevent app crash when API key is not set
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is not configured. Please set the GEMINI_API_KEY environment variable in your deployment settings.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

// Models
const MODEL_THINKING = 'gemini-3-pro-preview';
const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'gemini-3-pro-preview';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getFriendlyErrorMessage = (error: any): string => {
  const msg = (error.message || error.toString()).toLowerCase();
  
  if (msg.includes("400")) return "The request content was invalid or unsupported. Please check your inputs.";
  if (msg.includes("401") || msg.includes("403")) return "Authentication failed. Access denied.";
  if (msg.includes("429")) return "You are sending requests too fast. Please wait a moment and try again.";
  if (msg.includes("500") || msg.includes("503") || msg.includes("overloaded")) return "Gemini services are currently experiencing high traffic. Please retry in a few moments.";
  if (msg.includes("safety") || msg.includes("blocked")) return "The content was blocked due to safety guidelines. Please revise your input.";
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch")) return "Network connection issue. Please check your internet connection.";
  if (msg.includes("candidate")) return "The model could not generate a valid response for this input.";
  
  return "An unexpected error occurred. Please try again.";
};

export const analyzeNote = async (
  text: string, 
  audioBlob: Blob | null, 
  attachment: File | null,
  useThinking: boolean, 
  customPrompt: string
) => {
  try {
    const modelId = useThinking ? MODEL_THINKING : MODEL_FAST;
    const parts: any[] = [];

    // Add Text Note
    if (text) {
      parts.push({ text: `User Note: ${text}` });
    }

    // Add Audio if present
    if (audioBlob) {
      const base64Audio = await blobToBase64(audioBlob);
      parts.push({
        inlineData: {
          mimeType: audioBlob.type || 'audio/wav',
          data: base64Audio
        }
      });
    }

    // Add Attachment if present
    if (attachment) {
      const base64File = await blobToBase64(attachment);
      parts.push({
        inlineData: {
          mimeType: attachment.type,
          data: base64File
        }
      });
    }

    // Add instructions
    const prompt = customPrompt || "Analyze the provided content (notes, audio, or files). Summarize key points and structure the output in clean Markdown. If the content discusses specific topics, processes, or events, please search for and suggest relevant videos from the web to help understand the context better.";
    parts.push({ text: prompt });

    const config: any = {
      tools: [{ googleSearch: {} }]
    };
    
    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await getAI().models.generateContent({
      model: modelId,
      contents: { parts },
      config
    });

    let finalText = response.text || "";

    // Extract and append Grounding Metadata (Sources/Videos)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      finalText += "\n\n### References & Suggested Videos\n";
      const uniqueLinks = new Set();
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          if (!uniqueLinks.has(chunk.web.uri)) {
             finalText += `- [${chunk.web.title}](${chunk.web.uri})\n`;
             uniqueLinks.add(chunk.web.uri);
          }
        }
      });
    }

    return finalText;
  } catch (error) {
    console.error("Error analyzing note:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = getAI().chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const analyzeImage = async (imageFile: File, prompt: string) => {
  try {
    const base64Image = await blobToBase64(imageFile);
    
    const response = await getAI().models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          },
          { text: prompt || "Analyze this image in detail. Use Markdown for structure (# Headings, * Bullets, **Bold**) to provide a clean, readable breakdown." }
        ]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  try {
    const response = await getAI().models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio data received");
    return audioData;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

export const generateStudyGuide = async (content: string) => {
  try {
    const currentYear = new Date().getFullYear();
    const promptText = `Convert the following notes into a comprehensive, university-grade study guide.
    
    Content to process:
    ${content}
    
    Requirements:
    1. 'latexCode': Generate valid, compilable LaTeX source code using the 'article' class.
       - Use \\usepackage{fancyhdr}
       - Use \\pagestyle{fancy}
       - Clear defaults: \\fancyhf{}
       - Header Left: \\lhead{\\textbf{NeoFlow Studio}}
       - Footer Center: \\cfoot{\\small \\copyright ${currentYear} NeoFlow Rights Reserved}
       - Use clear sections, itemize/enumerate for lists, and text formatting.
       - Ensure all backslashes are properly escaped in the JSON output.
    2. 'markdownContent': Generate a Markdown version that mimics the structure for web display.
    
    Return strict JSON. Do NOT include markdown code blocks.`;

    const response = await getAI().models.generateContent({
      model: MODEL_FAST,
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latexCode: { type: Type.STRING },
            markdownContent: { type: Type.STRING }
          },
          required: ["latexCode", "markdownContent"]
        }
      }
    });

    let jsonString = response.text || "{}";
    
    // 1. Remove Markdown code blocks if present
    if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "");
    }

    // 2. Locate the JSON object if there's surrounding text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Study guide generation error:", error);
    throw error;
  }
};