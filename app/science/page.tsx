'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import styles from './science.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

const ACTIVES = [
  {
    name: 'Niacinamide (B3)',
    role: 'Brightening & Pore Refinement',
    brands: 'The Ordinary · Garnier · Anua · TIAM',
    detail:
      'Stabilised at 5–10%, niacinamide blocks the transfer of melanin pigment to skin cells — visibly reducing dark spots, post-acne marks, and hyperpigmentation. Simultaneously, it regulates sebum and tightens pore appearance within 4–8 weeks of consistent use.',
  },
  {
    name: 'Ceramides',
    role: 'Barrier Reconstruction',
    brands: 'CeraVe · Isntree · Hada Labo',
    detail:
      'Ceramides are lipid molecules that make up over 50% of the skin\'s natural barrier. When depleted — by harsh cleansers, over-exfoliation, or environmental stress — skin loses moisture and becomes reactive. Products delivering ceramide fractions 1, 3, and 6-II replenish this barrier, restoring protective function clinically within 7 days.',
  },
  {
    name: 'Hyaluronic Acid',
    role: 'Multi-depth Hydration',
    brands: 'Hada Labo · Timeless · Simple · Good Molecules',
    detail:
      'A single gram of hyaluronic acid holds up to 6 litres of water. Multi-weight HA — combining high, medium, and low molecular weight variants — hydrates across every layer of the epidermis simultaneously. The result is visibly plumped, smoother skin, with improved resilience and reduced fine-line visibility.',
  },
  {
    name: 'Alpha-Arbutin & Tranexamic Acid',
    role: 'Targeted Dark Spot Correction',
    brands: 'The Ordinary · Axis-Y · Balance Active Formula',
    detail:
      'Alpha-arbutin inhibits tyrosinase — the enzyme responsible for melanin production — at a cellular level. Tranexamic acid works by disrupting the keratinocyte–melanocyte signalling pathway that triggers excess pigmentation after UV exposure or inflammation. Used consistently, both actives deliver visible fading without irritation.',
  },
  {
    name: 'Centella Asiatica (CICA)',
    role: 'Soothing & Skin Repair',
    brands: 'Anua · I\'M From · Isntree · Dr Teal\'s',
    detail:
      'Centella asiatica is one of the most studied botanicals in dermatology. Its key compounds — asiaticoside, madecassoside, and asiatic acid — stimulate collagen synthesis while suppressing inflammatory cytokines. This makes it clinically effective for redness, acne-prone skin, and post-procedure recovery.',
  },
  {
    name: 'AHA & BHA (Exfoliating Acids)',
    role: 'Cell Turnover & Clarity',
    brands: 'PanOxyl · The Ordinary · Axis-Y · Good Molecules',
    detail:
      'Alpha-hydroxy acids (glycolic, lactic) work on the skin\'s surface, dissolving the bonds between dead skin cells for brighter, smoother texture. Beta-hydroxy acid (salicylic acid) is oil-soluble and penetrates the pore lining directly — making it the gold-standard active for acne and congestion. Never use both on the same evening without building tolerance first.',
  },
  {
    name: 'Fermented Rice & Skin Brighteners',
    role: 'Glow & Evenness',
    brands: 'Beauty of Joseon · Hatomugi · Kojie San · Kojivit',
    detail:
      'Fermented rice filtrate is rich in ferulic acid, gamma-aminobutyric acid, and naturally-occurring kojic acid — all of which brighten skin tone and improve luminosity over time. Hatomugi (Job\'s Tears) extract is a centuries-old Japanese botanical packed with coix lacryma-jobi oil, shown to improve overall skin texture and moisture retention.',
  },
  {
    name: 'Sunscreen Filters (SPF)',
    role: 'Your Most Important Step',
    brands: 'Skin Aqua · Beauty of Joseon · Nivea · Garnier',
    detail:
      'No brightening serum, no acid, no retinol works properly without SPF. UV radiation — even on cloudy days — is the primary driver of hyperpigmentation, premature aging, and barrier damage. Broad-spectrum SPF 50+ applied every morning is not optional skincare; it is the single highest-return habit you can build.',
  },
];

