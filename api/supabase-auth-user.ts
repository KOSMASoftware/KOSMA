import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { access_token } = req.body || {};
  if (!access_token) return res.status(401).json({ error: 'missing_access_token' });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return res.status(500).json({ error: 'missing_server_env' });

  const resp = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${access_token}` }
  });

  const data = await resp.json();
  if (!resp.ok) return res.status(resp.status).json(data);
  return res.status(200).json({ user: data });
}