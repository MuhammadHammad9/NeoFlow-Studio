import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemeColor } from '../contexts/ThemeContext';
import { User, Mail, LogOut, Moon, Sun, Shield, Sparkles, Check, Smartphone, Save } from 'lucide-react';

const THEME_OPTIONS: { id: ThemeColor; label: string; colorClass: string }[] = [
  { id: 'emerald', label: 'Emerald', colorClass: 'bg-emerald-500' },
  { id: 'blue', label: 'Royal', colorClass: 'bg-blue-500' },
  { id: 'cyan', label: 'Cyan', colorClass: 'bg-cyan-500' },
  { id: 'red', label: 'Ruby', colorClass: 'bg-red-500' },
  { id: 'orange', label: 'Sunset', colorClass: 'bg-orange-500' },
];

export const SettingsView: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme, mode, toggleMode } = useTheme();
  
  const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleSaveProfile = async () => {
      setIsSaving(true);
      setSaveMessage(null);
      await updateProfile(formData.name, formData.email);
      setIsSaving(false);
      setSaveMessage("Profile updated successfully.");
      setTimeout(() => setSaveMessage(null), 3000);
  };

  const cardClass = mode === 'dark' 
    ? 'bg-slate-950/40 border border-white/10 backdrop-blur-xl' 
    : 'bg-white/80 border border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-xl';

  const textPrimary = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <header className="mb-10">
        <h1 className={`text-5xl font-extrabold font-heading ${textPrimary} mb-4 tracking-tight`}>Settings & Profile</h1>
        <p className={`${textSecondary} text-xl font-light`}>Manage your personal information and workspace preferences.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <section className={`rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden ${cardClass}`}>
          <div className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-${theme}-500/20 to-transparent`}></div>
          
          <div className="relative flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-shrink-0">
              <div className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br from-${theme}-500 to-${theme}-700 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-${theme}-500/30 border-4 ${mode === 'dark' ? 'border-slate-950' : 'border-white'}`}>
                {user?.name ? getInitials(user.name) : <User />}
              </div>
            </div>
            
            <div className="flex-1 space-y-8 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className={`text-3xl font-bold font-heading ${textPrimary}`}>{user?.name}</h2>
                   <p className={`${textSecondary} text-lg`}>Workspace Admin</p>
                </div>
                <div className={`self-start sm:self-center px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border shadow-lg ${mode === 'dark' ? `bg-${theme}-500/10 border-${theme}-500/20 text-${theme}-400` : `bg-${theme}-50 border-${theme}-200 text-${theme}-700`}`}>
                   <Shield className="w-4 h-4" />
                   <span>Pro Plan</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className={`text-xs font-bold uppercase tracking-widest ${textSecondary} font-heading`}>Full Name</label>
                   <div className={`flex items-center gap-4 border rounded-2xl px-5 py-2 ${mode === 'dark' ? 'bg-black/20 border-white/5 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                     <User className={`w-5 h-5 ${textSecondary}`} />
                     <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-transparent border-none focus:ring-0 w-full font-medium text-lg px-0"
                     />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className={`text-xs font-bold uppercase tracking-widest ${textSecondary} font-heading`}>Email Address</label>
                   <div className={`flex items-center gap-4 border rounded-2xl px-5 py-2 ${mode === 'dark' ? 'bg-black/20 border-white/5 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                     <Mail className={`w-5 h-5 ${textSecondary}`} />
                     <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-transparent border-none focus:ring-0 w-full font-medium text-lg px-0"
                     />
                   </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${isSaving ? 'bg-slate-500' : `bg-${theme}-500 shadow-lg shadow-${theme}-500/20`}`}
                  >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saveMessage && <span className="text-emerald-500 font-medium animate-fade-in-up">{saveMessage}</span>}
              </div>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className={`rounded-[2.5rem] p-8 md:p-12 ${cardClass}`}>
          <div className="flex items-center gap-5 mb-10">
            <div className={`p-4 rounded-2xl ${mode === 'dark' ? `bg-${theme}-500/10` : `bg-${theme}-50`}`}>
              <Sparkles className={`w-8 h-8 text-${theme}-500`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold font-heading ${textPrimary}`}>Appearance</h2>
              <p className={`text-base ${textSecondary}`}>Customize the look and feel of your workspace.</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* Mode Toggle */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button 
                  onClick={() => mode !== 'light' && toggleMode()}
                  className={`relative p-5 rounded-3xl border flex items-center gap-5 transition-all duration-300 ${mode === 'light' ? `bg-white border-${theme}-500 ring-2 ring-${theme}-500 shadow-xl` : 'bg-transparent border-slate-700 hover:border-slate-500 text-slate-400 hover:bg-white/5'}`}
                >
                   <div className={`p-4 rounded-2xl ${mode === 'light' ? 'bg-orange-100 text-orange-600' : 'bg-slate-800'}`}>
                      <Sun className="w-6 h-6" />
                   </div>
                   <div className="text-left">
                     <div className={`text-lg font-bold font-heading ${mode === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>Light Mode</div>
                     <div className="text-sm opacity-70">Clean & crisp</div>
                   </div>
                   {mode === 'light' && <div className={`absolute top-5 right-5 w-3 h-3 rounded-full bg-${theme}-500 shadow-[0_0_10px_var(--${theme}-500)]`}></div>}
                </button>

                <button 
                  onClick={() => mode !== 'dark' && toggleMode()}
                  className={`relative p-5 rounded-3xl border flex items-center gap-5 transition-all duration-300 ${mode === 'dark' ? `bg-slate-900 border-${theme}-500 ring-2 ring-${theme}-500 shadow-xl` : 'bg-transparent border-slate-200 hover:border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                >
                   <div className={`p-4 rounded-2xl ${mode === 'dark' ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-100'}`}>
                      <Moon className="w-6 h-6" />
                   </div>
                   <div className="text-left">
                     <div className={`text-lg font-bold font-heading ${mode === 'dark' ? 'text-white' : 'text-slate-700'}`}>Dark Mode</div>
                     <div className="text-sm opacity-70">Deep & immersive</div>
                   </div>
                   {mode === 'dark' && <div className={`absolute top-5 right-5 w-3 h-3 rounded-full bg-${theme}-500 shadow-[0_0_10px_var(--${theme}-500)]`}></div>}
                </button>
             </div>

             <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent"></div>

             {/* Accent Color */}
             <div>
                <label className={`block text-xs font-bold uppercase tracking-widest ${textSecondary} mb-6 font-heading`}>Accent Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`relative group flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all duration-300 ${
                        theme === option.id 
                          ? (mode === 'dark' ? `bg-${theme}-900/20 border-${theme}-500/50` : `bg-${theme}-50 border-${theme}-500/50`)
                          : (mode === 'dark' ? 'bg-transparent border-white/5 hover:border-white/20 hover:bg-white/5' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full ${option.colorClass} shadow-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                        {theme === option.id && <Check className="w-6 h-6 text-white" />}
                      </div>
                      <span className={`font-semibold text-sm ${theme === option.id ? (mode === 'dark' ? 'text-white' : 'text-slate-900') : textSecondary}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* System Info & Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`rounded-[2.5rem] p-10 flex flex-col justify-between ${cardClass}`}>
             <div>
               <div className="flex items-center gap-4 mb-8">
                 <Smartphone className={`w-6 h-6 ${textSecondary}`} />
                 <h3 className={`text-xl font-bold font-heading ${textPrimary}`}>System Information</h3>
               </div>
               <div className="space-y-5 text-sm font-medium">
                 <div className="flex justify-between border-b border-dashed border-slate-500/20 pb-3">
                   <span className={textSecondary}>Version</span>
                   <span className={`${textPrimary} font-mono bg-white/10 px-2 py-1 rounded`}>3.3.0 (Premium)</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed border-slate-500/20 pb-3">
                   <span className={textSecondary}>Gemini Model</span>
                   <span className={`${textPrimary} font-mono bg-white/10 px-2 py-1 rounded`}>gemini-3-pro</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={textSecondary}>Build ID</span>
                   <span className={`${textPrimary} font-mono bg-white/10 px-2 py-1 rounded`}>ax-994-rc</span>
                 </div>
               </div>
             </div>
          </div>

          <div className={`rounded-[2.5rem] p-10 flex flex-col justify-between ${cardClass}`}>
             <div className="mb-8">
               <h3 className={`text-xl font-bold font-heading ${textPrimary} mb-2`}>Session Management</h3>
               <p className={`text-base ${textSecondary}`}>Securely sign out of your current session. All local data will be preserved.</p>
             </div>
             <button 
                onClick={logout}
                className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] text-lg ${mode === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'}`}
             >
                <LogOut className="w-6 h-6" />
                <span>Sign Out</span>
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};