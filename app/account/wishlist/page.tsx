'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { cloudinaryUrl } from '@/lib/cloudinary';
import styles from './wishlist.module.css';

const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function WishlistPage() {
  const { items, removeItem, count } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <Link href="/account" className={styles.backLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              My Account
            </Link>
            <h1 className={styles.title}>Wishlist</h1>
          </div>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className={styles.emptyTitle}>Your wishlist is empty</p>
            <p className={styles.emptySub}>Save products you love by clicking the heart icon on any product.</p>
            <Link href="/shop" className={styles.shopBtn}>Browse the vault</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Link href="/account" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            My Account
          </Link>
          <h1 className={styles.title}>Wishlist <span className={styles.count}>({count})</span></h1>
        </div>

        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.id} className={styles.card}>
              <Link href={`/products/${item.slug}`} className={styles.imgWrap}>
                {item.image ? (
                  <Image src={cloudinaryUrl(item.image, 400)} alt={item.name} fill sizes="(max-width:768px) 50vw, 25vw" style={{ objectFit: 'cover' }} unoptimized />
                ) : (
                  <div className={styles.imgPlaceholder} />
                )}
              </Link>
              <div className={styles.cardBody}>
                <Link href={`/products/${item.slug}`} className={styles.productName}>{item.name}</Link>
                <p className={styles.price}>{formatNaira(item.price)}</p>
                <div className={styles.actions}>
                  <button
                    className={styles.addBtn}
                    onClick={() => { addItem({ id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image }); removeItem(item.id); }}
                  >
                    Add to cart
                  </button>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove from wishlist">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
