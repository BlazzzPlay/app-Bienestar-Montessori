-- ============================================
-- Bienestar Montessori — Schema + RLS + Triggers
-- ============================================

-- 1. EXTENSIONS
-- --------------------------------------------
create extension if not exists "uuid-ossp";

-- 2. TABLES
-- --------------------------------------------

-- perfiles
-- id references auth.users (UUID)
create table if not exists public.perfiles (
  id uuid primary key references auth.users on delete cascade,
  nombre_completo text not null default '',
  correo text not null unique,
  rut text,
  fecha_nacimiento date,
  sexo text check (sexo in ('Masculino', 'Femenino', 'Otro', 'Prefiero no decir')),
  telefono text,
  cargo text,
  fecha_ingreso text,
  jornada_trabajo text check (jornada_trabajo in ('Jornada Mañana', 'Jornada Tarde', 'Ambas Jornadas')),
  avatar_url text,
  es_bienestar boolean not null default false,
  rol text not null default 'Visualizador' check (rol in ('Administrador', 'Presidente', 'Directorio', 'Beneficiario', 'Visualizador')),
  orden_directorio integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- beneficios
create table if not exists public.beneficios (
  id serial primary key,
  nombre_empresa text not null,
  descripcion_corta text not null,
  descripcion_larga text,
  direccion text,
  etiquetas text[] not null default '{}',
  foto_local_url text,
  fecha_inicio date,
  fecha_termino date,
  contador_usos integer not null default 0,
  beneficios_disponibles text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- publicaciones
create table if not exists public.publicaciones (
  id serial primary key,
  titulo text not null,
  descripcion text not null,
  fecha_publicacion timestamptz not null default now(),
  categoria text not null check (categoria in ('Evento', 'Noticia', 'Comunicado')),
  autor_id uuid references public.perfiles(id) on delete set null,
  lugar text,
  organizador text,
  imagen_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comentarios_beneficios
create table if not exists public.comentarios_beneficios (
  id serial primary key,
  contenido text not null,
  beneficio_id integer not null references public.beneficios(id) on delete cascade,
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'archivado')),
  fecha_creacion timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comentarios_publicaciones
create table if not exists public.comentarios_publicaciones (
  id serial primary key,
  contenido text not null,
  publicacion_id integer not null references public.publicaciones(id) on delete cascade,
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'archivado')),
  fecha_creacion timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- sugerencias (anónimas: sin usuario_id)
create table if not exists public.sugerencias (
  id serial primary key,
  contenido text not null,
  fecha_creacion timestamptz not null default now(),
  leido boolean not null default false,
  updated_at timestamptz not null default now()
);

-- asistencias_evento
create table if not exists public.asistencias_evento (
  publicacion_id integer not null references public.publicaciones(id) on delete cascade,
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  confirmado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (publicacion_id, usuario_id)
);

-- 3. INDEXES
-- --------------------------------------------
create index if not exists idx_perfiles_correo on public.perfiles(correo);
create index if not exists idx_perfiles_rut on public.perfiles(rut);
create index if not exists idx_perfiles_rol on public.perfiles(rol);
create index if not exists idx_perfiles_orden_directorio on public.perfiles(orden_directorio);

create index if not exists idx_beneficios_created_at on public.beneficios(created_at desc);

create index if not exists idx_publicaciones_fecha_publicacion on public.publicaciones(fecha_publicacion desc);
create index if not exists idx_publicaciones_categoria_fecha on public.publicaciones(categoria, fecha_publicacion desc);

create index if not exists idx_comentarios_beneficios_estado_fecha on public.comentarios_beneficios(estado, fecha_creacion desc);
create index if not exists idx_comentarios_publicaciones_estado_fecha on public.comentarios_publicaciones(estado, fecha_creacion desc);

create index if not exists idx_sugerencias_fecha_leido on public.sugerencias(fecha_creacion desc, leido);

create index if not exists idx_asistencias_evento_pub_user on public.asistencias_evento(publicacion_id, usuario_id);

-- 4. updated_at TRIGGER FUNCTION
-- --------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at to all tables
drop trigger if exists trg_perfiles_updated_at on public.perfiles;
create trigger trg_perfiles_updated_at
  before update on public.perfiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_beneficios_updated_at on public.beneficios;
create trigger trg_beneficios_updated_at
  before update on public.beneficios
  for each row execute function public.set_updated_at();

drop trigger if exists trg_publicaciones_updated_at on public.publicaciones;
create trigger trg_publicaciones_updated_at
  before update on public.publicaciones
  for each row execute function public.set_updated_at();

drop trigger if exists trg_comentarios_beneficios_updated_at on public.comentarios_beneficios;
create trigger trg_comentarios_beneficios_updated_at
  before update on public.comentarios_beneficios
  for each row execute function public.set_updated_at();

drop trigger if exists trg_comentarios_publicaciones_updated_at on public.comentarios_publicaciones;
create trigger trg_comentarios_publicaciones_updated_at
  before update on public.comentarios_publicaciones
  for each row execute function public.set_updated_at();

drop trigger if exists trg_sugerencias_updated_at on public.sugerencias;
create trigger trg_sugerencias_updated_at
  before update on public.sugerencias
  for each row execute function public.set_updated_at();

drop trigger if exists trg_asistencias_evento_updated_at on public.asistencias_evento;
create trigger trg_asistencias_evento_updated_at
  before update on public.asistencias_evento
  for each row execute function public.set_updated_at();

-- 5. PROFILE AUTO-CREATION TRIGGER
-- --------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, correo, rol)
  values (new.id, new.email, 'Visualizador');
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists to avoid duplicates on re-runs
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. RPC: INCREMENTAR USO BENEFICIO
-- --------------------------------------------
create or replace function public.incrementar_uso_beneficio(p_id integer)
returns void as $$
begin
  update public.beneficios
  set contador_usos = contador_usos + 1
  where id = p_id;
