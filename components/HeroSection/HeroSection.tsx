'use client';

import Link from 'next/link';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.headline}>
          <span className={styles.line}>Vault-Strength</span>
          <span className={styles.line}>Formulas for</span>
          <span className={styles.lineAccent}>Radiant Skin</span>
        </h1>
        <p className={styles.sub}>
          Science-backed beauty. Engineered to perform.
        </p>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.btnPrimary}>SHOP NOW</Link>
          <Link href="/science" className={styles.btnSecondary}>OUR SCIENCE</Link>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span>SCROLL DOWN</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
