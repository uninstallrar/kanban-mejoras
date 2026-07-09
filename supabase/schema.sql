-- ============================================================================
--  SISTEMA KANBAN DE GESTIÓN DE DEMANDAS Y MEJORAS (CRM interno)
--  Script de esquema para Supabase (PostgreSQL)
--
--  Cómo usarlo:
--    Supabase Dashboard → SQL Editor → New query → pega este archivo → Run.
--    Ejecuta TODO el bloque de una vez (las secciones dependen entre sí).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONES
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- para gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. TABLA: profiles
--    Espejo de auth.users con datos de negocio y ROL.
--    El rol controla los permisos en toda la app (admin vs employee).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text,
  email      text,
  telefono   text,
  rol        text not null default 'empleado' check (rol in ('superadmin', 'admin', 'supervisor', 'federado', 'empleado', 'colaborador', 'liquidador', 'desarrollador', 'consulta', 'employee')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuario. El campo rol define los permisos (admin = equipo de soporte).';

-- ----------------------------------------------------------------------------
-- 2. TABLA: solicitudes (los "tickets" del Kanban)
-- ----------------------------------------------------------------------------
create table if not exists public.solicitudes (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Marca cuándo entró a la columna actual: alimenta el contador "Tiempo en esta etapa"
  stage_changed_at  timestamptz not null default now(),

  titulo            text not null,
  descripcion       text,
  justificacion     text,                     -- justificación del impacto del cambio
  app_name          text not null,            -- Finnegans | FinApp | Bitrix | Otras...
  prioridad         text not null default 'media'
                      check (prioridad in ('baja', 'media', 'alta', 'critica')),

  -- Estados del tablero (orden lógico de izquierda a derecha)
  status            text not null default 'bandeja'
                      check (status in (
                        'bandeja',       -- Bandeja de Entrada / Evaluación
                        'priorizado',    -- Priorizado / En Cola
                        'desarrollo',    -- En Desarrollo
                        'pruebas',       -- En Pruebas
                        'implementado',  -- Implementado
                        'rechazado'      -- Rechazado / No Viable
                      )),

  -- Veredicto de viabilidad (lo define un admin)
  is_viable         boolean,                  -- null = sin dictaminar
  motivo_no_viable  text,                     -- obligatorio si is_viable = false

  url_adjunto       text,                     -- ruta del archivo en Storage
  creado_por        uuid not null references public.profiles (id) on delete set null
);

comment on table public.solicitudes is 'Solicitudes de mejora. Pueden permanecer activas semanas o meses.';

create index if not exists idx_solicitudes_status   on public.solicitudes (status);
create index if not exists idx_solicitudes_app       on public.solicitudes (app_name);
create index if not exists idx_solicitudes_creado_por on public.solicitudes (creado_por);

-- ----------------------------------------------------------------------------
-- 3. TABLA: historial_estados (AUDIT LOG)
--    Registra automáticamente cada cambio de estado o de viabilidad.
--    Nunca se sobrescribe: es la trazabilidad de larga duración.
-- ----------------------------------------------------------------------------
create table if not exists public.historial_estados (
  id              uuid primary key default gen_random_uuid(),
  solicitud_id    uuid not null references public.solicitudes (id) on delete cascade,
  cambiado_por    uuid references public.profiles (id) on delete set null,
  campo           text not null default 'status',  -- 'status' | 'viabilidad'
  estado_anterior text,
  estado_nuevo    text,
  fecha_cambio    timestamptz not null default now()
);

comment on table public.historial_estados is 'Audit log: quién cambió qué (estado/viabilidad) y cuándo.';

create index if not exists idx_historial_solicitud on public.historial_estados (solicitud_id);

-- ----------------------------------------------------------------------------
-- 4. TABLA: comentarios (línea de tiempo / seguimiento técnico)
-- ----------------------------------------------------------------------------
create table if not exists public.comentarios (
  id           uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  creado_por   uuid references public.profiles (id) on delete set null,
  texto        text not null,
  created_at   timestamptz not null default now()
);

comment on table public.comentarios is 'Comentarios de seguimiento de empleados y soporte.';

create index if not exists idx_comentarios_solicitud on public.comentarios (solicitud_id);

-- ============================================================================
--  FUNCIONES Y TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Helper: ¿el usuario actual es admin?
--     SECURITY DEFINER evita la recursión de RLS al leer profiles.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol in ('superadmin', 'admin', 'supervisor', 'federado')
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 4.2 Crear el profile automáticamente al registrarse un usuario nuevo.
--     Lee nombre/teléfono del metadata que devuelve el proveedor (Google/OTP).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, nombre, email, telefono, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    new.phone,
    case
      when new.email = 'contacteconmariadelcarmen@gmail.com' then 'superadmin'
      else 'empleado'
    end
  )
  on conflict (id) do update set
    rol = case
      when new.email = 'contacteconmariadelcarmen@gmail.com' then 'superadmin'
      else profiles.rol
    end;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4.3 Auditoría automática + sello de etapa.
