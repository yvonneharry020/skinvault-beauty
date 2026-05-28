import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductDetail from './ProductDetail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, compare_price, tag, description,
      ingredients, how_to_use, skin_types, concerns,
      volume_ml, weight_g, stock, images, is_featured, currency,
      brands (name, slug),
      categories (name, slug)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

async function getRelated(categorySlug: string, currentSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: cat } = await supabase
    .from('categories').select('id').eq('slug', categorySlug).single();

  if (!cat) return [];

  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, images, tag')
    .eq('is_active', true)
    .eq('category_id', cat.id)
    .neq('slug', currentSlug)
    .limit(4);

  return data ?? [];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found — SkinVault Beauty' };
  return {
    title: `${product.name} — SkinVault Beauty`,
    description: product.description?.substring(0, 155),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const catSlug = Array.isArray(product.categories)
    ? (product.categories[0] as { slug: string })?.slug ?? ''
    : (product.categories as { slug: string } | null)?.slug ?? '';

  const related = await getRelated(catSlug, slug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductDetail product={product as any} related={related as any} />;
}
