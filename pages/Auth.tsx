
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success' | 'done'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(mode === 'update-password');
  
  const isResetMode = searchParams.get('reset') === 'true';
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAuthenticated && mode !== 'update-password') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, mode, navigate]);

  useEffect(() => {
    if (mode === 'update-password') {
      const initializeRecoverySession = async () => {
        try {
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          if (existingSession) {
            setCheckingSession(false);
            return;
          }

          const url = window.location.href;
          const accessToken = url.match(/[#&? ]access_token=([^&]+)/)?.[1];
          const refreshToken = url.match(/[#&? ]refresh_token=([^&]+)/)?.[1];

          if (accessToken && refreshToken) {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (!sessionError && data.session) {
              setCheckingSession(false);
              return;
            }
          }

          setTimeout(async () => {
            const { data: { session: finalCheck } } = await supabase.auth.getSession();
            if (!finalCheck) {
              setError("Sitzung konnte nicht geladen werden. Bitte nutzen Sie den Link aus der E-Mail erneut.");
            }
            setCheckingSession(false);
          }, 2000);

        } catch (err) {
          setError("Fehler beim Verarbeiten der Sitzung.");
          setCheckingSession(false);
        }
      };
      initializeRecoverySession();
    }
  }, [mode]);

  const handleAction = async () => {
    if (localLoading) return;
    setError('');
    setLocalLoading(true);

    timeoutRef.current = setTimeout(() => {
      setLocalLoading(false);
      setError("Anfrage hat zu lange gedauert.");
    }, 15000);
    
    try {
      if (isResetMode) {
        if (!email) throw new Error("E-Mail Adresse erforderlich.");
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("Mindestens 6 Zeichen erforderlich.");
        if (password !== confirmPassword) throw new Error("Passwörter stimmen nicht überein.");
        await updatePassword(password);
        setStep('done');
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, name, password);
        setStep('success');
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setError(err.message || "Fehler aufgetreten.");
      setLocalLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
        <div className="max-w-md w-full animate-in fade-in zoom-in-95">
          <Mail className="w-16 h-16 text-brand-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">E-Mail gesendet</h2>
          <p className="text-gray-500 mb-8">Wir haben einen Link an <strong>{email}</strong> geschickt.</p>
          <button onClick={() => { setStep('form'); setSearchParams({}); }} className="text-brand-500 font-bold hover:underline flex items-center gap-2 mx-auto">
             <ArrowLeft className="w-4 h-4" /> Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
        <div className="max-w-md w-full animate-in fade-in zoom-in-95">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Passwort geändert!</h2>
          <p className="text-gray-500 mb-8">Sie können sich jetzt mit Ihrem neuen Passwort anmelden.</p>
          <button onClick={() => navigate('/login')} className="w-full h-14 bg-brand-500 text-white rounded-lg font-bold">Jetzt Anmelden</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand-500 italic">KOSMA</Link>
          <h1 className="text-4xl font-bold mt-8 tracking-tight">
            {mode === 'update-password' ? 'Passwort ändern' : isResetMode ? 'Passwort vergessen?' : mode === 'login' ? 'Login' : 'Sign Up'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isResetMode ? 'Wir senden Ihnen einen Link zum Zurücksetzen.' : mode === 'update-password' ? 'Wählen Sie ein sicheres Passwort.' : 'Geben Sie Ihre Zugangsdaten ein.'}
          </p>
        </div>

        <div className="space-y-6">
          {checkingSession ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-sm text-gray-400">Sitzung wird verifiziert...</p>
            </div>
          ) : (
            <>
              {mode !== 'update-password' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" className="w-full px-5 py-4 border border-gray-200 rounded-lg outline-none focus:border-brand-500 transition-colors" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 border border-gray-200 rounded-lg outline-none focus:border-brand-500 transition-colors" />
                </div>
              )}

              {mode === 'login' && !isResetMode && (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Passwort</label>
                    <button 
                      type="button"
                      onClick={() => setSearchParams({ reset: 'true' })}
                      className="text-[10px] font-black text-brand-500 hover:underline uppercase tracking-widest"
                    >
                      Passwort vergessen?
                    </button>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-5 py-4 border border-gray-200 rounded-lg outline-none focus:border-brand-500 transition-colors" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Passwort wählen</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mind. 6 Zeichen" className="w-full px-5 py-4 border border-gray-200 rounded-lg outline-none focus:border-brand-500 transition-colors" />
                </div>
              )}

              {mode === 'update-password' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Neues Passwort</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-5 py-4 border border-gray-200 rounded-lg outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bestätigen</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-5 py-4 border border-gray-200 rounded-lg outline-none focus:border-brand-500 transition-colors" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex gap-3 items-start animate-in shake-in-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> 
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={handleAction} 
                disabled={localLoading} 
                className="w-full h-14 bg-brand-500 text-white rounded-lg font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                {localLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : isResetMode ? 'Link anfordern' : 'Weiter'}
              </button>
            </>
          )}
        </div>
        
        <div className="mt-8 text-center">
          {isResetMode ? (
            <button onClick={() => setSearchParams({})} className="text-sm font-bold text-gray-400 hover:text-brand-500">Abbrechen</button>
          ) : (
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-sm font-bold text-brand-500">
              {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Login'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
