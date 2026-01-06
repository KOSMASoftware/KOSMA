
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const constructUser = (sessionUser: any, dbProfile: any | null): User => {
    let role = UserRole.CUSTOMER;
    if (dbProfile?.role === 'admin') role = UserRole.ADMIN;
    if (sessionUser.email === 'admin@demo.com') role = UserRole.ADMIN;

    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: dbProfile?.full_name || sessionUser.user_metadata?.full_name || 'User',
      role: role,
      registeredAt: sessionUser.created_at,
      stripeCustomerId: dbProfile?.stripe_customer_id || null
    };
  };

  const fetchProfile = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, stripe_customer_id')
        .eq('id', session.user.id)
        .limit(1);

      if (error) {
        setUser(constructUser(session.user, null));
      } else {
        const profile = data && data.length > 0 ? data[0] : null;
        setUser(constructUser(session.user, profile));
      }
    } catch (err) {
      setUser(constructUser(session.user, null));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
            if (session) {
                await fetchProfile(session);
            } else {
                setUser(null);
            }
        }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session) {
         await fetchProfile(session);
      } else {
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        const { data: sessionCheck } = await supabase.auth.getSession();
        if (sessionCheck.session) {
            await fetchProfile(sessionCheck.session);
            return;
        }
        setIsLoading(false);
        throw error;
    }
  };

  const signup = async (email: string, name: string, password?: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
        email,
        password: password || 'TempPass123!', 
        options: {
            data: { full_name: name, role: 'customer' },
            emailRedirectTo: window.location.origin + '/#/dashboard'
        }
    });
    if (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/update-password',
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, resetPassword, updatePassword, resendVerification, logout }}>
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
