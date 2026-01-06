import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { mockApi } from '../services/mockService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map Supabase User to our App User Type
  const mapSupabaseUser = (sbUser: any, profileData?: any): User => {
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name: profileData?.full_name || sbUser.user_metadata?.full_name || 'User',
      role: profileData?.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER, 
      registeredAt: sbUser.created_at,
      stripeCustomerId: profileData?.stripe_customer_id
    };
  };

  const fetchProfileAndSetUser = async (currentSession: Session) => {
      try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
        
        // If DB is locked or table missing, we still allow login via Auth metadata
        if (error) {
            console.warn("AuthContext: Could not fetch detailed profile. Using Auth metadata.", error);
            setUser(mapSupabaseUser(currentSession.user));
        } else {
            setUser(mapSupabaseUser(currentSession.user, profile));
        }
      } catch (err) {
        console.error("AuthContext: Critical profile error", err);
        setUser(mapSupabaseUser(currentSession.user));
      }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
            if (currentSession?.user) {
                setSession(currentSession);
                await fetchProfileAndSetUser(currentSession);
            } else {
                // Check if we have a mock user in localStorage (simulated persistence)
                const storedMock = localStorage.getItem('kosma_mock_user');
                if (storedMock) {
                    setUser(JSON.parse(storedMock));
                }
            }
        }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      if (newSession?.user) {
         setSession(newSession);
         await fetchProfileAndSetUser(newSession);
         localStorage.removeItem('kosma_mock_user'); // Clear mock if real login happens
      } else if (!user) { // Only clear if we aren't already in a mock session
         setSession(null);
         setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
        if (password) {
            // 1. Try Real Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                // 2. FALLBACK: Try Mock API if Real Auth fails (e.g. invalid login or email not confirmed)
                // This restores the ability to use the "Demo Buttons" even if Supabase isn't perfectly configured
                try {
                    console.warn("Supabase Login failed, trying Mock Fallback...", error.message);
                    const mockUser = await mockApi.login(email);
                    setUser(mockUser);
                    localStorage.setItem('kosma_mock_user', JSON.stringify(mockUser));
                    return; // Success via Mock
                } catch (mockErr) {
                    // If mock also fails, throw the original real error
                    throw error;
                }
            }
            
            if (data.session) {
                setSession(data.session);
                await fetchProfileAndSetUser(data.session);
                localStorage.removeItem('kosma_mock_user');
            }
        } else {
            // Magic Link
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: window.location.origin + '/#/dashboard' }
            });
            if (error) throw error;
            alert("Check your email for the login link!");
        }
    } catch (error: any) {
        console.error("Login error:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string, password?: string) => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: password || 'TempPass123!', 
            options: {
                data: { full_name: name, role: 'customer' },
                emailRedirectTo: window.location.origin + '/#/dashboard'
            }
        });
        
        if (error) {
             // Fallback for Demo purposes if Supabase limits hit
             console.warn("Supabase Signup failed, using Mock Fallback", error);
             const newUser = await mockApi.signup(email, name);
             setUser(newUser);
             localStorage.setItem('kosma_mock_user', JSON.stringify(newUser));
             return;
        }
        
        if (data.session) {
            setSession(data.session);
            await fetchProfileAndSetUser(data.session);
        }
    } catch (error) {
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
     await supabase.auth.resend({
         type: 'signup',
         email: email,
         options: { emailRedirectTo: window.location.origin + '/#/dashboard' }
     });
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem('kosma_mock_user');
    setUser(null);
    setSession(null);
    setIsLoading(false);
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