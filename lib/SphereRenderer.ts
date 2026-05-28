import * as THREE from 'three';

/* ─── GLSL Shaders ─── */

const vertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    vViewPos = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */`
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;

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

    /* Fresnel — glowing rim, transparent center */
    float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 1.55);
    float rim = smoothstep(0.03, 0.82, fresnel);

    /* Three specular lights — light 3 oscillates for the animated shimmer */
    vec3 l1 = normalize(vec3(-0.55, 0.82, 0.75));
    vec3 l2 = normalize(vec3(0.65, -0.24, 0.86));
    vec3 l3 = normalize(vec3(-0.18 + sin(uTime * 0.35) * 0.08, 0.30, 0.94));

    float s1 = specular(n, v, l1, 72.0) * 0.85;
    float s2 = specular(n, v, l2, 30.0) * 0.14;
    float s3 = specular(n, v, l3, 180.0) * 0.62;
    float spec = s1 + s2 + s3;

    /* Cubemap environment reflection */
    vec3 reflectDir = reflect(-v, n);
    vec3 envReflect = textureCube(uHdri, reflectDir).rgb;

    /* Hover shimmer */
    float hoverGlow = uHover * 0.12 * rim;

    /* Blend brand color tones with fresnel */
    vec3 rimCol = mix(uColor1, uColor2, fresnel);

    vec3 col = envReflect * 0.35 + rimCol * rim * 0.55 + vec3(1.0) * spec * 0.9 + hoverGlow;

    /* Alpha: near-zero at center, 0.58 at rim — the glass look */
    float alpha = 0.0001 + rim * 0.075;

    /* Dissolve/reveal animation */
    float dissolveEdge = (1.0 - uAlpha) * 1.8 - 0.5;
    float dissolveMask = smoothstep(dissolveEdge, dissolveEdge + 0.4, fresnel);
    alpha = clamp(alpha * dissolveMask, 0.0, 0.58);

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

/* ─── SphereRenderer ─── */

export class SphereRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private material: THREE.ShaderMaterial;
  private sphereMesh: THREE.Mesh;
  private clock: THREE.Clock;
  private balls: Ball[] = [];
  private ballGroup: THREE.Group;
  private animFrameId: number | null = null;
  private state: SphereState = { x: 0, y: 0, scale: 1, alpha: 1 };
  private targetState: SphereState = { x: 0, y: 0, scale: 1, alpha: 1 };

  constructor(
    canvas: HTMLCanvasElement,
    options: { color1?: string; color2?: string } = {}
  ) {
    const color1 = new THREE.Color(options.color1 ?? '#c8a882');
    const color2 = new THREE.Color(options.color2 ?? '#e8d5c4');

    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* Scene + Camera */
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, canvas.width / canvas.height, 0.1, 100);
    this.camera.position.z = 5.2;

    this.clock = new THREE.Clock();

    /* Procedural cubemap — no external files needed */
    const envMap = this.buildCubemap();

    /* Shader material with the glass bubble shaders */
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:   { value: 0 },
        uAlpha:  { value: 1 },
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

    /* Main sphere geometry */
    const geometry = new THREE.IcosahedronGeometry(1.5, 64);
    this.sphereMesh = new THREE.Mesh(geometry, this.material);
    this.sphereMesh.renderOrder = 2;
    this.scene.add(this.sphereMesh);

    /* Floating ring group */
    this.ballGroup = new THREE.Group();
    this.scene.add(this.ballGroup);
    this.addDefaultRings();

    this.resize(canvas.width, canvas.height);
  }

  /* Build soft procedural cubemap — warm/cool face gradients give realistic glass reflections */
  private buildCubemap(): THREE.CubeTexture {
    const size = 128;
    const dirs = [
      { r: 245, g: 240, b: 235 }, // px — warm highlight
      { r: 230, g: 228, b: 232 }, // nx — cool shadow
      { r: 250, g: 248, b: 244 }, // py — top light
      { r: 210, g: 208, b: 215 }, // ny — bottom dark
      { r: 240, g: 237, b: 240 }, // pz
      { r: 235, g: 233, b: 238 }, // nz
    ];

    const urls: string[] = dirs.map(({ r, g, b }, i) => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;

      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.8);
      grad.addColorStop(0, `rgb(${Math.min(r + 20, 255)},${Math.min(g + 20, 255)},${Math.min(b + 20, 255)})`);
      grad.addColorStop(0.5, `rgb(${r},${g},${b})`);
      grad.addColorStop(1, `rgb(${Math.max(r - 30, 0)},${Math.max(g - 30, 0)},${Math.max(b - 30, 0)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      /* Extra warm highlight on light-facing sides */
      if (i === 0 || i === 2) {
        const hi = ctx.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.3, size * 0.3, size * 0.5);
        hi.addColorStop(0, 'rgba(255,245,235,0.55)');
        hi.addColorStop(1, 'rgba(255,245,235,0)');
        ctx.fillStyle = hi;
        ctx.fillRect(0, 0, size, size);
      }

      return c.toDataURL();
    });

    return new THREE.CubeTextureLoader().load(urls);
  }

  /* Add an inner ball particle */
  private addBall(x: number, y: number, z: number, size: number, color: number) {
    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);

    this.balls.push({
      mesh,
      originalPosition: new THREE.Vector3(x, y, z),
      orbitSpeed: 0.16 + Math.random() * 0.14,
      orbitOffset: Math.random() * Math.PI * 2,
    });
    this.ballGroup.add(mesh);
  }

  /* Three concentric rings — the floating ring structures visible inside the sphere */
  private addDefaultRings() {
    const rings = [
      { radius: 0.58, count: 20, tilt: 0 },
      { radius: 0.92, count: 28, tilt: Math.PI / 3 },
      { radius: 1.26, count: 36, tilt: Math.PI / 1.5 },
    ];

    rings.forEach(({ radius, count, tilt }) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius * Math.cos(tilt);
        const z = Math.sin(a) * radius * Math.sin(tilt);
        this.addBall(x, y, z, 0.02, 0xd4b896);
      }
    });

    /* Accent balls */
    [[0.8, 0.3, 0.2], [-0.6, -0.4, 0.3], [0.2, 0.9, -0.2], [-0.3, -0.8, 0.4]].forEach(
      ([x, y, z]) => this.addBall(x, y, z, 0.038, 0xc8a882)
    );
  }

  setState(s: Partial<SphereState>) {
    Object.assign(this.targetState, s);
  }

  setHover(v: number) {
    this.material.uniforms.uHover.value = v;
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  start() {
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
    const t = this.clock.getElapsedTime();
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    /* Smooth lerp toward target state */
    this.state.x     = lerp(this.state.x ?? 0,     this.targetState.x ?? 0,     0.06);
    this.state.y     = lerp(this.state.y ?? 0,     this.targetState.y ?? 0,     0.06);
    this.state.scale = lerp(this.state.scale ?? 1, this.targetState.scale ?? 1, 0.06);
    this.state.alpha = lerp(this.state.alpha ?? 1, this.targetState.alpha ?? 1, 0.04);

    this.material.uniforms.uTime.value  = t;
    this.material.uniforms.uAlpha.value = this.state.alpha ?? 1;

    /* Idle gentle rotation */
    this.sphereMesh.rotation.y = 0.14 * Math.sin(0.34 * t);
    this.sphereMesh.rotation.x = 0.06 * Math.sin(0.21 * t);
    this.sphereMesh.scale.setScalar(this.state.scale ?? 1);

    /* Scroll offset */
    this.scene.position.x = (this.state.x ?? 0) * 0.8;
    this.scene.position.y = (this.state.y ?? 0) * 0.8;

    /* Animate inner rings */
    this.balls.forEach(ball => {
      const o = ball.orbitOffset + t * ball.orbitSpeed;
      ball.mesh.position.x = ball.originalPosition.x + Math.sin(o) * 0.035;
      ball.mesh.position.y = ball.originalPosition.y + Math.cos(o * 0.7) * 0.035;
      ball.mesh.position.z = ball.originalPosition.z + Math.sin(o * 1.3) * 0.025;
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
