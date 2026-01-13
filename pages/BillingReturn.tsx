import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export const BillingReturn: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }
      // Aktualisiere Profil/Lizenzdaten im Context
      await refreshProfile();
      // Zurück zu Settings
      navigate('/dashboard/settings', { replace: true });
    };
    checkSession();
  }, [navigate, refreshProfile]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verifying Session...</p>
      </div>
    </div>
  );
};