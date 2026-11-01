begin;

update public.site_content
   set title_pt = case when title_pt = 'Grande Gala Rueda de Casino & Kizomba'
       then 'Grande gala de Rueda de Casino e Kizomba' else title_pt end,
       description_pt = case when description_pt = 'Intercâmbio de ritmos caribenhos e angolanos. Workshops de dança para iniciantes e avançados.'
       then 'Encontro de ritmos caribenhos e angolanos. Aulas de dança para principiantes e avançados.' else description_pt end,
       category_pt = case when category_pt = 'Música & Dança'
       then 'Música e dança' else category_pt end
 where id = 'event-1';

update public.site_content
   set title_pt = case when title_pt = 'Workshop de Tempero Crioulo: Assados e Molhos'
       then 'Oficina de temperos crioulos: assados e molhos' else title_pt end,
       description_pt = case when description_pt = 'Aprenda os segredos do tempero tradicional cubano combinados com produtos locais angolanos.'
       then 'Aprenda os segredos da marinada tradicional cubana, combinada com produtos locais angolanos.' else description_pt end
 where id = 'event-2';

update public.site_content
   set title_pt = case when title_pt = 'Torneio Amigável de Dominó & Jogos de Tradição'
       then 'Torneio amigável de dominó e jogos tradicionais' else title_pt end,
       description_pt = case when description_pt = 'Tarde de dominó em duplas, refeição em família e ambiente fraterno para todas as idades.'
       then 'Tarde de dominó em duplas, refeição em família e convívio para todas as idades.' else description_pt end,
       category_pt = case when category_pt = 'Desporto & Família'
       then 'Desporto e família' else category_pt end
 where id = 'event-3';

update public.site_content
   set description_pt = case when description_pt =
       'A relação entre Cuba e Angola é um laço único forjado na solidariedade, respeito mútuo e raízes africanas que viajaram pelo Atlântico para regressar décadas depois em cooperação médica, educativa e cultural.'
       || E'\n\n' ||
       'Desde a década de 1970, milhares de profissionais, colaboradores, educadores e médicos construíram pontes humanas de amizade sincera. Hoje em Luanda, esta memória histórica permanece viva através da comunidade cubana perfeitamente integrada.'
       then 'A relação entre Cuba e Angola é um laço singular, forjado na solidariedade, no respeito mútuo e nas raízes africanas que atravessaram o Atlântico e regressaram, décadas depois, através de projetos de cooperação médica, educativa e cultural.'
       || E'\n\n' ||
       'Desde a década de 1970, milhares de profissionais, cooperantes, educadores e médicos construíram pontes de amizade. Hoje, em Luanda, esta memória histórica mantém-se viva numa comunidade cubana próspera e plenamente integrada na sociedade angolana.'
       else description_pt end,
       milestones_pt = case when milestones_pt = '[{"title":"Raízes Ancestrais Bantus","body":"A marcante presença da cultura bantu de Angola na música, religião e folclore do Caribe cubano."},{"title":"Cooperação Médica e Educativa","body":"Formação de gerações de profissionais angolanos e colaboração contínua em hospitais e institutos."},{"title":"Integração Familiar e Social","body":"Lares mistos cubano-angolanos que enriquecem o quotidiano de Luanda com tradições partilhadas."}]'::jsonb
       then '[{"title":"Raízes ancestrais bantu","body":"A forte presença da cultura bantu de Angola na música, na religião e no folclore das Caraíbas cubanas."},{"title":"Cooperação médica e educativa","body":"Formação de várias gerações de profissionais angolanos e cooperação contínua em hospitais e institutos."},{"title":"Integração familiar e social","body":"Famílias cubano-angolanas que enriquecem o quotidiano de Luanda com tradições partilhadas."}]'::jsonb
       else milestones_pt end
 where id = 'historia';

update public.site_content
   set title_pt = case when title_pt = 'Temperos Crioulos & Muamba'
       then 'Temperos crioulos e muamba' else title_pt end
 where id = 'trad-gastro';

update public.site_content
   set title_pt = case when title_pt = 'O Dominó e as Kizombadas'
       then 'O dominó e as kizombadas' else title_pt end,
       description_pt = case when description_pt = 'Tardes de dominó em duplas nos quintais de Luanda, acompanhadas de boa música, conversas animadas e ambiente festivo entre amigos.'
       then 'Tardes de dominó em duplas nos quintais de Luanda, acompanhadas por boa música, conversas animadas e um ambiente festivo entre amigos.' else description_pt end
 where id = 'trad-domino';

update public.site_content
   set title_pt = case when title_pt = 'Carnaval de Luanda & Comparsas'
       then 'Carnaval de Luanda e grupos carnavalescos' else title_pt end,
       description_pt = case when description_pt = 'O ritmo percussivo dos tambores, a dança alegre e o colorido dos trajes conectam o Carnaval de Luanda às tradicionais congas caribenhas.'
       then 'O ritmo dos tambores, a dança e a cor dos trajes aproximam o Carnaval de Luanda das tradicionais parrandas e congas das Caraíbas.' else description_pt end
 where id = 'trad-carnaval';

