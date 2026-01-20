
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'missing_email' });

  // Environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  // Use Service Role Key for Admin API
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
  const elasticKey = process.env.ELASTIC_EMAIL_API_KEY;

  if (!supabaseUrl || !serviceKey || !elasticKey) {
    console.error('Missing configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or ELASTIC_EMAIL_API_KEY');
    return res.status(500).json({ error: 'server_configuration_error' });
  }

  try {
    // 1. Generate Recovery Link via Supabase Admin API
    // We hardcode the redirect_to to ensure it matches the Supabase allow-list exactly.
    const redirect_to = 'https://kosma-lake.vercel.app/update-password';

    console.log(`[Reset Password] Generating link for ${email} with redirect ${redirect_to}`);

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

    if (!generateResp.ok) {
      console.error('[Reset Password] Supabase generate_link failed:', generateData);
      return res.status(generateResp.status).json({ 
        error: generateData.msg || generateData.error_description || 'Failed to generate recovery link' 
      });
    }

    const { action_link } = generateData;

    if (!action_link) {
      console.error('[Reset Password] No action_link in response');
      return res.status(500).json({ error: 'upstream_error_no_link' });
    }

    // 2. Send Email via Elastic Email manually
    console.log('[Reset Password] Sending email via Elastic Email...');
    
    const formData = new FormData();
    formData.append('apikey', elasticKey);
    formData.append('subject', 'Reset your Password'); // Fallback subject if template doesn't override
    formData.append('from', 'register@kosma.io');
    formData.append('to', email);
    formData.append('template', 'SupaBase reset password');
    formData.append('merge_action_link', action_link); // Sets {{action_link}} in template
    formData.append('isTransactional', 'true');

    const emailResp = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      body: formData,
    });

    const emailResult = await emailResp.json();

    if (emailResult.success === false) {
      console.error('[Reset Password] Elastic Email failed:', emailResult.error);
      return res.status(500).json({ error: 'email_send_failed', details: emailResult.error });
    }

    console.log('[Reset Password] Email sent successfully.');
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('[Reset Password] Unexpected error:', error);
    return res.status(500).json({ error: error.message || 'internal_server_error' });
  }
}
