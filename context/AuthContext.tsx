
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
  
  // Sofortige Prüfung beim Mounten (verhindert UI-Flickern)
  const [isRecovering, setIsRecovering] = useState(() => {
    if (typeof window === 'undefined') return false;
    const h = window.location.hash;
    const s = window.location.search;
    return h.includes('type=recovery') || s.includes('type=recovery') || h.includes('access_token=');
  });
  
  const didInitRef = useRef(false);
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
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initSession = async () => {
      try {
        const h = window.location.hash;
        const p = window.location.pathname;

        // --- 1. BRIDGE MECHANISMUS (Fix A) ---
        // Wenn wir auf /update-password (echter Pfad) landen, hat Supabase dank 
        // detectSessionInUrl: true bereits die Tokens aus der URL verarbeitet.
        // Wir leiten dann sofort auf die Hash-Route weiter, damit der HashRouter übernimmt.
        if (p === '/update-password' || p.endsWith('/update-password')) {
            window.location.replace(window.location.origin + '/#/update-password');
            return; 
        }

        // --- 2. DOUBLE-HASH KILLER FALLBACK ---
        // Falls wir doch in einen Doppel-Hash laufen (#/route#access_token=...)
        const tokenIdx = h.indexOf("#access_token=");
        if (tokenIdx >= 0) {
          const frag = h.substring(tokenIdx + 1);
          const params = new URLSearchParams(frag);
          const at = params.get("access_token");
          const rt = params.get("refresh_token");
          const type = params.get("type");

          if (at && rt) {
            await supabase.auth.setSession({ access_token: at, refresh_token: rt });
            if (type === 'recovery') setIsRecovering(true);
          }
        }

        // --- 3. SESSION HOOK ---
        const { data: { session } } = await supabase.auth.getSession();

        // --- 4. ROBUSTER CLEANUP ---
        // Entfernt nur die Access-Token-Parameter aus dem Hash, behält die Route bei.
        if (session || h.includes('access_token=')) {
          const baseHash = window.location.hash.split("#access_token=")[0];
          const cleanUrl = window.location.origin + window.location.pathname + baseHash;
          window.history.replaceState({}, "", cleanUrl);
        }

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
      console.log("Auth Event:", event);
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
      
      if (session) {
        if (userIdRef.current !== session.user.id || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await fetchProfile(session);
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
    // FIX A: Redirect auf einen echten Pfad ohne Hash, um Doppel-Hash-Probleme zu vermeiden.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/update-password',
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sitzung abgelaufen. Bitte fordere einen neuen Link an.");
    
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
