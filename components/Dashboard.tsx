import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { HistoryItem, ActiveTab } from '../types';
import { getHistory, getStats, clearHistoryLog } from '../services/historyService';
import { 
  LayoutDashboard, 
  Clock, 
  NotebookPen, 
  MessageSquareText, 
  Image as ImageIcon, 
  Podcast, 
  ArrowRight, 
  Trash2, 
  Activity,
  Calendar,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
    onNavigate: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    // Initial load
    setHistory(getHistory());
    setStats(getStats());

    // Listen for updates
    const handleUpdate = () => {
      setHistory(getHistory());
      setStats(getStats());
    };

    window.addEventListener('historyUpdated', handleUpdate);
    return () => window.removeEventListener('historyUpdated', handleUpdate);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  // Dynamic Styles
  const textPrimary = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardClass = mode === 'dark' 
    ? 'bg-slate-950/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
    : 'bg-white/80 border border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-xl';

  const StatCard = ({ icon: Icon, label, value, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`group p-6 rounded-[2rem] flex items-center justify-between transition-all duration-300 hover:-translate-y-1 ${cardClass} text-left w-full hover:shadow-2xl hover:border-${theme}-500/30 relative overflow-hidden`}
    >
        <div className="relative z-10">
            <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-2 font-heading`}>{label}</p>
            <p className={`text-4xl font-extrabold font-heading ${textPrimary} group-hover:scale-105 transition-transform origin-left`}>{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg bg-gradient-to-br from-${theme}-500 to-${theme}-600 shadow-${theme}-500/20 ring-1 ring-white/20`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        {/* Hover Glow */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${theme}-500/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none`}></div>
    </button>
  );

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
        <div>
           <div className="flex items-center gap-2 mb-2">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${mode === 'dark' ? `bg-${theme}-500/10 text-${theme}-400 border border-${theme}-500/20` : `bg-${theme}-50 text-${theme}-700 border border-${theme}-200`}`}>
                  Dashboard
               </span>
           </div>
           <h1 className={`text-5xl lg:text-6xl font-extrabold font-heading ${textPrimary} tracking-tight`}>
             Hello, {user?.name.split(' ')[0]}
           </h1>
           <p className={`mt-3 text-xl ${textSecondary} font-light`}>
             Here is an overview of your creative workspace and recent activity.
           </p>
        </div>
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${mode === 'dark' ? 'border-white/10 bg-white/5 text-slate-300 shadow-inner' : 'border-slate-200 bg-white text-slate-600 shadow-sm'}`}>
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatCard 
            icon={NotebookPen} 
            label="Smart Notes" 
            value={stats.notes} 
            onClick={() => onNavigate(ActiveTab.NOTES)}
          />
          <StatCard 
            icon={MessageSquareText} 
            label="Chat Sessions" 
            value={stats.chats} 
            onClick={() => onNavigate(ActiveTab.CHAT)}
          />
          <StatCard 
            icon={ImageIcon} 
            label="Images Analyzed" 
            value={stats.images} 
            onClick={() => onNavigate(ActiveTab.IMAGES)}
          />
          <StatCard 
            icon={Podcast} 
            label="Audio Gen" 
            value={stats.tts} 
            onClick={() => onNavigate(ActiveTab.TTS)}
          />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
         {/* History Timeline */}
         <div className={`xl:col-span-2 rounded-[2.5rem] p-8 md:p-10 ${cardClass} min-h-[500px] flex flex-col relative overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${mode === 'dark' ? `bg-${theme}-500/10 text-${theme}-500` : `bg-${theme}-50 text-${theme}-600`}`}>
                     <Activity className={`w-6 h-6`} />
                  </div>
                  <h2 className={`text-2xl font-bold font-heading ${textPrimary}`}>Recent Activity</h2>
               </div>
               {history.length > 0 && (
                   <button 
                     onClick={clearHistoryLog}
                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-white/5' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'}`}
                   >
                       <Trash2 className="w-4 h-4" />
                       <span className="hidden sm:inline">Clear History</span>
                   </button>
               )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 relative z-10">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${mode === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <Clock className={`w-8 h-8 ${textSecondary}`} />
                        </div>
                        <p className={`text-lg font-medium ${textPrimary}`}>No activity yet</p>
                        <p className={`text-sm ${textSecondary}`}>Start creating notes, chatting, or analyzing images.</p>
                    </div>
                ) : (
                    history.map((item, index) => {
                        let Icon = Activity;
                        
                        switch(item.type) {
                            case 'NOTE': Icon = NotebookPen; break;
                            case 'CHAT': Icon = MessageSquareText; break;
                            case 'IMAGE': Icon = ImageIcon; break;
                            case 'TTS': Icon = Podcast; break;
                        }

                        return (
                            <div 
                                key={item.id} 
                                className={`group p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] animate-fade-in-up ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md'}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl flex-shrink-0 transition-transform group-hover:scale-110 ${mode === 'dark' ? `bg-${theme}-500/10 text-${theme}-500` : `bg-${theme}-50 text-${theme}-600`}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold font-heading truncate ${textPrimary} group-hover:text-${theme}-500 transition-colors`}>{item.title}</h3>
                                            <span className={`text-xs font-mono opacity-60 flex-shrink-0 ml-2 ${textSecondary}`}>{formatDate(item.timestamp)}</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed line-clamp-2 ${textSecondary}`}>{item.preview}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
         </div>

         {/* Quick Actions / Highlights */}
         <div className="flex flex-col gap-6">
            <div className={`rounded-[2.5rem] p-8 ${cardClass} flex-1 flex flex-col justify-center`}>
                <h2 className={`text-xl font-bold font-heading mb-6 ${textPrimary}`}>Quick Start</h2>
                <div className="space-y-4">
                    <button 
                        onClick={() => onNavigate(ActiveTab.NOTES)}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : `bg-white border-slate-100 hover:border-${theme}-200 hover:bg-${theme}-50 group`}`}
                    >
                        <div className={`p-3 rounded-xl transition-transform group-hover:rotate-6 ${mode === 'dark' ? `bg-${theme}-500/20 text-${theme}-400` : `bg-${theme}-100 text-${theme}-600`}`}>
                            <NotebookPen className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <span className={`block font-bold ${textPrimary}`}>Draft a Note</span>
                            <span className="text-xs opacity-60">Record & Analyze</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                    </button>

                    <button 
                        onClick={() => onNavigate(ActiveTab.IMAGES)}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : `bg-white border-slate-100 hover:border-${theme}-200 hover:bg-${theme}-50 group`}`}
                    >
                        <div className={`p-3 rounded-xl transition-transform group-hover:rotate-6 ${mode === 'dark' ? `bg-${theme}-500/20 text-${theme}-400` : `bg-${theme}-100 text-${theme}-600`}`}>
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <span className={`block font-bold ${textPrimary}`}>Analyze Image</span>
                            <span className="text-xs opacity-60">Visual Intelligence</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                    </button>

                    <button 
                        onClick={() => onNavigate(ActiveTab.CHAT)}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : `bg-white border-slate-100 hover:border-${theme}-200 hover:bg-${theme}-50 group`}`}
                    >
                        <div className={`p-3 rounded-xl transition-transform group-hover:rotate-6 ${mode === 'dark' ? `bg-${theme}-500/20 text-${theme}-400` : `bg-${theme}-100 text-${theme}-600`}`}>
                            <MessageSquareText className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <span className={`block font-bold ${textPrimary}`}>Ask Gemini</span>
                            <span className="text-xs opacity-60">Chat & Brainstorm</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                    </button>
                </div>
            </div>

            <div className={`rounded-[2.5rem] p-8 relative overflow-hidden bg-gradient-to-br from-${theme}-600 to-${theme}-900 shadow-2xl text-white group shadow-${theme}-500/20`}>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold font-heading mb-2 flex items-center gap-2">
                        Pro Tip <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </h3>
                    <p className="opacity-90 leading-relaxed text-sm mb-4 font-medium">
                        Use "Deep Thinking" mode in Smart Notes for complex reasoning tasks. It allocates 32k tokens for the model to think before responding.
                    </p>
                    <button 
                        onClick={() => onNavigate(ActiveTab.NOTES)} 
                        className="text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors border border-white/10 shadow-lg"
                    >
                        Try it now
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/10 blur-2xl animate-pulse-slow"></div>
            </div>
         </div>
      </div>
    </div>
  );
};