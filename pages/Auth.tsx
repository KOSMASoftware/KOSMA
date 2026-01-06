import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Check, X, Linkedin, Loader2, Mail, ArrowRight, Shield, User, AlertTriangle, UserX, GraduationCap, Briefcase } from 'lucide-react';

// --- COMPONENTS ---

// Decorative Dots Pattern
const DotPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-5 gap-2 opacity-20 ${className}`}>
    {[...Array(15)].map((_, i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-gray-400"></div>
    ))}
  </div>
);

// Password Requirement Item
const Requirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-gray-300 ml-1 mr-1" />}
    {text}
  </div>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const { login, signup, resendVerification, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // State for Registration Steps
  const [step, setStep] = useState<'email' | 'details' | 'success'>(mode === 'login' ? 'email' : 'email');
  const [viewMode, setViewMode] = useState<'login' | 'register'>(mode === 'login' ? 'login' : 'register');

  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Validation State
  const [emailError, setEmailError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  // Effect to sync prop mode with internal state
  useEffect(() => {
    setViewMode(mode === 'login' ? 'login' : 'register');
    if (mode === 'login') {
        setStep('email');
    }
    // Don't reset step if we are already in success mode to prevent flicker
    setEmailError('');
  }, [mode]);

  // Password Rules
  const pwdLength = password.length >= 8;
  const pwdUpper = /[A-Z]/.test(password);
  const pwdLower = /[a-z]/.test(password);
  const isPasswordValid = pwdLength && pwdUpper && pwdLower;

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
       // Login Flow - In a real app, you might check if email exists here first
       handleLogin();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    
    try {
      // This will trigger the email via Elastic Email inside AuthContext
      await signup(email, `${firstName} ${lastName}`);
      setStep('success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
       await login(email);
       navigate(email.includes('admin') ? '/admin' : '/dashboard');
    } catch (err) {
       // Mock error handling
       setEmailError("User not found or password incorrect.");
    }
  };

  const fillCredentials = (email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  const handleResendEmail = async () => {
    setResendStatus('sending');
    await resendVerification(email);
    setResendStatus('sent');
    setTimeout(() => setResendStatus('idle'), 3000);
  };

  // Simulate clicking the link in the email
  const handleSimulateVerification = async () => {
    setVerifying(true);
    // Simulate network delay for verification
    setTimeout(async () => {
        await login(email); // Auto-login after verification
        navigate('/dashboard');
    }, 1500);
  };

  // --- RENDERERS ---

  const renderLogin = () => (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Login</h1>
      <p className="text-gray-500 text-center mb-8">Welcome to KOSMA</p>

      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
            className={`w-full px-4 py-3 border ${emailError ? 'border-red-300 ring-red-100' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100'} rounded-lg focus:ring-4 outline-none transition-all`}
            placeholder="max@mustermann.de"
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

        {emailError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <X className="w-4 h-4" /> {emailError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-white border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
        </button>
      </form>

      {/* Quick Login for Prototype - EXPANDED */}
      <div className="mt-8 pt-6 border-t border-gray-100">
         <p className="text-xs text-gray-400 font-mono text-center mb-4">TEST PERSONAS (Click to fill)</p>
         <div className="grid grid-cols-3 gap-2">
            {/* Hans (Standard) */}
            <button 
              onClick={() => fillCredentials('customer@demo.com')}
              className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded flex flex-col items-center text-center transition-all group"
              title="Budget Plan, Active"
            >
              <User className="w-4 h-4 text-gray-400 group-hover:text-brand-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-700">Hans</span>
              <span className="text-[8px] text-gray-400">Budget</span>
            </button>

             {/* Sarah (Past Due) */}
             <button 
              onClick={() => fillCredentials('producer@film.de')}
              className="p-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded flex flex-col items-center text-center transition-all group"
              title="Production Plan, Past Due"
            >
              <AlertTriangle className="w-4 h-4 text-gray-400 group-hover:text-red-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-700">Sarah</span>
              <span className="text-[8px] text-gray-400">Past Due</span>
            </button>

            {/* Admin */}
            <button 
              onClick={() => fillCredentials('admin@demo.com')}
              className="p-2 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded flex flex-col items-center text-center transition-all group"
              title="System Administrator"
            >
              <Shield className="w-4 h-4 text-gray-400 group-hover:text-purple-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-700">Admin</span>
              <span className="text-[8px] text-gray-400">System</span>
            </button>

            {/* Max (Student) */}
            <button 
              onClick={() => fillCredentials('student@hff.de')}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded flex flex-col items-center text-center transition-all group"
              title="Free Plan, Student"
            >
              <GraduationCap className="w-4 h-4 text-gray-400 group-hover:text-gray-600 mb-1" />
              <span className="text-[10px] font-bold text-gray-700">Max</span>
              <span className="text-[8px] text-gray-400">Free</span>
            </button>

             {/* Julia (Churned) */}
             <button 
              onClick={() => fillCredentials('ex-customer@studio.com')}
              className="p-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded flex flex-col items-center text-center transition-all group"
              title="Canceled Subscription"
            >
              <UserX className="w-4 h-4 text-gray-400 group-hover:text-orange-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-700">Julia</span>
              <span className="text-[8px] text-gray-400">Churned</span>
            </button>

            {/* Tim (Trial) */}
            <button 
              onClick={() => fillCredentials('dropout@trial.com')}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded flex flex-col items-center text-center transition-all group"
              title="Trial Expired"
            >
              <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-gray-600 mb-1" />
              <span className="text-[10px] font-bold text-gray-700">Tim</span>
              <span className="text-[8px] text-gray-400">Trial</span>
            </button>
         </div>
      </div>

      <div className="mt-8 text-center space-y-4">
        <div className="text-sm">
           <button onClick={handleResendEmail} className="text-brand-500 hover:underline" disabled={!email || resendStatus !== 'idle'}>
             {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Email sent!' : 'Resend verification email'}
           </button>
        </div>

        <p className="text-sm text-gray-500">
          Not having a KOSMA account? <Link to="/signup" className="text-brand-500 underline hover:text-brand-600">Register now</Link>
        </p>
      </div>
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
             <Requirement met={pwdLength} text="8 characters minimum." />
             <Requirement met={pwdUpper} text="At least 1 uppercase letter." />
             <Requirement met={pwdLower} text="At least 1 lowercase letter." />
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

        <button
          type="submit"
          disabled={!isPasswordValid || !firstName || !lastName || isLoading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 text-center">
      {verifying ? (
        <div className="py-12">
           <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-gray-900">Verifying Email...</h2>
           <p className="text-gray-500">Confirming your account token.</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your inbox</h1>
          <p className="text-gray-500 mb-8">We sent a verification link to your email.</p>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-600 max-w-sm mx-auto mb-8 relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
               Simulation
             </div>
             <p className="mb-4">
               A verification link has been sent to:<br/>
               <span className="font-bold text-gray-900 text-lg block mt-1">{email}</span>
             </p>
             <p>
               In a real app, you would open your email client and click the link. 
               For this prototype, click below:
             </p>
             <button 
                onClick={handleSimulateVerification}
                className="mt-4 w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
             >
                Simulate: Click Link in Email <ArrowRight className="w-4 h-4" />
             </button>
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
      )}
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
         {/* Decorative Dots Left */}
         <div className="absolute left-8 md:left-24 top-1/2 -translate-y-1/2 hidden lg:block">
            <DotPattern />
         </div>

         {/* Decorative Dots Right */}
         <div className="absolute right-8 md:right-24 top-1/3 hidden lg:block">
             <DotPattern />
         </div>

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
         <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
            <div className="space-y-4">
               <h4 className="text-sm font-medium text-gray-900">Headstart Media</h4>
               <div className="w-24 h-8 bg-blue-900 text-white text-[8px] p-1 flex items-end justify-center leading-tight">
                 MEDIA EUROPE LOVES CINEMA
               </div>
               <Linkedin className="w-5 h-5 text-gray-400 hover:text-brand-500 cursor-pointer" />
            </div>

            <div className="grid grid-cols-3 gap-12 text-xs text-gray-500">
               <div className="space-y-2">
                  <h5 className="font-bold text-gray-900 uppercase">Product</h5>
                  <div className="flex flex-col gap-1">
                     <a href="#" className="hover:text-brand-500">Download</a>
                     <a href="#" className="hover:text-brand-500">Register</a>
                     <a href="#" className="hover:text-brand-500">Pricing</a>
                  </div>
               </div>
               <div className="space-y-2">
                  <h5 className="font-bold text-gray-900 uppercase">Support</h5>
                  <div className="flex flex-col gap-1">
                     <a href="#" className="hover:text-brand-500">Help</a>
                     <a href="#" className="hover:text-brand-500">Learning Campus</a>
                     <a href="#" className="hover:text-brand-500">Templates</a>
                     <a href="#" className="hover:text-brand-500">Request New Password</a>
                  </div>
               </div>
               <div className="space-y-2">
                  <h5 className="font-bold text-gray-900 uppercase">Language</h5>
                   <div className="flex flex-col gap-1">
                     <a href="#" className="hover:text-brand-500">English</a>
                     <a href="#" className="hover:text-brand-500">German</a>
                     <a href="#" className="hover:text-brand-500">French</a>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="flex flex-wrap gap-6 text-[10px] text-gray-400 mt-12 justify-end">
            <a href="#" className="hover:text-brand-500">Imprint</a>
            <a href="#" className="hover:text-brand-500">Privacy Statement</a>
            <a href="#" className="hover:text-brand-500">GTC</a>
            <a href="#" className="hover:text-brand-500">Cookie Settings</a>
            <a href="#" className="hover:text-brand-500">Contact</a>
            <span>© 2023</span>
         </div>
      </footer>
    </div>
  );
};