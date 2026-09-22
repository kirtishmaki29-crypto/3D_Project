import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let journalContext = null;
let journalCleanups = [];
let activeArticleIndex = -1;
let activeProgress = 0;
let focusProxy = { value: 0 };

export function initJournalAnimation(input = {}) {
  destroyJournalAnimation();

  const { blobScene, pointer, cursor } = normalizeOptions(input);
  const section = document.querySelector('[data-journal]');

  if (!section) return null;

  const elements = collectElements(section, blobScene, pointer, cursor);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && pointer?.state?.isFinePointer
    && !reduceMotion;

  journalContext = gsap.context(() => {
    if (reduceMotion) {
      setReducedMotionState(elements);
      blobScene?.clearTexture?.({ duration: 0.24 });
      blobScene?.setJournalProgress?.(0.36, 0, {}, { immediate: true });
      return;
    }

    setInitialState(elements);
    createIntroReveal(elements);
    createRowReveals(elements);
    createJournalProgress(elements);
    attachFontRefresh();
    attachResizeRefresh();

    if (canHover && elements.items.length) {
      attachArticleInteractions(elements);
      attachPreviewPointer(elements);
      preloadPreviewImages(elements.items);
    }
  }, section);

  return {
    destroy: destroyJournalAnimation
  };
}

