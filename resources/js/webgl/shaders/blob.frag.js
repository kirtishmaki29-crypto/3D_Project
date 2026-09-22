export const blobFragmentShader = `
  precision highp float;

  #define MAX_STEPS 56
  #define MAX_DISTANCE 6.0
  #define SURFACE_THRESHOLD 0.0025

  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uPointerDirection;
  uniform vec2 uScrollDirection;
  uniform vec2 uResolution;
  uniform float uColorIntensity;
  uniform float uPointerVelocity;
  uniform float uScrollVelocity;
  uniform float uInteractionStrength;
  uniform float uFresnelPower;
  uniform float uFresnelIntensity;
  uniform float uHueShift;
  uniform float uOpacity;
  uniform float uRevealProgress;
  uniform float uScrollProgress;
  uniform float uBlobScale;
  uniform float uNoiseStrength;
  uniform float uNoiseFrequency;
  uniform float uNoiseSpeed;
  uniform float uHoverStrength;
  uniform float uDistortion;
  uniform float uTextureTransition;
  uniform sampler2D uTexture;
  uniform sampler2D uNextTexture;
  uniform float uMixRatio;
  uniform float uHasTexture;

  varying vec2 vUv;
  varying vec2 vPlane;

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
      p = p * 2.03 + vec3(5.2, -3.7, 7.1);
      amplitude *= 0.5;
    }

    return value;
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
  }

  vec2 safeNormalize(vec2 value) {
    float len = length(value);
    if (len < 0.0001) return vec2(0.0, 1.0);

    return value / len;
  }

  float mapScene(vec3 p) {
    float reveal = smoothstep(0.0, 1.0, uRevealProgress);
    float pointerEnergy = clamp(uPointerVelocity * uInteractionStrength, 0.0, 1.0);
    float scrollEnergy = clamp(abs(uScrollVelocity), 0.0, 1.0);
    vec2 pointerDir = safeNormalize(uPointerDirection);
    vec2 scrollDir = safeNormalize(uScrollDirection);

    float pointerAxis = dot(p.xy, pointerDir);
    float pointerSide = smoothstep(-1.0, 1.0, pointerAxis);
    p.xy -= pointerDir * pointerAxis * pointerEnergy * (0.18 + pointerSide * 0.08);

    float scrollAxis = dot(p.xy, scrollDir);
    p.xy -= scrollDir * scrollAxis * scrollEnergy * 0.18;
    p.z += pointerAxis * pointerEnergy * 0.08 - scrollAxis * scrollEnergy * 0.055;

    float time = uTime * uNoiseSpeed;
    float large = fbm(p * (uNoiseFrequency * 0.86) + vec3(time * 0.24, -time * 0.18, time * 0.13));
    float medium = snoise(p * (uNoiseFrequency * 1.72) + vec3(-time * 0.18, time * 0.26, -time * 0.15));
    float small = snoise(p * (uNoiseFrequency * 3.2) + vec3(time * 0.11, -time * 0.07, time * 0.09));
    float transitionNoise = fbm(p * 2.4 + vec3(0.0, uTime * 0.42, -uTime * 0.2));
    float deformation = (large * 0.82 + medium * 0.14 + small * 0.045)
      * uNoiseStrength
      * uDistortion
      * reveal;

    deformation += transitionNoise * uTextureTransition * 0.075;
    deformation += pointerEnergy * uHoverStrength * 0.06 * snoise(p * 1.45 + vec3(uPointer, time));
    deformation += scrollEnergy * 0.05 * snoise(p * 1.25 + vec3(0.0, uScrollDirection.y * 0.8, time * 0.7));

    float radius = 1.03 + deformation;

    return sdSphere(p, radius);
  }

  float rayMarch(vec3 ro, vec3 rd) {
    float distanceTravelled = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * distanceTravelled;
      float distanceToScene = mapScene(p);

      if (distanceToScene < SURFACE_THRESHOLD) {
        break;
      }

      distanceTravelled += distanceToScene;

      if (distanceTravelled > MAX_DISTANCE) {
        break;
      }
    }

    return distanceTravelled;
  }

  vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.0045, 0.0);

    return normalize(vec3(
      mapScene(p + e.xyy) - mapScene(p - e.xyy),
      mapScene(p + e.yxy) - mapScene(p - e.yxy),
      mapScene(p + e.yyx) - mapScene(p - e.yyx)
    ));
  }

  vec3 sampleBubbleTexture(vec2 baseUv, vec3 normal, float fresnel) {
    vec2 curve = (normal.xy * 0.075) + (baseUv - 0.5) * (0.08 + fresnel * 0.025);
    vec2 flow = vec2(
      snoise(vec3(baseUv * 3.2, uTime * 0.08)),
      snoise(vec3(baseUv.yx * 3.2 + 4.7, -uTime * 0.08))
    ) * 0.018;
    vec2 velocityShift = uPointerDirection * uPointerVelocity * 0.026
      + uScrollDirection * abs(uScrollVelocity) * 0.018;
    vec2 uv = clamp(baseUv + curve + flow + velocityShift, 0.002, 0.998);
    float chroma = 0.006 + fresnel * 0.01 + uTextureTransition * 0.012;

    vec3 currentColor;
    currentColor.r = texture2D(uTexture, clamp(uv + normal.xy * chroma, 0.002, 0.998)).r;
    currentColor.g = texture2D(uTexture, uv).g;
    currentColor.b = texture2D(uTexture, clamp(uv - normal.xy * chroma, 0.002, 0.998)).b;

    vec3 nextColor;
    nextColor.r = texture2D(uNextTexture, clamp(uv - flow + normal.xy * chroma * 0.55, 0.002, 0.998)).r;
    nextColor.g = texture2D(uNextTexture, clamp(uv - flow, 0.002, 0.998)).g;
    nextColor.b = texture2D(uNextTexture, clamp(uv - flow - normal.xy * chroma * 0.55, 0.002, 0.998)).b;

    float dissolve = smoothstep(0.0, 1.0, uMixRatio + snoise(vec3(uv * 4.0, uTime * 0.18)) * 0.08);

    return mix(currentColor, nextColor, dissolve);
  }

  void main() {
    float reveal = smoothstep(0.0, 1.0, uRevealProgress);
    vec2 plane = vPlane;
    vec3 ro = vec3(plane * 1.38, 2.8);
    vec3 rd = normalize(vec3(plane * 0.045, -1.0));
    float travelled = rayMarch(ro, rd);

    if (travelled > MAX_DISTANCE - 0.02) {
      discard;
    }

    vec3 p = ro + rd * travelled;
    vec3 normal = getNormal(p);
    vec3 viewDirection = normalize(-rd);

    float nDotV = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float fresnel = pow(1.0 - nDotV, uFresnelPower);
    float rim = pow(1.0 - nDotV, 1.18);
    float tightRim = pow(1.0 - nDotV, max(uFresnelPower * 2.0, 1.0));
    float depth = smoothstep(1.04, -0.15, length(p.xy));
    float membrane = fbm(p * 1.32 + vec3(uTime * 0.045, -uTime * 0.036, uTime * 0.02));
    float reflection = fbm(reflect(-viewDirection, normal) * 1.65 + vec3(uTime * 0.025));

    vec3 deepBlack = vec3(0.008, 0.009, 0.012);
    vec3 smoke = vec3(0.035, 0.038, 0.046);
    vec3 coolGlass = vec3(0.12, 0.16, 0.19);
    vec3 base = mix(deepBlack, smoke, 0.34 + membrane * 0.18);
    base = mix(base, coolGlass, (1.0 - depth) * 0.16 + reflection * 0.08);
    base *= 0.72 + rim * 0.46;

    vec3 lightA = normalize(vec3(-0.46, 0.72, 0.52));
    vec3 lightB = normalize(vec3(0.62 + uPointer.x * 0.16, -0.28 - uPointer.y * 0.12, 0.72));
    vec3 halfA = normalize(lightA + viewDirection);
    vec3 halfB = normalize(lightB + viewDirection);
    float specA = pow(max(dot(normal, halfA), 0.0), 96.0) * 0.72;
    float specB = pow(max(dot(normal, halfB), 0.0), 132.0) * 0.42;
    float edgeLine = smoothstep(0.52, 1.0, rim) * (0.6 + reflection * 0.35);

    vec3 finalColor = base;
    finalColor += vec3(0.78, 0.88, 1.0) * specA;
    finalColor += vec3(1.0, 0.62, 0.28) * specB * (0.42 + uPointerVelocity * 0.28);
    finalColor += vec3(0.68, 0.84, 1.0) * edgeLine * uFresnelIntensity * (0.54 + uColorIntensity * 0.18);
    finalColor += vec3(0.22, 0.52, 0.68) * tightRim * 0.24 * uColorIntensity;

    if (uHasTexture > 0.001) {
      vec2 portraitUv = vec2(p.x * 0.44 + 0.5, p.y * 0.44 + 0.48);
      portraitUv = clamp(portraitUv, 0.001, 0.999);
      vec3 textureColor = sampleBubbleTexture(portraitUv, normal, fresnel);
      float imageAmount = clamp(0.90 + depth * 0.10 - rim * 0.05, 0.0, 0.98) * uHasTexture;

      finalColor = mix(finalColor, textureColor * 1.12, imageAmount);
      finalColor += textureColor * fresnel * 0.25 * uHasTexture;
      finalColor += vec3(0.68, 0.82, 1.0) * uTextureTransition * tightRim * 0.38;
    }

    float alpha = reveal * uOpacity;
    alpha *= 0.28 + rim * 0.5 + depth * 0.3;
    alpha = clamp(alpha, 0.0, 0.98);

    float dither = (hash12(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
    gl_FragColor = vec4(finalColor + dither, alpha);
  }
`;
