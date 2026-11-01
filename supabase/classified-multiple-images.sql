-- Adds support for up to ten public image URLs per classified.
-- Run after classified-editing.sql.

alter table public.classifieds
    add column if not exists image_urls text[] not null default array[]::text[];

update public.classifieds
   set image_urls = array[image_url]
 where cardinality(image_urls) = 0
   and nullif(btrim(image_url), '') is not null;

alter table public.classifieds
    drop constraint if exists classifieds_image_urls_max_three,
    drop constraint if exists classifieds_image_urls_max_ten,
    add constraint classifieds_image_urls_max_ten
        check (cardinality(image_urls) <= 10);

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
    v_image_input jsonb;
    v_image_item jsonb;
    v_image_url text;
    v_image_urls text[] := array[]::text[];
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

    if p_data ? 'image_urls' then
        v_image_input := p_data->'image_urls';
        if jsonb_typeof(v_image_input) <> 'array' then
            raise exception 'La lista de imágenes no es válida.';
        end if;
    else
        v_image_url := coalesce(btrim(p_data->>'image_url'), '');
        v_image_input := case
            when v_image_url = '' then '[]'::jsonb
            else jsonb_build_array(v_image_url)
        end;
    end if;

    if jsonb_array_length(v_image_input) > 10 then
        raise exception 'Un anuncio puede tener como máximo 10 imágenes.';
    end if;
    for v_image_item in select value from jsonb_array_elements(v_image_input)
    loop
        if jsonb_typeof(v_image_item) <> 'string' then
            raise exception 'La dirección de una imagen no es válida.';
        end if;
        v_image_url := btrim(v_image_item #>> '{}');
        if char_length(v_image_url) > 500 or v_image_url !~* '^https://' then
            raise exception 'La dirección de una imagen no es válida.';
        end if;
        v_image_urls := array_append(v_image_urls, v_image_url);
    end loop;

    if v_description is null or char_length(v_description) > 2000 then
        raise exception 'La descripción es obligatoria y no puede superar 2000 caracteres.';
    end if;

    return jsonb_build_object(
        'title', v_title,
        'category', v_category,
        'price', v_price,
        'contact', v_contact,
        'location', v_location,
        'image_urls', to_jsonb(v_image_urls),
        'image_url', coalesce(v_image_urls[1], ''),
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
        title, category, price, contact, location, image_url, image_urls, description, status
    )
    values (
        v_data->>'title',
        v_data->>'category',
        v_data->>'price',
        v_data->>'contact',
        v_data->>'location',
        v_data->>'image_url',
        array(select jsonb_array_elements_text(v_data->'image_urls')),
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
        'image_urls', v_data->'image_urls',
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
           image_urls = array(select jsonb_array_elements_text(v_data->'image_urls')),
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
        'image_urls', v_data->'image_urls',
        'description', v_data->>'description',
        'created_at', v_created_at
    );
end;
$$;

revoke all on function public.publish_classified(jsonb, text) from public;
revoke all on function public.edit_classified_once(uuid, jsonb, text) from public;
grant execute on function public.publish_classified(jsonb, text) to anon, authenticated;
grant execute on function public.edit_classified_once(uuid, jsonb, text) to anon, authenticated;
