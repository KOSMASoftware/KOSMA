
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { access_token, password } = req.body || {};
  if (!access_token || !password) return res.status(400).json({ error: 'missing_payload' });

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res.status(500).json({ error: 'missing_server_env' });

  const resp = await fetch(`${url}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: anonKey, Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) return res.status(resp.status).json(data);
  return res.status(200).json({ success: true });
}
