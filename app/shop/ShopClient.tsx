'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { cloudinaryThumb } from '@/lib/cloudinary';
import styles from './shop.module.css';

/* ── Types ──────────────────────────────────────────────────────────── */
interface ProductImg { url: string; alt: string; is_primary: boolean; }
interface Brand { name: string; slug: string; }
interface Category { name: string; slug: string; }

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  tag: string | null;
  description: string | null;
  concerns: string[];
  skin_types: string[];
  images: ProductImg[];
  is_featured: boolean;
  stock: number;
  brands: Brand | null;
  categories: Category | null;
}

/* ── Category mappings ───────────────────────────────────────────────── */
const FACE_SLUGS = new Set([
  'serums', 'toners-essences', 'cleansers', 'moisturizers',
  'sunscreen', 'masks-treatments', 'eye-care',
]);
const BODY_SLUGS = new Set(['body-care']);

const MAIN_TABS = [
  { key: 'all',      label: 'All Products' },
  { key: 'face',     label: 'Face Products' },
  { key: 'body',     label: 'Bath & Body' },
  { key: 'brands',   label: 'Brands' },
  { key: 'concerns', label: 'Specific Concerns' },
] as const;
type MainTab = typeof MAIN_TABS[number]['key'];

const CONCERN_LABELS: Record<string, string> = {
  'brightening':       'Brightening',
  'dark-spots':        'Dark Spots',
  'hyperpigmentation': 'Hyperpigmentation',
  'acne':              'Acne',
  'anti-aging':        'Anti-Aging',
  'hydration':         'Hydration',
  'pores':             'Pores',
  'soothing':          'Soothing',
  'exfoliation':       'Exfoliation',
  'sun-protection':    'Sun Protection',
  'barrier-repair':    'Barrier Repair',
};

const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/* ── AddToCartBtn ────────────────────────────────────────────────────── */
function AddToCartBtn({ product, imgUrl }: { product: Product; imgUrl: string }) {
  const { addItem } = useCart();
  const [flash, setFlash] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id:    product.id,
      slug:  product.slug,
      name:  product.name,
      price: product.price,
      image: product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url || '',
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  };

  if (product.stock === 0) {
    return <span className={styles.outOfStockBadge}>Out of Stock</span>;
  }

  return (
    <button
      className={`${styles.addBtn} ${flash ? styles.addedFlash : ''}`}
      onClick={handleAdd}
      aria-label={`Add ${product.name} to cart`}
    >
      {flash ? '✓ Added' : '+ Add to Cart'}
    </button>
  );
}

