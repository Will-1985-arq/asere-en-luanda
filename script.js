/* ================= STATE & INITIAL DATA ================= */
        const SUPABASE_URL = 'https://gurqlrykdcdnqhnsuyhm.supabase.co';
        const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vJA7pquZf7anlnm8nGwsRQ_FOGFuHQ-';
        const CLASSIFIED_EDIT_STORAGE_KEY = 'community-classified-edit-credentials';
        const MAX_CLASSIFIED_IMAGE_INPUT_SIZE_BYTES = 20 * 1024 * 1024;
        const MAX_CLASSIFIED_IMAGE_STORAGE_SIZE_BYTES = 100 * 1024;
        let activeClassifiedEdit = null;
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
        /* ================= I18N DICTIONARY ================= */
        const translations = {
            es: {
                tagline: "Cuba y Angola unidas",
                nav_home: "Inicio",
                nav_about: "Quiénes somos",
                nav_news: "Noticias",
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

                hero_badge: "El punto de encuentro para la comunidad en Luanda",
                hero_title: "La calidez de Cuba con el corazón de Angola",
                hero_desc: "Conectamos la vibrante comunidad cubana y angolana en Luanda. Encuentra eventos culturales, noticias relevantes, servicios profesionales y clasificados en RevolicAngo.",
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
                home_event_title: "Noche de Timba y Semba en Miramar",
                home_event_date: "Domingo, 18 de octubre",
                home_event_desc: "Disfruta de la mejor fusión musical caribeña y angolana con orquesta en vivo, gastronomía criolla y excelente ambiente en el corazón de Luanda.",
                see_agenda: "Ver Agenda Cultural Completa",
                home_news_tag: "Noticias Recientes",
                home_news_title: "Guía Consular y Trámites para la Comunidad",
                home_news_desc: "Actualización de requerimientos, renovación de pasaportes y orientaciones legales para residentes cubanos en Luanda y provincias vecinas.",
                read_news: "Leer Sección de Noticias",

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

                news_header: "Noticias & Actualidad",
                news_subheader: "Información relevante para residentes e interesados en Luanda.",
                cat_consular: "Consular & Vuelos",
                cat_health: "Salud & Bienestar",
                cat_entrepreneur: "Emprendimiento",
                cat_international: "Internacional",
                news_1_title: "Actualizaciones en itinerarios de vuelos Luanda - La Habana",
                news_1_body: "Conoce los horarios actualizados y recomendaciones para los trayectos directos y escalas entre Luanda y La Habana para esta temporada.",
                news_2_title: "Jornada Médica de Orientación en Luanda",
                news_2_body: "Especialistas de la salud ofrecen charlas preventivas sobre la temporada de lluvias en Angola y cuidados de nutrición familiar.",
                news_3_title: "Éxito en la feria de gastronomía caribeña en Talatona",
                news_3_body: "Emprendedores culinarios destacan con recetas tradicionales como el lechón asado, congrí y tostones, recibidos con entusiasmo local.",
                news_4_title: "El mundo vuelve a pronunciarse mayoritariamente contra el bloqueo a Cuba",
                news_4_summary: "La ONU volvió a pronunciarse mayoritariamente a favor de poner fin al bloqueo contra Cuba, en una votación de especial interés para las comunidades cubana y angolana.",
                news_4_body_1: "La Asamblea General de la ONU respaldó una vez más una resolución para exigir la conclusión de las sanciones económicas, comerciales y financieras aplicadas por la administración estadounidense contra la isla. La iniciativa obtuvo un amplio apoyo internacional con 130 votos favorables, superando ampliamente a los 17 sufragios en contra y las 25 abstenciones registradas.",
                news_4_body_2: "Durante las discusiones previas, varios representantes estatales recalcaron el impacto negativo de estas medidas sobre los ciudadanos cubanos, así como la vigencia de disposiciones con alcance extraterritorial. En respuesta a la decisión adoptada, el mandatario Miguel Díaz-Canel señaló mediante su perfil en redes sociales que la comunidad internacional ratificó su rechazo a dicho cerco económico a pesar de los intentos de coerción por parte de Washington.",
                news_4_image_alt: "Imagen de Granma que acompaña la noticia sobre la votación en la ONU",
                news_source_link: "Consultar el artículo original en el periódico Granma",
                news_5_title: "La salud como puente solidario: El impacto de la Feria de la Salud en la UGS",
                news_5_summary: "La Feria de la Salud de la Universidad Gregório Semedo, el 30 de octubre, reunirá consultas gratuitas, prevención del cáncer de mama y actividades culturales para la comunidad de Luanda.",
                news_5_body_1: "La celebración de la Feria de la Salud en la Universidad Gregório Semedo (UGS), prevista para este 30 de octubre, trasciende el ámbito puramente académico para convertirse en un ejercicio de responsabilidad social y hermandad comunitaria en Luanda. En el marco del Octubre Rosa, la iniciativa sitúa la prevención y el diagnóstico temprano del cáncer de mama en el centro de la conversación pública, un desafío de salud global que exige la movilización de toda la sociedad.",
                news_5_body_2: "Para la comunidad angolana y la amplia representación de residentes extranjeros —con una destacada y solidaria presencia de profesionales de la salud cubanos—, este evento representa un espacio de encuentro y bienestar accesible. La participación de médicos cubanos reafirma una larga tradición de cooperación internacionalista y humanista, poniendo la experiencia médica al servicio de diversos sectores de la población luandense de forma totalmente gratuita.",
                news_5_schedule_intro: "El impacto de la feria se despliega en dos tiempos fundamentales:",
                news_5_schedule_1: "Prevención y atención directa: de 9:00 a 15:00, consultas médicas gratuitas ofrecerán orientación clínica esencial para el bienestar familiar.",
                news_5_schedule_2: "Sensibilización cultural y artística: a partir de las 17:00, la música y el teatro servirán para concienciar y recordar que la prevención es un acto de amor y vida.",
                news_5_body_3: "Integrar a familias, estudiantes y profesionales en un mismo propósito fortalece el tejido social de Luanda y demuestra que la salud comunitaria se construye con educación, solidaridad y el compromiso activo de todos.",
                news_5_image_alt: "Cartel de la Feria de la Salud en la Universidad Gregório Semedo",
                btn_read_more: "Leer más",

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
                footer_tag: "Unidad, Cultura y Hermandad"
            },
            pt: {
                tagline: "Cuba e Angola unidas",
                nav_home: "Início",
                nav_about: "Quem Somos",
                nav_news: "Notícias",
                nav_events: "Eventos",
                nav_culture: "Cultura",
                nav_revolicango: "RevolicAngo",
                nav_contact: "Contactos",
                btn_publish: "Publicar Anúncio",
                search_label: "Buscar anúncios",
                search_placeholder: "Buscar veículos, telefones, arrendamentos, empregos...",
                contact_name_placeholder: "Seu nome",
                contact_phone_placeholder: "+244...",
                contact_email_placeholder: "exemplo@correo.com",
                contact_message_placeholder: "Escreva sua mensagem aqui...",
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

                hero_badge: "O ponto de encontro para a comunidade em Luanda",
                hero_title: "O calor de Cuba com o coração de Angola",
                hero_desc: "Conectamos a vibrante comunidade cubana e angolana em Luanda. Encontre eventos culturais, notícias relevantes, serviços profissionais e classificados no RevolicAngo.",
                hero_btn_revolicango: "Explorar RevolicAngo",
                hero_btn_events: "Próximos Eventos",
                hero_box_title: "Comunidade em Movimento",
                hero_box_btn: "Publicar Anúncio Agora",
                stat_classifieds: "Anúncios no RevolicAngo",
                stat_active: "Rede Comunitária Ativa",
                stat_bilingual: "Espanhol & Português",
                stat_location: "Luanda, Angola",

                home_revolic_sub: "Mercado e Classificados",
                home_revolic_title: "Destaques no RevolicAngo",
                view_all: "Ver todas as categorias",
                home_event_tag: "Próximo Encontro",
                home_event_title: "Noite de Timba e Semba em Miramar",
                home_event_date: "Domingo, 18 de outubro",
                home_event_desc: "Aproveite a melhor fusão musical caribenha e angolana com orquestra ao vivo, gastronomia típica e excelente ambiente no coração de Luanda.",
                see_agenda: "Ver Agenda Cultural Completa",
                home_news_tag: "Notícias Recentes",
                home_news_title: "Guia Consular e Trâmites para a Comunidade",
                home_news_desc: "Atualização de requisitos, renovação de passaportes e orientações legais para residentes cubanos em Luanda e províncias vizinhas.",
                read_news: "Ler Secção de Notícias",

                about_title: "Quem Somos",
                about_subtitle: "Uma ponte de fraternidade, cultura e apoio mútuo em Luanda.",
                about_badge: "A Nossa História",
                about_heading: "Unindo duas terras irmãs",
                about_text_1: "O @sere em Luanda nasce com o propósito de oferecer um espaço comum para os profissionais, colaboradores, famílias e empreendedores cubanos radicados em Angola, bem como para os irmãos angolanos que amam a cultura caribenha.",
                about_text_2: "Através da nossa plataforma, facilitamos o intercâmbio de informação, divulgação de eventos socioculturais e comércio de bens e serviços éticos através do RevolicAngo.",
                mission_title: "Os Nossos Pilares",
                pilar_1_title: "Integração Cultural",
                pilar_1_desc: "Promover o respeito, a música, tradições e gastronomia que unem Cuba e Angola.",
                pilar_2_title: "Apoio Comunitário",
                pilar_2_desc: "Fornecer orientação útil aos recém-chegados e informações sobre procedimentos essenciais.",
                pilar_3_title: "Dinamismo Económico",
                pilar_3_desc: "Conectar oferta e procura de bens, veículos, arrendamentos e serviços qualificados.",

                news_header: "Notícias & Atualidade",
                news_subheader: "Informação relevante para residentes e interessados em Luanda.",
                cat_consular: "Consular & Voos",
                cat_health: "Saúde & Bem-estar",
                cat_entrepreneur: "Empreendedorismo",
                cat_international: "Internacional",
                news_1_title: "Atualizações nos itinerários de voos Luanda - Havana",
                news_1_body: "Conheça os horários atualizados e recomendações para os trajetos diretos e escalas entre Luanda e Havana para esta temporada.",
                news_2_title: "Jornada Médica de Orientação em Luanda",
                news_2_body: "Especialistas de saúde oferecem palestras preventivas sobre a época de chuvas em Angola e cuidados de nutrição familiar.",
                news_3_title: "Sucesso na feira de gastronomia caribenha em Talatona",
                news_3_body: "Empreendedores culinários destacam-se com receitas tradicionais como leitão assado, congrí e tostones, acolhidos com entusiasmo.",
                news_4_title: "O mundo volta a pronunciar-se maioritariamente contra o bloqueio a Cuba",
                news_4_summary: "A ONU voltou a pronunciar-se maioritariamente a favor do fim do bloqueio contra Cuba, numa votação de especial interesse para as comunidades cubana e angolana.",
                news_4_body_1: "A Assembleia Geral da ONU voltou a apoiar uma resolução para exigir o fim das sanções económicas, comerciais e financeiras impostas pela administração dos Estados Unidos contra a ilha. A iniciativa obteve amplo apoio internacional, com 130 votos a favor, superando os 17 votos contra e as 25 abstenções registadas.",
                news_4_body_2: "Durante os debates, vários representantes dos Estados destacaram o impacto negativo destas medidas sobre os cidadãos cubanos, bem como a vigência de disposições com alcance extraterritorial. Em resposta à decisão, o Presidente Miguel Díaz-Canel afirmou nas redes sociais que a comunidade internacional voltou a rejeitar o cerco económico, apesar das tentativas de coerção por parte de Washington.",
                news_4_image_alt: "Imagem do Granma que acompanha a notícia sobre a votação na ONU",
                news_source_link: "Consultar o artigo original no jornal Granma",
                news_5_title: "A saúde como ponte solidária: o impacto da Feira da Saúde na UGS",
                news_5_summary: "A Feira da Saúde da Universidade Gregório Semedo, a 30 de outubro, reunirá consultas gratuitas, prevenção do cancro da mama e atividades culturais para a comunidade de Luanda.",
                news_5_body_1: "A realização da Feira da Saúde na Universidade Gregório Semedo (UGS), prevista para 30 de outubro, vai além do âmbito académico e torna-se um exercício de responsabilidade social e fraternidade comunitária em Luanda. No âmbito do Outubro Rosa, a iniciativa coloca a prevenção e o diagnóstico precoce do cancro da mama no centro da conversa pública, um desafio global de saúde que exige a mobilização de toda a sociedade.",
                news_5_body_2: "Para a comunidade angolana e os muitos residentes estrangeiros — incluindo uma presença solidária de profissionais de saúde cubanos —, este evento representa um espaço acessível de encontro e bem-estar. A participação de médicos cubanos reafirma uma longa tradição de cooperação internacionalista e humanista, colocando a experiência médica ao serviço de diversos setores da população de Luanda, totalmente gratuita.",
                news_5_schedule_intro: "O impacto da feira desenrola-se em dois momentos fundamentais:",
                news_5_schedule_1: "Prevenção e atendimento direto: das 9h às 15h, consultas médicas gratuitas oferecerão orientação clínica essencial para o bem-estar das famílias.",
                news_5_schedule_2: "Sensibilização cultural e artística: a partir das 17h, a música e o teatro serão usados para sensibilizar e lembrar que a prevenção é um ato de amor e de vida.",
                news_5_body_3: "Reunir famílias, estudantes e profissionais em torno de um objetivo comum fortalece o tecido social de Luanda e demonstra que a saúde comunitária se constrói com educação, solidariedade e o compromisso ativo de todos.",
                news_5_image_alt: "Cartaz da Feira da Saúde na Universidade Gregório Semedo",
                btn_read_more: "Ler mais",

                events_header: "Eventos & Agenda Cultural",
                events_subheader: "Concertos, workshops, encontros sociais e datas comemorativas.",
                event_tag_music: "Música & Dança",
                event_tag_gastro: "Gastronomia",
                event_tag_sports: "Desporto & Família",
                event_1_title: "Grande Gala Rueda de Casino & Kizomba",
                event_1_desc: "Intercâmbio de ritmos caribenhos e angolanos. Workshops de dança para iniciantes e avançados.",
                event_2_title: "Workshop de Tempero Crioulo: Assados e Molhos",
                event_2_desc: "Aprenda os segredos do tempero tradicional cubano combinados com produtos locais angolanos.",
                event_3_title: "Torneio Amigável de Dominó & Jogos de Tradição",
                event_3_desc: "Tarde de dominó em duplas, refeição em família e ambiente fraterno para todas as idades.",
                btn_reserve: "Solicitar Info",

                culture_header: "Cultura, Gíria e Tradição",
                culture_subheader: "Explore a história, tradições e manifestações artísticas que unem Cuba e Angola.",
                culture_tab_historia: "História",
                culture_tab_tradiciones: "Tradições e Folclore",
                culture_tab_arte: "Arte",
                historia_badge: "Laços Indissolúveis",
                historia_title: "História partilhada entre Cuba e Angola",
                historia_desc_1: "A relação entre Cuba e Angola é um laço único forjado na solidariedade, respeito mútuo e raízes africanas que viajaram pelo Atlântico para regressar décadas depois em cooperação médica, educativa e cultural.",
                historia_desc_2: "Desde a década de 1970, milhares de profissionais, colaboradores, educadores e médicos construíram pontes humanas de amizade sincera. Hoje em Luanda, esta memória histórica permanece viva através da comunidade cubana perfeitamente integrada.",
                historia_milestones_title: "Marcos da Nossa Fraternidade",
                hito_1_t: "Raízes Ancestrais Bantus",
                hito_1_d: "A marcante presença da cultura bantu de Angola na música, religião e folclore do Caribe cubano.",
                hito_2_t: "Cooperação Médica e Educativa",
                hito_2_d: "Formação de gerações de profissionais angolanos e colaboração contínua em hospitais e institutos.",
                hito_3_t: "Integração Familiar e Social",
                hito_3_d: "Lares mistos cubano-angolanos que enriquecem o quotidiano de Luanda com tradições partilhadas.",

                tradiciones_title: "Tradições, Festividades e Folclore",
                tradiciones_sub: "Costumes partilhados, gastronomia de fusão, reuniões familiares e expressões linguísticas que definem o estilo de vida comunitário em Luanda.",
                trad_gastro_title: "Temperos Crioulos & Muamba",
                trad_gastro_desc: "Encontro gastronómico inesquecível: arroz congrí, mandioca com mojo e leitão assado convivem com caldeirada de peixe, funge e muamba de galinha.",
                trad_domino_title: "O Dominó e as Kizombadas",
                trad_domino_desc: "Tardes de dominó em duplas nos quintais de Luanda, acompanhadas de boa música, conversas animadas e ambiente festivo entre amigos.",
                trad_carnaval_title: "Carnaval de Luanda & Comparsas",
                trad_carnaval_desc: "O ritmo percussivo dos tambores, a dança alegre e o colorido dos trajes conectam o Carnaval de Luanda às tradicionais congas caribenhas.",

                arte_title: "Arte e Expressões Criativas",
                arte_sub: "Descubra o talento, projetos colaborativos e manifestações artísticas de ambas as nações.",
                art_cat_all: "Todas as Artes",
                art_cat_lit: "Literatura",
                art_cat_mus: "Música",
                art_cat_cine: "Cinema",
                art_cat_vis: "Artes Visuais e Plásticas",
                art_cat_danza: "Dança",
                art_cat_teatro: "Teatro",

                art_lit_title: "Poesia e Narrativa Afro-Caribenha",
                art_lit_desc: "O encontro de versos de Nicolás Guillén e Agostinho Neto. Apresentações de livros, workshops literários e leituras de poesia bilingue em Luanda.",
                art_mus_title: "Fusão de Son, Timba, Semba e Kizomba",
                art_mus_desc: "A clave cubana e a cadência angolana conectam orquestras e grupos locais que animam as noites culturais de Miramar e Talatona.",
                art_cine_title: "Mostras de Documentários e Debate",
                art_cine_desc: "Exibição de longas-metragens históricas, documentários sobre intercâmbio cultural e curtas-metragens contemporâneas de jovens criadores.",
                art_vis_title: "Pintura, Escultura e Muralismo Urbano",
                art_vis_desc: "Exposições plásticas de artistas caribenhos e africanos. Telas coloridas, esculturas em madeira e murais que embelezam as ruas de Luanda.",
                art_danza_title: "Rueda de Casino e Danças Tradicionais",
                art_danza_desc: "Academias e encontros populares onde Salsa, Casino, Kizomba, Kuduro e Dança Afro se combinam em espetáculos dinâmicos.",
                art_teatro_title: "Teatro Comunitário e Performance",
                art_teatro_desc: "Obras dramatúrgicas sobre histórias de migração, superação e fraternidade. Grupos teatrais comunitários em centros culturais da cidade.",

                glossary_title: "Glossário Cubano - Angolano",
                glossary_sub: "Conheça os termos mais populares usados no dia a dia em Luanda.",
                glossary_1: "Amigo próximo, compadre, irmão de vida.",
                glossary_2: "Saudação quotidiana para perguntar o que há de novo ou como vai tudo.",
                glossary_3: "Expressão usada quando algo está excelente, divertido ou animado.",
                glossary_4: "Reunião festiva com boa comida, música alegre e dança entre amigos.",
                glossary_5: "Transporte coletivo urbano caraterístico do quotidiano.",
                glossary_6: "Habilidade para resolver imprevistos de forma engenhosa e rápida.",

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
                no_ads_title: "Nenhum anúncio encontrado",
                no_ads_desc: "Seja o primeiro a publicar um anúncio nesta categoria.",

                contact_header: "Contactos & Atendimento",
                contact_subheader: "Estamos aqui para ouvir, aconselhar e conectar com você em Luanda.",
                contact_info_title: "Informação Direta",
                click_chat: "Clique para conversar diretamente",
                label_phone: "Telefone Direto",
                label_location: "Localização",
                contact_form_title: "Envie-nos uma Mensagem",
                form_name: "Nome Completo",
                form_phone: "Telefone / WhatsApp",
                form_email: "Correio Eletrónico",
                form_subject: "Assunto",
                opt_general: "Consulta Geral",
                opt_revolicango: "Suporte Anúncios RevolicAngo",
                opt_events: "Proposta de Eventos / Cultura",
                opt_commercial: "Publicidade e Parcerias",
                form_msg: "Mensagem",
                btn_send: "Enviar Mensagem",

                modal_title: "Publicar Anúncio no RevolicAngo",
                modal_sub: "Alcance toda a comunidade de Luanda rapidamente.",
                modal_field_title: "Título do Anúncio *",
                modal_field_cat: "Categoria *",
                modal_field_price: "Preço (AOA ou USD)",
                modal_field_phone: "Telefone / WhatsApp de Contacto *",
                modal_field_loc: "Município / Zona em Luanda",
                modal_field_img: "Imagem do seu dispositivo (Opcional)",
                modal_img_help: "Até 10 imagens JPG, PNG ou WebP de até 20 MB cada. São comprimidas para no máximo 100 KB antes do envio. Ao editar, se não escolher novas, as anteriores serão mantidas.",
                modal_field_desc: "Descrição detalhada *",
                ad_contact_consent: "Aceito que o meu telefone e os dados deste anúncio sejam publicados e fiquem visíveis publicamente.",
                btn_edit_classified: "Editar anúncio (uma vez, nos primeiros 5 minutos)",
                btn_save_classified_edits: "Guardar correção",
                btn_publish_classified: "Publicar Anúncio",
                event_month_oct: "OUT",
                event_month_nov: "NOV",
                event_month_dec: "DEZ",
                btn_cancel: "Cancelar",
                btn_submit_ad: "Publicar Anúncio",

                footer_about: "Comunidade e diretório informativo para unir laços culturais e comerciais em Angola.",
                footer_links: "Navegação",
                footer_subpages: "Categorias RevolicAngo",
                footer_contact: "Contacto Direto",
                footer_tag: "Unidade, Cultura e Fraternidade"
            }
        };

        const newsArticles = [
            { id: 'news-1', categoryKey: 'cat_consular', titleKey: 'news_1_title', bodyKey: 'news_1_body', date: '02 Oct 2026', readingMinutes: 3 },
            { id: 'news-2', categoryKey: 'cat_health', titleKey: 'news_2_title', bodyKey: 'news_2_body', date: '28 Sep 2026', readingMinutes: 4 },
            { id: 'news-3', categoryKey: 'cat_entrepreneur', titleKey: 'news_3_title', bodyKey: 'news_3_body', date: '20 Sep 2026', readingMinutes: 2 },
            { id: 'news-4', categoryKey: 'cat_international', titleKey: 'news_4_title', bodyKeys: ['news_4_body_1', 'news_4_body_2'], date: '28 Oct 2026', readingMinutes: 2, sourceUrl: 'https://www.granma.cu/cuba-no-es-una-amenaza/2026-10-28/el-mundo-ha-vuelto-a-pronunciarse-mayoritariamente-contra-el-bloqueo-a-cuba-28-10-2026-11-10-18' },
            { id: 'news-5', categoryKey: 'cat_health', titleKey: 'news_5_title', summaryKey: 'news_5_summary', bodyKeys: ['news_5_body_1', 'news_5_body_2', 'news_5_body_3'], listIntroKey: 'news_5_schedule_intro', listKeys: ['news_5_schedule_1', 'news_5_schedule_2'], listAfterParagraphs: 2, date: '29 Oct 2026', readingMinutes: 3, image: 'feria-saude-ugs.jpg', imageAltKey: 'news_5_image_alt' }
        ];

        const eventArticles = [
            { id: 'home-event', titleKey: 'home_event_title', categoryKey: 'home_event_tag', bodyKey: 'home_event_desc', whenKey: 'home_event_date', location: 'Miramar, Luanda' },
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
            document.documentElement.lang = lang;
            writeLocalStorage('community-language', lang);
            const localizedTexts = translations[lang] || translations.es;

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
            upgradeInertLinks();

            // Re-render classifieds to update labels
            renderClassifieds();
            renderHomeFeaturedAds();
            renderDetail();
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
            heading.textContent = cat === 'all' ? (currentLang === 'es' ? 'Todos los Clasificados' : 'Todos os Classificados') : `${cat}`;

            renderClassifieds();
        }

        function filterClassifieds() {
            renderClassifieds();
        }

        function renderClassifieds() {
            const statCount = document.getElementById('classifieds-stat-count');
            if (statCount) statCount.textContent = classifiedsData.length;

            const grid = document.getElementById('classifieds-grid');
            const noAds = document.getElementById('no-classifieds');
            if (!grid || !noAds) return;
            const searchVal = (document.getElementById('classified-search')?.value || '').toLowerCase();

            let items = classifiedsData.filter(item => {
                const matchesCat = currentCategory === 'all' || item.category === currentCategory;
                const matchesSearch = item.title.toLowerCase().includes(searchVal) || 
                                      item.description.toLowerCase().includes(searchVal) ||
                                      item.location.toLowerCase().includes(searchVal);
                return matchesCat && matchesSearch;
            });

            // Update counter
            document.getElementById('classifieds-count').textContent = `${items.length} ${currentLang === 'es' ? 'anuncios' : 'anúncios'}`;

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
                        ? new Date(row.created_at).toLocaleDateString(currentLang === 'es' ? 'es' : 'pt')
                        : '',
                    images: Array.isArray(row.image_urls) && row.image_urls.length
                        ? row.image_urls
                        : row.image_url ? [row.image_url] : [],
                    description: row.description
                }));

                classifiedsData.splice(0, classifiedsData.length, ...sharedAds);
                renderClassifieds();
                renderHomeFeaturedAds();
                renderDetail();
                const requestedEditId = new URLSearchParams(window.location.search).get('edit');
                if (requestedEditId) {
                    window.history.replaceState({}, '', window.location.pathname);
                    beginClassifiedEdit(requestedEditId);
                }
            } catch (error) {
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
                <a href="${detailUrl}" class="block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-terracotta">
                    <div class="h-48 bg-slate-100 overflow-hidden">
                        <img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackImage)}" alt="${escapeHtml(ad.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback">
                    </div>
                    <div class="p-5 flex items-center justify-between gap-4">
                        <h3 class="font-serif font-bold text-lg text-brand-navy group-hover:text-brand-terracotta transition-colors">${escapeHtml(ad.title)}</h3>
                        <i class="fa-solid fa-arrow-right text-brand-terracotta shrink-0" aria-hidden="true"></i>
                    </div>
                </a>
            `;
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

        function renderDetail() {
            const container = document.getElementById('detail-content');
            if (!container) return;

            const params = new URLSearchParams(window.location.search);
            const type = params.get('tipo');
            const id = params.get('id');
            const labels = translations[currentLang] || translations.es;
            const article = type === 'noticia' ? newsArticles.find(item => item.id === id) : null;
            const event = type === 'evento' ? eventArticles.find(item => item.id === id) : null;
            const culture = type === 'cultura' ? cultureArticles.find(item => item.id === id) : null;
            const ad = type === 'anuncio' ? classifiedsData.find(item => String(item.id) === id) : null;

            if (article) {
                const title = labels[article.titleKey] || translations.es[article.titleKey];
                const category = labels[article.categoryKey] || translations.es[article.categoryKey];
                const paragraphs = (article.bodyKeys || [article.bodyKey])
                    .map(key => labels[key] || translations.es[key])
                    .filter(Boolean);
                const listAfterParagraphs = article.listKeys
                    ? Math.min(article.listAfterParagraphs ?? paragraphs.length, paragraphs.length)
                    : paragraphs.length;
                const renderParagraphs = items => items
                    .map(paragraph => `<p class="text-lg text-slate-700 leading-relaxed">${escapeHtml(paragraph)}</p>`)
                    .join('');
                const schedule = article.listKeys
                    ? `<p class="text-lg text-slate-700 leading-relaxed">${escapeHtml(labels[article.listIntroKey] || translations.es[article.listIntroKey])}</p>
                       <ul class="list-disc space-y-3 pl-6 text-lg text-slate-700 leading-relaxed">${article.listKeys.map(key => `<li>${escapeHtml(labels[key] || translations.es[key])}</li>`).join('')}</ul>`
                    : '';
                const image = article.image
                    ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(labels[article.imageAltKey] || translations.es[article.imageAltKey])}" class="w-full max-h-[28rem] object-cover rounded-2xl mb-7" loading="lazy" decoding="async">`
                    : '';
                container.innerHTML = `
                    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <a href="index.html" class="inline-flex items-center gap-2 text-sm font-bold text-brand-terracotta hover:text-brand-navy">&larr; ${escapeHtml(labels.detail_home)}</a>
                        <article class="mt-8">
                            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <span class="bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full font-bold">${escapeHtml(category)}</span>
                                <time>${escapeHtml(article.date)}</time>
                                <span>${escapeHtml(labels.detail_reading)}: ${article.readingMinutes} min</span>
                            </div>
                            <h1 class="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy mt-5">${escapeHtml(title)}</h1>
                            <div class="border-t border-slate-200 mt-8 pt-6">
                                ${image}
                                ${renderParagraphs(paragraphs.slice(0, listAfterParagraphs))}
                                ${schedule}
                                ${renderParagraphs(paragraphs.slice(listAfterParagraphs))}
                                ${article.sourceUrl ? `<a href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-5 text-sm font-bold text-brand-terracotta hover:text-brand-navy">${escapeHtml(labels.news_source_link || translations.es.news_source_link)}</a>` : ''}
                            </div>
                        </article>
                    </div>
                `;
                document.title = `${title} | @sere en Luanda`;
                return;
            }

            if (event) {
                const title = labels[event.titleKey] || translations.es[event.titleKey];
                const category = labels[event.categoryKey] || translations.es[event.categoryKey];
                const description = labels[event.bodyKey] || translations.es[event.bodyKey];
                const backUrl = event.id === 'home-event' ? 'index.html' : 'eventos.html';
                const when = event.whenKey
                    ? labels[event.whenKey] || translations.es[event.whenKey]
                    : `${labels[event.monthKey] || translations.es[event.monthKey]} ${event.day} | ${event.time} hrs`;
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
                        </article>
                    </div>
                `;
                document.title = `${title} | @sere en Luanda`;
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
                        </article>
                    </div>
                `;
                document.title = `${title} | @sere en Luanda`;
                return;
            }

            if (ad) {
                const title = escapeHtml(ad.title);
                const category = escapeHtml(ad.category);
                const description = escapeHtml(ad.description);
                const imageUrls = Array.isArray(ad.images) && ad.images.length
                    ? ad.images
                    : ad.image ? [ad.image] : [];
                const fallbackImage = getFallbackClassifiedImage(ad);
                const galleryImages = (imageUrls.length ? imageUrls : [getClassifiedImage(ad)])
                    .slice(0, 3)
                    .map((image, index) => `
                        <img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackImage)}" alt="${escapeHtml(ad.title)}${imageUrls.length > 1 ? ` - ${index + 1}` : ''}" class="w-full ${index === 0 ? 'max-h-[28rem]' : 'h-36'} object-cover rounded-xl" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback">
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
                            <div class="grid grid-cols-1 ${imageUrls.length > 1 ? 'sm:grid-cols-2' : ''} gap-3 mb-8" data-fallback="${escapeHtml(fallbackImage)}" onerror="this.onerror=null;this.src=this.dataset.fallback">${galleryImages}</div>
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
                        </article>
                    </div>
                `;
                document.title = `${ad.title} | @sere en Luanda`;
                return;
            }

            container.innerHTML = `
                <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 class="font-serif text-3xl font-bold text-brand-navy">${escapeHtml(labels.detail_not_found)}</h1>
                    <a href="index.html" class="inline-block mt-6 text-brand-terracotta font-bold hover:text-brand-navy">${escapeHtml(labels.detail_home)}</a>
                </div>
            `;
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
                    : 'Verifique o tamanho dos campos e tente novamente.', true);
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
                    : 'Pode escolher no máximo 10 imagens por anúncio.', true);
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
                    date: new Date(result.created_at).toLocaleDateString(currentLang === 'es' ? 'es' : 'pt'),
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
            setLanguage(currentLang);
            renderClassifieds();
            renderHomeFeaturedAds();
            loadSharedClassifieds();
            const requestedCategory = new URLSearchParams(window.location.search).get('category');
            if (requestedCategory) selectCategory(requestedCategory);
            const requestedParams = new URLSearchParams(window.location.search);
            const requestedCultureTab = requestedParams.get('tab');
            const requestedArtCategory = requestedParams.get('arte');
            if (['historia', 'tradiciones', 'arte'].includes(requestedCultureTab)) selectCultureTab(requestedCultureTab);
            if (requestedArtCategory) filterArtCategory(requestedArtCategory);
        };