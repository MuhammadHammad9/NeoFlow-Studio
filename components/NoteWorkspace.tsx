import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Wand2, Loader2, BrainCircuit, Trash2, Sparkles, RefreshCw, AlertTriangle, Paperclip, FileText, X, AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, Download, Printer, Code, Eye, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeNote, generateStudyGuide, getFriendlyErrorMessage } from '../services/geminiService';
import { addToHistory, getHistory } from '../services/historyService';
import { useTheme } from '../contexts/ThemeContext';
import { HistoryItem } from '../types';

export const NoteWorkspace: React.FC = () => {
  const { theme, mode } = useTheme();
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateNotes, setSelectedDateNotes] = useState<HistoryItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Study Guide State
  const [showStudyGuide, setShowStudyGuide] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [studyGuideData, setStudyGuideData] = useState<{latexCode: string, markdownContent: string} | null>(null);
  const [viewMode, setViewMode] = useState<'compiled' | 'source'>('compiled');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Styles based on Mode
  const textPrimary = mode === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardClass = mode === 'dark' 
    ? 'bg-slate-950/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
    : 'bg-white/80 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl';
  const inputBg = mode === 'dark' ? 'bg-transparent' : 'bg-transparent';
  
  // Load saved state on mount
  useEffect(() => {
    const savedNote = localStorage.getItem('gemini_smart_note');
    const savedResult = localStorage.getItem('gemini_smart_result');
    const savedAudio = localStorage.getItem('gemini_smart_audio');

    if (savedNote) setNote(savedNote);
    if (savedResult) setResult(savedResult);
    
    if (savedAudio) {
      try {
        fetch(savedAudio)
          .then(res => res.blob())
          .then(blob => {
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
          });
      } catch (e) {
        console.error("Failed to restore audio from storage", e);
      }
    }
    
    // Load History for Calendar
    setHistory(getHistory().filter(item => item.type === 'NOTE'));
  }, []);

  // Save note on change
  useEffect(() => {
    localStorage.setItem('gemini_smart_note', note);
  }, [note]);

  // Save result on change
  useEffect(() => {
    if (result) {
      localStorage.setItem('gemini_smart_result', result);
    }
  }, [result]);

  const saveAudioToStorage = (blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64 = reader.result as string;
        localStorage.setItem('gemini_smart_audio', base64);
        setStorageWarning(null);
      } catch (e) {
        console.warn("Audio too large for local storage");
        setStorageWarning("Audio recording is too large to be saved for refresh. It will be lost if you switch tabs.");
      }
    };
    reader.readAsDataURL(blob);
  };

  const startRecording = async () => {
    setStorageWarning(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        saveAudioToStorage(blob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Microphone access was denied. Please check your browser permissions.");
      } else {
        setError("Could not access microphone. Please check your device settings.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    localStorage.removeItem('gemini_smart_audio');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError("File is too large. Please upload a file smaller than 20MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setAttachment(file);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    // Immediate clear without confirmation dialog
    setNote('');
    clearAudio();
    clearAttachment();
    setResult(null);
    setStorageWarning(null);
    setError(null);
    
    localStorage.removeItem('gemini_smart_note');
    localStorage.removeItem('gemini_smart_result');
    localStorage.removeItem('gemini_smart_audio');
  };

  const handleProcess = async () => {
    if (!note && !audioBlob && !attachment) return;
    
    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const responseText = await analyzeNote(note, audioBlob, attachment, isThinkingMode, "");
      if (!responseText) {
        throw new Error("Received empty response from the model.");
      }
      setResult(responseText);
      
      // Log to history
      const title = note ? note.substring(0, 30) + (note.length > 30 ? '...' : '') : (attachment ? `File: ${attachment.name}` : 'Audio Note');
      addToHistory('NOTE', title, responseText);
      setHistory(getHistory().filter(item => item.type === 'NOTE')); // Update local history
    } catch (e) {
      console.error(e);
      setError(getFriendlyErrorMessage(e));
    } finally {
      setIsProcessing(false);
    }
  };

  // Study Guide Handlers
  const handleGenerateStudyGuide = async () => {
      if (!result && !note) return;
      
      setIsGeneratingGuide(true);
      setShowStudyGuide(true);
      setError(null);

      try {
          // Use the generated result if available, otherwise use raw notes
          const contentToProcess = result || note;
          const data = await generateStudyGuide(contentToProcess);
          setStudyGuideData(data);
      } catch (e) {
          console.error(e);
          setError("Failed to generate study guide. Please try again.");
          setShowStudyGuide(false);
      } finally {
          setIsGeneratingGuide(false);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleDownloadLatex = () => {
      if (!studyGuideData) return;
      const element = document.createElement("a");
      const file = new Blob([studyGuideData.latexCode], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "neoflow_study_guide.tex";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      return { days, firstDay };
  };

  const handleDateClick = (day: number) => {
      const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const notes = history.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate.getDate() === day && 
                 itemDate.getMonth() === currentDate.getMonth() && 
                 itemDate.getFullYear() === currentDate.getFullYear();
      });
      setSelectedDateNotes(notes);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const { days: totalDays, firstDay } = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-5xl font-extrabold font-heading ${textPrimary} mb-3 tracking-tight`}>Smart Workspace</h1>
          <p className={`${textSecondary} text-lg max-w-2xl`}>Draft notes, record audio, upload files, and let NeoFlow organize them into structured insights.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border font-medium ${showCalendar ? `bg-${theme}-500 text-white border-${theme}-600` : (mode === 'dark' ? 'bg-slate-800/50 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200')}`}
            >
                <CalendarIcon className="w-4 h-4" />
                <span>{showCalendar ? 'Hide Calendar' : 'View Calendar'}</span>
            </button>
            {(note || audioBlob || result || attachment) && (
            <button 
                onClick={handleClearAll}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border font-medium ${mode === 'dark' ? 'bg-slate-800/50 hover:bg-red-900/20 text-slate-300 hover:text-red-400 border-slate-700 hover:border-red-800/50' : 'bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 hover:border-red-200 shadow-sm'}`}
            >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
            </button>
            )}
        </div>
      </header>

      {/* Study Guide Modal / Compiler View */}
      {showStudyGuide && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
             <div className="w-full max-w-5xl h-[90vh] bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col print:h-full print:w-full print:bg-white print:shadow-none print:rounded-none">
                
                {/* Header - Hidden in Print */}
                <div className="p-4 border-b dark:border-white/10 flex items-center justify-between bg-white dark:bg-slate-800 print:hidden">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl bg-${theme}-500 text-white`}>
                          <BookOpen className="w-5 h-5" />
                       </div>
                       <h2 className="text-xl font-bold font-heading dark:text-white">NeoFlow Study Compiler</h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Toggle View */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mr-4">
                           <button 
                             onClick={() => setViewMode('compiled')}
                             className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'compiled' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                           >
                              <Eye className="w-4 h-4" /> Compiled
                           </button>
                           <button 
                             onClick={() => setViewMode('source')}
                             className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'source' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                           >
                              <Code className="w-4 h-4" /> LaTeX Source
                           </button>
                        </div>

                        {studyGuideData && (
                            <>
                                <button onClick={handleDownloadLatex} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-lg" title="Download .tex">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20">
                                    <Printer className="w-4 h-4" />
                                    <span>Print / Save PDF</span>
                                </button>
                            </>
                        )}
                        <button onClick={() => setShowStudyGuide(false)} className="ml-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-200/50 dark:bg-black/20 print:p-0 print:bg-white print:overflow-visible">
                    {isGeneratingGuide ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader2 className={`w-12 h-12 text-${theme}-500 animate-spin mb-4`} />
                            <p className="text-lg font-medium dark:text-white animate-pulse">Compiling study materials...</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Converting to LaTeX format & structuring content</p>
                        </div>
                    ) : studyGuideData ? (
                        viewMode === 'compiled' ? (
                            // Simulated LaTeX View
                            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none p-[20mm] font-serif text-slate-900 relative">
                                {/* Header */}
                                <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight mb-1">Study Guide</h1>
                                        <p className="text-sm uppercase tracking-widest text-slate-500">Generated by NeoFlow Studio</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <Sparkles className={`w-6 h-6 text-${theme}-500`} />
                                         <span className="font-bold text-xl tracking-tighter">NeoFlow</span>
                                    </div>
                                </div>
                                
                                {/* Content - Using specific styles to mimic LaTeX */}
                                <div className="prose prose-slate max-w-none text-justify print:prose-sm leading-relaxed">
                                    <style>{`
                                        .prose h1 { font-family: 'EB Garamond', serif; font-size: 24pt; margin-top: 2em; margin-bottom: 1em; border-bottom: 1px solid #eee; padding-bottom: 0.5em; }
                                        .prose h2 { font-family: 'EB Garamond', serif; font-size: 18pt; margin-top: 1.5em; font-weight: 600; }
                                        .prose h3 { font-family: 'EB Garamond', serif; font-size: 14pt; margin-top: 1.2em; font-style: italic; }
                                        .prose p { margin-bottom: 1em; text-indent: 1.5em; }
                                        .prose p:first-of-type { text-indent: 0; }
                                        .prose ul, .prose ol { margin-bottom: 1em; padding-left: 2em; }
                                        .prose li { margin-bottom: 0.5em; }
                                        .prose strong { font-weight: 700; color: #1a202c; }
                                    `}</style>
                                    <ReactMarkdown>{studyGuideData.markdownContent}</ReactMarkdown>
                                </div>

                                {/* Footer */}
                                <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-mono print:fixed print:bottom-4 print:left-0 print:right-0 print:border-none">
                                    <p>© {new Date().getFullYear()} NeoFlow Rights Reserved • Generated with Gemini 3.0</p>
                                </div>
                            </div>
                        ) : (
                            // Source Code View
                            <div className="max-w-4xl mx-auto h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-slate-900 print:hidden">
                                <div className="bg-slate-950 p-2 px-4 flex justify-between items-center border-b border-slate-800">
                                   <span className="text-xs font-mono text-slate-400">main.tex</span>
                                   <button 
                                      onClick={() => navigator.clipboard.writeText(studyGuideData.latexCode)}
                                      className="text-xs text-emerald-400 hover:text-emerald-300"
                                   >
                                      Copy Code
                                   </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-slate-300 overflow-auto h-[calc(100%-40px)] custom-scrollbar">
                                    {studyGuideData.latexCode}
                                </pre>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                             Failed to load data.
                        </div>
                    )}
                </div>
             </div>
          </div>
      )}

      {/* Calendar View Overlay/Section */}
      {showCalendar && (
          <div className={`animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 rounded-[2.5rem] border ${mode === 'dark' ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'} shadow-2xl`}>
              <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-2xl font-bold ${textPrimary}`}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                      <div className="flex gap-2">
                          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className={`p-2 rounded-xl border ${mode === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}><ChevronLeft className="w-5 h-5" /></button>
                          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className={`p-2 rounded-xl border ${mode === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}><ChevronRight className="w-5 h-5" /></button>
                      </div>
                  </div>
                  <div className="grid grid-cols-7 gap-4 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d} className={`text-center text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{d}</div>
                      ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                      {blanksArray.map(i => <div key={`blank-${i}`} className="h-24"></div>)}
                      {daysArray.map(day => {
                          const hasNotes = history.some(item => {
                              const d = new Date(item.timestamp);
                              return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                          });
                          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                          
                          return (
                              <button 
                                key={day} 
                                onClick={() => handleDateClick(day)}
                                className={`h-24 rounded-2xl border flex flex-col items-start justify-start p-3 transition-all hover:scale-[1.02] ${hasNotes ? (mode === 'dark' ? `bg-${theme}-900/20 border-${theme}-500/50` : `bg-${theme}-50 border-${theme}-200`) : (mode === 'dark' ? 'bg-white/5 border-transparent hover:bg-white/10' : 'bg-slate-50 border-transparent hover:bg-slate-100')} ${isToday ? `ring-2 ring-${theme}-500` : ''}`}
                              >
                                  <span className={`text-lg font-bold ${isToday ? `text-${theme}-500` : textPrimary}`}>{day}</span>
                                  {hasNotes && <div className={`mt-auto w-2 h-2 rounded-full bg-${theme}-500`}></div>}
                              </button>
                          );
                      })}
                  </div>
              </div>
              <div className={`p-6 rounded-3xl ${mode === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>Notes for Selected Day</h3>
                  {selectedDateNotes.length > 0 ? (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                          {selectedDateNotes.map(note => (
                              <div key={note.id} className={`p-4 rounded-2xl border ${mode === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                  <h4 className={`font-bold mb-1 ${textPrimary}`}>{note.title}</h4>
                                  <p className={`text-sm line-clamp-3 ${textSecondary}`}>{note.preview}</p>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className={textSecondary}>Select a date with activity to view notes.</p>
                  )}
              </div>
          </div>
      )}

      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4 text-red-500 animate-fade-in-up backdrop-blur-sm">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold font-heading">Action Failed</p>
            <p className="text-sm opacity-90 leading-relaxed mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="hover:text-red-700 transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>
      )}

      {storageWarning && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 text-amber-600 animate-fade-in-up backdrop-blur-sm">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{storageWarning}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className={`rounded-[2rem] p-8 relative flex flex-col h-[600px] transition-all duration-300 ${cardClass}`}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Start typing your notes, thoughts or prompt here..."
              className={`flex-1 w-full border-none resize-none focus:ring-0 ${textPrimary} placeholder-slate-400/60 text-xl leading-relaxed mb-6 ${inputBg} font-sans`}
            />
            
            <div className={`border-t pt-6 ${mode === 'dark' ? 'border-white/5' : 'border-slate-200/60'}`}>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl transition-all duration-200 text-sm font-semibold border ${mode === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/5' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>Record Audio</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-sm font-semibold animate-pulse border border-red-500/20 ring-2 ring-red-500/10"
                    >
                      <StopCircle className="w-4 h-4" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl transition-all duration-200 text-sm font-semibold border ${mode === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/5' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.txt,.md,.csv,.json,image/*"
                  />
                </div>

                {attachment && (
                  <div className={`rounded-2xl p-4 border flex items-center gap-4 animate-fade-in-up ${mode === 'dark' ? `bg-${theme}-950/30 border-${theme}-500/30` : `bg-${theme}-50 border-${theme}-200`}`}>
                    <div className={`p-2 rounded-xl bg-${theme}-500/10`}>
                       <FileText className={`w-5 h-5 text-${theme}-500`} />
                    </div>
                    <span className={`text-sm font-medium truncate flex-1 ${mode === 'dark' ? `text-${theme}-200` : `text-${theme}-700`}`}>{attachment.name}</span>
                    <button 
                      onClick={clearAttachment} 
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-black/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {audioUrl && (
                  <div className={`rounded-2xl p-4 border flex items-center gap-4 animate-fade-in-up ${mode === 'dark' ? `bg-black/30 border-${theme}-500/30` : `bg-slate-50 border-slate-200`}`}>
                    <audio 
                      controls 
                      src={audioUrl} 
                      className="w-full h-8" 
                      style={{ filter: mode === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none' }} 
                    />
                    <button 
                      onClick={clearAudio} 
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-black/5"
                      title="Delete audio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
             <label className={`w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-4 cursor-pointer p-4 rounded-2xl transition-all border ${isThinkingMode ? (mode === 'dark' ? `bg-${theme}-900/20 border-${theme}-500/30 shadow-[0_0_15px_rgba(var(--${theme}-500),0.1)]` : `bg-${theme}-50 border-${theme}-200 shadow-sm`) : 'bg-transparent border-transparent'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${isThinkingMode ? `bg-${theme}-500/20 text-${theme}-500` : `bg-slate-500/10 text-slate-500`}`}>
                     <BrainCircuit className="w-5 h-5" />
                  </div>
                  <span className={`text-base font-semibold ${isThinkingMode ? (mode === 'dark' ? `text-${theme}-300` : `text-${theme}-700`) : textSecondary}`}>Deep Thinking</span>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={isThinkingMode}
                    onChange={(e) => setIsThinkingMode(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-7 rounded-full transition-colors duration-300 ease-in-out ${isThinkingMode ? `bg-${theme}-500` : (mode === 'dark' ? 'bg-slate-700' : 'bg-slate-300')}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ease-in-out ${isThinkingMode ? 'translate-x-5' : 'translate-x-0'} shadow-md`}></div>
                </div>
             </label>

             <button
              onClick={handleProcess}
              disabled={isProcessing || (!note && !audioBlob && !attachment)}
              className={`w-full sm:flex-1 h-[68px] flex items-center justify-center space-x-3 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isProcessing || (!note && !audioBlob && !attachment) ? 'bg-slate-500/30 cursor-not-allowed text-slate-400' : `bg-gradient-to-r from-${theme}-600 to-${theme}-500 hover:to-${theme}-400 shadow-${theme}-500/30`}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6" />
                  <span>Process with NeoFlow</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className={`rounded-[2rem] p-8 md:p-10 min-h-[600px] relative overflow-hidden flex flex-col ${cardClass}`}>
          {!result && !isProcessing && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${textSecondary}`}>
              <div className={`w-24 h-24 mb-6 rounded-full bg-gradient-to-b from-white/5 to-white/0 flex items-center justify-center border border-white/5`}>
                 <Sparkles className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-xl font-heading font-medium tracking-tight">AI insights will appear here.</p>
            </div>
          )}
          
          {isProcessing && (
             <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm ${mode === 'dark' ? 'bg-slate-950/70' : 'bg-white/70'}`}>
               <div className="relative mb-8">
                 <div className={`w-24 h-24 border-[6px] border-${theme}-500/20 border-t-${theme}-500 rounded-full animate-spin`}></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className={`w-8 h-8 text-${theme}-500 animate-pulse`} />
                 </div>
               </div>
               <p className={`text-2xl font-heading font-bold animate-pulse ${mode === 'dark' ? `text-${theme}-300` : `text-${theme}-600`}`}>NeoFlow is thinking...</p>
               {isThinkingMode && <p className={`text-base mt-3 ${textSecondary} bg-black/10 px-4 py-1 rounded-full backdrop-blur-md`}>Applying advanced reasoning (32k context)</p>}
             </div>
          )}

          {result && (
            <>
              {/* Toolbar for Results */}
              <div className="flex justify-end mb-6">
                 <button 
                    onClick={handleGenerateStudyGuide}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'dark' ? `bg-${theme}-500/20 text-${theme}-400 hover:bg-${theme}-500/30` : `bg-${theme}-50 text-${theme}-700 hover:bg-${theme}-100`}`}
                 >
                    <BookOpen className="w-4 h-4" />
                    Save as Study Guide
                 </button>
              </div>

              <div className={`prose prose-lg max-w-none leading-relaxed overflow-y-auto custom-scrollbar pr-2 ${mode === 'dark' ? 'prose-invert' : ''}`}>
                <ReactMarkdown 
                  components={{
                    h1: ({node, ...props}) => <h1 className={`text-4xl font-extrabold font-heading mb-8 pb-4 border-b ${mode === 'dark' ? `text-${theme}-400 border-white/10` : `text-${theme}-700 border-slate-200`}`} {...props} />,
                    h2: ({node, ...props}) => <h2 className={`text-2xl font-bold font-heading mt-10 mb-5 ${mode === 'dark' ? `text-${theme}-300` : `text-${theme}-700`}`} {...props} />,
                    h3: ({node, ...props}) => <h3 className={`text-xl font-bold font-heading mt-8 mb-4 ${mode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`} {...props} />,
                    ul: ({node, ...props}) => <ul className={`list-disc pl-6 space-y-3 my-6 ${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} {...props} />,
                    ol: ({node, ...props}) => <ol className={`list-decimal pl-6 space-y-3 my-6 ${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className={`font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} {...props} />,
                    p: ({node, ...props}) => <p className={`mb-6 ${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'} leading-loose`} {...props} />,
                    a: ({node, ...props}) => <a className={`font-semibold underline decoration-2 underline-offset-4 transition-colors ${mode === 'dark' ? `text-${theme}-400 hover:text-${theme}-300 decoration-${theme}-500/30` : `text-${theme}-600 hover:text-${theme}-700 decoration-${theme}-500/30`}`} target="_blank" rel="noopener noreferrer" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-6 italic my-8 py-2 ${mode === 'dark' ? `border-${theme}-500/50 text-slate-400 bg-white/5 rounded-r-xl` : `border-${theme}-500 text-slate-600 bg-slate-50 rounded-r-xl`}`} {...props} />,
                    code: ({node, ...props}) => <code className={`font-mono text-sm px-1.5 py-0.5 rounded ${mode === 'dark' ? 'bg-black/30 text-slate-200' : 'bg-slate-100 text-slate-800'}`} {...props} />,
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};