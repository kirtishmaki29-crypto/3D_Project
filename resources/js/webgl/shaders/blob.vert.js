export const blobVertexShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform float uBlobScale;
  uniform float uNoiseStrength;
  uniform float uNoiseFrequency;
  uniform float uNoiseSpeed;
  uniform float uHoverStrength;
  uniform float uPointerVelocity;
  uniform float uInteractionStrength;
  uniform float uScrollProgress;
  uniform float uDistortion;
  uniform float uRevealProgress;

  varying vec2 vUv;
  varying vec2 vPlane;
  varying vec3 vObjectPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vNoise;
  varying float vDisplacement;
  varying float vPointerField;

  vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;

    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p);
      p = p * 2.03 + vec3(11.7, -4.3, 7.1);
      amplitude *= 0.5;
    }
    return value;
  }

  float getPointerField(vec3 objectPosition) {
    vec2 aspectPointer = vec2(uPointer.x * 0.58, uPointer.y * 0.42);
    vec2 membranePosition = objectPosition.xy / max(uBlobScale, 0.001);
    float distanceToEnergy = length(membranePosition - aspectPointer);
    float broadField = smoothstep(1.45, 0.05, distanceToEnergy);
    float directionalField = dot(normalize(objectPosition + vec3(0.001)), normalize(vec3(uPointer * 0.34, 0.74)));
    return broadField * 0.7 + directionalField * 0.18;
  }

  float getDisplacement(vec3 objectPosition, vec3 objectNormal) {
    float reveal = smoothstep(0.0, 1.0, uRevealProgress);
    float time = uTime * uNoiseSpeed;
    vec3 lowFlow = objectPosition * (uNoiseFrequency * 0.72) + vec3(time * 0.28, -time * 0.18, time * 0.14);
    float largeWave = fbm(lowFlow);
    float pointerWave = getPointerField(objectPosition) * uHoverStrength;
    float revealShape = mix(0.38, 1.0, reveal);

    return (largeWave * uNoiseStrength * 0.22 * revealShape)
      + (pointerWave * 0.03 * reveal * uInteractionStrength);
  }

  void main() {
    vUv = uv;
    vPlane = uv * 2.0 - 1.0;

    vec3 objectNormal = normalize(position);
    float displacement = getDisplacement(position, objectNormal);
    vec3 displacedPosition = position + objectNormal * displacement;

    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vec4 mvPosition = viewMatrix * worldPosition;

    vObjectPosition = displacedPosition;
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
    vViewPosition = -mvPosition.xyz;
    vNoise = fbm(position * 1.18 + vec3(uTime * uNoiseSpeed * 0.22));
    vDisplacement = displacement;
    vPointerField = getPointerField(position);

    gl_Position = projectionMatrix * mvPosition;
  }
`;
