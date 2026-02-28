-- Create custom_items table
create table public.custom_items (
  id uuid default uuid_generate_v4() primary key,
  keeper_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  description text,
  stats text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.custom_items enable row level security;

-- Policies for custom_items
-- GMs can manage their own custom items
create policy "Keepers manage own custom items"
  on custom_items for all
  using ( auth.uid() = keeper_id );

-- Enable Realtime for custom_items
alter publication supabase_realtime add table custom_items;
