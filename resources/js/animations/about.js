import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let aboutContext = null;
let aboutCleanups = [];
let hasClearedTexture = false;
let activeProgress = 0;

export function initAboutAnimation(input = {}) {
  destroyAboutAnimation();

  const { blobScene, pointer } = normalizeOptions(input);
  const section = document.querySelector('[data-about]');
  const track = section?.querySelector('[data-about-track]');
  const stage = section?.querySelector('[data-about-stage]');

  if (!section || !track || !stage) return null;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const label = section.querySelector('[data-about-label]');
  const index = section.querySelector('[data-about-index]');
  const statement = section.querySelector('[data-about-statement]');
  const lines = gsap.utils.toArray(section.querySelectorAll('[data-about-line]'));
  const emphases = gsap.utils.toArray(section.querySelectorAll('[data-about-emphasis]'));
  const details = section.querySelector('[data-about-details]');
  const metaRows = gsap.utils.toArray(section.querySelectorAll('[data-about-meta-row]'));

  aboutContext = gsap.context(() => {
    if (reduceMotion) {
      setReducedMotionState({ label, index, lines, emphases, details, metaRows });
      blobScene?.clearTexture?.({ duration: 0.24 });
      blobScene?.setAboutProgress?.(0.58, {}, { immediate: true });
      return;
    }

    setInitialState({ label, index, lines, emphases, details, metaRows });
    attachPointerParallax(pointer, statement);
    attachFontRefresh();
    attachResizeRefresh();

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'about-stage',
        trigger: track,
        start: 'top top',
        end: () => `+=${getAboutDuration(lines.length)}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.82,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => renderAboutProgress(self.progress, blobScene),
        onEnter: (self) => renderAboutProgress(self.progress, blobScene),
        onEnterBack: (self) => renderAboutProgress(self.progress, blobScene),
        onLeave: () => {
          renderAboutProgress(1, blobScene);
          blobScene?.setState?.('aboutExit');
        },
        onLeaveBack: () => {
          activeProgress = 0;
          hasClearedTexture = false;
          blobScene?.setState?.('hero');
        }
      }
    });

    timeline
      .to(label, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.02)
      .to(index, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.02)
      .to(lines, {
        '--about-line-y': '0%',
        autoAlpha: 0.66,
        duration: 0.34,
        stagger: 0.065
      }, 0.12)
      .to(lines, {
        autoAlpha: 1,
        duration: 0.2,
        stagger: 0.02
      }, 0.42)
      .to(emphases, {
        '--about-emphasis-opacity': 1,
        duration: 0.22,
        stagger: 0.03
      }, 0.5)
      .to(statement, {
        y: -108,
        duration: 0.16
      }, 0.62)
      .to(details, {
        autoAlpha: 1,
        y: 0,
        duration: 0.22
      }, 0.66)
      .to(metaRows, {
        autoAlpha: 1,
        y: 0,
        duration: 0.18,
        stagger: 0.025
      }, 0.7)
      .to(statement, {
        autoAlpha: 0.78,
        y: -118,
        duration: 0.16
      }, 0.88)
      .to([details, metaRows], {
        autoAlpha: 0.78,
        y: -8,
        duration: 0.12
      }, 0.9);
  }, section);

  return {
    destroy: destroyAboutAnimation
  };
}

export function destroyAboutAnimation() {
  activeProgress = 0;
  hasClearedTexture = false;
  aboutCleanups.forEach((cleanup) => cleanup());
  aboutCleanups = [];
  aboutContext?.revert();
  aboutContext = null;
}

function normalizeOptions(input) {
  if (input && typeof input.setBlobState === 'function') {
    return { blobScene: input, pointer: null };
  }

  return {
    blobScene: input?.blobScene || null,
    pointer: input?.pointer || null
  };
}

function setInitialState(elements) {
  const { label, index, lines, emphases, details, metaRows } = elements;

  gsap.set(label, { autoAlpha: 0, y: 12 });
  gsap.set(index, { autoAlpha: 0, y: 18 });
  gsap.set(lines, { '--about-line-y': '112%', autoAlpha: 0.28 });
  gsap.set(emphases, { '--about-emphasis-opacity': 0.58 });
  gsap.set(details, { autoAlpha: 0, y: 18 });
  gsap.set(metaRows, { autoAlpha: 0, y: 10 });
}

function setReducedMotionState(elements) {
  const { label, index, lines, emphases, details, metaRows } = elements;

  gsap.set(label, { autoAlpha: 1, y: 0 });
  gsap.set(index, { autoAlpha: 1, y: 0 });
  gsap.set(lines, { '--about-line-y': '0%', autoAlpha: 1 });
  gsap.set(emphases, { '--about-emphasis-opacity': 1 });
  gsap.set(details, { autoAlpha: 1, y: 0 });
  gsap.set(metaRows, { autoAlpha: 1, y: 0 });
}

function renderAboutProgress(progress, blobScene) {
  activeProgress = progress;

  if (progress > 0.02 && !hasClearedTexture) {
    hasClearedTexture = true;
    blobScene?.clearTexture?.({ duration: 0.76 });
  }

  if (progress < 0.01) {
    hasClearedTexture = false;
  }

  if (typeof blobScene?.setAboutProgress === 'function') {
    blobScene.setAboutProgress(progress);
    return;
  }

  blobScene?.setState?.(progress > 0.72 ? 'aboutDetails' : 'aboutStatement');
}

function attachPointerParallax(pointer, statement) {
  if (!pointer?.subscribe || !pointer.state?.isFinePointer || !statement) return;

  const setParallaxX = gsap.quickSetter(statement, '--about-parallax-x', 'px');
  const unsubscribe = pointer.subscribe((pointerState) => {
    const transitionDamping = 1 - Math.min(activeProgress * 0.58, 0.58);
    const strength = pointerState.prefersReducedMotion ? 0 : 3.2 * transitionDamping;

    setParallaxX(pointerState.normalizedX * strength);
  });

  aboutCleanups.push(() => {
    unsubscribe();
    setParallaxX(0);
  });
}

function attachFontRefresh() {
  if (!document.fonts?.ready) return;

  let cancelled = false;

  document.fonts.ready.then(() => {
    if (!cancelled) ScrollTrigger.refresh();
  });

  aboutCleanups.push(() => {
    cancelled = true;
  });
}

function attachResizeRefresh() {
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
  };

  window.addEventListener('resize', onResize);
  aboutCleanups.push(() => {
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  });
}

function getAboutDuration(lineCount) {
  const width = window.innerWidth;
  const baseScreens = width < 768 ? 2.35 : width < 1100 ? 2.6 : 2.86;
  const lineScreens = lineCount * (width < 768 ? 0.13 : 0.17);

  return Math.round(window.innerHeight * (baseScreens + lineScreens));
}
