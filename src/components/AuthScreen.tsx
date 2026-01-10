import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isLoginMode && !formData.fullname) {
      setError("Please enter your full name.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.fullname, formData.email, formData.password);
      }
    } catch (err: any) {
      console.error("Authentication failed", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    // Clear error when user types
    if (error) setError(null);
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginMode(!isLoginMode);
    // Reset form data slightly to avoid confusion, but keep email if typed
    setFormData(prev => ({ ...prev, fullname: '', password: '' }));
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 p-4 font-sans text-slate-900">
      <style>{`
        .font-geist { font-family: 'Inter', sans-serif !important; }
        .font-space-grotesk { font-family: 'Inter', sans-serif !important; }
        .animate-fade-up {
        animation: fadeUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
        }
        .animate-slide-right {
        animation: slideRight 0.8s ease-out forwards;
        opacity: 0;
        transform: translateX(-30px);
        }
        .animate-blur-in {
        animation: blurIn 1s ease-out forwards;
        filter: blur(10px);
        opacity: 0;
        }
        .animate-scale-up {
        animation: scaleUp 0.5s ease-out forwards;
        opacity: 0;
        transform: scale(0.95);
        }
        @keyframes fadeUp {
        to {
        opacity: 1;
        transform: translateY(0);
        }
        }
        @keyframes slideRight {
        to {
        opacity: 1;
        transform: translateX(0);
        }
        }
        @keyframes blurIn {
        to {
        filter: blur(0px);
        opacity: 1;
        }
        }
        @keyframes scaleUp {
        to {
        opacity: 1;
        transform: scale(1);
        }
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }
        .delay-1000 { animation-delay: 1s; }
        .delay-1100 { animation-delay: 1.1s; }
        .delay-1200 { animation-delay: 1.2s; }
        .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
      <div className="spline-container fixed top-0 left-0 w-full h-screen -z-10 hue-rotate-90 pointer-events-none">
        <iframe src="https://my.spline.design/twistcopy-CPActtgUfoQoOToZfH4Pt18Q" frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      
      <div className="w-full max-w-6xl overflow-hidden flex flex-col lg:flex-row animate-blur-in bg-white/80 border-white/20 border rounded-3xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        {/* Left / Form */}
        <div className="w-full lg:w-1/2 sm:p-8 md:p-12 lg:p-16 pt-6 pr-6 pb-6 pl-6">
          {/* Brand */}
          <div className="inline-flex items-center px-3 py-1 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium mb-12 font-geist animate-fade-up delay-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="7.5,4.21 12,6.81 16.5,4.21"></polyline>
              <polyline points="7.5,19.79 7.5,14.6 3,12"></polyline>
              <polyline points="21,12 16.5,14.6 16.5,19.79"></polyline>
            </svg>
            NeoFlow
          </div>

          {/* Header */}
          <h1 className="text-3xl lg:text-4xl text-slate-900 tracking-tight font-space-grotesk animate-fade-up delay-200">
            {isLoginMode ? 'Welcome back' : 'Create your workspace'}
          </h1>
          <p className="text-slate-600 mt-2 text-base font-geist animate-fade-up delay-300">
            {isLoginMode ? 'Enter your details to access your account' : 'Get started with your free account today'}
          </p>

          {/* Form */}
          <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div className="animate-slide-right delay-400">
                <label className="sr-only font-geist" htmlFor="fullname">Full name</label>
                <input 
                  id="fullname" 
                  type="text" 
                  placeholder="Full name" 
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full rounded-xl py-3 px-4 border border-slate-200 bg-white/50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200" 
                />
              </div>
            )}

            <div className={`animate-slide-right ${isLoginMode ? 'delay-400' : 'delay-500'}`}>
              <label className="sr-only font-geist" htmlFor="email">Email address</label>
              <input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl py-3 px-4 border border-slate-200 bg-white/50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200" 
              />
            </div>

            <div className={`relative animate-slide-right ${isLoginMode ? 'delay-500' : 'delay-600'}`}>
              <label className="sr-only font-geist" htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                placeholder={isLoginMode ? "Enter password" : "Create password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl py-3 px-4 pr-12 border border-slate-200 bg-white/50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200" 
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors" aria-label="Continue">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium animate-fade-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full hover:from-violet-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 animate-scale-up ${isLoginMode ? 'delay-600' : 'delay-700'} font-medium text-white font-geist bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl pt-3 pr-6 pb-3 pl-6 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]`}
            >
              {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Get Started')}
            </button>

            <div className={`grid grid-cols-3 gap-3 animate-fade-up ${isLoginMode ? 'delay-700' : 'delay-800'}`}>
              {/* Google */}
              <a href="/api/auth/google" className="flex items-center justify-center w-full gap-2 rounded-xl border border-slate-200 bg-white/50 py-3 hover:bg-white/70 hover:border-slate-300 transition-all duration-200 group" title="Sign in with Google">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="21.17" x2="12" y1="8" y2="8"></line>
                  <line x1="3.95" x2="8.54" y1="6.06" y2="14"></line>
                  <line x1="10.88" x2="15.46" y1="21.94" y2="14"></line>
                </svg>
              </a>

              {/* Instagram */}
              <a href="/api/auth/instagram" className="flex items-center justify-center w-full gap-2 rounded-xl border border-slate-200 bg-white/50 py-3 hover:bg-white/70 hover:border-slate-300 transition-all duration-200 group" title="Sign in with Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="/api/auth/twitter" className="flex items-center justify-center w-full gap-2 rounded-xl border border-slate-200 bg-white/50 py-3 hover:bg-white/70 hover:border-slate-300 transition-all duration-200 group" title="Sign in with X">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <path d="M4 4l11.733 16h4.429l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
            </div>
          </form>

          {/* Footer Links */}
          <div className={`mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500 space-y-3 sm:space-y-0 animate-fade-up ${isLoginMode ? 'delay-800' : 'delay-900'}`}>
            <span className="font-geist">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <a href="#" onClick={toggleMode} className="text-violet-600 hover:text-violet-700 font-medium font-geist">
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </a>
            </span>
            <a href="#" className="hover:text-slate-700 underline font-geist">Terms &amp; Privacy</a>
          </div>
        </div>

        {/* Right / Illustration */}
        <div className="w-full lg:w-1/2 relative min-h-[24rem] lg:min-h-[36rem] overflow-hidden animate-blur-in delay-200 bg-[url(https://cdn.midjourney.com/ddbd3d4d-dfb1-47cc-9964-ea9c84f0faa9/0_3.png?w=800&amp;q=80)] bg-cover">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          
          {/* Close Button */}
          <button className="absolute top-4 right-4 w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-white/20 transition-colors z-10 animate-scale-up delay-1000" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          {/* Analytics Card */}
          <div className="absolute top-6 left-6 glass-card max-w-xs z-10 animate-slide-right delay-600 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] text-white rounded-xl pt-3 pr-4 pb-3 pl-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <p className="font-medium font-geist">Analytics Review</p>
            </div>
            <p className="text-sm mt-1 text-white/80 font-geist">3:30pm–4:45pm</p>
          </div>

          {/* Dashboard Widget */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 glass-card z-10 animate-fade-up delay-800 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] text-white rounded-xl pt-4 pr-4 pb-4 pl-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium font-geist">Weekly Progress</span>
              <span className="text-sm text-white/70 font-geist">+12%</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              <div className="text-center">
                <span className="block text-xs text-white/70 font-geist">M</span>
                <div className="w-6 h-8 bg-white/30 rounded-sm mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <span className="block text-xs text-white/70 font-geist">T</span>
                <div className="w-6 h-10 bg-white/40 rounded-sm mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <span className="block text-xs text-white/70 font-geist">W</span>
                <div className="w-6 h-12 bg-white/50 rounded-sm mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <span className="block text-xs text-white/70 font-geist">T</span>
                <div className="w-6 h-9 bg-white/35 rounded-sm mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <span className="block text-xs text-white/70 font-geist">F</span>
                <div className="w-6 h-14 bg-white/60 rounded-sm mx-auto mt-1"></div>
              </div>
              <div className="text-center hidden sm:block">
                <span className="block text-xs text-white/70 font-geist">S</span>
                <div className="w-6 h-6 bg-white/25 rounded-sm mx-auto mt-1"></div>
              </div>
              <div className="text-center hidden sm:block">
                <span className="block text-xs text-white/70 font-geist">S</span>
                <div className="w-6 h-7 bg-white/30 rounded-sm mx-auto mt-1"></div>
              </div>
            </div>
          </div>

          {/* Team Collaboration Card */}
          <div className="absolute bottom-6 left-6 glass-card w-72 max-w-[calc(100%-3rem)] z-10 animate-slide-right delay-1000 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] rounded-xl pt-4 pr-4 pb-4 pl-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white font-geist">Team Standup</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-white/70 font-geist">Live</span>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-3 font-geist">9:00am–9:30am</p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 flex bg-gradient-to-br from-pink-400 to-purple-500 rounded-full items-center justify-center">
                  <span className="text-white text-xs font-medium font-geist">S</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium font-geist">M</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium font-geist">A</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium font-geist">J</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-medium font-geist">+3</span>
                </div>
              </div>
              <button type="button" className="text-white/70 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};