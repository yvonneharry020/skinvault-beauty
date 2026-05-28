'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { SphereRenderer } from '@/lib/SphereRenderer';
import styles from './StepsSection.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '1/',
    phase: 'Cleanse',
    product: 'CLARITY FOAM CLEANSER',
    desc: 'A performance-first cleanse that purifies without stripping the barrier. Leaves skin clean, balanced, and ready for actives.',
  },
  {
    num: '2/',
    phase: 'Activate',
    product: 'VAULT RENEWAL SERUM',
    desc: 'Precision peptides that stimulate cellular renewal, boosting collagen and skin density. The cornerstone of the SkinVault ritual.',
  },
  {
    num: '3/',
    phase: 'Strengthen',
    product: 'HYDRA-SHIELD MOISTURIZER',
    desc: 'A barrier-training formula that builds long-term resilience, sealing actives in and aggressors out. All-day hydration guaranteed.',
  },
  {
    num: '4/',
    phase: 'Recover',
    product: 'DEEP REPAIR OVERNIGHT MASK',
    desc: 'Ceramide-rich night treatment that accelerates the skin repair cycle while you sleep. Wake up to visibly firmer, plumper skin.',
  },
  {
    num: '5/',
    phase: 'Target',
    product: 'EYE RECOVERY COMPLEX',
    desc: 'Multi-action formula addressing dark circles, fine lines, and loss of lash density — where skin is most delicate.',
  },
];

export default function StepsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef  = useRef<HTMLDivElement>(null);
  const sphereRef  = useRef<SphereRenderer | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll<HTMLElement>('[data-step]');

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        if (!sphereRef.current) return;
        const p = self.progress;
        const y = Math.sin(p * Math.PI) * 0.3;
        const sc = 0.9 + p * 0.2;
        sphereRef.current.setState({ y, scale: sc, travel: p });
      },
    });

    stepEls.forEach((el, i) => {
      gsap.fromTo(el,
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <span className={styles.bigNum}>5</span>
        <div>
          <h2 className={styles.title}>essential steps</h2>
          <p className={styles.sub}>that build, protect, and maintain skin performance.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sticky sphere */}
        <div className={styles.sticky} ref={stickyRef}>
          <GlassSphere
            id="sphere-canvas-2"
            className={styles.sphere}
            color1="#c8a882"
            color2="#d4c4b0"
            onReady={s => { sphereRef.current = s; }}
          />
        </div>

        {/* Scrolling steps */}
        <div className={styles.steps}>
          {STEPS.map(step => (
            <div key={step.num} data-step className={styles.step}>
              <span className={styles.stepNum}>{step.num}</span>
              <div className={styles.stepBody}>
                <h3 className={styles.stepPhase}>{step.phase}</h3>
                <h4 className={styles.stepProduct}>{step.product}</h4>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
