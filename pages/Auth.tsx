
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Check, Loader2, Mail, Shield, User, Zap, AlertTriangle, Database, Linkedin, Globe, ArrowLeft, KeyRound } from 'lucide-react';

const DotPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-5 gap-3 opacity-20 ${className}`}>
    {[...Array(15)].map((_, i) => (
      <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-400" />
    ))}
  </div>
);

const AuthFooter = () => (
  <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-8 md:px-16 text-gray-600">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div className="space-y-6">
        <div className="text-sm font-medium text-gray-500">Headstart Media</div>
        <div className="mt-8">
            <img src="https://kosma.io/wp-content/uploads/2022/10/media-logo.png" alt="Media Europe Loves Cinema" className="h-10 opacity-80 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        </div>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Product</h4>
        <ul className="space-y-3 text-sm">
          <li><Link to="#" className="hover:text-brand-500">Download</Link></li>
          <li><Link to="/signup" className="hover:text-brand-500">Register</Link></li>
          <li><Link to="/" className="hover:text-brand-500">Pricing</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Support</h4>
        <ul className="space-y-3 text-sm">
          <li><Link to="#" className="hover:text-brand-500">Help</Link></li>
          <li><Link to="#" className="hover:text-brand-500">Learning Campus</Link></li>
          <li><Link to="#" className="hover:text-brand-500">Templates</Link></li>
          <li><Link to="/login?reset=true" className="hover:text-brand-500">Request New Password</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Language</h4>
        <ul className="space-y-3 text-sm">
          <li><button className="hover:text-brand-500">English</button></li>
          <li><button className="hover:text-brand-500">German</button></li>
          <li><button className="hover:text-brand-500">French</button></li>
        </ul>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-6">
          <a href="#" className="p-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-[11px] font-medium text-gray-400">
        <Link to="#" className="hover:text-gray-900">Imprint</Link>
        <Link to="#" className="hover:text-gray-900">Privacy Statement</Link>
        <Link to="#" className="hover:text-gray-900">GTC</Link>
        <Link to="#" className="hover:text-gray-900">Cookie Settings</Link>
        <Link to="#" className="hover:text-gray-900">Contact</Link>
        <span>© 2023</span>
      </div>
    </div>
  </footer>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success'>( 'form');
  const [viewMode, setViewMode] = useState(mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  
  useEffect(() => {
    setViewMode(mode);
    setIsResetMode(searchParams.get('reset') === 'true' || mode === 'update-password');
    setError('');
  }, [mode, searchParams]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
    }
    try {
        await resetPassword(email);
        setStep('success');
    } catch (err: any) {
        setError(err.message || "Failed to send reset link.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }
    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }
    try {
        await updatePassword(password);
        navigate('/dashboard');
    } catch (err: any) {
        setError(err.message || "Failed to update password.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
       await login(email, password);
       navigate('/dashboard');
    } catch (err: any) {
       setError("Wrong email or password.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await signup(email, `${firstName} ${lastName}`, password);
        setStep('success');
    } catch (err: any) {
        setError(err.message || "Registration failed");
    }
  };

  const renderResetView = () => (
    <div className="w-full max-w-md animate-in fade-in duration-700 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Reset Password</h1>
        <p className="text-gray-500 mb-12 text-lg">Enter your email address so we can send you a link to reset your password.</p>

        <form onSubmit={handleResetRequest} className="space-y-8">
            <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                    placeholder="max@mustermann.de"
                    required
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-white border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-md transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
        </form>
    </div>
  );

  const renderUpdateView = () => (
    <div className="w-full max-w-md animate-in fade-in duration-700 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Set New Password</h1>
        <p className="text-gray-500 mb-12 text-lg">Choose a secure password for your KOSMA account.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="text-left space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-0 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-0 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-500 text-white hover:bg-brand-600 font-bold rounded-md transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
        </form>
    </div>
  );

  const renderAuthView = () => (
    <div className="w-full max-w-md animate-in fade-in duration-700 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            {viewMode === 'login' ? 'Login' : 'Sign Up'}
        </h1>
        <p className="text-gray-500 mb-12 text-lg">
            {viewMode === 'login' ? 'Access your Real Database' : 'Start your production journey'}
        </p>

        <form onSubmit={viewMode === 'login' ? handleLogin : handleSignup} className="space-y-6">
            <div className="text-left space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-brand-500 outline-none"
                        placeholder="name@company.com"
                        required
                    />
                </div>
                
                <div>
                    <div className="flex justify-between">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        {viewMode === 'login' && <button type="button" onClick={() => setIsResetMode(true)} className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2 hover:underline">Forgot?</button>}
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-brand-500 outline-none"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {viewMode === 'signup' && (
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none" required />
                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none" required />
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-500 text-white font-bold rounded-md hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : viewMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
        </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="w-full max-w-lg animate-in zoom-in-95 duration-500 text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Mail className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Check your inbox</h1>
          <p className="text-gray-600 mb-12 text-lg">We sent a confirmation link to <strong>{email}</strong>. Please check your spam folder if you don't see it.</p>
          <button onClick={() => { setStep('form'); setIsResetMode(false); }} className="text-brand-500 hover:underline font-bold text-sm uppercase tracking-widest">Back to Login</button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-8 md:px-16 border-b border-gray-50">
        <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-black text-brand-500 tracking-tighter">KOSMA</Link>
            <div className="hidden lg:flex gap-8 text-[13px] font-bold text-gray-500">
                <Link to="/" className="hover:text-brand-500">Pricing</Link>
                <Link to="#" className="hover:text-brand-500">Learning Campus</Link>
                <Link to="#" className="hover:text-brand-500">Help</Link>
            </div>
        </div>
        <div className="flex items-center gap-8 text-[13px] font-bold">
           <Link to="#" className="text-brand-500 hover:underline">Download</Link>
           <Link to="/login" className="text-gray-900 hover:text-brand-500">Login</Link>
           <Link to="/signup" className="px-5 py-2.5 bg-gray-900 text-white rounded font-bold hover:bg-gray-800 transition-all">Sign Up</Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center relative px-4 py-20">
         {/* Decorative Patterns */}
         <div className="absolute top-1/2 left-16 -translate-y-1/2 hidden xl:block">
            <DotPattern className="rotate-90" />
            <DotPattern className="mt-8 ml-12" />
         </div>
         <div className="absolute top-1/2 right-16 -translate-y-1/2 hidden xl:block">
            <DotPattern />
            <DotPattern className="mt-8 mr-12 translate-x-12" />
         </div>

         <div className="z-10 w-full flex justify-center">
            {step === 'success' ? renderSuccess() : 
             mode === 'update-password' ? renderUpdateView() :
             isResetMode ? renderResetView() : 
             renderAuthView()}
         </div>
      </main>

      <AuthFooter />
    </div>
  );
};
