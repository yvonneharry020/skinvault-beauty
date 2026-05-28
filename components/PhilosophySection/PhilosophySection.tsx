'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import styles from './PhilosophySection.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  { title: 'PROTECT',  desc: 'your skin with verified, authentic formulas only' },
  { title: 'RESTORE',  desc: 'your confidence in skincare that actually works' },
  { title: 'MAINTAIN', desc: 'a zero-fake standard — every brand, every bottle' },
];

export default function PhilosophySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = pillarsRef.current?.querySelectorAll('[data-pillar]');
    if (!items) return;

    items.forEach((el, i) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.textSide}>
        <span className={styles.eyebrow}>our philosophy</span>
        <h2 className={styles.heading}>
          Skincare backed by<br />
          <em>real ingredients</em>
        </h2>
        <p className={styles.body}>
          Every product in The Vault is chosen with one question:
          does the science back it? No fillers, no fakes, no compromises.
          Just ingredients that work — from brands you can trust.
        </p>

        <div ref={pillarsRef} className={styles.pillars}>
          {PILLARS.map(({ title, desc }) => (
            <div key={title} data-pillar className={styles.pillar}>
              <strong className={styles.pillarTitle}>{title}</strong>
              <span className={styles.pillarDesc}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sphereWrap}>
        <GlassSphere
          id="sphere-canvas-1"
          className={styles.sphere}
          color1="#c8a882"
          color2="#e8d5c4"
        />

        {/* SVG annotation lines — like beautyinstem */}
        <div className={styles.annotation} data-side="right">
          <strong>VAULT-GRADE</strong>
          <span>actives concentration</span>
        </div>
        <div className={styles.annotation} data-side="left">
          <strong>CLINICAL</strong>
          <span>efficacy tested</span>
        </div>
      </div>
    </section>
  );
}
