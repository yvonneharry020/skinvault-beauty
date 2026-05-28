import * as THREE from 'three';

/* ─── Vertex Shader — organic water-bubble wobble via overlapping sine waves ─── */
const vertexShader = /* glsl */`
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;
  varying vec3 vWorldNormal;

  void main() {
    /* ── Organic wobble: 3 overlapping sine-wave layers ── */
    float w1 = sin(position.x * 2.4 + uTime * 0.90) * sin(position.y * 1.8 + uTime * 0.70);
    float w2 = sin(position.y * 2.1 - uTime * 0.60) * sin(position.z * 2.7 + uTime * 0.50);
    float w3 = sin(position.z * 1.6 + uTime * 0.80) * sin(position.x * 2.3 - uTime * 0.40);
    /* Secondary layer — slower, larger wavelength for the breathing motion */
    float w4 = sin(position.x * 0.9 + uTime * 0.30) * sin(position.y * 1.1 - uTime * 0.25) * 0.8;

    float wobble = (w1 + w2 * 0.7 + w3 * 0.5 + w4 * 0.4) * 0.052;

    vec3 displaced = position + normal * wobble;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vNormal      = normalize(normalMatrix * normal);
    vViewDir     = normalize(-mvPosition.xyz);
    vViewPos     = mvPosition.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

/* ─── Fragment Shader — Fresnel + refraction + reflection + animated specular ─── */
const fragmentShader = /* glsl */`
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;
  varying vec3 vWorldNormal;

  uniform float uTime;
  uniform float uAlpha;
  uniform float uHover;
  uniform samplerCube uHdri;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  float specular(vec3 n, vec3 v, vec3 l, float power) {
    vec3 h = normalize(v + l);
    return pow(max(dot(n, h), 0.0), power);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);

    /* ── Fresnel — glowing rim, transparent centre ── */
    float ndv     = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 1.55);
    float rim     = smoothstep(0.03, 0.82, fresnel);

    /* ── Three specular lights; L3 oscillates with uTime ── */
    vec3 l1 = normalize(vec3(-0.55,  0.82, 0.75));
    vec3 l2 = normalize(vec3( 0.65, -0.24, 0.86));
    vec3 l3 = normalize(vec3(-0.18 + sin(uTime * 0.35) * 0.08, 0.30, 0.94));

    float s1   = specular(n, v, l1, 72.0) * 0.85;
    float s2   = specular(n, v, l2, 30.0) * 0.14;
    float s3   = specular(n, v, l3, 180.0) * 0.62;
    float spec = s1 + s2 + s3;

    /* ── Environment reflection ── */
    vec3 reflectDir  = reflect(-v, n);
    vec3 envReflect  = textureCube(uHdri, reflectDir).rgb;

    /* ── Refraction — IOR 0.75, slight normal perturbation for water lensing ── */
    vec3 refractDir = refract(-v, n, 0.75);
    vec3 refractSample = length(refractDir) > 0.001
      ? normalize(refractDir + n * 0.18)
      : n;
    vec3 envRefract = textureCube(uHdri, refractSample).rgb;
    /* Boost contrast on refraction to make lensing visible */
    envRefract = clamp((envRefract - 0.08) * 1.4 + 0.50, 0.0, 1.0);

    /* ── Blend: refraction at centre, reflection at rim ── */
    vec3 envMix = mix(envRefract, envReflect, fresnel * 0.55);

    /* ── Hover shimmer ── */
    float hoverGlow = uHover * 0.14 * rim;

    /* ── Brand colour tint on the rim ── */
    vec3 rimCol = mix(uColor1, uColor2, fresnel);

    /* ── Final colour composite ── */
    vec3 col = envMix * 0.42
             + rimCol * rim * 0.52
             + vec3(1.0) * spec * 0.95
             + hoverGlow;

    /* ── Alpha: near-zero at centre, peaks at rim — glass look ── */
    float alpha = 0.0001 + rim * 0.078;

    /* ── Dissolve / reveal driven by uAlpha ── */
    float dissolveEdge = (1.0 - uAlpha) * 1.8 - 0.5;
    float dissolveMask = smoothstep(dissolveEdge, dissolveEdge + 0.4, fresnel);
    alpha = clamp(alpha * dissolveMask, 0.0, 0.60);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ─── Types ─── */
