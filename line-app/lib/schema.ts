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

-- ---------- Phase 1 completion (FR-01/02, 07, 09, 14-16, 20-23, 32-35) ----------
alter table clients add column if not exists ref_code text;
alter table clients add column if not exists referred_by bigint;
alter table clients add column if not exists health jsonb;
alter table clients add column if not exists health_updated_at timestamptz;
create unique index if not exists clients_ref_code on clients(ref_code) where ref_code is not null;
alter table leads add column if not exists referred_by bigint;
alter table leads add column if not exists nurture_started_at timestamptz;
alter table leads add column if not exists nurture_step int not null default 0;
alter table appointments add column if not exists reminder2_sent_at timestamptz;
alter table appointments add column if not exists plan_id bigint;

create table if not exists jobs (
  key text primary key,
  created_at timestamptz not null default now()
);

create table if not exists health_access (
  id bigserial primary key,
  staff_id bigint,
  client_id bigint,
  what text,
  created_at timestamptz not null default now()
);

create table if not exists consults (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  appointment_id bigint,
  concerns text,
  goals text,
  assessment text,
  notes text,
  created_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists photos (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  consult_id bigint,
  angle text not null,
  mime text not null default 'image/jpeg',
  data bytea not null,
  created_by bigint,
  created_at timestamptz not null default now()
);
create index if not exists photos_client on photos(client_id, created_at desc);

create table if not exists catalog (
  id bigserial primary key,
  code text unique,
  name text not null,
  category text,
  unit text not null default 'ครั้ง',
  price numeric not null default 0,
  aftercare_key text not null default 'general',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists plans (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  consult_id bigint,
  goal text,
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  discount_status text not null default 'none',
  discount_by bigint,
  total numeric not null default 0,
  valid_until date,
  status text not null default 'draft',
  card_sent_at timestamptz,
  created_by bigint,
  created_at timestamptz not null default now()
);

create table if not exists treatments (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  plan_id bigint,
  catalog_id bigint,
  name text not null,
  aftercare_key text not null default 'general',
  done_at timestamptz not null default now(),
  done_by bigint,
  csat_score int,
  csat_at timestamptz
);
create index if not exists treatments_done on treatments(done_at);

create table if not exists aftercare_templates (
  key text not null,
  day int not null,
  body text not null,
  updated_at timestamptz not null default now(),
  primary key (key, day)
);

create table if not exists care_requests (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  treatment_id bigint,
  status text not null default 'waiting_photo',
  ack_by bigint,
  ack_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists issues (
  id bigserial primary key,
  client_id bigint references clients(id),
  level text not null default 'L1',
  source text,
  summary text,
  owner_role text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
-- ---------- Photo studio (Next Motion style): sessions, protocols, ghost overlay ----------
create table if not exists photo_sessions (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  appointment_id bigint,
  consult_id bigint,
  treatment_id bigint,
  kind text not null default 'before',
  protocol text not null default 'face5',
  note text,
  created_by bigint,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists photo_sessions_client on photo_sessions(client_id, created_at desc);
alter table photos add column if not exists session_id bigint;
alter table photos add column if not exists width int;
alter table photos add column if not exists height int;
alter table photos add column if not exists meta jsonb;
create index if not exists photos_session on photos(session_id);

-- ---------- Revenue + recall (CRM full loop) ----------
create table if not exists payments (
  id bigserial primary key,
  receipt_no text unique not null,
  client_id bigint not null references clients(id),
  plan_id bigint,
  amount numeric not null,
  method text not null default 'transfer',
  note text,
  received_by bigint,
  created_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by bigint,
  void_reason text
);
create index if not exists payments_client on payments(client_id, created_at desc);
create index if not exists payments_created on payments(created_at);
alter table catalog add column if not exists recall_days int;
create table if not exists recalls (
  id bigserial primary key,
  client_id bigint not null references clients(id),
  treatment_id bigint unique not null,
  catalog_id bigint,
  name text not null,
  due_on date not null,
  status text not null default 'due',
  sent_at timestamptz,
  contacted_at timestamptz,
  contacted_by bigint,
  appointment_id bigint,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recalls_due on recalls(status, due_on);

-- ---------- CDP: identity, web attribution, segments, conversions ----------
alter table clients add column if not exists phone_norm text generated always as (
  case when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') ~ '^66[0-9]{8,9}$' then '0' || substr(regexp_replace(phone, '[^0-9]', '', 'g'), 3)
       else nullif(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), '') end) stored;
create index if not exists clients_phone_norm on clients(phone_norm) where phone_norm is not null;
create table if not exists client_merges (
  id bigserial primary key,
  primary_id bigint not null,
  secondary_id bigint not null,
  snapshot jsonb not null,
  merged_by bigint,
  created_at timestamptz not null default now()
);
create table if not exists web_visits (
  id bigserial primary key,
  code text unique not null,
  src text not null default 'web',
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  gclid text, fbclid text, ttclid text, ga_cid text, fbp text,
  landing text, referrer text,
  client_id bigint,
  matched_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists web_visits_client on web_visits(client_id);
create table if not exists segments (
  id bigserial primary key,
  name text not null,
  filters jsonb not null default '{}',
  created_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists campaigns (
  id bigserial primary key,
  segment_id bigint,
  name text not null,
  filters jsonb not null default '{}',
  message text not null,
  with_booking boolean not null default true,
  recipients int not null default 0,
  sent int not null default 0,
  created_by bigint,
  created_at timestamptz not null default now()
);
create table if not exists campaign_recipients (
  campaign_id bigint not null,
  client_id bigint not null,
  sent_at timestamptz,
  primary key (campaign_id, client_id)
);
create table if not exists conversions (
  id bigserial primary key,
  event_id text unique not null,
  client_id bigint not null,
  event text not null,
  value numeric,
  event_at timestamptz not null,
  status text not null default 'pending',
  results jsonb,
  tries int not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists conversions_pending on conversions(status, created_at);
`;
