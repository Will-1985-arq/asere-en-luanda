create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create extension if not exists pgcrypto with schema extensions;

create table if not exists private.classified_edit_tokens (
    classified_id uuid primary key references public.classifieds(id) on delete cascade,
    token_hash bytea not null,
    expires_at timestamptz not null,
    used_at timestamptz
);

alter table private.classified_edit_tokens enable row level security;
revoke all on table private.classified_edit_tokens from public, anon, authenticated;

create or replace function private.validate_classified_payload(p_data jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
    v_title text := nullif(btrim(p_data->>'title'), '');
    v_category text := nullif(btrim(p_data->>'category'), '');
    v_price text := coalesce(btrim(p_data->>'price'), '');
    v_contact text := nullif(btrim(p_data->>'contact'), '');
    v_location text := coalesce(nullif(btrim(p_data->>'location'), ''), 'Luanda, Angola');
    v_image_url text := coalesce(btrim(p_data->>'image_url'), '');
    v_description text := nullif(btrim(p_data->>'description'), '');
begin
    if jsonb_typeof(p_data) <> 'object' then
        raise exception 'Los datos del clasificado no son válidos.';
    end if;
    if v_title is null or char_length(v_title) > 100 then
        raise exception 'El título es obligatorio y no puede superar 100 caracteres.';
    end if;
    if v_category not in (
        'Vehículos', 'Inmobiliaria', 'Tecnología', 'Empleos',
        'Ropa y Accesorios', 'Servicios', 'Electrodomésticos', 'Hogar', 'General'
    ) then
        raise exception 'Selecciona una categoría válida.';
    end if;
    if char_length(v_price) > 80 then
        raise exception 'El precio no puede superar 80 caracteres.';
    end if;
    if v_contact is null or char_length(v_contact) > 30
        or v_contact !~ '^[+0-9][0-9[:space:]().-]{6,29}$' then
        raise exception 'Introduce un teléfono o WhatsApp válido.';
    end if;
    if char_length(v_location) > 100 then
        raise exception 'La ubicación no puede superar 100 caracteres.';
    end if;
    if char_length(v_image_url) > 500
        or (v_image_url <> '' and v_image_url !~* '^https://') then
        raise exception 'La dirección de la imagen no es válida.';
    end if;
    if v_description is null or char_length(v_description) > 2000 then
        raise exception 'La descripción es obligatoria y no puede superar 2000 caracteres.';
    end if;

    return jsonb_build_object(
        'title', v_title,
        'category', v_category,
        'price', v_price,
        'contact', v_contact,
        'location', v_location,
        'image_url', v_image_url,
        'description', v_description
    );
end;
$$;
revoke all on function private.validate_classified_payload(jsonb) from public, anon, authenticated;

create or replace function public.publish_classified(p_data jsonb, p_edit_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_data jsonb;
    v_id uuid;
    v_created_at timestamptz;
    v_expires_at timestamptz;
begin
    if p_edit_token is null or char_length(p_edit_token) < 32 or char_length(p_edit_token) > 128 then
        raise exception 'No se pudo crear el acceso de edición.';
    end if;
    v_data := private.validate_classified_payload(p_data);

    insert into public.classifieds (
        title, category, price, contact, location, image_url, description, status
    )
    values (
        v_data->>'title',
        v_data->>'category',
        v_data->>'price',
        v_data->>'contact',
        v_data->>'location',
        v_data->>'image_url',
        v_data->>'description',
        'approved'
    )
    returning id, created_at into v_id, v_created_at;

    v_expires_at := v_created_at + interval '5 minutes';
    insert into private.classified_edit_tokens (classified_id, token_hash, expires_at)
    values (
        v_id,
        extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'),
        v_expires_at
    );

    return jsonb_build_object(
        'id', v_id,
        'title', v_data->>'title',
        'category', v_data->>'category',
        'price', v_data->>'price',
        'contact', v_data->>'contact',
        'location', v_data->>'location',
        'image_url', v_data->>'image_url',
        'description', v_data->>'description',
        'created_at', v_created_at,
        'edit_expires_at', v_expires_at
    );
end;
$$;

create or replace function public.edit_classified_once(
    p_classified_id uuid,
    p_data jsonb,
    p_edit_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_data jsonb;
    v_token_hash bytea;
    v_expires_at timestamptz;
    v_used_at timestamptz;
    v_created_at timestamptz;
begin
    if p_edit_token is null or char_length(p_edit_token) < 32 or char_length(p_edit_token) > 128 then
        raise exception 'El acceso de edición no es válido.';
    end if;
    v_data := private.validate_classified_payload(p_data);

    select token_hash, expires_at, used_at
      into v_token_hash, v_expires_at, v_used_at
      from private.classified_edit_tokens
     where classified_id = p_classified_id
     for update;

    if not found
        or v_used_at is not null
        or v_expires_at <= clock_timestamp()
        or v_token_hash <> extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256') then
        raise exception 'El plazo para editar terminó o el acceso ya fue utilizado.';
    end if;

    update public.classifieds
       set title = v_data->>'title',
           category = v_data->>'category',
           price = v_data->>'price',
           contact = v_data->>'contact',
           location = v_data->>'location',
           image_url = v_data->>'image_url',
           description = v_data->>'description'
     where id = p_classified_id
     returning created_at into v_created_at;

    update private.classified_edit_tokens
       set used_at = clock_timestamp()
     where classified_id = p_classified_id;

    return jsonb_build_object(
        'id', p_classified_id,
        'title', v_data->>'title',
        'category', v_data->>'category',
        'price', v_data->>'price',
        'contact', v_data->>'contact',
        'location', v_data->>'location',
        'image_url', v_data->>'image_url',
        'description', v_data->>'description',
        'created_at', v_created_at
    );
end;
$$;

revoke all on function public.publish_classified(jsonb, text) from public;
revoke all on function public.edit_classified_once(uuid, jsonb, text) from public;
grant execute on function public.publish_classified(jsonb, text) to anon, authenticated;
grant execute on function public.edit_classified_once(uuid, jsonb, text) to anon, authenticated;

revoke insert on public.classifieds from anon, authenticated;
revoke insert (title, category, price, contact, location, image_url, description, status)
    on public.classifieds from anon, authenticated;
