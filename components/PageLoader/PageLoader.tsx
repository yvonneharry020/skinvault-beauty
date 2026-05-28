'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { SphereRenderer } from '@/lib/SphereRenderer';
import styles from './PageLoader.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const sphereRef = useRef<SphereRenderer | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.loader}>
      <GlassSphere
        className={styles.bubbles}
        initialAlpha={0}
        onReady={(sphere) => {
          sphereRef.current = sphere;
          sphere.setState({ alpha: 1 });
        }}
      />
      <div className={styles.brand}>SKINVAULT</div>
    </div>
  );
}
