import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';

// Wrapper that uses MarketingLayout but maintains the inner centering
const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <MarketingLayout>
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[calc(100vh-200px)]">
      
      <div className="w-full max-w-[440px] z-10 py-12 relative">
        <div className="text-center mb-12">
          <h1 className="text-[64px] font-bold text-[#111827] mb-2 leading-none tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 text-base font-medium tracking-tight mt-4">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Added background to card for better readability over dots */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white">
            {children}
        </div>
      </div>
    </div>
  </MarketingLayout>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, refreshProfile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'initial' | 'details' | 'success'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Local state for recovery flow to bypass global AuthContext interference
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  const isResetRequest = searchParams.get('reset') === 'true';
  const isConfigError = error.toLowerCase().includes('configuration') || error.toLowerCase().includes('keys');

  // Reset state when mode or reset param changes
  useEffect(() => {
    setStep('initial');
    setError('');
  }, [mode, isResetRequest]);

  // Handle URL hash parsing for password reset flow
  useEffect(() => {
    if (mode === 'update-password') {
        const fullHash = window.location.hash + window.location.search; 
        // Search in the whole string for params
        const extract = (key: string) => {
            const regex = new RegExp(`[#?&]${key}=([^&]*)`);
            const match = fullHash.match(regex);
            return match ? decodeURIComponent(match[1]) : null;
        };

        const accessToken = extract('access_token');
        // We deliberately do NOT write to localStorage here to prevent AuthContext 
        // from trying to validate this recovery token as a login session and failing.
        if (accessToken) {
            setRecoveryToken(accessToken);
        }
    }
  }, [mode]);

  // AUTOMATIC NAVIGATION (Single Source of Truth)
  // Replaces the manual check in handleAction to prevent race conditions.
  useEffect(() => {
    if (user && mode === 'login') {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, mode, navigate]);

  const handleAction = async () => {
    if (loading) return;
    setError('');

    if (!isSupabaseConfigured()) {
      setError("System Configuration Error: Supabase keys are missing or invalid.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'update-password') {
        if (!recoveryToken) throw new Error("Missing or invalid recovery token. Please try clicking the link in your email again.");
        
        // Direct API call to avoid AuthContext dependency
        const res = await fetch('/api/supabase-update-password', {
            method: 'POST',
            body: JSON.stringify({ access_token: recoveryToken, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.msg || data.error?.message || data.error || 'Update failed');
        }
        
        setStep('success');
        setLoading(false);
      } else if (isResetRequest) {
        await resetPassword(email);
        setStep('success');
        setLoading(false);
      } else if (mode === 'login') {
        // Timeout Wrapper für Login
        const { data, error: loginError } = await Promise.race([
          login(email, password),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error("Login timeout. Please try again.")), 15000)
          )
        ]);
        
        if (loginError) {
          throw new Error(loginError.message || "Invalid credentials.");
        }

        // On success, we rely on the useEffect above to navigate.
        // We keep loading=true to prevent UI flickering.
        
      } else if (mode === 'signup') {
        if (step === 'initial') {
          if (!email.includes('@')) throw new Error("Please enter a valid email address.");
          setStep('details');
          setLoading(false);
        } else {
          await signup(email, `${firstName} ${lastName}`, password);
          setStep('success');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <AuthLayout title="Success" subtitle={mode === 'update-password' ? 'Your password has been updated' : 'Check your email'}>
        <div className="text-center space-y-6">
          <p className="text-gray-600">
             {mode === 'update-password' 
               ? 'You can now login with your new password.'
               : 'Instructions have been sent.'}
          </p>
          <Link to="/login" className="text-brand-500 font-bold hover:underline">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={isResetRequest ? 'Reset Password' : mode === 'signup' ? 'Sign Up' : mode === 'update-password' ? 'Update' : 'Login'}
      subtitle={isResetRequest ? 'We will send you a reset link' : mode === 'login' ? 'Welcome to KOSMA' : ''}
    >
      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-3 animate-in fade-in zoom-in-95">
            {isConfigError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {mode !== 'update-password' && step === 'initial' && (
            <FormField label="Email">
              <Input 
                type="email" 
                placeholder="user@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAction()}
              />
            </FormField>
          )}
          
          {!isResetRequest && (mode === 'login' || mode === 'update-password' || step === 'details') && (
            <FormField label="Password">
              <Input 
                type="password" 
                placeholder="......" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAction()}
              />
            </FormField>
          )}

          {mode === 'signup' && step === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name">
                <Input 
                  type="text" 
                  placeholder="First Name" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                />
              </FormField>
              <FormField label="Last Name">
                <Input 
                  type="text" 
                  placeholder="Last Name" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                />
              </FormField>
            </div>
          )}
        </div>

        <Button 
          onClick={handleAction} 
          disabled={loading}
          className="w-full"
          isLoading={loading}
        >
          {isResetRequest ? 'Send Reset Link' : (mode === 'login' ? 'Log In' : mode === 'signup' ? (step === 'initial' ? 'Continue' : 'Create Account') : 'Update')}
        </Button>

        <div className="text-center space-y-4 pt-2">
          {mode === 'login' && (
            <p className="text-xs font-medium text-gray-500">
              Don't have a KOSMA account? <Link to="/signup" className="text-brand-500 hover:underline font-bold">Sign up now</Link>
            </p>
          )}
          <Link to="/login?reset=true" className="text-xs font-medium text-gray-400 hover:text-gray-600 block">Forgot password?</Link>
        </div>
      </div>
    </AuthLayout>
  );
};