/* ── WishlistBtn ─────────────────────────────────────────────────────── */
function WishlistBtn({ productName }: { productName: string }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(v => !v);
  };

  return (
    <button
      className={`${styles.wishlistBtn} ${isLiked ? styles.wishlistBtnLiked : ''}`}
      onClick={handleClick}
      aria-label={isLiked ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/* ── ProductCard ─────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const primaryImg = product.images?.find(i => i.is_primary) || product.images?.[0];
  const imgUrl = cloudinaryThumb(primaryImg?.url);

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.slug}`} className={styles.cardImgLink}>
        <div className={styles.imgWrap}>
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={primaryImg?.alt || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
              className={styles.productImg}
              unoptimized
            />
          ) : (
            <div className={styles.imgPlaceholder} />
          )}
          {product.tag && <span className={styles.tagBadge}>{product.tag}</span>}
          <WishlistBtn productName={product.name} />
          <div className={styles.quickView}>VIEW PRODUCT</div>
        </div>
      </Link>

      <div className={styles.cardBody}>
        {product.brands && (
          <span className={styles.brandName}>{product.brands.name}</span>
        )}
        <Link href={`/products/${product.slug}`} className={styles.productName}>
          {product.name}
        </Link>
        {product.description && (
          <p className={styles.productDesc}>{product.description.split('.')[0]}.</p>
        )}
        <div className={styles.cardFooter}>
          <span className={styles.price}>{formatNaira(product.price)}</span>
          <AddToCartBtn product={product} imgUrl={imgUrl} />
        </div>
      </div>
    </div>
  );
}

/* ── Main ShopClient ─────────────────────────────────────────────────── */
export default function ShopClient({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab]         = useState<MainTab>('all');
  const [activeBrand, setActiveBrand]     = useState<string>('');
  const [activeConcern, setActiveConcern] = useState<string>('');
  const [showBrandDrop, setShowBrandDrop] = useState(false);
  const [showConcernDrop, setShowConcernDrop] = useState(false);
  const [sortBy, setSortBy]               = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [activeFaceSub, setActiveFaceSub] = useState('');

  /* ── Switch tab (clears sub-filters) ────────────────────────────── */
  const switchTab = (tab: MainTab) => {
    setActiveTab(tab);
    setActiveFaceSub('');
    setShowBrandDrop(false);
    setShowConcernDrop(false);
    // Clear brand/concern when entering their dedicated tabs (start fresh)
    if (tab === 'brands')   { setActiveConcern(''); }
    if (tab === 'concerns') { setActiveBrand(''); }
    if (tab === 'all' || tab === 'face' || tab === 'body') {
      setActiveBrand('');
      setActiveConcern('');
    }
  };

  /* ── Derived filter options ──────────────────────────────────────── */
  const allBrands = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => {
      if (p.brands) map.set(p.brands.slug, p.brands.name);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [products]);

  const allConcerns = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.concerns?.forEach(c => set.add(c)));
    return [...set].filter(c => CONCERN_LABELS[c]).sort();
  }, [products]);

  /* ── Filtered products ───────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const catSlug = p.categories?.slug ?? '';

      if (activeTab === 'face' && !FACE_SLUGS.has(catSlug)) return false;
      if (activeTab === 'body' && !BODY_SLUGS.has(catSlug)) return false;
      // 'brands' and 'concerns' tabs show all categories

      if (activeBrand && p.brands?.slug !== activeBrand) return false;
      if (activeConcern && !p.concerns?.includes(activeConcern)) return false;

      return true;
    });

    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, activeTab, activeBrand, activeConcern, sortBy]);

  /* ── Face subcategories (visible when Face tab is active) ─────────── */
  const faceSubcats = useMemo(() => {
    if (activeTab !== 'face') return [];
    const map = new Map<string, number>();
    products
      .filter(p => FACE_SLUGS.has(p.categories?.slug ?? ''))
      .forEach(p => {
        const n = p.categories?.name ?? '';
        map.set(n, (map.get(n) || 0) + 1);
      });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [products, activeTab]);

  const finalFiltered = useMemo(() => {
    if (activeTab === 'face' && activeFaceSub) {
      return filtered.filter(p => p.categories?.name === activeFaceSub);
    }
    return filtered;
  }, [filtered, activeTab, activeFaceSub]);

  /* ── Tab counts ─────────────────────────────────────────────────── */
  const tabCounts: Record<MainTab, number> = useMemo(() => ({
    all:      products.length,
    face:     products.filter(p => FACE_SLUGS.has(p.categories?.slug ?? '')).length,
    body:     products.filter(p => BODY_SLUGS.has(p.categories?.slug ?? '')).length,
    brands:   allBrands.length,
    concerns: allConcerns.length,
  }), [products, allBrands, allConcerns]);

  /* ── Active filter count ─────────────────────────────────────────── */
  const activeFilterCount =
    (activeBrand ? 1 : 0) + (activeConcern ? 1 : 0) + (activeFaceSub ? 1 : 0);

  const clearAll = () => {
    setActiveBrand('');
    setActiveConcern('');
    setActiveFaceSub('');
  };

  /* ── Bath & Body name-keyword map ─────────────────────────────────── */
  const BODY_SUB_MAP: Record<string, string[]> = {
    'Body Washes':  ['body-wash', 'wash'],
    'Body Lotions': ['lotion', 'milk'],
    'Body Oils':    ['oil'],
    'Body Scrubs':  ['scrub'],
    'Soaps':        ['soap'],
  };

  return (
    <div className={styles.shopPage}>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className={styles.shopHero}>
        <h1 className={styles.shopTitle}>The Vault</h1>
        <p className={styles.shopSub}>
          {products.length} authentic skincare products · All brands, all skin types
        </p>
      </div>

      {/* ── Main tab bar ───────────────────────────────────────────── */}
      <div className={styles.tabBar}>
        <div className={styles.mainTabs}>
          {MAIN_TABS.map(tab => (
            <button
              key={tab.key}
              className={`${styles.mainTab} ${activeTab === tab.key ? styles.mainTabActive : ''}`}
              onClick={() => switchTab(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tabCounts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* ── Filter row (hidden on Brands/Concerns tabs — pills replace dropdowns) */}
        {activeTab !== 'brands' && activeTab !== 'concerns' && (
          <div className={styles.filterRow}>
            {/* Brand dropdown */}
            <div className={styles.dropdownWrap}>
              <button
                className={`${styles.filterChip} ${activeBrand ? styles.filterChipActive : ''}`}
                onClick={() => { setShowBrandDrop(v => !v); setShowConcernDrop(false); }}
              >
                {activeBrand ? allBrands.find(b => b[0] === activeBrand)?.[1] : 'Brand'}
                <span className={styles.chipArrow}>{showBrandDrop ? '▲' : '▼'}</span>
              </button>
              {showBrandDrop && (
                <div className={styles.dropdown}>
                  <button className={`${styles.dropItem} ${!activeBrand ? styles.dropItemActive : ''}`}
                    onClick={() => { setActiveBrand(''); setShowBrandDrop(false); }}>
                    All Brands
                  </button>
                  {allBrands.map(([slug, name]) => (
                    <button
                      key={slug}
                      className={`${styles.dropItem} ${activeBrand === slug ? styles.dropItemActive : ''}`}
                      onClick={() => { setActiveBrand(slug); setShowBrandDrop(false); }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Concern dropdown */}
            <div className={styles.dropdownWrap}>
              <button
                className={`${styles.filterChip} ${activeConcern ? styles.filterChipActive : ''}`}
                onClick={() => { setShowConcernDrop(v => !v); setShowBrandDrop(false); }}
              >
                {activeConcern ? CONCERN_LABELS[activeConcern] : 'Concern'}
                <span className={styles.chipArrow}>{showConcernDrop ? '▲' : '▼'}</span>
              </button>
              {showConcernDrop && (
                <div className={styles.dropdown}>
                  <button className={`${styles.dropItem} ${!activeConcern ? styles.dropItemActive : ''}`}
                    onClick={() => { setActiveConcern(''); setShowConcernDrop(false); }}>
                    All Concerns
                  </button>
                  {allConcerns.map(c => (
                    <button
                      key={c}
                      className={`${styles.dropItem} ${activeConcern === c ? styles.dropItemActive : ''}`}
                      onClick={() => { setActiveConcern(c); setShowConcernDrop(false); }}
                    >
                      {CONCERN_LABELS[c]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {activeFilterCount > 0 && (
              <button className={styles.clearBtn} onClick={clearAll}>
                Clear filters ({activeFilterCount})
              </button>
            )}

            <span className={styles.resultCount}>{finalFiltered.length} products</span>
          </div>
        )}

        {/* Sort row for Brands/Concerns tabs */}
        {(activeTab === 'brands' || activeTab === 'concerns') && (
          <div className={styles.filterRow}>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {activeFilterCount > 0 && (
              <button className={styles.clearBtn} onClick={clearAll}>
                Clear ({activeFilterCount})
              </button>
            )}
            <span className={styles.resultCount}>{finalFiltered.length} products</span>
          </div>
        )}
      </div>

      {/* ── Face subcategory pills ─────────────────────────────────────── */}
      {activeTab === 'face' && faceSubcats.length > 0 && (
        <div className={styles.subCatPills}>
          <button
            className={`${styles.subPill} ${!activeFaceSub ? styles.subPillActive : ''}`}
            onClick={() => setActiveFaceSub('')}
          >
            All Face
          </button>
          {faceSubcats.map(([name, count]) => (
            <button
              key={name}
              className={`${styles.subPill} ${activeFaceSub === name ? styles.subPillActive : ''}`}
              onClick={() => setActiveFaceSub(name)}
            >
              {name} <span>({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Bath & Body subcategory pills ─────────────────────────────── */}
      {activeTab === 'body' && (
        <div className={styles.subCatPills}>
          {Object.entries(BODY_SUB_MAP).map(([sub, keywords]) => {
            const count = products.filter(p =>
              BODY_SLUGS.has(p.categories?.slug ?? '') &&
              keywords.some(k => p.name.toLowerCase().includes(k))
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={sub}
                className={styles.subPill}
                onClick={() => {}}
              >
                {sub} <span>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Brands tab — brand pills ───────────────────────────────────── */}
      {activeTab === 'brands' && (
        <div className={styles.subCatPills}>
          <button
            className={`${styles.subPill} ${!activeBrand ? styles.subPillActive : ''}`}
            onClick={() => setActiveBrand('')}
          >
            All Brands
          </button>
          {allBrands.map(([slug, name]) => {
            const count = products.filter(p => p.brands?.slug === slug).length;
            return (
              <button
                key={slug}
                className={`${styles.subPill} ${activeBrand === slug ? styles.subPillActive : ''}`}
                onClick={() => setActiveBrand(activeBrand === slug ? '' : slug)}
              >
                {name} <span>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Specific Concerns tab — concern pills ──────────────────────── */}
      {activeTab === 'concerns' && (
        <div className={styles.subCatPills}>
          <button
            className={`${styles.subPill} ${!activeConcern ? styles.subPillActive : ''}`}
            onClick={() => setActiveConcern('')}
          >
            All Concerns
          </button>
          {allConcerns.map(c => {
            const count = products.filter(p => p.concerns?.includes(c)).length;
            return (
              <button
                key={c}
                className={`${styles.subPill} ${activeConcern === c ? styles.subPillActive : ''}`}
                onClick={() => setActiveConcern(activeConcern === c ? '' : c)}
              >
                {CONCERN_LABELS[c]} <span>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Active filter tags ─────────────────────────────────────────── */}
      {activeFilterCount > 0 && (
        <div className={styles.activeTags}>
          {activeBrand && (
            <span className={styles.activeTag}>
              Brand: {allBrands.find(b => b[0] === activeBrand)?.[1]}
              <button onClick={() => setActiveBrand('')}>✕</button>
            </span>
          )}
          {activeConcern && (
            <span className={styles.activeTag}>
              {CONCERN_LABELS[activeConcern]}
              <button onClick={() => setActiveConcern('')}>✕</button>
            </span>
          )}
          {activeFaceSub && (
            <span className={styles.activeTag}>
              {activeFaceSub}
              <button onClick={() => setActiveFaceSub('')}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* ── Product grid ──────────────────────────────────────────────── */}
      {finalFiltered.length === 0 ? (
        <div className={styles.empty}>
          <p>No products match your filters.</p>
          <button className={styles.clearEmptyBtn} onClick={clearAll}>Clear all filters</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {finalFiltered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
