-- 1. Create Profiles Table (must come first)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- 2. Create Items Table
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  mode text not null check (mode in ('borrow', 'lend', 'buy', 'sell')),
  price integer,
  owner_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'available' check (status in ('available', 'reserved', 'borrowed', 'sold')),
  created_at timestamp with time zone default now()
);

alter table items enable row level security;

create policy "items_select" on items for select using (auth.uid() is not null);
create policy "items_insert" on items for insert with check (auth.uid() = owner_id);
create policy "items_update" on items for update using (auth.uid() = owner_id);
create policy "items_delete" on items for delete using (auth.uid() = owner_id);

-- 3. Create Messages Table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default now()
);

alter table messages enable row level security;

create policy "messages_select" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_insert" on messages for insert with check (auth.uid() = sender_id);

-- 4. Create Exchanges Table
create table if not exists exchanges (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  other_user_id uuid not null references profiles(id) on delete cascade,
  owner_confirmed boolean default false,
  other_user_confirmed boolean default false,
  handover_at timestamp with time zone,
  return_due_at timestamp with time zone,
  returned_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table exchanges enable row level security;

create policy "exchanges_select" on exchanges for select using (auth.uid() = owner_id or auth.uid() = other_user_id);
create policy "exchanges_update" on exchanges for update using (auth.uid() = owner_id or auth.uid() = other_user_id);
create policy "exchanges_insert" on exchanges for insert with check (auth.uid() = owner_id);

-- 5. Set up Realtime for Profiles
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;

-- 6. User Signup Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
