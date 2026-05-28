import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────────────
   VERTEX SHADER
   Organic water-bubble wobble via 4 overlapping sine-wave layers.
   Hover deformation (uHover) adds a subtle radial pulse.
───────────────────────────────────────────────────────────────────────────── */
const vertexShader = /* glsl */`
  uniform float uTime;
  uniform float uHover;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;

  void main() {
    /* ── Four-layer organic wobble ── */
    float w1 = sin(position.x * 2.4 + uTime * 0.90) * sin(position.y * 1.8 + uTime * 0.70);
    float w2 = sin(position.y * 2.1 - uTime * 0.60) * sin(position.z * 2.7 + uTime * 0.50);
    float w3 = sin(position.z * 1.6 + uTime * 0.80) * sin(position.x * 2.3 - uTime * 0.40);
    float w4 = sin(position.x * 0.9 + uTime * 0.30) * sin(position.y * 1.1 - uTime * 0.25) * 0.8;
    float wobble = (w1 + w2 * 0.7 + w3 * 0.5 + w4 * 0.4) * 0.052;

    /* ── Hover: subtle radial pulse ── */
    float hoverPulse = uHover * 0.04 * sin(uTime * 2.8);
    float totalDisplace = wobble + hoverPulse;

    vec3 displaced = position + normal * totalDisplace;

    vec4 mvPosition  = modelViewMatrix * vec4(displaced, 1.0);
    vNormal          = normalize(normalMatrix * normal);
    vViewDir         = normalize(-mvPosition.xyz);
    vViewPos         = mvPosition.xyz;
    vWorldNormal     = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition        = position;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   FRAGMENT SHADER
   Thin-film iridescence + chromatic aberration refraction + band/ring lines
   + Fresnel rim + 3 animated specular lights + dissolve reveal.
───────────────────────────────────────────────────────────────────────────── */
const fragmentShader = /* glsl */`
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;

  uniform float uTime;
  uniform float uAlpha;
  uniform float uHover;
  uniform samplerCube uHdri;

  /* ── Blinn-Phong specular ── */
  float specular(vec3 n, vec3 v, vec3 l, float power) {
    vec3 h = normalize(v + l);
    return pow(max(dot(n, h), 0.0), power);
  }

  /* ── Smooth band ring — creates concentric visible lines ── */
  float band(float value, float center, float width) {
    return 1.0 - smoothstep(width * 0.45, width, abs(value - center));
  }

  /* ── Full-spectrum iridescence — visible on any background ── */
  vec3 iridescence(float fresnel, float time) {
    float phase = fresnel * 7.5 + time * 0.22;
    vec3 cyan    = vec3(0.08, 0.88, 0.98);
    vec3 magenta = vec3(0.98, 0.12, 0.78);
    vec3 gold    = vec3(0.98, 0.82, 0.18);
    vec3 violet  = vec3(0.52, 0.15, 1.00);
    vec3 rose    = vec3(1.00, 0.35, 0.60);
    vec3 ice     = vec3(0.55, 0.90, 1.00);

    float t1 = 0.5 + 0.5 * sin(phase);
    float t2 = 0.5 + 0.5 * sin(phase + 2.094);
    float t3 = 0.5 + 0.5 * sin(phase + 4.189);
    float t4 = 0.5 + 0.5 * sin(phase + 1.047);

    vec3 ab = mix(cyan, magenta, t1);
    vec3 cd = mix(gold, violet, t2);
    vec3 ef = mix(rose, ice, t3);
    return mix(mix(ab, cd, t2), ef, t4 * 0.5);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);

    /* ── Fresnel ── */
    float ndv     = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 1.55);
    float rim     = smoothstep(0.03, 0.82, fresnel);

    /* ── Band / ring lines — wide, visible soap-bubble rings ── */
    float outerLine = band(fresnel, 0.82, 0.14) * 0.75;
    float innerLine = band(fresnel, 0.56, 0.12) * 0.55;
    float midLine   = band(fresnel, 0.70, 0.08) * 0.32;
    float coreGlow  = band(fresnel, 0.30, 0.28) * 0.20;

    /* ── Three specular lights; L3 animates ── */
    vec3 l1 = normalize(vec3(-0.55,  0.82, 0.75));
    vec3 l2 = normalize(vec3( 0.65, -0.24, 0.86));
    vec3 l3 = normalize(vec3(-0.18 + sin(uTime * 0.35) * 0.10, 0.30, 0.94));
    vec3 l4 = normalize(vec3( 0.40 + cos(uTime * 0.22) * 0.08, -0.60, 0.70));

    float s1   = specular(n, v, l1, 95.0)  * 1.35;
    float s2   = specular(n, v, l2, 42.0)  * 0.28;
    float s3   = specular(n, v, l3, 240.0) * 1.10;
    float s4   = specular(n, v, l4, 60.0)  * 0.45;
    float spec = s1 + s2 + s3 + s4;

    /* ── Chromatic aberration: separate R/G/B refraction ── */
    float iorBase = 0.75;
    vec3 refR = refract(-v, n, iorBase - 0.028);
    vec3 refG = refract(-v, n, iorBase);
    vec3 refB = refract(-v, n, iorBase + 0.028);

    float envR = length(refR) > 0.001 ? textureCube(uHdri, refR).r : textureCube(uHdri, n).r;
    float envG = length(refG) > 0.001 ? textureCube(uHdri, refG).g : textureCube(uHdri, n).g;
    float envB = length(refB) > 0.001 ? textureCube(uHdri, refB).b : textureCube(uHdri, n).b;

    vec3 envRefract = vec3(envR, envG, envB);
    /* Boost refraction contrast for visible lensing */
    envRefract = clamp((envRefract - 0.06) * 1.5 + 0.52, 0.0, 1.0);

    /* ── Standard environment reflection ── */
    vec3 reflectDir  = reflect(-v, n);
    vec3 envReflect  = textureCube(uHdri, reflectDir).rgb;

    /* ── Blend: refraction at center, reflection at rim ── */
    vec3 envMix = mix(envRefract, envReflect, fresnel * 0.60);

    /* ── Thin-film iridescent tint ── */
    vec3 iriColor = iridescence(fresnel, uTime);

    /* ── Hover shimmer ── */
    float hoverGlow = uHover * 0.18 * rim;

    /* ── Color composite:
          env map base + full-spectrum iridescent rim + specular + hover ── */
    vec3 col = envMix * 0.50
             + iriColor * rim * 1.80
             + iriColor * (outerLine + innerLine) * 1.20
             + vec3(1.0, 0.97, 1.0) * spec * 2.40
             + hoverGlow * 1.5;

    /* ── Alpha: dramatically boosted so sphere is clearly visible ── */
    float alpha = rim * 0.52
                + outerLine * 0.82
                + innerLine * 0.58
                + midLine   * 0.35
                + coreGlow  * 0.18
                + spec      * 0.18;

    /* ── Dissolve / reveal driven by uAlpha ── */
    float dissolveEdge = (1.0 - uAlpha) * 1.8 - 0.5;
    float dissolveMask = smoothstep(dissolveEdge, dissolveEdge + 0.4, fresnel);
    alpha = clamp(alpha * dissolveMask, 0.0, 0.95);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ─────────────────────────────────────────────────────────────────────────── */

