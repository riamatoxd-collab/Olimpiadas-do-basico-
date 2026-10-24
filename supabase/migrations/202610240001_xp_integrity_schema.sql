-- Venture XP integrity foundation
-- Safe to deploy alongside the legacy app: this migration does not edit legacy localStorage XP.
-- XP is only changed by the service-role-only submit_xp_answer RPC, called by authenticated Edge Functions.

create table public.xp_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  legacy_user_key text unique,
  display_name text not null default 'Jogador',
  xp bigint not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.xp_profiles enable row level security;
revoke all on table public.xp_profiles from anon, authenticated;
grant select on table public.xp_profiles to authenticated;
create policy xp_profiles_select_self
  on public.xp_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create table public.xp_question_bank (
  id integer primary key,
  level text not null check (level in ('Básico', 'Intermediário', 'Avançado')),
  question text not null,
  correct_answer text not null,
  wrong_answers text[] not null check (cardinality(wrong_answers) = 3),
  enabled boolean not null default true
);
alter table public.xp_question_bank enable row level security;
revoke all on table public.xp_question_bank from anon, authenticated;

create table public.xp_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id integer not null references public.xp_question_bank(id),
  question_snapshot text not null,
  level_snapshot text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_option_id text not null check (correct_option_id in ('a', 'b', 'c', 'd')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  answered_at timestamptz,
  is_correct boolean,
  attempts smallint not null default 0 check (attempts between 0 and 1),
  reward_xp integer not null default 0 check (reward_xp >= 0)
);
create index xp_challenges_user_created_idx on public.xp_challenges(user_id, created_at desc);
alter table public.xp_challenges enable row level security;
revoke all on table public.xp_challenges from anon, authenticated;

create table public.xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  reward_code text not null,
  base_xp integer not null check (base_xp >= 0),
  multiplier smallint not null check (multiplier in (1, 2)),
  awarded_xp integer not null check (awarded_xp >= 0),
  challenge_id uuid unique references public.xp_challenges(id),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index xp_ledger_user_created_idx on public.xp_ledger(user_id, created_at desc);
alter table public.xp_ledger enable row level security;
revoke all on table public.xp_ledger from anon, authenticated;

create table public.xp_reward_rules (
  reward_code text primary key,
  base_xp integer not null check (base_xp >= 0),
  daily_limit integer not null check (daily_limit > 0),
  enabled boolean not null default true
);
alter table public.xp_reward_rules enable row level security;
revoke all on table public.xp_reward_rules from anon, authenticated;
insert into public.xp_reward_rules(reward_code, base_xp, daily_limit, enabled)
values ('quiz_correct', 25, 40, true)
on conflict (reward_code) do nothing;

create table public.xp_settings (
  id boolean primary key default true check (id),
  multiplier smallint not null default 1 check (multiplier in (1, 2)),
  updated_at timestamptz not null default now()
);
alter table public.xp_settings enable row level security;
revoke all on table public.xp_settings from anon, authenticated;
insert into public.xp_settings(id, multiplier) values (true, 1)
on conflict (id) do nothing;

grant select, insert, update, delete on table
  public.xp_profiles, public.xp_question_bank, public.xp_challenges,
  public.xp_ledger, public.xp_reward_rules, public.xp_settings
to service_role;

