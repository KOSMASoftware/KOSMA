import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'missing_email' });

  // Dynamically determine the redirect URL based on the Origin header (FIX 2)
  // Fallback to VERCEL_URL or production URL if header is missing
  const rawOrigin = req.headers.origin;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const origin = rawOrigin && rawOrigin.startsWith('http')
    ? rawOrigin
    : (vercelUrl || 'https://kosma-lake.vercel.app');

  const redirect_to = `${origin}/update-password`;
  console.log('[reset-password] origin=%s redirect_to=%s', origin, redirect_to);

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res.status(500).json({ error: 'missing_server_env' });

  const resp = await fetch(`${url}/auth/v1/recover`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, redirect_to })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) return res.status(resp.status).json(data);
  return res.status(200).json({ success: true });
}