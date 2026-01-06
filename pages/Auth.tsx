
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const isResetMode = searchParams.get('reset') === 'true';
  // Fix: Use ReturnType<typeof setTimeout> to resolve "Cannot find namespace 'NodeJS'" error in browser environments
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated, navigate]);

  const handleAction = async () => {
    if (localLoading) return;
    
    setError('');
    setLocalLoading(true);

    // SAFETY TIMEOUT: Force-stop spinner after 8 seconds if Supabase hangs
    timeoutRef.current = setTimeout(() => {
      setLocalLoading(false);
      setError("Die Anfrage dauert zu lange. Bitte prüfen Sie Ihre Verbindung.");
    }, 8000);
    
    try {
      if (isResetMode) {
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password !== confirmPassword) throw new Error("Passwörter stimmen nicht überein.");
        await updatePassword(password);
        navigate('/dashboard');
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, name, password);
        setStep('success');
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setError(err.message || "Ein Fehler ist aufgetreten.");
      setLocalLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full text-center p-12">
          <Mail className="w-16 h-16 text-brand-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="text-gray-500 mb-8">We've sent a link to <strong>{email}</strong>.</p>
          <button onClick={() => setStep('form')} className="text-brand-500 font-bold hover:underline cursor-pointer">Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* HEADER - Solid and Simple */}
      <nav className="bg-white py-6 px-6 md:px-12 flex items-center justify-between border-b border-gray-100 relative z-50">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-black text-brand-500 tracking-tighter italic">KOSMA</Link>
          <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-600 uppercase tracking-widest text-[10px]">
            <Link to="/" className="hover:text-brand-500">Pricing</Link>
            <Link to="#" className="hover:text-brand-500">Learning Campus</Link>
            <Link to="#" className="hover:text-brand-500">Help</Link>
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm font-bold">
          <Link to="#" className="text-brand-500 hover:underline hidden md:block">Download</Link>
          <Link to="/login" className={mode === 'login' ? 'text-brand-500' : 'text-gray-900'}>Login</Link>
          <Link to="/signup" className="bg-gray-900 text-white px-6 py-2 rounded shadow-sm">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-5xl font-bold text-center text-gray-900 mb-4 tracking-tight">
            {mode === 'update-password' ? 'Reset' : isResetMode ? 'Reset' : mode === 'login' ? 'Login' : 'Sign Up'}
          </h1>
          <p className="text-center text-gray-500 mb-12 font-medium">
            {isResetMode ? 'Enter your email to reset password.' : mode === 'login' ? 'Welcome back.' : 'Create your account.'}
          </p>

          <div className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="block w-full px-5 py-4 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all"
                />
              </div>
            )}

            {mode !== 'update-password' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@mustermann.de"
                  className="block w-full px-5 py-4 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all"
                />
              </div>
            )}

            {!isResetMode && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full px-5 py-4 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all"
                  />
                </div>
                {mode === 'update-password' && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                    <input
                      type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-5 py-4 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAction}
              disabled={localLoading}
              className="w-full flex justify-center items-center h-[56px] bg-brand-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              {localLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' && !isResetMode ? 'Log In' : 'Continue')}
            </button>
          </div>

          <div className="mt-12 text-center space-y-4">
            <Link to={isResetMode ? "/login" : "/login?reset=true"} className="block text-sm font-bold text-brand-500 hover:underline">
              {isResetMode ? 'Back to Login' : 'Passwort vergessen?'}
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-gray-100 text-sm text-gray-400 flex justify-between items-center">
        <div className="flex gap-6">
          <Link to="#">Imprint</Link>
          <Link to="#">Privacy</Link>
        </div>
        <div>© 2023 KOSMA</div>
      </footer>
    </div>
  );
};
