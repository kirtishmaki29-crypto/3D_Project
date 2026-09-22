import gsap from 'gsap';

const MAGNETIC_CONFIG = {
  logo: {
    radius: 68,
    strength: 0.08
  },
  menu: {
    radius: 82,
    strength: 0.12
  }
};

export function initMagnetic(pointer) {
  if (!pointer?.state?.isFinePointer || pointer.state.prefersReducedMotion) return null;

  const elements = [...document.querySelectorAll('[data-magnetic]')].map((element) => {
    const inner = element.querySelector('[data-magnetic-inner]') || element;
    const config = element.matches('[data-menu-trigger]') ? MAGNETIC_CONFIG.menu : MAGNETIC_CONFIG.logo;

    return {
      element,
      inner,
      config,
      rect: null,
      isActive: false,
      xTo: gsap.quickTo(inner, 'x', { duration: 0.45, ease: 'power3.out' }),
      yTo: gsap.quickTo(inner, 'y', { duration: 0.45, ease: 'power3.out' })
    };
  });

  const onEnter = (item) => {
    item.rect = item.element.getBoundingClientRect();
    item.isActive = true;
  };

  const onLeave = (item) => {
    item.isActive = false;
    item.xTo(0);
    item.yTo(0);
  };

  const listeners = [];

  elements.forEach((item) => {
    const enter = () => onEnter(item);
    const leave = () => onLeave(item);
    const focus = () => onEnter(item);
    const blur = () => onLeave(item);

    item.element.addEventListener('pointerenter', enter, { passive: true });
    item.element.addEventListener('pointerleave', leave, { passive: true });
    item.element.addEventListener('focus', focus);
    item.element.addEventListener('blur', blur);
    listeners.push({ item, enter, leave, focus, blur });
  });

  const unsubscribe = pointer.subscribe((pointerState) => {
    elements.forEach((item) => {
      if (!item.isActive || !item.rect) return;

      const centerX = item.rect.left + item.rect.width * 0.5;
      const centerY = item.rect.top + item.rect.height * 0.5;
      const deltaX = pointerState.rawX - centerX;
      const deltaY = pointerState.rawY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > item.config.radius) {
        item.xTo(0);
        item.yTo(0);
        return;
      }

      const falloff = 1 - distance / item.config.radius;
      item.xTo(deltaX * item.config.strength * falloff);
      item.yTo(deltaY * item.config.strength * falloff);
    });
  });

  const onResize = () => {
    elements.forEach((item) => {
      item.rect = null;
      item.isActive = false;
      item.xTo(0);
      item.yTo(0);
    });
  };

  window.addEventListener('resize', onResize, { passive: true });

  return {
    destroy() {
      unsubscribe();
      listeners.forEach(({ item, enter, leave, focus, blur }) => {
        item.element.removeEventListener('pointerenter', enter);
        item.element.removeEventListener('pointerleave', leave);
        item.element.removeEventListener('focus', focus);
        item.element.removeEventListener('blur', blur);
        item.xTo(0);
        item.yTo(0);
      });
      window.removeEventListener('resize', onResize);
    }
  };
}
