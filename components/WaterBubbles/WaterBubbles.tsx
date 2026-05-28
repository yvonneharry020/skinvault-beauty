'use client';

import { useEffect, useRef } from 'react';
import { WaterBubbleRenderer } from '@/lib/WaterBubbleRenderer';
import styles from './WaterBubbles.module.css';

interface Props {
  className?: string;
  maxBubbles?: number;
}

export default function WaterBubbles({ className, maxBubbles = 10 }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<WaterBubbleRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;

    const renderer = new WaterBubbleRenderer(canvas, maxBubbles);
    rendererRef.current = renderer;
    renderer.start();

    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      renderer.resize(w * dpr, h * dpr);
    });
    ro.observe(wrap);

    return () => {
      renderer.dispose();
      ro.disconnect();
    };
  }, [maxBubbles]);

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className ?? ''}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
