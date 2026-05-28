const fragmentShader = /* glsl */ `
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

  float band(float value, float center, float width) {
    return 1.0 - smoothstep(width * 0.45, width, abs(value - center));
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);

    float frontFace = gl_FrontFacing ? 1.0 : 0.0;

    /* Fresnel — glowing rim, transparent center */
    float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 1.55);
    float rim = smoothstep(0.03, 0.82, fresnel);

    /* Three specular light sources — light 3 animates with uTime */
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

    /* Animated hover shimmer */
    float hoverGlow = uHover * 0.12 * rim;

    /* Blend color tones with user brand colors */
    vec3 rimCol = mix(uColor1, uColor2, fresnel);

    /* Combine: env reflection + rim color + specular highlights */
    vec3 col = envReflect * 0.35 + rimCol * rim * 0.55 + vec3(1.0) * spec * 0.9 + hoverGlow;

    /* Alpha: near-zero at center, ~0.58 at rim — the glass look */
    float alpha = 0.0001 + rim * 0.075;

    /* Dissolve/reveal animation driven by uAlpha */
    float dissolveEdge = (1.0 - uAlpha) * 1.8 - 0.5;
    float dissolveMask = smoothstep(dissolveEdge, dissolveEdge + 0.4, fresnel);
    alpha = clamp(alpha * dissolveMask, 0.0, 0.58);

    gl_FragColor = vec4(col, alpha);
  }
`;

export default fragmentShader;