--     Cada vez que cambia el status o la viabilidad, inserta una fila en
--     historial_estados y actualiza stage_changed_at / updated_at.
-- ----------------------------------------------------------------------------
create or replace function public.log_solicitud_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();

  -- Cambio de estado en el Kanban
  if (new.status is distinct from old.status) then
    new.stage_changed_at := now();
    insert into public.historial_estados
      (solicitud_id, cambiado_por, campo, estado_anterior, estado_nuevo)
    values
      (new.id, auth.uid(), 'status', old.status, new.status);
  end if;

  -- Cambio de veredicto de viabilidad
  if (new.is_viable is distinct from old.is_viable) then
    insert into public.historial_estados
      (solicitud_id, cambiado_por, campo, estado_anterior, estado_nuevo)
    values
      (new.id, auth.uid(), 'viabilidad',
       coalesce(old.is_viable::text, 'sin dictaminar'),
       coalesce(new.is_viable::text, 'sin dictaminar'));
  end if;

  return new;
end;
$$;

revoke execute on function public.log_solicitud_change() from public;
revoke execute on function public.log_solicitud_change() from authenticated;
grant execute on function public.log_solicitud_change() to service_role;

drop trigger if exists on_solicitud_updated on public.solicitudes;
create trigger on_solicitud_updated
  before update on public.solicitudes
  for each row execute function public.log_solicitud_change();

-- ============================================================================
--  ROW LEVEL SECURITY (RLS)
--  Aquí se hace cumplir, del lado del servidor, que sólo los admin editen.
--  La UI oculta los botones, pero ESTO es lo que realmente protege los datos.
-- ============================================================================

alter table public.profiles          enable row level security;
alter table public.solicitudes       enable row level security;
alter table public.historial_estados enable row level security;
alter table public.comentarios       enable row level security;

-- ---- profiles ----
-- Todos los autenticados pueden leer perfiles (para mostrar nombres en las tarjetas).
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated using (true);

-- Cada usuario edita su propio perfil; los admin pueden editar cualquiera (asignar rol).
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---- solicitudes ----
-- Lectura: cualquier usuario autenticado ve el tablero global.
drop policy if exists "solicitudes_select_all" on public.solicitudes;
create policy "solicitudes_select_all"
  on public.solicitudes for select
  to authenticated
  using (
    creado_por = auth.uid() 
    or public.is_admin()
  );

-- Creación: cualquier usuario puede crear, pero sólo a su propio nombre.
drop policy if exists "solicitudes_insert_own" on public.solicitudes;
create policy "solicitudes_insert_own"
  on public.solicitudes for insert
  to authenticated
  with check (creado_por = auth.uid());

-- Edición (mover en el Kanban, dictaminar viabilidad): SÓLO admins.
drop policy if exists "solicitudes_update_admin" on public.solicitudes;
create policy "solicitudes_update_admin"
  on public.solicitudes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Borrado: sólo admins.
drop policy if exists "solicitudes_delete_admin" on public.solicitudes;
create policy "solicitudes_delete_admin"
  on public.solicitudes for delete
  to authenticated using (public.is_admin());

-- ---- historial_estados ----
-- Lectura para todos; la escritura la hace el trigger (security definer).
drop policy if exists "historial_select_all" on public.historial_estados;
create policy "historial_select_all"
  on public.historial_estados for select
  to authenticated using (true);

-- ---- comentarios ----
drop policy if exists "comentarios_select_all" on public.comentarios;
create policy "comentarios_select_all"
  on public.comentarios for select
  to authenticated using (true);

-- Cualquiera puede comentar, pero sólo a su propio nombre.
drop policy if exists "comentarios_insert_own" on public.comentarios;
create policy "comentarios_insert_own"
  on public.comentarios for insert
  to authenticated
  with check (creado_por = auth.uid());

-- Cada autor borra sus comentarios; los admin pueden moderar.
drop policy if exists "comentarios_delete_own_or_admin" on public.comentarios;
create policy "comentarios_delete_own_or_admin"
  on public.comentarios for delete
  to authenticated
  using (creado_por = auth.uid() or public.is_admin());

-- ============================================================================
--  REALTIME
--  Publica la tabla solicitudes para que el tablero se actualice en vivo.
-- ============================================================================
alter publication supabase_realtime add table public.solicitudes;
alter publication supabase_realtime add table public.comentarios;

-- ============================================================================
--  Bucket "adjuntos" para capturas / PDFs / excels de cada solicitud.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('adjuntos', 'adjuntos', true)
on conflict (id) do nothing;

-- Cualquier autenticado puede subir; lectura pública (bucket público).
drop policy if exists "adjuntos_insert" on storage.objects;
create policy "adjuntos_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'adjuntos');

drop policy if exists "adjuntos_select" on storage.objects;
create policy "adjuntos_select"
  on storage.objects for select
  to public
  using (bucket_id = 'adjuntos');

-- ============================================================================
--  CÓMO CONVERTIR A UN USUARIO EN ADMIN (ejecutar tras su primer login):
--    update public.profiles set rol = 'admin' where email = 'tucorreo@empresa.com';
-- ============================================================================
