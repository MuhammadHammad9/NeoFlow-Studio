import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, HistoryItem } from '../types';
import { LayoutDashboard, NotebookPen, MessageSquareText, Image as ImageIcon, Podcast, Sparkles, ChevronDown, LogOut, Settings, Sun, Moon, Search, X, Command } from 'lucide-react';
import { useTheme, ThemeColor } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getHistory } from '../services/historyService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const THEME_OPTIONS: { id: ThemeColor; label: string; colorClass: string }[] = [
  { id: 'emerald', label: 'Green', colorClass: 'bg-emerald-500' },
  { id: 'blue', label: 'Blue', colorClass: 'bg-blue-500' },
  { id: 'cyan', label: 'Cyan', colorClass: 'bg-cyan-500' },
  { id: 'red', label: 'Red', colorClass: 'bg-red-500' },
  { id: 'orange', label: 'Orange', colorClass: 'bg-orange-500' },
];

// Exact colors for dynamic background injection
const THEME_HEX: Record<ThemeColor, string> = {
  emerald: '#10b981',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  red: '#ef4444',
  orange: '#f97316',
};

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { theme, setTheme, mode, toggleMode } = useTheme();
  const { logout, user } = useAuth();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HistoryItem[]>([]);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: ActiveTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ActiveTab.NOTES, label: 'Smart Notes', icon: NotebookPen },
    { id: ActiveTab.CHAT, label: 'AI Chat', icon: MessageSquareText },
    { id: ActiveTab.IMAGES, label: 'Analyze Images', icon: ImageIcon },
    { id: ActiveTab.TTS, label: 'Generate Speech', icon: Podcast },
    { id: ActiveTab.SETTINGS, label: 'Settings', icon: Settings },
  ];

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
        if (e.ctrlKey && e.code === 'KeyN') {
            e.preventDefault();
            onTabChange(ActiveTab.NOTES);
        }
        if (e.ctrlKey && e.code === 'KeyS') {
            e.preventDefault();
            setShowSaveToast(true);
            setTimeout(() => setShowSaveToast(false), 2000);
        }
        if (e.code === 'Escape' && isSearchOpen) {
            setIsSearchOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, isSearchOpen]);

  // Search Logic
  useEffect(() => {
      if (searchQuery.trim()) {
          const allHistory = getHistory();
          const results = allHistory.filter(item => 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.preview.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(results);
      } else {
          setSearchResults([]);
      }
  }, [searchQuery]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const glassCardClass = mode === 'dark' 
    ? 'bg-slate-950/70 border-r border-white/5 backdrop-blur-2xl shadow-[5px_0_30px_rgba(0,0,0,0.3)]' 
    : 'bg-white/70 border-r border-slate-200/60 shadow-[5px_0_30px_rgba(0,0,0,0.03)] backdrop-blur-2xl';

  const textPrimary = mode === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  
  // Dynamic Background Style Generation
  const activeColor = THEME_HEX[theme];
  const backgroundStyle = {
      backgroundColor: mode === 'dark' ? '#020617' : '#f8fafc',
      backgroundImage: mode === 'dark' 
          ? `
              radial-gradient(circle at 50% -20%, ${activeColor}40, transparent 70%),
              radial-gradient(circle at 90% 90%, ${activeColor}15, transparent 50%)
            ` 
          : `
              radial-gradient(circle at 50% -10%, ${activeColor}20, transparent 60%),
              radial-gradient(circle at 10% 90%, ${activeColor}10, transparent 50%)
            `
  };

  return (
    <div 
      className="flex h-screen overflow-hidden transition-colors duration-700 ease-in-out font-sans relative"
      style={backgroundStyle}
    >
      
      {/* Save Toast */}
      {showSaveToast && (
          <div className={`fixed top-5 right-5 z-[100] animate-fade-in-up px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold border backdrop-blur-md bg-${theme}-500 text-white border-${theme}-400/50 shadow-${theme}-500/20`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
              Workspace Saved
          </div>
      )}

      {/* Global Search Modal */}
      {isSearchOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 animate-in fade-in duration-200">
              <div className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] transition-all duration-300 animate-scale-in ${mode === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}>
                  <div className="p-4 border-b border-slate-200/10 flex items-center gap-3">
                      <Search className={`w-5 h-5 ${textSecondary}`} />
                      <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search notes, chats, images..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`flex-1 bg-transparent border-none focus:ring-0 text-lg ${textPrimary} placeholder-slate-400`}
                        autoFocus
                      />
                      <button onClick={() => setIsSearchOpen(false)} className={`p-1 rounded-lg hover:bg-slate-500/10 ${textSecondary}`}>
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="overflow-y-auto p-2">
                      {searchQuery && searchResults.length === 0 && (
                          <div className={`text-center py-10 ${textSecondary}`}>No results found for "{searchQuery}"</div>
                      )}
                      {!searchQuery && (
                          <div className={`text-center py-10 ${textSecondary} flex flex-col items-center gap-2`}>
                              <Command className="w-8 h-8 opacity-20" />
                              <p>Type to search across your workspace history.</p>
                          </div>
                      )}
                      {searchResults.map((result, idx) => (
                          <button 
                             key={result.id} 
                             className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${mode === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                             style={{ animationDelay: `${idx * 0.05}s` }}
                             onClick={() => {
                                 if (result.type === 'NOTE') onTabChange(ActiveTab.NOTES);
                                 if (result.type === 'CHAT') onTabChange(ActiveTab.CHAT);
                                 if (result.type === 'IMAGE') onTabChange(ActiveTab.IMAGES);
                                 if (result.type === 'TTS') onTabChange(ActiveTab.TTS);
                                 setIsSearchOpen(false);
                             }}
                          >
                              <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${mode === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                                  {result.type === 'NOTE' && <NotebookPen className="w-4 h-4 text-purple-500" />}
                                  {result.type === 'CHAT' && <MessageSquareText className="w-4 h-4 text-emerald-500" />}
                                  {result.type === 'IMAGE' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                                  {result.type === 'TTS' && <Podcast className="w-4 h-4 text-orange-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className={`font-medium truncate ${textPrimary} group-hover:text-${theme}-500 transition-colors`}>{result.title}</div>
                                  <div className={`text-xs truncate ${textSecondary}`}>{result.preview}</div>
                              </div>
                              <span className={`text-[10px] ${textSecondary}`}>{new Date(result.timestamp).toLocaleDateString()}</span>
                          </button>
                      ))}
                  </div>
                  <div className={`p-2 border-t border-slate-200/10 text-xs flex justify-between px-4 ${textSecondary}`}>
                      <span><kbd className="font-sans border rounded px-1">Esc</kbd> to close</span>
                      <span>{searchResults.length} results</span>
                  </div>
              </div>
          </div>
      )}

      {/* Sidebar */}
      <aside className={`w-20 lg:w-72 flex-shrink-0 flex flex-col relative z-50 ${glassCardClass}`}>
        
        {/* Header / Logo Area */}
        <div 
          className={`h-24 flex items-center justify-center lg:justify-between lg:px-8 cursor-pointer relative z-20 group transition-all duration-300 select-none`}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          ref={pickerRef}
          title="Change Theme"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl bg-gradient-to-br from-${theme}-400 to-${theme}-600 shadow-lg shadow-${theme}-500/20 ring-1 ring-white/10 group-hover:shadow-${theme}-500/40 transition-shadow duration-300`}>
              <Sparkles className="w-6 h-6 text-white animate-pulse-slow" />
            </div>
            <span className={`hidden lg:block font-heading font-bold text-xl tracking-tight ${textPrimary}`}>NeoFlow</span>
          </div>
          <ChevronDown className={`hidden lg:block w-4 h-4 transition-transform duration-300 ${textSecondary} ${isPickerOpen ? 'rotate-180' : ''}`} />
          
          {/* Color Picker Popover */}
          {isPickerOpen && (
            <div className={`absolute top-20 left-4 right-4 lg:left-8 lg:right-8 mx-auto w-[220px] backdrop-blur-2xl border rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200 ${mode === 'dark' ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
              <div className={`text-[10px] font-bold ${textSecondary} mb-4 px-1 uppercase tracking-widest font-heading`}>Theme Color</div>
              <div className="grid grid-cols-5 gap-3 mb-5">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme(option.id);
                    }}
                    className={`w-8 h-8 rounded-full ${option.colorClass} hover:scale-110 transition-transform duration-200 focus:outline-none flex items-center justify-center shadow-lg ${theme === option.id ? `ring-2 ring-offset-2 ${mode === 'dark' ? 'ring-white ring-offset-slate-900' : 'ring-slate-900 ring-offset-white'}` : ''}`}
                    aria-label={`Select ${option.label} theme`}
                    title={option.label}
                  />
                ))}
              </div>
              <div className={`border-t ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'} pt-4`}>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMode();
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'}`}
                 >
                   {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                   <span>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                 </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Global Search Button Sidebar (Mobile/Desktop) */}
        <div className="px-3 lg:px-6 mb-2">
            <button 
                onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border group ${mode === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
                <Search className="w-5 h-5 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:block text-sm font-medium">Search...</span>
                <span className="hidden lg:block ml-auto text-[10px] font-mono border rounded px-1.5 py-0.5 opacity-60">Ctrl + Spc</span>
            </button>
        </div>

        <nav className="flex-1 py-4 space-y-2 px-3 lg:px-6 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Refined Active State for "Real" Feel
            let activeClass = '';
            let inactiveClass = '';
            
            if (mode === 'dark') {
               activeClass = `bg-white/5 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)] border border-${theme}-500/30`;
               inactiveClass = 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent';
            } else {
               activeClass = `bg-white text-slate-900 shadow-md border border-slate-100`;
               inactiveClass = 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent';
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start px-3 lg:px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive ? activeClass : inactiveClass}`}
              >
                <div className={`p-1.5 rounded-lg mr-3 transition-colors ${isActive ? `bg-${theme}-500 text-white` : 'bg-transparent text-current'}`}>
                    <Icon className={`w-5 h-5 relative z-10`} />
                </div>
                <span className={`hidden lg:block font-semibold text-sm relative z-10 font-heading tracking-wide`}>
                  {item.label}
                </span>
                
                {/* Active Indicator Line */}
                {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-${theme}-500 shadow-[0_0_10px_${activeColor}]`} />
                )}
              </button>
            );
          })}
        </nav>
        
        <div className={`p-6 mx-4 mb-4 rounded-3xl backdrop-blur-md ${mode === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
           <div className="flex items-center justify-center lg:justify-between">
              <div className="hidden lg:flex flex-col min-w-0">
                <span className={`text-sm font-bold ${textPrimary} truncate`}>{user?.name}</span>
                <span className={`text-xs ${textSecondary} truncate mt-0.5`}>{user?.email}</span>
              </div>
              <button 
                onClick={logout}
                className={`transition-all p-2 rounded-xl flex-shrink-0 ${mode === 'dark' ? 'text-slate-400 hover:bg-white/10 hover:text-red-400' : 'text-slate-400 hover:bg-slate-200 hover:text-red-500'}`}
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative scroll-smooth">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
};