export interface SphereState {
  x?: number;
  y?: number;
  scale?: number;
  alpha?: number;
}

interface Ball {
  mesh: THREE.Mesh;
  originalPosition: THREE.Vector3;
  orbitSpeed: number;
  orbitOffset: number;
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */

export class SphereRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private material: THREE.ShaderMaterial;
  private sphereMesh: THREE.Mesh;
  private elapsed  = 0;
  private lastTime = performance.now();
  private balls: Ball[] = [];
  private ballGroup: THREE.Group;
  private animFrameId: number | null = null;
  private state:       SphereState;
  private targetState: SphereState;

  constructor(
    canvas: HTMLCanvasElement,
    options: { initialAlpha?: number } = {}
  ) {
    const initAlpha = options.initialAlpha ?? 1;

    this.state       = { x: 0, y: 0, scale: 1, alpha: initAlpha };
    this.targetState = { x: 0, y: 0, scale: 1, alpha: initAlpha };

    /* ── Renderer ── */
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping      = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, canvas.width / canvas.height, 0.1, 100);
    this.camera.position.z = 8.0;

    const envMap = this.buildCubemap();

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:  { value: 0 },
        uAlpha: { value: initAlpha },
        uHover: { value: 0 },
        uHdri:  { value: envMap },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });

    /* ── Main sphere: radius 1.8, 80 subdivisions ── */
    const geometry = new THREE.IcosahedronGeometry(1.8, 80);
    this.sphereMesh = new THREE.Mesh(geometry, this.material);
    this.sphereMesh.renderOrder = 2;
    this.scene.add(this.sphereMesh);

    this.ballGroup = new THREE.Group();
    this.scene.add(this.ballGroup);
    this.addParticleRings();

    this.resize(canvas.width, canvas.height);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     COLORFUL CUBEMAP
     6 faces span the iridescent palette: warm pearl, lavender, sky-blue,
     rose-pink, soft violet, and bright white — giving the sphere a rich
     environment to reflect/refract from all angles.
  ───────────────────────────────────────────────────────────────────────── */
  private buildCubemap(): THREE.CubeTexture {
    const size = 256;

    type Face = { base: [number,number,number]; hi: [number,number,number]; hiAlpha: number };

    const faces: Face[] = [
      { base: [255,  60, 180], hi: [255,  20, 150], hiAlpha: 0.95 }, // +X: hot magenta
      { base: [ 20, 200, 255], hi: [  0, 230, 255], hiAlpha: 0.90 }, // -X: electric cyan
      { base: [255, 230,  40], hi: [255, 255,   0], hiAlpha: 0.92 }, // +Y: vivid gold
      { base: [140,  40, 255], hi: [100,   0, 255], hiAlpha: 0.85 }, // -Y: deep violet
      { base: [ 50, 255, 180], hi: [  0, 255, 160], hiAlpha: 0.88 }, // +Z: neon mint
      { base: [255, 120,  60], hi: [255,  80,  20], hiAlpha: 0.80 }, // -Z: vivid coral
    ];

    const urls = faces.map(({ base: [r,g,b], hi: [hr,hg,hb], hiAlpha }) => {
      const c   = document.createElement('canvas');
      c.width   = size;
      c.height  = size;
      const ctx = c.getContext('2d')!;

      /* Radial gradient base */
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.9);
      grad.addColorStop(0,   `rgb(${Math.min(r+22,255)},${Math.min(g+18,255)},${Math.min(b+15,255)})`);
      grad.addColorStop(0.4, `rgb(${r},${g},${b})`);
      grad.addColorStop(1,   `rgb(${Math.max(r-35,0)},${Math.max(g-30,0)},${Math.max(b-25,0)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      /* Bright highlight in upper-left corner */
      const hi = ctx.createRadialGradient(size*0.25, size*0.25, 0, size*0.25, size*0.25, size*0.55);
      hi.addColorStop(0, `rgba(${hr},${hg},${hb},${hiAlpha})`);
      hi.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
      ctx.fillStyle = hi;
      ctx.fillRect(0, 0, size, size);

      /* Subtle dark vignette corner for depth */
      const vig = ctx.createRadialGradient(size*0.75, size*0.75, 0, size*0.75, size*0.75, size*0.55);
      vig.addColorStop(0, 'rgba(30,20,40,0.22)');
      vig.addColorStop(1, 'rgba(30,20,40,0)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, size, size);

      return c.toDataURL();
    });

    return new THREE.CubeTextureLoader().load(urls);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     PARTICLE RINGS
     Three concentric rings of orbiting micro-bubbles — rose-gold, lavender,
     and icy-blue — giving the sphere depth and visual interest.
  ───────────────────────────────────────────────────────────────────────── */
  private addParticle(x: number, y: number, z: number, size: number, color: number, opacity: number) {
    const geo  = new THREE.SphereGeometry(size, 6, 6);
    const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.balls.push({
      mesh,
      originalPosition: new THREE.Vector3(x, y, z),
      orbitSpeed:  0.14 + Math.random() * 0.16,
      orbitOffset: Math.random() * Math.PI * 2,
    });
    this.ballGroup.add(mesh);
  }

  private addParticleRings() {
    /* Inner ring — rose gold */
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      this.addParticle(Math.cos(a)*0.62, Math.sin(a)*0.62*0.88, Math.sin(a)*0.62*0.45, 0.024, 0xd4a0b0, 0.38);
    }
    /* Middle ring — lavender */
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2;
      const tilt = Math.PI / 3.2;
      this.addParticle(Math.cos(a)*1.02, Math.sin(a)*1.02*Math.cos(tilt), Math.sin(a)*1.02*Math.sin(tilt), 0.019, 0xb0a0d8, 0.32);
    }
    /* Outer ring — periwinkle blue */
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      const tilt = Math.PI / 1.6;
      this.addParticle(Math.cos(a)*1.42, Math.sin(a)*1.42*Math.cos(tilt), Math.sin(a)*1.42*Math.sin(tilt), 0.015, 0xa8c0e0, 0.25);
    }
    /* Accent particles — scattered larger beads */
    const accents: [number,number,number,number][] = [
      [0.85, 0.35, 0.20, 0xd4a882],
      [-0.65, -0.42, 0.32, 0xc0a8d0],
      [0.22, 0.95, -0.18, 0xa8bce0],
      [-0.32, -0.85, 0.42, 0xd0a8c0],
      [0.52, -0.65, 0.30, 0xb8c4e8],
      [-0.48, 0.72, -0.35, 0xd8b0c0],
    ];
    accents.forEach(([x,y,z,col]) => this.addParticle(x, y, z, 0.045, col, 0.42));
  }

  /* ── Public API ── */
  setState(s: Partial<SphereState>)  { Object.assign(this.targetState, s); }
  setHover(v: number)                 { this.material.uniforms.uHover.value = v; }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  start() {
    this.lastTime = performance.now();
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  stop() {
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
  }

  private tick() {
    const now   = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.elapsed += delta;
    this.lastTime = now;

    const t    = this.elapsed;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    this.state.x     = lerp(this.state.x     ?? 0, this.targetState.x     ?? 0, 0.055);
    this.state.y     = lerp(this.state.y     ?? 0, this.targetState.y     ?? 0, 0.055);
    this.state.scale = lerp(this.state.scale ?? 1, this.targetState.scale ?? 1, 0.055);
    this.state.alpha = lerp(this.state.alpha ?? 1, this.targetState.alpha ?? 1, 0.038);

    this.material.uniforms.uTime.value  = t;
    this.material.uniforms.uAlpha.value = this.state.alpha ?? 1;

    /* Gentle idle rotation — matches beautyinstem timing */
    this.sphereMesh.rotation.y = 0.14 * Math.sin(0.34 * t);
    this.sphereMesh.rotation.x = 0.06 * Math.sin(0.21 * t);
    this.sphereMesh.scale.setScalar(this.state.scale ?? 1);

    this.scene.position.x = (this.state.x ?? 0) * 0.8;
    this.scene.position.y = (this.state.y ?? 0) * 0.8;

    /* Orbiting particles */
    this.balls.forEach(ball => {
      const o = ball.orbitOffset + t * ball.orbitSpeed;
      ball.mesh.position.x = ball.originalPosition.x + Math.sin(o)       * 0.042;
      ball.mesh.position.y = ball.originalPosition.y + Math.cos(o * 0.7) * 0.042;
      ball.mesh.position.z = ball.originalPosition.z + Math.sin(o * 1.3) * 0.028;
    });

    this.ballGroup.rotation.y = t * 0.07;
    this.ballGroup.rotation.x = Math.sin(t * 0.11) * 0.055;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.material.dispose();
    this.sphereMesh.geometry.dispose();
    this.renderer.dispose();
  }
}
