
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

// FIX: Route-basierte Erkennung (Stateless & Robust)
// Wir prüfen NUR, ob wir auf der 'update-password' Route sind.
// Wir verlassen uns NICHT auf Tokens (access_token), da Supabase diese oft bereinigt.
const isRecoveryFlow = () => {
  if (typeof window === 'undefined') return false;

  const p = window.location.pathname;
  const hash = window.location.hash || '';

  // 1. Sind wir auf dem Pfad /update-password?
  const onUpdatePasswordPath = p === '/update-password' || p.endsWith('/update-password');

  // 2. Hash-Check:
  const hashRoute = hash.split('?')[0]; 
  
  const isSafeHash = 
    hashRoute === '' || 
    hashRoute === '#' || 
    hashRoute === '#/' ||                 // FIX: Verhindert Deadlock bei leerem Hash-Router Root
    hashRoute.startsWith('#/update-password') || // Explizit auch die Router-interne URL erlauben
    !hashRoute.startsWith('#/');          // !startsWith('#/') fängt access_token=... ab

  return onUpdatePasswordPath && isSafeHash;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI-Status: Zeigt an, ob wir visuell im Recovery Mode sind
  const [isRecovering, setIsRecovering] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isRecoveryFlow();
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
      // WICHTIG: Auf der Recovery-Seite NIEMALS getSession() aufrufen.
      // Das führt zu einem Deadlock, da Supabase auf Token-Austausch wartet.
      if (isRecoveryFlow()) {
        console.log("Auth: Recovery Flow detected (Route based) - skipping session fetch.");
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
          // Auch hier: Wenn wir noch auf der Recovery Seite sind, keine Profile laden.
          if (!isRecoveryFlow()) {
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
    // "Dummes" Update: Wir verlassen uns darauf, dass Supabase die Tokens 
    // aus der URL (intern) nutzt. Kein getSession check vorher nötig.
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
