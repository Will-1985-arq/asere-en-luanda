create extension if not exists pgcrypto with schema extensions;

create table if not exists public.public_opinions (
    id uuid primary key default extensions.gen_random_uuid(),
    target_type text not null check (target_type in ('classified', 'event', 'culture')),
    target_id text not null check (char_length(target_id) between 1 and 120),
    alias text check (alias is null or char_length(alias) <= 50),
    comment text not null check (char_length(comment) between 2 and 1000),
    rating smallint check (rating between 1 and 5),
    voter_hash bytea not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now(),
    check ((target_type = 'classified' and rating is not null)
        or (target_type in ('event', 'culture') and rating is null))
);

create unique index if not exists public_opinions_one_classified_vote_idx
    on public.public_opinions (target_id, voter_hash)
    where target_type = 'classified' and rating is not null;

create index if not exists public_opinions_approved_target_created_idx
    on public.public_opinions (target_type, target_id, created_at desc)
    where status = 'approved';

alter table public.public_opinions enable row level security;
revoke all on table public.public_opinions from public, anon, authenticated;

create or replace function public.submit_public_opinion(
    p_target_type text,
    p_target_id text,
    p_alias text,
    p_comment text,
    p_rating smallint,
    p_voter_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_alias text := nullif(btrim(p_alias), '');
    v_comment text := btrim(p_comment);
    v_id uuid;
    v_created_at timestamptz;
begin
    if p_target_type is null
        or p_target_type not in ('classified', 'event', 'culture')
        or p_target_id is null
        or char_length(p_target_id) not between 1 and 120 then
        raise exception 'La publicación seleccionada no es válida.';
    end if;

    if p_target_type = 'classified' then
        if p_target_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            or p_rating is null
            or p_rating not between 1 and 5
            or not exists (
                select 1
                  from public.classifieds
                 where id = p_target_id::uuid
                   and status = 'approved'
            ) then
            raise exception 'El anuncio o la puntuación no son válidos.';
        end if;
    elsif p_target_type = 'event' then
        if p_target_id <> all (array['home-event', 'event-1', 'event-2', 'event-3']) or p_rating is not null then
            raise exception 'El evento seleccionado no es válido.';
        end if;
    elsif p_target_type = 'culture' then
        if p_target_id <> all (array[
            'historia', 'trad-gastro', 'trad-domino', 'trad-carnaval',
            'glossary-1', 'glossary-2', 'glossary-3', 'glossary-4', 'glossary-5', 'glossary-6',
            'art-literature', 'art-music', 'art-cinema', 'art-visual', 'art-dance', 'art-theatre'
        ]) or p_rating is not null then
            raise exception 'La publicación cultural seleccionada no es válida.';
        end if;
    end if;

    if v_alias is not null and char_length(v_alias) > 50 then
        raise exception 'El alias no puede superar 50 caracteres.';
    end if;
    if v_comment is null or char_length(v_comment) not between 2 and 1000 then
        raise exception 'La opinión debe tener entre 2 y 1000 caracteres.';
    end if;
    if p_voter_key is null or char_length(p_voter_key) not between 32 and 128 then
        raise exception 'No se pudo identificar este navegador para registrar la opinión.';
    end if;

    insert into public.public_opinions (
        target_type, target_id, alias, comment, rating, voter_hash
    )
    values (
        p_target_type,
        p_target_id,
        v_alias,
        v_comment,
        p_rating,
        extensions.digest(convert_to(p_voter_key, 'UTF8'), 'sha256')
    )
    returning id, created_at into v_id, v_created_at;

    return jsonb_build_object(
        'id', v_id,
        'status', 'pending',
        'created_at', v_created_at
    );
exception
    when unique_violation then
        raise exception 'Ya enviaste una opinión para esta publicación desde este navegador.';
end;
$$;

create or replace function public.get_public_opinions(
    p_target_type text,
    p_target_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if p_target_type is null
        or p_target_type not in ('classified', 'event', 'culture')
        or p_target_id is null
        or char_length(p_target_id) not between 1 and 120 then
        raise exception 'La publicación seleccionada no es válida.';
    end if;

    if p_target_type = 'classified' then
        if p_target_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            or not exists (
                select 1 from public.classifieds
                 where id = p_target_id::uuid and status = 'approved'
            ) then
            raise exception 'El anuncio seleccionado no existe.';
        end if;
    elsif p_target_type = 'event' and p_target_id <> all (
        array['home-event', 'event-1', 'event-2', 'event-3']
    ) then
        raise exception 'El evento seleccionado no existe.';
    elsif p_target_type = 'culture' and p_target_id <> all (array[
        'historia', 'trad-gastro', 'trad-domino', 'trad-carnaval',
        'glossary-1', 'glossary-2', 'glossary-3', 'glossary-4', 'glossary-5', 'glossary-6',
        'art-literature', 'art-music', 'art-cinema', 'art-visual', 'art-dance', 'art-theatre'
    ]) then
        raise exception 'La publicación cultural seleccionada no existe.';
    end if;

    return (
        with matching as materialized (
            select id, alias, comment, rating, created_at
              from public.public_opinions
             where target_type = p_target_type
               and target_id = p_target_id
               and status = 'approved'
        ),
        summary as (
            select count(*)::integer as opinion_count,
                   count(rating)::integer as rating_count,
                   round(avg(rating)::numeric, 1) as average_rating
              from matching
        ),
        recent as (
            select id, alias, comment, rating, created_at
              from matching
             order by created_at desc
             limit 50
        )
        select jsonb_build_object(
            'opinions',
            coalesce((
                select jsonb_agg(jsonb_build_object(
                    'alias', alias,
                    'comment', comment,
                    'rating', rating,
                    'created_at', created_at
                ) order by created_at desc)
                  from recent
            ), '[]'::jsonb),
            'opinion_count', summary.opinion_count,
            'rating_count', summary.rating_count,
            'average_rating', summary.average_rating,
            'rating_counts',
            coalesce((
                select jsonb_object_agg(stars.rating::text, coalesce(histogram.vote_count, 0))
                  from generate_series(1, 5) as stars(rating)
                  left join (
                      select rating, count(*)::integer as vote_count
                        from matching
                       where rating is not null
                       group by rating
                  ) as histogram using (rating)
            ), '{}'::jsonb)
        )
          from summary
    );
end;
$$;

create or replace function public.get_classified_rating_board()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    with scores as (
        select target_id,
               count(*)::integer as rating_count,
               round(avg(rating)::numeric, 1) as average_rating
          from public.public_opinions
         where target_type = 'classified'
           and status = 'approved'
           and rating is not null
         group by target_id
    ),
    ranked as (
        select c.id,
               c.title,
               c.category,
               c.created_at,
               scores.rating_count,
               scores.average_rating
          from public.classifieds as c
          join scores on scores.target_id = c.id::text
         where c.status = 'approved'
         order by scores.average_rating desc,
                  scores.rating_count desc,
                  c.created_at desc
         limit 10
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'title', title,
                'category', category,
                'rating_count', rating_count,
                'average_rating', average_rating
            )
            order by average_rating desc, rating_count desc, created_at desc
        ),
        '[]'::jsonb
    )
      from ranked;
$$;

revoke all on function public.submit_public_opinion(text, text, text, text, smallint, text) from public;
revoke all on function public.get_public_opinions(text, text) from public;
revoke all on function public.get_classified_rating_board() from public;
grant execute on function public.submit_public_opinion(text, text, text, text, smallint, text) to anon, authenticated;
grant execute on function public.get_public_opinions(text, text) to anon, authenticated;
grant execute on function public.get_classified_rating_board() to anon, authenticated;
