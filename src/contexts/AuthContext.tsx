import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set default auth header for axios
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            try {
                const res = await axios.get('/api/auth/me');
                setUser(res.data.user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Session expired or invalid", error);
                localStorage.removeItem('token');
                setAuthToken(null);
            }
        }
        setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
      try {
          const res = await axios.post('/api/auth/login', { email, password });
          const { token, user } = res.data;

          localStorage.setItem('token', token);
          setAuthToken(token);
          setUser(user);
          setIsAuthenticated(true);
      } catch (error: any) {
          throw new Error(error.response?.data?.message || "Login failed");
      }
  };

  const register = async (name: string, email: string, password: string) => {
      try {
          const res = await axios.post('/api/auth/register', { name, email, password });
          const { token, user } = res.data;

          localStorage.setItem('token', token);
          setAuthToken(token);
          setUser(user);
          setIsAuthenticated(true);
      } catch (error: any) {
          throw new Error(error.response?.data?.message || "Registration failed");
      }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
