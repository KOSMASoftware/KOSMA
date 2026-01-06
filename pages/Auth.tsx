
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isAuthenticated, isRecovering } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success' | 'done'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  // Local state for checking session, only active in update mode
  const [checkingSession, setCheckingSession] = useState(mode === 'update-password');
  
  const isResetMode = searchParams.get('reset') === 'true';
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If Context already knows we are recovering, we can stop the spinner
  useEffect(() => {
    if (mode === 'update-password' && isRecovering) {
      setCheckingSession(false);
    }
  }, [isRecovering, mode]);

  useEffect(() => {
    if (isAuthenticated && mode !== 'update-password') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, mode, navigate]);

  useEffect(() => {
    if (mode === 'update-password') {
      const verifySession = async () => {
        // Start a hard timeout for the spinner
        const hardTimeout = setTimeout(() => {
          setCheckingSession(false);
          setError("Die automatische Verifizierung dauert zu lange. Falls Sie ein Passwort-Feld sehen, fahren Sie fort. Falls nicht, fordern Sie bitte einen neuen Link an.");
        }, 4500);

        try {
          // 1. Check if Supabase SDK already has the session
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            clearTimeout(hardTimeout);
            setCheckingSession(false);
            return;
          }

          // 2. Manual Brute Force Extraction with decoding
          const fullUrl = window.location.href;
          const getParam = (name: string) => {
            const match = fullUrl.match(new RegExp('[#&?]' + name + '=([^&]*)'));
            return match ? decodeURIComponent(match[1]) : null;
          };

          const accessToken = getParam('access_token');
          const refreshToken = getParam('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (!setSessionError && data.session) {
              clearTimeout(hardTimeout);
              setCheckingSession(false);
              return;
            }
          }

          // 3. Fallback: Wait for SDK background processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: { session: finalCheck } } = await supabase.auth.getSession();
          
          if (finalCheck) {
            clearTimeout(hardTimeout);
            setCheckingSession(false);
          }
          // Note: If no session after all this, the hardTimeout will handle the UI state
        } catch (err) {
          console.error("Verification error:", err);
          setCheckingSession(false);
        }
      };

      verifySession();
    }
  }, [mode]);

  const handleAction = async () => {
    if (localLoading) return;
    setError('');
    setLocalLoading(true);

    actionTimeoutRef.current = setTimeout(() => {
      setLocalLoading(false);
      setError("Anfrage-Timeout. Bitte versuchen Sie es erneut.");
    }, 15000);
    
    try {
      if (isResetMode) {
        if (!email) throw new Error("E-Mail Adresse erforderlich.");
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("Das Passwort muss mindestens 6 Zeichen lang sein.");
        if (password !== confirmPassword) throw new Error("Die Passwörter stimmen nicht überein.");
        await updatePassword(password);
        setStep('done');
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, name, password);
        setStep('success');
      }
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    } catch (err: any) {
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      setError(err.message || "Ein Fehler ist aufgetreten.");
      setLocalLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
        <div className="max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-brand-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">E-Mail gesendet</h2>
          <p className="text-gray-500 mb-8">Wir haben einen Link an <b>{email}</b> geschickt. Bitte prüfe auch deinen Spam-Ordner.</p>
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
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Passwort aktualisiert</h2>
          <p className="text-gray-500 mb-8">Du kannst dich jetzt mit deinem neuen Passwort anmelden.</p>
          <button onClick={() => navigate('/login')} className="w-full h-14 bg-brand-500 text-white rounded-xl font-bold shadow-xl shadow-brand-500/20">Zum Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand-500 italic tracking-tighter">KOSMA</Link>
          <h1 className="text-4xl font-extrabold mt-8 tracking-tight text-gray-900">
            {mode === 'update-password' ? 'Neues Passwort' : isResetMode ? 'Reset Link' : mode === 'login' ? 'Login' : 'Registrieren'}
          </h1>
          <p className="text-gray-500 mt-2">
            {mode === 'update-password' ? 'Wähle ein sicheres Passwort für deinen Account.' : isResetMode ? 'Wir senden dir einen Link per E-Mail.' : 'Schön, dass du da bist.'}
          </p>
        </div>

        <div className="space-y-6">
          {checkingSession ? (
            <div className="flex flex-col items-center py-16 gap-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
                <RefreshCw className="w-5 h-5 text-brand-200 absolute inset-0 m-auto animate-reverse-spin" />
              </div>
              <p className="text-sm font-medium text-gray-400">Verifiziere Token...</p>
            </div>
          ) : (
            <>
              {mode !== 'update-password' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Max Mustermann" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                </div>
              )}

              {mode === 'login' && !isResetMode && (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Passwort</label>
                    <button type="button" onClick={() => setSearchParams({ reset: 'true' })} className="text-[10px] font-bold text-brand-500 hover:underline uppercase tracking-widest">Vergessen?</button>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                </div>
              )}

              {mode === 'update-password' && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Neues Passwort</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 Zeichen" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Passwort bestätigen</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex gap-3 items-center animate-in shake-in-1">
                  <AlertTriangle className="w-5 h-5 shrink-0" /> 
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={handleAction} 
                disabled={localLoading} 
                className="w-full h-14 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                {localLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : isResetMode ? 'Link anfordern' : mode === 'update-password' ? 'Passwort speichern' : 'Weiter'}
              </button>
            </>
          )}
        </div>
        
        <div className="mt-8 text-center">
          {isResetMode ? (
            <button onClick={() => setSearchParams({})} className="text-sm font-bold text-gray-400 hover:text-brand-500">Abbrechen</button>
          ) : (
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-sm font-bold text-brand-500 hover:underline">
              {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Login'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
