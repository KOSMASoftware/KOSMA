
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Guard against double exchange in React StrictMode
  const exchangedRef = useRef(false);

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

      if (!error && data) {
        setUser(constructUser(session.user, data));
      } else {
        setUser(constructUser(session.user, null));
      }
    } catch (err) {
      setUser(constructUser(session.user, null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        // Robust extraction of params from both search query and hash (for HashRouter)
        const getParamsFromUrl = () => {
          const search = new URLSearchParams(window.location.search);
          const hashQuery = window.location.hash.split("?")[1] ?? "";
          const hashParams = new URLSearchParams(hashQuery);

          const code = search.get("code") ?? hashParams.get("code");
          const type = search.get("type") ?? hashParams.get("type");
          const hasAccessToken = window.location.hash.includes("access_token=");

          return { code, type, hasAccessToken };
        };

        const { code, type, hasAccessToken } = getParamsFromUrl();
        
        // 1. Set recovery mode ONLY if type is recovery or it's an implicit flow token
        // This prevents signup confirmations from triggering the recovery UI
        const isRecovery = type === "recovery" || hasAccessToken;
        if (isRecovery) {
          setIsRecovering(true);
        }

        // 2. Perform PKCE Code Exchange with Guard
        if (code && !exchangedRef.current) {
          exchangedRef.current = true;
          console.log("PKCE Code detected, exchanging for session...");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Code exchange failed:", exchangeError.message);
          } else {
            console.log("Code exchange successful!");
            // Clean URL: Remove 'code' and other params but keep the hash for routing
            const cleanUrl = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
            window.history.replaceState({}, '', cleanUrl);
          }
        }

        // 3. Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchProfile(session);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
      
      if (session) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') {
          await fetchProfile(session);
        }
      } else {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsRecovering(false);
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      redirectTo: window.location.origin + '/#/update-password',
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Ihre Sitzung ist abgelaufen oder ungültig. Bitte verwenden Sie den Link aus der E-Mail erneut.");
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    
    setIsRecovering(false);
  };

  const resendVerification = async (email: string) => {
    await supabase.auth.resend({ type: 'signup', email });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
