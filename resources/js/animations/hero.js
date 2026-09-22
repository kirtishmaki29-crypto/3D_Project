import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let heroContext = null;
let heroCleanup = [];

export function initHeroAnimation(blobScene, pointer) {
  destroyHero();
  initHero(blobScene, pointer);
}

function initHero(blobScene, pointer) {
  const hero = document.querySelector('[data-hero]');
  const loader = document.querySelector('[data-loader]');

  if (!hero) {
    dismissLoader(loader);
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interaction = {
    progress: prefersReducedMotion ? 0 : 0,
    scroll: 0
  };

  if (blobScene?.setHeroBlobState) {
    blobScene.setHeroBlobState({ intro: true, immediate: true });
  }

  waitForWebGL(blobScene).then(() => {
    heroContext = gsap.context(() => {
      createHeroIntro({ hero, loader, blobScene, prefersReducedMotion, interaction });
      initHeroScroll({ hero, blobScene, prefersReducedMotion, interaction });

      if (!prefersReducedMotion && pointer?.state?.isFinePointer) {
        initHeroPointer({ hero, blobScene, pointer, interaction });
      }
    }, hero);
  });
}

function createHeroIntro({ hero, loader, blobScene, prefersReducedMotion, interaction }) {
  const headerItems = gsap.utils.toArray(document.querySelectorAll('[data-header-item]'));
  const lines = gsap.utils.toArray(hero.querySelectorAll('[data-hero-line]'));
  const statement = hero.querySelector('[data-hero-statement]');
  const scrollIndicator = hero.querySelector('[data-hero-scroll]');

  if (prefersReducedMotion) {
    if (blobScene?.setHeroBlobState) {
      blobScene.setHeroBlobState({ immediate: true });
      blobScene.setBlobState({ interactionStrength: 0 }, { immediate: true });
    }

    gsap.set(lines, { '--hero-line-y': '0%' });
    gsap.set([headerItems, statement, scrollIndicator].flat().filter(Boolean), {
      autoAlpha: 1,
      x: 0,
      y: 0,
      clearProps: 'transform'
    });
    dismissLoader(loader);
    return;
  }

  const heroState = blobScene?.getHeroBlobState ? blobScene.getHeroBlobState() : null;
  const introState = blobScene?.getHeroBlobState ? blobScene.getHeroBlobState({ intro: true }) : null;
  const blobProxy = introState ? { ...introState } : null;

  gsap.set(lines, { '--hero-line-y': '112%' });
  gsap.set(headerItems, { autoAlpha: 0, y: -8 });
  if (statement) gsap.set(statement, { autoAlpha: 0, y: 12 });
  if (scrollIndicator) gsap.set(scrollIndicator, { autoAlpha: 0, xPercent: -50, y: 6 });
  if (loader) gsap.set(loader, { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1 });

  const tl = gsap.timeline({
    delay: 0.08,
    defaults: { ease: 'power4.out' }
  });

  if (loader) {
    tl.to(loader, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.95,
      ease: 'power4.inOut',
      onComplete: () => dismissLoader(loader)
    }, 0.06);
  }

  if (blobScene && blobProxy && heroState) {
    tl.to(blobProxy, {
      x: heroState.x,
      y: heroState.y,
      scale: heroState.scale,
      distortion: heroState.distortion,
      opacity: heroState.opacity,
      cameraZ: heroState.cameraZ,
      colorIntensity: heroState.colorIntensity,
      reveal: heroState.reveal,
      noiseStrength: heroState.noiseStrength,
      noiseSpeed: heroState.noiseSpeed,
      hoverStrength: heroState.hoverStrength,
      pointerInfluence: heroState.pointerInfluence,
      interactionStrength: heroState.interactionStrength,
      duration: 1.85,
      ease: 'power3.out',
      onUpdate: () => blobScene.setBlobState(blobProxy)
    }, 0.24);
  }

  if (blobScene && interaction) {
    tl.to(interaction, {
      progress: 1,
      duration: 0.9,
      ease: 'power3.out',
      onUpdate: () => blobScene.setBlobState({ interactionStrength: interaction.progress * (1 - interaction.scroll) })
    }, 1.55);
  }

  if (lines.length) {
    tl.to(lines, {
      '--hero-line-y': '0%',
      duration: 1.34,
      stagger: 0.1
    }, 0.92);
  }

  if (statement) {
    tl.to(statement, {
      autoAlpha: 1,
      y: 0,
      duration: 0.78,
      ease: 'power3.out'
    }, 1.32);
  }

  if (headerItems.length) {
    tl.to(headerItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.58,
      stagger: 0.07,
      ease: 'power3.out'
    }, 1.43);
  }

  if (scrollIndicator) {
    tl.to(scrollIndicator, {
      autoAlpha: 1,
      y: 0,
      duration: 0.52,
      ease: 'power3.out',
      onComplete: () => initScrollPulse(scrollIndicator)
    }, 1.86);
  }
}

