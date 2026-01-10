import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Loader2, Search, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeImage, getFriendlyErrorMessage } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { useTheme } from '../contexts/ThemeContext';

export const ImageAnalysis: React.FC = () => {
  const { theme, mode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Styles
  const textPrimary = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardClass = mode === 'dark' 
    ? 'bg-slate-950/60 border-white/10 backdrop-blur-md' 
    : 'bg-white/80 border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-md';

  // Load persistence
  useEffect(() => {
    const savedPrompt = localStorage.getItem('gemini_vision_prompt');
    const savedAnalysis = localStorage.getItem('gemini_vision_analysis');
    const savedImage = localStorage.getItem('gemini_vision_image');

    if (savedPrompt) setPrompt(savedPrompt);
    if (savedAnalysis) setAnalysis(savedAnalysis);
    
    if (savedImage) {
      setPreviewUrl(savedImage);
      try {
        fetch(savedImage)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "restored_image", { type: blob.type });
            setSelectedFile(file);
          });
      } catch (e) {
        console.error("Failed to restore image from storage", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('gemini_vision_prompt', prompt);
  }, [prompt]);

  useEffect(() => {
    if (analysis) localStorage.setItem('gemini_vision_analysis', analysis);
  }, [analysis]);

  const saveImageToStorage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64 = reader.result as string;
        localStorage.setItem('gemini_vision_image', base64);
        setStorageWarning(null);
      } catch {
        console.warn("Image too large for local storage");
        setStorageWarning("Image is too large to be saved for refresh. It will be lost if you switch tabs.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validation
      if (!file.type.startsWith('image/')) {
        setError("This file format is not supported. Please upload a JPG, PNG, or WEBP image.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      if (file.size > 20 * 1024 * 1024) { // 20MB max
         setError("The image file is too large. Please use an image smaller than 20MB.");
         if (fileInputRef.current) fileInputRef.current.value = '';
         return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Save to storage
      saveImageToStorage(file);
      setAnalysis(null);
      localStorage.removeItem('gemini_vision_analysis');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStorageWarning(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    localStorage.removeItem('gemini_vision_image');
  };

  const handleClearWorkspace = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setPrompt('');
    setStorageWarning(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    localStorage.removeItem('gemini_vision_prompt');
    localStorage.removeItem('gemini_vision_analysis');
    localStorage.removeItem('gemini_vision_image');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeImage(selectedFile, prompt);
      if (!result) throw new Error("No analysis returned from model.");
      setAnalysis(result);
      
      // Log to history
      addToHistory('IMAGE', `Image: ${prompt || 'Visual Analysis'}`, result);
    } catch (e) {
      console.error(e);
      setError(getFriendlyErrorMessage(e));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className={`text-4xl font-bold ${textPrimary} mb-2 flex items-center gap-3 tracking-tight`}>
            <ImageIcon className={`w-8 h-8 text-${theme}-500`} />
            Visual Intelligence
            </h1>
            <p className={textSecondary}>Upload images for detailed breakdown and analysis using <span className={`text-${theme}-500 font-mono text-sm font-medium`}>gemini-3-pro-preview</span></p>
        </div>
        {(prompt || analysis || selectedFile) && (
            <button 
                onClick={handleClearWorkspace}
                className={`self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${mode === 'dark' ? 'bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 border-slate-700 hover:border-red-800/50' : 'bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 hover:border-red-200 shadow-sm'}`}
            >
                <RefreshCw className="w-4 h-4" />
                <span>Clear Workspace</span>
            </button>
        )}
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-500 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
             <p className="font-semibold">Analysis Failed</p>
             <p className="text-sm opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="hover:text-red-700 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {storageWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3 text-yellow-600 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{storageWarning}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Column */}
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 h-96 relative overflow-hidden group
              ${previewUrl 
                ? (mode === 'dark' ? `border-${theme}-500/50 bg-slate-900/50` : `border-${theme}-500/50 bg-slate-50`) 
                : (mode === 'dark' ? `border-slate-700 hover:border-${theme}-500/50 bg-slate-900/40 hover:bg-slate-800/60` : `border-slate-200 hover:border-${theme}-400 bg-white hover:bg-slate-50`)}`}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                <button 
                  onClick={clearFile}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                  title="Remove Image"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div 
                className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors shadow-lg ${mode === 'dark' ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                  <UploadCloud className={`w-10 h-10 text-${theme}-500`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Click to upload image</h3>
                <p className={`${textSecondary}`}>Supports JPG, PNG, WEBP</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>

          <div className="space-y-4">
             <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2 uppercase tracking-wide`}>
                  Ask something specific (optional)
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Explain the diagram, Describe the scenery..."
                    className={`w-full rounded-xl pl-5 pr-12 py-4 focus:ring-2 focus:ring-${theme}-500 transition-all ${mode === 'dark' ? 'bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'}`}
                  />
                  <Search className={`w-5 h-5 absolute right-4 top-4 ${textSecondary}`} />
                </div>
             </div>

             <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${isAnalyzing || !selectedFile ? (mode === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400') : `bg-gradient-to-r from-${theme}-600 to-${theme}-500 text-white shadow-${theme}-500/20`}`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze Image</span>
                  </>
                )}
              </button>
          </div>
        </div>

        {/* Results Column */}
        <div className={`border rounded-3xl p-8 min-h-[400px] relative overflow-hidden ${cardClass} ${mode === 'dark' ? 'border-white/10' : 'border-white/60'}`}>
          {!analysis && !isAnalyzing && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${textSecondary}`}>
               <ImageIcon className="w-20 h-20 mb-6 opacity-20" />
               <p className="text-lg font-medium">Analysis results will appear here.</p>
            </div>
          )}
          
          {isAnalyzing && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm ${mode === 'dark' ? 'bg-slate-950/60' : 'bg-white/60'}`}>
               <Loader2 className={`w-12 h-12 text-${theme}-500 animate-spin mb-4`} />
               <p className={`text-lg font-medium animate-pulse ${mode === 'dark' ? `text-${theme}-300` : `text-${theme}-600`}`}>Vision model is examining the image...</p>
            </div>
          )}

          {analysis && (
             <div className={`prose max-w-none leading-relaxed ${mode === 'dark' ? 'prose-invert' : ''}`}>
                <h3 className={`text-2xl font-bold mb-6 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Analysis Result</h3>
                <div className={`${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};