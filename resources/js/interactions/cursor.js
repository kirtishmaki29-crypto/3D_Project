const CURSOR_STATES = {
  default: {
    size: 9,
    opacity: 0.72,
    borderOpacity: 0
  },
  interactive: {
    size: 21,
    opacity: 0.78,
    borderOpacity: 0.5
  },
  menu: {
    size: 25,
    opacity: 0.82,
    borderOpacity: 0.62
  },
  project: {
    size: 30,
    opacity: 0.84,
    borderOpacity: 0.68
  },
  article: {
    size: 28,
    opacity: 0.82,
    borderOpacity: 0.62
  },
  contact: {
    size: 29,
    opacity: 0.84,
    borderOpacity: 0.64
  }
};

export function initCursor(pointer) {
  if (!pointer?.state?.isFinePointer) return null;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.dataset.cursor = '';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="cursor__dot"></span>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add('has-custom-cursor');

  let stateName = 'default';
  let renderedSize = CURSOR_STATES.default.size;
  let renderedOpacity = CURSOR_STATES.default.opacity;
  let renderedBorderOpacity = CURSOR_STATES.default.borderOpacity;
  let lastAngle = 0;

  const setCursorState = (nextState) => {
    stateName = CURSOR_STATES[nextState] ? nextState : 'default';
    cursor.dataset.cursorState = stateName;
  };

  setCursorState('default');

  const interactiveSelector = 'a, button, [data-cursor-state]';

  const onPointerOver = (event) => {
    const target = event.target.closest?.(interactiveSelector);

    if (!target) return;

    setCursorState(target.dataset.cursorState || 'interactive');
  };

  const onPointerOut = (event) => {
    const from = event.target.closest?.(interactiveSelector);
    const to = event.relatedTarget?.closest?.(interactiveSelector);

    if (!from || from === to) return;

    setCursorState('default');
  };

  const unsubscribe = pointer.subscribe((pointerState) => {
    const target = CURSOR_STATES[stateName] || CURSOR_STATES.default;
    const speedFactor = pointerState.prefersReducedMotion ? 0 : Math.min(pointerState.speed / 44, 1);
    const stretchX = 1 + speedFactor * 0.12;
    const stretchY = 1 - speedFactor * 0.08;
    const angle = Math.atan2(pointerState.velocityY, pointerState.velocityX || 0.001) * (180 / Math.PI);

    renderedSize += (target.size - renderedSize) * 0.2;
    renderedOpacity += (target.opacity - renderedOpacity) * 0.18;
    renderedBorderOpacity += (target.borderOpacity - renderedBorderOpacity) * 0.18;

    if (!pointerState.prefersReducedMotion && pointerState.speed > 0.2) {
      lastAngle += (angle - lastAngle) * 0.16;
    } else {
      lastAngle += (0 - lastAngle) * 0.08;
    }

    cursor.style.setProperty('--cursor-size', `${renderedSize}px`);
    cursor.style.setProperty('--cursor-opacity', renderedOpacity.toFixed(3));
    cursor.style.setProperty('--cursor-border-opacity', renderedBorderOpacity.toFixed(3));
    cursor.style.transform = `translate3d(${pointerState.smoothX}px, ${pointerState.smoothY}px, 0) translate(-50%, -50%) rotate(${lastAngle}deg) scale(${stretchX}, ${stretchY})`;
  });

  document.addEventListener('pointerover', onPointerOver, true);
  document.addEventListener('pointerout', onPointerOut, true);

  return {
    setCursorState,
    destroy() {
      unsubscribe();
      document.removeEventListener('pointerover', onPointerOver, true);
      document.removeEventListener('pointerout', onPointerOut, true);
      document.documentElement.classList.remove('has-custom-cursor');
      cursor.remove();
    }
  };
}
