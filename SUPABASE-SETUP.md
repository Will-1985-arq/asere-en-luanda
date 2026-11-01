# Anuncios compartidos con Supabase

La versión de GitHub Pages usa la tabla `public.classifieds` de Supabase. La URL del proyecto y la clave Publishable se configuran al inicio de `script.js`; esa clave está pensada para el navegador y solo es segura mientras se mantengan activas las políticas RLS de la tabla. Nunca pongas una clave Secret o `service_role` en el sitio.

La página de noticias permanece fuera del build y del sitemap hasta contar con la autorización de MINTTICS y ERCA. No publiques artículos ni enlaces a noticias antes de obtenerla.

## Editar eventos, cultura y el destacado de Inicio

Para activar el contenido dinámico, abre **SQL Editor** en el proyecto Supabase y ejecuta primero `supabase/site-content.sql`. Después, vuelve a ejecutar `supabase/public-opinions.sql` para que las opiniones también acepten los identificadores de las nuevas publicaciones. Ambas consultas se pueden ejecutar de nuevo sin sobrescribir las filas de contenido que ya hayas editado.

Luego abre **Table Editor → site_content**. La web solo lee las filas con `is_published = true`; las políticas RLS no permiten que los visitantes creen o modifiquen contenido. Edita o crea filas desde tu sesión autenticada de Supabase:

- Para eventos, usa `content_type = event`, `section = event`, completa títulos y descripciones en español y portugués, fecha, hora y ubicación en ambos idiomas. `is_listed` controla si aparece en la agenda; `is_published` controla si el contenido puede verse y recibir opiniones. `is_featured` muestra un único evento destacado en Inicio. Si cambias el destacado, quita primero la marca del anterior.
- Para Cultura, usa `content_type = culture` y una sección `history`, `tradition`, `glossary` o `art`. Completa los campos `title_es`, `title_pt`, `description_es` y `description_pt`. En la sección `art`, añade también `art_category` (un identificador corto en minúsculas, como `musica`) y sus nombres visibles en `category_es` y `category_pt`. La historia admite hitos bilingües en `milestones_es` y `milestones_pt` como listas JSON de objetos `{"title":"…","body":"…"}`.
- `sort_order` controla el orden dentro de cada sección. Para ocultar una publicación sin borrarla, cambia `is_published` a `false`.
- `image_url` es opcional; debe ser una URL pública que empiece por `https://` o `http://`. Puedes dejarla vacía si no quieres imagen.
- Cada publicación nueva necesita un `id` único, corto, en minúsculas y con guiones, por ejemplo `evento-feria-2027`. No cambies el ID de una publicación que ya tenga opiniones asociadas.

Los textos y las imágenes que ves hoy se cargan inicialmente con la migración. La web vuelve a consultar Supabase al abrir o recargar la página. Si Supabase no está configurado o no responde, conserva el contenido estático de respaldo y muestra un aviso en español o portugués.

## Flujo de anuncios

- Solo los clasificados se publican automáticamente. Noticias, eventos y demás contenido del sitio no se envían a esta tabla ni cambian de comportamiento.
- El formulario de clasificados solicita consentimiento para mostrar públicamente el teléfono y el anuncio, y los inserta con estado `approved`.
- La tabla solo permite que la web lea filas `approved`.
- Se muestran hasta 200 anuncios aprobados, ordenados del más nuevo al más antiguo.
- Se pueden subir hasta 10 imágenes por anuncio desde el dispositivo al bucket público `classified-images`; se aceptan JPG, PNG y WebP originales hasta 20 MB cada una. El navegador las comprime antes de subirlas y no permite enviar un archivo comprimido que supere 100 KB (102.400 bytes). Supabase aplica el mismo límite en el bucket. Los anuncios e imágenes existentes no se modifican.
- El autor de un anuncio nuevo puede hacer una sola corrección durante los primeros 5 minutos desde el mismo navegador y dispositivo. El código de edición se guarda localmente y en Supabase solo se almacena su hash.

## Portal de opiniones y puntuación de clasificados

