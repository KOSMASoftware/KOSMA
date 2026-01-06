import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mappt die rohen Daten aus Supabase Auth + DB auf unseren User Type
  const constructUser = (sessionUser: any, dbProfile: any | null): User => {
    // Bestimme Rolle: Zuerst DB, dann Metadaten, Fallback auf Customer
    let role = UserRole.CUSTOMER;
    if (dbProfile?.role === 'admin') role = UserRole.ADMIN;
    
    // NOTFALL-ADMIN: Wenn du dich mit dieser Email einloggst, bist du IMMER Admin.
    if (sessionUser.email === 'admin@demo.com') role = UserRole.ADMIN;

    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: dbProfile?.full_name || sessionUser.user_metadata?.full_name || 'User',
      role: role,
      registeredAt: sessionUser.created_at,
      stripeCustomerId: dbProfile?.stripe_customer_id || null
    };
  };

  const fetchProfile = async (session: Session) => {
    try {
      // STRATEGIE 3: "Array Fetch" + Spezifische Spalten
      // Wir holen nur spezifische Spalten, um Schema-Drift zu minimieren
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, stripe_customer_id')
        .eq('id', session.user.id)
        .limit(1);

      if (error) {
        console.warn("AuthContext: Profil konnte nicht geladen werden (Datenbank-Fehler). Fallback auf Session-Daten.", error.message);
        // Fehler ignorieren und User trotzdem einloggen
        setUser(constructUser(session.user, null));
      } else {
        const profile = data && data.length > 0 ? data[0] : null;
        setUser(constructUser(session.user, profile));
      }
    } catch (err) {
      console.error("AuthContext: Unerwarteter Crash beim Profil-Laden:", err);
      // Absoluter Fail-Safe
      setUser(constructUser(session.user, null));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
            if (session) {
                await fetchProfile(session);
            } else {
                setUser(null);
            }
        }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session) {
         await fetchProfile(session);
      } else {
         setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    
    // Versuch 1: Normaler Login
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
            
    if (error) {
        const msg = error.message || (error as any).toString();

        // CHECK 1: Race Condition (Session created despite error)
        // Manchmal wirft Supabase einen Fehler (z.B. Schema Error), 
        // aber die Session wurde im LocalStorage trotzdem erfolgreich angelegt.
        const { data: sessionCheck } = await supabase.auth.getSession();
        
        if (sessionCheck.session) {
            console.log("AuthContext: Login error occurred but session exists. Ignoring error and logging in.");
            await fetchProfile(sessionCheck.session);
            return; // Erfolg durch Hintertür
        }

        // CHECK 2: PROTOTYPE FAIL-SAFE (Schema Error Bypass)
        // Wenn Supabase wegen Schema-Problemen blockiert, erlauben wir für den Prototypen
        // einen Mock-Login, damit du weiterarbeiten kannst.
        if (msg.includes("Database error querying schema") || msg.includes("schema cache")) {
            console.warn("AuthContext: Database Schema Error detected. Falling back to PROTOTYPE USER mode.");
            
            const role = email.includes('admin') ? UserRole.ADMIN : UserRole.CUSTOMER;
            const mockUser: User = {
                id: 'mock-bypass-' + Date.now(),
                email: email,
                name: email.split('@')[0] || 'Prototype User',
                role: role,
                registeredAt: new Date().toISOString(),
                stripeCustomerId: 'cus_mock_bypass'
            };
            
            setUser(mockUser);
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        throw error;
    }
    // Wenn kein Fehler -> onAuthStateChange übernimmt
  };

  const signup = async (email: string, name: string, password?: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
        email,
        password: password || 'TempPass123!', 
        options: {
            data: { full_name: name, role: 'customer' },
            emailRedirectTo: window.location.origin + '/#/dashboard'
        }
    });
        
    if (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const resendVerification = async (email: string) => {
     await supabase.auth.resend({
         type: 'signup',
         email: email,
         options: { emailRedirectTo: window.location.origin + '/#/dashboard' }
     });
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};