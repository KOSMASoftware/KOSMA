import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Check, X, Loader2, Mail, Shield, User, Briefcase, Zap, GraduationCap, Clock, UserX, AlertTriangle, Database, Terminal } from 'lucide-react';

// --- COMPONENTS ---

const Requirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-gray-300 ml-1 mr-1" />}
    {text}
  </div>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const { login, signup, resendVerification, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'email' | 'details' | 'success'>(mode === 'login' ? 'email' : 'email');
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
    if (mode === 'login') setStep('email');
    setEmailError('');
    setAuthError('');
  }, [mode]);

  // Password Rules
  const pwdLength = password.length >= 6; 
  const isPasswordValid = pwdLength;

  // Handlers
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
      console.error(err);
      setAuthError(err.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    try {
       await login(email, password);
       navigate('/dashboard');
    } catch (err: any) {
       console.error("Login Error Full:", err);
       
       // Robust error message extraction
       let msg = "";
       if (typeof err === 'string') msg = err;
       else if (err?.message) msg = err.message;
       else msg = JSON.stringify(err);

       // Handle specific Supabase errors for better UX
       if (msg.includes("Email not confirmed")) {
           setAuthError("Email not verified. Please check your inbox or disable verification in Supabase Auth settings.");
       } else if (msg.includes("Invalid login credentials") || msg.includes("invalid_grant")) {
           setAuthError("Wrong email or password.");
       } else if (msg.includes("Database error querying schema") || msg.includes("schema cache") || msg.includes("PGRST")) {
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

  // Helper for Demo Buttons
  const fillCredentials = (demoEmail: string, demoPass: string) => {
      setEmail(demoEmail);
      setPassword(demoPass);
      setEmailError('');
      setAuthError('');
  };

  // --- RENDERERS ---

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
                    <p className="mb-2 text-xs leading-relaxed">
                        Your Supabase API cache is out of sync. Please run this command.
                    </p>
                    <div className="bg-white p-3 rounded border border-amber-200 font-mono text-xs select-all mb-3 text-gray-600 relative group">
                        NOTIFY pgrst, 'reload config';
                        <div className="absolute right-2 top-2 hidden group-hover:block text-[10px] text-gray-400">SQL</div>
                    </div>
                     <div className="mb-3 p-2 bg-blue-50 text-blue-800 text-[10px] rounded border border-blue-100">
                        <strong>Note:</strong> If the SQL Editor returns "Success. No rows returned", that means it <u>WORKED</u>! Come back here and click "Log In" again.
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            type="button" 
                            onClick={() => {
                                navigator.clipboard.writeText("NOTIFY pgrst, 'reload config';");
                                alert("Copied to clipboard! Paste this in your Supabase SQL Editor.");
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
                        >
                            <Terminal className="w-3 h-3" />
                            Copy SQL Command
                        </button>
                        <span className="text-xs text-amber-600/70">Run in Supabase SQL Editor</span>
                    </div>
                 </div>
            ) : (emailError || authError) && (
                <div className={`p-4 text-sm rounded-lg flex items-start gap-3 ${authError.includes('verified') ? 'bg-orange-50 text-orange-800' : 'bg-red-50 text-red-600'}`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Login Failed</span>
                        <span>{emailError || authError}</span>
                    </div>
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

        {/* --- FAST LOGIN BUTTONS (THE 6 WINDOWS) --- */}
        <div className="mt-8 pt-6">
             <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fast Login (Pre-fill Form)</span>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. Hans (Standard) */}
                <button
                    type="button"
                    onClick={() => fillCredentials('customer@demo.com', 'password123')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                >
                    <User className="w-8 h-8 text-brand-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 text-sm">Hans</span>
                        <span className="text-[10px] text-gray-500">Budget User</span>
                    </div>
                </button>

                {/* 2. Admin */}
                <button
                    type="button"
                    onClick={() => fillCredentials('admin@demo.com', 'password123')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                >
                    <Shield className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 text-sm">Admin</span>
                        <span className="text-[10px] text-gray-500">System Root</span>
                    </div>
                </button>

                {/* 3. Sarah (Pro) */}
                <button
                    type="button"
                    onClick={() => fillCredentials('producer@film.de', 'password123')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                >
                    <Briefcase className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 text-sm">Sarah</span>
                        <span className="text-[10px] text-gray-500">Production (Pro)</span>
                    </div>
                </button>

                {/* 4. Max (Student) */}
                 <button
                    type="button"
                    onClick={() => fillCredentials('student@hff.de', 'password123')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                >
                    <GraduationCap className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 text-sm">Max</span>
                        <span className="text-[10px] text-gray-500">Student (Free)</span>
                    </div>
                </button>

                 {/* 5. Tim (Trial Expired) */}
                 <button
                    type="button"
                    onClick={() => fillCredentials('dropout@trial.com', 'password123')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                >
                    <Clock className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 text-sm">Tim</span>
                        <span className="text-[10px] text-gray-500">Trial Expired</span>
                    </div>
                </button>

                 {/* 6. Julia (Churned) */}
                 <button
                    type="button"
                    onClick={() => fillCredentials('ex-customer@studio.com', 'password123')}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-gray-600 flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                >
                    <UserX className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 text-sm">Julia</span>
                        <span className="text-[10px] text-gray-500">Canceled</span>
                    </div>
                </button>
             </div>
             <p className="text-[10px] text-gray-400 text-center mt-4">
                These buttons pre-fill the form. You must have these users in your <strong>REAL Supabase Auth</strong>.
             </p>
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
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-white border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-lg transition-colors"
        >
          Continue
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-500 underline hover:text-brand-600">Log In</Link>
        </p>
      </div>
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
           <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 select-none">
             {email}
           </div>
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
          <div className="mt-2 space-y-1 pl-1">
             <Requirement met={pwdLength} text="6 characters minimum." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all"
                required
              />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all"
                required
              />
           </div>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" /> 
            <span>{authError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!isPasswordValid || !firstName || !lastName || isLoading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 text-center">
        <>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your inbox</h1>
          <p className="text-gray-500 mb-8">We sent a verification link to <strong>{email}</strong>.</p>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-sm text-blue-800 max-w-sm mx-auto mb-8">
             <p>
               Please click the link in the email to activate your account. 
             </p>
          </div>

          <div>
             <button 
              onClick={handleResendEmail} 
              className="text-gray-400 hover:text-gray-600 text-xs font-medium"
              disabled={resendStatus !== 'idle'}
            >
               {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Email sent!' : 'Did not receive the email? Check spam or resend.'}
             </button>
          </div>
        </>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-8 md:px-16">
        <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-brand-500 tracking-wide">KOSMA</Link>
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-900">
               <Link to="#" className="hover:text-brand-500">Pricing</Link>
               <Link to="#" className="hover:text-brand-500">Learning Campus</Link>
               <Link to="#" className="hover:text-brand-500">Help</Link>
            </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
           <Link to="#" className="text-brand-500 hover:underline hidden md:block">Download</Link>
           {viewMode === 'register' ? (
              <Link to="/login" className="text-gray-900 hover:text-brand-500 font-medium">Login</Link>
           ) : (
              <Link to="/signup" className="text-gray-900 hover:text-brand-500 font-medium">Sign Up</Link>
           )}
           <Link to="/signup" className={`px-5 py-2 rounded transition-colors ${viewMode === 'register' && step !== 'success' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              Sign Up
           </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative px-4">
         {/* View Logic */}
         {step === 'success' 
            ? renderSuccess() 
            : viewMode === 'login' 
                ? renderLogin() 
                : step === 'email' 
                    ? renderRegisterStep1() 
                    : renderRegisterStep2()
         }
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-8 md:px-16 mt-auto">
         <div className="text-center text-[10px] text-gray-400">
            <span>© 2023 KOSMA</span>
         </div>
      </footer>
    </div>
  );
};