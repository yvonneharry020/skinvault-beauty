'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './HeroSection.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

export default function HeroSection() {
  return (
    <section className={styles.hero}>

      {/* ── Decorative 3D glass sphere — right-side backdrop ────────── */}
      <GlassSphere className={styles.bgSphere} initialAlpha={1} />

      {/* ── Soft gradient overlay — keeps text legible ─────────────── */}
      <div className={styles.overlay} />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className={styles.content}>
        <span className={styles.eyebrow}>100% Authentic · Nigeria&apos;s Vault</span>

        <h1 className={styles.headline}>
          <span className={styles.line}>Authentic Skincare</span>
          <span className={styles.lineAccent}>for Radiant Skin</span>
        </h1>

        <p className={styles.sub}>
          63 genuine products. 34 global brands. Delivered to your door.
        </p>

        <div className={styles.actions}>
          <Link href="/shop" className={styles.btnPrimary}>SHOP THE VAULT</Link>
          <Link href="/science" className={styles.btnSecondary}>THE INGREDIENTS</Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>63</strong>
            <span>products</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>34</strong>
            <span>global brands</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>100%</strong>
            <span>authentic</span>
          </div>
        </div>
      </div>

      {/* ── Scroll hint ─────────────────────────────────────────────── */}
      <div className={styles.scrollHint}>
        <span>SCROLL DOWN</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
