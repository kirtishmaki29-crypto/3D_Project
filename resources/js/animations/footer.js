import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let contactContext = null;
let contactCleanups = [];
let activeProgress = 0;
let activeFooterProgress = 0;
let focusProxy = { value: 0 };
let hasClearedTexture = false;

export function initContactAnimation(input = {}) {
  destroyContactAnimation();

  const { blobScene, pointer, cursor } = normalizeOptions(input);
  const section = document.querySelector('[data-contact]');
  const footer = document.querySelector('[data-footer]');

  if (!section && !footer) return null;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useStaticLayout = reduceMotion || window.matchMedia('(max-width: 39rem)').matches;
  const elements = collectElements({ section, footer, blobScene, pointer, cursor, reduceMotion: useStaticLayout });

  contactContext = gsap.context(() => {
    attachBackToTop(elements);
    attachFontRefresh();
    attachResizeRefresh();

    if (useStaticLayout) {
      setReducedMotionState(elements);
      blobScene?.clearTexture?.({ duration: 0.2 });
      blobScene?.setContactProgress?.(0.68, 0, {}, { immediate: true });
      return;
    }

    setInitialState(elements);
    createContactStage(elements);
    createFooterReveal(elements);
    attachContactInteractions(elements);
    renderContactProgress(0, elements, null, { updateBlob: false });
  }, section || footer);

  return {
    destroy: destroyContactAnimation
  };
}

export function destroyContactAnimation() {
  activeProgress = 0;
  activeFooterProgress = 0;
  focusProxy = { value: 0 };
  hasClearedTexture = false;
  contactCleanups.forEach((cleanup) => cleanup());
  contactCleanups = [];
  contactContext?.revert();
  contactContext = null;
}

function normalizeOptions(input) {
  if (input && typeof input.setBlobState === 'function') {
    return { blobScene: input, pointer: null, cursor: null };
  }

  return {
    blobScene: input?.blobScene || null,
    pointer: input?.pointer || null,
    cursor: input?.cursor || null
  };
}

function collectElements({ section, footer, blobScene, pointer, cursor, reduceMotion }) {
  const ctaLines = section
    ? gsap.utils.toArray(section.querySelectorAll('[data-contact-cta-line]'))
    : [];
  const metaBlocks = section
    ? gsap.utils.toArray(section.querySelectorAll('[data-contact-meta] > *'))
    : [];
  const socialLinks = section
    ? gsap.utils.toArray(section.querySelectorAll('[data-contact-social-link]'))
    : [];
  const footerItems = footer
    ? gsap.utils.toArray(footer.querySelectorAll('[data-footer-item]'))
    : [];
  const email = section?.querySelector('[data-contact-email]') || null;
  const backToTop = footer?.querySelector('[data-back-to-top]') || null;

  return {
    blobScene,
    pointer,
    cursor,
    reduceMotion,
    section,
    track: section?.querySelector('[data-contact-track]') || null,
    stage: section?.querySelector('[data-contact-stage]') || null,
    chrome: section?.querySelector('[data-contact-chrome]') || null,
    label: section?.querySelector('[data-contact-label]') || null,
    availability: section?.querySelector('[data-contact-availability]') || null,
    location: section?.querySelector('[data-contact-location]') || null,
    locationText: section?.querySelector('[data-contact-location-text]') || null,
    cta: section?.querySelector('[data-contact-cta]') || null,
    ctaLines,
    email,
    meta: section?.querySelector('[data-contact-meta]') || null,
    metaBlocks,
    socialLinks,
    footer,
    footerLine: footer?.querySelector('[data-footer-line]') || null,
    footerItems,
    backToTop,
    interactiveItems: [email, ...socialLinks, backToTop].filter(Boolean)
  };
}

function setInitialState(elements) {
  const {
    availability,
    chrome,
    ctaLines,
    email,
    footerItems,
    footerLine,
    label,
    locationText,
    metaBlocks,
    socialLinks
  } = elements;

  gsap.set([chrome, label, availability].filter(Boolean), { autoAlpha: 0, y: 10 });
  setIfTargets(locationText, { yPercent: 112, xPercent: 4, autoAlpha: 0.18 });
  setIfTargets(ctaLines, { yPercent: 112, autoAlpha: 0.72 });
  setIfTargets(email, { autoAlpha: 0, y: 14 });
  setIfTargets(metaBlocks, { autoAlpha: 0, y: 12 });
  setIfTargets(socialLinks, { autoAlpha: 0, y: 10 });
  setIfTargets(footerLine, { scaleX: 0, transformOrigin: 'left center' });
  setIfTargets(footerItems, { autoAlpha: 0, y: 12 });
}