export function destroyJournalAnimation() {
  activeArticleIndex = -1;
  activeProgress = 0;
  focusProxy = { value: 0 };
  journalCleanups.forEach((cleanup) => cleanup());
  journalCleanups = [];
  journalContext?.revert();
  journalContext = null;
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

function collectElements(section, blobScene, pointer, cursor) {
  const items = gsap.utils.toArray(section.querySelectorAll('[data-journal-item]'));
  const links = items.map((item) => item.querySelector('[data-journal-link]'));
  const titles = items.map((item) => item.querySelector('[data-journal-title]'));
  const indexes = items.map((item) => item.querySelector('[data-journal-index-label]'));
  const metas = items.map((item) => item.querySelector('[data-journal-meta]'));
  const excerpts = items.map((item) => item.querySelector('[data-journal-excerpt]'));
  const arrows = items.map((item) => item.querySelector('.journal-item__arrow'));
  const dividers = items.map((item) => item.querySelector('[data-journal-divider]'));
  const preview = section.querySelector('[data-journal-preview]');
  const previewImage = section.querySelector('[data-journal-preview-image]');

  return {
    blobScene,
    pointer,
    cursor,
    section,
    header: section.querySelector('[data-journal-header]'),
    label: section.querySelector('[data-journal-label]'),
    heading: section.querySelector('[data-journal-heading]'),
    headingLines: gsap.utils.toArray(section.querySelectorAll('[data-journal-heading-line]')),
    copy: section.querySelector('[data-journal-copy]'),
    list: section.querySelector('[data-journal-list]'),
    empty: section.querySelector('[data-empty-state]'),
    items,
    links,
    titles,
    indexes,
    metas,
    excerpts,
    arrows,
    dividers,
    preview,
    previewImage,
    previewX: preview ? gsap.quickTo(preview, 'x', { duration: 0.52, ease: 'power3.out' }) : null,
    previewY: preview ? gsap.quickTo(preview, 'y', { duration: 0.52, ease: 'power3.out' }) : null
  };
}

function setInitialState(elements) {
  const {
    label,
    headingLines,
    copy,
    items,
    links,
    titles,
    indexes,
    metas,
    excerpts,
    arrows,
    dividers,
    preview
  } = elements;

  gsap.set(label, { autoAlpha: 0, y: 10 });
  gsap.set(headingLines, { yPercent: 112, autoAlpha: 0.62 });
  gsap.set(copy, { autoAlpha: 0, y: 12 });
  gsap.set(items, { autoAlpha: 0 });
  gsap.set(links, { opacity: 1 });
  gsap.set(titles, { y: 26, autoAlpha: 0 });
  gsap.set(indexes, { x: 0, autoAlpha: 0 });
  gsap.set(metas, { y: 10, autoAlpha: 0 });
  setIfTargets(excerpts, { autoAlpha: 0, y: 8 });
  setIfTargets(arrows, { x: 0, y: 0, autoAlpha: 0.45 });
  setIfTargets(dividers, { scaleX: 0, transformOrigin: 'left center' });
  if (preview) {
    gsap.set(preview, { autoAlpha: 0, scale: 0.94, x: 0, y: 0 });
  }
}

function setReducedMotionState(elements) {
  const {
    label,
    headingLines,
    copy,
    items,
    links,
    titles,
    indexes,
    metas,
    excerpts,
    arrows,
    dividers,
    preview
  } = elements;

  gsap.set(label, { autoAlpha: 1, y: 0 });
  gsap.set(headingLines, { yPercent: 0, autoAlpha: 1 });
  gsap.set(copy, { autoAlpha: 1, y: 0 });
  gsap.set(items, { autoAlpha: 1 });
  gsap.set(links, { opacity: 1, x: 0 });
  gsap.set(titles, { y: 0, x: 0, autoAlpha: 1 });
  gsap.set(indexes, { x: 0, autoAlpha: 1 });
  gsap.set(metas, { y: 0, autoAlpha: 1 });
  setIfTargets(excerpts, { autoAlpha: 1, y: 0 });
  setIfTargets(arrows, { x: 0, y: 0, autoAlpha: 0.55 });
  setIfTargets(dividers, { scaleX: 1 });
  if (preview) {
    gsap.set(preview, { autoAlpha: 0 });
  }
}

function createIntroReveal(elements) {
  const { section, label, heading, headingLines, copy, blobScene } = elements;

  gsap.timeline({
    scrollTrigger: {
      id: 'journal-intro',
      trigger: section,
      start: 'top 76%',
      end: 'top 28%',
      toggleActions: 'play none none reverse',
      onEnter: () => blobScene?.setState?.('journalIntro'),
      onEnterBack: () => blobScene?.setState?.('journalIntro')
    }
  })
    .to(label, {
      autoAlpha: 1,
      y: 0,
      duration: 0.44,
      ease: 'power3.out'
    }, 0)
    .to(headingLines, {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power4.out'
    }, 0.12)
    .to(copy, {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: 'power3.out'
    }, 0.58);

  gsap.to(heading, {
    y: -18,
    ease: 'none',
    scrollTrigger: {
      id: 'journal-heading-drift',
      trigger: section,
      start: 'top 18%',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true
    }
  });
}

function createRowReveals(elements) {
  const {
    items,
    titles,
    indexes,
    metas,
    arrows,
    dividers
  } = elements;

  items.forEach((item, index) => {
    const reveal = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: `journal-row-${index}`,
        trigger: item,
        start: 'top 88%',
        end: 'top 54%',
        scrub: 0.48,
        invalidateOnRefresh: true
      }
    });

    reveal
      .to(item, { autoAlpha: 1, duration: 0.24 }, 0)
      .to(dividers[index], { scaleX: 1, duration: 0.42 }, 0)
      .to(indexes[index], { autoAlpha: 1, duration: 0.25 }, 0.08)
      .to(titles[index], { autoAlpha: 1, y: 0, duration: 0.5 }, 0.1)
      .to(metas[index], { autoAlpha: 1, y: 0, duration: 0.34 }, 0.18)
      .to(arrows[index], { autoAlpha: 0.58, duration: 0.24 }, 0.24);
  });
}

function createJournalProgress(elements) {
  const { section, blobScene } = elements;

  ScrollTrigger.create({
    id: 'journal-progress',
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      activeProgress = self.progress;
      renderJournalBlob(blobScene);
    },
    onEnter: (self) => {
      activeProgress = self.progress;
      blobScene?.clearTexture?.({ duration: 0.72 });
      renderJournalBlob(blobScene);
    },
    onEnterBack: (self) => {
      activeProgress = self.progress;
      renderJournalBlob(blobScene);
    },
    onLeave: () => {
      activeProgress = 1;
      clearActiveArticle(elements);
      blobScene?.setState?.('journalExit');
    },
    onLeaveBack: () => {
      activeProgress = 0;
      clearActiveArticle(elements);
      blobScene?.setState?.('capabilitiesExit');
    }
  });
}

