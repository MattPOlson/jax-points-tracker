-- #50: Discord signups don't always populate full_name in user metadata.
-- Fall back through the names Discord does provide before defaulting to
-- the email address.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.members (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'preferred_username',
      new.email
    )
  );
  return new;
end;
$function$;
