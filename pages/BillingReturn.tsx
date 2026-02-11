
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { H5 } from '../components/ui/Typography';

export const BillingReturn: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const tokenStr = localStorage.getItem('kosma-auth-token');
        if (!tokenStr) throw new Error("No local session");

        const session = JSON.parse(tokenStr);
        
        // Verify via API
        const res = await fetch('/api/supabase-auth-user', {
            method: 'POST',
            body: JSON.stringify({ access_token: session.access_token }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error("Invalid session");

        // Valid session
        await refreshProfile();
        navigate('/dashboard/settings', { replace: true });
      } catch (e) {
        navigate('/login', { replace: true });
      }
    };
    checkSession();
  }, [navigate, refreshProfile]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <H5>Verifying Session...</H5>
      </div>
    </div>
  );
};
