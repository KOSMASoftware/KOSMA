
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit } from './_utils/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'missing_email' });

  // 1. Security: Rate Limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const limit = await checkRateLimit(ip, email, 'reset_password');

  if (!limit.allowed) {
    return res.status(429).json({ error: limit.error || 'Too many reset attempts. Please wait.' });
  }

  // Environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
  const elasticKey = process.env.ELASTIC_EMAIL_API_KEY;

  if (!supabaseUrl || !serviceKey || !elasticKey) {
    console.error('Missing configuration');
    return res.status(500).json({ error: 'server_configuration_error' });
  }

  try {
    const redirect_to = 'https://kosma-lake.vercel.app/update-password';

    console.log(`[Reset Password] Generating link for ${email}`);

    // Generate Recovery Link via Supabase Admin API
    const generateResp = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: { 
        'apikey': serviceKey, 
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        type: "recovery", 
        email, 
        redirect_to 
      })
    });

    const generateData = await generateResp.json();

    // 2. Security: Anti-Enumeration
    // If Supabase returns error (e.g. User not found), we LOG it but return SUCCESS to the frontend.
    if (!generateResp.ok) {
      console.warn('[Reset Password] Supabase generate_link failed (likely invalid email):', generateData);
      
      // Artificial delay to mimic email sending time (Timing Attack mitigation)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return res.status(200).json({ success: true });
    }

    const { action_link } = generateData;

    if (!action_link) {
      console.error('[Reset Password] No action_link in response');
      return res.status(500).json({ error: 'upstream_error_no_link' });
    }

    // Send Email via Elastic Email manually
    const formData = new FormData();
    formData.append('apikey', elasticKey);
    formData.append('subject', 'Reset your Password');
    formData.append('from', 'register@kosma.io');
    formData.append('to', email);
    formData.append('template', 'SupaBase reset password');
    formData.append('merge_action_link', action_link);
    formData.append('isTransactional', 'true');

    const emailResp = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      body: formData,
    });

    const emailResult = await emailResp.json();

    if (emailResult.success === false) {
      console.error('[Reset Password] Elastic Email failed:', emailResult.error);
      return res.status(500).json({ error: 'email_send_failed' });
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('[Reset Password] Unexpected error:', error);
    // Generic error for unexpected crashes
    return res.status(500).json({ error: 'internal_server_error' });
  }
}