function attachArticleInteractions(elements) {
  const { section, links } = elements;

  links.forEach((link, index) => {
    if (!link) return;

    const onEnter = () => setActiveArticle(elements, index, { preview: true });
    const onLeave = () => clearActiveArticle(elements);
    const onFocus = () => setActiveArticle(elements, index, { preview: false });
    const onBlur = () => clearActiveArticle(elements);

    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointerleave', onLeave);
    link.addEventListener('focus', onFocus);
    link.addEventListener('blur', onBlur);

    journalCleanups.push(() => {
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointerleave', onLeave);
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('blur', onBlur);
    });
  });

  const onSectionLeave = () => clearActiveArticle(elements);
  section.addEventListener('pointerleave', onSectionLeave);
  journalCleanups.push(() => section.removeEventListener('pointerleave', onSectionLeave));
}

function attachPreviewPointer(elements) {
  const { pointer, preview, previewX, previewY } = elements;

  if (!pointer?.subscribe || !preview || !previewX || !previewY) return;

  const unsubscribe = pointer.subscribe((pointerState) => {
    if (activeArticleIndex < 0) return;

    const { x, y } = getPreviewPosition(preview, pointerState);
    previewX(x);
    previewY(y);
  });

  journalCleanups.push(unsubscribe);
}

function setActiveArticle(elements, index, options = {}) {
  const {
    blobScene,
    cursor,
    items,
    links,
    titles,
    indexes,
    metas,
    excerpts,
    arrows,
    dividers
  } = elements;

  activeArticleIndex = index;
  cursor?.setCursorState?.('article');
  blobScene?.setProjectTexture?.(items[index]?.dataset.journalImage || items[index]?.dataset.img || '', items[index]);

  items.forEach((item, itemIndex) => {
    const isActive = itemIndex === index;
    item.classList.toggle('is-active', isActive);

    gsap.to(links[itemIndex], {
      opacity: isActive ? 1 : 0.48,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: true
    });
    gsap.to(titles[itemIndex], {
      x: isActive ? 8 : 0,
      autoAlpha: isActive ? 1 : 0.64,
      duration: 0.34,
      ease: 'power3.out',
      overwrite: true
    });
    gsap.to(indexes[itemIndex], {
      x: isActive ? -3 : 0,
      autoAlpha: isActive ? 1 : 0.58,
      duration: 0.34,
      ease: 'power3.out',
      overwrite: true
    });
    gsap.to(metas[itemIndex], {
      autoAlpha: isActive ? 1 : 0.55,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: true
    });
    if (excerpts[itemIndex]) {
      gsap.to(excerpts[itemIndex], {
        autoAlpha: isActive ? 1 : 0,
        y: isActive ? 0 : 8,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true
      });
    }
    gsap.to(arrows[itemIndex], {
      x: isActive ? 2 : 0,
      y: isActive ? -2 : 0,
      autoAlpha: isActive ? 0.86 : 0.45,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: true
    });
    gsap.to(dividers[itemIndex], {
      opacity: isActive ? 1 : 0.48,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: true
    });
  });

  tweenJournalFocus(blobScene, 1);

  if (options.preview) {
    showPreview(elements, index);
  }
}

function clearActiveArticle(elements) {
  const {
    blobScene,
    cursor,
    items,
    links,
    titles,
    indexes,
    metas,
    excerpts,
    arrows,
    dividers
  } = elements;

  if (activeArticleIndex < 0) return;

  activeArticleIndex = -1;
  cursor?.setCursorState?.('default');

  items.forEach((item, index) => {
    item.classList.remove('is-active');
    gsap.to(links[index], { opacity: 1, duration: 0.28, ease: 'power2.out', overwrite: true });
    gsap.to(titles[index], { x: 0, autoAlpha: 1, duration: 0.34, ease: 'power3.out', overwrite: true });
    gsap.to(indexes[index], { x: 0, autoAlpha: 1, duration: 0.34, ease: 'power3.out', overwrite: true });
    gsap.to(metas[index], { autoAlpha: 1, duration: 0.28, ease: 'power2.out', overwrite: true });
    if (excerpts[index]) {
      gsap.to(excerpts[index], { autoAlpha: 0, y: 8, duration: 0.24, ease: 'power2.out', overwrite: true });
    }
    gsap.to(arrows[index], { x: 0, y: 0, autoAlpha: 0.58, duration: 0.28, ease: 'power2.out', overwrite: true });
    gsap.to(dividers[index], { opacity: 1, duration: 0.28, ease: 'power2.out', overwrite: true });
  });

  hidePreview(elements);
  blobScene?.clearTexture?.({ duration: 0.48 });
  tweenJournalFocus(blobScene, 0);
}

