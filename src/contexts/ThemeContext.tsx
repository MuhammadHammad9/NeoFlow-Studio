import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'emerald' | 'blue' | 'cyan' | 'red' | 'orange';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeColor;
  mode: ThemeMode;
  setTheme: (theme: ThemeColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeColor>('blue');
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('site_theme') as ThemeColor;
    const savedMode = localStorage.getItem('site_mode') as ThemeMode;
    
    if (savedTheme && ['emerald', 'blue', 'cyan', 'red', 'orange'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      setModeState(savedMode);
    } else {
        // Default to dark preference if not set
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setModeState('light');
        }
    }
  }, []);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem('site_theme', newTheme);
  };

  const toggleMode = () => {
    setModeState(prev => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('site_mode', newMode);
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};