create or replace function public.create_xp_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_display_name text;
begin
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Jogador'
  );
  insert into public.xp_profiles(user_id, display_name, xp)
  values (new.id, v_display_name, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_xp_profile_for_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_xp_profile
  after insert on auth.users
  for each row execute function public.create_xp_profile_for_auth_user();

create or replace function public.issue_xp_challenge(p_user_id uuid)
returns table (
  challenge_id uuid,
  question_id integer,
  level text,
  question text,
  options jsonb,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_question_id integer;
  v_level text;
  v_question text;
  v_correct_answer text;
  v_wrong_answers text[];
  v_options jsonb;
  v_correct_option_id text;
  v_challenge_id uuid;
  v_expires_at timestamptz;
  v_issued_today integer;
  v_last_issued timestamptz;
begin
  if p_user_id is null then
    raise exception 'unauthorized';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  if not exists (select 1 from public.xp_profiles p where p.user_id = p_user_id) then
    raise exception 'profile_not_found';
  end if;

  select count(*), max(c.created_at)
    into v_issued_today, v_last_issued
  from public.xp_challenges c
  where c.user_id = p_user_id
    and c.created_at >= date_trunc('day', now());

  if v_issued_today >= 40 then
    raise exception 'daily_challenge_limit';
  end if;
  if v_last_issued is not null and v_last_issued > now() - interval '2 seconds' then
    raise exception 'challenge_rate_limited';
  end if;

  update public.xp_challenges c
     set expires_at = least(c.expires_at, now())
   where c.user_id = p_user_id
     and c.answered_at is null
     and c.expires_at > now();

  select q.id, q.level, q.question, q.correct_answer, q.wrong_answers
    into v_question_id, v_level, v_question, v_correct_answer, v_wrong_answers
  from public.xp_question_bank q
  where q.enabled
  order by random()
  limit 1;

  if not found then
    raise exception 'question_bank_empty';
  end if;

  select
    jsonb_agg(jsonb_build_object('id', chr(96 + shuffled.ord), 'text', shuffled.choice) order by shuffled.ord),
    max(chr(96 + shuffled.ord)) filter (where shuffled.is_correct)
  into v_options, v_correct_option_id
  from (
    select choice,
           row_number() over (order by random())::integer as ord,
           choice = v_correct_answer as is_correct
    from unnest(array[v_correct_answer] || v_wrong_answers) as choices(choice)
  ) as shuffled;

  v_expires_at := now() + interval '5 minutes';

  insert into public.xp_challenges(
    user_id, question_id, question_snapshot, level_snapshot,
    options, correct_option_id, expires_at
  )
  values (
    p_user_id, v_question_id, v_question, v_level,
    v_options, v_correct_option_id, v_expires_at
  )
  returning id into v_challenge_id;

  return query select v_challenge_id, v_question_id, v_level, v_question, v_options, v_expires_at;
end;
$$;
revoke all on function public.issue_xp_challenge(uuid) from public, anon, authenticated;
grant execute on function public.issue_xp_challenge(uuid) to service_role;

create or replace function public.submit_xp_answer(
  p_user_id uuid,
  p_challenge_id uuid,
  p_option_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_challenge public.xp_challenges%rowtype;
  v_total_xp bigint;
  v_existing public.xp_ledger%rowtype;
  v_base_xp integer;
  v_multiplier smallint;
  v_awarded_xp integer;
  v_ledger_id uuid;
  v_daily_count integer;
begin
  if p_user_id is null or p_challenge_id is null then
    raise exception 'unauthorized';
  end if;
  if p_option_id is null or p_option_id not in ('a', 'b', 'c', 'd') then
    raise exception 'invalid_option';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select c.* into v_challenge
  from public.xp_challenges c
  where c.id = p_challenge_id and c.user_id = p_user_id
  for update;

  if not found then
    raise exception 'challenge_not_found';
  end if;

  select p.xp into v_total_xp
  from public.xp_profiles p
  where p.user_id = p_user_id
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  if v_challenge.answered_at is not null then
    select l.* into v_existing
    from public.xp_ledger l
    where l.challenge_id = p_challenge_id;
    return jsonb_build_object(
      'correct', coalesce(v_challenge.is_correct, false),
      'xp_awarded', coalesce(v_existing.awarded_xp, 0),
      'total_xp', v_total_xp,
      'duplicate', true,
      'reason', 'already_answered'
    );
  end if;

  if v_challenge.expires_at <= now() then
    update public.xp_challenges
       set answered_at = now(), is_correct = false, attempts = 1
     where id = p_challenge_id;
    return jsonb_build_object(
      'correct', false, 'xp_awarded', 0, 'total_xp', v_total_xp,
      'duplicate', false, 'reason', 'expired'
    );
  end if;

  if p_option_id <> v_challenge.correct_option_id then
    update public.xp_challenges
       set answered_at = now(), is_correct = false, attempts = 1
     where id = p_challenge_id;
    return jsonb_build_object(
      'correct', false, 'xp_awarded', 0, 'total_xp', v_total_xp,
      'duplicate', false, 'reason', 'incorrect'
    );
  end if;

  update public.xp_challenges
     set answered_at = now(), is_correct = true, attempts = 1
   where id = p_challenge_id;

  select count(*) into v_daily_count
  from public.xp_ledger l
  where l.user_id = p_user_id
    and l.reward_code = 'quiz_correct'
    and l.created_at >= date_trunc('day', now());

  select r.base_xp into v_base_xp
  from public.xp_reward_rules r
  where r.reward_code = 'quiz_correct' and r.enabled;

  if not found then
    raise exception 'reward_disabled';
  end if;

  if v_daily_count >= (select r.daily_limit from public.xp_reward_rules r where r.reward_code = 'quiz_correct') then
    update public.xp_challenges set reward_xp = 0 where id = p_challenge_id;
    return jsonb_build_object(
      'correct', true, 'xp_awarded', 0, 'total_xp', v_total_xp,
      'duplicate', false, 'reason', 'daily_reward_limit'
    );
  end if;

  select s.multiplier into v_multiplier
  from public.xp_settings s where s.id = true;
  v_multiplier := coalesce(v_multiplier, 1);
  v_awarded_xp := v_base_xp * v_multiplier;

  insert into public.xp_ledger(
    user_id, idempotency_key, reward_code, base_xp, multiplier, awarded_xp, challenge_id
  )
  values (
    p_user_id, 'challenge:' || p_challenge_id::text, 'quiz_correct',
    v_base_xp, v_multiplier, v_awarded_xp, p_challenge_id
  )
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_ledger_id;

  if v_ledger_id is null then
    select l.* into v_existing
    from public.xp_ledger l
    where l.user_id = p_user_id and l.idempotency_key = 'challenge:' || p_challenge_id::text;
    select p.xp into v_total_xp from public.xp_profiles p where p.user_id = p_user_id;
    return jsonb_build_object(
      'correct', true, 'xp_awarded', coalesce(v_existing.awarded_xp, 0),
      'total_xp', v_total_xp, 'duplicate', true, 'reason', 'already_credited'
    );
  end if;

  update public.xp_profiles p
     set xp = p.xp + v_awarded_xp, updated_at = now()
   where p.user_id = p_user_id
  returning p.xp into v_total_xp;

  update public.xp_challenges set reward_xp = v_awarded_xp where id = p_challenge_id;

  return jsonb_build_object(
    'correct', true, 'xp_awarded', v_awarded_xp, 'total_xp', v_total_xp,
    'multiplier', v_multiplier, 'duplicate', false, 'reason', 'credited'
  );
end;
$$;
revoke all on function public.submit_xp_answer(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.submit_xp_answer(uuid, uuid, text) to service_role;
