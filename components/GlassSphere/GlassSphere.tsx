'use client';

import { useEffect, useRef, useCallback } from 'react';
import { SphereRenderer, isWebGLAvailable } from '@/lib/SphereRenderer';

interface GlassSphereProps {
  id?: string;
  className?: string;
  color1?: string;
  color2?: string;
  onReady?: (sphere: SphereRenderer) => void;
}

export default function GlassSphere({ id, className, color1, color2, onReady }: GlassSphereProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SphereRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!rendererRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rendererRef.current.setHover(Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy)) * 0.6);
  }, []);

  useEffect(() => {
    if (!isWebGLAvailable()) return;

    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;

    let sphere: SphereRenderer | null = null;
    try {
      sphere = new SphereRenderer(canvas, { color1, color2 });
      rendererRef.current = sphere;
      sphere.start();
      onReady?.(sphere);
    } catch {
      return;
    }

    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      sphere?.resize(canvas.width, canvas.height);
    });
    ro.observe(container);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      sphere?.dispose();
      ro.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color1, color2, onReady, handleMouseMove]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <canvas ref={canvasRef} id={id} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