function showPreview(elements, index) {
  const { items, preview, previewImage, pointer } = elements;

  if (!preview || !previewImage) return;

  const item = items[index];
  const imageUrl = item?.dataset.journalImage || item?.dataset.img || '';

  if (!imageUrl || item?.dataset.previewInvalid === 'true') {
    hidePreview(elements);
    return;
  }

  const revealPreview = () => {
    if (activeArticleIndex !== index || item.dataset.previewInvalid === 'true') return;

    if (pointer?.state) {
      const { x, y } = getPreviewPosition(preview, pointer.state);
      gsap.set(preview, { x, y });
    }

    preview.classList.add('is-active');
    gsap.to(preview, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.28,
      ease: 'power3.out',
      overwrite: true
    });
  };

  const onError = () => {
    item.dataset.previewInvalid = 'true';
    hidePreview(elements);
  };

  previewImage.onerror = onError;
  previewImage.onload = revealPreview;

  if (previewImage.getAttribute('src') !== imageUrl) {
    hidePreview(elements);
    previewImage.src = imageUrl;
    return;
  }

  if (previewImage.complete && previewImage.naturalWidth > 0) {
    revealPreview();
  }
}

function hidePreview(elements) {
  const { preview } = elements;

  if (!preview) return;

  preview.classList.remove('is-active');
  gsap.to(preview, {
    autoAlpha: 0,
    scale: 0.94,
    duration: 0.22,
    ease: 'power2.out',
    overwrite: true
  });
}

function tweenJournalFocus(blobScene, value) {
  gsap.to(focusProxy, {
    value,
    duration: 0.34,
    ease: 'power2.out',
    overwrite: true,
    onUpdate: () => renderJournalBlob(blobScene)
  });
}

function renderJournalBlob(blobScene) {
  if (typeof blobScene?.setJournalProgress === 'function') {
    blobScene.setJournalProgress(activeProgress, focusProxy.value);
    return;
  }

  blobScene?.setState?.(focusProxy.value > 0.4 ? 'journalFocus' : 'journalList');
}

function getPreviewPosition(preview, pointerState) {
  const width = preview.offsetWidth || 320;
  const height = preview.offsetHeight || 220;
  const gap = 28;
  const targetX = pointerState.smoothX + gap;
  const targetY = pointerState.smoothY - height * 0.5;
  const maxX = Math.max(window.innerWidth - width - 18, 18);
  const maxY = Math.max(window.innerHeight - height - 18, 18);

  return {
    x: clamp(targetX, 18, maxX),
    y: clamp(targetY, 18, maxY)
  };
}

function preloadPreviewImages(items) {
  const urls = items
    .map((item) => item.dataset.journalImage || item.dataset.img || '')
    .filter(Boolean);

  if (!urls.length) return;

  const preload = () => {
    urls.forEach((url) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
    });
  };

  if (document.readyState === 'complete') {
    window.requestIdleCallback?.(preload) || window.setTimeout(preload, 500);
    return;
  }

  window.addEventListener('load', preload, { once: true });
  journalCleanups.push(() => window.removeEventListener('load', preload));
}

function attachFontRefresh() {
  if (!document.fonts?.ready) return;

  let cancelled = false;

  document.fonts.ready.then(() => {
    if (!cancelled) ScrollTrigger.refresh();
  });

  journalCleanups.push(() => {
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
  journalCleanups.push(() => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  });
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