function setReducedMotionState(elements) {
  const {
    availability,
    chrome,
    ctaLines,
    email,
    footerItems,
    footerLine,
    label,
    locationText,
    metaBlocks,
    socialLinks
  } = elements;

  gsap.set([chrome, label, availability].filter(Boolean), { autoAlpha: 1, y: 0 });
  setIfTargets(locationText, { yPercent: 0, xPercent: 0, autoAlpha: 1 });
  setIfTargets(ctaLines, { yPercent: 0, autoAlpha: 1 });
  setIfTargets(email, { autoAlpha: 1, y: 0 });
  setIfTargets(metaBlocks, { autoAlpha: 1, y: 0 });
  setIfTargets(socialLinks, { autoAlpha: 1, y: 0 });
  setIfTargets(footerLine, { scaleX: 1, transformOrigin: 'left center' });
  setIfTargets(footerItems, { autoAlpha: 1, y: 0 });
}

function createContactStage(elements) {
  const { blobScene, stage, track } = elements;

  if (!stage || !track) return;

  ScrollTrigger.create({
    id: 'contact-stage',
    trigger: track,
    start: 'top top',
    end: () => `+=${getContactDuration()}`,
    pin: stage,
    pinSpacing: true,
    scrub: 0.82,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => renderContactProgress(self.progress, elements, self),
    onEnter: (self) => {
      blobScene?.setState?.('contactIntro');
      renderContactProgress(self.progress, elements, self);
    },
    onEnterBack: (self) => {
      renderContactProgress(self.progress, elements, self);
    },
    onLeave: () => {
      renderContactProgress(1, elements);
      blobScene?.setState?.('footerFinal');
    },
    onLeaveBack: () => {
      hasClearedTexture = false;
      renderContactProgress(0, elements);
      blobScene?.setState?.('journalExit');
    }
  });
}

function createFooterReveal(elements) {
  const { footer } = elements;

  if (!footer) return;

  ScrollTrigger.create({
    id: 'footer-reveal',
    trigger: footer,
    start: 'top 94%',
    end: 'bottom bottom',
    scrub: 0.5,
    invalidateOnRefresh: true,
    onUpdate: (self) => renderFooterReveal(self.progress, elements),
    onEnter: () => {
      activeProgress = 1;
      renderContactBlob(elements.blobScene);
    },
    onEnterBack: () => {
      activeProgress = 1;
      renderContactBlob(elements.blobScene);
    },
    onLeaveBack: () => renderFooterReveal(0, elements)
  });
}

function renderContactProgress(progress, elements, trigger = null, options = {}) {
  const {
    availability,
    blobScene,
    chrome,
    ctaLines,
    email,
    label,
    locationText,
    metaBlocks,
    socialLinks
  } = elements;
  const amount = clamp(progress, 0, 1);
  const chromeProgress = 0.72 + smoothstep(mapRange(amount, 0, 0.1)) * 0.28;
  const locationProgress = smoothstep(mapRange(amount, 0.1, 0.42));
  const locationExit = smoothstep(mapRange(amount, 0.68, 0.9));
  const emailProgress = smoothstep(mapRange(amount, 0.68, 0.86));
  const footerHint = smoothstep(mapRange(amount, 0.88, 1));

  activeProgress = amount;

  if (amount > 0.006 && !hasClearedTexture) {
    hasClearedTexture = true;
    blobScene?.clearTexture?.({ duration: 0.66 });
  }

  if (amount < 0.004) {
    hasClearedTexture = false;
  }

  gsap.set([chrome, label, availability].filter(Boolean), {
    autoAlpha: chromeProgress,
    y: lerp(10, 0, chromeProgress)
  });
  gsap.set(locationText, {
    yPercent: lerp(112, 0, locationProgress),
    xPercent: lerp(4, -6, amount),
    autoAlpha: (0.18 + locationProgress * 0.82) * (1 - locationExit * 0.42)
  });
  ctaLines.forEach((line, index) => {
    const lineProgress = smoothstep(mapRange(amount, 0.5 + index * 0.045, 0.72 + index * 0.045));

    gsap.set(line, {
      yPercent: lerp(112, 0, lineProgress),
      autoAlpha: lerp(0.72, 1, lineProgress)
    });
  });
  gsap.set(email, {
    autoAlpha: emailProgress,
    y: lerp(14, 0, emailProgress)
  });
  metaBlocks.forEach((block, index) => {
    const sequenceIndex = Math.min(index, 4);
    const blockProgress = smoothstep(mapRange(amount, 0.68 + sequenceIndex * 0.025, 0.84 + sequenceIndex * 0.025));

    gsap.set(block, {
      autoAlpha: blockProgress,
      y: lerp(12, 0, blockProgress)
    });
  });
  socialLinks.forEach((link, index) => {
    const linkProgress = smoothstep(mapRange(amount, 0.74 + index * 0.026, 0.9 + index * 0.026));

    gsap.set(link, {
      autoAlpha: linkProgress,
      y: lerp(10, 0, linkProgress)
    });
  });

  renderFooterChrome(elements, Math.max(activeFooterProgress, footerHint));
  if (options.updateBlob !== false) {
    updateBlobState(blobScene, amount, trigger);
  }
}

