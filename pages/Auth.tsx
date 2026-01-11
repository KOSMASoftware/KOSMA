import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const DottedPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-5 gap-2 opacity-20 ${className}`}>
    {[...Array(20)].map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500" />
    ))}
  </div>
);

const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
    {/* Header Navigation */}
    <div className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-brand-500 tracking-tight uppercase">KOSMA</Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="#" className="text-brand-500 hover:text-brand-600 transition-colors">Download</Link>
        <Link to="/login" className="text-gray-900 hover:text-brand-500 transition-colors">Login</Link>
        <Link to="/signup" className="bg-gray-900 text-white px-5 py-2 rounded hover:bg-gray-800 transition-colors">Sign Up</Link>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden my-12">
      {/* Decorative Dots */}
      <DottedPattern className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:grid" />
      <DottedPattern className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:grid" />

      <div className="w-full max-w-[520px] z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h1>
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
          if (loginError.status === 401 || !loginError.message) {
            setError("Login rejected. Please check your credentials and system environment keys.");
          } else {
            setError(loginError.message);
          }
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
      console.error("Auth Action Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <AuthLayout title="Success" subtitle="Action completed">
        <div className="text-center space-y-6">
          <p className="text-gray-600">Please check your inbox for instructions.</p>
          <Link to="/login" className="text-brand-500 font-bold hover:underline">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={mode === 'signup' ? 'Register' : mode === 'update-password' ? 'New Password' : 'Login'}
      subtitle={mode === 'login' ? 'Welcome to KOSMA' : ''}
    >
      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-3 animate-in fade-in zoom-in-95">
            {isConfigError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <div>
              <p className="font-bold">{isConfigError ? 'Connection Issue' : 'Error'}</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {mode !== 'update-password' && step === 'initial' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                type="email" placeholder="mail@joachimknaf.de" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-gray-700 placeholder:text-gray-300"
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'update-password' || step === 'details') && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" placeholder="......" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-gray-700 placeholder:text-gray-300"
              />
            </div>
          )}

          {mode === 'signup' && step === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAction} disabled={loading}
          className="w-full py-4 border border-brand-200 text-brand-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-50 disabled:opacity-50 transition-all shadow-sm"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {mode === 'login' ? 'Log In' : mode === 'signup' ? (step === 'initial' ? 'Continue' : 'Create Account') : 'Update'}
        </button>

        <div className="text-center space-y-4">
          {mode === 'login' && (
            <p className="text-sm text-gray-500">
              Not having a KOSMA account? <Link to="/signup" className="text-brand-500 hover:underline">Register now</Link>
            </p>
          )}
          <div>
            <Link to="/login?reset=true" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">Forgot password?</Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};