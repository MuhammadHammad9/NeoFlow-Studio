import React, { useState, useEffect, useRef } from 'react';
import { Podcast, PlayCircle, Loader2, Volume2, RefreshCw, AlertCircle, StopCircle, Settings, Rewind, FastForward, PauseCircle } from 'lucide-react';
import { generateSpeech, getFriendlyErrorMessage } from '../services/geminiService';
import { playAudioData, AudioPlayerResult } from '../utils/audioUtils';
import { addToHistory } from '../services/historyService';
import { useTheme } from '../contexts/ThemeContext';

const VOICES = [
  { id: 'Kore', label: 'Kore (Balanced)' },
  { id: 'Puck', label: 'Puck (Energetic)' },
  { id: 'Charon', label: 'Charon (Deep)' },
  { id: 'Fenrir', label: 'Fenrir (Authoritative)' },
  { id: 'Zephyr', label: 'Zephyr (Calm)' },
];

export const SpeechGenerator: React.FC = () => {
  const { theme, mode } = useTheme();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0); // Detune in cents
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioDataRef = useRef<AudioPlayerResult | null>(null);
  const progressRequestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0); // When playback started in AudioContext time
  const pauseOffsetRef = useRef<number>(0); // How far into the audio we are (in seconds)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic Styles
  const textPrimary = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardClass = mode === 'dark' 
    ? 'bg-slate-950/60 border-white/10 backdrop-blur-md' 
    : 'bg-white/80 border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-md';

  // Load persistence
  useEffect(() => {
    const savedText = localStorage.getItem('gemini_tts_text');
    const savedVoice = localStorage.getItem('gemini_tts_voice');
    if (savedText) setText(savedText);
    if (savedVoice) setSelectedVoice(savedVoice);
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('gemini_tts_text', text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem('gemini_tts_voice', selectedVoice);
  }, [selectedVoice]);

  // Apply speed/pitch changes in real-time
  useEffect(() => {
    if (audioDataRef.current?.source) {
      try {
        audioDataRef.current.source.playbackRate.value = speed;
        audioDataRef.current.source.detune.value = pitch;
      } catch (e) {
        // ignore
      }
    }
  }, [speed, pitch]);

  // Waveform Drawing
  const drawWaveform = (currentProgressPercent: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioDataRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const buffer = audioDataRef.current.buffer;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Get Theme Color Hex
    const themeColors: Record<string, string> = {
      emerald: '#10b981',
      blue: '#3b82f6',
      cyan: '#06b6d4',
      red: '#ef4444',
      orange: '#f97316'
    };
    const activeColor = themeColors[theme] || '#3b82f6';
    const inactiveColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

    // 1. Draw Inactive Waveform (Background)
    ctx.beginPath();
    ctx.fillStyle = inactiveColor;
    
    // Using a bar visualization for cleaner look
    const barWidth = 3;
    const gap = 1;
    const totalBars = Math.floor(width / (barWidth + gap));
    const samplesPerBar = Math.floor(data.length / totalBars);

    for (let i = 0; i < totalBars; i++) {
        let max = 0;
        for (let j = 0; j < samplesPerBar; j++) {
            const val = Math.abs(data[i * samplesPerBar + j]);
            if (val > max) max = val;
        }
        // Normalize
        const barHeight = Math.max(2, max * height * 1.5); 
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;
        
        ctx.fillRect(x, y, barWidth, barHeight);
    }

    // 2. Draw Active Overlay (Foreground) using composite operation
    const playedPx = (currentProgressPercent / 100) * width;
    
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = activeColor;
    ctx.fillRect(0, 0, playedPx, height);
    
    // Reset
    ctx.globalCompositeOperation = 'source-over';
  };

  // Resize canvas handler
  useEffect(() => {
    const handleResize = () => {
       if (canvasRef.current && canvasRef.current.parentElement) {
          canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
          canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
          drawWaveform(progress);
       }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, [progress, theme, mode]);

  // Redraw when audio stops/starts or just to clear
  useEffect(() => {
     if (!isPlaying && !audioDataRef.current && canvasRef.current) {
         const ctx = canvasRef.current.getContext('2d');
         if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
     }
  }, [isPlaying]);

  // Progress tracking loop
  useEffect(() => {
    if (isPlaying) {
      const trackProgress = () => {
        if (!audioDataRef.current) return;
        
        const ctxTime = audioDataRef.current.audioContext.currentTime;
        // Calculate played time based on when we started (startTimeRef) and where we started (pauseOffsetRef)
        const elapsed = (ctxTime - startTimeRef.current) * speed; 
        const actualTime = pauseOffsetRef.current + elapsed;

        const totalDuration = audioDataRef.current.duration;
        const currentProgress = Math.min((actualTime / totalDuration) * 100, 100);
        
        setProgress(currentProgress);
        setCurrentTime(Math.min(actualTime, totalDuration));

        // Draw Visualization
        drawWaveform(currentProgress);
        
        if (actualTime >= totalDuration) {
             setIsPlaying(false);
             setProgress(100);
             setCurrentTime(totalDuration);
             drawWaveform(100);
             pauseOffsetRef.current = 0; // Reset for replay
        } else {
            progressRequestRef.current = requestAnimationFrame(trackProgress);
        }
      };
      
      progressRequestRef.current = requestAnimationFrame(trackProgress);
    } else {
      if (progressRequestRef.current) {
        cancelAnimationFrame(progressRequestRef.current);
      }
    }

    return () => {
      if (progressRequestRef.current) {
        cancelAnimationFrame(progressRequestRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const playAudio = (startOffset: number) => {
      if (!audioDataRef.current) return;
      
      try {
          // Re-create source node (AudioBufferSourceNode can only be played once)
          const ctx = audioDataRef.current.audioContext;
          const newSource = ctx.createBufferSource();
          newSource.buffer = audioDataRef.current.buffer;
          newSource.connect(ctx.destination);
          
          newSource.playbackRate.value = speed;
          newSource.detune.value = pitch;
          
          // Start playing at current audioContext time, offset by where we want to be
          newSource.start(0, startOffset);
          
          // Update reference
          audioDataRef.current.source = newSource;
          
          // Update tracking refs
          startTimeRef.current = ctx.currentTime;
          pauseOffsetRef.current = startOffset;
          
          setIsPlaying(true);
      } catch (e) {
          console.error("Playback error", e);
      }
  };

  const stopAudio = () => {
    if (audioDataRef.current?.source) {
      try {
        audioDataRef.current.source.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      drawWaveform((newTime / duration) * 100);
      
      // If playing, restart at new time
      if (isPlaying) {
          stopAudio();
          playAudio(newTime);
      } else {
          // Just update offset so hitting play starts here
          pauseOffsetRef.current = newTime;
      }
  };

  const handleSkip = (seconds: number) => {
      let newTime = currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      drawWaveform((newTime / duration) * 100);
      
      if (isPlaying) {
          stopAudio();
          playAudio(newTime);
      } else {
          pauseOffsetRef.current = newTime;
      }
  };

  const togglePlayPause = () => {
      if (isPlaying) {
          // Pause logic: stop audio, save current time
          stopAudio();
          // pauseOffsetRef is already being used to track where we are for the next play
          // But we need to make sure currentTime is accurate when we paused
          const ctx = audioDataRef.current?.audioContext;
          if (ctx) {
             const elapsed = (ctx.currentTime - startTimeRef.current) * speed;
             pauseOffsetRef.current = pauseOffsetRef.current + elapsed;
          }
      } else {
          if (!audioDataRef.current && !text) return; 
          // If no audio generated yet, generate it
          if (!audioDataRef.current && text) {
             handleGenerate();
             return;
          }
          // Resume
          if (pauseOffsetRef.current >= duration) pauseOffsetRef.current = 0;
          playAudio(pauseOffsetRef.current);
      }
  };

  const handleClear = () => {
    stopAudio();
    audioDataRef.current = null;
    setText('');
    setError(null);
    setSpeed(1);
    setPitch(0);
    setDuration(0);
    setCurrentTime(0);
    setProgress(0);
    pauseOffsetRef.current = 0;
    localStorage.removeItem('gemini_tts_text');
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);
    stopAudio();
    pauseOffsetRef.current = 0;

    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      setIsGenerating(false);
      
      // Initialize Audio Context and decode data, but don't auto-start in this function anymore
      // We will call playAudio explicitly
      const result = await playAudioData(base64Audio, 24000); 
      // Note: playAudioData in utils/audioUtils auto-starts. 
      // We might need to stop it immediately if we want to handle start manually, 
      // OR we just embrace it starting at 0.
      // Let's assume it starts at 0.
      
      audioDataRef.current = result;
      setDuration(result.duration);
      startTimeRef.current = result.audioContext.currentTime;
      pauseOffsetRef.current = 0;
      
      // Apply settings
      result.source.playbackRate.value = speed;
      result.source.detune.value = pitch;
      
      setIsPlaying(true);
      
      // Draw initial
      setTimeout(() => drawWaveform(0), 0);

      // Log to history
      addToHistory('TTS', `Speech: ${selectedVoice}`, text);
      
    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setIsPlaying(false);
      setError(getFriendlyErrorMessage(err));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center md:text-left">
            <h1 className={`text-4xl font-bold ${textPrimary} mb-3 flex items-center justify-center md:justify-start gap-3 tracking-tight`}>
            <Podcast className={`w-8 h-8 text-${theme}-500`} />
            AI Speech Synthesis
            </h1>
            <p className={textSecondary}>Turn text into lifelike speech using <span className={`text-${theme}-500 font-mono text-sm font-medium`}>gemini-2.5-flash-preview-tts</span></p>
        </div>
        {text && (
             <button 
                onClick={handleClear}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${mode === 'dark' ? 'bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 border-slate-700 hover:border-red-800/50' : 'bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 hover:border-red-200 shadow-sm'}`}
            >
                <RefreshCw className="w-4 h-4" />
                <span>Clear</span>
            </button>
        )}
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-500 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
            <div className={`border rounded-[2rem] p-6 shadow-sm relative group transition-all duration-300 ${cardClass} ${mode === 'dark' ? 'border-white/10' : 'border-white/60'}`}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to convert to speech..."
                  className={`w-full h-64 rounded-2xl resize-none text-lg leading-relaxed border-none focus:outline-none focus:ring-0 ${mode === 'dark' ? 'bg-transparent text-slate-200 placeholder-slate-600' : 'bg-transparent text-slate-800 placeholder-slate-400'}`}
                />
                <div className={`absolute bottom-6 right-6 text-xs px-3 py-1.5 rounded-lg border font-mono ${mode === 'dark' ? 'text-slate-500 bg-slate-900/80 border-slate-800' : 'text-slate-400 bg-white/80 border-slate-200'}`}>
                    {text.length} chars
                </div>
            </div>
            
            {/* Waveform Visualizer & Advanced Controls */}
            <div className={`rounded-[2rem] p-6 relative overflow-hidden flex flex-col justify-center border space-y-4 ${mode === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
               <div className="w-full h-32 relative">
                  {!duration && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className={`text-sm ${textSecondary} opacity-50 font-medium`}>Waveform visualization</span>
                      </div>
                  )}
                  <canvas ref={canvasRef} className="w-full h-full block" width={600} height={128} />
               </div>
               
               {/* Controls */}
               <div className="flex flex-col gap-2">
                   <input 
                     type="range" 
                     min="0" 
                     max={duration || 100} 
                     step="0.1"
                     value={currentTime}
                     onChange={handleSeek}
                     disabled={!duration}
                     className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${mode === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                     style={{ accentColor: theme === 'emerald' ? '#10b981' : theme === 'blue' ? '#3b82f6' : theme === 'red' ? '#ef4444' : '#3b82f6' }}
                   />
                   
                   <div className="flex items-center justify-between">
                       <span className={`text-xs font-mono font-medium ${textSecondary}`}>{formatTime(currentTime)}</span>
                       
                       <div className="flex items-center gap-4">
                           <button onClick={() => handleSkip(-10)} disabled={!duration} className={`p-2 rounded-full hover:bg-slate-500/10 ${textSecondary} hover:${textPrimary}`}><Rewind className="w-5 h-5" /></button>
                           
                           {isPlaying ? (
                               <button onClick={togglePlayPause} className={`p-3 rounded-full bg-${theme}-500 text-white shadow-lg shadow-${theme}-500/30 hover:scale-105 transition-transform`}><PauseCircle className="w-8 h-8" /></button>
                           ) : (
                               <button onClick={togglePlayPause} disabled={!text && !duration} className={`p-3 rounded-full ${!text && !duration ? 'bg-slate-500/20 text-slate-500' : `bg-${theme}-500 text-white shadow-lg shadow-${theme}-500/30 hover:scale-105 transition-transform`}`}>
                                   {isGenerating ? <Loader2 className="w-8 h-8 animate-spin" /> : <PlayCircle className="w-8 h-8" />}
                               </button>
                           )}
                           
                           <button onClick={() => handleSkip(10)} disabled={!duration} className={`p-2 rounded-full hover:bg-slate-500/10 ${textSecondary} hover:${textPrimary}`}><FastForward className="w-5 h-5" /></button>
                       </div>
                       
                       <span className={`text-xs font-mono font-medium ${textSecondary}`}>{formatTime(duration)}</span>
                   </div>
               </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            {/* Voice Selector */}
            <div className={`border rounded-[2rem] p-6 shadow-sm ${cardClass}`}>
                <label className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${textSecondary} mb-4`}>
                    <Volume2 className={`w-4 h-4 text-${theme}-500`} />
                    Select Voice
                </label>
                <div className="space-y-2">
                    {VOICES.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border font-medium flex items-center justify-between ${
                                selectedVoice === v.id
                                ? (mode === 'dark' ? `bg-${theme}-500/10 text-${theme}-400 border-${theme}-500/30` : `bg-${theme}-50 text-${theme}-700 border-${theme}-200`)
                                : (mode === 'dark' ? 'bg-transparent text-slate-400 border-transparent hover:bg-white/5' : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50')
                            }`}
                        >
                            {v.label}
                            {selectedVoice === v.id && <div className={`w-2 h-2 rounded-full bg-${theme}-500 animate-pulse`}></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Audio Settings */}
            <div className={`border rounded-[2rem] p-6 shadow-sm space-y-8 ${cardClass}`}>
                <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${textSecondary}`}>
                    <Settings className={`w-4 h-4 text-${theme}-500`} />
                    Audio Settings
                </div>

                {/* Speed Slider */}
                <div>
                   <div className={`flex justify-between text-xs font-medium mb-3 ${textSecondary}`}>
                       <span>Speed</span>
                       <span className={`text-${theme}-500 font-mono bg-${theme}-500/10 px-2 py-0.5 rounded`}>{speed}x</span>
                   </div>
                   <input 
                     type="range" 
                     min="0.5" 
                     max="2" 
                     step="0.1" 
                     value={speed}
                     onChange={(e) => setSpeed(parseFloat(e.target.value))}
                     className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${mode === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                     style={{ accentColor: theme === 'emerald' ? '#10b981' : theme === 'blue' ? '#3b82f6' : theme === 'red' ? '#ef4444' : '#3b82f6' }}
                   />
                </div>

                {/* Pitch Slider */}
                <div>
                   <div className={`flex justify-between text-xs font-medium mb-3 ${textSecondary}`}>
                       <span>Pitch</span>
                       <span className={`text-${theme}-500 font-mono bg-${theme}-500/10 px-2 py-0.5 rounded`}>{pitch > 0 ? '+' : ''}{pitch}</span>
                   </div>
                   <input 
                     type="range" 
                     min="-1200" 
                     max="1200" 
                     step="100" 
                     value={pitch}
                     onChange={(e) => setPitch(parseInt(e.target.value))}
                     className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${mode === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                     style={{ accentColor: theme === 'emerald' ? '#10b981' : theme === 'blue' ? '#3b82f6' : theme === 'red' ? '#ef4444' : '#3b82f6' }}
                   />
                   <div className={`flex justify-between text-[10px] mt-2 opacity-50 ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                       <span>Deeper</span>
                       <span>Higher</span>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};