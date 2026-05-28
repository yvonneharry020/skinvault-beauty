'use client';

import dynamic from 'next/dynamic';
import styles from './science.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

const INGREDIENTS = [
  { name: 'PDRN Complex', role: 'DNA Repair & Cellular Regeneration', detail: 'Polydeoxyribonucleotide — a bioactive that activates A2A receptors to accelerate skin repair at a cellular level.' },
  { name: 'Peptide Matrix', role: 'Collagen Stimulation', detail: 'A 9-peptide complex signaling fibroblasts to produce collagen I, III, and elastin — rebuilding skin architecture from within.' },
  { name: 'Ceramide 1,3,6-II', role: 'Barrier Reconstruction', detail: 'Three ceramide fractions matching the skin\'s natural ratio. Clinically proven to restore barrier function in 7 days.' },
  { name: 'Niacinamide B3', role: 'Brightening & Pore Refinement', detail: '5% stabilised niacinamide inhibits melanosome transfer, visibly reducing hyperpigmentation and pore appearance.' },
];

export default function SciencePage() {
  return (
    <div className={styles.page}>

      {/* Hero with decorative sphere */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>The Science of Skin Fitness</span>
          <h1 className={styles.heroTitle}>
            Formulas backed by<br /><em>peer-reviewed research</em>
          </h1>
        </div>
        <GlassSphere
          id="science-bubble-right"
          className={styles.heroSphere}
          color1="#b8c8d8"
          color2="#d8e4f0"
        />
      </section>

      {/* Ingredients deep-dive */}
      <section className={styles.ingredients}>
        <div className={styles.ingredientsHeader}>
          <h2 className={styles.sectionTitle}>Key Actives</h2>
          <p className={styles.sectionSub}>We only include an ingredient when the evidence demands it.</p>
        </div>

        <div className={styles.ingredientGrid}>
          {INGREDIENTS.map((ing, i) => (
            <div key={ing.name} className={styles.ingredientCard}>
              <div className={styles.cardNum}>0{i + 1}</div>
              <h3 className={styles.ingName}>{ing.name}</h3>
              <span className={styles.ingRole}>{ing.role}</span>
              <p className={styles.ingDetail}>{ing.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PDRN section with wide sphere — matches beautyinstem PDRN bubble */}
      <section className={styles.pdrnSection}>
        <GlassSphere
          id="science-pdrn-bubble"
          className={styles.pdrnSphere}
          color1="#c8d8b8"
          color2="#e0ecd4"
        />
        <div className={styles.pdrnText}>
          <span className={styles.eyebrow}>Proprietary Complex</span>
          <h2 className={styles.pdrnTitle}>The PDRN<br />Advantage</h2>
          <p className={styles.pdrnBody}>
            Derived from salmon DNA, our pharmaceutical-grade PDRN activates the A2A receptor
            pathway — the same mechanism used in clinical wound healing. The result: accelerated
            cellular turnover, reduced inflammation, and measurably denser skin in 4 weeks.
          </p>
        </div>
      </section>

    </div>
  );
}
