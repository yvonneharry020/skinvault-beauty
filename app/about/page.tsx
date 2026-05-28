import Link from 'next/link';
import styles from './about.module.css';

export const metadata = { title: 'Us — SkinVault Beauty' };

const NUMBERS = [
  { stat: '63', label: 'Authenticated products' },
  { stat: '34', label: 'Trusted global brands' },
  { stat: '11', label: 'Skin concerns covered' },
  { stat: '100%', label: 'Authentic, always' },
];

const BRANDS = [
  'Beauty of Joseon', 'Anua', 'The Ordinary', 'CeraVe', 'Hada Labo',
  'Axis-Y', 'Isntree', 'TIAM', 'Good Molecules', 'I\'M From',
  'Timeless', 'Skin Aqua', 'Garnier', 'Nivea', 'Palmer\'s',
];

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Our story</span>
        <h1 className={styles.title}>
          Your skin deserves<br />
          <em>the real thing</em>
        </h1>
        <p className={styles.heroPara}>
          SkinVault Beauty is Nigeria&apos;s curated source for authentic global skincare.
          We bring K-beauty, European, and US skincare formulas you can trust — verified,
          genuine, and delivered straight to you.
        </p>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div className={styles.statsBar}>
        {NUMBERS.map(n => (
          <div key={n.stat} className={styles.statItem}>
            <span className={styles.statNum}>{n.stat}</span>
            <span className={styles.statLabel}>{n.label}</span>
          </div>
        ))}
      </div>

      {/* ── Story blocks ─────────────────────────────────────────────── */}
      <section className={styles.story}>

        <div className={styles.storyBlock}>
          <span className={styles.num}>01</span>
          <div>
            <h2 className={styles.storyTitle}>The problem we faced</h2>
            <p className={styles.storyText}>
              Great skincare exists — Hada Labo&apos;s hyaluronic serums, Beauty of Joseon&apos;s
              fermented rice formulas, The Ordinary&apos;s honest actives. But in Nigeria, the
              same names fill pharmacy shelves and open-air stalls, and half of them are counterfeit.
              Diluted concentrations. Wrong preservatives. Labels that look right but formulas that
              do nothing — or worse, cause damage.
            </p>
            <p className={styles.storyText}>
              We got tired of paying full price for products that didn&apos;t work, and realising
              too late that the bottle was never real.
            </p>
          </div>
        </div>

        <div className={styles.storyBlock}>
          <span className={styles.num}>02</span>
          <div>
            <h2 className={styles.storyTitle}>Why we built The Vault</h2>
            <p className={styles.storyText}>
              SkinVault was built on a single idea: every Nigerian deserves access to skincare
              that actually does what it says on the box. We curate from brands with a proven
              track record — not viral trends, not empty claims. K-beauty innovators like Anua,
              Axis-Y, and Isntree. Dermatologist-backed formulas from CeraVe and The Ordinary.
              Brightening specialists like Kojie San and TIAM.
            </p>
            <p className={styles.storyText}>
              Every product is sourced through verified channels. If we can&apos;t be certain it&apos;s
              genuine, it doesn&apos;t enter The Vault.
            </p>
          </div>
        </div>

        <div className={styles.storyBlock}>
          <span className={styles.num}>03</span>
          <div>
            <h2 className={styles.storyTitle}>What we carry — and why</h2>
            <p className={styles.storyText}>
              Our collection spans face serums, toners, cleansers, moisturisers, SPF, masks,
              and bath &amp; body care. We choose products that target the skin concerns most
              common in Nigeria: hyperpigmentation, dark spots, acne, uneven tone, and dehydration.
            </p>
            <p className={styles.storyText}>
              Every product is tagged by concern, brand, and skin type — so you can build a real
              routine without guesswork. No filler products. No brand loyalty. Just what works.
            </p>
          </div>
        </div>

        <div className={styles.storyBlock}>
          <span className={styles.num}>04</span>
          <div>
            <h2 className={styles.storyTitle}>Our promise to you</h2>
            <p className={styles.storyText}>
              Authenticity is not a marketing word for us — it is the only reason SkinVault exists.
              If a product in our shop ever turns out to be inauthentic, you get a full refund and
              we pull it immediately. We would rather have an empty shelf than a fake one.
            </p>
            <p className={styles.storyText}>
              We are not a marketplace. We are a vault. Everything inside it has been vetted.
            </p>
          </div>
        </div>

      </section>

      {/* ── Brands strip ──────────────────────────────────────────────── */}
      <section className={styles.brandsSection}>
        <span className={styles.eyebrow}>Brands in the vault</span>
        <div className={styles.brandsScroll}>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className={styles.brandPill}>{b}</span>
          ))}
        </div>
        <Link href="/shop" className={styles.shopCta}>
          Browse all 63 products →
        </Link>
      </section>

    </div>
  );
}
