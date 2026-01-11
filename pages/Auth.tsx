import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const DottedPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-4 gap-3 opacity-20 ${className}`}>
    {[...Array(20)].map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500" />
    ))}
  </div>
);

const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
    {/* Header Navigation */}
    <div className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-brand-500 tracking-tight">KOSMA</Link>
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link to="#" className="text-brand-500 hover:text-brand-600 transition-colors">Download</Link>
        <Link to="/login" className="text-gray-900 hover:text-brand-500 transition-colors">Login</Link>
        <Link to="/signup" className="bg-[#111827] text-white px-6 py-2.5 rounded hover:bg-black transition-colors">Sign Up</Link>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Dots Left */}
      <DottedPattern className="absolute left-12 top-1/2 -translate-y-1/2 hidden lg:grid" />
      {/* Decorative Dots Right */}
      <DottedPattern className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:grid" />

      <div className="w-full max-w-[480px] z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-[#111827] mb-2 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 text-lg font-medium">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  </div>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword } = useAuth();
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
        const { user, error: loginError } = await login(email, password);
        
        if (loginError) {
          setError(loginError.message || "Invalid credentials.");
          setLoading(false);
          return;
        }

        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
          const role = profile?.role || 'customer';
          navigate(role === 'admin' ? '/admin' : '/dashboard');
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
      <AuthLayout title="Success" subtitle="Check your email">
        <div className="text-center space-y-6">
          <p className="text-gray-600">Instructions have been sent.</p>
          <Link to="/login" className="text-brand-500 font-bold hover:underline">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={mode === 'signup' ? 'Sign Up' : mode === 'update-password' ? 'Update' : 'Login'}
      subtitle={mode === 'login' ? 'Welcome to KOSMA' : ''}
    >
      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-3 animate-in fade-in zoom-in-95">
            {isConfigError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {mode !== 'update-password' && step === 'initial' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">EMAIL</label>
              <input 
                type="email" 
                placeholder="mail@joachimknaf.de" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-gray-700 placeholder:text-gray-300"
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'update-password' || step === 'details') && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">PASSWORD</label>
              <input 
                type="password" 
                placeholder="......" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-gray-700 placeholder:text-gray-300"
              />
            </div>
          )}

          {mode === 'signup' && step === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">FIRST NAME</label>
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">LAST NAME</label>
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAction} 
          disabled={loading}
          className="w-full py-5 border-2 border-brand-200 text-brand-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-50 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {mode === 'login' && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full opacity-20" />}
              <span>{mode === 'login' ? 'Log In' : mode === 'signup' ? (step === 'initial' ? 'Continue' : 'Create Account') : 'Update'}</span>
            </>
          )}
        </button>

        <div className="text-center space-y-4 pt-2">
          {mode === 'login' && (
            <p className="text-sm text-gray-500">
              Not having a KOSMA account? <Link to="/signup" className="text-brand-500 hover:underline">Register now</Link>
            </p>
          )}
          <Link to="/login?reset=true" className="text-sm text-gray-400 hover:text-gray-600 block">Forgot password?</Link>
        </div>
      </div>
    </AuthLayout>
  );
};