
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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

          // Search everywhere in the URL for tokens
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

          // Last resort: Wait 2 seconds for Supabase to auto-detect
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
        <div className="max-w-md w-full">
          <Mail className="w-16 h-16 text-brand-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Link versendet</h2>
          <p className="text-gray-500 mb-8">Überprüfen Sie Ihr Postfach.</p>
          <Link to="/login" className="text-brand-500 font-bold hover:underline">Zum Login</Link>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
        <div className="max-w-md w-full">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Fertig!</h2>
          <p className="text-gray-500 mb-8">Ihr Passwort wurde erfolgreich geändert.</p>
          <button onClick={() => navigate('/login')} className="w-full h-14 bg-brand-500 text-white rounded font-bold">Anmelden</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand-500 italic">KOSMA</Link>
          <h1 className="text-4xl font-bold mt-8">
            {mode === 'update-password' ? 'Neues Passwort' : isResetMode ? 'Reset' : 'Login'}
          </h1>
        </div>

        <div className="space-y-6">
          {checkingSession ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-sm text-gray-400">Verifiziere Link...</p>
            </div>
          ) : (
            <>
              {mode !== 'update-password' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:border-brand-500" />
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:border-brand-500" />
                </div>
              )}
              {mode !== 'update-password' && !isResetMode && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Passwort</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:border-brand-500" />
                </div>
              )}
              {mode === 'update-password' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Neues Passwort</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Bestätigen</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:border-brand-500" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <button onClick={handleAction} disabled={localLoading} className="w-full h-14 bg-brand-500 text-white rounded font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50">
                {localLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Weiter'}
              </button>
            </>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-bold text-brand-500">Abbrechen</Link>
        </div>
      </div>
    </div>
  );
};
