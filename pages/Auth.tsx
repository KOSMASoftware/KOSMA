
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
    <div className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-brand-500 tracking-tight">KOSMA</Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/login" className="text-gray-900 hover:text-brand-500">Login</Link>
        <Link to="/signup" className="bg-gray-900 text-white px-5 py-2 rounded hover:bg-gray-800 transition-colors">Sign Up</Link>
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden my-12">
      <div className="w-full max-w-[520px] z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 text-lg">{subtitle}</p>}
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
  const [isConfigError, setIsConfigError] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const isResetRequest = searchParams.get('reset') === 'true';

  const handleAction = async () => {
    if (loading) return;
    setError('');
    setIsConfigError(false);
    setLoading(true);

    // Safety timeout to prevent infinite spinner
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timeout. Please check your connection.");
      }
    }, 15000);

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
          // Special handling for 401 with null body (usually gateway/key issues)
          if (loginError.status === 401 || !loginError.message) {
            setError("Authentication failed. This could be due to invalid credentials or a system configuration error (Invalid API Keys).");
            setIsConfigError(true);
          } else {
            setError(loginError.message);
          }
          setLoading(false);
          clearTimeout(timeout);
          return;
        }

        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
          const role = profile?.role || 'customer';
          navigate(role === 'admin' ? '/admin' : '/dashboard');
        }
      } else if (mode === 'signup') {
        if (step === 'initial') {
          if (!email.includes('@')) throw new Error("Invalid email.");
          setStep('details');
        } else {
          await signup(email, `${firstName} ${lastName}`, password);
          setStep('success');
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      clearTimeout(timeout);
      // We only stop loading if we haven't navigated away
      setTimeout(() => setLoading(false), 500);
    }
  };

  if (step === 'success') {
    return (
      <AuthLayout title="Success" subtitle="Please check your inbox">
        <div className="text-center space-y-6">
          <p className="text-gray-600">Action completed successfully. Follow the instructions in your email.</p>
          <Link to="/login" className="text-brand-500 font-bold hover:underline">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={mode === 'signup' ? 'Register' : 'Login'}>
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex gap-3">
            {isConfigError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <div>
              <p className="font-bold">{isConfigError ? 'Connection Issue' : 'Error'}</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {mode !== 'update-password' && step === 'initial' && (
            <input 
              type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          )}
          
          {(mode === 'login' || mode === 'update-password' || step === 'details') && (
            <input 
              type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          )}

          {mode === 'signup' && step === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="p-4 border border-gray-200 rounded-xl" />
              <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="p-4 border border-gray-200 rounded-xl" />
            </div>
          )}
        </div>

        <button 
          onClick={handleAction} disabled={loading}
          className="w-full py-4 bg-brand-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-600 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {mode === 'login' ? 'Login' : mode === 'signup' ? 'Continue' : 'Update'}
        </button>

        <div className="text-center">
          <Link to="/login?reset=true" className="text-sm text-gray-500 hover:text-brand-500">Forgot password?</Link>
        </div>
      </div>
    </AuthLayout>
  );
};