const SKIN_CONCERNS = [
  { concern: 'Brightening', count: 32, ingredients: 'Niacinamide · Vitamin C · Alpha-Arbutin' },
  { concern: 'Dark Spots', count: 16, ingredients: 'Tranexamic Acid · Kojic Acid · AHA' },
  { concern: 'Hydration', count: 23, ingredients: 'Hyaluronic Acid · Ceramides · Glycerin' },
  { concern: 'Acne', count: 9, ingredients: 'Salicylic Acid · Benzoyl Peroxide · Niacinamide' },
  { concern: 'Anti-Aging', count: 15, ingredients: 'Retinol · Peptides · Ceramides' },
  { concern: 'Barrier Repair', count: 3, ingredients: 'Ceramides · Centella · Panthenol' },
];

export default function SciencePage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Ingredient Intelligence</span>
          <h1 className={styles.heroTitle}>
            Know exactly what<br /><em>you&apos;re putting on your skin</em>
          </h1>
          <p className={styles.heroSub}>
            SkinVault stocks 34 globally trusted brands — K-beauty, European, and US formulas.
            Every product earns its place because of what&apos;s inside it, not what&apos;s on the label.
          </p>
        </div>
        <GlassSphere
          id="science-bubble-right"
          className={styles.heroSphere}
          color1="#e8c5a8"
          color2="#f0dece"
        />
      </section>

      {/* ── Key Actives Grid ─────────────────────────────────────────── */}
      <section className={styles.ingredients}>
        <div className={styles.ingredientsHeader}>
          <h2 className={styles.sectionTitle}>The actives that actually work</h2>
          <p className={styles.sectionSub}>
            Every ingredient below appears in products we carry. We explain the science so you shop with confidence.
          </p>
        </div>

        <div className={styles.ingredientGrid}>
          {ACTIVES.map((ing, i) => (
            <div key={ing.name} className={styles.ingredientCard}>
              <div className={styles.cardNum}>0{i + 1}</div>
              <h3 className={styles.ingName}>{ing.name}</h3>
              <span className={styles.ingRole}>{ing.role}</span>
              <p className={styles.ingBrands}>Found in: {ing.brands}</p>
              <p className={styles.ingDetail}>{ing.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Skin Concerns Section ─────────────────────────────────────── */}
      <section className={styles.concernSection}>
        <div className={styles.concernInner}>
          <div className={styles.concernLeft}>
            <span className={styles.eyebrow}>Shop by concern</span>
            <h2 className={styles.pdrnTitle}>
              Skin goals,<br />not guesswork
            </h2>
            <p className={styles.pdrnBody}>
              Every product in The Vault is tagged by skin concern so you can build a routine
              around what your skin actually needs — not what an algorithm recommends.
              Browse all 63 products filtered by concern, brand, or skin type.
            </p>
            <Link href="/shop" className={styles.concernCta}>
              Shop The Vault →
            </Link>
          </div>
          <div className={styles.concernGrid}>
            {SKIN_CONCERNS.map(c => (
              <div key={c.concern} className={styles.concernCard}>
                <div className={styles.concernName}>{c.concern}</div>
                <div className={styles.concernCount}>{c.count} products</div>
                <div className={styles.concernIngredients}>{c.ingredients}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Authenticity Pledge ──────────────────────────────────────── */}
      <section className={styles.pledgeSection}>
        <GlassSphere
          id="science-pledge-bubble"
          className={styles.pdrnSphere}
          color1="#c8d8b8"
          color2="#e0ecd4"
        />
        <div className={styles.pdrnText}>
          <span className={styles.eyebrow}>The Vault Standard</span>
          <h2 className={styles.pdrnTitle}>
            Authentic formulas.<br />No exceptions.
          </h2>
          <p className={styles.pdrnBody}>
            Counterfeit skincare is one of the fastest-growing problems in Nigeria. Fake products
            contain incorrect active concentrations, unlisted preservatives, and in severe cases,
            unsafe heavy metals. Every product in The Vault is sourced through verified
            distribution channels and authenticated before it reaches you.
            When the science says 5% niacinamide, you&apos;re getting exactly 5%.
          </p>
        </div>
      </section>

    </div>
  );
}
