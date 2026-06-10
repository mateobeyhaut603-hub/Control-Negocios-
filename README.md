# Control de Negocio

App web para ventas, inventario, caja, rentabilidad y asesor financiero local.

## Arquitectura

- GitHub Pages publica la app.
- Supabase es el almacenamiento principal.
- Login: nombre de empresa + contraseña.
- No hay usuarios individuales ni emails.
- Quien conozca empresa y contraseña ve y edita los mismos datos.
- Si Supabase está configurado y falla, la app muestra error y no entra en modo local silenciosamente.

## 1. SQL exacto para ejecutar en Supabase

En Supabase, abrí `SQL Editor` y ejecutá todo esto:

```sql
create extension if not exists pgcrypto;

drop function if exists public.login_company(text, text);
drop function if exists public.create_company(text, text, jsonb);
drop function if exists public.save_company_state(uuid, text, jsonb);
drop table if exists public.companies;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,
  password_hash text not null,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;
revoke all on table public.companies from anon, authenticated;

create or replace function public.create_company(
  p_name text,
  p_password text,
  p_initial_state jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_name text;
  v_name_key text;
  v_state jsonb;
begin
  v_name := trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_name_key := lower(v_name);

  if v_name = '' or coalesce(p_password, '') = '' then
    raise exception 'Nombre de empresa y contraseña son obligatorios.';
  end if;

  if exists (select 1 from public.companies where name_key = v_name_key) then
    raise exception 'Ya existe una empresa con ese nombre.';
  end if;

  insert into public.companies (name, name_key, password_hash, state)
  values (v_name, v_name_key, crypt(p_password, gen_salt('bf')), coalesce(p_initial_state, '{}'::jsonb))
  returning id, state into v_id, v_state;

  return jsonb_build_object('id', v_id, 'name', v_name, 'state', v_state);
end;
$$;

create or replace function public.login_company(
  p_name text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company public.companies%rowtype;
  v_name_key text;
begin
  v_name_key := lower(trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')));

  select *
  into v_company
  from public.companies
  where name_key = v_name_key
    and password_hash = crypt(p_password, password_hash);

  if not found then
    raise exception 'Empresa o contraseña incorrecta.';
  end if;

  return jsonb_build_object('id', v_company.id, 'name', v_company.name, 'state', v_company.state);
end;
$$;

create or replace function public.save_company_state(
  p_company_id uuid,
  p_password text,
  p_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company public.companies%rowtype;
begin
  select *
  into v_company
  from public.companies
  where id = p_company_id
    and password_hash = crypt(p_password, password_hash);

  if not found then
    raise exception 'No autorizado para guardar esta empresa.';
  end if;

  update public.companies
  set state = coalesce(p_state, '{}'::jsonb),
      updated_at = now()
  where id = p_company_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.create_company(text, text, jsonb) to anon, authenticated;
grant execute on function public.login_company(text, text) to anon, authenticated;
grant execute on function public.save_company_state(uuid, text, jsonb) to anon, authenticated;
```

## 2. Configurar Supabase en la app

Editá `supabase-config.js`:

```js
window.supabaseConfig = {
  enabled: true,
  url: "https://TU_PROYECTO.supabase.co",
  anonKey: "TU_ANON_KEY"
};
```

Los datos salen de `Project Settings → API` en Supabase.

## 3. Publicar en GitHub Pages

Subí estos archivos al repositorio:

- `index.html`
- `styles.css`
- `app.js`
- `supabase-config.js`

Después activá GitHub Pages desde `Settings → Pages`.

## 4. Uso en varios dispositivos

1. Abrí la URL de GitHub Pages.
2. Creá la empresa con nombre + contraseña.
3. En otro dispositivo ingresá con el mismo nombre + contraseña.
4. Todos ven y editan los mismos datos sincronizados.

## Nota de seguridad

Este modelo cumple tu pedido de no usar usuarios individuales. La contraseña de empresa debe ser fuerte y compartirse solo con personas autorizadas.
