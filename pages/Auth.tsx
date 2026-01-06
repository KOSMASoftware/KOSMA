
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle, Check, ArrowLeft, Terminal } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const isResetMode = searchParams.get('reset') === 'true';

  const addLog = (msg: string) => {
    console.log(`[AUTH-DEBUG] ${msg}`);
    setDebugInfo(prev => [...prev.slice(-4), msg]);
  };

  useEffect(() => {
    if (isAuthenticated && mode !== 'update-password') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, mode, navigate]);

  // DIAGNOSE ON MOUNT
  useEffect(() => {
    if (mode === 'update-password') {
      const raw = window.location.href;
      const hasToken = raw.includes('access_token=');
      addLog(hasToken ? "✓ Token in URL gefunden" : "✗ Kein Token in URL");
      
      supabase.auth.getSession().then(({data}) => {
        addLog(data.session ? "✓ Session bereits aktiv" : "i Warte auf manuelle Verifizierung");
      });
    }
  }, [mode]);

  const handleAction = async () => {
    if (localLoading) return;
    setError('');
    setLocalLoading(true);
    addLog("Starte Aktion...");
    
    try {
      if (isResetMode) {
        if (!email) throw new Error("E-Mail Adresse erforderlich.");
        await resetPassword(email);
        setStep('success');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("Mindestens 6 Zeichen erforderlich.");
        if (password !== confirmPassword) throw new Error("Passwörter nicht identisch.");

        // 1. MANUELLE TOKEN EXTRAKTION (BRUTE FORCE)
        addLog("Extrahiere Tokens...");
        const rawUrl = window.location.href;
        // Wir suchen alles nach access_token= bis zum nächsten & oder Ende
        const access_token = rawUrl.split('access_token=')[1]?.split('&')[0]?.split('#')[0];
        const refresh_token = rawUrl.split('refresh_token=')[1]?.split('&')[0]?.split('#')[0];

        if (!access_token) {
          addLog("FEHLER: Kein Access Token in URL!");
          throw new Error("Der Passwort-Link scheint ungültig zu sein. Bitte fordern Sie einen neuen an.");
        }

        addLog("Setze Session manuell...");
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: decodeURIComponent(access_token),
          refresh_token: decodeURIComponent(refresh_token || '')
        });

        if (sessionError) {
          addLog(`Session-Fehler: ${sessionError.message}`);
          throw sessionError;
        }

        if (!sessionData.session) {
          addLog("Session konnte nicht erstellt werden.");
          throw new Error("Sitzung ungültig. Link abgelaufen?");
        }

        addLog("Aktualisiere Passwort...");
        const { error: updateError } = await supabase.auth.updateUser({ password });
        
        if (updateError) {
          addLog(`Update-Fehler: ${updateError.message}`);
          throw updateError;
        }

        addLog("Erfolg!");
        setStep('done');
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, name, password);
        setStep('success');
      }
    } catch (err: any) {
      const msg = err.message || "Unbekannter Fehler";
      console.error("CRITICAL AUTH ERROR:", err);
      setError(msg);
      addLog(`FEHLER: ${msg}`);
      // Fallback für den User, falls das UI nicht rendert
      if (mode === 'update-password') {
        alert("Fehler beim Speichern: " + msg);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center font-sans">
        <div className="max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6"><Mail className="w-10 h-10 text-brand-500" /></div>
          <h2 className="text-3xl font-bold mb-4 italic tracking-tight">E-Mail unterwegs</h2>
          <p className="text-gray-500 mb-8">Link an <b>{email}</b> geschickt.</p>
          <button onClick={() => { setStep('form'); setSearchParams({}); }} className="text-brand-500 font-bold hover:underline flex items-center gap-2 mx-auto">
             <ArrowLeft className="w-4 h-4" /> Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center font-sans">
        <div className="max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-green-500" /></div>
          <h2 className="text-3xl font-bold mb-4 italic tracking-tight">Passwort geändert!</h2>
          <p className="text-gray-500 mb-8">Du kannst dich jetzt mit deinem neuen Passwort einloggen.</p>
          <button onClick={() => navigate('/login')} className="w-full h-14 bg-brand-500 text-white rounded-xl font-bold shadow-xl shadow-brand-500/20">Zum Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand-500 italic tracking-tighter">KOSMA</Link>
          <h1 className="text-4xl font-extrabold mt-8 tracking-tight text-gray-900 leading-tight">
            {mode === 'update-password' ? 'Sicherheit\nerneuern' : isResetMode ? 'Reset Link' : mode === 'login' ? 'Willkommen\nzurück' : 'Konto\nerstellen'}
          </h1>
        </div>

        <div className="space-y-6">
              {mode !== 'update-password' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Max Mustermann" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" />
                </div>
              )}

              {mode === 'login' && !isResetMode && (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Passwort</label>
                    <button type="button" onClick={() => setSearchParams({ reset: 'true' })} className="text-[10px] font-bold text-brand-500 hover:underline uppercase tracking-widest">Vergessen?</button>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" />
                </div>
              )}

              {mode === 'update-password' && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Neues Passwort</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 Zeichen" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bestätigen</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium shadow-sm" />
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
                className="w-full h-14 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/30 disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98] text-sm"
              >
                {localLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : isResetMode ? 'Link anfordern' : mode === 'update-password' ? 'Passwort speichern' : 'Weiter'}
              </button>
        </div>

        {/* DEBUG PANEL - Nur sichtbar wenn mode == update-password */}
        {mode === 'update-password' && (
          <div className="mt-12 p-4 bg-gray-900 rounded-xl border border-gray-800 font-mono text-[10px]">
            <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-2">
              <Terminal className="w-3 h-3" />
              <span>SYSTEM DIAGNOSE</span>
            </div>
            {debugInfo.map((info, i) => (
              <div key={i} className="text-gray-300 mb-1 leading-relaxed">
                <span className="text-brand-500 mr-2">></span> {info}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          {isResetMode ? (
            <button onClick={() => setSearchParams({})} className="text-sm font-bold text-gray-400 hover:text-brand-500">Abbrechen</button>
          ) : (
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-sm font-bold text-gray-400 hover:text-brand-500 transition-colors">
              {mode === 'login' ? <>Noch kein Konto? <span className="text-brand-500">Registrieren</span></> : <>Bereits ein Konto? <span className="text-brand-500">Login</span></>}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
