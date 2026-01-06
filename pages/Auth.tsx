
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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
  const [isHydrating, setIsHydrating] = useState(mode === 'update-password');
  
  const isResetMode = searchParams.get('reset') === 'true';

  useEffect(() => {
    const checkSession = async () => {
      if (mode === 'update-password') {
        // First, wait a bit for AuthContext to do its thing
        await new Promise(r => setTimeout(r, 800));
        
        // Manual double check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && !isAuthenticated) {
          setError("Keine aktive Sitzung gefunden. Bitte verwende den Link aus der E-Mail oder fordere einen neuen an.");
        }
        setIsHydrating(false);
      }
    };
    checkSession();
  }, [mode, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isResetMode) {
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("Das Passwort muss mindestens 6 Zeichen lang sein.");
        if (password !== confirmPassword) throw new Error("Passwörter stimmen nicht überein.");
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
      setError(err.message || "Ein Fehler ist aufgetreten.");
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">E-Mail gesendet</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">Wir haben dir einen Link an <strong>{email}</strong> geschickt. Bitte folge den Anweisungen in der Nachricht.</p>
          <button onClick={() => setStep('form')} className="text-brand-600 font-bold hover:underline">Zurück zum Login</button>
        </div>
      </div>
    );
  }

  if (isHydrating && mode === 'update-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 font-bold">Verifiziere Link...</p>
          <p className="text-gray-400 text-sm mt-1">Einen Moment bitte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center text-4xl font-black text-brand-500 mb-10 tracking-tighter">KOSMA</Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-10">
          {mode === 'update-password' ? 'Neues Passwort setzen' : isResetMode ? 'Passwort vergessen?' : mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-10 shadow-xl rounded-2xl border border-gray-100">
          
          {mode === 'update-password' && error.includes('Sitzung') && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex gap-4 text-amber-800 text-sm leading-relaxed">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-500" />
                <div>
                    <p className="font-bold text-base mb-1">Link ungültig</p>
                    <p>Der Passwort-Reset-Link ist abgelaufen oder wurde bereits verwendet.</p>
                    <Link to="/login?reset=true" className="inline-block mt-3 font-bold underline decoration-2 underline-offset-4">Neuen Link anfordern</Link>
                </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Vollständiger Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg"
                />
              </div>
            )}

            {!mode.includes('update-password') && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">E-Mail-Adresse</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg"
                  placeholder="name@beispiel.de"
                />
              </div>
            )}

            {!isResetMode && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Passwort</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg"
                    placeholder="••••••••"
                  />
                </div>
                {mode === 'update-password' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Passwort bestätigen</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg"
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>
            )}

            {error && !error.includes('Sitzung') && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-100 font-bold">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || (mode === 'update-password' && error.includes('Sitzung'))}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/30 disabled:opacity-50 transition-all transform active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Bestätigen'}
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-col items-center gap-5 text-sm">
            {mode === 'login' && !isResetMode && (
              <>
                <Link to="/login?reset=true" className="font-bold text-brand-600 hover:underline underline-offset-4 decoration-2">Passwort vergessen?</Link>
                <div className="text-gray-500">Noch kein Konto? <Link to="/signup" className="text-brand-600 hover:underline font-black decoration-2">Jetzt registrieren</Link></div>
              </>
            )}
            {mode === 'signup' && (
              <div className="text-gray-500">Bereits ein Konto? <Link to="/login" className="text-brand-600 hover:underline font-black decoration-2">Einloggen</Link></div>
            )}
            {(isResetMode || mode === 'update-password') && (
              <Link to="/login" className="font-bold text-brand-600 hover:underline decoration-2 underline-offset-4">Zurück zum Login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
