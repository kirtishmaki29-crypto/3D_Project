import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const INTRO_END = 0.18;
const EXIT_START = 0.72;
const DETAILS_EXIT_START = 0.58;
const FIRST_INTRO_BASE = 0.48;

let capabilitiesContext = null;
let capabilitiesCleanups = [];
let activeIndex = -1;
let hasClearedTexture = false;

export function initCapabilitiesAnimation(input = {}) {
  destroyCapabilitiesAnimation();

  const { blobScene } = normalizeOptions(input);
  const section = document.querySelector('[data-capabilities]');

  if (!section) return null;

  const track = section.querySelector('[data-capabilities-track]');
  const stage = section.querySelector('[data-capabilities-stage]');
  const capabilities = gsap.utils.toArray(section.querySelectorAll('[data-capability]'));

  if (!track || !stage || !capabilities.length) return null;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = collectElements(section, capabilities, blobScene);

  capabilitiesContext = gsap.context(() => {
    if (reduceMotion) {
      setReducedMotionState(elements);
      blobScene?.clearTexture?.({ duration: 0.24 });
      blobScene?.setCapabilitiesProgress?.(0.42, capabilities.length, {}, { immediate: true });
      return;
    }

    setInitialState(elements);
    attachFontRefresh();
    attachResizeRefresh();

    ScrollTrigger.create({
      id: 'capabilities-stage',
      trigger: track,
      start: 'top top',
      end: () => `+=${getCapabilitiesDuration(capabilities.length)}`,
      pin: stage,
      pinSpacing: true,
      scrub: 0.82,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => renderCapabilitiesProgress(self.progress, elements, self),
      onEnter: (self) => {
        blobScene?.setState?.('capabilitiesIntro');
        renderCapabilitiesProgress(self.progress, elements, self);
      },
      onEnterBack: (self) => {
        renderCapabilitiesProgress(self.progress, elements, self);
      },
      onLeave: () => {
        renderCapabilitiesProgress(1, elements);
        blobScene?.setState?.('capabilitiesExit');
      },
      onLeaveBack: () => {
        activeIndex = -1;
        hasClearedTexture = false;
        renderCapabilitiesProgress(0, elements);
        blobScene?.setState?.('aboutExit');
      }
    });

    renderCapabilitiesProgress(0, elements, null, { updateBlob: false });
  }, section);

  return {
    destroy: destroyCapabilitiesAnimation
  };
}

export function destroyCapabilitiesAnimation() {
  activeIndex = -1;
  hasClearedTexture = false;
  capabilitiesCleanups.forEach((cleanup) => cleanup());
  capabilitiesCleanups = [];
  capabilitiesContext?.revert();
  capabilitiesContext = null;
}

function normalizeOptions(input) {
  if (input && typeof input.setBlobState === 'function') {
    return { blobScene: input };
  }

  return {
    blobScene: input?.blobScene || null
  };
}

function collectElements(section, capabilities, blobScene) {
  const numberLayers = gsap.utils.toArray(section.querySelectorAll('[data-capability-number-layer]'));
  const numberSpans = numberLayers.map((layer) => layer.querySelector('[data-capability-number]') || layer);
  const titleWraps = capabilities.map((capability) => capability.querySelector('.capability-chapter__title-wrap'));
  const titleLines = capabilities.map((capability) => (
    gsap.utils.toArray(capability.querySelectorAll('[data-capability-title-line]'))
  ));
  const details = capabilities.map((capability) => capability.querySelector('[data-capability-details]'));
  const current = section.querySelector('[data-capabilities-current]');
  const progressBar = section.querySelector('[data-capabilities-progress]');
  const dividersX = gsap.utils.toArray(section.querySelectorAll('[data-capabilities-divider-x]'));
  const dividersY = gsap.utils.toArray(section.querySelectorAll('[data-capabilities-divider-y]'));
  const chrome = section.querySelector('[data-capabilities-chrome]');
  const label = section.querySelector('[data-capabilities-label]');

  return {
    blobScene,
    capabilities,
    chrome,
    current,
    details,
    dividersX,
    dividersY,
    label,
    numberLayers,
    numberSpans,
    progressBar,
    progressSetter: progressBar ? gsap.quickSetter(progressBar, 'scaleY') : null,
    dividerXSetters: dividersX.map((divider) => gsap.quickSetter(divider, 'scaleX')),
    dividerYSetters: dividersY.map((divider) => gsap.quickSetter(divider, 'scaleY')),
    titleLines,
    titleWraps
  };
}

