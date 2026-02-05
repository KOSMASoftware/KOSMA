import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, Mail } from 'lucide-react';

// --- SUB-COMPONENTS ---

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Simple counts
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: activeCount } = await supabase.from('licenses').select('*', { count: 'exact', head: true }).eq('status', 'active');
      
      setStats({
        users: userCount || 0,
        active: activeCount || 0
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Users</div>
          <div className="text-5xl font-black text-gray-900">{stats.users}</div>
        </div>
        <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Active Licenses</div>
          <div className="text-5xl font-black text-green-600">{stats.active}</div>
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    // Join profiles and licenses logic
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: licenses } = await supabase.from('licenses').select('*');
    
    if (profiles && licenses) {
      const combined = profiles.map(p => {
        const l = licenses.find((lic: any) => lic.user_id === p.id);
        return { ...p, license: l };
      });
      setUsers(combined);
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Users & Licenses</h1>
        <button onClick={loadUsers} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><RefreshCw className="w-5 h-5 text-gray-500" /></button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input 
          className="w-full pl-12 p-3.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all" 
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="p-6">User</th>
                <th className="p-6">Plan</th>
                <th className="p-6">Status</th>
                <th className="p-6">Valid Until</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-brand-500"/></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400 italic">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-gray-900">{u.full_name || 'No Name'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                  </td>
                  <td className="p-6 font-medium text-gray-600">{u.license?.plan_tier || 'Free'}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.license?.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {u.license?.status || 'none'}
                    </span>
                  </td>
                  <td className="p-6 text-gray-500 font-mono text-xs">
                    {u.license?.valid_until ? new Date(u.license.valid_until).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MarketingDashboard: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.functions.invoke('marketing-backend', {
            body: { action: 'list_templates' }
        });
        
        if (error) {
            console.error("Templates fetch error:", error);
        }

        // Logic restored from error report
        const tplList =
          data?.data?.data ||
          data?.data ||
          data?.templates ||
          [];
        setTemplates(Array.isArray(tplList) ? tplList : []);
    } catch (err) {
        console.error("Templates fetch exception", err);
        setTemplates([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketing</h1>
      <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-gray-900">Email Templates</h3>
            <button onClick={fetchTemplates} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><RefreshCw className="w-5 h-5 text-gray-500" /></button>
        </div>
        {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : (
            <div className="grid grid-cols-1 gap-3">
                {templates.length === 0 ? <p className="text-gray-400 italic text-center py-8">No templates found.</p> : 
                 templates.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-700">{t.name || t.Name || 'Untitled Template'}</span>
                    </div>
                 ))
                }
            </div>
        )}
      </div>
    </div>
  );
};

const SystemHealth: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheckResult[]>([]);
  const [checking, setChecking] = useState(false);

  const runChecks = async () => {
    setChecking(true);
    const results = [];
    results.push(await liveSystemService.checkDatabaseConnection());
    results.push(await liveSystemService.checkAuthService());
    results.push(await liveSystemService.checkEdgeFunctionService('Stripe Integration', 'stripe'));
    setChecks(results);
    setChecking(false);
  };

  useEffect(() => { runChecks(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Health</h1>
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Service Status Monitor</span>
                <button onClick={runChecks} disabled={checking} className="p-2 hover:bg-white rounded-lg transition-colors">
                    {checking ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : <RefreshCw className="w-4 h-4 text-gray-500" />}
                </button>
            </div>
            <div className="divide-y divide-gray-100">
                {checks.map((check, i) => (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-5">
                            {check.status === 'operational' ? <CheckCircle className="w-6 h-6 text-green-500" /> : 
                             check.status === 'down' ? <XCircle className="w-6 h-6 text-red-500" /> : <AlertTriangle className="w-6 h-6 text-amber-500" />}
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{check.service}</p>
                                {check.details && <p className="text-sm text-gray-500 mt-1">{check.details}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${
                                check.status === 'operational' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>{check.status}</span>
                            <div className="text-xs text-gray-400 mt-2 font-mono">{check.latency}ms</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

const StripeDebug = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stripe Debug</h1>
        <div className="p-12 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-center">
            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Debug tools available in system logs.</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const AdminDashboard: React.FC = () => {
  return (
    <div className="pb-20">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="marketing" element={<MarketingDashboard />} />
        <Route path="system" element={<SystemHealth />} />
        <Route path="debug" element={<StripeDebug />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};
