
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole, PlanTier, SubscriptionStatus } from '../types';
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

// Helper: Route-basierte Erkennung für Recovery Flow
const isRecoveryFlow = () => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  const hash = window.location.hash || '';
  
  const onUpdatePasswordPath = p === '/update-password' || p.endsWith('/update-password');
  
  // Hash-Check um Deadlocks zu vermeiden
  const hashRoute = hash.split('?')[0]; 
  const isSafeHash = 
    hashRoute === '' || 
    hashRoute === '#' || 
    hashRoute === '#/' ||                 
    hashRoute.startsWith('#/update-password') || 
    !hashRoute.startsWith('#/');          

  return onUpdatePasswordPath && isSafeHash;
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
      stripeCustomerId: dbProfile?.stripe_customer_id || undefined
    };
  };

  // FETCH PROFILE mit Retry-Logik (falls der DB Trigger eine Sekunde braucht)
  const fetchProfile = async (session: Session, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, stripe_customer_id')
        .eq('id', session.user.id)
        .single();

      // Wenn kein Profil da ist (Trigger Delay), versuchen wir es kurz noch einmal
      if ((error || !data) && retryCount < 3) {
          console.log(`Auth: Profile missing (Trigger latency?). Retry ${retryCount + 1}/3...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms warten
          return fetchProfile(session, retryCount + 1);
      }

      const newUser = constructUser(session.user, error ? null : data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      // Fallback nur, wenn DB komplett streikt, User Session ist aber da
      const fallbackUser = constructUser(session.user, null);
      setUser(fallbackUser);
      userIdRef.current = fallbackUser.id;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      // REGEL 4.1: Kein getSession im Recovery Flow
      if (isRecoveryFlow()) {
        console.log("Auth: Recovery Flow detected - skipping session fetch.");
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
      
      if (session) {
        if (userIdRef.current !== session.user.id || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
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
    // REGEL 4.2: Login Flow
    // 1. Auth mit Passwort
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    if (error) throw error;
    // 2. onAuthStateChange übernimmt das Laden des Profils und der Lizenzen
  };

  const signup = async (email: string, name: string, password: string) => {
    // REGEL 2.1: Signup Process (Trigger based)
    // Wir erstellen nur den User. Der Postgres-Trigger übernimmt Profil- und Lizenzerstellung automatisch.
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
