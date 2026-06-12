import { createClient } from '@supabase/supabase-js';
import ShopClient from './ShopClient';

export const metadata = { title: 'Shop SkinVault Beauty' };

async function getAllProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, tag, description,
      concerns, skin_types, images, is_featured, stock,
      brands (name, slug),
      categories (name, slug)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Shop fetch error:', error.message);
    return [];
  }
  return data ?? [];
}

export default async function ShopPage() {
  const products = await getAllProducts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ShopClient products={products as any[]} />;
}
