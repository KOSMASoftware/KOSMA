
import { createClient } from '@supabase/supabase-js';

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use a dedicated admin client for rate limiting to bypass RLS
const adminClient = (supabaseUrl && serviceKey) 
  ? createClient(supabaseUrl, serviceKey) 
  : null;

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  remaining?: number;
}

export async function checkRateLimit(ip: string, identifier: string = 'anonymous', endpoint: string): Promise<RateLimitResult> {
  if (!adminClient) {
    console.warn("Rate Limiting disabled: Missing Service Key");
    return { allowed: true };
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60000).toISOString();

  try {
    // 1. Fetch existing record
    const { data: record, error } = await adminClient
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (error) {
      console.error("Rate Limit DB Error:", error);
      return { allowed: true }; // Fail open to not block users on DB error
    }

    // 2. Check Lockout
    if (record && record.locked_until) {
      if (new Date(record.locked_until) > now) {
        return { 
          allowed: false, 
          error: `Too many attempts. Please try again in ${Math.ceil((new Date(record.locked_until).getTime() - now.getTime()) / 60000)} minutes.` 
        };
      } else {
        // Lockout expired, reset
        await adminClient
          .from('rate_limits')
          .update({ attempts: 1, last_attempt: now.toISOString(), locked_until: null })
          .eq('id', record.id);
        return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
      }
    }

    // 3. Update or Insert
    if (record) {
      // Check if window expired
      if (new Date(record.last_attempt) < new Date(windowStart)) {
        // Reset window
        await adminClient
          .from('rate_limits')
          .update({ attempts: 1, last_attempt: now.toISOString() })
          .eq('id', record.id);
        return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
      } else {
        // Increment
        const newCount = record.attempts + 1;
        const updates: any = { attempts: newCount, last_attempt: now.toISOString() };
        
        if (newCount > MAX_ATTEMPTS) {
          updates.locked_until = new Date(now.getTime() + LOCKOUT_MINUTES * 60000).toISOString();
        }

        await adminClient.from('rate_limits').update(updates).eq('id', record.id);

        if (newCount > MAX_ATTEMPTS) {
          return { allowed: false, error: 'Too many attempts. Account locked temporarily.' };
        }
        return { allowed: true, remaining: MAX_ATTEMPTS - newCount };
      }
    } else {
      // New Record
      await adminClient.from('rate_limits').insert({
        ip,
        identifier,
        endpoint,
        attempts: 1,
        last_attempt: now.toISOString()
      });
      return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }

  } catch (err) {
    console.error("Rate Limit Exception:", err);
    return { allowed: true };
  }
}