function initHeroPointer({ hero, blobScene, pointer, interaction }) {
  const title = hero.querySelector('[data-hero-title]');
  const lineMasks = gsap.utils.toArray(hero.querySelectorAll('.hero__line-mask'));
  const statement = hero.querySelector('[data-hero-statement]');
  const scrollIndicator = hero.querySelector('[data-hero-scroll]');
  const canUsePointer = !window.matchMedia('(pointer: coarse)').matches;

  if (!canUsePointer || !pointer || (!title && !statement && !blobScene)) return;

  const titleX = title ? gsap.quickTo(title, 'x', { duration: 1.2, ease: 'power3.out' }) : null;
  const titleY = title ? gsap.quickTo(title, 'y', { duration: 1.2, ease: 'power3.out' }) : null;
  const lineXSetters = lineMasks.map((mask) => gsap.quickTo(mask, 'x', { duration: 1.25, ease: 'power3.out' }));
  const statementX = statement ? gsap.quickTo(statement, 'x', { duration: 1.1, ease: 'power3.out' }) : null;
  const statementY = statement ? gsap.quickTo(statement, 'y', { duration: 1.1, ease: 'power3.out' }) : null;
  const scrollX = scrollIndicator ? gsap.quickTo(scrollIndicator, 'xPercent', { duration: 0.9, ease: 'power3.out' }) : null;
  const scrollY = scrollIndicator ? gsap.quickTo(scrollIndicator, 'y', { duration: 0.9, ease: 'power3.out' }) : null;

  const unsubscribe = pointer.subscribe((pointerState) => {
    const x = pointerState.normalizedX;
    const y = pointerState.normalizedY;
    const speed = Math.min(pointerState.speed / 44, 1);
    const strength = interaction.progress * (1 - Math.min(interaction.scroll * 1.3, 0.9));

    blobScene?.setPointer?.(x, y);
    blobScene?.setPointerVelocity?.(speed);
    titleX?.(x * -4.2 * strength);
    titleY?.(y * 2.6 * strength);
    lineXSetters.forEach((setLineX, index) => {
      const direction = index % 2 === 0 ? -1 : 1;

      setLineX(x * (2.2 + index * 0.35) * direction * strength);
    });
    statementX?.(x * 2.5 * strength);
    statementY?.(y * -1.8 * strength);
    scrollX?.(-50 + x * 1.4 * strength);
    scrollY?.(y * -1.2 * strength);
  });

  addCleanup(unsubscribe);
}

function initHeroScroll({ hero, blobScene, prefersReducedMotion, interaction }) {
  const copyBack = hero.querySelector('[data-hero-copy-back]');
  const statement = hero.querySelector('[data-hero-statement]');
  const scrollIndicator = hero.querySelector('[data-hero-scroll]');

  if (scrollIndicator) {
    const scrollOpacity = gsap.quickTo(scrollIndicator, 'opacity', {
      duration: 0.24,
      ease: 'power2.out'
    });
    const onScroll = () => scrollOpacity(window.scrollY > 12 ? 0 : 1);

    window.addEventListener('scroll', onScroll, { passive: true });
    addCleanup(() => window.removeEventListener('scroll', onScroll));
  }

  if (prefersReducedMotion) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '42% top',
      scrub: true,
      onEnter: () => blobScene?.clearTexture?.({ duration: 0.48 }),
      onEnterBack: () => blobScene?.clearTexture?.({ duration: 0.48 }),
      onUpdate: (self) => {
        interaction.scroll = self.progress;
        updateHeroBlobForScroll(blobScene, self.progress, interaction);
      }
    }
  });

  if (statement) {
    tl.to(statement, { autoAlpha: 0.35, y: -8, duration: 1 }, 0);
  }

  if (copyBack) {
    tl.to(copyBack, { y: -30, duration: 1 }, 0);
  }
}

function initScrollPulse(scrollIndicator) {
  const pulse = gsap.to(scrollIndicator, {
    y: 3,
    duration: 1.35,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  addCleanup(() => pulse.kill());
}

function updateHeroBlobForScroll(blobScene, progress, interaction) {
  if (!blobScene?.getHeroBlobState) return;

  const state = blobScene.getHeroBlobState();

  blobScene.setBlobState({
    x: state.x - progress * 0.06,
    y: state.y + progress * 0.08,
    scale: state.scale - progress * 0.05,
    distortion: state.distortion + progress * 0.08,
    opacity: state.opacity,
    cameraZ: state.cameraZ + progress * 0.28,
    colorIntensity: state.colorIntensity - progress * 0.08,
    scrollProgress: progress,
    interactionStrength: interaction ? interaction.progress * (1 - Math.min(progress * 1.25, 0.9)) : 1,
    pointerInfluence: state.pointerInfluence
  });
}

function waitForWebGL(blobScene) {
  if (blobScene?.whenReady) {
    return Promise.race([
      blobScene.whenReady(),
      new Promise((resolve) => window.setTimeout(resolve, 1600))
    ]);
  }

  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function dismissLoader(loader) {
  if (!loader) return;

  loader.classList.add('is-loaded');
}

function addCleanup(callback) {
  heroCleanup.push(callback);
}

export function destroyHero() {
  heroContext?.revert();
  heroContext = null;

  heroCleanup.forEach((callback) => callback());
  heroCleanup = [];
}
