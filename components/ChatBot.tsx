import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Mic, MicOff, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, getFriendlyErrorMessage } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { ChatMessage } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export const ChatBot: React.FC = () => {
  const { theme, mode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your advanced AI assistant powered by **Gemini 3.0 Pro**. I can help you with analysis, coding, creative writing, and more. How can I assist you today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Styles
  const textPrimary = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardClass = mode === 'dark' 
    ? 'bg-slate-950/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
    : 'bg-white/80 border border-white/60 shadow-xl backdrop-blur-xl';

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('gemini_chat_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save chat history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gemini_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.start();
  };

  const handleClearChat = () => {
    const defaultMsg: ChatMessage = { id: '1', role: 'model', text: 'Hello! I am your advanced AI assistant powered by Gemini 3.0 Pro. How can I help you today?', timestamp: Date.now() };
    setMessages([defaultMsg]);
    setInput('');
    // Explicitly set the storage to the default state immediately
    localStorage.setItem('gemini_chat_history', JSON.stringify([defaultMsg]));
  };

  const executeSend = async (messageText: string, historyMessages: ChatMessage[]) => {
    setIsLoading(true);
    try {
      // Filter out error messages from history before sending to API
      const apiHistory = historyMessages
        .filter(m => m.id !== '1' && !m.isError)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const responseText = await sendChatMessage(apiHistory, messageText);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I couldn't generate a response.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, modelMsg]);

      // Log to history
      if (responseText) {
          addToHistory('CHAT', `Chat: ${messageText}`, responseText);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: getFriendlyErrorMessage(error),
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    await executeSend(userMsg.text, messages); 
  };

  const handleRegenerate = async (errorMsgId: string) => {
    // Find the error message
    const errorIndex = messages.findIndex(m => m.id === errorMsgId);
    if (errorIndex === -1) return;

    // The user message should be right before the error message
    const previousMsg = messages[errorIndex - 1];
    if (!previousMsg || previousMsg.role !== 'user') return;

    // Remove the error message from UI
    const newMessages = messages.filter(m => m.id !== errorMsgId);
    setMessages(newMessages);

    // Re-try sending with the previous user message
    const historyForRetry = newMessages.slice(0, newMessages.length - 1); 
    
    await executeSend(previousMsg.text, historyForRetry);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] animate-fade-in-up">
      <header className="mb-6 flex-shrink-0 flex items-center justify-between">
         <div>
             <h1 className={`text-3xl font-bold font-heading ${textPrimary} mb-2 flex items-center gap-3 tracking-tight`}>
               <Bot className={`w-8 h-8 text-${theme}-500`} />
               NeoFlow Chat
             </h1>
             <p className={`${textSecondary} font-medium`}>Conversational intelligence powered by <span className={`text-${theme}-500 font-mono text-sm`}>gemini-3-pro-preview</span></p>
         </div>
         <button
            onClick={handleClearChat}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all border font-semibold text-sm hover:scale-105 active:scale-95 ${mode === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800 border-transparent hover:border-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100 border-transparent hover:border-slate-200'}`}
            title="Clear Chat History"
         >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
         </button>
      </header>

      <div className={`flex-1 rounded-[2.5rem] overflow-hidden flex flex-col relative ${cardClass}`}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-5 max-w-4xl animate-slide-in-right ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-110 ${
                msg.role === 'user' 
                  ? `bg-gradient-to-br from-${theme}-500 to-${theme}-600` 
                  : (msg.isError ? 'bg-red-500' : `bg-gradient-to-br from-emerald-500 to-emerald-600`)
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : (msg.isError ? <AlertCircle className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />)}
              </div>
              
              <div className={`rounded-3xl px-6 py-5 shadow-sm text-[1.05rem] leading-relaxed relative group transition-all duration-300 ${
                msg.role === 'user' 
                  ? `bg-${theme}-600 text-white rounded-tr-sm shadow-${theme}-500/20 hover:shadow-${theme}-500/30` 
                  : (msg.isError 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20 rounded-tl-sm' 
                      : (mode === 'dark' ? 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-slate-600' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md'))
              }`}>
                <div className="prose prose-sm md:prose-base max-w-none break-words">
                   <ReactMarkdown 
                    components={{
                       p: ({...props}) => <p className="mb-3 last:mb-0" {...props} />,
                       strong: ({...props}) => <strong className="font-bold inherit" {...props} />,
                       a: ({...props}) => <a className="underline hover:opacity-80 inherit decoration-2 underline-offset-2" target="_blank" {...props} />,
                       code: ({...props}) => <code className={`font-mono text-sm px-1.5 py-0.5 rounded ${msg.role === 'user' ? `bg-${theme}-700/50` : (mode === 'dark' ? 'bg-black/30' : 'bg-slate-100')}`} {...props} />,
                       pre: ({...props}) => <pre className={`p-3 rounded-xl my-2 overflow-x-auto ${msg.role === 'user' ? `bg-${theme}-800/50` : (mode === 'dark' ? 'bg-black/40' : 'bg-slate-100')}`} {...props} />
                    }}
                   >
                    {msg.text}
                   </ReactMarkdown>
                </div>
                
                {msg.isError && (
                  <button 
                    onClick={() => handleRegenerate(msg.id)}
                    className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-600 px-4 py-2 rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Generation
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-5 mr-auto max-w-4xl animate-fade-in-up">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                 <Bot className="w-5 h-5 text-white" />
               </div>
               <div className={`rounded-3xl rounded-tl-sm px-6 py-6 border flex items-center gap-3 ${mode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-md'}`}>
                 <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className={`p-4 md:p-6 border-t z-20 backdrop-blur-md ${mode === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white/50 border-slate-100'}`}>
          <form onSubmit={handleSend} className="relative max-w-5xl mx-auto flex items-end gap-3">
             <div className="relative flex-1 group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask NeoFlow anything..."}
                  className={`w-full border-none rounded-3xl pl-6 pr-14 py-4 text-lg transition-all shadow-lg focus:ring-2 focus:ring-${theme}-500 focus:shadow-${theme}-500/20 ${mode === 'dark' ? 'bg-slate-800 text-white placeholder-slate-500 group-hover:bg-slate-700/80' : 'bg-white text-slate-800 placeholder-slate-400 group-hover:bg-slate-50 ring-1 ring-slate-200'} ${isListening ? 'ring-2 ring-red-500/50' : ''}`}
                  disabled={isLoading}
                />
                
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all ${
                    isListening 
                      ? 'text-red-500 bg-red-500/10 animate-pulse' 
                      : `text-slate-400 hover:text-${theme}-500 hover:scale-110 ${mode === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`
                  }`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
             </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${!input.trim() || isLoading ? (mode === 'dark' ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400') : `bg-gradient-to-br from-${theme}-500 to-${theme}-600 text-white shadow-${theme}-500/25`}`}
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};