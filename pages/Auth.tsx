
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const isResetMode = searchParams.get('reset') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isResetMode) {
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
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
          <p className="text-gray-600 mb-8">We sent a link to {email}. Please follow the instructions to continue.</p>
          <button onClick={() => setStep('form')} className="text-brand-600 font-bold hover:underline">Back to form</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center text-3xl font-black text-brand-500 mb-8">KOSMA</Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {mode === 'update-password' ? 'Set new password' : isResetMode ? 'Reset password' : mode === 'login' ? 'Log in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            )}

            {!mode.includes('update-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            )}

            {!isResetMode && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>
                {mode === 'update-password' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 text-sm">
            {mode === 'login' && !isResetMode && (
              <>
                <Link to="/login?reset=true" className="font-medium text-brand-600 hover:text-brand-500">Forgot your password?</Link>
                <div className="text-gray-500">Don't have an account? <Link to="/signup" className="text-brand-600 hover:text-brand-500 font-bold">Sign up</Link></div>
              </>
            )}
            {mode === 'signup' && (
              <div className="text-gray-500">Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-500 font-bold">Log in</Link></div>
            )}
            {isResetMode && (
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">Back to login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
