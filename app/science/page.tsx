'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import Link from 'next/link';
import styles from './science.module.css';

/* ── TiltCard spring config — snappy, dramatic ── */
const SPRING = { damping: 18, stiffness: 200, mass: 1 };
const ROTATE_AMPLITUDE = 18;

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(1, SPRING);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -ROTATE_AMPLITUDE);
    rotateY.set((offsetX / (rect.width / 2)) * ROTATE_AMPLITUDE);
  }

  function handleMouseEnter() {
    scale.set(1.07);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      className={styles.cardWrapper}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className={className}
        style={{ rotateX, rotateY, scale }}
      >
        {children}
      </motion.article>
    </div>
  );
}

/* ── Data ── */
const ACTIVES = [
  {
    name: 'Niacinamide (B3)',
    role: 'Brightening & Pore Refinement',
    brands: 'The Ordinary · Garnier · Anua · TIAM',
    detail:
      'Stabilised at 5–10%, niacinamide blocks melanin transfer to skin cells — visibly reducing dark spots and post-acne marks within 4–8 weeks. It simultaneously regulates sebum and tightens pore appearance.',
    variant: 'dark',
  },
  {
    name: 'Ceramides',
    role: 'Barrier Reconstruction',
    brands: 'CeraVe · Isntree · Hada Labo',
    detail:
      'Ceramides make up over 50% of the skin\'s natural barrier. Products delivering fractions 1, 3, and 6-II replenish this barrier, restoring its protective function clinically within 7 days.',
    variant: 'cream',
  },
  {
    name: 'Hyaluronic Acid',
    role: 'Multi-depth Hydration',
    brands: 'Hada Labo · Timeless · Good Molecules',
    detail:
      'One gram holds up to 6 litres of water. Multi-weight HA hydrates across every layer of the epidermis simultaneously — plumping, smoothing, and reducing fine-line visibility.',
    variant: 'warm',
  },
  {
    name: 'Alpha-Arbutin & Tranexamic Acid',
    role: 'Targeted Dark Spot Correction',
    brands: 'The Ordinary · Axis-Y · Balance Active Formula',
    detail:
      'Alpha-arbutin inhibits tyrosinase at a cellular level. Tranexamic acid disrupts the keratinocyte–melanocyte signalling pathway. Together they deliver visible fading without irritation.',
    variant: 'dark',
  },
  {
    name: 'Centella Asiatica',
    role: 'Soothing & Skin Repair',
    brands: 'Anua · I\'M From · Isntree · Dr Teal\'s',
    detail:
      'Its key compounds — asiaticoside, madecassoside, and asiatic acid — stimulate collagen synthesis while suppressing inflammatory cytokines, making it clinically effective for redness and post-procedure recovery.',
    variant: 'cream',
  },
  {
    name: 'AHA & BHA Acids',
    role: 'Cell Turnover & Clarity',
    brands: 'PanOxyl · The Ordinary · Axis-Y',
    detail:
      'AHAs (glycolic, lactic) dissolve dead cell bonds for brighter texture. BHA (salicylic acid) is oil-soluble and penetrates the pore lining — the gold-standard active for acne and congestion.',
    variant: 'warm',
  },
  {
    name: 'Fermented Rice & Brighteners',
    role: 'Glow & Evenness',
    brands: 'Beauty of Joseon · Hatomugi · Kojie San',
    detail:
      'Fermented rice filtrate is rich in ferulic acid and naturally-occurring kojic acid — both of which brighten skin tone and improve luminosity over time.',
    variant: 'dark',
  },
  {
    name: 'Sunscreen Filters (SPF)',
    role: 'Your Most Important Step',
    brands: 'Skin Aqua · Beauty of Joseon · Garnier',
    detail:
      'No brightening serum, acid, or retinol works without SPF. UV is the primary driver of hyperpigmentation and premature ageing. Broad-spectrum SPF 50+ every morning is the highest-return habit you can build.',
    variant: 'gold',
  },
];

const SKIN_CONCERNS = [
  { concern: 'Brightening', count: 32, ingredients: 'Niacinamide · Vitamin C · Alpha-Arbutin', bg: 'tile1' },
  { concern: 'Dark Spots', count: 16, ingredients: 'Tranexamic Acid · Kojic Acid · AHA', bg: 'tile2' },
  { concern: 'Hydration', count: 23, ingredients: 'Hyaluronic Acid · Ceramides · Glycerin', bg: 'tile3' },
  { concern: 'Acne', count: 9, ingredients: 'Salicylic Acid · Benzoyl Peroxide · Niacinamide', bg: 'tile4' },
  { concern: 'Anti-Aging', count: 15, ingredients: 'Retinol · Peptides · Ceramides', bg: 'tile5' },
  { concern: 'Barrier Repair', count: 3, ingredients: 'Ceramides · Centella · Panthenol', bg: 'tile6' },
];

