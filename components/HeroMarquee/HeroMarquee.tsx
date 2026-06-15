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

type Brand = { name: string; logo: string };

const BRANDS: Brand[] = [
  { name: 'ACWELL',          logo: '/brand-logos/acwell.svg' },
  { name: 'BEAUTY OF JOSEON',logo: '/brand-logos/beautyofjoseon.svg' },
  { name: 'THE ORDINARY',    logo: '/brand-logos/theordinary.svg' },
  { name: 'TIAM',            logo: '/brand-logos/tiam.svg' },
  { name: 'TIMELESS',        logo: '/brand-logos/timeless.svg' },
  { name: 'COSRX',           logo: '/brand-logos/cosrx.png' },
  { name: 'ANUA',            logo: '/brand-logos/anua.svg' },
  { name: 'PURITO',          logo: '/brand-logos/purito.svg' },
  { name: 'SKIN1004',        logo: '/brand-logos/skin1004.png' },
  { name: 'SOME BY MI',      logo: '/brand-logos/somebymi.svg' },
  { name: 'ISNTREE',         logo: '/brand-logos/isntree.svg' },
  { name: 'HARUHARU WONDER', logo: '/brand-logos/haruharuwonder.svg' },
  { name: 'TORRIDEN',        logo: '/brand-logos/torriden.svg' },
  { name: 'KLAIRS',          logo: '/brand-logos/klairs.png' },
  { name: 'DERMALOGICA',     logo: '/brand-logos/dermalogica.svg' },
  { name: 'NIVEA',           logo: '/brand-logos/nivea.svg' },
  { name: 'OLAY',            logo: '/brand-logos/olay.webp' },
  { name: 'SIMPLE',          logo: '/brand-logos/simple.svg' },
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

      {/* Strip 2 — brand logos scrolling right */}
      <div className={styles.strip2}>
        <div className={styles.trackReverse}>
          {brands.map(({ name, logo }, i) => (
            <span key={i} className={styles.brandItem}>
              <img
                src={logo}
                alt={name}
                className={styles.logoImg}
                draggable={false}
              />
              <span className={styles.sepBrand}>·</span>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
