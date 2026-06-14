import styles from './HeroMarquee.module.css';

const TAGLINES = [
  'AUTHENTIC PRODUCTS ONLY',
  'WORLDWIDE DELIVERY',
  'SAFE PAYMENT OPTIONS',
  '63 PRODUCTS · 34 GLOBAL BRANDS',
  '100% GENUINE SKINCARE',
  'NO FAKES · NO DUPES',
  'SHOP THE VAULT',
  'TRUSTED BY NIGERIANS',
  'SKIN THAT ACTUALLY GLOWS',
  'CERTIFIED AUTHENTIC',
];

const BRANDS = [
  'ACWELL',
  'BEAUTY OF JOSEON',
  'THE ORDINARY',
  'TIAM',
  'TIMELESS',
  'COSRX',
  'ANUA',
  'PURITO',
  'SKIN1004',
  'SOME BY MI',
  'ISNTREE',
  'HARUHARU WONDER',
  'TORRIDEN',
  'KLAIRS',
  'DERMALOGICA',
  'NIVEA',
  'OLAY',
  'SIMPLE',
];

export default function HeroMarquee() {
  const taglines = [...TAGLINES, ...TAGLINES];
  const brands   = [...BRANDS,   ...BRANDS];

  return (
    <div className={styles.wrapper} aria-hidden="true">

      {/* Strip 1 — taglines scrolling left */}
      <div className={styles.strip1}>
        <div className={styles.track}>
          {taglines.map((text, i) => (
            <span key={i} className={styles.item}>
              {text}
              <span className={styles.sep}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Strip 2 — brand names scrolling right */}
      <div className={styles.strip2}>
        <div className={styles.trackReverse}>
          {brands.map((brand, i) => (
            <span key={i} className={styles.brandItem}>
              {brand}
              <span className={styles.sepBrand}>•</span>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
