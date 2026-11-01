# Activar RevolicAngo con Wix CMS y Velo

Estos archivos son código Velo para incorporar en un sitio Wix. No se ejecutan en la exportación estática de `dist/` y no se publican desde este repositorio.

## 1. Crear la colección

En Wix CMS, crea una colección con el ID exacto `RevolicAngoAds`. Define estos campos:

| ID | Tipo | Uso |
| --- | --- | --- |
| `title` | Texto | Título del anuncio |
| `category` | Texto | Una de las categorías de RevolicAngo |
| `price` | Texto | Precio o condición |
| `contact` | Texto | Teléfono de WhatsApp, visible después de aprobar |
| `location` | Texto | Municipio o zona |
| `imageUrl` | URL | Imagen HTTPS opcional |
| `description` | Texto | Descripción del anuncio |
| `status` | Texto | `pending` o `approved` |

Configura los permisos de la colección para que solo administradores puedan leerla y modificarla directamente. El backend usa `suppressAuth` y solo publica elementos con `status: approved`.

## 2. Añadir el backend

Activa el modo desarrollador de Wix y copia `wix/backend/classifieds.web.js` en `backend/classifieds.web.js` dentro del proyecto Wix. `submitClassified` valida los datos y crea anuncios pendientes; `listClassifieds` solo devuelve anuncios aprobados.

Revisa la bandeja de elementos `pending` en el CMS y cambia el estado a `approved` para publicar un anuncio. Así se evita mostrar contenido de usuarios sin revisión.

## 3. Crear la página nativa

Crea la página de Wix `RevolicAngo`, agrega los controles siguientes y asígnales exactamente estos IDs. Copia `wix/pages/RevolicAngo.js` en el código de esa página.

- Filtro desplegable: `classifiedCategoryFilter`
- Campo de búsqueda: `classifiedSearchInput`
- Repeater: `classifiedsRepeater`
- Dentro del repeater: `adTitleText`, `adCategoryText`, `adPriceText`, `adLocationText`, `adDescriptionText`, `adImage`, `adWhatsAppButton`
- Botón para cargar más: `loadMoreButton`
- Texto de estado de anuncios: `classifiedsMessage`
- Campos del formulario: `adTitleInput`, `adCategoryInput`, `adPriceInput`, `adContactInput`, `adLocationInput`, `adImageInput`, `adDescriptionInput`
- Botón de envío: `submitClassifiedButton`
- Texto de resultado del envío: `submissionMessage`

`adCategoryInput` debe ofrecer las mismas categorías que el filtro. Antes de publicar, añade CAPTCHA o una medida antispam equivalente y confirma que los usuarios aceptan mostrar públicamente el teléfono de contacto al aprobarse el anuncio.

## 4. Cambiar la navegación antes de publicar

El sitio HTML actual y `dist/revolicango.html` aún apuntan al tablón local del navegador. En Wix, coloca la página nativa en la navegación y sustituye los enlaces/botones de RevolicAngo del sitio incrustado para que abran la nueva página nativa. No anuncies la versión estática como tablón compartido.

Publica primero en una URL de prueba y verifica: envío pendiente, rechazo por campos inválidos, aprobación en CMS, búsqueda, categorías, paginación y contacto por WhatsApp. La activación final y la verificación real solo se pueden hacer desde el editor del sitio Wix.