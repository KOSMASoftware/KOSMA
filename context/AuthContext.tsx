
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecovering: boolean;
  login: (email: string, password: string) => Promise<{ user: any, error: any }>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isRecoveryFlow = () => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  return p.includes('/update-password');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(() => isRecoveryFlow());
  const userIdRef = useRef<string | null>(null);

  const constructUser = (sessionUser: any, dbProfile: any | null): User => {
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: dbProfile?.full_name || sessionUser.user_metadata?.full_name || 'User',
      role: dbProfile?.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
      registeredAt: sessionUser.created_at || new Date().toISOString(),
      stripeCustomerId: dbProfile?.stripe_customer_id || undefined,
      firstLoginAt: dbProfile?.first_login_at,
      lastLoginAt: dbProfile?.last_login_at
    };
  };

  const fetchProfile = async (session: Session, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(session, retryCount + 1);
      }

      const newUser = constructUser(session.user, data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      console.error("Profile Fetch Failed:", err);
      setUser(constructUser(session.user, null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchProfile(session);
      else setIsLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password: password.trim() 
    });

    if (!error && data.user) {
      // Background task, don't await to prevent UI block
      supabase.functions.invoke('mark-login', { body: { user_id: data.user.id } })
        .catch(e => console.warn("Login tracking failed", e));
    }

    return { user: data.user, error };
  };

  const signup = async (email: string, name: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    userIdRef.current = null;
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchProfile(session);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isRecovering, login, signup, resetPassword, updatePassword, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