end;
$$ language plpgsql;

-- 7. RLS
-- --------------------------------------------

-- perfiles
alter table public.perfiles enable row level security;

drop policy if exists "perfiles_select_auth" on public.perfiles;
create policy "perfiles_select_auth"
  on public.perfiles for select
  to authenticated using (true);

drop policy if exists "perfiles_update_own_or_admin" on public.perfiles;
create policy "perfiles_update_own_or_admin"
  on public.perfiles for update
  to authenticated using (
    auth.uid() = id
    or exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente'))
  );

drop policy if exists "perfiles_insert_service" on public.perfiles;
create policy "perfiles_insert_service"
  on public.perfiles for insert
  to service_role with check (true);

drop policy if exists "perfiles_delete_service" on public.perfiles;
create policy "perfiles_delete_service"
  on public.perfiles for delete
  to service_role using (true);

-- beneficios
alter table public.beneficios enable row level security;

drop policy if exists "beneficios_select_auth" on public.beneficios;
create policy "beneficios_select_auth"
  on public.beneficios for select
  to authenticated using (true);

drop policy if exists "beneficios_insert_admin_dir" on public.beneficios;
create policy "beneficios_insert_admin_dir"
  on public.beneficios for insert
  to authenticated with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "beneficios_update_admin_dir" on public.beneficios;
create policy "beneficios_update_admin_dir"
  on public.beneficios for update
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "beneficios_delete_admin" on public.beneficios;
create policy "beneficios_delete_admin"
  on public.beneficios for delete
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'Administrador')
  );

-- publicaciones
alter table public.publicaciones enable row level security;

drop policy if exists "publicaciones_select_auth" on public.publicaciones;
create policy "publicaciones_select_auth"
  on public.publicaciones for select
  to authenticated using (true);

drop policy if exists "publicaciones_insert_admin_dir" on public.publicaciones;
create policy "publicaciones_insert_admin_dir"
  on public.publicaciones for insert
  to authenticated with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "publicaciones_update_admin_dir" on public.publicaciones;
create policy "publicaciones_update_admin_dir"
  on public.publicaciones for update
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "publicaciones_delete_admin" on public.publicaciones;
create policy "publicaciones_delete_admin"
  on public.publicaciones for delete
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'Administrador')
  );

-- comentarios_beneficios
alter table public.comentarios_beneficios enable row level security;

drop policy if exists "comentarios_beneficios_select" on public.comentarios_beneficios;
create policy "comentarios_beneficios_select"
  on public.comentarios_beneficios for select
  to authenticated using (
    estado = 'aprobado'
    or usuario_id = auth.uid()
    or exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "comentarios_beneficios_insert_auth" on public.comentarios_beneficios;
create policy "comentarios_beneficios_insert_auth"
  on public.comentarios_beneficios for insert
  to authenticated with check (usuario_id = auth.uid());

drop policy if exists "comentarios_beneficios_update_moderators" on public.comentarios_beneficios;
create policy "comentarios_beneficios_update_moderators"
  on public.comentarios_beneficios for update
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

-- comentarios_publicaciones
alter table public.comentarios_publicaciones enable row level security;

drop policy if exists "comentarios_publicaciones_select" on public.comentarios_publicaciones;
create policy "comentarios_publicaciones_select"
  on public.comentarios_publicaciones for select
  to authenticated using (
    estado = 'aprobado'
    or usuario_id = auth.uid()
    or exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "comentarios_publicaciones_insert_auth" on public.comentarios_publicaciones;
create policy "comentarios_publicaciones_insert_auth"
  on public.comentarios_publicaciones for insert
  to authenticated with check (usuario_id = auth.uid());

drop policy if exists "comentarios_publicaciones_update_moderators" on public.comentarios_publicaciones;
create policy "comentarios_publicaciones_update_moderators"
  on public.comentarios_publicaciones for update
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

-- asistencias_evento
alter table public.asistencias_evento enable row level security;

drop policy if exists "asistencias_select_auth" on public.asistencias_evento;
create policy "asistencias_select_auth"
  on public.asistencias_evento for select
  to authenticated using (true);

drop policy if exists "asistencias_insert_own" on public.asistencias_evento;
create policy "asistencias_insert_own"
  on public.asistencias_evento for insert
  to authenticated with check (usuario_id = auth.uid());

drop policy if exists "asistencias_update_own" on public.asistencias_evento;
create policy "asistencias_update_own"
  on public.asistencias_evento for update
  to authenticated using (usuario_id = auth.uid());

drop policy if exists "asistencias_delete_admin" on public.asistencias_evento;
create policy "asistencias_delete_admin"
  on public.asistencias_evento for delete
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'Administrador')
  );

