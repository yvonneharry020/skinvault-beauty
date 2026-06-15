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

  const handleAddToCart = (item: typeof items[number]) => {
    addItem({ id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image });
    removeItem(item.id);
  };

  return (
    <div className={styles.page}>

      {/* ── Dark Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <Link href="/account" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Account
          </Link>
          <div className={styles.bannerContent}>
            <div>
              <p className={styles.eyebrow}>Your vault</p>
              <h1 className={styles.title}><em>Saved</em> Items</h1>
              <p className={styles.subtitle}>
                {count === 0 ? 'Nothing saved yet' : `${count} item${count !== 1 ? 's' : ''} saved`}
              </p>
            </div>
            {count > 0 && (
              <Link href="/shop" className={styles.shopLink}>Continue browsing →</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        <div className={styles.bodyInner}>

          {count === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyHeart}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
              <p className={styles.emptySub}>Tap the heart on any product to save it here. Build your perfect skincare routine.</p>
              <Link href="/shop" className={styles.shopBtn}>Browse the vault</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {items.map(item => (
                <div key={item.id} className={styles.card}>
                  <Link href={`/products/${item.slug}`} className={styles.imgWrap}>
                    {item.image ? (
                      <Image
                        src={cloudinaryUrl(item.image, 500)}
                        alt={item.name}
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.imgPlaceholder} />
                    )}
                    {/* Hover overlay */}
                    <div className={styles.imgOverlay}>
                      <span className={styles.viewBtn}>View product</span>
                    </div>
                  </Link>

                  {/* Remove heart button */}
                  <button
                    className={styles.heartBtn}
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  <div className={styles.cardBody}>
                    <Link href={`/products/${item.slug}`} className={styles.productName}>{item.name}</Link>
                    <p className={styles.price}>{formatNaira(item.price)}</p>
                    <button className={styles.addBtn} onClick={() => handleAddToCart(item)}>
                      Add to bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
