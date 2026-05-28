interface Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  phaseSpeed: number;
  wobbleMag: number;
  hue: number;
  bursting: boolean;
  burstR: number;
  burstAlpha: number;
}

export class WaterBubbleRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bubbles: Bubble[] = [];
  private animFrameId: number | null = null;
  private elapsed = 0;
  private lastTime = 0;
  private maxLive: number;

  constructor(canvas: HTMLCanvasElement, maxBubbles = 10) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.maxLive = maxBubbles;
    this.seedBubbles();
  }

  private makeBubble(fromBottom = true): Bubble {
    const r = 28 + Math.random() * 90;
    const x = r + Math.random() * Math.max(this.canvas.width - r * 2, r);
    const y = fromBottom
      ? this.canvas.height + r
      : r + Math.random() * (this.canvas.height - r * 2);
    return {
      x, y, r,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.28 + Math.random() * 0.42),
      alpha: 0.72 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.45 + Math.random() * 0.9,
      wobbleMag: 0.04 + Math.random() * 0.05,
      hue: 26 + Math.random() * 18,
      bursting: false,
      burstR: 0,
      burstAlpha: 0,
    };
  }

  private seedBubbles() {
    for (let i = 0; i < this.maxLive; i++) {
      this.bubbles.push(this.makeBubble(false));
    }
  }

  private drawBubble(b: Bubble, t: number) {
    const ctx = this.ctx;
    const wx = Math.sin(t * b.phaseSpeed + b.phase) * b.r * b.wobbleMag;
    const wy = Math.cos(t * b.phaseSpeed * 0.7 + b.phase + 1) * b.r * b.wobbleMag * 0.6;
    const cx = b.x + wx;
    const cy = b.y + wy;

    ctx.save();
    ctx.globalAlpha = b.alpha;

    /* ── Body gradient ── */
    const bodyGrad = ctx.createRadialGradient(
      cx - b.r * 0.28, cy - b.r * 0.28, 0,
      cx, cy, b.r,
    );
    bodyGrad.addColorStop(0,   `hsla(${b.hue}, 45%, 90%, 0.22)`);
    bodyGrad.addColorStop(0.45, `hsla(${b.hue}, 38%, 78%, 0.10)`);
    bodyGrad.addColorStop(0.80, `hsla(${b.hue}, 32%, 65%, 0.07)`);
    bodyGrad.addColorStop(1,    `hsla(${b.hue}, 40%, 55%, 0.22)`);

    ctx.beginPath();
    ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    /* ── Rim ── */
    ctx.strokeStyle = `hsla(${b.hue}, 30%, 88%, 0.55)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* ── Highlight ── inside clip ── */
    ctx.beginPath();
    ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
    ctx.clip();

    const hiGrad = ctx.createRadialGradient(
      cx - b.r * 0.32, cy - b.r * 0.32, 0,
      cx - b.r * 0.32, cy - b.r * 0.32, b.r * 0.52,
    );
    hiGrad.addColorStop(0, 'rgba(255,255,255,0.72)');
    hiGrad.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    hiGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hiGrad;
    ctx.fillRect(cx - b.r, cy - b.r, b.r * 2, b.r * 2);

    /* ── Bottom sheen ── */
    const sheen = ctx.createRadialGradient(
      cx + b.r * 0.2, cy + b.r * 0.55, 0,
      cx + b.r * 0.2, cy + b.r * 0.55, b.r * 0.38,
    );
    sheen.addColorStop(0, `hsla(${b.hue + 8}, 50%, 82%, 0.32)`);
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(cx - b.r, cy - b.r, b.r * 2, b.r * 2);

    ctx.restore();
  }

  private drawBurst(b: Bubble) {
    const ctx = this.ctx;
    ctx.save();

    /* Expanding ring */
    ctx.globalAlpha = b.burstAlpha * 0.55;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.burstR, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${b.hue}, 35%, 75%, ${b.burstAlpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Inner ring */
    ctx.globalAlpha = b.burstAlpha * 0.35;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.burstR * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${b.burstAlpha * 0.4})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  start() {
    this.lastTime = performance.now();
    const loop = (now: number) => {
      this.animFrameId = requestAnimationFrame(loop);
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.elapsed += dt;
      this.lastTime = now;
      this.tick();
    };
    requestAnimationFrame(loop);
  }

  private tick() {
    const { ctx, canvas } = this;
    const t = this.elapsed;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let live = 0;
    this.bubbles = this.bubbles.filter(b => {
      if (b.bursting) {
        b.burstR += 2.8;
        b.burstAlpha -= 0.038;
        if (b.burstAlpha <= 0) return false;
        this.drawBurst(b);
        return true;
      }

      b.x  += b.vx;
      b.y  += b.vy;
      b.vx += (Math.random() - 0.5) * 0.018;
      b.vx *= 0.98;

      /* Keep within horizontal bounds softly */
      if (b.x < b.r)            b.vx += 0.08;
      if (b.x > canvas.width - b.r) b.vx -= 0.08;

      if (b.y < -b.r) {
        b.bursting  = true;
        b.burstR    = b.r;
        b.burstAlpha = 1;
        return true;
      }

      this.drawBubble(b, t);
      live++;
      return true;
    });

    if (live < this.maxLive) {
      this.bubbles.push(this.makeBubble(true));
    }
  }

  resize(w: number, h: number) {
    this.canvas.width  = w;
    this.canvas.height = h;
  }

  dispose() {
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
  }
}
