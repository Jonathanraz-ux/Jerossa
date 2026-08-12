import { supabase } from '../lib/supabase';

const PRODUCT_SELECT = '*, producers(name)';

const formatPrice = (value, unit) => {
  const num = Number(value);
  const formatted = Number.isInteger(num)
    ? String(num)
    : num.toFixed(2).replace('.', ',');
  return `${formatted} € / ${unit}`;
};

const mapProduct = (row) => ({
  id: row.product_code,
  slug: row.slug,
  title: row.title,
  seller: row.producers?.name || '',
  sellerId: row.seller_id,
  market: row.market,
  price: formatPrice(row.price_eur, row.unit),
  priceEUR: Number(row.price_eur),
  unit: row.unit,
  origin: row.origin,
  availability: row.availability,
  verified: row.verified,
  reviews: row.reviews,
  type: row.type,
  tag: row.tag,
  description: row.description,
  stock: row.stock,
  delivery: row.delivery,
  variants: row.variants || [],
  images: row.images || [],
  rating: Number(row.rating),
});

const mapCategory = (row) => ({
  id: row.category_code,
  slug: row.slug,
  name: row.name,
  short: row.short,
  description: row.description,
  image: row.image_url,
  productCount: row.product_count,
});

const mapProducer = (row) => ({
  id: row.seller_code,
  slug: row.slug,
  name: row.name,
  location: row.location,
  description: row.description,
  image: row.image_url,
  rating: Number(row.rating),
  reviews: row.reviews_count,
  established: row.established,
  certifications: row.certifications || [],
  responseRate: row.response_rate,
  responseTime: row.response_time,
});

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[catalog] fetchProducts', error);
    return [];
  }
  return data.map(mapProduct);
};

export const fetchProductByIdentifier = async (identifier) => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .or(`product_code.eq.${identifier},slug.eq.${identifier}`)
    .maybeSingle();
  if (error) {
    console.error('[catalog] fetchProductByIdentifier', error);
    return null;
  }
  return data ? mapProduct(data) : null;
};

export const fetchRelatedProducts = async (product, limit = 4) => {
  if (!product?.type) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .eq('type', product.type)
    .neq('product_code', product.id)
    .limit(limit);
  if (error) {
    console.error('[catalog] fetchRelatedProducts', error);
    return [];
  }
  return data.map(mapProduct);
};

const resolveCategoryId = async (identifier) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .or(`category_code.eq.${identifier},slug.eq.${identifier}`)
    .maybeSingle();
  if (error) {
    console.error('[catalog] resolveCategoryId', error);
    return null;
  }
  return data?.id || null;
};

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('category_code', { ascending: true });
  if (error) {
    console.error('[catalog] fetchCategories', error);
    return [];
  }
  return data.map(mapCategory);
};

export const fetchCategoryByIdentifier = async (identifier) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`category_code.eq.${identifier},slug.eq.${identifier}`)
    .maybeSingle();
  if (error) {
    console.error('[catalog] fetchCategoryByIdentifier', error);
    return null;
  }
  return data ? mapCategory(data) : null;
};

export const fetchProductsByCategory = async (identifier) => {
  const categoryId = await resolveCategoryId(identifier);
  if (!categoryId) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[catalog] fetchProductsByCategory', error);
    return [];
  }
  return data.map(mapProduct);
};

const resolveProducerId = async (identifier) => {
  const { data, error } = await supabase
    .from('producers')
    .select('id')
    .or(`seller_code.eq.${identifier},slug.eq.${identifier}`)
    .maybeSingle();
  if (error) {
    console.error('[catalog] resolveProducerId', error);
    return null;
  }
  return data?.id || null;
};

export const fetchProducers = async () => {
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .order('seller_code', { ascending: true });
  if (error) {
    console.error('[catalog] fetchProducers', error);
    return [];
  }
  return data.map(mapProducer);
};

export const fetchProducerByIdentifier = async (identifier) => {
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .or(`seller_code.eq.${identifier},slug.eq.${identifier}`)
    .maybeSingle();
  if (error) {
    console.error('[catalog] fetchProducerByIdentifier', error);
    return null;
  }
  return data ? mapProducer(data) : null;
};

export const fetchProductsByProducer = async (identifier) => {
  const producerId = await resolveProducerId(identifier);
  if (!producerId) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .eq('seller_id', producerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[catalog] fetchProductsByProducer', error);
    return [];
  }
  return data.map(mapProduct);
};
