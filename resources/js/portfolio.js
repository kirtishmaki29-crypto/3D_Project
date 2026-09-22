import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlobScene } from './webgl/BlobScene.js';
import { initHeroAnimation } from './animations/hero.js';
import { initProjectsAnimation } from './animations/projects.js';
import { initAboutAnimation } from './animations/about.js';
import { initCapabilitiesAnimation } from './animations/capabilities.js';
import { initJournalAnimation } from './animations/articles.js';
import { initContactAnimation } from './animations/footer.js';
import { initPointer } from './interactions/pointer.js';
import { initCursor } from './interactions/cursor.js';
import { initMagnetic } from './interactions/magnetic.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', initApp);

let appCleanup = [];

function initApp() {
  cleanupApp();

  const pointer = initPointer();
  const blobScene = initWebGL(pointer);
  const cursor = initCursor(pointer);
  const magnetic = initMagnetic(pointer);

  const header = initHeader();
  initHero(blobScene, pointer);
  initWork(blobScene);
  initAbout(blobScene, pointer);
  initCapabilities(blobScene, pointer);
  initJournal(blobScene, pointer, cursor);
  initContact(blobScene, pointer, cursor);
  const smoothAnchors = initSmoothAnchors();
  const scrollTracker = initScrollDirectionTracker(blobScene);

  const refreshOnLoad = () => ScrollTrigger.refresh();

  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener('load', refreshOnLoad, { once: true });

  [pointer, cursor, magnetic, header, smoothAnchors, scrollTracker].filter(Boolean).forEach((system) => {
    appCleanup.push(() => system.destroy?.());
  });
  appCleanup.push(() => window.removeEventListener('load', refreshOnLoad));
}

function initScrollDirectionTracker(blobScene) {
  if (!blobScene) return null;

  let currentDirection = 'down';
  let previousScroll = window.scrollY || 0;
  let previousVelocity = 0;

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const currentScroll = window.scrollY || 0;
      const newDirection = self.direction === -1 ? 'up' : 'down';
      const velocity = Math.abs(self.getVelocity?.() || (currentScroll - previousScroll));
      const acceleration = velocity - previousVelocity;

      blobScene.setScrollMetrics?.({
        direction: newDirection,
        velocity,
        acceleration,
        progress: self.progress
      });

      if (currentDirection !== newDirection) {
        currentDirection = newDirection;
        blobScene.setScrollDirection?.(newDirection);
      }

      previousScroll = currentScroll;
      previousVelocity = velocity;
    }
  });

  return {
    destroy() {
      trigger.kill();
    }
  };
}

function cleanupApp() {
  appCleanup.forEach((cleanup) => cleanup());
  appCleanup = [];
}

function initWebGL(pointer) {
  const stage = document.querySelector('[data-webgl]');

  if (!stage) return null;

  try {
    return new BlobScene(stage, { pointer });
  } catch {
    return null;
  }
}

function initHeader() {
  const header = document.querySelector('[data-header]');
  const trigger = document.querySelector('[data-menu-trigger]');

  if (!header || !trigger) return null;

  const onClick = () => {
    const label = trigger.querySelector('[data-magnetic-inner]') || trigger;

    gsap.fromTo(label, {
      y: 0,
      opacity: 1
    }, {
      y: -2,
      opacity: 0.72,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    });
    trigger.dispatchEvent(new CustomEvent('portfolio:menu-trigger'));
  };

  trigger.addEventListener('click', onClick);

  return {
    destroy() {
      trigger.removeEventListener('click', onClick);
    }
  };
}

function initHero(blobScene, pointer) {
  initHeroAnimation(blobScene, pointer);
}

function initWork(blobScene) {
  const work = initProjectsAnimation(blobScene);

  if (work) appCleanup.push(() => work.destroy?.());
}

function initAbout(blobScene, pointer) {
  const about = initAboutAnimation({ blobScene, pointer });

  if (about) appCleanup.push(() => about.destroy?.());
}

function initCapabilities(blobScene, pointer) {
  const capabilities = initCapabilitiesAnimation({ blobScene, pointer });

  if (capabilities) appCleanup.push(() => capabilities.destroy?.());
}

function initJournal(blobScene, pointer, cursor) {
  const journal = initJournalAnimation({ blobScene, pointer, cursor });

  if (journal) appCleanup.push(() => journal.destroy?.());
}

function initContact(blobScene, pointer, cursor) {
  const contact = initContactAnimation({ blobScene, pointer, cursor });

  if (contact) appCleanup.push(() => contact.destroy?.());
}

function initSmoothAnchors() {
  const cleanups = [];

  const handleScrollTo = (event, targetSelector) => {
    event.preventDefault();
    if (!targetSelector || targetSelector === '#' || targetSelector === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = document.querySelector(targetSelector);
    if (targetEl) {
      const headerOffset = 64;
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };

  // 1. All hash links (a[href^="#"])
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const onClick = (event) => {
      const href = anchor.getAttribute('href');
      if (!href) return;
      handleScrollTo(event, href);
    };
    anchor.addEventListener('click', onClick);
    cleanups.push(() => anchor.removeEventListener('click', onClick));
  });

  // 2. Brand / Logo click -> Return to top
  document.querySelectorAll('[data-header-brand]').forEach((brand) => {
    const onClick = (event) => handleScrollTo(event, '#hero');
    brand.addEventListener('click', onClick);
    cleanups.push(() => brand.removeEventListener('click', onClick));
  });

  // 3. Back to top button
  document.querySelectorAll('[data-back-to-top]').forEach((btn) => {
    const onClick = (event) => handleScrollTo(event, '#hero');
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  return {
    destroy() {
      cleanups.forEach((cleanup) => cleanup());
    }
  };
}
