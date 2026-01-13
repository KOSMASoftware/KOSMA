
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
const AUTH_TOKEN_KEY = 'kosma-auth-token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const userIdRef = useRef<string | null>(null);

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

  // Helper to sync the session to Supabase client for RLS
  const syncSupabaseSession = async (session: any) => {
    if (session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({ 
            access_token: session.access_token, 
            refresh_token: session.refresh_token 
        });
    }
  };

  const fetchProfile = async (sessionUser: any) => {
    try {
      // Need valid session on client for RLS to work
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      const newUser = constructUser(sessionUser, data);
      setUser(newUser);
      userIdRef.current = newUser.id;
    } catch (err) {
      setUser(constructUser(sessionUser, null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Manual Timeout
      const timer = setTimeout(() => {
        if (mounted) {
            console.warn("[Auth] Init timeout - continuing");
            setIsLoading(false);
        }
      }, 15000);

      try {
        const tokenStr = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!tokenStr) {
            clearTimeout(timer);
            setIsLoading(false);
            return;
        }

        const session = JSON.parse(tokenStr);
        if (!session.access_token) throw new Error("Invalid token structure");

        // Validate via API
        const res = await fetch('/api/supabase-auth-user', {
            method: 'POST',
            body: JSON.stringify({ access_token: session.access_token }),
            headers: { 'Content-Type': 'application/json' }
        });

        clearTimeout(timer);

        if (res.ok) {
            const { user: validatedUser } = await res.json();
            if (mounted) {
                // Restore session to supabase client for Data Access
                await syncSupabaseSession(session);
                await fetchProfile(validatedUser);
            }
        } else {
            console.warn("[Auth] Token invalid or expired");
            localStorage.removeItem(AUTH_TOKEN_KEY);
            if (mounted) setIsLoading(false);
        }

      } catch (err) {
        clearTimeout(timer);
        console.warn("[Auth] Init Error:", err);
        if (mounted) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setIsLoading(false);
        }
      }
    };
    
    init();

    // We no longer rely on supabase.auth.onAuthStateChange for Auth Status
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    try {
        const res = await fetch('/api/supabase-login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        
        if (!res.ok) {
            return { data: null, error: { message: data.error_description || data.error || 'Login failed' } };
        }

        // data is the Session object
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));
        
        // Sync & Fetch
        await syncSupabaseSession(data);
        await fetchProfile(data.user);

        return { data: { user: data.user, session: data }, error: null };
    } catch (e: any) {
        return { data: null, error: { message: e.message || 'Network error' } };
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    const res = await fetch('/api/supabase-signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: name }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error?.message || data.error || 'Signup failed');
    
    // If session is present (auto-confirm), log in
    if (data.session) {
       localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data.session));
       await syncSupabaseSession(data.session);
       await fetchProfile(data.user);
    }
  };

  const resetPassword = async (email: string) => {
    const res = await fetch('/api/supabase-reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, redirect_to: `${window.location.origin}/#/update-password` }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || data.error?.message || data.error || 'Reset failed');
    }
  };

  const updatePassword = async (password: string) => {
    const tokenStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!tokenStr) throw new Error("No session found");
    const session = JSON.parse(tokenStr);

    const res = await fetch('/api/supabase-update-password', {
        method: 'POST',
        body: JSON.stringify({ access_token: session.access_token, password }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || data.error?.message || data.error || 'Update failed');
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        setUser(null);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        const tokenStr = localStorage.getItem(AUTH_TOKEN_KEY);
        if (tokenStr) {
            const session = JSON.parse(tokenStr);
            await fetch('/api/supabase-logout', {
                method: 'POST',
                body: JSON.stringify({ access_token: session.access_token }),
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
      console.warn("Sign out API failed:", err);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Clean up internal supabase client state
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    const tokenStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!tokenStr) return;

    const session = JSON.parse(tokenStr);

    if (session.user?.id && session.user.id !== 'pending') {
      await fetchProfile(session.user);
      return;
    }

    // Fallback: validate token via API and use real user
    try {
        const res = await fetch('/api/supabase-auth-user', {
            method: 'POST',
            body: JSON.stringify({ access_token: session.access_token }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            const { user: validatedUser } = await res.json();
            await fetchProfile(validatedUser);
        }
    } catch (e) {
        console.warn("Profile refresh failed", e);
    }
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