update public.site_content
   set description_pt = case when description_pt = 'Amigo próximo, compadre, irmão de vida.'
       then 'Amigo chegado, compadre, irmão de coração.' else description_pt end
 where id = 'glossary-1';

update public.site_content
   set description_pt = case when description_pt = 'Saudação quotidiana para perguntar o que há de novo ou como vai tudo.'
       then 'Saudação do dia a dia para perguntar o que há de novo ou como está tudo.' else description_pt end
 where id = 'glossary-2';

update public.site_content
   set description_pt = case when description_pt = 'Expressão usada quando algo está excelente, divertido ou animado.'
       then 'Expressão usada quando algo é excelente, divertido ou animado.' else description_pt end
 where id = 'glossary-3';

update public.site_content
   set description_pt = case when description_pt = 'Reunião festiva com boa comida, música alegre e dança entre amigos.'
       then 'Convívio festivo com boa comida, música e dança entre amigos.' else description_pt end
 where id = 'glossary-4';

update public.site_content
   set description_pt = case when description_pt = 'Transporte coletivo urbano caraterístico do quotidiano.'
       then 'Transporte coletivo urbano típico do quotidiano.' else description_pt end
 where id = 'glossary-5';

update public.site_content
   set description_pt = case when description_pt = 'Habilidade para resolver imprevistos de forma engenhosa e rápida.'
       then 'Capacidade de resolver imprevistos de forma engenhosa e rápida.' else description_pt end
 where id = 'glossary-6';

update public.site_content
   set title_pt = case when title_pt = 'Poesia e Narrativa Afro-Caribenha'
       then 'Poesia e narrativa afro-caribenha' else title_pt end,
       description_pt = case when description_pt = 'O encontro de versos de Nicolás Guillén e Agostinho Neto. Apresentações de livros, workshops literários e leituras de poesia bilingue em Luanda.'
       then 'O encontro dos versos de Nicolás Guillén e Agostinho Neto. Apresentações de livros, oficinas literárias e leituras de poesia bilingue em Luanda.' else description_pt end
 where id = 'art-literature';

update public.site_content
   set title_pt = case when title_pt = 'Fusão de Son, Timba, Semba e Kizomba'
       then 'Fusão de son, timba, semba e kizomba' else title_pt end,
       description_pt = case when description_pt = 'A clave cubana e a cadência angolana conectam orquestras e grupos locais que animam as noites culturais de Miramar e Talatona.'
       then 'A clave cubana e a cadência angolana unem orquestras e grupos locais que animam as noites culturais de Miramar e Talatona.' else description_pt end
 where id = 'art-music';

update public.site_content
   set title_pt = case when title_pt = 'Mostras de Documentários e Debate'
       then 'Mostras de documentários e sessões de debate' else title_pt end,
       description_pt = case when description_pt = 'Exibição de longas-metragens históricas, documentários sobre intercâmbio cultural e curtas-metragens contemporâneas de jovens criadores.'
       then 'Exibição de longas-metragens históricas, documentários sobre o intercâmbio cultural e curtas-metragens contemporâneas de jovens criadores.' else description_pt end
 where id = 'art-cinema';

update public.site_content
   set title_pt = case when title_pt = 'Pintura, Escultura e Muralismo Urbano'
       then 'Pintura, escultura e muralismo urbano' else title_pt end,
       description_pt = case when description_pt = 'Exposições plásticas de artistas caribenhos e africanos. Telas coloridas, esculturas em madeira e murais que embelezam as ruas de Luanda.'
       then 'Exposições de artes plásticas de artistas caribenhos e africanos. Pinturas coloridas, esculturas em madeira e murais que embelezam as ruas de Luanda.' else description_pt end,
       category_pt = case when category_pt = 'Artes Visuais e Plásticas'
       then 'Artes visuais e plásticas' else category_pt end
 where id = 'art-visual';

update public.site_content
   set title_pt = case when title_pt = 'Rueda de Casino e Danças Tradicionais'
       then 'Rueda de Casino e danças tradicionais' else title_pt end,
       description_pt = case when description_pt = 'Academias e encontros populares onde Salsa, Casino, Kizomba, Kuduro e Dança Afro se combinam em espetáculos dinâmicos.'
       then 'Academias e encontros populares onde a salsa, o casino, a kizomba, o kuduro e a dança afro se combinam em espetáculos dinâmicos.' else description_pt end
 where id = 'art-dance';

update public.site_content
   set title_pt = case when title_pt = 'Teatro Comunitário e Performance'
       then 'Teatro comunitário e expressão performativa' else title_pt end,
       description_pt = case when description_pt = 'Obras dramatúrgicas sobre histórias de migração, superação e fraternidade. Grupos teatrais comunitários em centros culturais da cidade.'
       then 'Peças sobre migração, superação e amizade. Grupos de teatro comunitário apresentam-se em centros culturais da cidade.' else description_pt end
 where id = 'art-theatre';

commit;
