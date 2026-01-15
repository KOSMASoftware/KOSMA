
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MarketingLayout } from '../components/layout/MarketingLayout';

const DottedPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-4 gap-3 opacity-20 ${className}`}>
    {[...Array(16)].map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0093D0]" />
    ))}
  </div>
);

// Wrapper that uses MarketingLayout but maintains the inner centering and pattern logic
const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <MarketingLayout>
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[calc(100vh-200px)]">
      <DottedPattern className="absolute left-[10%] xl:left-[20%] top-1/2 -translate-y-1/2 hidden md:grid" />
      <DottedPattern className="absolute right-[10%] xl:right-[20%] top-1/2 -translate-y-1/2 hidden md:grid" />

      <div className="w-full max-w-[440px] z-10 py-12">
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
        {children}
      </div>
    </div>
  </MarketingLayout>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'initial' | 'details' | 'success'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const isResetRequest = searchParams.get('reset') === 'true';
  const isConfigError = error.toLowerCase().includes('configuration') || error.toLowerCase().includes('keys');

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
        const refreshToken = extract('refresh_token');

        if (accessToken && refreshToken) {
            localStorage.setItem('kosma-auth-token', JSON.stringify({ 
                access_token: accessToken, 
                refresh_token: refreshToken,
                user: { id: 'pending' }
            }));
        }
    }
  }, [mode]);

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
        await updatePassword(password);
        setStep('success');
      } else if (isResetRequest) {
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'login') {
        // Timeout Wrapper für Login
        const { data, error: loginError } = await Promise.race([
          login(email, password),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error("Login timeout. Please try again.")), 15000)
          )
        ]);
        
        if (loginError) {
          setError(loginError.message || "Invalid credentials.");
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Wir warten kurz auf das Profil-Update im Context
          await refreshProfile();
          
          // Direkte Abfrage der DB zur Sicherheit beim Navigieren
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
          const isAdmin = (data.user.email?.toLowerCase().trim() === 'mail@joachimknaf.de') || (profile?.role === 'admin');
          
          navigate(isAdmin ? '/admin' : '/dashboard');
        }
      } else if (mode === 'signup') {
        if (step === 'initial') {
          if (!email.includes('@')) throw new Error("Please enter a valid email address.");
          setStep('details');
        } else {
          await signup(email, `${firstName} ${lastName}`, password);
          setStep('success');
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
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
          <Link to="/login" className="text-[#0093D0] font-bold hover:underline">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={isResetRequest ? 'Reset Password' : mode === 'signup' ? 'Sign Up' : mode === 'update-password' ? 'Update' : 'Login'}
      subtitle={isResetRequest ? 'Wir schicken dir einen Reset-Link' : mode === 'login' ? 'Welcome to KOSMA' : ''}
    >
      <div className="space-y-10">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-3 animate-in fade-in zoom-in-95">
            {isConfigError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {mode !== 'update-password' && step === 'initial' && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">EMAIL</label>
              <input 
                type="email" 
                placeholder="user@demo.de" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAction()}
                className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-[#0093D0] transition-all text-gray-800 placeholder:text-gray-300 bg-white"
              />
            </div>
          )}
          
          {!isResetRequest && (mode === 'login' || mode === 'update-password' || step === 'details') && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">PASSWORD</label>
              <input 
                type="password" 
                placeholder="......" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAction()}
                className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-[#0093D0] transition-all text-gray-800 placeholder:text-gray-300 bg-white"
              />
            </div>
          )}

          {mode === 'signup' && step === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">FIRST NAME</label>
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-[#0093D0] bg-white" />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">LAST NAME</label>
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-[#0093D0] bg-white" />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAction} 
          disabled={loading}
          className="w-full py-5 bg-[#0093D0] text-white rounded-xl font-bold text-base flex items-center justify-center transition-all hover:bg-[#007fb5] disabled:opacity-50 active:scale-[0.98] shadow-sm"
        >
          {loading ? 'Processing...' : isResetRequest ? 'Reset-Link senden' : (mode === 'login' ? 'Log In' : mode === 'signup' ? (step === 'initial' ? 'Continue' : 'Create Account') : 'Update')}
        </button>

        <div className="text-center space-y-4 pt-2">
          {mode === 'login' && (
            <p className="text-xs font-medium text-gray-500">
              Not having a KOSMA account? <Link to="/signup" className="text-[#0093D0] hover:underline font-bold">Register now</Link>
            </p>
          )}
          <Link to="/login?reset=true" className="text-xs font-medium text-gray-400 hover:text-gray-600 block">Forgot password?</Link>
        </div>
      </div>
    </AuthLayout>
  );
};
