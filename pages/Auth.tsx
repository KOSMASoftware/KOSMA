
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, AlertTriangle, Check, ArrowLeft, Terminal, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success' | 'done'>('form');
  const [email, setEmail] = useState('mail@joachimknaf.de');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>(["System bereit für Login-Test."]);

  const isResetMode = searchParams.get('reset') === 'true';

  const addLog = (m: string) => {
    const msg = `${new Date().toLocaleTimeString().split(' ')[0]}: ${m}`;
    console.log(`[AUTH-DEBUG] ${m}`);
    setDebugLog(prev => [...prev.slice(-10), msg]);
  };

  const withTimeout = (promise: Promise<any>, timeoutMs: number = 10000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: Keine Antwort vom Auth-Server.")), timeoutMs)
      )
    ]);
  };

  const handleAction = async () => {
    if (localLoading) return;
    setError('');
    setLocalLoading(true);
    addLog(`Versuche ${mode === 'login' ? 'Login' : mode}...`);

    try {
      if (isResetMode) {
        addLog("Sende Reset-Link...");
        await withTimeout(resetPassword(email));
        setStep('success');
      } else if (mode === 'update-password') {
        if (password !== confirmPassword) throw new Error("Passwörter nicht gleich.");
        const url = window.location.href;
        const access_token = url.split('access_token=')[1]?.split('&')[0];
        if (!access_token) throw new Error("Kein Token gefunden.");
        
        await withTimeout(supabase.auth.setSession({
          access_token: decodeURIComponent(access_token),
          refresh_token: decodeURIComponent(url.split('refresh_token=')[1]?.split('&')[0] || '')
        }));
        await withTimeout(supabase.auth.updateUser({ password }));
        setStep('done');
      } else if (mode === 'login') {
        addLog(`Authentifizierung für ${email}...`);
        
        const { data, error: loginErr } = await withTimeout(supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password: password.trim() 
        }));

        if (loginErr) {
          addLog(`LOGIN FEHLER: ${loginErr.message}`);
          throw loginErr;
        }

        addLog("Erfolgreich angemeldet. Lade Benutzerprofil...");
        
        if (data.user) {
          const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .single();

          if (profErr) {
            addLog("INFO: Kein Profil gefunden (wird automatisch erstellt).");
            // Wir leiten trotzdem weiter, da der Auth-Status "true" ist
            navigate('/dashboard');
          } else {
            addLog(`Profil geladen: ${profile.full_name} (${profile.role})`);
            navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
          }
        }
      } else {
        await withTimeout(signup(email, name, password));
        setStep('success');
      }
    } catch (err: any) {
      const msg = err.message || "Ein Fehler ist aufgetreten.";
      addLog(`FEHLER: ${msg}`);
      setError(msg);
      // Optional: alert(msg);
    } finally {
      setLocalLoading(false);
    }
  };

  if (step === 'success' || step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
        <div className="max-w-md w-full">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Erfolgreich!</h2>
          <p className="text-gray-500 mb-8">Vorgang abgeschlossen. Du kannst dich jetzt einloggen.</p>
          <button onClick={() => navigate('/login')} className="w-full py-4 bg-brand-500 text-white rounded-xl font-bold">Zum Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand-500 italic tracking-tighter uppercase">Kosma</Link>
          <h1 className="text-2xl font-bold mt-4 tracking-tight">
            {mode === 'login' ? 'Anmelden' : 'Sicherheit'}
          </h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">E-Mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Deine E-Mail" 
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition-colors" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Passwort</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Dein Passwort" 
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition-colors" 
            />
          </div>
          
          <button 
            onClick={handleAction} 
            disabled={localLoading}
            className="w-full h-14 bg-brand-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {localLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            {localLoading ? 'Verbinde...' : mode === 'login' ? 'Jetzt Einloggen' : 'Passwort Speichern'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Diagnostic Panel */}
        <div className="mt-12 p-5 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-brand-500 font-bold text-[10px] uppercase tracking-widest">
              <Terminal className="w-3 h-3" /> Console / Diagnose
            </div>
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
          </div>
          <div className="font-mono text-[10px] space-y-1.5 h-32 overflow-y-auto custom-scrollbar">
            {debugLog.map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-600 shrink-0">{i+1}.</span>
                <span className={l.includes('FEHLER') || l.includes('KRITISCH') ? 'text-red-400' : l.includes('erfolgreich') ? 'text-green-400' : 'text-gray-400'}>
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to={mode === 'login' ? '/signup' : '/login'} className="text-sm font-bold text-gray-400 hover:text-brand-500 transition-colors">
            {mode === 'login' ? 'Noch keinen Account? Registrieren' : 'Zurück zum Login'}
          </Link>
        </div>
      </div>
    </div>
  );
};
