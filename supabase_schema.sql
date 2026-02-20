-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create PROFILES table
-- This table extends the default auth.users table with our custom fields
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  role text check (role in ('KEEPER', 'INVESTIGATOR')) default 'INVESTIGATOR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create INVESTIGATORS table
-- This stores the character sheets. We use JSONB for the 'data' column to be flexible.
create table public.investigators (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  occupation text,
  data jsonb not null default '{}'::jsonb, -- Stores the full TS object
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.investigators enable row level security;

-- 4. Policies for PROFILES
-- Everyone can read profiles (needed for GM to see player names)
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

-- Users can insert their own profile (usually handled by trigger, but good to have)
create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 5. Policies for INVESTIGATORS
-- GM (Keeper) can view ALL investigators
-- Players can view ONLY their own investigators
create policy "Keepers view all, Players view own"
  on investigators for select
  using (
    (select role from profiles where id = auth.uid()) = 'KEEPER'
    or
    auth.uid() = user_id
  );

-- Only owners can insert
create policy "Individuals can create investigators"
  on investigators for insert
  with check ( auth.uid() = user_id );

-- Owners can update own, Keepers can update all (optional, maybe Keepers shouldn't edit?)
-- Let's allow Keepers to edit for now (to fix mistakes)
create policy "Keepers and Owners can update"
  on investigators for update
  using (
    (select role from profiles where id = auth.uid()) = 'KEEPER'
    or
    auth.uid() = user_id
  );

-- Owners can delete
create policy "Individuals can delete own investigators"
  on investigators for delete
  using ( auth.uid() = user_id );

-- 6. Automate Profile Creation on Sign Up
-- This trigger automatically creates a profile entry when a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, new.raw_user_meta_data->>'username', coalesce(new.raw_user_meta_data->>'role', 'INVESTIGATOR'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Create SESSIONS table
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  keeper_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  invite_code text unique not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create SESSION_CHARACTERS junction table
create table public.session_characters (
  session_id uuid references public.sessions(id) on delete cascade not null,
  investigator_id uuid references public.investigators(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (session_id, investigator_id)
);

-- 9. Enable RLS for new tables
alter table public.sessions enable row level security;
alter table public.session_characters enable row level security;

-- Policies for SESSIONS
-- Keepers can manage their own sessions
create policy "Keepers manage own sessions"
  on sessions for all
  using ( auth.uid() = keeper_id );

-- Anyone can read sessions (needed for players to join via code)
create policy "Sessions are viewable by everyone"
  on sessions for select
  using ( is_active = true );

-- Policies for SESSION_CHARACTERS
-- Players can join a session (insert) and view their own links
create policy "Players can link characters"
  on session_characters for insert
  with check ( 
      -- The investigator must belong to them
      investigator_id in (select id from investigators where user_id = auth.uid())
  );

create policy "People can see session links"
  on session_characters for select
  using ( true ); -- Keepers need to see who joined, players need to see where they are

-- 10. Create ROLL_REQUESTS table
create table public.roll_requests (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  keeper_id uuid references public.profiles(id) on delete cascade not null,
  investigator_id uuid references public.investigators(id) on delete cascade not null,
  skill_name text not null,
  target_value integer not null,
  status text check (status in ('PENDING', 'ROLLED')) default 'PENDING' not null,
  result_roll integer,
  result_type text check (result_type in ('FUMBLE', 'FAILURE', 'SUCCESS', 'HARD', 'EXTREME', 'CRITICAL')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.roll_requests enable row level security;

-- Policies for ROLL_REQUESTS
-- Keepers can manage their roll requests
create policy "Keepers can manage roll requests"
  on roll_requests for all
  using ( auth.uid() = keeper_id );

-- Investigators can view their own roll requests
create policy "Investigators can view their requests"
  on roll_requests for select
  using (
      investigator_id in (select id from investigators where user_id = auth.uid())
  );

-- Investigators can update their own roll requests (to set the result)
create policy "Investigators can resolve their requests"
  on roll_requests for update
  using (
      investigator_id in (select id from investigators where user_id = auth.uid())
  );

-- Enable realtime for roll_requests
-- Note: In Supabase dashboard, you might need to manually enable realtime for this table under Settings > Database > Webhooks/Realtime if this statement fails.
alter publication supabase_realtime add table roll_requests;