function renderFooterReveal(progress, elements) {
  activeFooterProgress = smoothstep(clamp(progress, 0, 1));
  renderFooterChrome(
    elements,
    Math.max(activeFooterProgress, smoothstep(mapRange(activeProgress, 0.88, 1)))
  );
}

function renderFooterChrome(elements, progress) {
  const { footerItems, footerLine } = elements;
  const amount = clamp(progress, 0, 1);

  gsap.set(footerLine, { scaleX: amount });
  footerItems.forEach((item, index) => {
    const itemProgress = smoothstep(mapRange(amount, 0.1 + index * 0.08, 1));

    gsap.set(item, {
      autoAlpha: itemProgress,
      y: lerp(12, 0, itemProgress)
    });
  });
}

function attachContactInteractions(elements) {
  const { cursor, interactiveItems, section } = elements;

  interactiveItems.forEach((item) => {
    const onEnter = () => setContactFocus(elements, 1);
    const onLeave = () => setContactFocus(elements, 0);

    item.addEventListener('pointerenter', onEnter);
    item.addEventListener('pointerleave', onLeave);
    item.addEventListener('focus', onEnter);
    item.addEventListener('blur', onLeave);

    contactCleanups.push(() => {
      item.removeEventListener('pointerenter', onEnter);
      item.removeEventListener('pointerleave', onLeave);
      item.removeEventListener('focus', onEnter);
      item.removeEventListener('blur', onLeave);
    });
  });

  if (section) {
    const onSectionLeave = () => {
      cursor?.setCursorState?.('default');
      setContactFocus(elements, 0);
    };

    section.addEventListener('pointerleave', onSectionLeave);
    contactCleanups.push(() => section.removeEventListener('pointerleave', onSectionLeave));
  }
}

function setContactFocus(elements, value) {
  elements.cursor?.setCursorState?.(value > 0 ? 'contact' : 'default');

  gsap.to(focusProxy, {
    value,
    duration: 0.34,
    ease: 'power2.out',
    overwrite: true,
    onUpdate: () => renderContactBlob(elements.blobScene)
  });
}

function renderContactBlob(blobScene) {
  if (typeof blobScene?.setContactProgress === 'function') {
    blobScene.setContactProgress(activeProgress, focusProxy.value);
    return;
  }

  blobScene?.setState?.(focusProxy.value > 0.4 ? 'contactCTA' : 'footerFinal');
}

function updateBlobState(blobScene, progress, trigger) {
  if (typeof blobScene?.setContactProgress !== 'function') return;

  const baseState = blobScene.setContactProgress(progress, focusProxy.value);
  const velocity = trigger ? clamp(Math.abs(trigger.getVelocity()) / 5200, 0, 0.14) : 0;

  if (velocity > 0.004) {
    blobScene.setBlobState({
      distortion: baseState.distortion + velocity * 0.1,
      colorIntensity: baseState.colorIntensity + velocity * 0.06,
      fresnelIntensity: baseState.fresnelIntensity + velocity * 0.06
    });
  }
}

function attachBackToTop(elements) {
  const { backToTop, reduceMotion } = elements;

  if (!backToTop) return;

  const onClick = () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });

    window.setTimeout(() => ScrollTrigger.update(), reduceMotion ? 0 : 700);
  };

  backToTop.addEventListener('click', onClick);
  contactCleanups.push(() => backToTop.removeEventListener('click', onClick));
}

function attachFontRefresh() {
  if (!document.fonts?.ready) return;

  let cancelled = false;

  document.fonts.ready.then(() => {
    if (!cancelled) ScrollTrigger.refresh();
  });

  contactCleanups.push(() => {
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
  contactCleanups.push(() => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  });
}

function getContactDuration() {
  const width = window.innerWidth;
  const multiplier = width < 768 ? 1.36 : width < 1100 ? 1.5 : 1.64;

  return Math.round(window.innerHeight * multiplier);
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

function setIfTargets(targets, vars) {
  const validTargets = gsap.utils.toArray(targets).filter(Boolean);

  if (validTargets.length) {
    gsap.set(validTargets, vars);
  }
}
