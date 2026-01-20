
-- Rate Limiting Table
-- Tracks failed attempts per IP and Identifier (Email)

create table if not exists public.rate_limits (
  id uuid default gen_random_uuid() primary key,
  ip text not null,
  identifier text, -- email or 'anonymous'
  endpoint text not null, -- e.g., 'login', 'signup'
  attempts int default 1,
  last_attempt timestamptz default now(),
  locked_until timestamptz
);

-- Index for fast lookups
create index if not exists idx_rate_limits_lookup 
on public.rate_limits (ip, identifier, endpoint);

-- RLS: Only Service Role can access this (Security)
alter table public.rate_limits enable row level security;

create policy "Service Role only"
  on public.rate_limits
  for all
  using ( false ) -- Blocks public access via API
  with check ( false );
