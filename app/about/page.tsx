import Link from 'next/link';
import styles from './about.module.css';

export const metadata = { title: 'Us — SkinVault Beauty' };

const NUMBERS = [
  { stat: '63', label: 'Authenticated products', note: 'Serums, toners, SPF, cleansers & more' },
  { stat: '34', label: 'Trusted global brands', note: 'K-beauty, European & US formulas' },
  { stat: '11', label: 'Skin concerns covered', note: 'From dark spots to barrier repair' },
  { stat: '100%', label: 'Authentic, always', note: 'Every item verified before it enters The Vault' },
];

const BRANDS_ROW1 = [
  'Beauty of Joseon', 'Anua', 'The Ordinary', 'CeraVe', 'Hada Labo',
  'Axis-Y', 'Isntree', 'TIAM', 'Good Molecules', 'I\'M From', 'Timeless',
];
const BRANDS_ROW2 = [
  'Skin Aqua', 'Garnier', 'Nivea', 'Palmer\'s', 'Kojie San', 'Acwell',
  'Purito', 'Torriden', 'Some By Mi', 'Dr Teal\'s', 'Kojivit',
];

const CHAPTERS = [
  {
    num: '01',
    tag: 'The Problem',
    title: 'Paying full price\nfor fake products.',
    body: [
      'Great skincare exists — Hada Labo\'s hyaluronic serums, Beauty of Joseon\'s fermented rice formulas, The Ordinary\'s honest actives. But in Nigeria, the same names fill pharmacy shelves and open-air stalls, and half of them are counterfeit.',
      'Diluted concentrations. Wrong preservatives. Labels that look right but formulas that do nothing — or worse, cause damage. We got tired of paying full price for products that weren\'t real.',
    ],
    variant: 'dark',
  },
  {
    num: '02',
    tag: 'Why We Built This',
    title: 'Every Nigerian deserves\nskincare that works.',
    body: [
      'SkinVault was built on a single idea: curate from brands with a proven track record, not viral trends or empty claims. K-beauty innovators like Anua, Axis-Y, and Isntree. Dermatologist-backed formulas from CeraVe and The Ordinary. Brightening specialists like Kojie San and TIAM.',
      'Every product is sourced through verified channels. If we can\'t be certain it\'s genuine, it doesn\'t enter The Vault.',
    ],
    variant: 'cream',
  },
  {
    num: '03',
    tag: 'What We Carry',
    title: 'Targeted products.\nZero filler.',
    body: [
      'Our collection spans face serums, toners, cleansers, moisturisers, SPF, masks, and bath & body care. We choose products that target the skin concerns most common in Nigeria: hyperpigmentation, dark spots, acne, uneven tone, and dehydration.',
      'Every product is tagged by concern, brand, and skin type so you can build a real routine without guesswork. No filler products. No brand loyalty. Just what works.',
    ],
    variant: 'white',
  },
  {
    num: '04',
    tag: 'Our Promise',
    title: 'Authentic formulas.\nNo exceptions.',
    body: [
      'Authenticity is not a marketing word for us — it is the only reason SkinVault exists. If a product in our shop ever turns out to be inauthentic, you get a full refund and we pull it immediately.',
      'We are not a marketplace. We are a vault. Everything inside it has been vetted.',
    ],
    variant: 'espresso',
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.eyebrow}>Our Story</span>
          <h1 className={styles.heroTitle}>
            Your skin deserves<br /><em>the real thing.</em>
          </h1>
          <p className={styles.heroPara}>
            SkinVault Beauty is Nigeria&apos;s curated source for authentic global skincare.
            We bring K-beauty, European, and US formulas you can trust — verified,
            genuine, and delivered straight to you.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.heroCta}>Shop The Vault</Link>
            <Link href="/science" className={styles.heroCtaSecondary}>Read the Science →</Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          {NUMBERS.map((n, i) => (
            <div key={n.stat} className={[styles.heroStatCard, styles[`heroStatCard${i}`]].join(' ')}>
              <span className={styles.heroStatNum}>{n.stat}</span>
              <span className={styles.heroStatLabel}>{n.label}</span>
              <span className={styles.heroStatNote}>{n.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Manifesto band ── */}
      <div className={styles.manifesto}>
        <span className={styles.manifestoEye}>The Vault Philosophy</span>
        <blockquote className={styles.manifestoQuote}>
          &ldquo;We would rather have an empty shelf than a fake one.&rdquo;
        </blockquote>
      </div>

      {/* ── Chapter cards ── */}
      <section className={styles.chapters}>
        {CHAPTERS.map((ch) => (
          <div key={ch.num} className={[styles.chapter, styles[`chapter_${ch.variant}`]].join(' ')}>
            {/* Number panel */}
            <div className={styles.chapterNumPanel}>
              <span className={styles.chapterTag}>{ch.tag}</span>
              <span className={styles.chapterBigNum}>{ch.num}</span>
            </div>
            {/* Content panel */}
            <div className={styles.chapterContent}>
              <h2 className={styles.chapterTitle}>
                {ch.title.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < ch.title.split('\n').length - 1 && <br />}</span>
                ))}
              </h2>
              {ch.body.map((p, i) => (
                <p key={i} className={styles.chapterBody}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Brands dual marquee ── */}
      <section className={styles.brands}>
        <div className={styles.brandsHead}>
          <span className={styles.eyebrowLight}>Brands in The Vault</span>
          <Link href="/shop" className={styles.brandsViewAll}>Browse all products →</Link>
        </div>

        {/* Row 1 — scroll left */}
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[...BRANDS_ROW1, ...BRANDS_ROW1].map((b, i) => (
              <span key={i} className={styles.brandName}>
                {b}
                <span className={styles.brandSep} aria-hidden="true">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — scroll right */}
        <div className={styles.marqueeWrap}>
          <div className={[styles.marqueeTrack, styles.marqueeReverse].join(' ')}>
            {[...BRANDS_ROW2, ...BRANDS_ROW2].map((b, i) => (
              <span key={i} className={styles.brandName}>
                {b}
                <span className={styles.brandSep} aria-hidden="true">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className={styles.closing}>
        <span className={styles.closingEye}>A vault, not a marketplace.</span>
        <h2 className={styles.closingTitle}>
          Everything inside<br /><em>has been vetted.</em>
        </h2>
        <Link href="/shop" className={styles.closingCta}>
          Enter The Vault
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </section>

    </div>
  );
}
