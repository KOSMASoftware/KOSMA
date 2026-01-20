
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res.status(500).json({ error: 'missing_server_env' });

  // Auth Request
  const resp = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await resp.json();
  
  // Security: Anti-Enumeration (Keep this safety measure, it does not cause crashes)
  if (!resp.ok) {
    console.warn(`[Login Failed] ${email} - Upstream: ${data.error_description || data.error}`);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.status(200).json(data);
}
