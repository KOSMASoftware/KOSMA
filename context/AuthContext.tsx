
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecovering: boolean;
  // FIX: Supabase signInWithPassword returns { data, error }. The interface previously used 'user' instead of 'data'.
  login: (email: string, password: string) => Promise<{ data: any, error: any }>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Absolute Admin-Garantie für dich
const OWNER_EMAIL = 'mail@joachimknaf.de';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const constructUser = (sessionUser: any, dbProfile: any | null): User => {
    const email = sessionUser.email?.toLowerCase().trim() || '';
    
    // WICHTIG: Wir ignorieren sessionUser.user_metadata.role, da es oft veraltet ist!
    // Die Rolle kommt EXKLUSIV aus der Datenbank oder dem E-Mail-Check.
    const isOwner = email === OWNER_EMAIL;
    const isAdmin = isOwner || dbProfile?.role === 'admin';
    
    console.log(`[Auth] Reconstructing User: ${email}`);
    console.log(`[Auth] Role from DB: ${dbProfile?.role || 'none'}, isOwner: ${isOwner} -> Final: ${isAdmin ? 'ADMIN' : 'CUSTOMER'}`);

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
    const email = session.user.email?.toLowerCase().trim() || '';
    
    // Falls du es bist, setzen wir sofort Admin, um Flackern beim Laden zu verhindern
    if (email === OWNER_EMAIL) {
       setUser(constructUser(session.user, null));
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) console.error("[Auth] DB Error:", error.message);

      const newUser = constructUser(session.user, data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      console.error("[Auth] Critical Failure:", err);
      // Letzter Rettungsanker
      setUser(constructUser(session.user, null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session);
      } else {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Session Event: ${event}`);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session) await fetchProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        userIdRef.current = null;
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
    // Radikaler Logout inklusive Speicher-Bereinigung
    await supabase.auth.signOut();
    localStorage.removeItem('kosma-auth-token');
    setUser(null);
    setIsLoading(false);
    window.location.hash = '#/login';
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
