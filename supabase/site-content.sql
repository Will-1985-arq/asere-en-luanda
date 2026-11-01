create table if not exists public.site_content (
    id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 80),
    content_type text not null check (content_type in ('event', 'culture')),
    section text not null check (section in ('event', 'history', 'tradition', 'glossary', 'art')),
    title_es text not null check (char_length(btrim(title_es)) between 1 and 160),
    title_pt text not null check (char_length(btrim(title_pt)) between 1 and 160),
    description_es text not null check (char_length(btrim(description_es)) between 1 and 5000),
    description_pt text not null check (char_length(btrim(description_pt)) between 1 and 5000),
    category_es text,
    category_pt text,
    location_es text,
    location_pt text,
    image_url text check (image_url is null or image_url ~ '^https?://'),
    event_date date,
    event_time time,
    art_category text check (
        art_category is null
        or art_category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
    milestones_es jsonb not null default '[]'::jsonb check (jsonb_typeof(milestones_es) = 'array'),
    milestones_pt jsonb not null default '[]'::jsonb check (jsonb_typeof(milestones_pt) = 'array'),
    sort_order integer not null default 0,
    is_published boolean not null default false,
    is_listed boolean not null default true,
    is_featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (
        (content_type = 'event' and section = 'event'
            and event_date is not null and event_time is not null
            and location_es is not null and location_pt is not null
            and art_category is null and milestones_es = '[]'::jsonb and milestones_pt = '[]'::jsonb)
        or
        (content_type = 'culture' and section <> 'event'
            and event_date is null and event_time is null
            and location_es is null and location_pt is null
            and is_listed and not is_featured
            and ((section = 'art' and art_category is not null) or (section <> 'art' and art_category is null)))
    )
);

create index if not exists site_content_published_order_idx
    on public.site_content (content_type, is_published, sort_order, event_date);

create unique index if not exists site_content_single_featured_event_idx
    on public.site_content (content_type)
    where content_type = 'event' and is_published and is_featured;

create or replace function public.update_site_content_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
    before update on public.site_content
    for each row
    execute function public.update_site_content_updated_at();

alter table public.site_content enable row level security;
revoke all on table public.site_content from public, anon, authenticated;
grant select on table public.site_content to anon, authenticated;

drop policy if exists "Public can read published site content" on public.site_content;
create policy "Public can read published site content"
    on public.site_content
    for select
    to anon, authenticated
    using (is_published);

insert into public.site_content (
    id, content_type, section, title_es, title_pt, description_es, description_pt,
    category_es, category_pt, location_es, location_pt, event_date, event_time,
    sort_order, is_published, is_listed, is_featured
) values
(
    'event-1', 'event', 'event',
    'Gran Gala Rueda de Casino & Kizomba', 'Grande Gala Rueda de Casino & Kizomba',
    'Intercambio de ritmos caribeños y angolanos. Talleres de baile para principiantes y avanzados.',
    'Intercâmbio de ritmos caribenhos e angolanos. Workshops de dança para iniciantes e avançados.',
    'Música & Baile', 'Música & Dança', 'Club Marítimo de Luanda', 'Club Marítimo de Luanda',
    '2026-10-18', '18:00', 10, true, false, false
),
(
    'event-2', 'event', 'event',
    'Taller de Sazones Criollos: Asados y Salsas', 'Workshop de Tempero Crioulo: Assados e Molhos',
    'Aprende los secretos del adobo tradicional cubano combinados con productos locales angolanos.',
    'Aprenda os segredos do tempero tradicional cubano combinados com produtos locais angolanos.',
    'Gastronomía', 'Gastronomia', 'Espacio Cultural Maianga, Luanda', 'Espaço Cultural Maianga, Luanda',
    '2026-11-05', '12:00', 20, true, true, true
),
(
    'event-3', 'event', 'event',
    'Torneo Amistoso de Dominazo & Pelota de Cintas', 'Torneio Amigável de Dominó & Jogos de Tradição',
    'Tarde de dominó por parejas, comida en familia y ambiente fraternal para todas las edades.',
    'Tarde de dominó em duplas, refeição em família e ambiente fraterno para todas as idades.',
    'Deportes & Familia', 'Desporto & Família', 'Parque de la Chicala, Luanda', 'Parque da Chicala, Luanda',
    '2026-12-12', '10:00', 30, true, true, false
)
on conflict (id) do nothing;