export interface SphereState {
  x?: number;
  y?: number;
  scale?: number;
  travel?: number;
  pulse?: number;
  alpha?: number;
}

interface Ball {
  mesh: THREE.Mesh;
  originalPosition: THREE.Vector3;
  orbitSpeed: number;
  orbitOffset: number;
}

/* ─── WebGL check ─── */
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

/* ─── SphereRenderer ─── */
export class SphereRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private material: THREE.ShaderMaterial;
  private sphereMesh: THREE.Mesh;
  private elapsed = 0;
  private lastTime = performance.now();
  private balls: Ball[] = [];
  private ballGroup: THREE.Group;
  private animFrameId: number | null = null;
  private state: SphereState;
  private targetState: SphereState;

  constructor(
    canvas: HTMLCanvasElement,
    options: { color1?: string; color2?: string; initialAlpha?: number } = {}
  ) {
    const color1 = new THREE.Color(options.color1 ?? '#c8a882');
    const color2 = new THREE.Color(options.color2 ?? '#e8d5c4');
    const initAlpha = options.initialAlpha ?? 1;

    this.state       = { x: 0, y: 0, scale: 1, alpha: initAlpha };
    this.targetState = { x: 0, y: 0, scale: 1, alpha: initAlpha };

    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, canvas.width / canvas.height, 0.1, 100);
    this.camera.position.z = 5.2;

    const envMap = this.buildCubemap();

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:   { value: 0 },
        uAlpha:  { value: initAlpha },
        uHover:  { value: 0 },
        uHdri:   { value: envMap },
        uColor1: { value: color1 },
        uColor2: { value: color2 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });

    const geometry = new THREE.IcosahedronGeometry(1.5, 80);
    this.sphereMesh = new THREE.Mesh(geometry, this.material);
    this.sphereMesh.renderOrder = 2;
    this.scene.add(this.sphereMesh);

    this.ballGroup = new THREE.Group();
    this.scene.add(this.ballGroup);
    this.addDefaultRings();

    this.resize(canvas.width, canvas.height);
  }

  /* ── Build warm rose-gold cubemap environment ── */
  private buildCubemap(): THREE.CubeTexture {
    const size = 128;
    /* Each face of the cubemap gets a subtly different warm tone */
    const dirs = [
      { r: 252, g: 238, b: 224 }, /* +X: warm peach */
      { r: 238, g: 224, b: 212 }, /* -X: warm sand */
      { r: 255, g: 248, b: 238 }, /* +Y: bright warm white */
      { r: 222, g: 210, b: 198 }, /* -Y: warm taupe */
      { r: 248, g: 234, b: 220 }, /* +Z: warm blush */
      { r: 242, g: 228, b: 215 }, /* -Z: rose warm */
    ];

    const urls: string[] = dirs.map(({ r, g, b }, i) => {
      const c   = document.createElement('canvas');
      c.width   = size;
      c.height  = size;
      const ctx = c.getContext('2d')!;

      /* Radial gradient base */
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.85);
      grad.addColorStop(0, `rgb(${Math.min(r + 18, 255)},${Math.min(g + 14, 255)},${Math.min(b + 10, 255)})`);
      grad.addColorStop(0.5, `rgb(${r},${g},${b})`);
      grad.addColorStop(1, `rgb(${Math.max(r - 28, 0)},${Math.max(g - 25, 0)},${Math.max(b - 20, 0)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      /* Warm highlight on top-front faces */
      if (i === 0 || i === 2) {
        const hi = ctx.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.3, size * 0.3, size * 0.52);
        hi.addColorStop(0, 'rgba(255,228,200,0.65)');
        hi.addColorStop(1, 'rgba(255,228,200,0)');
        ctx.fillStyle = hi;
        ctx.fillRect(0, 0, size, size);
      }
      /* Cool accent on bottom-back for contrast */
      if (i === 3 || i === 5) {
        const cool = ctx.createRadialGradient(size * 0.7, size * 0.7, 0, size * 0.7, size * 0.7, size * 0.45);
        cool.addColorStop(0, 'rgba(200,188,210,0.35)');
        cool.addColorStop(1, 'rgba(200,188,210,0)');
        ctx.fillStyle = cool;
        ctx.fillRect(0, 0, size, size);
      }

      return c.toDataURL();
    });

    return new THREE.CubeTextureLoader().load(urls);
  }

  /* ── Orbiting micro-bubble particles ── */
  private addBall(x: number, y: number, z: number, size: number, color: number) {
    const geo  = new THREE.SphereGeometry(size, 6, 6);
    const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.balls.push({
      mesh,
      originalPosition: new THREE.Vector3(x, y, z),
      orbitSpeed:  0.16 + Math.random() * 0.14,
      orbitOffset: Math.random() * Math.PI * 2,
    });
    this.ballGroup.add(mesh);
  }

  private addDefaultRings() {
    const rings = [
      { radius: 0.58, count: 22, tilt: 0 },
      { radius: 0.94, count: 30, tilt: Math.PI / 3 },
      { radius: 1.28, count: 38, tilt: Math.PI / 1.5 },
    ];
    rings.forEach(({ radius, count, tilt }) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        this.addBall(
          Math.cos(a) * radius,
          Math.sin(a) * radius * Math.cos(tilt),
          Math.sin(a) * radius * Math.sin(tilt),
          0.022, 0xd4a882
        );
      }
    });
    /* A few larger accent balls */
    [[0.8, 0.3, 0.2], [-0.6, -0.4, 0.3], [0.2, 0.9, -0.2], [-0.3, -0.8, 0.4], [0.5, -0.6, 0.3]].forEach(
      ([x, y, z]) => this.addBall(x, y, z, 0.042, 0xc8a882)
    );
  }

  /* ── Public API ── */
  setState(s: Partial<SphereState>) { Object.assign(this.targetState, s); }
  setHover(v: number)                { this.material.uniforms.uHover.value = v; }

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

    this.state.x     = lerp(this.state.x     ?? 0, this.targetState.x     ?? 0, 0.06);
    this.state.y     = lerp(this.state.y     ?? 0, this.targetState.y     ?? 0, 0.06);
    this.state.scale = lerp(this.state.scale ?? 1, this.targetState.scale ?? 1, 0.06);
    this.state.alpha = lerp(this.state.alpha ?? 1, this.targetState.alpha ?? 1, 0.04);

    this.material.uniforms.uTime.value  = t;
    this.material.uniforms.uAlpha.value = this.state.alpha ?? 1;

    /* Gentle idle rotation */
    this.sphereMesh.rotation.y = 0.14 * Math.sin(0.34 * t);
    this.sphereMesh.rotation.x = 0.06 * Math.sin(0.21 * t);
    this.sphereMesh.scale.setScalar(this.state.scale ?? 1);

    this.scene.position.x = (this.state.x ?? 0) * 0.8;
    this.scene.position.y = (this.state.y ?? 0) * 0.8;

    /* Orbiting micro-bubbles */
    this.balls.forEach(ball => {
      const o = ball.orbitOffset + t * ball.orbitSpeed;
      ball.mesh.position.x = ball.originalPosition.x + Math.sin(o)         * 0.038;
      ball.mesh.position.y = ball.originalPosition.y + Math.cos(o * 0.7)   * 0.038;
      ball.mesh.position.z = ball.originalPosition.z + Math.sin(o * 1.3)   * 0.026;
    });

    this.ballGroup.rotation.y = t * 0.08;
    this.ballGroup.rotation.x = Math.sin(t * 0.12) * 0.05;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.material.dispose();
    this.sphereMesh.geometry.dispose();
    this.renderer.dispose();
  }
}