Ejecuta `supabase/public-opinions.sql` en el SQL Editor del proyecto Supabase antes de publicar la nueva versión del sitio. Si ya activaste las opiniones, vuelve a ejecutar el archivo después de `supabase/site-content.sql` para actualizar la validación de eventos y cultura. La migración crea las funciones para enviar y consultar opiniones, activa RLS y permite al público leer únicamente opiniones aprobadas. No necesita claves secretas en el navegador.

En las páginas de detalle de cultura y eventos se pueden enviar comentarios con alias opcional. En el detalle de cada clasificado, el visitante también puede puntuar de 1 a 5 estrellas (1 = peor, 5 = mejor). El resumen muestra promedio, cantidad de votos y distribución por estrellas; solo incluye puntuaciones aprobadas. En RevolicAngo se muestra además un ranking de los 10 clasificados mejor valorados, ordenados por promedio y luego por número de votos. Se permite un voto por clasificado y navegador/dispositivo; la base de datos guarda un hash del identificador local, no ese identificador. Los comentarios de cultura y eventos pueden enviarse varias veces, pero siempre requieren aprobación. Como no hay inicio de sesión, borrar el almacenamiento del navegador o usar otro dispositivo puede permitir votar de nuevo.

Las opiniones nuevas quedan como `pending` y no se muestran al público. Para moderarlas, abre **Table Editor → public_opinions**, revisa las filas `pending` y cambia `status` a `approved` o `rejected`. Alternativamente, en el SQL Editor puedes revisar pendientes con:

```sql
select id, target_type, target_id, alias, comment, rating, created_at
from public.public_opinions
where status = 'pending'
order by created_at asc;
```

Aprueba una opinión actualizando por su `id`:

```sql
update public.public_opinions
set status = 'approved'
where id = 'UUID_DE_LA_OPINION'
  and status = 'pending';
```

Los identificadores válidos de cultura y eventos son las filas publicadas en `site_content`; el identificador histórico `home-event` sigue admitido para conservar la opinión del destacado de Inicio. La página puede mostrar hasta las 50 opiniones aprobadas más recientes por publicación; las estadísticas consideran todos sus votos aprobados.

## Eliminar anuncios e imágenes después de 60 días

La limpieza usa una Supabase Edge Function con privilegios de servidor, porque borrar una fila de `storage.objects` directamente no elimina de forma segura el archivo del Storage. La tarea se ejecuta cada hora, al minuto 15 (UTC). Un anuncio se considera vencido cuando `created_at` tiene más de 60 días; se eliminan primero sus imágenes del bucket `classified-images` y, si esa operación tiene éxito, se elimina la fila de `public.classifieds`. Los anuncios sin imágenes también se eliminan. Se borran de la base de datos y del Storage activos; las copias de seguridad de Supabase pueden conservar datos según la retención del proyecto.

1. Despliega `supabase/functions/classified-cleanup/index.ts` como la función `classified-cleanup`, con la verificación JWT del gateway desactivada. Con Supabase CLI: `supabase functions deploy classified-cleanup --no-verify-jwt`.
2. Genera un secreto aleatorio largo en tu ordenador (por ejemplo, con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). Configúralo en los secretos de Edge Functions con el nombre `CLASSIFIED_CLEANUP_SECRET`, y crea en **Vault → Secrets** un secreto llamado `classified_cleanup_secret` con exactamente el mismo valor. No publiques ni compartas ese valor.
3. En **Vault → Secrets**, crea `classified_cleanup_url` con el valor `https://TU_PROJECT_REF.supabase.co` (la URL de tu proyecto Supabase, sin `/` al final). Crea también `classified_cleanup_apikey` con la clave Publishable (o anon) del mismo proyecto; no uses la clave `service_role` para este encabezado.
4. Ejecuta `supabase/classified-cleanup-schedule.sql` en el SQL Editor del mismo proyecto. Crea una tarea horaria llamada `classified-cleanup-hourly`; si la ejecutas de nuevo, reemplaza esa tarea.
5. Comprueba los registros de la función después de su primera ejecución. La respuesta incluye el número de anuncios revisados, eliminados y los que fallaron. Si falla la eliminación de una imagen, se conserva el anuncio para reintentar en la siguiente ejecución.

