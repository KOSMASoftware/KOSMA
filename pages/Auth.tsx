
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Check, Loader2, Mail, Linkedin, ArrowLeft, ArrowUpRight } from 'lucide-react';

const DotPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-5 gap-3 opacity-20 ${className}`}>
    {[...Array(15)].map((_, i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-gray-400" />
    ))}
  </div>
);

const AuthFooter = () => (
  <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-8 md:px-16 text-gray-500 font-sans">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div className="space-y-8">
        <div className="text-sm font-medium text-gray-400">Headstart Media</div>
        <div className="mt-8">
            <img src="https://kosma.io/wp-content/uploads/2022/10/media-logo.png" alt="Media Europe Loves Cinema" className="h-10 opacity-70 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        </div>
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Product</h4>
        <ul className="space-y-3 text-sm">
          <li><Link to="#" className="hover:text-brand-500 transition-colors">Download</Link></li>
          <li><Link to="/signup" className="hover:text-brand-500 transition-colors">Register</Link></li>
          <li><Link to="/" className="hover:text-brand-500 transition-colors">Pricing</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Support</h4>
        <ul className="space-y-3 text-sm">
          <li><Link to="#" className="hover:text-brand-500 transition-colors">Help</Link></li>
          <li><Link to="#" className="hover:text-brand-500 transition-colors">Learning Campus</Link></li>
          <li><Link to="#" className="hover:text-brand-500 transition-colors">Templates</Link></li>
          <li><Link to="/login?reset=true" className="hover:text-brand-500 transition-colors">Request New Password</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Language</h4>
        <ul className="space-y-3 text-sm">
          <li><button className="hover:text-brand-500 transition-colors">English</button></li>
          <li><button className="hover:text-brand-500 transition-colors">German</button></li>
          <li><button className="hover:text-brand-500 transition-colors">French</button></li>
        </ul>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-6">
          <a href="#" className="p-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
            <Linkedin className="w-3.5 h-3.5" />
          </a>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-[11px] font-medium text-gray-400">
        <Link to="#" className="hover:text-gray-900 transition-colors">Imprint</Link>
        <Link to="#" className="hover:text-gray-900 transition-colors">Privacy Statement</Link>
        <Link to="#" className="hover:text-gray-900 transition-colors">GTC</Link>
        <Link to="#" className="hover:text-gray-900 transition-colors">Cookie Settings</Link>
        <Link to="#" className="hover:text-gray-900 transition-colors">Contact</Link>
        <span className="text-gray-300">© 2023</span>
      </div>
    </div>
  </footer>
);

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  
  const isResetMode = searchParams.get('reset') === 'true';

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
        await resetPassword(email);
        setStep('success');
    } catch (err: any) {
        setError(err.message || "Email not found.");
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
    <div className="w-full max-w-md animate-in fade-in duration-1000 text-center">
        <h1 className="text-[52px] font-bold text-gray-900 mb-6 tracking-tight leading-tight">Reset Password</h1>
        <p className="text-gray-500 mb-12 text-lg">Enter your email address so we can send you a link to reset your password.</p>

        <form onSubmit={handleResetRequest} className="space-y-8">
            <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-gray-800"
                    placeholder="max@mustermann.de"
                    required
                />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 py-2 rounded">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-md transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
        </form>
    </div>
  );

  const renderUpdateView = () => (
    <div className="w-full max-w-md animate-in fade-in duration-1000 text-center">
        <h1 className="text-[52px] font-bold text-gray-900 mb-6 tracking-tight leading-tight">New Password</h1>
        <p className="text-gray-500 mb-12 text-lg">Choose a secure password for your KOSMA account.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-8">
            <div className="text-left space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-0 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-0 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 py-2 rounded">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-500 text-white hover:bg-brand-600 font-bold rounded-md transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set New Password'}
            </button>
        </form>
    </div>
  );

  const renderAuthView = () => (
    <div className="w-full max-w-md animate-in fade-in duration-1000 text-center">
        <h1 className="text-[52px] font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            {mode === 'login' ? 'Login' : 'Sign Up'}
        </h1>
        <p className="text-gray-500 mb-12 text-lg">
            {mode === 'login' ? 'Access your Real Database' : 'Start your production journey'}
        </p>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-6">
            <div className="text-left space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-md focus:border-brand-500 outline-none"
                        placeholder="name@company.com"
                        required
                    />
                </div>
                
                <div>
                    <div className="flex justify-between">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                        {mode === 'login' && (
                             <Link to="/login?reset=true" className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-3 hover:underline">Forgot Password?</Link>
                        )}
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-md focus:border-brand-500 outline-none"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {mode === 'signup' && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-md outline-none" required />
                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-md outline-none" required />
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 py-2 rounded mt-2">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
        </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="w-full max-w-lg animate-in zoom-in-95 duration-500 text-center">
          <div className="w-20 h-20 bg-blue-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm">
            <Mail className="w-10 h-10" />
          </div>
          <h1 className="text-[44px] font-bold text-gray-900 mb-6 leading-tight">Check your inbox</h1>
          <p className="text-gray-500 mb-12 text-lg">We sent a confirmation link to <strong>{email}</strong>. Please check your spam folder if you don't see it.</p>
          <Link to="/login" onClick={() => setStep('form')} className="text-brand-500 hover:underline font-bold text-[13px] uppercase tracking-widest">Back to Login</Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden font-sans">
      {/* Navbar matching mockup */}
      <nav className="flex justify-between items-center py-6 px-8 md:px-16 bg-white z-50">
        <div className="flex items-center gap-12">
            <Link to="/" className="text-[26px] font-black text-brand-500 tracking-tighter">KOSMA</Link>
            <div className="hidden lg:flex gap-10 text-[13px] font-bold text-gray-400">
                <Link to="/" className="hover:text-gray-900 transition-colors">Pricing</Link>
                <Link to="#" className="hover:text-gray-900 transition-colors">Learning Campus</Link>
                <Link to="#" className="hover:text-gray-900 transition-colors">Help</Link>
            </div>
        </div>
        <div className="flex items-center gap-8 text-[13px] font-bold">
           <Link to="#" className="text-brand-500 hover:underline">Download</Link>
           <Link to="/login" className="text-gray-400 hover:text-gray-900 transition-colors">Login</Link>
           <Link to="/signup" className="px-6 py-2.5 bg-gray-900 text-white rounded font-bold hover:bg-gray-800 transition-all">Sign Up</Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center relative px-4 py-24">
         {/* Dots from screenshot */}
         <div className="absolute top-1/2 left-20 -translate-y-1/2 hidden xl:block">
            <DotPattern />
            <DotPattern className="mt-8 ml-10" />
         </div>
         <div className="absolute top-1/2 right-20 -translate-y-1/2 hidden xl:block">
            <DotPattern />
            <DotPattern className="mt-8 mr-10 translate-x-12" />
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
