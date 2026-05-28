import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import styles from './ProductGrid.module.css';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  tag: string | null;
  description: string | null;
  images: { url: string; alt: string; is_primary: boolean }[];
  is_featured: boolean;
}

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

async function getProducts(limit?: number): Promise<Product[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from('products')
    .select('id, name, slug, price, tag, description, images, is_featured')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('ProductGrid fetch error:', error.message);
    return [];
  }
  return (data as Product[]) ?? [];
}

interface ProductGridProps {
  limit?: number;
  title?: string;
}

export default async function ProductGrid({ limit, title = 'The Collection' }: ProductGridProps) {
  const products = await getProducts(limit);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Link href="/shop" className={styles.viewAll}>VIEW ALL</Link>
      </div>
      <div className={styles.grid}>
        {products.map(product => {
          const primaryImg = product.images?.find(i => i.is_primary) || product.images?.[0];
          return (
            <Link key={product.id} href={`/products/${product.slug}`} className={styles.card}>
              <div className={styles.imageWrap}>
                {primaryImg ? (
                  <Image
                    src={primaryImg.url}
                    alt={primaryImg.alt || product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
                {product.tag && <span className={styles.tag}>{product.tag}</span>}
                <div className={styles.hoverOverlay}>
                  <span className={styles.selectBtn}>SELECT</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>
                  {product.description?.split('.')[0] || ''}
                </p>
                <span className={styles.price}>{formatNaira(product.price)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
