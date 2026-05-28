'use client';

import { useEffect, useRef, useCallback } from 'react';
import { SphereRenderer, isWebGLAvailable } from '@/lib/SphereRenderer';

interface GlassSphereProps {
  id?: string;
  className?: string;
  /**
   * Starting alpha (0 = hidden, 1 = fully visible).
   * When omitted the sphere starts hidden (0) and auto-reveals
   * via IntersectionObserver — the dissolve-sweep in the shader
   * creates the reveal animation.
   * Pass `1` to skip the reveal (e.g. if the sphere is already in view on load).
   * Pass `0` + onReady to control the reveal yourself (PageLoader).
   */
  initialAlpha?: number;
  onReady?: (sphere: SphereRenderer) => void;
}

export default function GlassSphere({
  id,
  className,
  initialAlpha,
  onReady,
}: GlassSphereProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<SphereRenderer | null>(null);

  /* Spring-like hover: distance from center drives intensity */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!rendererRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rendererRef.current.setHover(Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy)) * 0.65);
  }, []);

  useEffect(() => {
    if (!isWebGLAvailable()) return;

    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const { width, height } = container.getBoundingClientRect();
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /*
     * Alpha strategy:
     *  • If caller passes initialAlpha explicitly, use that.
     *  • Otherwise:
     *    - reduced-motion: start at 1 (no animation)
     *    - normal: start at 0 and auto-reveal via IntersectionObserver
     */
    const startAlpha = initialAlpha !== undefined
      ? initialAlpha
      : prefersReducedMotion ? 1 : 0;

    let sphere: SphereRenderer | null = null;
    try {
      sphere = new SphereRenderer(canvas, { initialAlpha: startAlpha });
      rendererRef.current = sphere;
      sphere.start();
      onReady?.(sphere);
    } catch {
      return;
    }

    /*
     * Auto scroll-reveal — only when:
     *  1. No onReady provided (caller isn't taking manual control)
     *  2. Not prefers-reduced-motion
     *  3. Started hidden (startAlpha < 1)
     *
     * The fragment shader's dissolve mask sweeps the sphere into view
     * as alpha lerps from 0 → 1. Emil principle: nothing should snap in.
     */
    let observer: IntersectionObserver | null = null;
    if (!onReady && !prefersReducedMotion && startAlpha < 1) {
      let revealed = false;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !revealed) {
              revealed = true;
              sphere?.setState({ alpha: 1 });
              observer?.disconnect();
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
      );
      observer.observe(container);
    }

    /* Resize */
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
      observer?.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [initialAlpha, onReady, handleMouseMove]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        id={id}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
