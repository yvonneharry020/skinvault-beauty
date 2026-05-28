import ProductGrid from '@/components/ProductGrid/ProductGrid';
import styles from './shop.module.css';

export const metadata = { title: 'Shop — SkinVault Beauty' };

export default function ShopPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>The Vault</h1>
        <p className={styles.sub}>Every formula. Engineered for performance.</p>
      </div>
      <ProductGrid title="All Products" />
    </div>
  );
}
