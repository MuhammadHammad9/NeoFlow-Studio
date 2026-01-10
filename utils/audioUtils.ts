
// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Internal helper for decoding raw PCM (Int16)
const decodePCM = (
  buffer: ArrayBuffer,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer => {
  const dataInt16 = new Int16Array(buffer);
  const frameCount = dataInt16.length / numChannels;
  const audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return audioBuffer;
};

// Function to play raw PCM or encoded audio returned from Gemini
export interface AudioPlayerResult {
  source: AudioBufferSourceNode;
  audioContext: AudioContext;
  duration: number;
  startTime: number;
  buffer: AudioBuffer;
}

export const playAudioData = async (base64Data: string, sampleRate = 24000): Promise<AudioPlayerResult> => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate });

    // Decode base64 to ArrayBuffer
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini TTS returns raw PCM (Int16)
    const audioBuffer = decodePCM(bytes.buffer, audioContext, sampleRate);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    return {
      source,
      audioContext,
      duration: audioBuffer.duration,
      startTime: audioContext.currentTime,
      buffer: audioBuffer
    };
  } catch (error) {
    console.error("Error playing audio:", error);
    throw error;
  }
};
