import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  avatar?: string; // Base64 string for profile picture
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, avatar?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('neoflow_session');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem('neoflow_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const storedUsers = localStorage.getItem('neoflow_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        
        // Find user
        const foundUser = users.find((u: any) => u.email === email);
        
        if (!foundUser) {
          reject(new Error("No account found with this email."));
          return;
        }

        // Validate password
        if (foundUser.password !== password) {
          reject(new Error("Invalid password."));
          return;
        }

        // Success
        const sessionUser = { 
          name: foundUser.name, 
          email: foundUser.email, 
          avatar: foundUser.avatar 
        };
        localStorage.setItem('neoflow_session', JSON.stringify(sessionUser));
        setUser(sessionUser);
        setIsAuthenticated(true);
        resolve();
      }, 800); // Simulate network delay
    });
  };

  const register = async (name: string, email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const storedUsers = localStorage.getItem('neoflow_users');
        let users = storedUsers ? JSON.parse(storedUsers) : [];

        // Check if user already exists
        if (users.find((u: any) => u.email === email)) {
          reject(new Error("Account with this email already exists."));
          return;
        }

        const newUser = { name, email, password }; 
        users.push(newUser);
        localStorage.setItem('neoflow_users', JSON.stringify(users));

        // Auto-login after register
        const sessionUser = { name, email };
        localStorage.setItem('neoflow_session', JSON.stringify(sessionUser));
        setUser(sessionUser);
        setIsAuthenticated(true);
        resolve();
      }, 800);
    });
  };

  const updateProfile = async (name: string, email: string, avatar?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...user, name, email, avatar };
        setUser(updatedUser);
        localStorage.setItem('neoflow_session', JSON.stringify(updatedUser));
        
        // Also update the user in the 'neoflow_users' array (mock DB)
        const storedUsers = localStorage.getItem('neoflow_users');
        if (storedUsers && user) {
            let users = JSON.parse(storedUsers);
            const userIndex = users.findIndex((u: any) => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], name, email, avatar };
                localStorage.setItem('neoflow_users', JSON.stringify(users));
            }
        }
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('neoflow_session');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>
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