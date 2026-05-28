'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import styles from './product.module.css';

const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

interface ProductImg { url: string; alt: string; is_primary: boolean; }

interface Product {
  id: string; name: string; slug: string;
  price: number; compare_price: number | null; tag: string | null;
  description: string | null; ingredients: string | null; how_to_use: string | null;
  skin_types: string[]; concerns: string[]; volume_ml: number | null;
  weight_g: number | null; stock: number; images: ProductImg[];
  brands: { name: string; slug: string } | null;
  categories: { name: string; slug: string } | null;
}

interface RelatedProduct { id: string; name: string; slug: string; price: number; images: ProductImg[]; tag: string | null; }

interface Props { product: Product; related: RelatedProduct[]; }

type Tab = 'description' | 'ingredients' | 'how_to_use';

export default function ProductDetail({ product, related }: Props) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const images = product.images?.length ? product.images : [];
  const primaryImg = images.find(i => i.is_primary) || images[0];
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: primaryImg?.url ?? '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'how_to_use', label: 'How to Use' },
  ];

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        {product.categories && (
          <>
            <Link href={`/shop?category=${product.categories.slug}`}>{product.categories.name}</Link>
            <span>/</span>
          </>
        )}
        <span>{product.name}</span>
      </nav>

      <div className={styles.productLayout}>
        {/* Image gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImgWrap}>
            {primaryImg ? (
              <Image
                src={images[activeImg]?.url ?? primaryImg.url}
                alt={images[activeImg]?.alt ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.mainImg}
                priority
              />
            ) : (
              <div className={styles.imgPlaceholder} />
            )}
            {product.tag && <span className={styles.tag}>{product.tag}</span>}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className={styles.info}>
          {product.brands && (
            <Link href={`/shop?brand=${product.brands.slug}`} className={styles.brandLink}>
              {product.brands.name}
            </Link>
          )}

          <h1 className={styles.name}>{product.name}</h1>

          {/* Price */}
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatNaira(product.price)}</span>
            {product.compare_price && (
              <span className={styles.comparePrice}>{formatNaira(product.compare_price)}</span>
            )}
            {discount && <span className={styles.discount}>−{discount}%</span>}
          </div>

          {/* Size/weight */}
          <div className={styles.meta}>
            {product.volume_ml && <span>{product.volume_ml}ml</span>}
            {product.weight_g && <span>{product.weight_g}g</span>}
            {product.categories && <span>{product.categories.name}</span>}
          </div>

          {/* Short desc */}
          {product.description && (
            <p className={styles.shortDesc}>{product.description.split('.')[0]}.</p>
          )}

          {/* Skin types */}
          {product.skin_types?.length > 0 && (
            <div className={styles.tags}>
              <span className={styles.tagLabel}>SKIN TYPE:</span>
              {product.skin_types.map(s => (
                <span key={s} className={styles.skinTag}>{s}</span>
              ))}
            </div>
          )}

          {/* Concerns */}
          {product.concerns?.length > 0 && (
            <div className={styles.tags}>
              <span className={styles.tagLabel}>TARGETS:</span>
              {product.concerns.map(c => (
                <span key={c} className={styles.skinTag}>{c.replace('-', ' ')}</span>
              ))}
            </div>
          )}

          {/* Stock */}
          {product.stock < 10 && product.stock > 0 && (
            <p className={styles.lowStock}>Only {product.stock} left in stock</p>
          )}
          {product.stock === 0 && (
            <p className={styles.outOfStock}>Out of stock</p>
          )}

          {/* Qty + Add to cart */}
          <div className={styles.actions}>
            <div className={styles.qtyPicker}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button
              className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
            </button>
          </div>

          {/* Trust signals */}
          <div className={styles.trust}>
            <span>✓ 100% Authentic</span>
            <span>✓ Secure Checkout</span>
            <span>✓ Easy Returns</span>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Ingredients / How to use */}
      <div className={styles.tabsSection}>
        <div className={styles.tabNav}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <p className={styles.tabText}>{product.description || 'No description available.'}</p>
          )}
          {activeTab === 'ingredients' && (
            <p className={styles.tabText}>{product.ingredients || 'Ingredients list not available.'}</p>
          )}
          {activeTab === 'how_to_use' && (
            <p className={styles.tabText}>{product.how_to_use || 'Usage instructions not available.'}</p>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>You Might Also Like</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => {
              const img = p.images?.find(i => i.is_primary) || p.images?.[0];
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImgWrap}>
                    {img ? (
                      <Image src={img.url} alt={img.alt || p.name} fill sizes="25vw" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.imgPlaceholder} />
                    )}
                    {p.tag && <span className={styles.tag} style={{ fontSize: '0.55rem' }}>{p.tag}</span>}
                  </div>
                  <p className={styles.relatedName}>{p.name}</p>
                  <p className={styles.relatedPrice}>{formatNaira(p.price)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
