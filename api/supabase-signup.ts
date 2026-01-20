
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit } from '../lib/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { email, password, full_name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });

  // 1. Security: Rate Limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  // Signup limits: usually per IP, ignoring email to prevent spam from one IP
  const limit = await checkRateLimit(ip, 'signup_generic', 'signup'); 

  if (!limit.allowed) {
    return res.status(429).json({ error: limit.error || 'Too many signup attempts. Please wait.' });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res.status(500).json({ error: 'missing_server_env' });

  const resp = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, data: { full_name } })
  });

  const data = await resp.json();
  if (!resp.ok) return res.status(resp.status).json(data);
  return res.status(200).json(data);
}
