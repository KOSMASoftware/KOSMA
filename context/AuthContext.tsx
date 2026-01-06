import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockApi } from '../services/mockService';
import { emailService } from '../services/emailService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await mockApi.login(email);
      setUser(loggedUser);
      localStorage.setItem('mock_user', JSON.stringify(loggedUser));
    } catch (error) {
      alert("User not found. Try 'customer@demo.com' or 'admin@demo.com'");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string) => {
    setIsLoading(true);
    try {
      // 1. Create User in "DB"
      const newUser = await mockApi.signup(email, name);
      
      // 2. Send Real Email via Elastic Email
      // Note: We don't await this to block the UI, but in a real app we might handle errors here
      emailService.sendVerificationEmail(email, name).then(response => {
        if (!response.success && response.error) {
            console.warn("Failed to send email (Check API Key):", response.error);
        }
      });

      setUser(newUser);
      localStorage.setItem('mock_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    // Helper to manually trigger email sending from UI
    await emailService.sendVerificationEmail(email, "Customer");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};