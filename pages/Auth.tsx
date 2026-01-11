import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const DottedPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-4 gap-3 opacity-20 ${className}`}>
    {[...Array(16)].map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0093D0]" />
    ))}
  </div>
);

const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 overflow-hidden">
    {/* Header Navigation - Exactly as per screenshot */}
    <header className="w-full max-w-7xl mx-auto px-8 py-10 flex justify-between items-center z-20">
      <Link to="/" className="text-2xl font-bold text-[#0093D0] tracking-tight">KOSMA</Link>
      <div className="flex items-center gap-10 text-sm font-bold">
        <Link to="#" className="text-[#0093D0] hover:text-[#007fb5] transition-colors">Download</Link>
        <Link to="/login" className="text-gray-900 hover:text-[#0093D0] transition-colors">Login</Link>
        <Link to="/signup" className="bg-[#111827] text-white px-7 py-2.5 rounded-md hover:bg-black transition-colors">Sign Up</Link>
      </div>
    </header>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
      {/* Decorative Dots Left - Positioned relative to the form container */}
      <DottedPattern className="absolute left-[10%] xl:left-[20%] top-1/2 -translate-y-1/2 hidden md:grid" />
      
      {/* Decorative Dots Right */}
      <DottedPattern className="absolute right-[10%] xl:right-[20%] top-1/2 -translate-y-1/2 hidden md:grid" />

      <div className="w-full max-w-[440px] z-10 -mt-24">
        <div className="text-center mb-16">
          <h1 className="text-[72px] font-bold text-[#111827] mb-2 leading-none tracking-tight">
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
          <Link to="/login" className="text-[#0093D0] font-bold hover:underline">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={mode === 'signup' ? 'Sign Up' : mode === 'update-password' ? 'Update' : 'Login'}
      subtitle={mode === 'login' ? 'Welcome to KOSMA' : ''}
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
                className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-[#0093D0] transition-all text-gray-800 placeholder:text-gray-300 bg-white"
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'update-password' || step === 'details') && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">PASSWORD</label>
              <input 
                type="password" 
                placeholder="......" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
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
          {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : mode === 'signup' ? (step === 'initial' ? 'Continue' : 'Create Account') : 'Update')}
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