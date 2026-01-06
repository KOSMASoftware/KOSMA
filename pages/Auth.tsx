
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle } from 'lucide-react';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const isResetMode = searchParams.get('reset') === 'true';

  // Specific check for password update mode
  useEffect(() => {
    if (mode === 'update-password' && !isLoading && !isAuthenticated) {
      setError("No active session found. If you came from an email link, it may have expired.");
    }
  }, [mode, isLoading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isResetMode) {
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        await updatePassword(password);
        navigate('/dashboard');
      } else if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await signup(email, name, password);
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-blue-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600 mb-8">Instructions have been sent to {email}. Please follow them to continue.</p>
          <button onClick={() => setStep('form')} className="text-brand-600 font-bold hover:underline">Back to form</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center text-3xl font-black text-brand-500 mb-8 tracking-tighter">KOSMA</Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          {mode === 'update-password' ? 'Set new password' : isResetMode ? 'Reset password' : mode === 'login' ? 'Log in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-sm sm:rounded-xl border border-gray-200">
          
          {mode === 'update-password' && error.includes('session') && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="font-bold">Missing Session</p>
                    <p>To set a new password, you must use the link from the reset email. If you just did that, the session may have expired.</p>
                    <Link to="/login?reset=true" className="inline-block mt-2 font-bold underline">Request new link</Link>
                </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                />
              </div>
            )}

            {!mode.includes('update-password') && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            )}

            {!isResetMode && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {mode === 'update-password' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>
            )}

            {error && !error.includes('session') && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || (mode === 'update-password' && !isAuthenticated)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4 text-sm">
            {mode === 'login' && !isResetMode && (
              <>
                <Link to="/login?reset=true" className="font-bold text-brand-600 hover:underline">Forgot your password?</Link>
                <div className="text-gray-500">Don't have an account? <Link to="/signup" className="text-brand-600 hover:underline font-bold">Sign up</Link></div>
              </>
            )}
            {mode === 'signup' && (
              <div className="text-gray-500">Already have an account? <Link to="/login" className="text-brand-600 hover:underline font-bold">Log in</Link></div>
            )}
            {(isResetMode || mode === 'update-password') && (
              <Link to="/login" className="font-bold text-brand-600 hover:underline">Back to login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