function setInitialState(elements) {
  const {
    capabilities,
    chrome,
    details,
    dividersX,
    dividersY,
    numberLayers,
    numberSpans,
    progressBar,
    titleLines,
    titleWraps
  } = elements;

  gsap.set(chrome, { autoAlpha: 0, y: 10 });
  gsap.set(progressBar, { scaleY: 0, transformOrigin: 'top center' });
  gsap.set(dividersX, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(dividersY, { scaleY: 0, transformOrigin: 'top center' });
  gsap.set(numberLayers, { autoAlpha: 0, visibility: 'hidden' });
  gsap.set(numberSpans, { yPercent: 112 });

  capabilities.forEach((capability, index) => {
    const isActive = index === 0;

    capability.classList.toggle('is-active', isActive);
    capability.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    setInert(capability, !isActive);
    gsap.set(capability, { autoAlpha: 0, pointerEvents: 'none', visibility: 'hidden' });
    gsap.set(titleWraps[index], { autoAlpha: 0, y: 0 });
    gsap.set(titleLines[index], { yPercent: 112 });
    gsap.set(details[index], { autoAlpha: 0, y: 18 });
  });
}

function setReducedMotionState(elements) {
  const {
    capabilities,
    chrome,
    current,
    details,
    dividersX,
    dividersY,
    numberLayers,
    numberSpans,
    progressBar,
    titleLines,
    titleWraps
  } = elements;

  if (current) current.textContent = '01';

  gsap.set(chrome, { autoAlpha: 1, y: 0 });
  gsap.set(progressBar, { scaleY: 1 });
  gsap.set(dividersX, { scaleX: 1 });
  gsap.set(dividersY, { scaleY: 1 });
  gsap.set(numberLayers, { autoAlpha: 0, visibility: 'hidden' });
  gsap.set(numberSpans, { yPercent: 0 });

  capabilities.forEach((capability, index) => {
    const isActive = index === 0;
    capability.classList.toggle('is-active', isActive);
    capability.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    setInert(capability, !isActive);
    gsap.set(capability, { autoAlpha: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none', visibility: isActive ? 'visible' : 'hidden' });
    gsap.set(titleWraps[index], { autoAlpha: isActive ? 1 : 0, y: 0 });
    gsap.set(titleLines[index], { yPercent: 0 });
    gsap.set(details[index], { autoAlpha: isActive ? 1 : 0, y: 0 });
  });
}

function renderCapabilitiesProgress(progress, elements, trigger = null, options = {}) {
  const {
    blobScene,
    capabilities,
    chrome,
    current,
    dividerXSetters,
    dividerYSetters,
    numberLayers,
    numberSpans,
    progressSetter
  } = elements;
  const amount = clamp(progress, 0, 1);
  const count = capabilities.length;
  const { index: nextActiveIndex, localProgress } = getProgressData(amount, count);
  const chapterIntro = nextActiveIndex === 0
    ? FIRST_INTRO_BASE + smoothstep(localProgress / INTRO_END) * (1 - FIRST_INTRO_BASE)
    : 1;
  const exitProgress = smoothstep(mapRange(localProgress, EXIT_START, 1));
  const dividerScale = clamp((0.38 + chapterIntro * 0.62) - exitProgress * 0.22, 0, 1);
  const chromeProgress = 0.72 + smoothstep(mapRange(amount, 0, 0.045)) * 0.28;

  progressSetter?.(amount);
  dividerXSetters.forEach((setScale) => setScale(dividerScale));
  dividerYSetters.forEach((setScale) => setScale(clamp(0.24 + amount * 0.76, 0, 1)));
  gsap.set(chrome, {
    autoAlpha: chromeProgress,
    y: (1 - chromeProgress) * 10
  });

  if (amount > 0.006 && !hasClearedTexture) {
    hasClearedTexture = true;
    blobScene?.clearTexture?.({ duration: 0.68 });
  }

  if (amount < 0.004) {
    hasClearedTexture = false;
  }

  capabilities.forEach((capability, index) => {
    renderCapabilityLayer(index, {
      ...elements,
      amount,
      localProgress,
      activeIndex: nextActiveIndex,
      count
    });
  });

  if (nextActiveIndex !== activeIndex) {
    activeIndex = nextActiveIndex;
    updateCounter(current, nextActiveIndex + 1);
    updateAccessibility(capabilities, nextActiveIndex);
  }

  if (options.updateBlob !== false) {
    updateBlobState(blobScene, amount, count, trigger);
  }

  numberLayers.forEach((layer, index) => {
    const numberVisible = gsap.getProperty(numberSpans[index], 'opacity') > 0.002;
    gsap.set(layer, { visibility: numberVisible ? 'visible' : 'hidden' });
  });
}

function renderCapabilityLayer(index, input) {
  const {
    activeIndex: currentIndex,
    capabilities,
    count,
    details,
    localProgress,
    numberLayers,
    numberSpans,
    titleLines,
    titleWraps
  } = input;
  const isCurrent = index === currentIndex;
  const isNext = index === currentIndex + 1 && currentIndex < count - 1;
  const state = isCurrent
    ? getCurrentLayerState(currentIndex, localProgress, count)
    : isNext
      ? getIncomingLayerState(localProgress)
      : getHiddenLayerState();
  const chapterOpacity = Math.max(state.titleOpacity, state.detailsOpacity);

  gsap.set(numberLayers[index], { autoAlpha: state.numberOpacity });
  gsap.set(numberSpans[index], {
    yPercent: state.numberY,
    opacity: state.numberOpacity
  });
  gsap.set(capabilities[index], {
    autoAlpha: chapterOpacity,
    pointerEvents: 'none',
    visibility: chapterOpacity > 0.002 ? 'visible' : 'hidden'
  });
  gsap.set(titleWraps[index], {
    autoAlpha: state.titleOpacity,
    y: state.titleOffset
  });
  gsap.set(titleLines[index], {
    yPercent: state.titleY,
    opacity: state.titleOpacity
  });
  gsap.set(details[index], {
    autoAlpha: state.detailsOpacity,
    y: state.detailsY
  });
}

function getCurrentLayerState(index, localProgress, count) {
  const firstIntro = index === 0
    ? FIRST_INTRO_BASE + smoothstep(localProgress / INTRO_END) * (1 - FIRST_INTRO_BASE)
    : 1;
  const numberExit = smoothstep(mapRange(localProgress, EXIT_START - 0.02, 1));
  const titleExit = smoothstep(mapRange(localProgress, EXIT_START + 0.02, 1));
  const detailsExit = smoothstep(mapRange(localProgress, DETAILS_EXIT_START, 0.84));
  const firstDetailsIntro = index === 0 ? smoothstep(mapRange(localProgress, 0.08, 0.26)) : 1;
  const lastChapter = index === count - 1;

  return {
    numberY: lerp(lerp(92, 0, firstIntro), -112, numberExit),
    numberOpacity: firstIntro * (1 - numberExit * (lastChapter ? 0.96 : 0.62)),
    titleY: lerp(lerp(112, 0, firstIntro), -112, titleExit),
    titleOpacity: firstIntro * (1 - titleExit),
    titleOffset: -10 * titleExit,
    detailsY: lerp(lerp(18, 0, firstDetailsIntro), -18, detailsExit),
    detailsOpacity: firstDetailsIntro * (1 - detailsExit)
  };
}

function getIncomingLayerState(localProgress) {
  const numberEnter = smoothstep(mapRange(localProgress, EXIT_START - 0.02, 1));
  const titleEnter = smoothstep(mapRange(localProgress, EXIT_START + 0.06, 1));
  const detailsEnter = smoothstep(mapRange(localProgress, 0.84, 1));

  return {
    numberY: lerp(112, 0, numberEnter),
    numberOpacity: numberEnter,
    titleY: lerp(112, 0, titleEnter),
    titleOpacity: titleEnter,
    titleOffset: lerp(12, 0, titleEnter),
    detailsY: lerp(18, 0, detailsEnter),
    detailsOpacity: detailsEnter
  };
}

function getHiddenLayerState() {
  return {
    numberY: 112,
    numberOpacity: 0,
    titleY: 112,
    titleOpacity: 0,
    titleOffset: 0,
    detailsY: 18,
    detailsOpacity: 0
  };
}

function updateBlobState(blobScene, progress, count, trigger) {
  if (typeof blobScene?.setCapabilitiesProgress !== 'function') return;

  const baseState = blobScene.setCapabilitiesProgress(progress, count);
  const velocity = trigger ? clamp(Math.abs(trigger.getVelocity()) / 5200, 0, 0.16) : 0;

  if (velocity > 0.004) {
    blobScene.setBlobState({
      distortion: baseState.distortion + velocity * 0.12,
      colorIntensity: baseState.colorIntensity + velocity * 0.08,
      fresnelIntensity: baseState.fresnelIntensity + velocity * 0.08
    });
  }
}

function updateAccessibility(capabilities, currentIndex) {
  capabilities.forEach((capability, index) => {
    const isActive = index === currentIndex;

    capability.classList.toggle('is-active', isActive);
    capability.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    setInert(capability, !isActive);
  });
}

function updateCounter(current, value) {
  if (!current) return;

  const label = String(value).padStart(2, '0');

  if (current.textContent === label) return;

  gsap.fromTo(current, {
    y: 7,
    opacity: 0.32
  }, {
    y: 0,
    opacity: 1,
    duration: 0.24,
    ease: 'power2.out',
    overwrite: true
  });
  current.textContent = label;
}

function attachFontRefresh() {
  if (!document.fonts?.ready) return;

  let cancelled = false;

  document.fonts.ready.then(() => {
    if (!cancelled) ScrollTrigger.refresh();
  });

  capabilitiesCleanups.push(() => {
    cancelled = true;
  });
}

function attachResizeRefresh() {
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 140);
  };

  window.addEventListener('resize', onResize);
  capabilitiesCleanups.push(() => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  });
}

function getProgressData(progress, count) {
  const scaled = progress * count;
  const index = Math.min(count - 1, Math.floor(scaled));

  return {
    index,
    localProgress: clamp(scaled - index, 0, 1)
  };
}

function getCapabilitiesDuration(count) {
  const width = window.innerWidth;
  const perCapability = width < 768 ? 0.74 : width < 1100 ? 0.84 : 0.94;
  const minimumScreens = count === 1 ? 1.22 : 1.8;

  return Math.round(window.innerHeight * Math.max(count * perCapability, minimumScreens));
}

function setInert(element, inert) {
  if (!element) return;

  if ('inert' in element) {
    element.inert = inert;
    return;
  }

  if (inert) {
    element.setAttribute('inert', '');
  } else {
    element.removeAttribute('inert');
  }
}

function mapRange(value, start, end) {
  return clamp((value - start) / Math.max(end - start, 0.001), 0, 1);
}

function smoothstep(value) {
  const amount = clamp(value, 0, 1);

  return amount * amount * (3 - 2 * amount);
}

function lerp(from, to, progress) {
  return from + (to - from) * clamp(progress, 0, 1);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
