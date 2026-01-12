
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecovering: boolean;
  login: (email: string, password: string) => Promise<{ data: any, error: any }>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAIL = 'mail@joachimknaf.de';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const initTimedOutRef = useRef(false);

  const clearLocalSession = () => {
    try {
      localStorage.removeItem('kosma-auth-token');
    } catch (e) {
      console.error("Could not clear local session", e);
    }
  };

  const constructUser = (sessionUser: any, dbProfile: any | null): User => {
    const email = sessionUser.email?.toLowerCase().trim() || '';
    const isOwner = email === OWNER_EMAIL;
    const isAdmin = isOwner || dbProfile?.role === 'admin';
    
    return {
      id: sessionUser.id,
      email: email,
      name: dbProfile?.full_name || sessionUser.user_metadata?.full_name || (isOwner ? 'Joachim Knaf' : 'User'),
      role: isAdmin ? UserRole.ADMIN : UserRole.CUSTOMER,
      registeredAt: sessionUser.created_at || new Date().toISOString(),
      stripeCustomerId: dbProfile?.stripe_customer_id || undefined,
      firstLoginAt: dbProfile?.first_login_at,
      lastLoginAt: dbProfile?.last_login_at
    };
  };

  const fetchProfile = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const newUser = constructUser(session.user, data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      setUser(constructUser(session.user, null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const timer = setTimeout(() => {
        if (mounted) {
          console.warn("[Auth] Init timeout - forcing logout state");
          initTimedOutRef.current = true;
          clearLocalSession();
          setIsLoading(false);
        }
      }, 4000);

      try {
        const { data, error } = await supabase.auth.getSession();
        clearTimeout(timer);

        if (initTimedOutRef.current) return;

        if (error) throw error;

        if (mounted) {
          if (data?.session) {
            await fetchProfile(data.session);
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        clearTimeout(timer);
        if (initTimedOutRef.current) return;

        console.warn("[Auth] Init Error:", err);
        if (mounted) {
          clearLocalSession();
          setIsLoading(false);
        }
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (initTimedOutRef.current) return;

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session) await fetchProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        userIdRef.current = null;
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password: password.trim() 
    });
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
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      clearLocalSession();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
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
