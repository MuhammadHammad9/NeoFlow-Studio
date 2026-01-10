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
  Calendar
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
    ? 'bg-slate-950/40 border border-white/10 backdrop-blur-xl' 
    : 'bg-white/80 border border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-xl';

  const StatCard = ({ icon: Icon, label, value, colorClass, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`group p-6 rounded-[2rem] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] ${cardClass} text-left w-full`}
    >
        <div>
            <p className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-1 font-heading`}>{label}</p>
            <p className={`text-4xl font-extrabold font-heading ${textPrimary}`}>{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:scale-110 duration-300 ${colorClass}`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
    </button>
  );

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Hero Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${mode === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={NotebookPen} 
            label="Smart Notes" 
            value={stats.notes} 
            colorClass={`bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30`}
            onClick={() => onNavigate(ActiveTab.NOTES)}
          />
          <StatCard 
            icon={MessageSquareText} 
            label="Chat Sessions" 
            value={stats.chats} 
            colorClass={`bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30`}
            onClick={() => onNavigate(ActiveTab.CHAT)}
          />
          <StatCard 
            icon={ImageIcon} 
            label="Images Analyzed" 
            value={stats.images} 
            colorClass={`bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30`}
            onClick={() => onNavigate(ActiveTab.IMAGES)}
          />
          <StatCard 
            icon={Podcast} 
            label="Audio Gen" 
            value={stats.tts} 
            colorClass={`bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30`}
            onClick={() => onNavigate(ActiveTab.TTS)}
          />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* History Timeline */}
         <div className={`xl:col-span-2 rounded-[2.5rem] p-8 md:p-10 ${cardClass} min-h-[500px] flex flex-col`}>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${mode === 'dark' ? `bg-${theme}-500/10` : `bg-${theme}-50`}`}>
                     <Activity className={`w-6 h-6 text-${theme}-500`} />
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

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${mode === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <Clock className={`w-8 h-8 ${textSecondary}`} />
                        </div>
                        <p className={`text-lg font-medium ${textPrimary}`}>No activity yet</p>
                        <p className={`text-sm ${textSecondary}`}>Start creating notes, chatting, or analyzing images.</p>
                    </div>
                ) : (
                    history.map((item) => {
                        let Icon = Activity;
                        let itemColor = `text-${theme}-500`;
                        let bgItemColor = mode === 'dark' ? `bg-${theme}-500/10` : `bg-${theme}-50`;
                        
                        switch(item.type) {
                            case 'NOTE': Icon = NotebookPen; itemColor = 'text-purple-500'; bgItemColor = mode === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'; break;
                            case 'CHAT': Icon = MessageSquareText; itemColor = 'text-emerald-500'; bgItemColor = mode === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50'; break;
                            case 'IMAGE': Icon = ImageIcon; itemColor = 'text-blue-500'; bgItemColor = mode === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'; break;
                            case 'TTS': Icon = Podcast; itemColor = 'text-orange-500'; bgItemColor = mode === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'; break;
                        }

                        return (
                            <div key={item.id} className={`group p-5 rounded-2xl border transition-all hover:scale-[1.01] ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${bgItemColor}`}>
                                        <Icon className={`w-5 h-5 ${itemColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold font-heading truncate ${textPrimary}`}>{item.title}</h3>
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
            <div className={`rounded-[2.5rem] p-8 ${cardClass} flex-1`}>
                <h2 className={`text-xl font-bold font-heading mb-6 ${textPrimary}`}>Quick Start</h2>
                <div className="space-y-3">
                    <button 
                        onClick={() => onNavigate(ActiveTab.NOTES)}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-purple-50 group'}`}
                    >
                        <div className={`p-2 rounded-xl bg-purple-100 text-purple-600`}>
                            <NotebookPen className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <span className={`block font-bold ${textPrimary}`}>Draft a Note</span>
                            <span className="text-xs opacity-60">Record & Analyze</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 opacity-50 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                    </button>

                    <button 
                        onClick={() => onNavigate(ActiveTab.IMAGES)}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50 group'}`}
                    >
                        <div className={`p-2 rounded-xl bg-blue-100 text-blue-600`}>
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <span className={`block font-bold ${textPrimary}`}>Analyze Image</span>
                            <span className="text-xs opacity-60">Visual Intelligence</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 opacity-50 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                    </button>

                    <button 
                        onClick={() => onNavigate(ActiveTab.CHAT)}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${mode === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 group'}`}
                    >
                        <div className={`p-2 rounded-xl bg-emerald-100 text-emerald-600`}>
                            <MessageSquareText className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <span className={`block font-bold ${textPrimary}`}>Ask Gemini</span>
                            <span className="text-xs opacity-60">Chat & Brainstorm</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 opacity-50 ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                    </button>
                </div>
            </div>

            <div className={`rounded-[2.5rem] p-8 relative overflow-hidden ${mode === 'dark' ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'} shadow-2xl`}>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold font-heading mb-2">Pro Tip</h3>
                    <p className="opacity-90 leading-relaxed text-sm mb-4">
                        Use "Deep Thinking" mode in Smart Notes for complex reasoning tasks. It allocates 32k tokens for the model to think before responding.
                    </p>
                    <button onClick={() => onNavigate(ActiveTab.NOTES)} className="text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                        Try it now
                    </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            </div>
         </div>
      </div>
    </div>
  );
};