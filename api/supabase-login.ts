
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit } from './_utils/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });

  // 1. Security: Rate Limiting (Atomic & Hashed)
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const limit = await checkRateLimit(ip, email, 'login');

  if (!limit.allowed) {
    return res.status(429).json({ error: limit.error || 'Too many requests' });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res.status(500).json({ error: 'missing_server_env' });

  // 2. Auth Request
  const resp = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await resp.json();
  
  // 3. Security: Anti-Enumeration
  // If request fails (User not found OR Wrong Password), return generic message
  if (!resp.ok) {
    // Log internal detail for debugging
    console.warn(`[Login Failed] ${email} - Upstream: ${data.error_description || data.error}`);
    // Simulate timing consistency could be added here, but generic message is step 1
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.status(200).json(data);
}
