import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const outputDirectory = join(projectRoot, 'dist');

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const filesToPublish = [
    'index.html',
    'quienes-somos.html',
    'eventos.html',
    'cultura.html',
    'revolicango.html',
    'contactos.html',
    'detalle.html',
    // Keep noticias.html unpublished until MINTTICS and ERCA authorize it.
    'tailwind.generated.css',
    'styles.css',
    'script.js',
    'image-compression.js',
    'robots.txt',
    'sitemap.xml',
];

for (const file of filesToPublish) {
    copyFileSync(join(projectRoot, file), join(outputDirectory, file));
}

console.log(`Wix-ready static site created at ${outputDirectory}`);