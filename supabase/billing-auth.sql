-- Run this once in Supabase SQL Editor before enabling registration and Checkout.
-- Billing data is written only by the Exacta7 server and verified Stripe webhooks.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_updated_at_idx on public.subscriptions (user_id, updated_at desc);
create index if not exists subscriptions_customer_id_idx on public.subscriptions (stripe_customer_id);

create table if not exists public.billing_events (
  id bigint generated always as identity primary key,
  stripe_event_id text not null unique,
  event_type text not null,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;

-- Conditional policies make this script safe to run again without removing
-- anything from the project.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can read their own profile'
  ) then
    create policy "Users can read their own profile"
      on public.profiles for select to authenticated
      using ((select auth.uid()) = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'Users can read their own subscription'
  ) then
    create policy "Users can read their own subscription"
      on public.subscriptions for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;
