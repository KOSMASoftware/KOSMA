
import React, { useState, useEffect } from 'react';
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

  // We show the form IMMEDIATELY for update-password. No more waiting for verification spinners.
  const isResetMode = searchParams.get('reset') === 'true';

  useEffect(() => {
    if (isAuthenticated && mode !== 'update-password') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, mode, navigate]);

  // Helper to grab tokens from the raw browser URL, ignoring what React thinks
  const extractTokensFromUrl = () => {
    const rawUrl = window.location.href;
    const access_token = rawUrl.match(/[#&]access_token=([^&]+)/)?.[1];
    const refresh_token = rawUrl.match(/[#&]refresh_token=([^&]+)/)?.[1];
    return { access_token, refresh_token };
  };

  const handleAction = async () => {
    if (localLoading) return;
    setError('');
    setLocalLoading(true);
    
    try {
      if (isResetMode) {
        if (!email) throw new Error("E-Mail Adresse erforderlich.");
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("Das Passwort muss mindestens 6 Zeichen lang sein.");
        if (password !== confirmPassword) throw new Error("Die Passwörter stimmen nicht überein.");

        // BRUTE FORCE: Try to set session one last time right before updating
        const { access_token, refresh_token } = extractTokensFromUrl();
        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token: decodeURIComponent(access_token),
            refresh_token: decodeURIComponent(refresh_token)
          });
        }

        // Now try the update
        await updatePassword(password);
        setStep('done');
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, name, password);
        setStep('success');
      }
    } catch (err: any) {
      console.error("Auth Action Error:", err);
      setError(err.message || "Ein Fehler ist aufgetreten.");
    } finally {
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
          <p className="text-gray-500 mb-8">Link an <b>{email}</b> geschickt.</p>
          <button onClick={() => { setStep('form'); setSearchParams({}); }} className="text-brand-500 font-bold hover:underline flex items-center gap-2 mx-auto">
             <ArrowLeft className="w-4 h-4" /> Zurück
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
          <h2 className="text-3xl font-bold mb-4">Erfolg!</h2>
          <p className="text-gray-500 mb-8">Dein Passwort wurde aktualisiert.</p>
          <button onClick={() => navigate('/login')} className="w-full h-14 bg-brand-500 text-white rounded-xl font-bold shadow-xl shadow-brand-500/20">Jetzt einloggen</button>
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
        </div>

        <div className="space-y-6">
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
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="p-4 bg-brand-50 border border-brand-100 text-brand-700 text-xs rounded-lg mb-2">
                    Geben Sie jetzt Ihr neues Passwort ein.
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Neues Passwort</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 Zeichen" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bestätigen</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex gap-3 items-center animate-in shake-in-1">
                  <AlertTriangle className="w-5 h-5 shrink-0" /> 
                  <span className="flex-1">{error}</span>
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
