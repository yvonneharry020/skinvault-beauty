-- Fix handle_new_user trigger: set explicit search_path so the function
-- can resolve public.profiles when security definer resets the search path.
-- Also use ON CONFLICT DO NOTHING to guard against duplicate email edge cases.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
SET search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Re-create the trigger in case it was dropped or never created
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