La función procesa hasta 1.000 anuncios vencidos por ejecución; si hay más, continuará en las siguientes ejecuciones horarias. Las imágenes ya no referenciadas por ningún anuncio (por ejemplo, cargas abandonadas antes de publicar) no se detectan ni se borran con esta tarea.

## Publicación automática

Los visitantes publican clasificados sin aprobación previa. Los anuncios y teléfonos son visibles públicamente. Como el formulario es público, también pueden aparecer anuncios engañosos o spam; añade protección antispam y un canal para reportar anuncios antes de difundirlo ampliamente. Para que la publicación y la edición única funcionen juntas, usa la migración siguiente; no vuelvas a conceder inserciones directas a `anon`.

## Activar la edición única durante 5 minutos

Ejecuta el contenido de [`supabase/classified-editing.sql`](./supabase/classified-editing.sql) en una consulta nueva del SQL Editor. Esta migración crea las funciones seguras de publicación y edición, revoca la inserción directa en la tabla y permite una sola edición con un código aleatorio privado. La misma consulta puede ejecutarse de nuevo de forma segura.

Para habilitar hasta 10 fotos, ejecuta después el contenido de [`supabase/classified-multiple-images.sql`](./supabase/classified-multiple-images.sql) en otra consulta del SQL Editor. Esta migración añade la lista de imágenes, conserva las fotos existentes y actualiza las funciones de publicación/edición. Debe ejecutarse antes de publicar en GitHub la nueva versión de `script.js`.

Después de publicar un anuncio, el autor debe abrir su ficha y pulsar **Editar anuncio**. El sitio vuelve al tablón y abre el formulario con los datos para corregirlos. La persona debe usar el mismo navegador y dispositivo donde publicó. Borrar los datos del navegador o esperar más de cinco minutos elimina la posibilidad de editarlo. Los anuncios antiguos, publicados antes de activar esta migración, no tienen código de edición.

## Activar la carga de imágenes

En **SQL Editor**, ejecuta esta consulta para crear/configurar el bucket público y permitir cargas. Supabase aplica un límite de 100 KB (102.400 bytes) por archivo; también se comprueba en el navegador después de comprimir:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'classified-images',
  'classified-images',
  true,
  102400,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

grant select, insert on storage.objects to anon, authenticated;

drop policy if exists "Public can read classified images" on storage.objects;
create policy "Public can read classified images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'classified-images');

drop policy if exists "Public can upload classified images" on storage.objects;
create policy "Public can upload classified images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'classified-images');
```

Si el bucket `classified-images` ya existe, ejecuta [`supabase/classified-image-limit.sql`](./supabase/classified-image-limit.sql) para aplicar el nuevo límite de 100 KB. Las imágenes ya guardadas no se comprimen ni se borran.
Aplica este límite en Supabase antes de publicar el nuevo código; así el servidor rechazará cualquier carga que supere los 100 KB, incluso si se evita la validación del navegador.

El bucket es público para que las imágenes de los anuncios se puedan ver sin iniciar sesión. Cualquier visitante puede subir imágenes a este bucket; no puede reemplazar ni borrar imágenes ajenas mediante las políticas anteriores. Las cargas que completen pero no consigan guardar el anuncio pueden dejar archivos sin uso en el bucket. El máximo de 10 fotos se valida en el formulario y en la función de base de datos que guarda el anuncio.

## Publicar los cambios

GitHub Pages publica los archivos de la raíz del repositorio. Después de actualizar el proyecto, sube/reemplaza en la rama `main` estos archivos de la raíz:

- `script.js`
- `image-compression.js`
- `index.html`
- `quienes-somos.html`
- `eventos.html`
- `cultura.html`
- `revolicango.html`
- `contactos.html`

Ejecuta `npm install` y después `npm run build:compression` para generar `image-compression.js` en la raíz. Publica también ese archivo junto con `script.js` y las páginas HTML que lo cargan. `npm run build:wix` regenera primero el compresor y luego la carpeta `dist/`; GitHub Pages de este repositorio usa la raíz.

No uses la clave `service_role` en el sitio: la conexión del navegador debe usar exclusivamente la clave Publishable y las políticas RLS.
