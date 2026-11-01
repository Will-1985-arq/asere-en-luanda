/* ================= STATE & INITIAL DATA ================= */
        const SUPABASE_URL = 'https://gurqlrykdcdnqhnsuyhm.supabase.co';
        const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vJA7pquZf7anlnm8nGwsRQ_FOGFuHQ-';
        const CLASSIFIED_EDIT_STORAGE_KEY = 'community-classified-edit-credentials';
        const MAX_CLASSIFIED_IMAGE_INPUT_SIZE_BYTES = 20 * 1024 * 1024;
        const MAX_CLASSIFIED_IMAGE_STORAGE_SIZE_BYTES = 100 * 1024;
        let activeClassifiedEdit = null;
        let classifiedGalleryReturnFocus = null;
        let classifiedEditCredentials = {};
        try {
            const savedCredentials = JSON.parse(readLocalStorage(CLASSIFIED_EDIT_STORAGE_KEY, '{}') || '{}');
            if (savedCredentials && typeof savedCredentials === 'object' && !Array.isArray(savedCredentials)) {
                classifiedEditCredentials = savedCredentials;
            }
        } catch {
            classifiedEditCredentials = {};
        }

        function readLocalStorage(key, fallback = null) {
            try {
                return localStorage.getItem(key) ?? fallback;
            } catch {
                return fallback;
            }
        }

        function writeLocalStorage(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch {
                return false;
            }
        }

        const savedLanguage = readLocalStorage('community-language');
        let currentLang = savedLanguage === 'pt' ? 'pt' : 'es';
        let currentCategory = 'all';

        const classifiedsData = [];
        let sharedClassifiedsStatus = 'loading';
        let siteContent = [];
        let siteContentLoaded = false;
        let siteContentError = false;
        let currentArtCategory = 'all';
        /* ================= I18N DICTIONARY ================= */
        const translations = {
            es: {
                tagline: "Cuba y Angola unidas",
                nav_home: "Inicio",
                nav_about: "Quiénes somos",
                nav_events: "Eventos",
                nav_culture: "Cultura",
                nav_revolicango: "RevolicAngo",
                nav_contact: "Contactos",
                btn_publish: "Publicar Anuncio",
                search_label: "Buscar anuncios",
                search_placeholder: "Buscar vehículos, teléfonos, alquileres, empleos...",
                contact_name_placeholder: "Tu nombre",
                contact_phone_placeholder: "+244...",
                contact_email_placeholder: "ejemplo@correo.com",
                contact_message_placeholder: "Escribe tu mensaje aquí...",
                ad_title_placeholder: "Ej: Venta de Toyota Corolla en excelente estado",
                ad_price_placeholder: "Ej: 150.000 Kz o Consultar",
                ad_contact_placeholder: "+244 936 962 161",
                ad_location_placeholder: "Ej: Miramar, Talatona, Maianga",
                ad_description_placeholder: "Describe el estado del producto, especificaciones o condiciones del servicio...",
                detail_back: "Volver a la lista",
                detail_category: "Categoría",
                detail_price: "Precio",
                detail_location: "Ubicación",
                detail_date: "Publicado",
                detail_when: "Fecha y hora",
                detail_where: "Lugar",
                detail_contact: "Contactar por WhatsApp",
                detail_description: "Detalles",
                detail_reading: "Lectura",
                detail_open: "Ver evento",
                detail_not_found: "No encontramos este contenido.",
                detail_home: "Volver al inicio",
                category_all_heading: "Todos los Clasificados",
                classifieds_badge: "Clasificados de Luanda",
                classified_rating_title: "Clasificados mejor valorados",
                classified_rating_description: "Ranking según las puntuaciones aprobadas de la comunidad.",
                classified_rating_loading: "Cargando puntuaciones…",
                toast_default: "¡Operación completada con éxito!",
                site_content_load_error: "No se pudo cargar el contenido actualizado. Se muestra el contenido de respaldo; inténtalo de nuevo más tarde.",
                site_content_empty: "No hay contenido publicado en esta sección.",

                hero_badge: "El punto de encuentro para la comunidad en Luanda",
                hero_title: "La calidez de Cuba con el corazón de Angola",
                hero_desc: "Conectamos la comunidad cubana y angolana en Luanda. Descubre su cultura, participa en eventos, encuentra servicios profesionales y consulta clasificados en RevolicAngo.",
                hero_btn_revolicango: "Explorar RevolicAngo",
                hero_btn_events: "Próximos Eventos",
                hero_box_title: "Comunidad en Movimiento",
                hero_box_btn: "Publicar Anuncio Ahora",
                stat_classifieds: "Anuncios en RevolicAngo",
                stat_active: "Red Comunitaria Activa",
                stat_bilingual: "Español & Português",
                stat_location: "Luanda, Angola",

                home_revolic_sub: "Mercado y Clasificados",
                home_revolic_title: "Destacados en RevolicAngo",
                view_all: "Ver todas las categorías",
                home_event_tag: "Próximo Encuentro",
                home_event_title: "Taller de Sazones Criollos: Asados y Salsas",
                home_event_date: "Jueves, 5 de noviembre de 2026",
                home_event_desc: "Aprende los secretos del adobo tradicional cubano combinados con productos locales angolanos.",
                see_agenda: "Ver a agenda cultural completa",

                about_title: "Quiénes somos",
                about_subtitle: "Un puente de hermandad, cultura y apoyo mutuo en Luanda.",
                about_badge: "Nuestra Historia",
                about_heading: "Uniendo dos tierras entrañables",
                about_text_1: "@sere en Luanda nace con el propósito de ofrecer un espacio común para los profesionales, colaboradores, familias y emprendedores cubanos radicados en Angola, así como para los hermanos angolanos que aman y valoran la cultura caribeña.",
                about_text_2: "A través de nuestra plataforma, facilitamos el intercambio de información, la difusión de eventos socio-culturales y el intercambio comercial de bienes y servicios éticos mediante nuestra plataforma de anuncios RevolicAngo.",
                mission_title: "Nuestros Pilares",
                pilar_1_title: "Integración Cultural",
                pilar_1_desc: "Promover el respeto, la música, tradiciones y gastronomía que unen a Cuba y Angola.",
                pilar_2_title: "Apoyo Comunitario",
                pilar_2_desc: "Brindar orientación útil a recién llegados e información sobre trámites esenciales.",
                pilar_3_title: "Dinamismo Económico",
                pilar_3_desc: "Conectar oferta y demanda de bienes, vehículos, alquileres y servicios calificados.",

                events_header: "Eventos y agenda cultural",
                events_subheader: "Conciertos, talleres, encuentros sociales y fechas patrias.",
                event_month_oct: "OCT",
                event_month_nov: "NOV",
                event_month_dec: "DIC",
                event_tag_music: "Música & Baile",
                event_tag_gastro: "Gastronomía",
                event_tag_sports: "Deportes & Familia",
                event_1_title: "Gran Gala Rueda de Casino & Kizomba",
                event_1_desc: "Intercambio de ritmos caribeños y angolanos. Talleres de baile para principiantes y avanzados.",
                event_2_title: "Taller de Sazones Criollos: Asados y Salsas",
                event_2_desc: "Aprende los secretos del adobo tradicional cubano combinados con productos locales angolanos.",
                event_3_title: "Torneo Amistoso de Dominazo & Pelota de Cintas",
                event_3_desc: "Tarde de dominó por parejas, comida en familia y ambiente fraternal para todas las edades.",
                btn_reserve: "Solicitar Info",

                culture_header: "Cultura, Argot y Tradición",
                culture_badge: "Patrimonio e Identidad",
                culture_subheader: "Explora la historia, tradiciones y las manifestaciones artísticas que hermanan a Cuba y Angola.",
                culture_tab_historia: "Historia",
                culture_tab_tradiciones: "Tradiciones y Folklor",
                culture_tab_arte: "Arte",
                historia_badge: "Lazos Indisolubles",
                historia_title: "Historia compartida entre Cuba y Angola",
                historia_desc_1: "La relación entre Cuba y Angola es un vínculo único forjado en la solidaridad, el respeto mutuo y las raíces africanas que viajaron a través del Atlántico para regresar décadas después en proyectos de cooperación médica, educativa y cultural.",
                historia_desc_2: "Desde la década de 1970, miles de profesionales, colaboradores, educadores y médicos han construido puentes humanos de amistad sincera. Hoy en día en Luanda, esta memoria histórica se mantiene viva a través de la próspera comunidad cubana perfectamente integrada en la sociedad angolana.",
                historia_milestones_title: "Hitos de Nuestra Hermandad",
                hito_1_t: "Raíces Ancestrales Bantú",
                hito_1_d: "La marcada presencia de la cultura bantú de Angola en la música, religión y folclore del Caribe cubano.",
                hito_2_t: "Cooperación Médica y Educativa",
                hito_2_d: "Formación de generaciones de profesionales angolanos y colaboración continua en hospitales e institutos.",
                hito_3_t: "Integración Familiar y Social",
                hito_3_d: "Hogares mixtos cubano-angolanos que enriquecen el día a día de Luanda con tradiciones compartidas.",

                tradiciones_title: "Tradiciones, Festividades y Folclore",
                tradiciones_sub: "Costumbres compartidas, gastronomía de fusión, reuniones familiares y modismos lingüísticos que definen el estilo de vida comunitaria en Luanda.",
                trad_gastro_title: "Sazones Criollos & Muamba",
                trad_gastro_desc: "Encuentro gastronómico inolvidable: el arroz congrí, la yuca con mojo y el lechón asado conviven con la caldeirada de pescado, el funge y la muamba de gallina.",
                trad_domino_title: "El Dominó y las Kizombadas",
                trad_domino_desc: "Tardes de dominó por parejas en los patios de Luanda, acompañadas de buena música, conversaciones animadas y ambiente festivo entre amigos.",
                trad_carnaval_title: "Carnaval de Luanda & Comparsas",
                trad_carnaval_desc: "El ritmo percutivo de los tambores, la danza alegre y el colorido de los vestuarios conectan el Carnaval de Luanda con las tradicionales parrandas y congas caribeñas.",

                arte_title: "Arte y Expresiones Creativas",
                arte_sub: "Descubre el talento, proyectos colaborativos y manifestaciones artísticas de ambas naciones.",
                art_cat_all: "Todas las Artes",
                art_cat_lit: "Literatura",
                art_cat_mus: "Música",
                art_cat_cine: "Cine",
                art_cat_vis: "Artes Visuales y Plásticas",
                art_cat_danza: "Danza",
                art_cat_teatro: "Teatro",

                art_lit_title: "Poesía y Narrativa Afro-Caribeña",
                art_lit_desc: "El encuentro de versos de Nicolás Guillén y Agostinho Neto. Presentaciones de libros, talleres literarios comunitarios y lecturas de poesía bilingüe en Luanda.",
                art_mus_title: "Fusión de Son, Timba, Semba y Kizomba",
                art_mus_desc: "La clave cubana y la cadencia angolana conectan orquestas y agrupaciones locales que llenan de alegría las noches culturales de Miramar y Talatona.",
                art_cine_title: "Muestras de Documentales y Cine Debate",
                art_cine_desc: "Proyección de largometrajes históricos, documentales sobre el intercambio cultural y cortometrajes contemporáneos dirigidos por jóvenes creadores.",
                art_vis_title: "Pintura, Escultura y Muralismo Urbano",
                art_vis_desc: "Exposiciones plásticas de artistas caribeños y africanos. Lienzos coloridos, esculturas en madera y murales que engalanan las calles luandenses.",
                art_danza_title: "Rueda de Casino y Danzas Tradicionales",
                art_danza_desc: "Academias y encuentros populares donde la Salsa, el Casino, la Kizomba, el Kuduro y la Danza Afro se combinan en espectáculos dinámicos.",
                art_teatro_title: "Teatro Comunitario y Performance",
                art_teatro_desc: "Obras dramatúrgicas que abordan historias de migración, superación y hermandad. Grupos teatrales comunitarios en centros culturales de la ciudad.",

                glossary_title: "Glosario Cubano - Angolano",
                glossary_sub: "Conoce los términos más populares usados en el día a día en Luanda.",
                glossary_1: "Amigo entrañable, compadre, hermano de la vida.",
                glossary_2: "Saludo cotidiano para preguntar qué hay de nuevo o cómo va todo.",
                glossary_3: "Expresión utilizada cuando algo está excelente, divertido o animado.",
                glossary_4: "Reunión festiva con buena comida, música alegre y baile entre amigos.",
                glossary_5: "Transporte colectivo urbano característico del paisaje diario.",
                glossary_6: "Habilidad para solucionar imprevistos de forma ingeniosa e inmediata.",

                revolic_sub: "El portal de compra, venta, alquileres y servicios de la comunidad.",
                cat_all: "Todos",
                cat_vehiculos: "Vehículos",
                cat_inmobiliaria: "Inmobiliaria",
                cat_tecnologia: "Tecnología",
                cat_empleos: "Empleos",
                cat_ropa: "Ropa y Accesorios",
                cat_servicios: "Servicios",
                cat_electro: "Electrodomésticos",
                cat_hogar: "Hogar",
                cat_general: "General",
                classifieds_loading: "Cargando clasificados…",
                classifieds_load_error: "No se pudieron cargar los anuncios. Recarga la página para intentarlo de nuevo.",
                no_ads_title: "No se encontraron anuncios",
                no_ads_desc: "Sé el primero en publicar un clasificado en esta categoría.",

                contact_header: "Contactos & Atención",
                contact_subheader: "Estamos para escucharte, asesorarte y conectar contigo en Luanda.",
                contact_info_title: "Información Directa",
                click_chat: "Haz clic para chatear directamente",
                label_phone: "Teléfono Directo",
                label_location: "Ubicación",
                contact_form_title: "Envíanos un Mensaje",
                form_name: "Nombre Completo",
                form_phone: "Teléfono / WhatsApp",
                form_email: "Correo Electrónico",
                form_subject: "Asunto",
                opt_general: "Consulta General",
                opt_revolicango: "Soporte Anuncios RevolicAngo",
                opt_events: "Propuesta de Eventos / Cultura",
                opt_commercial: "Publicidad y Alianzas",
                form_msg: "Mensaje",
                btn_send: "Enviar Mensaje",

                modal_title: "Publicar Anuncio en RevolicAngo",
                modal_sub: "Llega a toda la comunidad de Luanda de forma rápida.",
                modal_field_title: "Título del Anuncio *",
                modal_field_cat: "Categoría *",
                modal_field_price: "Precio (AOA o USD)",
                modal_field_phone: "Teléfono / WhatsApp de Contacto *",
                modal_field_loc: "Municipio / Zona en Luanda",
                modal_field_img: "Imagen desde tu dispositivo (Opcional)",
                modal_img_help: "Hasta 10 imágenes JPG, PNG o WebP de hasta 20 MB cada una. Se comprimen a un máximo de 100 KB antes de subirlas. Al editar, si no eliges nuevas, se conservan las anteriores.",
                modal_field_desc: "Descripción Detallada *",
                ad_contact_consent: "Acepto que mi teléfono y los datos de este anuncio se publiquen y sean visibles públicamente.",
                btn_edit_classified: "Editar anuncio (una vez, en los primeros 5 minutos)",
                btn_save_classified_edits: "Guardar corrección",
                btn_publish_classified: "Publicar Anuncio",
                btn_cancel: "Cancelar",
                btn_submit_ad: "Publicar Anuncio",

                footer_about: "Comunidad y directorio informativo para unir lazos culturales y comerciales en Angola.",
                footer_links: "Navegación",
                footer_subpages: "Categorías RevolicAngo",
                footer_contact: "Contacto Directo",
                footer_tag: "Unidad, Cultura y Hermandad",
                footer_rights: "Todos los derechos reservados."
            },
            pt: {
                tagline: "Cuba e Angola unidas",
                nav_home: "Início",
                nav_about: "Quem Somos",
                nav_events: "Eventos",
                nav_culture: "Cultura",
                nav_revolicango: "RevolicAngo",
                nav_contact: "Contactos",
                btn_publish: "Publicar anúncio",
                search_label: "Pesquisar anúncios",
                search_placeholder: "Pesquisar veículos, telemóveis, casas para arrendar, empregos...",
                contact_name_placeholder: "O seu nome",
                contact_phone_placeholder: "+244...",
                contact_email_placeholder: "exemplo@dominio.pt",
                contact_message_placeholder: "Escreva a sua mensagem aqui...",
                ad_title_placeholder: "Ex.: Venda de Toyota Corolla em excelente estado",
                ad_price_placeholder: "Ex.: 150.000 Kz ou consultar",
                ad_contact_placeholder: "+244 936 962 161",
                ad_location_placeholder: "Ex.: Miramar, Talatona, Maianga",
                ad_description_placeholder: "Descreva o estado do produto, especificações ou condições do serviço...",
                detail_back: "Voltar à lista",
                detail_category: "Categoria",
                detail_price: "Preço",
                detail_location: "Localização",
                detail_date: "Publicado",
                detail_when: "Data e hora",
                detail_where: "Local",
                detail_contact: "Contactar pelo WhatsApp",
                detail_description: "Detalhes",
                detail_reading: "Leitura",
                detail_open: "Ver evento",
                detail_not_found: "Não foi possível encontrar este conteúdo.",
                detail_home: "Voltar ao início",
                category_all_heading: "Todos os anúncios",
                classifieds_badge: "Classificados de Luanda",
                classified_rating_title: "Anúncios mais bem avaliados",
                classified_rating_description: "Classificação com base nas avaliações aprovadas pela comunidade.",
                classified_rating_loading: "A carregar as avaliações…",
                toast_default: "Operação concluída com êxito!",
                culture_badge: "Património e identidade",
                site_content_load_error: "Não foi possível carregar o conteúdo atualizado. A apresentar o conteúdo predefinido; tente novamente mais tarde.",
                site_content_empty: "Não há conteúdo publicado nesta secção.",

                hero_badge: "O ponto de encontro para a comunidade em Luanda",
                hero_title: "O calor de Cuba com o coração de Angola",
                hero_desc: "Unimos as comunidades cubana e angolana em Luanda. Descubra as suas culturas, participe em eventos, encontre serviços profissionais e consulte os anúncios do RevolicAngo.",
                hero_btn_revolicango: "Explorar o RevolicAngo",
                hero_btn_events: "Próximos eventos",
                hero_box_title: "Comunidade em movimento",
                hero_box_btn: "Publicar anúncio agora",
                stat_classifieds: "Anúncios no RevolicAngo",
                stat_active: "Rede Comunitária Ativa",
                stat_bilingual: "Espanhol e português",
                stat_location: "Luanda, Angola",

                home_revolic_sub: "Mercado de anúncios",
                home_revolic_title: "Anúncios em destaque no RevolicAngo",
                view_all: "Ver todas as categorias",
                home_event_tag: "Próximo evento",
                home_event_title: "Oficina de temperos crioulos: assados e molhos",
                home_event_date: "Quinta-feira, 5 de novembro de 2026",
                home_event_desc: "Aprenda os segredos da marinada tradicional cubana, combinada com produtos locais angolanos.",
                see_agenda: "Ver a agenda cultural completa",

                about_title: "Quem somos",
                about_subtitle: "Uma ponte de amizade, cultura e apoio mútuo em Luanda.",
                about_badge: "A nossa história",
                about_heading: "Unindo duas terras irmãs",
                about_text_1: "O @sere em Luanda nasceu para oferecer um espaço comum a profissionais, cooperantes, famílias e empreendedores cubanos residentes em Angola, bem como a angolanos que apreciam a cultura caribenha.",
                about_text_2: "Através da nossa plataforma, facilitamos a partilha de informação, a divulgação de eventos socioculturais e o comércio responsável de bens e serviços no RevolicAngo.",
                mission_title: "Os nossos pilares",
                pilar_1_title: "Integração Cultural",
                pilar_1_desc: "Promover o respeito, a música, as tradições e a gastronomia que unem Cuba e Angola.",
                pilar_2_title: "Apoio Comunitário",
                pilar_2_desc: "Orientar quem acaba de chegar e fornecer informações sobre procedimentos essenciais.",
                pilar_3_title: "Dinamismo Económico",
                pilar_3_desc: "Ligar quem procura a quem oferece bens, veículos, casas para arrendar e serviços especializados.",

                events_header: "Eventos e agenda cultural",
                events_subheader: "Concertos, oficinas, encontros e datas comemorativas.",
                event_tag_music: "Música e dança",
                event_tag_gastro: "Gastronomia",
                event_tag_sports: "Desporto e família",
                event_1_title: "Grande gala de Rueda de Casino e Kizomba",
                event_1_desc: "Encontro de ritmos caribenhos e angolanos. Aulas de dança para principiantes e avançados.",
                event_2_title: "Oficina de temperos crioulos: assados e molhos",
                event_2_desc: "Aprenda os segredos da marinada tradicional cubana, combinada com produtos locais angolanos.",
                event_3_title: "Torneio amigável de dominó e jogos tradicionais",
                event_3_desc: "Tarde de dominó em duplas, refeição em família e convívio para todas as idades.",
                btn_reserve: "Pedir informações",

                culture_header: "Cultura, expressões e tradição",
                culture_subheader: "Explore a história, as tradições e as manifestações artísticas que unem Cuba e Angola.",
                culture_tab_historia: "História",
                culture_tab_tradiciones: "Tradições e Folclore",
                culture_tab_arte: "Arte",
                historia_badge: "Laços Indissolúveis",
                historia_title: "História partilhada entre Cuba e Angola",
                historia_desc_1: "A relação entre Cuba e Angola é um laço singular, forjado na solidariedade, no respeito mútuo e nas raízes africanas que atravessaram o Atlântico e regressaram, décadas depois, através de projetos de cooperação médica, educativa e cultural.",
                historia_desc_2: "Desde a década de 1970, milhares de profissionais, cooperantes, educadores e médicos construíram pontes de amizade. Hoje, em Luanda, esta memória histórica mantém-se viva numa comunidade cubana próspera e plenamente integrada na sociedade angolana.",
                historia_milestones_title: "Marcos da nossa amizade",
                hito_1_t: "Raízes ancestrais bantu",
                hito_1_d: "A forte presença da cultura bantu de Angola na música, na religião e no folclore das Caraíbas cubanas.",
                hito_2_t: "Cooperação médica e educativa",
                hito_2_d: "Formação de várias gerações de profissionais angolanos e cooperação contínua em hospitais e institutos.",
                hito_3_t: "Integração familiar e social",
                hito_3_d: "Famílias cubano-angolanas que enriquecem o quotidiano de Luanda com tradições partilhadas.",

                tradiciones_title: "Tradições, festividades e folclore",
                tradiciones_sub: "Costumes partilhados, gastronomia de fusão, convívios familiares e expressões que definem a vida comunitária em Luanda.",
                trad_gastro_title: "Temperos crioulos e muamba",
                trad_gastro_desc: "Um encontro gastronómico inesquecível: arroz congrí, mandioca com mojo e leitão assado convivem com caldeirada de peixe, funge e muamba de galinha.",
                trad_domino_title: "O dominó e as kizombadas",
                trad_domino_desc: "Tardes de dominó em duplas nos quintais de Luanda, acompanhadas por boa música, conversas animadas e um ambiente festivo entre amigos.",
                trad_carnaval_title: "Carnaval de Luanda e grupos carnavalescos",
                trad_carnaval_desc: "O ritmo dos tambores, a dança e a cor dos trajes aproximam o Carnaval de Luanda das tradicionais parrandas e congas das Caraíbas.",

                arte_title: "Arte e expressão criativa",
                arte_sub: "Descubra o talento, os projetos de colaboração e as manifestações artísticas dos dois países.",
                art_cat_all: "Todas as artes",
                art_cat_lit: "Literatura",
                art_cat_mus: "Música",
                art_cat_cine: "Cinema",
                art_cat_vis: "Artes visuais e plásticas",
                art_cat_danza: "Dança",
                art_cat_teatro: "Teatro",

                art_lit_title: "Poesia e narrativa afro-caribenha",
                art_lit_desc: "O encontro dos versos de Nicolás Guillén e Agostinho Neto. Apresentações de livros, oficinas literárias e leituras de poesia bilingue em Luanda.",
                art_mus_title: "Fusão de son, timba, semba e kizomba",
                art_mus_desc: "A clave cubana e a cadência angolana unem orquestras e grupos locais que animam as noites culturais de Miramar e Talatona.",
                art_cine_title: "Mostras de documentários e sessões de debate",
                art_cine_desc: "Exibição de longas-metragens históricas, documentários sobre intercâmbio cultural e curtas-metragens contemporâneas de jovens criadores.",
                art_vis_title: "Pintura, escultura e muralismo urbano",
                art_vis_desc: "Exposições de artes plásticas de artistas caribenhos e africanos. Pinturas coloridas, esculturas em madeira e murais que embelezam as ruas de Luanda.",
                art_danza_title: "Rueda de Casino e danças tradicionais",
                art_danza_desc: "Academias e encontros populares onde a salsa, o casino, a kizomba, o kuduro e a dança afro se combinam em espetáculos dinâmicos.",
                art_teatro_title: "Teatro comunitário e expressão performativa",
                art_teatro_desc: "Peças sobre migração, superação e amizade. Grupos de teatro comunitário apresentam-se em centros culturais da cidade.",

                glossary_title: "Glossário cubano-angolano",
                glossary_sub: "Conheça algumas das expressões mais usadas no dia a dia em Luanda.",
                glossary_1: "Amigo chegado, compadre, irmão de coração.",
                glossary_2: "Saudação do dia a dia para perguntar o que há de novo ou como está tudo.",
                glossary_3: "Expressão usada quando algo é excelente, divertido ou animado.",
                glossary_4: "Convívio festivo com boa comida, música e dança entre amigos.",
                glossary_5: "Transporte coletivo urbano típico do quotidiano.",
                glossary_6: "Capacidade de resolver imprevistos de forma engenhosa e rápida.",

                revolic_sub: "O portal de compra, venda, arrendamento e serviços da comunidade.",
                cat_all: "Todos",
                cat_vehiculos: "Veículos",
                cat_inmobiliaria: "Imobiliária",
                cat_tecnologia: "Tecnologia",
                cat_empleos: "Empregos",
                cat_ropa: "Vestuário e Acessórios",
                cat_servicios: "Serviços",
                cat_electro: "Eletrodomésticos",
                cat_hogar: "Lar e Casa",
                cat_general: "Geral",
                classifieds_loading: "A carregar anúncios…",
                classifieds_load_error: "Não foi possível carregar os anúncios. Atualize a página para tentar novamente.",
                no_ads_title: "Nenhum anúncio encontrado",
                no_ads_desc: "Seja a primeira pessoa a publicar um anúncio nesta categoria.",

                contact_header: "Contactos e atendimento",
                contact_subheader: "Estamos aqui para o ouvir, aconselhar e ajudar a criar ligações em Luanda.",
                contact_info_title: "Informação direta",
                click_chat: "Clique para falar connosco diretamente",
                label_phone: "Telefone direto",
                label_location: "Localização",
                contact_form_title: "Envie-nos uma Mensagem",
                form_name: "Nome completo",
                form_phone: "Telefone / WhatsApp",
                form_email: "Correio Eletrónico",
                form_subject: "Assunto",
                opt_general: "Pedido geral",
                opt_revolicango: "Apoio a anúncios do RevolicAngo",
                opt_events: "Proposta de evento ou atividade cultural",
                opt_commercial: "Publicidade e parcerias",
                form_msg: "Mensagem",
                btn_send: "Enviar mensagem",

                modal_title: "Publicar anúncio no RevolicAngo",
                modal_sub: "Chegue rapidamente a toda a comunidade de Luanda.",
                modal_field_title: "Título do anúncio *",
                modal_field_cat: "Categoria *",
                modal_field_price: "Preço (AOA ou USD)",
                modal_field_phone: "Telefone / WhatsApp para contacto *",
                modal_field_loc: "Município / Zona em Luanda",
                modal_field_img: "Imagem do seu dispositivo (opcional)",
                modal_img_help: "Até 10 imagens JPG, PNG ou WebP, com um máximo de 20 MB cada. Antes do envio, são comprimidas para um máximo de 100 KB. Ao editar, se não selecionar novas imagens, as anteriores serão mantidas.",
                modal_field_desc: "Descrição detalhada *",
                ad_contact_consent: "Aceito que o meu telefone e os dados deste anúncio sejam publicados e fiquem visíveis publicamente.",
                btn_edit_classified: "Editar anúncio (uma vez, nos primeiros 5 minutos)",
                btn_save_classified_edits: "Guardar correção",
                btn_publish_classified: "Publicar anúncio",
                event_month_oct: "OUT",
                event_month_nov: "NOV",
                event_month_dec: "DEZ",
                btn_cancel: "Cancelar",
                btn_submit_ad: "Publicar anúncio",

                footer_about: "Comunidade e diretório informativo para unir laços culturais e comerciais em Angola.",
                footer_links: "Navegação",
                footer_subpages: "Categorias RevolicAngo",
                footer_contact: "Contacto direto",
                footer_tag: "Unidade, Cultura e Fraternidade",
                footer_rights: "Todos os direitos reservados."
            }
        };

        const eventArticles = [
            { id: 'home-event', titleKey: 'home_event_title', categoryKey: 'event_tag_gastro', bodyKey: 'home_event_desc', whenKey: 'home_event_date', location: 'Espacio Cultural Maianga, Luanda' },
            { id: 'event-1', titleKey: 'event_1_title', categoryKey: 'event_tag_music', bodyKey: 'event_1_desc', monthKey: 'event_month_oct', day: '18', time: '18:00', location: 'Club Marítimo de Luanda' },
            { id: 'event-2', titleKey: 'event_2_title', categoryKey: 'event_tag_gastro', bodyKey: 'event_2_desc', monthKey: 'event_month_nov', day: '05', time: '12:00', location: 'Espacio Cultural Maianga, Luanda' },
            { id: 'event-3', titleKey: 'event_3_title', categoryKey: 'event_tag_sports', bodyKey: 'event_3_desc', monthKey: 'event_month_dec', day: '12', time: '10:00', location: 'Parque de la Chicala, Luanda' }
        ];

        const cultureArticles = [
            { id: 'historia', tab: 'historia', titleKey: 'historia_title', bodyKeys: ['historia_desc_1', 'historia_desc_2'], milestones: [
                { titleKey: 'hito_1_t', bodyKey: 'hito_1_d' },
                { titleKey: 'hito_2_t', bodyKey: 'hito_2_d' },
                { titleKey: 'hito_3_t', bodyKey: 'hito_3_d' }
            ] },
            { id: 'trad-gastro', tab: 'tradiciones', titleKey: 'trad_gastro_title', bodyKeys: ['trad_gastro_desc'] },
            { id: 'trad-domino', tab: 'tradiciones', titleKey: 'trad_domino_title', bodyKeys: ['trad_domino_desc'] },
            { id: 'trad-carnaval', tab: 'tradiciones', titleKey: 'trad_carnaval_title', bodyKeys: ['trad_carnaval_desc'] },
            { id: 'glossary-1', tab: 'tradiciones', title: 'Asere ↔ Kamba', bodyKeys: ['glossary_1'] },
            { id: 'glossary-2', tab: 'tradiciones', title: '¿Qué bolá? ↔ Mambo cómo \'stá?', bodyKeys: ['glossary_2'] },
            { id: 'glossary-3', tab: 'tradiciones', title: 'Tremendo ambiente ↔ Tá a bater!', bodyKeys: ['glossary_3'] },
            { id: 'glossary-4', tab: 'tradiciones', title: 'Fiesta ↔ Kizombada', bodyKeys: ['glossary_4'] },
            { id: 'glossary-5', tab: 'tradiciones', title: 'Guagua ↔ Candongueiro', bodyKeys: ['glossary_5'] },
            { id: 'glossary-6', tab: 'tradiciones', title: 'Resolver ↔ Desrascar', bodyKeys: ['glossary_6'] },
            { id: 'art-literature', tab: 'arte', artCategory: 'literatura', titleKey: 'art_lit_title', categoryKey: 'art_cat_lit', bodyKeys: ['art_lit_desc'] },
            { id: 'art-music', tab: 'arte', artCategory: 'musica', titleKey: 'art_mus_title', categoryKey: 'art_cat_mus', bodyKeys: ['art_mus_desc'] },
            { id: 'art-cinema', tab: 'arte', artCategory: 'cine', titleKey: 'art_cine_title', categoryKey: 'art_cat_cine', bodyKeys: ['art_cine_desc'] },
            { id: 'art-visual', tab: 'arte', artCategory: 'visuales', titleKey: 'art_vis_title', categoryKey: 'art_cat_vis', bodyKeys: ['art_vis_desc'] },
            { id: 'art-dance', tab: 'arte', artCategory: 'danza', titleKey: 'art_danza_title', categoryKey: 'art_cat_danza', bodyKeys: ['art_danza_desc'] },
            { id: 'art-theatre', tab: 'arte', artCategory: 'teatro', titleKey: 'art_teatro_title', categoryKey: 'art_cat_teatro', bodyKeys: ['art_teatro_desc'] }
        ];

        /* ================= NAVIGATION CONTROLLER ================= */
        function navigateTo(pageId, category) {
            const pageFiles = {
                inicio: 'index.html',
                'quienes-somos': 'quienes-somos.html',
                eventos: 'eventos.html',
                cultura: 'cultura.html',
                revolicango: 'revolicango.html',
                contactos: 'contactos.html'
            };
            if (pageFiles[pageId]) {
                const query = pageId === 'revolicango' && category ? '?category=' + encodeURIComponent(category) : '';
                window.location.href = pageFiles[pageId] + query;
            }
        }

        function upgradeInertLinks() {
            const pageFiles = {
                inicio: 'index.html',
                'quienes-somos': 'quienes-somos.html',
                eventos: 'eventos.html',
                cultura: 'cultura.html',
                revolicango: 'revolicango.html',
                contactos: 'contactos.html'
            };

            document.querySelectorAll('a[href="javascript:void(0)"]').forEach(anchor => {
                const handler = anchor.getAttribute('onclick') || '';
                const pageMatch = handler.match(/navigateTo\('([^']+)'\)/);
                const directMatch = handler.match(/window\.location\.href='([^']+)'/);
                if (pageMatch && pageFiles[pageMatch[1]]) anchor.href = pageFiles[pageMatch[1]];
                else if (directMatch) anchor.href = directMatch[1];
            });
        }

        function localizedSiteText(item, field) {
            return item[`${field}_${currentLang}`] || item[`${field}_es`] || '';
        }

        function siteEventDate(item) {
            const [year, month, day] = String(item.event_date || '').split('-').map(Number);
            if (!year || !month || !day) return null;
            return new Date(year, month - 1, day, 12);
        }

        function formatSiteEventDate(item, options = {}) {
            const date = siteEventDate(item);
            return date
                ? new Intl.DateTimeFormat(currentLang === 'es' ? 'es' : 'pt-PT', options).format(date)
                : '';
        }

        function formatSiteEventTime(item) {
            const time = String(item.event_time || '').slice(0, 5);
            return time ? `${time} ${currentLang === 'es' ? 'hrs' : 'h'}` : '';
        }

        function renderSiteContentError() {
            const message = siteContentError ? translations[currentLang].site_content_load_error : '';
            document.querySelectorAll('#site-content-error').forEach(status => {
                status.textContent = message;
                status.classList.toggle('hidden', !siteContentError);
            });

            const detail = document.getElementById('detail-content');
            if (!detail) return;
            let notice = detail.querySelector('.site-content-error');
            if (!siteContentError) {
                notice?.remove();
                return;
            }
            if (!notice) {
                notice = document.createElement('p');
                notice.className = 'site-content-error text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4';
                notice.setAttribute('role', 'status');
                notice.setAttribute('aria-live', 'polite');
                detail.prepend(notice);
            }
            notice.textContent = message;
        }

        function renderSiteEventCard(item) {
            const day = formatSiteEventDate(item, { day: '2-digit' });
            const month = formatSiteEventDate(item, { month: 'short' }).replace('.', '').toUpperCase();
            const category = localizedSiteText(item, 'category');
            const title = localizedSiteText(item, 'title');
            const location = localizedSiteText(item, 'location');
            const time = formatSiteEventTime(item);
            return `
                <article class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                    ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(title)}" class="w-full md:w-40 h-40 md:h-28 object-cover rounded-xl" loading="lazy">` : ''}
                    <div class="flex items-center gap-6">
                        <div class="bg-brand-navy text-white rounded-2xl w-20 h-20 flex flex-col items-center justify-center shrink-0 font-bold">
                            <span class="text-xs uppercase">${escapeHtml(month)}</span>
                            <span class="text-2xl font-extrabold">${escapeHtml(day)}</span>
                        </div>
                        <div class="space-y-2">
                            <span class="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">${escapeHtml(category)}</span>
                            <h2 class="font-serif text-xl font-bold text-brand-navy"><a href="detalle.html?tipo=evento&id=${encodeURIComponent(item.id)}" class="hover:text-brand-terracotta">${escapeHtml(title)}</a></h2>
                            <p class="text-sm text-slate-600"><i class="fa-solid fa-location-dot text-brand-navy mr-1"></i> ${escapeHtml(location)} | ${escapeHtml(time)}</p>
                        </div>
                    </div>
                    <a href="detalle.html?tipo=evento&id=${encodeURIComponent(item.id)}" class="text-brand-terracotta font-bold text-sm hover:underline shrink-0">${escapeHtml(translations[currentLang].detail_open)}</a>
                </article>
            `;
        }

        function renderCultureCard(item, icon, categoryLabel = '') {
            return `
                <a href="detalle.html?tipo=cultura&id=${encodeURIComponent(item.id)}" class="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta">
                    ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(localizedSiteText(item, 'title'))}" class="w-full h-40 object-cover rounded-xl mb-4" loading="lazy">` : ''}
                    <span class="flex items-center gap-4">
                        <span class="w-12 h-12 rounded-xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center text-xl"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
                        <span>
                            ${categoryLabel ? `<span class="block text-xs font-bold uppercase text-brand-terracotta">${escapeHtml(categoryLabel)}</span>` : ''}
                            <span class="font-serif font-bold text-xl text-brand-navy hover:text-brand-terracotta">${escapeHtml(localizedSiteText(item, 'title'))}</span>
                        </span>
                    </span>
                </a>
            `;
        }

        function renderDynamicSiteContent() {
            if (!siteContentLoaded) return;
            const events = siteContent.filter(item => item.content_type === 'event');
            const listedEvents = events
                .filter(item => item.is_listed)
                .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)) || a.sort_order - b.sort_order);
            const eventList = document.getElementById('events-list');
            if (eventList) {
                eventList.innerHTML = listedEvents.length
                    ? listedEvents.map(renderSiteEventCard).join('')
                    : `<p class="text-slate-600 bg-white rounded-xl border border-slate-200 p-6">${escapeHtml(translations[currentLang].site_content_empty)}</p>`;
            }

            const featured = events.find(item => item.is_featured);
            const featuredLink = document.getElementById('home-featured-event');
            const featuredDate = document.getElementById('home-featured-event-date');
            const featuredDescription = document.getElementById('home-featured-event-description');
            const featuredImage = document.getElementById('home-featured-event-image');
            const featuredSpotlight = document.getElementById('home-event-spotlight');
            if (featuredSpotlight) featuredSpotlight.classList.toggle('hidden', !featured);
            if (featured) {
                if (featuredLink) {
                    featuredLink.textContent = localizedSiteText(featured, 'title');
                    featuredLink.href = 'detalle.html?tipo=evento&id=home-event';
                }
                if (featuredDate) {
                    featuredDate.textContent = formatSiteEventDate(featured, {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    });
                }
                if (featuredDescription) featuredDescription.textContent = localizedSiteText(featured, 'description');
                if (featuredImage) {
                    if (featured.image_url) {
                        featuredImage.src = featured.image_url;
                        featuredImage.alt = localizedSiteText(featured, 'title');
                        featuredImage.classList.remove('hidden');
                    } else {
                        featuredImage.removeAttribute('src');
                        featuredImage.alt = '';
                        featuredImage.classList.add('hidden');
                    }
                }
            }

            const culture = siteContent.filter(item => item.content_type === 'culture');
            const history = culture.find(item => item.section === 'history');
            const historyCard = document.getElementById('culture-history-card');
            if (history && historyCard) {
                historyCard.href = `detalle.html?tipo=cultura&id=${encodeURIComponent(history.id)}`;
                historyCard.innerHTML = `
                    <span class="w-14 h-14 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center text-2xl shrink-0"><i class="fa-solid fa-landmark" aria-hidden="true"></i></span>
                    <span>
                        <span class="block text-xs font-bold uppercase text-brand-terracotta">${escapeHtml(currentLang === 'es' ? 'Lazos Indisolubles' : 'Laços Indissolúveis')}</span>
                        <span class="block font-serif text-2xl font-bold text-brand-navy hover:text-brand-terracotta">${escapeHtml(localizedSiteText(history, 'title'))}</span>
                    </span>
                `;
            }

            const traditionIcons = {
                'trad-gastro': 'fa-utensils',
                'trad-domino': 'fa-dice',
                'trad-carnaval': 'fa-drum'
            };
            const traditionGrid = document.getElementById('culture-tradition-cards');
            if (traditionGrid) {
                const traditions = culture.filter(item => item.section === 'tradition');
                traditionGrid.innerHTML = traditions.length
                    ? traditions.map(item => renderCultureCard(item, traditionIcons[item.id] || 'fa-masks-theater')).join('')
                    : `<p class="text-slate-600">${escapeHtml(translations[currentLang].site_content_empty)}</p>`;
            }

            const glossaryGrid = document.getElementById('culture-glossary-cards');
            if (glossaryGrid) {
                const glossary = culture.filter(item => item.section === 'glossary');
                glossaryGrid.innerHTML = glossary.length
                    ? glossary.map(item => `
                        <a href="detalle.html?tipo=cultura&id=${encodeURIComponent(item.id)}" class="p-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-brand-navy hover:text-brand-terracotta">
                            ${escapeHtml(localizedSiteText(item, 'title'))}
                        </a>
                    `).join('')
                    : `<p class="text-slate-600">${escapeHtml(translations[currentLang].site_content_empty)}</p>`;
            }

            const artItems = culture.filter(item => item.section === 'art');
            const artCategories = [...new Map(artItems.map(item => [
                item.art_category,
                localizedSiteText(item, 'category')
            ]))];
            const artFilters = document.getElementById('art-category-filters');
            if (artFilters) {
                artFilters.innerHTML = `
                    <button onclick="filterArtCategory('all')" id="art-cat-all" class="art-pill px-4 py-2 rounded-xl bg-brand-navy text-white shrink-0 transition-all">${escapeHtml(translations[currentLang].art_cat_all)}</button>
                    ${artCategories.map(([slug, label]) => `
                        <button onclick="filterArtCategory('${escapeHtml(slug)}')" id="art-cat-${escapeHtml(slug)}" class="art-pill px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0 transition-all">${escapeHtml(label)}</button>
                    `).join('')}
                `;
            }

            const artGrid = document.getElementById('art-items-grid');
            if (artGrid) {
                artGrid.innerHTML = artItems.length
                    ? artItems.map(item => `
                        <a href="detalle.html?tipo=cultura&id=${encodeURIComponent(item.id)}" class="art-card block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta" data-art-cat="${escapeHtml(item.art_category)}">
                            ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(localizedSiteText(item, 'title'))}" class="w-full h-40 object-cover rounded-xl mb-4" loading="lazy">` : ''}
                            <div class="flex items-center justify-between"><span class="bg-brand-terracotta/10 text-brand-terracotta text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">${escapeHtml(localizedSiteText(item, 'category'))}</span><i class="fa-solid fa-palette text-brand-terracotta text-lg" aria-hidden="true"></i></div>
                            <h3 class="font-serif font-bold text-xl text-brand-navy hover:text-brand-terracotta mt-4">${escapeHtml(localizedSiteText(item, 'title'))}</h3>
                        </a>
                    `).join('')
                    : `<p class="text-slate-600">${escapeHtml(translations[currentLang].site_content_empty)}</p>`;
            }
            if (artFilters && artGrid) filterArtCategory(currentArtCategory);
        }

        async function loadSiteContent() {
            const detailType = new URLSearchParams(window.location.search).get('tipo');
            const needsSiteContent = document.getElementById('events-list')
                || document.getElementById('page-cultura')
                || document.getElementById('home-featured-event')
                || (document.getElementById('detail-content') && ['evento', 'cultura'].includes(detailType));
            if (!needsSiteContent) return;

            const query = new URLSearchParams({
                select: '*',
                is_published: 'eq.true',
                order: 'content_type.asc,sort_order.asc,event_date.asc.nullslast',
                limit: '500'
            });
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?${query}`, {
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
                    }
                });
                if (!response.ok) {
                    const details = await response.text();
                    throw new Error(`Supabase (${response.status}): ${details}`);
                }

                const rows = await response.json();
                if (!Array.isArray(rows)) throw new Error('Supabase devolvió un formato de contenido inesperado.');
                siteContent = rows;
                siteContentLoaded = true;
                siteContentError = false;
                renderDynamicSiteContent();
                renderDetail();
                renderSiteContentError();
            } catch (error) {
                console.error('No se pudo cargar el contenido del sitio:', error);
                siteContentError = true;
                renderSiteContentError();
            }
        }

        /* ================= CULTURA SUB-PAGES CONTROLLER ================= */
        function selectCultureTab(tabName) {
            // Hide all subview containers inside cultura
            document.querySelectorAll('.culture-subview').forEach(subview => {
                subview.classList.add('hidden');
            });

            // Show target subview
            const target = document.getElementById(`subpage-${tabName}`);
            if (target) {
                target.classList.remove('hidden');
            }

            // Update button styles
            document.querySelectorAll('.cultura-tab-btn').forEach(btn => {
                btn.classList.remove('bg-brand-navy', 'text-white');
                btn.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
            });

            const activeBtn = document.getElementById(`cultura-tab-${tabName}`);
            if (activeBtn) {
                activeBtn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
                activeBtn.classList.add('bg-brand-navy', 'text-white');
            }
        }

        /* ================= ARTE CATEGORY FILTER ================= */
        function filterArtCategory(category) {
            currentArtCategory = category;
            // Reset pills styling
            document.querySelectorAll('.art-pill').forEach(pill => {
                pill.classList.remove('bg-brand-navy', 'text-white');
                pill.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
            });

            const activePill = document.getElementById(`art-cat-${category}`);
            if (activePill) {
                activePill.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
                activePill.classList.add('bg-brand-navy', 'text-white');
            }

            // Filter cards display
            document.querySelectorAll('.art-card').forEach(card => {
                const cardCat = card.getAttribute('data-art-cat');
                if (category === 'all' || cardCat === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }

        /* ================= LANGUAGE SWITCHER ================= */
        function setLanguage(lang) {
            currentLang = lang;
            document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'es';
            writeLocalStorage('community-language', lang);
            const localizedTexts = translations[lang] || translations.es;
            const ogLocale = document.querySelector('meta[property="og:locale"]');
            if (ogLocale) ogLocale.content = lang === 'pt' ? 'pt_PT' : 'es_ES';

            // Update button UI states
            if (lang === 'es') {
                document.getElementById('lang-es').className = "px-2.5 py-1 text-xs font-bold rounded-lg transition-all bg-white text-brand-navy shadow-sm";
                document.getElementById('lang-pt').className = "px-2.5 py-1 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-brand-navy";
                
                document.getElementById('lang-es-mob').className = "px-2 py-0.5 text-xs font-bold rounded bg-white text-brand-navy";
                document.getElementById('lang-pt-mob').className = "px-2 py-0.5 text-xs font-bold rounded text-slate-500";
            } else {
                document.getElementById('lang-pt').className = "px-2.5 py-1 text-xs font-bold rounded-lg transition-all bg-white text-brand-navy shadow-sm";
                document.getElementById('lang-es').className = "px-2.5 py-1 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-brand-navy";
                
                document.getElementById('lang-pt-mob').className = "px-2 py-0.5 text-xs font-bold rounded bg-white text-brand-navy";
                document.getElementById('lang-es-mob').className = "px-2 py-0.5 text-xs font-bold rounded text-slate-500";
            }

            // Translate all elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                if (localizedTexts[key]) elem.textContent = localizedTexts[key];
            });

            document.querySelectorAll('[data-i18n-alt]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-alt');
                if (localizedTexts[key]) elem.setAttribute('alt', localizedTexts[key]);
            });

            document.querySelectorAll('label:not([for])').forEach((label, index) => {
                const control = label.parentElement?.querySelector('input, select, textarea');
                if (!control) return;
                if (!control.id) control.id = control.name || `form-field-${index + 1}`;
                label.htmlFor = control.id;
            });

            const placeholderKeys = {
                'classified-search': 'search_placeholder',
                name: 'contact_name_placeholder',
                phone: 'contact_phone_placeholder',
                email: 'contact_email_placeholder',
                message: 'contact_message_placeholder',
                'ad-title': 'ad_title_placeholder',
                'ad-price': 'ad_price_placeholder',
                'ad-contact': 'ad_contact_placeholder',
                'ad-location': 'ad_location_placeholder',
                'ad-description': 'ad_description_placeholder'
            };
            Object.entries(placeholderKeys).forEach(([id, key]) => {
                const control = document.getElementById(id);
                if (control && localizedTexts[key]) control.placeholder = localizedTexts[key];
            });

            const pageHeading = document.querySelector('main h1');
            if (pageHeading) document.title = `${pageHeading.textContent.trim()} | @sere en Luanda`;
            const categoryHeading = document.getElementById('category-heading');
            if (categoryHeading) categoryHeading.textContent = currentCategory === 'all'
                ? localizedTexts.category_all_heading
                : localizedClassifiedCategory(currentCategory);
            const pageDescriptionKeys = {
                'index.html': 'hero_desc',
                'quienes-somos.html': 'about_subtitle',
                'eventos.html': 'events_subheader',
                'cultura.html': 'culture_subheader',
                'revolicango.html': 'revolic_sub',
                'contactos.html': 'contact_subheader'
            };
            const pageFile = window.location.pathname.split('/').pop() || 'index.html';
            const description = localizedTexts[pageDescriptionKeys[pageFile]];
            if (description) {
                ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']
                    .forEach(selector => document.querySelector(selector)?.setAttribute('content', description));
                ['meta[property="og:title"]', 'meta[name="twitter:title"]']
                    .forEach(selector => document.querySelector(selector)?.setAttribute('content', document.title));
            }
            upgradeInertLinks();

            // Re-render classifieds to update labels
            renderClassifieds();
            renderHomeFeaturedAds();
            renderDynamicSiteContent();
            renderDetail();
            renderSiteContentError();
            loadClassifiedRatingBoard();
        }

        /* ================= MOBILE MENU TOGGLE ================= */
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('mobile-menu-icon');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.className = "fa-solid fa-xmark text-xl";
            } else {
                menu.classList.add('hidden');
                icon.className = "fa-solid fa-bars text-xl";
            }
        }

        /* ================= REVOLICANGO CLASSIFIEDS CONTROLLER ================= */
        function localizedClassifiedCategory(category) {
            const categoryKeys = {
                'Vehículos': 'cat_vehiculos',
                Inmobiliaria: 'cat_inmobiliaria',
                Tecnología: 'cat_tecnologia',
                Empleos: 'cat_empleos',
                'Ropa y Accesorios': 'cat_ropa',
                Servicios: 'cat_servicios',
                Electrodomésticos: 'cat_electro',
                Hogar: 'cat_hogar',
                General: 'cat_general'
            };
            const key = categoryKeys[category];
            return key ? translations[currentLang][key] : category;
        }

        function selectCategory(cat) {
            currentCategory = cat;

            // Reset category pill styling
            document.querySelectorAll('.cat-pill').forEach(pill => {
                pill.classList.remove('bg-brand-navy', 'text-white');
                pill.classList.add('bg-slate-100', 'hover:bg-slate-200', 'text-slate-600');
            });

            // Highlight selected pill
            let catId = 'cat-all';
            if (cat === 'Vehículos') catId = 'cat-vehiculos';
            if (cat === 'Inmobiliaria') catId = 'cat-inmobiliaria';
            if (cat === 'Tecnología') catId = 'cat-tecnologia';
            if (cat === 'Empleos') catId = 'cat-empleos';
            if (cat === 'Ropa y Accesorios') catId = 'cat-ropa';
            if (cat === 'Servicios') catId = 'cat-servicios';
            if (cat === 'Electrodomésticos') catId = 'cat-electro';
            if (cat === 'Hogar') catId = 'cat-hogar';
            if (cat === 'General') catId = 'cat-general';

            const activePill = document.getElementById(catId);
            if (activePill) {
                activePill.classList.remove('bg-slate-100', 'hover:bg-slate-200', 'text-slate-600');
                activePill.classList.add('bg-brand-navy', 'text-white');
            }

            // Update heading
            const heading = document.getElementById('category-heading');
            heading.textContent = cat === 'all'
                ? translations[currentLang].category_all_heading
                : localizedClassifiedCategory(cat);

            renderClassifieds();
        }

        function filterClassifieds() {
            renderClassifieds();
        }

        function renderClassifieds() {
            const statCount = document.getElementById('classifieds-stat-count');
            if (statCount) statCount.textContent = sharedClassifiedsStatus === 'loaded'
                ? classifiedsData.length
                : sharedClassifiedsStatus === 'loading' ? '…' : '—';

            const grid = document.getElementById('classifieds-grid');
            const noAds = document.getElementById('no-classifieds');
            if (!grid || !noAds) return;
            const loading = document.getElementById('classifieds-loading');
            const loadError = document.getElementById('classifieds-load-error');
            const count = document.getElementById('classifieds-count');
            if (loading) loading.classList.toggle('hidden', sharedClassifiedsStatus !== 'loading');
            if (loadError) loadError.classList.toggle('hidden', sharedClassifiedsStatus !== 'error');
            if (count) count.textContent = sharedClassifiedsStatus === 'loading'
                ? translations[currentLang].classifieds_loading
                : sharedClassifiedsStatus === 'error' ? '—' : '';

            if (sharedClassifiedsStatus !== 'loaded') {
                grid.innerHTML = '';
                noAds.classList.add('hidden');
                return;
            }

            const searchVal = (document.getElementById('classified-search')?.value || '').toLowerCase();

            let items = classifiedsData.filter(item => {
                const matchesCat = currentCategory === 'all' || item.category === currentCategory;
                const matchesSearch = item.title.toLowerCase().includes(searchVal) || 
                                      item.description.toLowerCase().includes(searchVal) ||
                                      item.location.toLowerCase().includes(searchVal);
                return matchesCat && matchesSearch;
            });

            // Update counter
            if (count) count.textContent = `${items.length} ${currentLang === 'es' ? 'anuncios' : 'anúncios'}`;

            if (items.length === 0) {
                grid.innerHTML = '';
                noAds.classList.remove('hidden');
                return;
            }

            noAds.classList.add('hidden');
            grid.innerHTML = items.map(ad => createAdCardHTML(ad)).join('');
        }

        function renderHomeFeaturedAds() {
            const container = document.getElementById('home-featured-ads');
            if (!container) return;
            const featured = classifiedsData.slice(0, 3);
            container.innerHTML = featured.map(ad => createAdCardHTML(ad)).join('');
        }

        async function loadSharedClassifieds() {
            const query = new URLSearchParams({
                select: 'id,title,category,price,contact,location,image_url,image_urls,description,created_at',
                status: 'eq.approved',
                order: 'created_at.desc',
                limit: '200'
            });

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/classifieds?${query}`, {
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
                    }
                });
                if (!response.ok) {
                    const details = await response.text();
                    throw new Error(`Supabase (${response.status}): ${details}`);
                }

                const rows = await response.json();
                const sharedAds = rows.map(row => ({
                    id: row.id,
                    title: row.title,
                    category: row.category,
                    price: row.price || (currentLang === 'es' ? 'Consultar' : 'A consultar'),
                    contact: row.contact,
                    location: row.location,
                    date: row.created_at
                        ? new Date(row.created_at).toLocaleDateString(currentLang === 'es' ? 'es' : 'pt-PT')
                        : '',
                    images: Array.isArray(row.image_urls) && row.image_urls.length
                        ? row.image_urls
                        : row.image_url ? [row.image_url] : [],
                    description: row.description
                }));

                classifiedsData.splice(0, classifiedsData.length, ...sharedAds);
                sharedClassifiedsStatus = 'loaded';
                renderClassifieds();
                renderHomeFeaturedAds();
                renderDetail();
                const requestedEditId = new URLSearchParams(window.location.search).get('edit');
                if (requestedEditId) {
                    window.history.replaceState({}, '', window.location.pathname);
                    beginClassifiedEdit(requestedEditId);
                }
            } catch (error) {
                sharedClassifiedsStatus = 'error';
                renderClassifieds();
                console.error('No se pudieron cargar los anuncios compartidos:', error);
                showToast(currentLang === 'es'
                    ? 'No se pudieron cargar los anuncios. Inténtalo de nuevo más tarde.'
                    : 'Não foi possível carregar os anúncios. Tente novamente mais tarde.', true);
            }
        }

        const classifiedImagePools = {
            vehicles: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'],
            housing: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80'],
            baby: ['https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80'],
            technology: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80'],
            services: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'],
            appliances: [
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80'
            ]
        };

        function getFallbackClassifiedImage(ad) {
            const normalizedText = `${ad.title || ''} ${ad.category || ''}`
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
            let imagePool = classifiedImagePools.housing;

            if (/\b(bebe|baby|cadeira|silla|cuna|infantil)\b/.test(normalizedText)) {
                imagePool = classifiedImagePools.baby;
            } else if (/\b(vehiculos|vehicle|carro|coche|auto)\b/.test(normalizedText)) {
                imagePool = classifiedImagePools.vehicles;
            } else if (/\b(inmobiliaria|casa|apartamento|hogar|home)\b/.test(normalizedText)) {
                imagePool = classifiedImagePools.housing;
            } else if (/\b(tecnologia|technology|telefono|phone|iphone)\b/.test(normalizedText)) {
                imagePool = classifiedImagePools.technology;
            } else if (/\b(servicios|service|clases|empleos|empregos)\b/.test(normalizedText)) {
                imagePool = classifiedImagePools.services;
            } else if (/\b(electrodomesticos|appliances|generador|generator)\b/.test(normalizedText)) {
                imagePool = classifiedImagePools.appliances;
            }

            if (!imagePool.includes(ad.fallbackImage)) {
                ad.fallbackImage = imagePool[Math.floor(Math.random() * imagePool.length)];
            }
            return ad.fallbackImage;
        }

        function getClassifiedImage(ad) {
            const image = Array.isArray(ad.images) ? ad.images[0] : ad.image;
            return typeof image === 'string' && /^https?:\/\//i.test(image)
                ? image
                : getFallbackClassifiedImage(ad);
        }

        function createAdCardHTML(ad) {
            const detailUrl = `detalle.html?tipo=anuncio&id=${encodeURIComponent(ad.id)}`;
            const image = getClassifiedImage(ad);
            const fallbackImage = getFallbackClassifiedImage(ad);

            return `
                <article class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <div class="h-48 bg-slate-100 overflow-hidden">
                        <a href="${detailUrl}" aria-label="${escapeHtml(currentLang === 'es' ? `Ver anuncio: ${ad.title}` : `Ver anúncio: ${ad.title}`)}">
                            <img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackImage)}" alt="${escapeHtml(ad.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback">
                        </a>
                    </div>
                    <div class="p-5 flex items-center justify-between gap-4">
                        <a href="${detailUrl}" class="flex items-center justify-between gap-4 w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta">
                            <h3 class="font-serif font-bold text-lg text-brand-navy group-hover:text-brand-terracotta transition-colors">${escapeHtml(ad.title)}</h3>
                            <i class="fa-solid fa-arrow-right text-brand-terracotta shrink-0" aria-hidden="true"></i>
                        </a>
                    </div>
                </article>
            `;
        }

        function createClassifiedGallery() {
            if (document.getElementById('classified-image-gallery')) return;

            const gallery = document.createElement('div');
            gallery.id = 'classified-image-gallery';
            gallery.className = 'fixed inset-0 z-[100] hidden bg-black text-white';
            gallery.setAttribute('role', 'dialog');
            gallery.setAttribute('aria-modal', 'true');
            gallery.setAttribute('aria-label', currentLang === 'es' ? 'Galería de imágenes del anuncio' : 'Galeria de imagens do anúncio');
            gallery.innerHTML = `
                <div class="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent px-4 py-4 sm:px-6">
                    <p id="classified-gallery-counter" class="text-sm font-semibold" aria-live="polite"></p>
                    <button id="classified-gallery-close" type="button" class="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label="${escapeHtml(currentLang === 'es' ? 'Cerrar galería' : 'Fechar galeria')}">&times;</button>
                </div>
                <div id="classified-gallery-slides" class="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x">
                </div>
                <button id="classified-gallery-previous" type="button" class="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-3xl hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:flex" aria-label="${escapeHtml(currentLang === 'es' ? 'Imagen anterior' : 'Imagem anterior')}">&#8249;</button>
                <button id="classified-gallery-next" type="button" class="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-3xl hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:flex" aria-label="${escapeHtml(currentLang === 'es' ? 'Imagen siguiente' : 'Próxima imagem')}">&#8250;</button>
            `;
            document.body.appendChild(gallery);

            const slides = gallery.querySelector('#classified-gallery-slides');
            const updateGalleryCounter = () => {
                const count = slides.children.length;
                const current = count ? Math.round(slides.scrollLeft / slides.clientWidth) + 1 : 0;
                gallery.querySelector('#classified-gallery-counter').textContent = count
                    ? `${current} / ${count}`
                    : '';
            };
            const scrollToSlide = offset => {
                const current = Math.round(slides.scrollLeft / slides.clientWidth);
                const next = Math.max(0, Math.min(slides.children.length - 1, current + offset));
                if (!slides.children[next]) return;
                slides.scrollTo({ left: slides.children[next].offsetLeft, behavior: 'instant' });
                updateGalleryCounter();
            };

            slides.addEventListener('scroll', updateGalleryCounter, { passive: true });
            gallery.querySelector('#classified-gallery-close').addEventListener('click', closeClassifiedGallery);
            gallery.querySelector('#classified-gallery-previous').addEventListener('click', () => scrollToSlide(-1));
            gallery.querySelector('#classified-gallery-next').addEventListener('click', () => scrollToSlide(1));
            gallery.addEventListener('click', event => {
                if (event.target === gallery) closeClassifiedGallery();
            });
            gallery.addEventListener('keydown', event => {
                if (event.key === 'Escape') closeClassifiedGallery();
                if (event.key === 'ArrowLeft') scrollToSlide(-1);
                if (event.key === 'ArrowRight') scrollToSlide(1);
            });
        }

        function openClassifiedGallery(classifiedId, imageIndex = 0, trigger = null) {
            const ad = classifiedsData.find(item => String(item.id) === String(classifiedId));
            if (!ad) return;

            classifiedGalleryReturnFocus = trigger;
            createClassifiedGallery();
            const gallery = document.getElementById('classified-image-gallery');
            const slides = gallery.querySelector('#classified-gallery-slides');
            const fallbackImage = getFallbackClassifiedImage(ad);
            const images = (Array.isArray(ad.images) && ad.images.length ? ad.images : [getClassifiedImage(ad)])
                .filter(image => typeof image === 'string' && /^https?:\/\//i.test(image));

            slides.innerHTML = images.map((image, index) => `
                <div class="flex h-full w-full flex-none snap-start items-center justify-center px-3 py-20 sm:px-16">
                    <img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackImage)}" alt="${escapeHtml(ad.title)}${images.length > 1 ? ` - ${index + 1}` : ''}" class="max-h-full max-w-full select-none object-contain" draggable="false" onerror="this.onerror=null;this.src=this.dataset.fallback">
                </div>
            `).join('');
            gallery.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            const startIndex = Math.max(0, Math.min(images.length - 1, Number(imageIndex) || 0));
            slides.style.scrollBehavior = 'auto';
            slides.scrollLeft = startIndex * slides.clientWidth;
            slides.style.scrollBehavior = '';
            gallery.querySelector('#classified-gallery-counter').textContent = images.length
                ? `${startIndex + 1} / ${images.length}`
                : '';
            gallery.querySelector('#classified-gallery-close').focus();
        }

        function closeClassifiedGallery() {
            const gallery = document.getElementById('classified-image-gallery');
            if (!gallery) return;
            gallery.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            if (classifiedGalleryReturnFocus?.isConnected) classifiedGalleryReturnFocus.focus();
            classifiedGalleryReturnFocus = null;
        }

        function escapeHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, character => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[character]);
        }

        function getClassifiedEditCredential(id) {
            const credential = classifiedEditCredentials[String(id)];
            const expiresAt = credential ? Date.parse(credential.expiresAt) : NaN;
            if (!credential || !Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
                if (credential) {
                    delete classifiedEditCredentials[String(id)];
                    writeLocalStorage(CLASSIFIED_EDIT_STORAGE_KEY, JSON.stringify(classifiedEditCredentials));
                }
                return null;
            }
            return credential;
        }

        function storeClassifiedEditCredential(id, token, expiresAt) {
            classifiedEditCredentials[String(id)] = { token, expiresAt };
            return writeLocalStorage(CLASSIFIED_EDIT_STORAGE_KEY, JSON.stringify(classifiedEditCredentials));
        }

        function removeClassifiedEditCredential(id) {
            delete classifiedEditCredentials[String(id)];
            writeLocalStorage(CLASSIFIED_EDIT_STORAGE_KEY, JSON.stringify(classifiedEditCredentials));
        }

        function beginClassifiedEdit(id) {
            const credential = getClassifiedEditCredential(id);
            const ad = classifiedsData.find(item => String(item.id) === String(id));
            const form = document.querySelector('#ad-modal form');
            if (!credential || !ad || !form) {
                showToast(currentLang === 'es'
                    ? 'El plazo para editar este anuncio terminó o ya se utilizó.'
                    : 'O prazo para editar este anúncio terminou ou já foi utilizado.', true);
                return;
            }

            activeClassifiedEdit = { id: String(id), token: credential.token };
            form.reset();
            document.getElementById('ad-title').value = ad.title;
            document.getElementById('ad-category').value = ad.category;
            document.getElementById('ad-price').value = ad.price;
            document.getElementById('ad-contact').value = ad.contact;
            document.getElementById('ad-location').value = ad.location;
            document.getElementById('ad-description').value = ad.description;
            document.getElementById('ad-contact-consent').checked = true;
            openModal();
        }

        function opinionSubmittedKey(targetType, targetId) {
            return `public-opinion-submitted:${targetType}:${targetId}`;
        }

        function getOpinionVoterKey() {
            const storageKey = 'public-opinion-voter-key';
            let voterKey = readLocalStorage(storageKey);
            if (voterKey && /^[0-9a-f-]{36}$/i.test(voterKey)) return voterKey;

            voterKey = crypto.randomUUID();
            if (!writeLocalStorage(storageKey, voterKey)) {
                throw new Error(currentLang === 'es'
                    ? 'Activa el almacenamiento del navegador para enviar una opinión.'
                    : 'Ative o armazenamento do navegador para enviar uma opinião.');
            }
            return voterKey;
        }

        function publicOpinionSectionHTML(targetType, targetId, withRating = false) {
            const isSpanish = currentLang === 'es';
            const alreadySent = withRating
                && readLocalStorage(opinionSubmittedKey(targetType, targetId)) === 'true';
            const disabledAttribute = alreadySent ? 'disabled' : '';
            const ratingChoices = withRating
                ? `<fieldset class="mt-4">
                       <legend class="text-sm font-semibold text-slate-700">${isSpanish ? 'Tu puntuación (1 = peor, 5 = mejor)' : 'A sua pontuação (1 = pior, 5 = melhor)'}</legend>
                       <div class="mt-2 flex flex-wrap gap-2">
                           ${[1, 2, 3, 4, 5].map(value => `
                               <label class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 hover:bg-amber-50 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                                   <input type="radio" name="opinion-rating" value="${value}" required ${disabledAttribute} class="accent-amber-500">
                                   <span class="text-amber-500" aria-hidden="true">${'★'.repeat(value)}</span>
                                   <span class="text-xs text-slate-600">${value}</span>
                               </label>
                           `).join('')}
                       </div>
                   </fieldset>`
                : '';
            const aliasLabel = isSpanish ? 'Alias (opcional)' : 'Nome/apelido (opcional)';
            const submitLabel = isSpanish ? 'Enviar opinión para revisión' : 'Enviar opinião para revisão';

            return `
                <section id="public-opinions" class="mt-10 border-t border-slate-200 pt-8" data-opinion-target-type="${escapeHtml(targetType)}" data-opinion-target-id="${escapeHtml(targetId)}">
                    <h2 class="font-serif text-2xl font-bold text-brand-navy">${isSpanish ? 'Opiniones de la comunidad' : 'Opiniões da comunidade'}</h2>
                    ${withRating ? `
                        <div id="opinion-rating-summary" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-live="polite">
                            <p class="text-slate-600">${isSpanish ? 'Cargando puntuaciones…' : 'A carregar pontuações…'}</p>
                        </div>
                    ` : ''}
                    <div class="mt-5">
                        <h3 class="font-semibold text-brand-navy">${isSpanish ? 'Deja tu opinión' : 'Deixe a sua opinião'}</h3>
                        <p class="mt-1 text-sm text-slate-600">${isSpanish ? 'Tu comentario se mostrará cuando sea aprobado por el equipo.' : 'O seu comentário será mostrado depois de aprovado pela equipa.'}</p>
                        <form data-opinion-form class="mt-4 space-y-3">
                            <label class="block text-sm font-medium text-slate-700">
                                ${aliasLabel}
                                <input name="alias" maxlength="50" autocomplete="nickname" ${disabledAttribute} class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20">
                            </label>
                            <label class="block text-sm font-medium text-slate-700">
                                ${isSpanish ? 'Comentario' : 'Comentário'}
                                <textarea name="comment" rows="4" minlength="2" maxlength="1000" required ${disabledAttribute} class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20" placeholder="${isSpanish ? 'Comparte tu opinión…' : 'Partilhe a sua opinião…'}"></textarea>
                            </label>
                            ${ratingChoices}
                            <button type="submit" ${disabledAttribute} class="rounded-lg bg-brand-navy px-5 py-3 font-bold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta disabled:cursor-not-allowed disabled:opacity-60">${submitLabel}</button>
                            <p data-opinion-form-status class="text-sm text-slate-600" role="status">${alreadySent ? (isSpanish ? 'Ya enviaste una opinión para esta publicación desde este navegador.' : 'Já enviou uma opinião sobre esta publicação neste navegador.') : ''}</p>
                        </form>
                    </div>
                    <div class="mt-8">
                        <h3 class="font-serif text-xl font-bold text-brand-navy">${isSpanish ? 'Opiniones publicadas' : 'Opiniões publicadas'}</h3>
                        <p data-opinion-list-status class="mt-2 text-sm text-slate-600" role="status">${isSpanish ? 'Cargando opiniones…' : 'A carregar opiniões…'}</p>
                        <div data-opinion-list class="mt-4 space-y-4"></div>
                    </div>
                </section>
            `;
        }

        function formatOpinionStars(rating) {
            const numericRating = Number(rating) || 0;
            return `<span class="text-amber-500" aria-label="${numericRating} ${currentLang === 'es' ? 'de 5 estrellas' : 'de 5 estrelas'}">${'★'.repeat(numericRating)}${'☆'.repeat(5 - numericRating)}</span>`;
        }

        function renderPublicOpinions(section, result) {
            const isSpanish = currentLang === 'es';
            const opinionList = section.querySelector('[data-opinion-list]');
            const listStatus = section.querySelector('[data-opinion-list-status]');
            const opinions = Array.isArray(result.opinions) ? result.opinions : [];

            listStatus.textContent = opinions.length
                ? `${result.opinion_count} ${isSpanish ? 'opiniones aprobadas' : 'opiniões aprovadas'}${result.opinion_count > opinions.length ? (isSpanish ? ' (se muestran las 50 más recientes)' : ' (a mostrar as 50 mais recentes)') : ''}`
                : (isSpanish ? 'Todavía no hay opiniones aprobadas.' : 'Ainda não há opiniões aprovadas.');
            opinionList.innerHTML = opinions.map(opinion => `
                <article class="rounded-xl border border-slate-200 bg-white p-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <strong class="text-brand-navy">${escapeHtml(opinion.alias || (isSpanish ? 'Anónimo' : 'Anónimo'))}</strong>
                        <time class="text-xs text-slate-500">${escapeHtml(new Date(opinion.created_at).toLocaleDateString(isSpanish ? 'es' : 'pt-PT'))}</time>
                    </div>
                    ${opinion.rating ? `<p class="mt-2">${formatOpinionStars(opinion.rating)}</p>` : ''}
                    <p class="mt-2 whitespace-pre-line text-slate-700">${escapeHtml(opinion.comment)}</p>
                </article>
            `).join('');

            const ratingSummary = section.querySelector('#opinion-rating-summary');
            if (ratingSummary) {
                const ratingCount = Number(result.rating_count) || 0;
                const average = result.average_rating == null ? '—' : Number(result.average_rating).toFixed(1);
                const counts = result.rating_counts || {};
                const rows = [5, 4, 3, 2, 1].map(rating => {
                    const count = Number(counts[rating]) || 0;
                    const percentage = ratingCount ? Math.round(count / ratingCount * 100) : 0;
                    return `
                        <div class="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 text-sm">
                            <span>${rating} ★</span>
                            <span class="h-2 overflow-hidden rounded-full bg-slate-200"><span class="block h-full bg-amber-400" style="width:${percentage}%"></span></span>
                            <span class="text-right text-slate-600">${count}</span>
                        </div>
                    `;
                }).join('');
                ratingSummary.innerHTML = `
                    <div class="flex flex-wrap items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-brand-navy">${average}</span>
                        ${ratingCount ? formatOpinionStars(Math.round(Number(result.average_rating) || 0)) : ''}
                        <span class="text-sm text-slate-600">${ratingCount} ${isSpanish ? 'votos' : 'votos'}</span>
                    </div>
                    <div class="mt-4 space-y-2">${rows}</div>
                `;
            }
        }

        async function loadPublicOpinions(targetType, targetId) {
            const section = document.getElementById('public-opinions');
            if (!section) return;

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_opinions`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_target_type: targetType, p_target_id: String(targetId) })
                });
                if (!response.ok) {
                    const details = await response.text();
                    throw new Error(`Supabase (${response.status}): ${details}`);
                }
                renderPublicOpinions(section, await response.json());
            } catch (error) {
                console.error('No se pudieron cargar las opiniones:', error);
                section.querySelector('[data-opinion-list-status]').textContent = currentLang === 'es'
                    ? 'No se pudieron cargar las opiniones. Inténtalo más tarde.'
                    : 'Não foi possível carregar as opiniões. Tente novamente mais tarde.';
                const summary = section.querySelector('#opinion-rating-summary');
                if (summary) summary.textContent = currentLang === 'es'
                    ? 'No se pudieron cargar las puntuaciones.'
                    : 'Não foi possível carregar as pontuações.';
            }
        }

        async function loadClassifiedRatingBoard() {
            const list = document.getElementById('classified-rating-board-list');
            const status = document.getElementById('classified-rating-board-status');
            if (!list || !status) return;

            const isSpanish = currentLang === 'es';
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_classified_rating_board`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                if (!response.ok) {
                    const details = await response.text();
                    throw new Error(`Supabase (${response.status}): ${details}`);
                }

                const rankedAds = await response.json();
                if (!Array.isArray(rankedAds)) throw new Error('Supabase devolvió un ranking con formato no válido.');
                if (!rankedAds.length) {
                    status.textContent = isSpanish
                        ? 'Todavía no hay puntuaciones aprobadas. ¡Sé la primera persona en valorar un anuncio!'
                        : 'Ainda não há pontuações aprovadas. Seja a primeira pessoa a avaliar um anúncio!';
                    list.innerHTML = '';
                    return;
                }

                status.textContent = isSpanish
                    ? 'Los 10 anuncios mejor valorados según las puntuaciones aprobadas.'
                    : 'Os 10 anúncios mais bem avaliados segundo as pontuações aprovadas.';
                list.innerHTML = rankedAds.map((ad, index) => {
                    const average = Number(ad.average_rating) || 0;
                    const ratingCount = Number(ad.rating_count) || 0;
                    const detailUrl = `detalle.html?tipo=anuncio&id=${encodeURIComponent(ad.id)}`;
                    return `
                        <li>
                            <a href="${detailUrl}" class="flex h-full items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-amber-400 hover:bg-amber-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta">
                                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">#${index + 1}</span>
                                <span class="min-w-0">
                                    <strong class="block truncate text-brand-navy">${escapeHtml(ad.title)}</strong>
                                    <span class="mt-1 block text-xs text-slate-600">${escapeHtml(localizedClassifiedCategory(ad.category))}</span>
                                    <span class="mt-2 flex flex-wrap items-center gap-2">
                                        ${formatOpinionStars(Math.round(average))}
                                        <span class="text-sm font-bold text-slate-700">${average.toFixed(1)}/5</span>
                                        <span class="text-xs text-slate-500">(${ratingCount} ${isSpanish ? 'votos' : 'votos'})</span>
                                    </span>
                                </span>
                            </a>
                        </li>
                    `;
                }).join('');
            } catch (error) {
                console.error('No se pudo cargar el ranking de clasificados:', error);
                status.textContent = isSpanish
                    ? 'No se pudo cargar el ranking de estrellas. Inténtalo más tarde.'
                    : 'Não foi possível carregar o ranking de estrelas. Tente novamente mais tarde.';
                list.innerHTML = '';
            }
        }

        async function handlePublicOpinionSubmit(event) {
            const form = event.target.closest('form[data-opinion-form]');
            if (!form) return;

            event.preventDefault();
            const section = form.closest('#public-opinions');
            const targetType = section.dataset.opinionTargetType;
            const targetId = section.dataset.opinionTargetId;
            const status = form.querySelector('[data-opinion-form-status]');
            const submitButton = form.querySelector('button[type="submit"]');
            const selectedRating = form.querySelector('input[name="opinion-rating"]:checked');
            const payload = {
                p_target_type: targetType,
                p_target_id: targetId,
                p_alias: form.elements.alias.value.trim() || null,
                p_comment: form.elements.comment.value.trim(),
                p_rating: targetType === 'classified' ? Number(selectedRating?.value) || null : null
            };

            if (payload.p_comment.length < 2 || payload.p_comment.length > 1000
                || (payload.p_alias && payload.p_alias.length > 50)
                || (targetType === 'classified' && (!payload.p_rating || payload.p_rating > 5))) {
                status.textContent = currentLang === 'es'
                    ? 'Revisa el comentario, el alias y la puntuación.'
                    : 'Verifique o comentário, o nome ou apelido e a pontuação.';
                return;
            }

            submitButton.disabled = true;
            try {
                const voterKey = getOpinionVoterKey();
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_public_opinion`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...payload, p_voter_key: voterKey })
                });
                if (!response.ok) {
                    const details = await response.text();
                    throw new Error(`Supabase (${response.status}): ${details}`);
                }

                if (targetType === 'classified') {
                    writeLocalStorage(opinionSubmittedKey(targetType, targetId), 'true');
                }
                form.reset();
                if (targetType === 'classified') {
                    form.querySelectorAll('input, textarea, button').forEach(control => {
                        control.disabled = true;
                    });
                    status.textContent = currentLang === 'es'
                        ? 'Recibimos tu opinión y puntuación. Aparecerán después de ser aprobadas.'
                        : 'Recebemos a sua opinião e pontuação. Serão publicadas depois de aprovadas.';
                } else {
                    submitButton.disabled = false;
                    status.textContent = currentLang === 'es'
                        ? 'Recibimos tu opinión. Aparecerá después de ser aprobada.'
                        : 'Recebemos a sua opinião. Será publicada depois de aprovada.';
                }
            } catch (error) {
                console.error('No se pudo enviar la opinión:', error);
                status.textContent = error instanceof Error && error.message.includes('Supabase (')
                    ? currentLang === 'es'
                        ? 'No se pudo enviar. Puede que ya hayas enviado una opinión desde este navegador o que el servicio aún no esté configurado.'
                        : 'Não foi possível enviar. Talvez já tenha enviado uma opinião neste navegador ou o serviço ainda não esteja configurado.'
                    : error.message;
                submitButton.disabled = false;
            }
        }

        function updateDetailMetadata(title, description) {
            const pageTitle = `${title} | @sere en Luanda`;
            const pageDescription = description.replace(/\s+/g, ' ').trim().slice(0, 160);
            document.title = pageTitle;

            const metadata = {
                'meta[name="description"]': pageDescription,
                'meta[property="og:title"]': pageTitle,
                'meta[property="og:description"]': pageDescription,
                'meta[property="og:url"]': window.location.href,
                'meta[name="twitter:title"]': pageTitle,
                'meta[name="twitter:description"]': pageDescription
            };
            Object.entries(metadata).forEach(([selector, content]) => {
                const element = document.querySelector(selector);
                if (element) element.setAttribute('content', content);
            });
        }

        function renderDetail() {
            const container = document.getElementById('detail-content');
            if (!container) return;

            const params = new URLSearchParams(window.location.search);
            const type = params.get('tipo');
            const id = params.get('id');
            const labels = translations[currentLang] || translations.es;
            const dynamicEvent = siteContentLoaded && type === 'evento'
                ? id === 'home-event'
                    ? siteContent.find(item => item.content_type === 'event' && item.is_featured)
                    : siteContent.find(item => item.content_type === 'event' && item.id === id)
                : null;
            const dynamicCulture = siteContentLoaded && type === 'cultura'
                ? siteContent.find(item => item.content_type === 'culture' && item.id === id)
                : null;
            const event = !siteContentLoaded && type === 'evento' ? eventArticles.find(item => item.id === id) : null;
            const culture = !siteContentLoaded && type === 'cultura' ? cultureArticles.find(item => item.id === id) : null;
            const ad = type === 'anuncio' ? classifiedsData.find(item => String(item.id) === id) : null;

            if (dynamicEvent) {
                const title = localizedSiteText(dynamicEvent, 'title');
                const category = localizedSiteText(dynamicEvent, 'category');
                const description = localizedSiteText(dynamicEvent, 'description');
                const date = formatSiteEventDate(dynamicEvent, {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                });
                const when = [date, formatSiteEventTime(dynamicEvent)].filter(Boolean).join(' | ');
                const location = localizedSiteText(dynamicEvent, 'location');
                const opinionId = id === 'home-event' ? 'home-event' : dynamicEvent.id;
                container.innerHTML = `
                    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <a href="${id === 'home-event' ? 'index.html' : 'eventos.html'}" class="inline-flex items-center gap-2 text-sm font-bold text-brand-terracotta hover:text-brand-navy">&larr; ${escapeHtml(labels.detail_back)}</a>
                        <article class="mt-8">
                            ${category ? `<p class="text-sm font-bold text-brand-terracotta uppercase">${escapeHtml(category)}</p>` : ''}
                            <h1 class="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy mt-2">${escapeHtml(title)}</h1>
                            ${dynamicEvent.image_url ? `<img src="${escapeHtml(dynamicEvent.image_url)}" alt="${escapeHtml(title)}" class="w-full max-h-96 object-cover rounded-2xl mt-6" loading="lazy">` : ''}
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-200 py-5 my-7 text-sm">
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_when)}</span><strong class="text-brand-navy">${escapeHtml(when)}</strong></p>
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_where)}</span><strong class="text-brand-navy">${escapeHtml(location)}</strong></p>
                            </div>
                            <h2 class="font-serif text-2xl font-bold text-brand-navy">${escapeHtml(labels.detail_description)}</h2>
                            <p class="text-lg text-slate-700 leading-relaxed mt-3 whitespace-pre-line">${escapeHtml(description)}</p>
                            <a href="contactos.html" class="inline-block bg-brand-navy text-white font-bold px-5 py-3 rounded-lg mt-8 hover:bg-slate-800">${escapeHtml(labels.btn_reserve)}</a>
                            ${publicOpinionSectionHTML('event', opinionId)}
                        </article>
                    </div>
                `;
                updateDetailMetadata(title, description);
                loadPublicOpinions('event', opinionId);
                return;
            }

            if (dynamicCulture) {
                const title = localizedSiteText(dynamicCulture, 'title');
                const description = localizedSiteText(dynamicCulture, 'description');
                const category = localizedSiteText(dynamicCulture, 'category');
                const sectionTab = dynamicCulture.section === 'art'
                    ? 'arte'
                    : dynamicCulture.section === 'history' ? 'historia' : 'tradiciones';
                const artFilter = dynamicCulture.section === 'art'
                    ? `&arte=${encodeURIComponent(dynamicCulture.art_category)}`
                    : '';
                const paragraphs = description.split(/\n{2,}/).map(paragraph => `
                    <p class="text-lg text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(paragraph)}</p>
                `).join('');
                const milestones = (dynamicCulture[`milestones_${currentLang}`] || dynamicCulture.milestones_es || [])
                    .filter(item => item && typeof item.title === 'string' && typeof item.body === 'string')
                    .map(item => `
                        <div class="border-l-2 border-brand-terracotta pl-4">
                            <h2 class="font-serif text-xl font-bold text-brand-navy">${escapeHtml(item.title)}</h2>
                            <p class="text-slate-700 leading-relaxed mt-2">${escapeHtml(item.body)}</p>
                        </div>
                    `).join('');
                container.innerHTML = `
                    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <a href="cultura.html?tab=${encodeURIComponent(sectionTab)}${artFilter}" class="inline-flex items-center gap-2 text-sm font-bold text-brand-terracotta hover:text-brand-navy">&larr; ${escapeHtml(labels.detail_back)}</a>
                        <article class="mt-8">
                            ${category ? `<p class="text-sm font-bold text-brand-terracotta uppercase">${escapeHtml(category)}</p>` : ''}
                            <h1 class="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy mt-2">${escapeHtml(title)}</h1>
                            ${dynamicCulture.image_url ? `<img src="${escapeHtml(dynamicCulture.image_url)}" alt="${escapeHtml(title)}" class="w-full max-h-96 object-cover rounded-2xl mt-6" loading="lazy">` : ''}
                            <div class="border-t border-slate-200 mt-8 pt-6 space-y-5">
                                ${paragraphs}
                                ${milestones ? `<div class="space-y-5 pt-4">${milestones}</div>` : ''}
                            </div>
                            ${publicOpinionSectionHTML('culture', dynamicCulture.id)}
                        </article>
                    </div>
                `;
                updateDetailMetadata(title, description);
                loadPublicOpinions('culture', dynamicCulture.id);
                return;
            }

            if (event) {
                const title = labels[event.titleKey] || translations.es[event.titleKey];
                const category = labels[event.categoryKey] || translations.es[event.categoryKey];
                const description = labels[event.bodyKey] || translations.es[event.bodyKey];
                const backUrl = event.id === 'home-event' ? 'index.html' : 'eventos.html';
                const when = event.whenKey
                    ? labels[event.whenKey] || translations.es[event.whenKey]
                    : `${labels[event.monthKey] || translations.es[event.monthKey]} ${event.day} | ${event.time} ${currentLang === 'es' ? 'hrs' : 'h'}`;
                container.innerHTML = `
                    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <a href="${backUrl}" class="inline-flex items-center gap-2 text-sm font-bold text-brand-terracotta hover:text-brand-navy">&larr; ${escapeHtml(labels.detail_back)}</a>
                        <article class="mt-8">
                            <p class="text-sm font-bold text-brand-terracotta uppercase">${escapeHtml(category)}</p>
                            <h1 class="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy mt-2">${escapeHtml(title)}</h1>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-200 py-5 my-7 text-sm">
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_when)}</span><strong class="text-brand-navy">${escapeHtml(when)}</strong></p>
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_where)}</span><strong class="text-brand-navy">${escapeHtml(event.location)}</strong></p>
                            </div>
                            <h2 class="font-serif text-2xl font-bold text-brand-navy">${escapeHtml(labels.detail_description)}</h2>
                            <p class="text-lg text-slate-700 leading-relaxed mt-3">${escapeHtml(description)}</p>
                            <a href="contactos.html" class="inline-block bg-brand-navy text-white font-bold px-5 py-3 rounded-lg mt-8 hover:bg-slate-800">${escapeHtml(labels.btn_reserve)}</a>
                            ${publicOpinionSectionHTML('event', event.id)}
                        </article>
                    </div>
                `;
                updateDetailMetadata(title, description);
                loadPublicOpinions('event', event.id);
                return;
            }

            if (culture) {
                const title = culture.title || labels[culture.titleKey] || translations.es[culture.titleKey];
                const backUrl = `cultura.html?tab=${encodeURIComponent(culture.tab)}${culture.artCategory ? `&arte=${encodeURIComponent(culture.artCategory)}` : ''}`;
                const paragraphs = culture.bodyKeys.map(key => escapeHtml(labels[key] || translations.es[key] || ''));
                const milestones = (culture.milestones || []).map(item => `
                    <div class="border-l-2 border-brand-terracotta pl-4">
                        <h2 class="font-serif text-xl font-bold text-brand-navy">${escapeHtml(labels[item.titleKey] || translations.es[item.titleKey])}</h2>
                        <p class="text-slate-700 leading-relaxed mt-2">${escapeHtml(labels[item.bodyKey] || translations.es[item.bodyKey])}</p>
                    </div>
                `).join('');
                const category = culture.categoryKey ? labels[culture.categoryKey] || translations.es[culture.categoryKey] : '';
                container.innerHTML = `
                    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <a href="${backUrl}" class="inline-flex items-center gap-2 text-sm font-bold text-brand-terracotta hover:text-brand-navy">&larr; ${escapeHtml(labels.detail_back)}</a>
                        <article class="mt-8">
                            ${category ? `<p class="text-sm font-bold text-brand-terracotta uppercase">${escapeHtml(category)}</p>` : ''}
                            <h1 class="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy mt-2">${escapeHtml(title)}</h1>
                            <div class="border-t border-slate-200 mt-8 pt-6 space-y-5">
                                ${paragraphs.map(paragraph => `<p class="text-lg text-slate-700 leading-relaxed">${paragraph}</p>`).join('')}
                                ${milestones ? `<div class="space-y-5 pt-4">${milestones}</div>` : ''}
                            </div>
                            ${publicOpinionSectionHTML('culture', culture.id)}
                        </article>
                    </div>
                `;
                updateDetailMetadata(title, culture.bodyKeys
                    .map(key => labels[key] || translations.es[key] || '')
                    .join(' '));
                loadPublicOpinions('culture', culture.id);
                return;
            }

            if (ad) {
                const title = escapeHtml(ad.title);
                const category = escapeHtml(localizedClassifiedCategory(ad.category));
                const description = escapeHtml(ad.description);
                const imageUrls = Array.isArray(ad.images) && ad.images.length
                    ? ad.images
                    : ad.image ? [ad.image] : [];
                const fallbackImage = getFallbackClassifiedImage(ad);
                const galleryImageUrls = imageUrls.length ? imageUrls : [getClassifiedImage(ad)];
                const galleryImages = galleryImageUrls
                    .map((image, index) => `
                        <img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackImage)}" data-classified-id="${escapeHtml(ad.id)}" data-image-index="${index}" alt="${escapeHtml(ad.title)}${galleryImageUrls.length > 1 ? ` - ${index + 1}` : ''}" role="button" tabindex="0" aria-label="${escapeHtml(currentLang === 'es' ? `Ampliar imagen ${index + 1} de ${galleryImageUrls.length} de ${ad.title}` : `Ampliar imagem ${index + 1} de ${galleryImageUrls.length} de ${ad.title}`)}" class="w-full h-48 sm:h-56 object-cover rounded-xl cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback">
                    `).join('');
                const contactDigits = String(ad.contact || '').replace(/\D/g, '');
                const whatsappUrl = `https://wa.me/${contactDigits}?text=${encodeURIComponent('Hola! Vi tu anuncio en @sere en Luanda: ' + ad.title)}`;
                const editCredential = getClassifiedEditCredential(ad.id);
                const editButton = editCredential
                    ? `<a href="revolicango.html?edit=${encodeURIComponent(ad.id)}" class="inline-flex items-center gap-2 border border-brand-navy text-brand-navy font-bold px-5 py-3 rounded-lg mt-8 hover:bg-slate-50">${escapeHtml(labels.btn_edit_classified)}</a>`
                    : '';
                container.innerHTML = `
                    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <a href="revolicango.html?category=${encodeURIComponent(ad.category)}" class="inline-flex items-center gap-2 text-sm font-bold text-brand-terracotta hover:text-brand-navy">&larr; ${escapeHtml(labels.detail_back)}</a>
                        <article class="mt-8">
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">${galleryImages}</div>
                            <p class="text-sm font-bold text-brand-terracotta uppercase">${category}</p>
                            <h1 class="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy mt-2">${title}</h1>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-200 py-5 my-7 text-sm">
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_price)}</span><strong class="text-brand-navy">${escapeHtml(ad.price)}</strong></p>
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_location)}</span><strong class="text-brand-navy">${escapeHtml(ad.location)}</strong></p>
                                <p><span class="block text-slate-500">${escapeHtml(labels.detail_date)}</span><strong class="text-brand-navy">${escapeHtml(ad.date)}</strong></p>
                            </div>
                            <h2 class="font-serif text-2xl font-bold text-brand-navy">${escapeHtml(labels.detail_description)}</h2>
                            <p class="text-lg text-slate-700 leading-relaxed whitespace-pre-line mt-3">${description}</p>
                            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold px-5 py-3 rounded-lg mt-8 hover:bg-emerald-800">
                                <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>${escapeHtml(labels.detail_contact)}: ${escapeHtml(ad.contact)}
                            </a>
                            ${editButton}
                            ${publicOpinionSectionHTML('classified', ad.id, true)}
                        </article>
                    </div>
                `;
                updateDetailMetadata(ad.title, ad.description);
                loadPublicOpinions('classified', ad.id);
                return;
            }

            container.innerHTML = `
                <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 class="font-serif text-3xl font-bold text-brand-navy">${escapeHtml(labels.detail_not_found)}</h1>
                    <a href="index.html" class="inline-block mt-6 text-brand-terracotta font-bold hover:text-brand-navy">${escapeHtml(labels.detail_home)}</a>
                </div>
            `;
            updateDetailMetadata(labels.detail_not_found, labels.detail_not_found);
        }

        /* ================= MODAL & FORM HANDLERS ================= */
        function openModal() {
            const form = document.querySelector('#ad-modal form');
            const submitButton = form.querySelector('button[type="submit"]');
            if (!activeClassifiedEdit) {
                form.reset();
                submitButton.textContent = translations[currentLang].btn_publish_classified;
            } else {
                submitButton.textContent = translations[currentLang].btn_save_classified_edits;
            }
            document.getElementById('ad-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('ad-modal').classList.add('hidden');
            activeClassifiedEdit = null;
        }

        async function uploadClassifiedImage(file) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                throw new Error(currentLang === 'es'
                    ? 'Elige una imagen JPG, PNG o WebP.'
                    : 'Escolha uma imagem JPG, PNG ou WebP.');
            }
            if (file.size > MAX_CLASSIFIED_IMAGE_INPUT_SIZE_BYTES) {
                throw new Error(currentLang === 'es'
                    ? 'La imagen original no puede superar los 20 MB.'
                    : 'A imagem original não pode exceder 20 MB.');
            }

            if (typeof window.imageCompression !== 'function') {
                throw new Error(currentLang === 'es'
                    ? 'No se pudo cargar el compresor de imágenes. Recarga la página e inténtalo de nuevo.'
                    : 'Não foi possível carregar o compressor de imagens. Atualize a página e tente novamente.');
            }

            const compressionPlans = [
                { maxSizeMB: 0.09, maxWidthOrHeight: 1024, initialQuality: 0.8 },
                { maxSizeMB: 0.07, maxWidthOrHeight: 768, initialQuality: 0.7 },
                { maxSizeMB: 0.05, maxWidthOrHeight: 512, initialQuality: 0.6 },
                { maxSizeMB: 0.03, maxWidthOrHeight: 384, initialQuality: 0.5 }
            ];
            let compressedFile;
            for (const plan of compressionPlans) {
                compressedFile = await window.imageCompression(file, {
                    ...plan,
                    useWebWorker: true,
                    fileType: 'image/jpeg',
                    maxIteration: 15
                });
                if (compressedFile.size <= MAX_CLASSIFIED_IMAGE_STORAGE_SIZE_BYTES) break;
            }

            if (!compressedFile || compressedFile.size > MAX_CLASSIFIED_IMAGE_STORAGE_SIZE_BYTES) {
                throw new Error(currentLang === 'es'
                    ? 'No se pudo reducir la imagen a 100 KB. Prueba con otra imagen.'
                    : 'Não foi possível reduzir a imagem para 100 KB. Tente outra imagem.');
            }

            const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
            const extension = extensions[compressedFile.type];
            if (!extension) {
                throw new Error(currentLang === 'es'
                    ? 'El formato de la imagen comprimida no es compatible.'
                    : 'O formato da imagem comprimida não é compatível.');
            }

            const path = `${crypto.randomUUID()}.${extension}`;
            const response = await fetch(`${SUPABASE_URL}/storage/v1/object/classified-images/${path}`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_PUBLISHABLE_KEY,
                    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                    'Content-Type': compressedFile.type,
                    'x-upsert': 'false',
                    'cache-control': '3600'
                },
                body: compressedFile
            });
            if (!response.ok) {
                const details = await response.text();
                throw new Error(`Supabase Storage (${response.status}): ${details}`);
            }

            return `${SUPABASE_URL}/storage/v1/object/public/classified-images/${path}`;
        }

        async function handleAdSubmit(e) {
            e.preventDefault();

            const form = e.currentTarget;
            const submitButton = form.querySelector('button[type="submit"]');
            const title = document.getElementById('ad-title').value.trim();
            const category = document.getElementById('ad-category').value;
            const price = document.getElementById('ad-price').value.trim();
            const contact = document.getElementById('ad-contact').value.trim();
            const location = document.getElementById('ad-location').value.trim() || 'Luanda, Angola';
            const imageFiles = Array.from(document.getElementById('ad-image').files || []);
            const description = document.getElementById('ad-description').value.trim();
            const existingAd = activeClassifiedEdit
                ? classifiedsData.find(item => String(item.id) === activeClassifiedEdit.id)
                : null;

            if (title.length > 100 || price.length > 80 || contact.length > 30
                || location.length > 100 || description.length > 2000) {
                showToast(currentLang === 'es'
                    ? 'Revisa la longitud de los campos e inténtalo de nuevo.'
                    : 'Verifique se os campos respeitam o limite de caracteres e tente novamente.', true);
                return;
            }

            if (!/^[+\d][\d\s().-]{6,29}$/.test(contact)) {
                showToast(currentLang === 'es'
                    ? 'Introduce un teléfono o WhatsApp válido.'
                    : 'Introduza um telefone ou WhatsApp válido.', true);
                return;
            }

            if (imageFiles.length > 10) {
                showToast(currentLang === 'es'
                    ? 'Puedes elegir como máximo 10 imágenes por anuncio.'
                    : 'Pode selecionar até 10 imagens por anúncio.', true);
                return;
            }

            if (imageFiles.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
                || file.size > MAX_CLASSIFIED_IMAGE_INPUT_SIZE_BYTES)) {
                showToast(currentLang === 'es'
                    ? 'Cada imagen debe ser JPG, PNG o WebP y pesar hasta 20 MB antes de comprimirla.'
                    : 'Cada imagem deve ser JPG, PNG ou WebP e ter até 20 MB antes da compressão.', true);
                return;
            }

            submitButton.disabled = true;
            try {
                let imageUrls;
                if (imageFiles.length) {
                    imageUrls = [];
                    for (const imageFile of imageFiles) {
                        imageUrls.push(await uploadClassifiedImage(imageFile));
                    }
                } else {
                    imageUrls = existingAd?.images || (existingAd?.image ? [existingAd.image] : []);
                }
                const payload = {
                    title,
                    category,
                    price,
                    contact,
                    location,
                    image_urls: imageUrls,
                    image_url: imageUrls[0] || '',
                    description
                };
                const isEditing = Boolean(activeClassifiedEdit);
                const editToken = isEditing ? activeClassifiedEdit.token : crypto.randomUUID();
                const endpoint = isEditing ? 'edit_classified_once' : 'publish_classified';
                const requestBody = isEditing
                    ? { p_classified_id: activeClassifiedEdit.id, p_data: payload, p_edit_token: editToken }
                    : { p_data: payload, p_edit_token: editToken };
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                        'Content-Type': 'application/json',
                        Prefer: 'return=representation'
                    },
                    body: JSON.stringify(requestBody)
                });
                if (!response.ok) {
                    const details = await response.text();
                    throw new Error(`Supabase (${response.status}): ${details}`);
                }

                const result = await response.json();
                let editCredentialStored = false;
                const newAd = {
                    id: result.id,
                    title: result.title,
                    category: result.category,
                    price: result.price || (currentLang === 'es' ? 'Consultar' : 'A consultar'),
                    contact: result.contact,
                    location: result.location,
                    date: new Date(result.created_at).toLocaleDateString(currentLang === 'es' ? 'es' : 'pt-PT'),
                    images: Array.isArray(result.image_urls) && result.image_urls.length
                        ? result.image_urls
                        : result.image_url ? [result.image_url] : [],
                    description: result.description
                };
                if (isEditing) {
                    const index = classifiedsData.findIndex(item => String(item.id) === String(result.id));
                    if (index >= 0) classifiedsData[index] = newAd;
                    removeClassifiedEditCredential(result.id);
                    activeClassifiedEdit = null;
                } else {
                    classifiedsData.unshift(newAd);
                    editCredentialStored = storeClassifiedEditCredential(result.id, editToken, result.edit_expires_at);
                }
                renderClassifieds();
                renderHomeFeaturedAds();
                renderDetail();
                closeModal();
                form.reset();
                showToast(isEditing
                    ? currentLang === 'es'
                        ? 'Corrección guardada. Ya utilizaste tu única edición.'
                        : 'Correção guardada. Já utilizou a sua única edição.'
                    : editCredentialStored
                        ? currentLang === 'es'
                            ? '¡Anuncio publicado! Abre su ficha para editarlo una vez durante los próximos 5 minutos.'
                            : 'Anúncio publicado! Abra a ficha para editá-lo uma vez nos próximos 5 minutos.'
                        : currentLang === 'es'
                            ? 'Anuncio publicado, pero este navegador no pudo guardar el acceso de edición.'
                            : 'Anúncio publicado, mas este navegador não conseguiu guardar o acesso de edição.');
            } catch (error) {
                console.error('No se pudo enviar el anuncio:', error);
                showToast(currentLang === 'es'
                    ? error.message.startsWith('Supabase')
                        ? 'No se pudo completar la publicación. Revisa la configuración del almacenamiento.'
                        : error.message
                    : error.message.startsWith('Supabase')
                        ? 'Não foi possível concluir a publicação. Verifique a configuração do armazenamento.'
                        : error.message, true);
            } finally {
                submitButton.disabled = false;
            }
        }

        function handleContactSubmit(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const labels = currentLang === 'es'
                ? { name: 'Nombre', phone: 'Teléfono', email: 'Correo', missingEmail: 'No indicado', subject: 'Asunto', message: 'Mensaje' }
                : { name: 'Nome', phone: 'Telefone', email: 'E-mail', missingEmail: 'Não indicado', subject: 'Assunto', message: 'Mensagem' };
            const message = [
                `${labels.name}: ${formData.get('name')}`,
                `${labels.phone}: ${formData.get('phone')}`,
                `${labels.email}: ${formData.get('email') || labels.missingEmail}`,
                `${labels.subject}: ${formData.get('subject')}`,
                `${labels.message}: ${formData.get('message')}`
            ].join('\n');
            const whatsappUrl = `https://wa.me/244936962161?text=${encodeURIComponent(message)}`;
            window.location.href = whatsappUrl;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msgElem = document.getElementById('toast-message');
            const icon = document.getElementById('toast-icon');
            msgElem.textContent = message;
            icon.className = isError
                ? 'fa-solid fa-circle-exclamation text-rose-400 text-lg'
                : 'fa-solid fa-circle-check text-emerald-400 text-lg';

            toast.classList.remove('translate-y-20', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');

            setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 4000);
        }

        window.onload = function() {
            document.addEventListener('submit', event => {
                if (event.target.matches('form[data-opinion-form]')) handlePublicOpinionSubmit(event);
            });
            document.addEventListener('click', event => {
                const image = event.target.closest('img[data-classified-id][data-image-index]');
                if (!image) return;
                event.preventDefault();
                openClassifiedGallery(image.dataset.classifiedId, image.dataset.imageIndex, image);
            });
            document.addEventListener('keydown', event => {
                const image = event.target.closest('img[data-classified-id][data-image-index]');
                if (!image || !['Enter', ' '].includes(event.key)) return;
                event.preventDefault();
                openClassifiedGallery(image.dataset.classifiedId, image.dataset.imageIndex, image);
            });
            setLanguage(currentLang);
            renderClassifieds();
            renderHomeFeaturedAds();
            loadSharedClassifieds();
            loadSiteContent();
            const requestedCategory = new URLSearchParams(window.location.search).get('category');
            if (requestedCategory) selectCategory(requestedCategory);
            const requestedParams = new URLSearchParams(window.location.search);
            const requestedCultureTab = requestedParams.get('tab');
            const requestedArtCategory = requestedParams.get('arte');
            if (['historia', 'tradiciones', 'arte'].includes(requestedCultureTab)) selectCultureTab(requestedCultureTab);
            if (requestedArtCategory) filterArtCategory(requestedArtCategory);
        };