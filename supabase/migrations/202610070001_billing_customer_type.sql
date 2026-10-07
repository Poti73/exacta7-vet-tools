-- Apply before deploying the billing changes. No existing customer is classified
-- automatically: NULL means the buyer has not yet declared their billing identity.
begin;

alter table public.profiles
  add column if not exists customer_type text;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_customer_type_check'
  ) then
    alter table public.profiles add constraint profiles_customer_type_check
      check (customer_type in ('business', 'individual')) not valid;
  end if;
end $$;

alter table public.profiles validate constraint profiles_customer_type_check;
comment on column public.profiles.customer_type is
  'Declared billing identity, mirrored from Stripe Customer metadata after completed Checkout. NULL = unknown; never inferred from a tax ID or location.';

commit;
