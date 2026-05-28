import Link from 'next/link';
import styles from './ProductGrid.module.css';

export const PRODUCTS = [
  { id: 'vault-serum',         name: 'Vault Renewal Serum',       price: '$89',  tag: 'BESTSELLER',  desc: 'Collagen-boosting peptide complex' },
  { id: 'hydra-shield',        name: 'Hydra-Shield Moisturizer',  price: '$72',  tag: 'NEW',         desc: 'Barrier-fortifying daily cream' },
  { id: 'clarity-cleanser',    name: 'Clarity Foam Cleanser',     price: '$38',  tag: '',            desc: 'Gentle barrier-safe foam' },
  { id: 'eye-recovery',        name: 'Eye Recovery Complex',      price: '$68',  tag: 'CULT FAVE',   desc: 'Multi-tasking eye & lash serum' },
  { id: 'glow-essence',        name: 'Glow Essence Mist',         price: '$55',  tag: '',            desc: 'Illuminating niacinamide mist' },
  { id: 'repair-mask',         name: 'Deep Repair Overnight Mask',price: '$78',  tag: 'NEW',         desc: 'Ceramide-rich restorative treatment' },
  { id: 'vitamin-c-booster',   name: 'Vitamin C Brightening Booster', price: '$65', tag: '',        desc: 'Stable 15% L-ascorbic acid' },
  { id: 'barrier-oil',         name: 'Barrier Botanical Oil',     price: '$82',  tag: 'LIMITED',     desc: 'Squalane + rosehip barrier blend' },
];

interface ProductGridProps {
  limit?: number;
  title?: string;
}

export default function ProductGrid({ limit, title = 'The Collection' }: ProductGridProps) {
  const products = limit ? PRODUCTS.slice(0, limit) : PRODUCTS;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Link href="/shop" className={styles.viewAll}>VIEW ALL</Link>
      </div>
      <div className={styles.grid}>
        {products.map(product => (
          <Link key={product.id} href={`/products/${product.id}`} className={styles.card}>
            <div className={styles.imageWrap}>
              {/* Placeholder gradient — replace with next/image */}
              <div className={styles.imagePlaceholder} />
              {product.tag && <span className={styles.tag}>{product.tag}</span>}
              <div className={styles.hoverOverlay}>
                <span className={styles.selectBtn}>SELECT</span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productDesc}>{product.desc}</p>
              <span className={styles.price}>{product.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
