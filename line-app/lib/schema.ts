// Postgres schema. Idempotent: safe to run on every cold start.
// Mirrors the Airtable tables in "Functional UX Flow v0.1" (Clients, Leads, Touchpoints,
// Consents, Appointments) plus Staff and Settings for this app.
export const SCHEMA = `
create table if not exists clients (
  id bigserial primary key,
  line_user_id text unique,
  display_name text,
  picture_url text,
  name text,
  phone text,
  branch text not null default 'UDN',
  language text not null default 'th',
  source text,
  followed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  source text,
  interest text,
  branch text not null default 'UDN',
  status text not null default 'New',
  lost_reason text,
  owner_staff_id bigint,
  first_inbound_at timestamptz,
  last_inbound_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists leads_one_open_per_client on leads(client_id) where status not in ('Lost','Consult-Booked');

create table if not exists touchpoints (
  id bigserial primary key,
  client_id bigint references clients(id),
  channel text not null default 'line',
  direction text not null,
  kind text not null,
  body text,
  created_at timestamptz not null default now()
);
create index if not exists touchpoints_client on touchpoints(client_id, created_at desc);

create table if not exists consents (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  type text not null,
  version text not null,
  granted boolean not null,
  channel text not null default 'line',
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  branch text not null default 'UDN',
  doctor text not null,
  kind text not null default 'consult',
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'booked',
  source text,
  note text,
  confirmed_at timestamptz,
  arrived_at timestamptz,
  reminder_sent_at timestamptz,
  created_by text not null default 'client',
  created_at timestamptz not null default now()
);
create unique index if not exists appt_slot_lock on appointments(doctor, start_at) where status not in ('cancelled','no_show');
create index if not exists appt_start on appointments(start_at);

create table if not exists staff (
  id bigserial primary key,
  line_user_id text unique not null,
  name text,
  picture_url text,
  role text not null default 'AD',
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
`;
