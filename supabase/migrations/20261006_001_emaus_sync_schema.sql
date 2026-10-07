-- EMAÚS · FASE 3.13
-- Esquema remoto privado + RLS.
-- Diseñado para usuarios anónimos o permanentes de Supabase Auth.
-- No contiene secretos.

begin;

create or replace function public.emaus_set_server_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.server_updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  client_updated_at timestamptz not null default timezone('utc', now()),
  server_updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.emaus_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists emaus_on_auth_user_created on auth.users;
create trigger emaus_on_auth_user_created
after insert on auth.users
for each row execute function public.emaus_handle_new_auth_user();

insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create table if not exists public.loved_ones (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name text,
  relationship text not null check (
    relationship in (
      'mother','father','spouse','child','sibling',
      'grandparent','family','friend','other'
    )
  ),
  birth_date date,
  death_date date,
  death_date_precision text not null default 'unknown' check (
    death_date_precision in ('exact','month','year','unknown')
  ),
  approximate_age integer check (
    approximate_age is null or (approximate_age >= 0 and approximate_age <= 130)
  ),
  circumstance text check (
    circumstance is null or circumstance in (
      'illness','sudden','accident','pregnancy_or_birth',
      'other','prefer_not_to_say'
    )
  ),
  notes text,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (id, user_id)
);

create table if not exists public.grief_journeys (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  loved_one_id uuid not null,
  started_at timestamptz not null,
  active boolean not null default true,
  last_checkin_at timestamptz,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (id, user_id),
  constraint grief_journeys_loved_one_owner_fk
    foreign key (loved_one_id, user_id)
    references public.loved_ones(id, user_id)
    on delete cascade
);

create unique index if not exists uq_remote_active_journey_per_user
  on public.grief_journeys(user_id)
  where active = true and deleted_at is null;

create table if not exists public.emotional_checkins (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  journey_id uuid not null,
  emotion text not null check (
    emotion in (
      'sadness','yearning','anxiety','guilt','anger','loneliness',
      'fear','confusion','peace','gratitude','hope','unknown'
    )
  ),
  intensity text not null check (
    intensity in ('mild','moderate','strong','unknown')
  ),
  trigger_text text,
  note text,
  context text not null check (
    context in ('morning','afternoon','night','spontaneous')
  ),
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint emotional_checkins_journey_owner_fk
    foreign key (journey_id, user_id)
    references public.grief_journeys(id, user_id)
    on delete cascade
);

create index if not exists idx_remote_checkins_journey_created
  on public.emotional_checkins(journey_id, created_at desc);

create table if not exists public.memories (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  loved_one_id uuid not null,
  type text not null check (type in ('text','photo','audio')),
  title text,
  content text,
  media_object_path text,
  memory_date date,
  category text check (
    category is null or category in (
      'story','legacy','special_moment','gratitude','photo','other'
    )
  ),
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint memories_loved_one_owner_fk
    foreign key (loved_one_id, user_id)
    references public.loved_ones(id, user_id)
    on delete cascade
);

create index if not exists idx_remote_memories_loved_one_created
  on public.memories(loved_one_id, created_at desc);

create table if not exists public.letters (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  loved_one_id uuid not null,
  body text not null,
  prayer_body text,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint letters_loved_one_owner_fk
    foreign key (loved_one_id, user_id)
    references public.loved_ones(id, user_id)
    on delete cascade
);

create table if not exists public.prayer_logs (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  loved_one_id uuid,
  prayer_type text not null,
  note text,
  offered_at timestamptz not null,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint prayer_logs_loved_one_owner_fk
    foreign key (loved_one_id, user_id)
    references public.loved_ones(id, user_id)
    on delete cascade
);

create table if not exists public.support_contacts (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null,
  relationship text,
  phone text,
  support_type text,
  notes text,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.masses (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  loved_one_id uuid,
  mass_date date not null,
  parish text,
  intention text,
  note text,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint masses_loved_one_owner_fk
    foreign key (loved_one_id, user_id)
    references public.loved_ones(id, user_id)
    on delete cascade
);

create table if not exists public.special_dates (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  loved_one_id uuid not null,
  type text not null,
  date date not null,
  label text,
  notify boolean not null default true,
  created_at timestamptz not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint special_dates_loved_one_owner_fk
    foreign key (loved_one_id, user_id)
    references public.loved_ones(id, user_id)
    on delete cascade
);

create index if not exists idx_remote_special_dates_date
  on public.special_dates(user_id, date);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  show_time_since_loss boolean not null default true,
  daily_notifications boolean not null default false,
  special_date_notifications boolean not null default true,
  biometric_lock boolean not null default false,
  locale text not null default 'es-CO',
  client_updated_at timestamptz not null default timezone('utc', now()),
  server_updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.journey_stage_visits (
  id uuid primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  journey_id uuid not null,
  stage_id text not null check (
    stage_id in (
      'first_days','funeral','nine_days','first_month',
      'following_months','special_dates','first_anniversary',
      'after_first_year'
    )
  ),
  first_visited_at timestamptz not null,
  last_visited_at timestamptz not null,
  visit_count integer not null default 1 check (visit_count >= 1),
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  unique (journey_id, stage_id),
  constraint journey_stage_visits_journey_owner_fk
    foreign key (journey_id, user_id)
    references public.grief_journeys(id, user_id)
    on delete cascade
);

create index if not exists idx_remote_stage_visits_journey
  on public.journey_stage_visits(journey_id, last_visited_at desc);

-- server_updated_at siempre lo controla el servidor.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'loved_ones',
    'grief_journeys',
    'emotional_checkins',
    'memories',
    'letters',
    'prayer_logs',
    'support_contacts',
    'masses',
    'special_dates',
    'user_preferences',
    'journey_stage_visits'
  ]
  loop
    execute format('drop trigger if exists emaus_set_server_updated_at on public.%I', t);
    execute format(
      'create trigger emaus_set_server_updated_at
       before update on public.%I
       for each row execute function public.emaus_set_server_updated_at()',
      t
    );
  end loop;
end;
$$;

-- RLS: una única regla de propiedad, auth.uid() = user_id.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'loved_ones',
    'grief_journeys',
    'emotional_checkins',
    'memories',
    'letters',
    'prayer_logs',
    'support_contacts',
    'masses',
    'special_dates',
    'user_preferences',
    'journey_stage_visits'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists emaus_owner_all on public.%I', t);
    execute format(
      'create policy emaus_owner_all on public.%I
       for all
       to authenticated
       using (auth.uid() = user_id)
       with check (auth.uid() = user_id)',
      t
    );
    execute format(
      'grant select, insert, update, delete on public.%I to authenticated',
      t
    );
  end loop;
end;
$$;

revoke all on function public.emaus_handle_new_auth_user() from public;
revoke all on function public.emaus_set_server_updated_at() from public;

commit;
