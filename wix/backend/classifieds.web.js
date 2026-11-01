import wixData from 'wix-data';
import { Permissions, webMethod } from 'wix-web-module';

const COLLECTION_ID = 'RevolicAngoAds';
const PAGE_SIZE = 24;
const CATEGORIES = new Set([
    'Vehículos',
    'Inmobiliaria',
    'Tecnología',
    'Empleos',
    'Ropa y Accesorios',
    'Servicios',
    'Electrodomésticos',
    'Hogar',
    'General'
]);

function cleanText(value, maxLength, required = false) {
    if (typeof value !== 'string') return '';
    const cleaned = value.trim().slice(0, maxLength);
    if (required && !cleaned) throw new Error('Falta un campo obligatorio.');
    return cleaned;
}

function normalizeOffset(value) {
    const offset = Number(value);
    if (!Number.isInteger(offset) || offset < 0 || offset > 100000) {
        throw new Error('La página solicitada no es válida.');
    }
    return offset;
}

export const listClassifieds = webMethod(Permissions.Anyone, async (filters = {}) => {
    const category = cleanText(filters?.category, 40);
    const search = cleanText(filters?.search, 80);
    const offset = normalizeOffset(filters?.offset ?? 0);

    if (category && !CATEGORIES.has(category)) {
        throw new Error('La categoría solicitada no es válida.');
    }

    let query;
    if (search) {
        query = wixData.query(COLLECTION_ID)
            .eq('status', 'approved')
            .contains('title', search)
            .or(wixData.query(COLLECTION_ID).eq('status', 'approved').contains('description', search))
            .or(wixData.query(COLLECTION_ID).eq('status', 'approved').contains('location', search));
    } else {
        query = wixData.query(COLLECTION_ID).eq('status', 'approved');
    }

    if (category) query = query.eq('category', category);

    const result = await query
        .descending('_createdDate')
        .skip(offset)
        .limit(PAGE_SIZE)
        .find({ suppressAuth: true });

    const items = result.items.map(item => ({
        id: item._id,
        title: item.title,
        category: item.category,
        price: item.price,
        contact: item.contact,
        location: item.location,
        imageUrl: item.imageUrl,
        description: item.description,
        date: item._createdDate instanceof Date ? item._createdDate.toISOString() : ''
    }));

    return {
        items,
        nextOffset: offset + items.length,
        hasMore: items.length === PAGE_SIZE
    };
});

export const submitClassified = webMethod(Permissions.Anyone, async (input = {}) => {
    const title = cleanText(input?.title, 100, true);
    const category = cleanText(input?.category, 40, true);
    const price = cleanText(input?.price, 80);
    const contact = cleanText(input?.contact, 30, true);
    const location = cleanText(input?.location, 100, true);
    const description = cleanText(input?.description, 2000, true);
    const imageUrl = cleanText(input?.imageUrl, 500);

    if (!CATEGORIES.has(category)) throw new Error('Selecciona una categoría válida.');
    if (!/^[+\d][\d\s().-]{6,29}$/.test(contact)) throw new Error('El teléfono no es válido.');
    if (imageUrl) {
        let parsedImageUrl;
        try {
            parsedImageUrl = new URL(imageUrl);
        } catch {
            throw new Error('La dirección de la imagen no es válida.');
        }
        if (parsedImageUrl.protocol !== 'https:') throw new Error('La imagen debe usar HTTPS.');
    }

    const item = await wixData.insert(COLLECTION_ID, {
        title,
        category,
        price,
        contact,
        location,
        imageUrl,
        description,
        status: 'pending'
    }, { suppressAuth: true });

    return { id: item._id, status: 'pending' };
});