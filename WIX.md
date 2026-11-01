# Publicar @sere en Luanda en Wix

Wix incrusta el sitio como una página externa; no importa directamente esta carpeta como páginas nativas de Wix.

1. La carpeta `dist/` ya está generada. Publica su contenido en un hosting estático con HTTPS, por ejemplo Netlify o GitHub Pages.
2. En Wix, añade un elemento **Incrustar un sitio** y pega la URL pública que termina en `/index.html`.
3. Configura el elemento para ocupar todo el ancho y dale altura suficiente. En móvil, revisa y ajusta también la altura del iframe dentro del editor de Wix.

Para regenerar `dist/` después de editar el sitio, ejecuta `npm run build:wix`. El proceso compila los estilos de Tailwind y comprime el módulo de imágenes antes de copiar los archivos publicables. GitHub Pages compila y publica esa carpeta automáticamente con el flujo de trabajo de GitHub Actions.

GitHub Pages usa Supabase para publicar y mostrar los clasificados compartidos; consulta [SUPABASE-SETUP.md](SUPABASE-SETUP.md). Si se integra el sitio con Wix CMS/Velo, la configuración de datos alternativa está en [wix/VELO-SETUP.md](wix/VELO-SETUP.md) y es independiente de Supabase.

La navegación entre Inicio, Eventos, Cultura, RevolicAngo y los detalles permanece dentro del iframe. La página de Noticias está temporalmente desactivada y no debe publicarse hasta obtener autorización de MINTTICS y ERCA. Los estilos de Tailwind se generan durante la compilación; las fuentes, iconos y fotografías siguen usando servicios externos.