insert into public.site_content (
    id, content_type, section, title_es, title_pt, description_es, description_pt,
    category_es, category_pt, art_category, milestones_es, milestones_pt,
    sort_order, is_published
) values
(
    'historia', 'culture', 'history',
    'Historia compartida entre Cuba y Angola', 'História partilhada entre Cuba e Angola',
    'La relación entre Cuba y Angola es un vínculo único forjado en la solidaridad, el respeto mutuo y las raíces africanas que viajaron a través del Atlántico para regresar décadas después en proyectos de cooperación médica, educativa y cultural.' || E'\n\n' ||
    'Desde la década de 1970, miles de profesionales, colaboradores, educadores y médicos han construido puentes humanos de amistad sincera. Hoy en día en Luanda, esta memoria histórica se mantiene viva a través de la próspera comunidad cubana perfectamente integrada en la sociedad angolana.',
    'A relação entre Cuba e Angola é um laço único forjado na solidariedade, respeito mútuo e raízes africanas que viajaram pelo Atlântico para regressar décadas depois em cooperação médica, educativa e cultural.' || E'\n\n' ||
    'Desde a década de 1970, milhares de profissionais, colaboradores, educadores e médicos construíram pontes humanas de amizade sincera. Hoje em Luanda, esta memória histórica permanece viva através da comunidade cubana perfeitamente integrada.',
    null, null, null,
    '[{"title":"Raíces Ancestrales Bantú","body":"La marcada presencia de la cultura bantú de Angola en la música, religión y folclore del Caribe cubano."},{"title":"Cooperación Médica y Educativa","body":"Formación de generaciones de profesionales angolanos y colaboración continua en hospitales e institutos."},{"title":"Integración Familiar y Social","body":"Hogares mixtos cubano-angolanos que enriquecen el día a día de Luanda con tradiciones compartidas."}]'::jsonb,
    '[{"title":"Raízes Ancestrais Bantus","body":"A marcante presença da cultura bantu de Angola na música, religião e folclore do Caribe cubano."},{"title":"Cooperação Médica e Educativa","body":"Formação de gerações de profissionais angolanos e colaboração contínua em hospitais e institutos."},{"title":"Integração Familiar e Social","body":"Lares mistos cubano-angolanos que enriquecem o quotidiano de Luanda com tradições partilhadas."}]'::jsonb,
    10, true
),
(
    'trad-gastro', 'culture', 'tradition',
    'Sazones Criollos & Muamba', 'Temperos Crioulos & Muamba',
    'Encuentro gastronómico inolvidable: el arroz congrí, la yuca con mojo y el lechón asado conviven con la caldeirada de pescado, el funge y la muamba de gallina.',
    'Encontro gastronómico inesquecível: arroz congrí, mandioca com mojo e leitão assado convivem com caldeirada de peixe, funge e muamba de galinha.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 20, true
),
(
    'trad-domino', 'culture', 'tradition',
    'El Dominó y las Kizombadas', 'O Dominó e as Kizombadas',
    'Tardes de dominó por parejas en los patios de Luanda, acompañadas de buena música, conversaciones animadas y ambiente festivo entre amigos.',
    'Tardes de dominó em duplas nos quintais de Luanda, acompanhadas de boa música, conversas animadas e ambiente festivo entre amigos.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 30, true
),
(
    'trad-carnaval', 'culture', 'tradition',
    'Carnaval de Luanda & Comparsas', 'Carnaval de Luanda & Comparsas',
    'El ritmo percutivo de los tambores, la danza alegre y el colorido de los vestuarios conectan el Carnaval de Luanda con las tradicionales parrandas y congas caribeñas.',
    'O ritmo percussivo dos tambores, a dança alegre e o colorido dos trajes conectam o Carnaval de Luanda às tradicionais congas caribenhas.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 40, true
),
(
    'glossary-1', 'culture', 'glossary', 'Asere ↔ Kamba', 'Asere ↔ Kamba',
    'Amigo entrañable, compadre, hermano de la vida.', 'Amigo próximo, compadre, irmão de vida.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 50, true
),
(
    'glossary-2', 'culture', 'glossary', '¿Qué bolá? ↔ Mambo cómo ''stá?', '¿Qué bolá? ↔ Mambo cómo ''stá?',
    'Saludo cotidiano para preguntar qué hay de nuevo o cómo va todo.',
    'Saudação quotidiana para perguntar o que há de novo ou como vai tudo.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 60, true
),
(
    'glossary-3', 'culture', 'glossary', 'Tremendo ambiente ↔ Tá a bater!', 'Tremendo ambiente ↔ Tá a bater!',
    'Expresión utilizada cuando algo está excelente, divertido o animado.',
    'Expressão usada quando algo está excelente, divertido ou animado.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 70, true
),
(
    'glossary-4', 'culture', 'glossary', 'Fiesta ↔ Kizombada', 'Festa ↔ Kizombada',
    'Reunión festiva con buena comida, música alegre y baile entre amigos.',
    'Reunião festiva com boa comida, música alegre e dança entre amigos.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 80, true
),
(
    'glossary-5', 'culture', 'glossary', 'Guagua ↔ Candongueiro', 'Guagua ↔ Candongueiro',
    'Transporte colectivo urbano característico del paisaje diario.',
    'Transporte coletivo urbano caraterístico do quotidiano.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 90, true
),
(
    'glossary-6', 'culture', 'glossary', 'Resolver ↔ Desrascar', 'Resolver ↔ Desrascar',
    'Habilidad para solucionar imprevistos de forma ingeniosa e inmediata.',
    'Habilidade para resolver imprevistos de forma engenhosa e rápida.',
    null, null, null, '[]'::jsonb, '[]'::jsonb, 100, true
),
(
    'art-literature', 'culture', 'art',
    'Poesía y Narrativa Afro-Caribeña', 'Poesia e Narrativa Afro-Caribenha',
    'El encuentro de versos de Nicolás Guillén y Agostinho Neto. Presentaciones de libros, talleres literarios comunitarios y lecturas de poesía bilingüe en Luanda.',
    'O encontro de versos de Nicolás Guillén e Agostinho Neto. Apresentações de livros, workshops literários e leituras de poesia bilingue em Luanda.',
    'Literatura', 'Literatura', 'literatura', '[]'::jsonb, '[]'::jsonb, 110, true
),
(
    'art-music', 'culture', 'art',
    'Fusión de Son, Timba, Semba y Kizomba', 'Fusão de Son, Timba, Semba e Kizomba',
    'La clave cubana y la cadencia angolana conectan orquestas y agrupaciones locales que llenan de alegría las noches culturales de Miramar y Talatona.',
    'A clave cubana e a cadência angolana conectam orquestras e grupos locais que animam as noites culturais de Miramar e Talatona.',
    'Música', 'Música', 'musica', '[]'::jsonb, '[]'::jsonb, 120, true
),
(
    'art-cinema', 'culture', 'art',
    'Muestras de Documentales y Cine Debate', 'Mostras de Documentários e Debate',
    'Proyección de largometrajes históricos, documentales sobre el intercambio cultural y cortometrajes contemporáneos dirigidos por jóvenes creadores.',
    'Exibição de longas-metragens históricas, documentários sobre intercâmbio cultural e curtas-metragens contemporâneas de jovens criadores.',
    'Cine', 'Cinema', 'cine', '[]'::jsonb, '[]'::jsonb, 130, true
),
(
    'art-visual', 'culture', 'art',
    'Pintura, Escultura y Muralismo Urbano', 'Pintura, Escultura e Muralismo Urbano',
    'Exposiciones plásticas de artistas caribeños y africanos. Lienzos coloridos, esculturas en madera y murales que engalanan las calles luandenses.',
    'Exposições plásticas de artistas caribenhos e africanos. Telas coloridas, esculturas em madeira e murais que embelezam as ruas de Luanda.',
    'Artes Visuales y Plásticas', 'Artes Visuais e Plásticas', 'visuales', '[]'::jsonb, '[]'::jsonb, 140, true
),
(
    'art-dance', 'culture', 'art',
    'Rueda de Casino y Danzas Tradicionales', 'Rueda de Casino e Danças Tradicionais',
    'Academias y encuentros populares donde la Salsa, el Casino, la Kizomba, el Kuduro y la Danza Afro se combinan en espectáculos dinámicos.',
    'Academias e encontros populares onde Salsa, Casino, Kizomba, Kuduro e Dança Afro se combinam em espetáculos dinâmicos.',
    'Danza', 'Dança', 'danza', '[]'::jsonb, '[]'::jsonb, 150, true
),
(
    'art-theatre', 'culture', 'art',
    'Teatro Comunitario y Performance', 'Teatro Comunitário e Performance',
    'Obras dramatúrgicas que abordan historias de migración, superación y hermandad. Grupos teatrales comunitarios en centros culturales de la ciudad.',
    'Obras dramatúrgicas sobre histórias de migração, superação e fraternidade. Grupos teatrais comunitários em centros culturais da cidade.',
    'Teatro', 'Teatro', 'teatro', '[]'::jsonb, '[]'::jsonb, 160, true
)
on conflict (id) do nothing;
