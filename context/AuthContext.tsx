
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
  
  // Sofortige Prüfung beim Instanziieren (verhindert UI-Glitch)
  const [isRecovering, setIsRecovering] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    return hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('access_token=');
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
        const rawUrl = window.location.href;
        
        // 1. PKCE Flow (?code=...)
        const urlObj = new URL(rawUrl);
        const code = urlObj.searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // 2. Session holen (Supabase Auto-Detect)
        let { data: { session } } = await supabase.auth.getSession();

        // 3. Manueller Fallback für HashRouter (#/route#access_token=...)
        if (!session && rawUrl.includes('access_token=')) {
          const tokenPart = rawUrl.substring(rawUrl.indexOf("access_token="));
          const p = new URLSearchParams(tokenPart.replace(/#/g, '&').replace(/\?/g, '&'));
          
          const at = p.get('access_token');
          const rt = p.get('refresh_token');
          const type = p.get('type');

          if (at && rt) {
            const { data: manualData } = await supabase.auth.setSession({
              access_token: at,
              refresh_token: rt
            });
            session = manualData.session;
            if (type === 'recovery') setIsRecovering(true);
          }
        }

        if (session) {
          await fetchProfile(session);
          
          // 4. Intelligenter URL Cleanup für HashRouter
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          url.searchParams.delete("type");
          url.searchParams.delete("redirect_to");
          // Behält #/update-password bei, löscht aber #access_token=...
          if (url.hash.includes("#access_token=")) {
            url.hash = url.hash.split("#access_token=")[0];
          }
          window.history.replaceState({}, '', url.toString());
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
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/#/update-password',
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    // Sicherstellen, dass wir eine Session haben
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Deine Sitzung ist abgelaufen. Bitte fordere einen neuen Passwort-Link an.");
    
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
