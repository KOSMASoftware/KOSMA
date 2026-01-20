
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuration
const LOGIN_LIMIT = 5; // Attempts
const LOGIN_WINDOW = 60 * 15; // 15 Minutes in seconds

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Dedicated admin client
const adminClient = (supabaseUrl && serviceKey) 
  ? createClient(supabaseUrl, serviceKey) 
  : null;

interface RateLimitResult {
  allowed: boolean;
  error?: string;
}

/**
 * Checks rate limit atomically via Supabase RPC.
 * @param ip Client IP
 * @param identifier Target identifier (e.g. Email)
 * @param context Context string (e.g. 'login', 'reset')
 */
export async function checkRateLimit(ip: string, identifier: string = 'unknown', context: string): Promise<RateLimitResult> {
  if (!adminClient) {
    console.warn("Rate Limiting disabled: Missing Service Key");
    return { allowed: true };
  }

  try {
    // 1. Create a composite key hash to avoid storing raw emails/IPs in the rate limit table
    const rawKey = `${ip}|${identifier.toLowerCase().trim()}|${context}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // 2. Call Atomic RPC Function
    const { data, error } = await adminClient.rpc('attempt_rate_limit', {
      p_key: keyHash,
      p_window_seconds: LOGIN_WINDOW,
      p_limit: LOGIN_LIMIT
    });

    if (error) {
      console.error("Rate Limit RPC Error:", error);
      // Fail open to avoid blocking legitimate users on system error
      return { allowed: true };
    }

    if (data && data.blocked) {
      return { 
        allowed: false, 
        error: `Too many attempts. Please try again in 15 minutes.` 
      };
    }

    return { allowed: true };

  } catch (err) {
    console.error("Rate Limit Exception:", err);
    return { allowed: true };
  }
}
