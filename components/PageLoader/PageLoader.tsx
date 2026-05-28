'use client';

import { useEffect, useRef, useState } from 'react';
import { SphereRenderer, isWebGLAvailable } from '@/lib/SphereRenderer';
import styles from './PageLoader.module.css';

export default function PageLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SphereRenderer | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    /* Hide immediately if WebGL not supported (headless, old browser, etc.) */
    if (!isWebGLAvailable()) {
      setVisible(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth  * Math.min(window.devicePixelRatio, 2);
    canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);

    let sphere: SphereRenderer | null = null;
    try {
      sphere = new SphereRenderer(canvas, { color1: '#c8a882', color2: '#e8d5c4' });
      rendererRef.current = sphere;
      sphere.setState({ alpha: 0, scale: 1.3 });
      sphere.start();
      setTimeout(() => sphere?.setState({ alpha: 1, scale: 1 }), 100);
    } catch {
      /* WebGL init failed — skip the loader */
      setVisible(false);
      return;
    }

    const hideTimer = setTimeout(() => {
      sphere?.setState({ alpha: 0 });
      setTimeout(() => setVisible(false), 800);
    }, 1400);

    return () => {
      clearTimeout(hideTimer);
      sphere?.dispose();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.loader}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.brand}>SKINVAULT</div>
    </div>
  );
}
