-- ============================================================================
--  ACTUALIZACIÓN DE ROLES Y PERMISOS AUTOMÁTICOS
--  Ejecutar esto en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- 1. Eliminar la restricción check anterior si existe
alter table public.profiles drop constraint if exists profiles_rol_check;

-- 2. Cambiar el valor por defecto de 'employee' a 'empleado' en la columna rol
alter table public.profiles alter column rol set default 'empleado';

-- 3. Crear la nueva restricción check con la lista expandida de roles
alter table public.profiles add constraint profiles_rol_check 
  check (rol in ('superadmin', 'admin', 'supervisor', 'federado', 'empleado', 'colaborador', 'liquidador', 'desarrollador', 'consulta', 'employee'));

-- 4. Actualizar todos los usuarios con rol anterior 'employee' al nuevo rol por defecto 'empleado'
update public.profiles set rol = 'empleado' where rol = 'employee';

-- 5. Actualizar la función auxiliar is_admin() para incluir los nuevos roles de administración
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol in ('superadmin', 'admin', 'supervisor', 'federado')
  );
$$;

-- 6. Actualizar el trigger de creación de usuarios para asignar superadmin/empleado automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- 7. Promover inmediatamente al usuario contacteconmariadelcarmen@gmail.com si ya está registrado
update public.profiles 
set rol = 'superadmin' 
where email = 'contacteconmariadelcarmen@gmail.com';
