
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, Check, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' | 'update-password' }> = ({ mode }) => {
  const { login, signup, resetPassword, updatePassword, isRecovering } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('mail@joachimknaf.de');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isResetRequest = searchParams.get('reset') === 'true';

  // Debug check for session availability in update-password mode
  useEffect(() => {
    if (mode === 'update-password') {
      console.log("AuthPage: Update Password Mode active. isRecovering:", isRecovering);
    }
  }, [mode, isRecovering]);

  const handleAction = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      if (mode === 'update-password') {
        await updatePassword(password);
        setStep('success');
        return;
      } 
      
      if (isResetRequest) {
        await resetPassword(email);
        setStep('success');
        return;
      } 
      
      if (mode === 'login') {
        await login(email, password);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
        }
        return;
      } 
      
      if (mode === 'signup') {
        await signup(email, 'Joachim Knaf', password);
        setStep('success');
        return;
      }
    } catch (err: any) {
      console.error("Auth action error:", err);
      setError(err.message || "Ein Fehler ist aufgetreten.");
    } finally {
      // WICHTIG: Dies läuft immer, auch wenn oben 'return' aufgerufen wurde.
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            {mode === 'update-password' ? 'Passwort geändert' : 'E-Mail gesendet'}
          </h2>
          
          <p className="text-gray-500 mb-8">
            {mode === 'update-password' 
              ? 'Dein Passwort wurde erfolgreich neu gesetzt.' 
              : <>Wir haben eine E-Mail an <strong>{email}</strong> geschickt. Bitte folge den Anweisungen in der Nachricht.</>
            }
          </p>
          
          <button 
            onClick={() => { 
              if (mode === 'update-password') {
                // HARD REDIRECT: Wichtig, um den /update-password Pfad komplett zu verlassen
                // und sicherzustellen, dass AuthContext nicht mehr denkt, wir wären im Recovery Flow.
                window.location.replace('/#/login');
              } else {
                setStep('form'); 
                navigate('/login'); 
              }
            }} 
            className="text-brand-500 font-bold hover:underline"
          >
            {mode === 'update-password' ? 'Zum Login' : 'Zurück zum Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <span className="text-4xl font-black text-brand-500 italic uppercase tracking-tighter">KOSMA</span>
          <h1 className="text-xl font-bold text-gray-900 mt-2">
            {mode === 'update-password' ? 'Neues Passwort festlegen' : isResetRequest ? 'Passwort zurücksetzen' : 'Anmelden'}
          </h1>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-start gap-2 animate-in fade-in zoom-in-95">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode !== 'update-password' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">E-Mail Adresse</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="mail@beispiel.de" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
              />
            </div>
          )}

          {!isResetRequest && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                {mode === 'update-password' ? 'Neues Passwort' : 'Passwort'}
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" 
              />
            </div>
          )}
          
          <button 
            onClick={handleAction} 
            disabled={loading}
            className="w-full h-14 bg-brand-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : mode === 'update-password' ? <KeyRound className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? 'Verarbeite...' : mode === 'update-password' ? 'Passwort speichern' : isResetRequest ? 'Link senden' : 'Einloggen'}
          </button>

          {mode === 'login' && !isResetRequest && (
            <div className="text-center mt-6">
              <Link 
                to="/login?reset=true" 
                className="text-xs font-bold text-gray-400 hover:text-brand-500 transition-colors flex items-center justify-center gap-1"
              >
                Passwort vergessen?
              </Link>
            </div>
          )}

          {(isResetRequest || mode === 'signup') && (
            <div className="text-center mt-6">
              <Link to="/login" className="text-xs font-bold text-brand-500 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Zurück zum Login
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-gray-400 font-medium">
        © 2023 KOSMA Production Management. Alle Rechte vorbehalten.
      </p>
    </div>
  );
};
