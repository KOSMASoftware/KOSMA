
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
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isRecoveryFlow = () => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  const hash = window.location.hash || '';
  const onUpdatePasswordPath = p === '/update-password' || p.endsWith('/update-password');
  const hashRoute = hash.split('?')[0]; 
  const isSafeHash = hashRoute === '' || hashRoute === '#' || hashRoute === '#/' || hashRoute.startsWith('#/update-password') || !hashRoute.startsWith('#/');          
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

  const fetchProfile = async (session: Session, retryCount = 0) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, stripe_customer_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!data && !error) {
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({ 
                id: session.user.id, 
                email: session.user.email,
                role: 'customer',
                full_name: session.user.user_metadata?.full_name || 'User'
            }, { onConflict: 'id' });

          if (!upsertError) {
             data = { id: session.user.id, full_name: session.user.user_metadata?.full_name, role: 'customer', stripe_customer_id: null };
          }
      }

      if (error && retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 500)); 
          return fetchProfile(session, retryCount + 1);
      }

      const newUser = constructUser(session.user, data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      console.error("Critical Auth Error:", err);
      const fallbackUser = constructUser(session.user, null);
      setUser(fallbackUser);
      userIdRef.current = fallbackUser.id;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchProfile(session);
  };

  useEffect(() => {
    const initSession = async () => {
      if (isRecoveryFlow()) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await fetchProfile(session);
        else setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
      if (session) {
        if (userIdRef.current !== session.user.id || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (!isRecoveryFlow()) await fetchProfile(session);
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
    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    if (error) throw error;

    // 2. CRITICAL: Call Edge Function to update DB timestamps (first_login_at / last_login_at)
    if (data.user) {
        try {
            await supabase.functions.invoke('mark-login', {
                body: { user_id: data.user.id }
            });
        } catch (funcError) {
            console.error("Failed to track login timestamp:", funcError);
            // We do not throw here, so the user can still login even if analytics fail
        }
    }
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
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    userIdRef.current = null;
    setIsRecovering(false);
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
