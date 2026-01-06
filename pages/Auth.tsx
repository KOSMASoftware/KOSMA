
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Check, X, Loader2, Mail, Shield, User, Briefcase, Zap, GraduationCap, Clock, UserX, AlertTriangle, Database, Terminal, KeyRound, ArrowLeft } from 'lucide-react';

const Requirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-gray-300 ml-1 mr-1" />}
    {text}
  </div>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const { login, signup, resetPassword, resendVerification, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'email' | 'details' | 'success' | 'forgot-password'>(mode === 'login' ? 'email' : 'email');
  const [viewMode, setViewMode] = useState<'login' | 'register'>(mode === 'login' ? 'login' : 'register');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  useEffect(() => {
    setViewMode(mode === 'login' ? 'login' : 'register');
    if (mode === 'login') {
       if (searchParams.get('reset') === 'true') {
           setStep('forgot-password');
       } else {
           setStep('email');
       }
    }
    setEmailError('');
    setAuthError('');
  }, [mode, searchParams]);

  const pwdLength = password.length >= 6; 
  const isPasswordValid = pwdLength;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (viewMode === 'register') {
        setStep('details');
    } else {
       handleLogin();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    setAuthError('');
    try {
      await signup(email, `${firstName} ${lastName}`, password);
      setStep('success');
    } catch (err: any) {
      setAuthError(err.message || "Registration failed");
    }
  };

  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
        setEmailError('Please enter a valid email address.');
        return;
    }
    setAuthError('');
    try {
        await resetPassword(email);
        setStep('success');
    } catch (err: any) {
        setAuthError(err.message || "Password reset failed");
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    try {
       await login(email, password);
       navigate('/dashboard');
    } catch (err: any) {
       let msg = err?.message || JSON.stringify(err);
       if (msg.includes("Email not confirmed")) {
           setAuthError("Email not verified. Please check your inbox.");
       } else if (msg.includes("Invalid login credentials") || msg.includes("invalid_grant")) {
           setAuthError("Wrong email or password.");
       } else if (msg.includes("Database error") || msg.includes("PGRST")) {
           setAuthError("SCHEMA_ERROR");
       } else {
           setAuthError(msg || "Login failed.");
       }
    }
  };

  const handleResendEmail = async () => {
    setResendStatus('sending');
    await resendVerification(email);
    setResendStatus('sent');
    setTimeout(() => setResendStatus('idle'), 3000);
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
      setEmail(demoEmail);
      setPassword(demoPass);
      setEmailError('');
      setAuthError('');
  };

  const renderForgotPassword = () => (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setStep('email')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>

        <form onSubmit={handleResetPasswordRequest} className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        className={`w-full px-4 py-3 border ${emailError ? 'border-red-300' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100'} rounded-lg focus:ring-4 outline-none transition-all`}
                        placeholder="name@company.com"
                        required
                    />
                    {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>

                {authError && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                        <span>{authError}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-brand-500 text-white hover:bg-brand-600 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
            </div>
        </form>
    </div>
  );

  const renderLogin = () => (
    <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Login</h1>
      <p className="text-gray-500 text-center mb-8">Access your Real Database</p>

      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                className={`w-full px-4 py-3 border ${emailError ? 'border-red-300 ring-red-100' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100'} rounded-lg focus:ring-4 outline-none transition-all`}
                placeholder="name@company.com"
            />
            </div>

            <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
                <button type="button" onClick={() => setStep('forgot-password')} className="text-xs font-bold text-brand-500 hover:underline">Forgot password?</button>
            </div>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all"
                placeholder="••••••••••"
            />
            </div>

            {authError === 'SCHEMA_ERROR' ? (
                 <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2 text-amber-800">
                         <Database className="w-4 h-4" />
                         Database Schema Sync Required
                    </div>
                    <div className="bg-white p-3 rounded border border-amber-200 font-mono text-xs select-all mb-3 text-gray-600">
                        NOTIFY pgrst, 'reload config';
                    </div>
                    <button type="button" onClick={() => navigate(0)} className="text-xs font-bold text-amber-700 hover:text-amber-900 underline">Reload & Try Again</button>
                 </div>
            ) : (emailError || authError) && (
                <div className={`p-4 text-sm rounded-lg flex items-start gap-3 ${authError.includes('verified') ? 'bg-orange-50 text-orange-800' : 'bg-red-50 text-red-600'}`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                    <span>{emailError || authError}</span>
                </div>
            )}

            <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-500 text-white hover:bg-brand-600 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
        </div>

        <div className="mt-8 pt-6">
             <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fast Login (Pre-fill Form)</span>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button type="button" onClick={() => fillCredentials('customer@demo.com', 'password123')} className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md">
                    <User className="w-8 h-8 text-brand-500 group-hover:scale-110 transition-transform" />
                    <span className="block font-bold text-gray-900 text-sm">Hans</span>
                </button>
                <button type="button" onClick={() => fillCredentials('admin@demo.com', 'password123')} className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md">
                    <Shield className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="block font-bold text-gray-900 text-sm">Admin</span>
                </button>
             </div>
        </div>
      </form>
    </div>
  );

  const renderRegisterStep1 = () => (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Register</h1>
      <p className="text-gray-500 text-center mb-12">Let's get you started!</p>

      <form onSubmit={handleContinue} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
            className={`w-full px-4 py-3 border ${emailError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all`}
            placeholder="max@mustermann.de"
            required
          />
        </div>

        <button type="submit" className="w-full py-3 bg-white border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-lg transition-colors">Continue</button>
      </form>
    </div>
  );

  const renderRegisterStep2 = () => (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Register</h1>
      <p className="text-gray-500 text-center mb-12">Set up your details</p>

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
           <div className="flex justify-between items-center mb-1">
             <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
             <button type="button" onClick={() => setStep('email')} className="text-xs text-brand-500 hover:underline">Change</button>
           </div>
           <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 select-none">{email}</div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all"
            placeholder="••••••••••"
          />
          <div className="mt-2 pl-1"><Requirement met={pwdLength} text="6 characters minimum." /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" required />
           <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" required />
        </div>

        <button type="submit" disabled={!isPasswordValid || isLoading} className="w-full py-3 bg-brand-500 text-white font-bold rounded-lg shadow-lg shadow-brand-500/30">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your inbox</h1>
          <p className="text-gray-500 mb-8">We sent a link to <strong>{email}</strong>.</p>
          <button onClick={() => setStep('email')} className="text-brand-500 hover:underline font-bold">Back to Login</button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="flex justify-between items-center py-6 px-8 md:px-16">
        <Link to="/" className="text-2xl font-bold text-brand-500 tracking-wide">KOSMA</Link>
        <div className="flex items-center gap-6">
           {viewMode === 'register' ? (
              <Link to="/login" className="text-gray-900 font-medium">Login</Link>
           ) : (
              <Link to="/signup" className="text-gray-900 font-medium">Sign Up</Link>
           )}
           <Link to="/signup" className="px-5 py-2 bg-gray-900 text-white rounded">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center relative px-4">
         {step === 'success' ? renderSuccess() : 
          step === 'forgot-password' ? renderForgotPassword() :
          viewMode === 'login' ? renderLogin() : 
          step === 'email' ? renderRegisterStep1() : 
          renderRegisterStep2()}
      </main>

      <footer className="border-t border-gray-100 py-10 px-8 md:px-16 mt-auto">
         <div className="flex justify-center gap-6 text-[10px] text-gray-400">
            <Link to="/login?reset=true" className="hover:text-brand-500 transition-colors">Passwort zurücksetzen</Link>
            <span>© 2023 KOSMA</span>
         </div>
      </footer>
    </div>
  );
};
