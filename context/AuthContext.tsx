
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecovering: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIX 1: Schutzklausel für Recovery-Seite
// Auf /update-password darf getSession() NICHT aufgerufen werden, da es im Recovery-Flow blockiert/timeoutet.
const isRecoveryPage = typeof window !== 'undefined' && (
  window.location.pathname === '/update-password' || 
  window.location.pathname.endsWith('/update-password')
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Einfache Erkennung des Recovery-Modus anhand der URL-Parameter/Hash
  const [isRecovering, setIsRecovering] = useState(() => {
    if (typeof window === 'undefined') return false;
    const h = window.location.hash;
    const s = window.location.search;
    return h.includes('type=recovery') || s.includes('type=recovery');
  });
  
  const userIdRef = useRef<string | null>(null);

  const constructUser = (sessionUser: any, dbProfile: any | null): User => {
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: dbProfile?.full_name || sessionUser.user_metadata?.full_name || 'User',
      role: dbProfile?.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
      registeredAt: sessionUser.created_at || new Date().toISOString(),
      stripeCustomerId: dbProfile?.stripe_customer_id || undefined
    };
  };

  const fetchProfile = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, stripe_customer_id')
        .eq('id', session.user.id)
        .single();

      const newUser = constructUser(session.user, error ? null : data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      const fallbackUser = constructUser(session.user, null);
      setUser(fallbackUser);
      userIdRef.current = fallbackUser.id;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Session Load
    const initSession = async () => {
      // FIX 2: getSession komplett überspringen auf der Recovery-Seite
      if (isRecoveryPage) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchProfile(session);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth: Init Error", error);
        setIsLoading(false);
      }
    };

    initSession();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
      
      if (session) {
        if (userIdRef.current !== session.user.id || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Auf der Recovery Page vermeiden wir auch hier komplexe Logik wenn möglich, 
          // aber das Event System von Supabase ist getrennt von getSession() calls.
          if (!isRecoveryPage) {
             await fetchProfile(session);
          }
        }
      } else {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          userIdRef.current = null;
          setIsRecovering(false);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    if (error) throw error;
  };

  const signup = async (email: string, name: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: name },
        emailRedirectTo: window.location.origin + '/#/dashboard'
      }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/update-password',
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    // FIX 3: updatePassword ist jetzt "dumm" und statusfrei.
    // Kein getSession() Check (da wir uns auf den internen Supabase Client State verlassen).
    // Kein manuelles setIsRecovering(false).
    
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const resendVerification = async (email: string) => {
    await supabase.auth.resend({ type: 'signup', email });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    userIdRef.current = null;
    setIsRecovering(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isRecovering, login, signup, resetPassword, updatePassword, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
