
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, Linkedin } from 'lucide-react';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isLoading: authLoading, isAuthenticated } = useAuth();
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

  // Safety Timeout: Prevent infinite spinner
  useEffect(() => {
    let timeout: any;
    if (localLoading) {
      timeout = setTimeout(() => {
        setLocalLoading(false);
        if (!isAuthenticated) {
          setError("Verbindung dauert zu lange. Bitte versuche es erneut.");
        }
      }, 8000); // 8 seconds safety net
    }
    return () => clearTimeout(timeout);
  }, [localLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setLocalLoading(false);
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    
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
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten.");
      setLocalLoading(false);
    }
  };

  const isActuallyLoading = authLoading || localLoading;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* HEADER - Exact match to landing/screenshot */}
      <nav className="bg-white py-6 px-6 md:px-12 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-black text-brand-500 tracking-tighter italic">KOSMA</Link>
          <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-600">
            <Link to="/" className="hover:text-brand-500 transition-colors">Pricing</Link>
            <Link to="#" className="hover:text-brand-500 transition-colors">Learning Campus</Link>
            <Link to="#" className="hover:text-brand-500 transition-colors">Help</Link>
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm font-semibold">
          <Link to="#" className="text-brand-500 hover:underline hidden md:block">Download</Link>
          <Link to="/login" className={`${mode === 'login' ? 'text-brand-500' : 'text-gray-900'} hover:text-brand-500`}>Login</Link>
          <Link to="/signup" className="bg-gray-900 text-white px-6 py-2.5 rounded-md hover:bg-gray-800 transition-all shadow-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 relative">
        {/* Decorative dots from screenshot */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
           <div className="grid grid-cols-5 gap-4">
             {[...Array(15)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-400 rounded-full"></div>)}
           </div>
        </div>
        <div className="absolute right-10 top-1/3 opacity-20 hidden lg:block">
           <div className="grid grid-cols-6 gap-4">
             {[...Array(12)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-400 rounded-full"></div>)}
           </div>
        </div>

        <div className="w-full max-w-md">
          {step === 'success' ? (
            <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border border-gray-50">
              <Mail className="w-16 h-16 text-brand-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Check your email</h2>
              <p className="text-gray-500 mb-8">We've sent a link to <strong>{email}</strong>.</p>
              <button onClick={() => setStep('form')} className="text-brand-500 font-bold hover:underline">Back to login</button>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-center text-gray-900 mb-4 tracking-tight">
                {mode === 'update-password' ? 'Reset' : isResetMode ? 'Reset' : mode === 'login' ? 'Login' : 'Sign Up'}
              </h1>
              <p className="text-center text-gray-500 mb-12 font-medium">
                {mode === 'update-password' ? 'Enter your new password below.' : isResetMode ? 'Enter your email to reset password.' : mode === 'login' ? 'Welcome to KOSMA' : 'Start your production journey.'}
              </p>

              <form className="space-y-8" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vollständiger Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-gray-900"
                    />
                  </div>
                )}

                {mode !== 'update-password' && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="max@mustermann.de"
                      className="block w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-gray-900"
                    />
                  </div>
                )}

                {!isResetMode && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="block w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-gray-900"
                      />
                    </div>
                    {mode === 'update-password' && (
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="block w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-gray-900"
                        />
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-in fade-in zoom-in-95">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isActuallyLoading}
                  className="w-full flex justify-center py-4 px-4 border border-brand-500 rounded-xl text-sm font-bold text-brand-500 hover:bg-brand-500 hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50"
                >
                  {isActuallyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Log In' : 'Continue')}
                </button>
              </form>

              <div className="mt-12 text-center space-y-4">
                {mode === 'login' && !isResetMode && (
                  <>
                    <Link to="/login?reset=true" className="block text-sm font-bold text-brand-500 hover:underline">Passwort vergessen?</Link>
                    <div className="text-sm text-gray-500">Not having a KOSMA account? <Link to="/signup" className="text-brand-500 hover:underline font-bold">Register now</Link></div>
                  </>
                )}
                {mode === 'signup' && (
                  <div className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-brand-500 hover:underline font-bold">Log in here</Link></div>
                )}
                {(isResetMode || mode === 'update-password') && (
                  <Link to="/login" className="block text-sm font-bold text-brand-500 hover:underline">Back to Login</Link>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* FOOTER - Exact match to screenshot */}
      <footer className="bg-white border-t border-gray-100 py-16 px-6 md:px-12 text-sm text-gray-500 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
          <div className="col-span-2">
            <h4 className="font-bold text-gray-900 mb-4">Headstart Media</h4>
            <div className="mt-8">
               <img src="https://kosma.io/wp-content/uploads/2021/11/logo_media.png" alt="MEDIA" className="h-10 grayscale opacity-70" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Product</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="hover:text-brand-500">Download</Link></li>
              <li><Link to="/signup" className="hover:text-brand-500">Register</Link></li>
              <li><Link to="#" className="hover:text-brand-500">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Support</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="hover:text-brand-500">Help</Link></li>
              <li><Link to="#" className="hover:text-brand-500">Learning Campus</Link></li>
              <li><Link to="#" className="hover:text-brand-500">Templates</Link></li>
              <li><Link to="/login?reset=true" className="hover:text-brand-500">Request New Password</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Language</h4>
            <ul className="space-y-4 font-medium">
              <li>English</li>
              <li>German</li>
              <li>French</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-500">
               <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-medium">
            <Link to="#" className="hover:text-brand-500">Imprint</Link>
            <Link to="#" className="hover:text-brand-500">Privacy Statement</Link>
            <Link to="#" className="hover:text-brand-500">GTC</Link>
            <Link to="#" className="hover:text-brand-500">Cookie Settings</Link>
            <Link to="#" className="hover:text-brand-500">Contact</Link>
            <span className="text-gray-300">© 2023</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
