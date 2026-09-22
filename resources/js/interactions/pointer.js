const POINTER_CONFIG = {
  smoothing: 0.16,
  reducedSmoothing: 0.22,
  velocityDamping: 0.82,
  maxSpeed: 44
};

function canUseFinePointer() {
  return window.matchMedia('(pointer: fine)').matches
    && window.matchMedia('(hover: hover)').matches
    && window.innerWidth >= 768;
}

export function initPointer() {
  const state = {
    rawX: window.innerWidth * 0.5,
    rawY: window.innerHeight * 0.5,
    previousRawX: window.innerWidth * 0.5,
    previousRawY: window.innerHeight * 0.5,
    smoothX: window.innerWidth * 0.5,
    smoothY: window.innerHeight * 0.5,
    normalizedX: 0,
    normalizedY: 0,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    isFinePointer: canUseFinePointer(),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    hasPointer: false,
    isInsideViewport: true
  };

  const subscribers = new Set();
  let frameId = 0;
  let isDestroyed = false;

  const updateNormalized = () => {
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);

    state.rawNormalizedX = (state.rawX / width) * 2 - 1;
    state.rawNormalizedY = -((state.rawY / height) * 2 - 1);
    state.normalizedX = (state.smoothX / width) * 2 - 1;
    state.normalizedY = -((state.smoothY / height) * 2 - 1);
  };

  const resetPointer = () => {
    state.rawX = window.innerWidth * 0.5;
    state.rawY = window.innerHeight * 0.5;
    state.previousRawX = state.rawX;
    state.previousRawY = state.rawY;
    state.velocityX = 0;
    state.velocityY = 0;
    state.speed = 0;
    state.isInsideViewport = false;
  };

  const onPointerMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

    state.hasPointer = true;
    state.isInsideViewport = true;
    state.previousRawX = state.rawX;
    state.previousRawY = state.rawY;
    state.rawX = event.clientX;
    state.rawY = event.clientY;
    state.velocityX = state.rawX - state.previousRawX;
    state.velocityY = state.rawY - state.previousRawY;
  };

  const onPointerLeave = () => {
    resetPointer();
  };

  const onBlur = () => {
    resetPointer();
  };

  const onResize = () => {
    state.isFinePointer = canUseFinePointer();
    state.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updateNormalized();
  };

  const tick = () => {
    if (isDestroyed) return;

    const smoothing = state.prefersReducedMotion ? POINTER_CONFIG.reducedSmoothing : POINTER_CONFIG.smoothing;
    const targetSpeed = Math.min(Math.hypot(state.velocityX, state.velocityY), POINTER_CONFIG.maxSpeed);

    state.smoothX += (state.rawX - state.smoothX) * smoothing;
    state.smoothY += (state.rawY - state.smoothY) * smoothing;
    state.speed += (targetSpeed - state.speed) * 0.18;
    state.velocityX *= POINTER_CONFIG.velocityDamping;
    state.velocityY *= POINTER_CONFIG.velocityDamping;

    if (Math.abs(state.velocityX) < 0.01) state.velocityX = 0;
    if (Math.abs(state.velocityY) < 0.01) state.velocityY = 0;

    updateNormalized();

    subscribers.forEach((callback) => callback(state));
    frameId = requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onBlur);
  window.addEventListener('resize', onResize);

  updateNormalized();
  frameId = requestAnimationFrame(tick);

  return {
    state,
    subscribe(callback) {
      subscribers.add(callback);

      return () => subscribers.delete(callback);
    },
    reset: resetPointer,
    destroy() {
      isDestroyed = true;
      cancelAnimationFrame(frameId);
      subscribers.clear();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', onResize);
    }
  };
}