-- sugerencias (anónimas)
alter table public.sugerencias enable row level security;

drop policy if exists "sugerencias_insert_anon" on public.sugerencias;
create policy "sugerencias_insert_anon"
  on public.sugerencias for insert
  to anon with check (true);

drop policy if exists "sugerencias_select_mod" on public.sugerencias;
create policy "sugerencias_select_mod"
  on public.sugerencias for select
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

drop policy if exists "sugerencias_update_mod" on public.sugerencias;
create policy "sugerencias_update_mod"
  on public.sugerencias for update
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol in ('Administrador', 'Presidente', 'Directorio'))
  );

-- notificaciones
create table if not exists public.notificaciones (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  creado_por uuid references public.perfiles(id) on delete set null,
  tipo text not null check (tipo in ('beneficio', 'evento', 'comentario', 'sistema', 'bienvenida')),
  titulo text not null,
  mensaje text not null,
  icono text,
  color text,
  action_url text,
  action_text text,
  prioridad text not null default 'normal' check (prioridad in ('baja', 'normal', 'alta')),
  estado text not null default 'no_leida' check (estado in ('no_leida', 'leida', 'archivada')),
  leido_en timestamptz,
  creado_en timestamptz not null default now(),
  metadata jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_notificaciones_usuario_creado on public.notificaciones(usuario_id, creado_en desc);

drop trigger if exists trg_notificaciones_updated_at on public.notificaciones;
create trigger trg_notificaciones_updated_at
  before update on public.notificaciones
  for each row execute function public.set_updated_at();

-- RLS: notificaciones
alter table public.notificaciones enable row level security;

drop policy if exists "notificaciones_select_own" on public.notificaciones;
create policy "notificaciones_select_own"
  on public.notificaciones for select
  to authenticated using (usuario_id = auth.uid());

drop policy if exists "notificaciones_update_own" on public.notificaciones;
create policy "notificaciones_update_own"
  on public.notificaciones for update
  to authenticated using (usuario_id = auth.uid());

drop policy if exists "notificaciones_insert_admin" on public.notificaciones;
create policy "notificaciones_insert_admin"
  on public.notificaciones for insert
  to authenticated with check (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'Administrador')
  );

drop policy if exists "notificaciones_delete_admin" on public.notificaciones;
create policy "notificaciones_delete_admin"
  on public.notificaciones for delete
  to authenticated using (
    exists (select 1 from public.perfiles where id = auth.uid() and rol = 'Administrador')
  );

-- RPC: enviar_notificacion_broadcast
-- Inserta una notificación por destinatario, con límite de 500 usuarios.
create or replace function public.enviar_notificacion_broadcast(
  p_titulo text,
  p_mensaje text,
  p_tipo text,
  p_target_role text default null,
  p_prioridad text default 'normal',
  p_icono text default null,
  p_color text default null,
  p_action_url text default null,
  p_action_text text default null,
  p_metadata jsonb default null
) returns void
language plpgsql
as $$
declare
  v_creado_por uuid;
  v_count integer;
begin
  v_creado_por := auth.uid();

  if p_target_role is not null then
    select count(*) into v_count from public.perfiles where rol = p_target_role;
    if v_count > 500 then
      raise exception 'Demasiados destinatarios para el rol %. Máximo 500.', p_target_role;
    end if;

    insert into public.notificaciones (
      usuario_id, creado_por, tipo, titulo, mensaje,
      icono, color, action_url, action_text, prioridad, estado, metadata
    )
    select
      id, v_creado_por, p_tipo, p_titulo, p_mensaje,
      p_icono, p_color, p_action_url, p_action_text, p_prioridad, 'no_leida', p_metadata
    from public.perfiles
    where rol = p_target_role;
  else
    select count(*) into v_count from public.perfiles;
    if v_count > 500 then
      raise exception 'Demasiados destinatarios. Máximo 500 usuarios para broadcast global.';
    end if;

    insert into public.notificaciones (
      usuario_id, creado_por, tipo, titulo, mensaje,
      icono, color, action_url, action_text, prioridad, estado, metadata
    )
    select
      id, v_creado_por, p_tipo, p_titulo, p_mensaje,
      p_icono, p_color, p_action_url, p_action_text, p_prioridad, 'no_leida', p_metadata
    from public.perfiles;
  end if;
end;
$$;

-- 8. STORAGE BUCKETS
-- --------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('beneficios', 'beneficios', true)
on conflict (id) do nothing;

-- 9. REALTIME
-- --------------------------------------------
-- Enable realtime on notificaciones table
alter publication supabase_realtime add table public.notificaciones;
