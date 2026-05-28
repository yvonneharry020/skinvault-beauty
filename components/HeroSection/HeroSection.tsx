'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SphereRenderer } from '@/lib/SphereRenderer';
import styles from './HeroSection.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

export default function HeroSection() {
  const sphereRef = useRef<SphereRenderer | null>(null);

  useEffect(() => {
    /* Sync with PageLoader: loader takes ~2s to fully fade.
       Hero sphere starts hidden (initialAlpha=0) and dissolves in after. */
    const timer = setTimeout(() => {
      sphereRef.current?.setState({ alpha: 1 });
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.hero}>

      {/* ── Text side ─────────────────────────────────────────────── */}
      <div className={styles.content}>
        <span className={styles.eyebrow}>100% Authentic · Nigeria&apos;s Vault</span>
        <h1 className={styles.headline}>
          <span className={styles.line}>Authentic</span>
          <span className={styles.line}>Skincare for</span>
          <span className={styles.lineAccent}>Radiant Skin</span>
        </h1>
        <p className={styles.sub}>
          63 genuine products. 34 global brands. Delivered to your door.
        </p>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.btnPrimary}>SHOP THE VAULT</Link>
          <Link href="/science" className={styles.btnSecondary}>THE INGREDIENTS</Link>
        </div>
      </div>

      {/* ── 3D sphere ─────────────────────────────────────────────── */}
      <div className={styles.sphereWrap}>
        <GlassSphere
          id="hero-sphere"
          className={styles.sphere}
          color1="#d4a882"
          color2="#e8c5a8"
          initialAlpha={0}
          onReady={(s) => { sphereRef.current = s; }}
        />
        {/* Floating label annotations */}
        <div className={styles.annotRight}>
          <strong>34 BRANDS</strong>
          <span>globally trusted</span>
        </div>
        <div className={styles.annotLeft}>
          <strong>100% AUTHENTIC</strong>
          <span>verified always</span>
        </div>
      </div>

      {/* ── Scroll hint ───────────────────────────────────────────── */}
      <div className={styles.scrollHint}>
        <span>SCROLL DOWN</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