const TICKER_ITEMS = [
  'Niacinamide', 'Ceramides', 'Hyaluronic Acid', 'Centella Asiatica', 'SPF 50+',
  'Tranexamic Acid', 'Salicylic Acid', 'Retinol', 'Alpha-Arbutin', 'Ferulic Acid',
  'Glycerin', 'Peptides', 'Azelaic Acid', 'Kojic Acid', 'Lactic Acid',
];

export default function SciencePage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTop}>
            <span className={styles.eyebrow}>Ingredient Intelligence</span>
            <div className={styles.heroCount}>
              <span className={styles.heroCountNum}>34</span>
              <span className={styles.heroCountLabel}>brands.<br />All verified.</span>
            </div>
          </div>
          <h1 className={styles.heroTitle}>
            The science behind<br /><em>every drop.</em>
          </h1>
          <p className={styles.heroSub}>
            Every product in The Vault earns its place because of what&apos;s inside it —
            not what&apos;s on the label. We explain the actives so you shop with confidence.
          </p>
        </div>

        {/* Ticker strip */}
        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className={styles.tickerItem}>
                {item}
                <span className={styles.tickerDot} aria-hidden="true">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section label ── */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderInner}>
          <span className={styles.sectionLabel}>01 — Active Ingredients</span>
          <p className={styles.sectionDesc}>8 key actives. All present in products we carry.</p>
        </div>
      </div>

      {/* ── Actives Grid — TiltCard animation on each card ── */}
      <section className={styles.grid}>
        {ACTIVES.map((ing, i) => (
          <TiltCard
            key={ing.name}
            className={[styles.card, styles[`card_${ing.variant}`]].join(' ')}
          >
            <div className={styles.cardBracketTL} aria-hidden="true" />
            <div className={styles.cardBracketTR} aria-hidden="true" />
            <div className={styles.cardBracketBL} aria-hidden="true" />
            <div className={styles.cardBracketBR} aria-hidden="true" />

            <div className={styles.cardTop}>
              <span className={styles.cardNum}>0{i + 1}</span>
              <span className={styles.cardRole}>{ing.role}</span>
            </div>

            <h3 className={styles.cardName}>{ing.name}</h3>
            <p className={styles.cardDetail}>{ing.detail}</p>

            <div className={styles.cardFooter}>
              <span className={styles.cardBrandsLabel}>Found in</span>
              <p className={styles.cardBrands}>{ing.brands}</p>
            </div>

            <div className={styles.cardGhostNum} aria-hidden="true">0{i + 1}</div>
          </TiltCard>
        ))}
      </section>

      {/* ── Skin Concerns Bento ── */}
      <section className={styles.concerns}>
        <div className={styles.concernsHead}>
          <div>
            <span className={styles.eyebrowDark}>02 — Shop by Concern</span>
            <h2 className={styles.concernsTitle}>
              Skin goals,<br /><em>not guesswork.</em>
            </h2>
          </div>
          <div className={styles.concernsRight}>
            <p className={styles.concernsBody}>
              Every product is tagged by skin concern so you can build a routine
              around what your skin actually needs.
            </p>
            <Link href="/shop" className={styles.concernsCta}>
              Browse The Vault
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        <div className={styles.bento}>
          {SKIN_CONCERNS.map((c) => (
            <Link href="/shop" key={c.concern} className={[styles.tile, styles[c.bg]].join(' ')}>
              <span className={styles.tileConcern}>{c.concern}</span>
              <span className={styles.tileCount}>{c.count}</span>
              <span className={styles.tileCountLabel}>products</span>
              <p className={styles.tileIngredients}>{c.ingredients}</p>
              <div className={styles.tileArrow} aria-hidden="true">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Pledge / Stats ── */}
      <section className={styles.pledge}>
        <div className={styles.pledgeInner}>
          <span className={styles.eyebrow}>03 — The Vault Standard</span>
          <h2 className={styles.pledgeTitle}>
            Authentic formulas.<br /><em>No exceptions.</em>
          </h2>
          <p className={styles.pledgeBody}>
            Counterfeit skincare is one of the fastest-growing problems in Nigeria. Fake products
            contain incorrect concentrations, unlisted preservatives, and in severe cases, unsafe
            heavy metals. Every product in The Vault is sourced through verified distribution
            channels and authenticated before it reaches you.
            When the science says 5% niacinamide — you&apos;re getting exactly 5%.
          </p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>34</span>
              <span className={styles.statLabel}>Verified brands</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Authenticated stock</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>0</span>
              <span className={styles.statLabel}>Grey-market vendors</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
