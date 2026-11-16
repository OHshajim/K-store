-- Migration: Create auth_otps table for secure OTP-based password change and recovery
create table if not exists public.auth_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_code text not null,
  intent text not null default 'password_reset',
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Optimize OTP lookup queries
create index if not exists idx_auth_otps_lookup
  on public.auth_otps (email, intent, used, expires_at);
