begin;

-- Pre-MFA identity check for owner login/enrollment only. This function never
-- authorizes access to inbox/comments; existing AAL2 RLS remains unchanged.
create function public.is_portfolio_owner_identity()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from private.portfolio_owners where user_id = auth.uid());
$$;
revoke all on function public.is_portfolio_owner_identity() from public, anon, authenticated, service_role;
grant execute on function public.is_portfolio_owner_identity() to authenticated;

commit;
