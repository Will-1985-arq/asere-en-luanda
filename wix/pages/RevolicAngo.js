import { listClassifieds, submitClassified } from 'backend/classifieds.web';

const PAGE_SIZE = 24;
let nextOffset = 0;
let hasMore = false;
let loading = false;
let searchTimer;

$w.onReady(() => {
    $w('#classifiedCategoryFilter').options = [
        { label: 'Todas las categorías', value: '' },
        ...[
            'Vehículos',
            'Inmobiliaria',
            'Tecnología',
            'Empleos',
            'Ropa y Accesorios',
            'Servicios',
            'Electrodomésticos',
            'Hogar',
            'General'
        ].map(category => ({ label: category, value: category }))
    ];

    $w('#classifiedsRepeater').onItemReady(($item, itemData) => {
        $item('#adTitleText').text = itemData.title;
        $item('#adCategoryText').text = itemData.category;
        $item('#adPriceText').text = itemData.price || 'Consultar';
        $item('#adLocationText').text = itemData.location;
        $item('#adDescriptionText').text = itemData.description;
        if (itemData.imageUrl) $item('#adImage').src = itemData.imageUrl;
        else $item('#adImage').hide();

        const digits = itemData.contact.replace(/\D/g, '');
        $item('#adWhatsAppButton').link = `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, vi tu anuncio: ${itemData.title}`)}`;
    });

    $w('#classifiedCategoryFilter').onChange(() => loadClassifieds(true));
    $w('#classifiedSearchInput').onInput(() => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadClassifieds(true), 300);
    });
    $w('#loadMoreButton').onClick(() => loadClassifieds(false));
    $w('#submitClassifiedButton').onClick(submitNewClassified);
    loadClassifieds(true);
});

async function loadClassifieds(reset) {
    if (loading) return;
    loading = true;
    if (reset) {
        nextOffset = 0;
        $w('#classifiedsRepeater').data = [];
    }

    $w('#classifiedsMessage').text = 'Cargando anuncios...';
    $w('#classifiedsMessage').show();
    $w('#loadMoreButton').disable();

    try {
        const result = await listClassifieds({
            category: $w('#classifiedCategoryFilter').value,
            search: $w('#classifiedSearchInput').value,
            offset: nextOffset
        });
        const currentItems = reset ? [] : $w('#classifiedsRepeater').data;
        const newItems = result.items.map(item => ({ ...item, _id: item.id }));
        $w('#classifiedsRepeater').data = [...currentItems, ...newItems];
        nextOffset = result.nextOffset;
        hasMore = result.hasMore;

        if ($w('#classifiedsRepeater').data.length) $w('#classifiedsMessage').hide();
        else {
            $w('#classifiedsMessage').text = 'No hay anuncios que coincidan con la búsqueda.';
            $w('#classifiedsMessage').show();
        }

        if (hasMore) $w('#loadMoreButton').enable();
        else $w('#loadMoreButton').disable();
    } catch (error) {
        $w('#classifiedsMessage').text = 'No se pudieron cargar los anuncios. Inténtalo de nuevo.';
        $w('#classifiedsMessage').show();
        $w('#loadMoreButton').disable();
    } finally {
        loading = false;
    }
}

async function submitNewClassified() {
    if (loading) return;
    loading = true;
    $w('#submitClassifiedButton').disable();
    $w('#submissionMessage').text = 'Enviando anuncio...';
    $w('#submissionMessage').show();

    try {
        await submitClassified({
            title: $w('#adTitleInput').value,
            category: $w('#adCategoryInput').value,
            price: $w('#adPriceInput').value,
            contact: $w('#adContactInput').value,
            location: $w('#adLocationInput').value,
            imageUrl: $w('#adImageInput').value,
            description: $w('#adDescriptionInput').value
        });
        $w('#submissionMessage').text = 'Anuncio recibido. Aparecerá después de su revisión.';
        $w('#adTitleInput').value = '';
        $w('#adPriceInput').value = '';
        $w('#adContactInput').value = '';
        $w('#adLocationInput').value = '';
        $w('#adImageInput').value = '';
        $w('#adDescriptionInput').value = '';
    } catch (error) {
        $w('#submissionMessage').text = error.message || 'No se pudo enviar el anuncio. Revisa los datos e inténtalo de nuevo.';
    } finally {
        loading = false;
        $w('#submitClassifiedButton').enable();
    }
}