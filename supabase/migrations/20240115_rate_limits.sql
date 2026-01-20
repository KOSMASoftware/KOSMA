
-- 1. Table for Rate Limiting
create table if not exists public.rate_limits (
  key text primary key, -- Hashed Identifier (IP + Email + Context)
  attempts int default 1,
  expires_at timestamptz not null
);

-- 2. Security: Lock it down completely. Only accessible via Service Role or internal functions.
alter table public.rate_limits enable row level security;

drop policy if exists "No public access" on public.rate_limits;
create policy "No public access" on public.rate_limits for all using (false);

-- 3. Atomic Function (Cleanup + Upsert + Check)
-- This prevents race conditions where parallel requests read the same old counter.
create or replace function public.attempt_rate_limit(
  p_key text,
  p_window_seconds int,
  p_limit int
)
returns json
language plpgsql
security definer -- Runs with admin privileges to bypass RLS internally
as $$
declare
  v_attempts int;
  v_blocked boolean;
begin
  -- A. Passive Cleanup (TTL): Delete expired records to keep table small
  delete from public.rate_limits where expires_at < now();

  -- B. Atomic Upsert
  insert into public.rate_limits (key, attempts, expires_at)
  values (p_key, 1, now() + (p_window_seconds || ' seconds')::interval)
  on conflict (key) do update
  set attempts = rate_limits.attempts + 1;

  -- C. Check Result
  select attempts into v_attempts from public.rate_limits where key = p_key;
  
  v_blocked := v_attempts > p_limit;

  return json_build_object(
    'blocked', v_blocked,
    'attempts', v_attempts
  );
end;
$$;
