import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let workContext = null;
let workDomCleanups = [];
let activeIndex = -1;

export function initProjectsAnimation(blobScene) {
  destroyProjectsAnimation();

  const section = document.querySelector('[data-work]');
  const track = section?.querySelector('[data-work-track]');
  const stage = section?.querySelector('[data-work-stage]');
  const projects = gsap.utils.toArray(section?.querySelectorAll('[data-work-project]') || []);

  if (!section || !track || !stage || !projects.length) return null;

  const introItems = gsap.utils.toArray(section.querySelectorAll('[data-work-intro-item]'));
  const current = section.querySelector('[data-work-current]');
  const progressBar = section.querySelector('[data-work-progress]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const titleLines = projects.map((project) => project.querySelector('[data-work-project-title-line]'));
  const details = projects.map((project) => project.querySelector('[data-work-project-details]'));
  const projectLinks = projects.map((project) => project.querySelector('[data-project-link]'));

  workContext = gsap.context(() => {
    if (reduceMotion) {
      setReducedMotionState(projects, titleLines, details, projectLinks, current, progressBar);
      createReducedMotionBlobTrigger(section, projects[0], blobScene);
      return;
    }

    gsap.set(introItems, { autoAlpha: 0, y: 14 });
    gsap.set(progressBar, { scaleX: 0 });
    projects.forEach((project, index) => {
      gsap.set(project, {
        autoAlpha: index === 0 ? 1 : 0,
        pointerEvents: index === 0 ? 'auto' : 'none'
      });
      gsap.set(titleLines[index], { '--work-title-y': index === 0 ? '0%' : '112%' });
      gsap.set(details[index], { autoAlpha: index === 0 ? 1 : 0, y: index === 0 ? 0 : 18 });
      projectLinks[index]?.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    activeIndex = -1;
    const firstProjectImage = projects[0]?.dataset.projectImage || projects[0]?.dataset.img || null;
    const setWorkIntroBlob = () => {
      blobScene?.setState?.('workIntro');
      blobScene?.setProjectTexture?.(firstProjectImage);
    };

    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 76%',
        end: 'top 28%',
        toggleActions: 'play none none reverse',
        onEnter: setWorkIntroBlob,
        onEnterBack: setWorkIntroBlob
      }
    }).to(introItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out'
    });

    ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: () => `+=${Math.max(window.innerHeight * projects.length * 1.08, window.innerHeight)}`,
      pin: stage,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => renderWorkProgress(self.progress, {
        projects,
        titleLines,
        details,
        projectLinks,
        current,
        progressBar,
        blobScene
      }),
      onEnter: (self) => renderWorkProgress(self.progress, {
        projects,
        titleLines,
        details,
        projectLinks,
        current,
        progressBar,
        blobScene
      }),
      onLeave: () => {
        blobScene?.setState?.('workExit');
        blobScene?.clearTexture?.({ duration: 0.78 });
      },
      onEnterBack: () => {
        const progress = ScrollTrigger.getById('work-project-stage')?.progress || 1;
        renderWorkProgress(progress, {
          projects,
          titleLines,
          details,
          projectLinks,
          current,
          progressBar,
          blobScene
        });
      },
      id: 'work-project-stage'
    });

    projects.forEach((project, index) => {
      const imageUrl = project.dataset.projectImage || project.dataset.img || null;
      const onEnter = () => {
        blobScene?.setWorkProjectState?.(index);
        blobScene?.setProjectTexture?.(imageUrl, project);
      };
      const onLeave = () => {
        const restoreIndex = activeIndex >= 0 ? activeIndex : index;
        setProjectBlob(blobScene, projects[restoreIndex] || project, restoreIndex);
      };

      project.addEventListener('mouseenter', onEnter);
      project.addEventListener('mouseleave', onLeave);
      workDomCleanups.push(() => {
        project.removeEventListener('mouseenter', onEnter);
        project.removeEventListener('mouseleave', onLeave);
      });
    });
  }, section);

  return {
    destroy: destroyProjectsAnimation
  };
}

export function destroyProjectsAnimation() {
  activeIndex = -1;
  workDomCleanups.forEach((cleanup) => cleanup());
  workDomCleanups = [];
  workContext?.revert();
  workContext = null;
}

function renderWorkProgress(progress, elements) {
  const {
    projects,
    titleLines,
    details,
    projectLinks,
    current,
    progressBar,
    blobScene
  } = elements;
  const maxIndex = projects.length - 1;
  const floatIndex = maxIndex === 0 ? 0 : progress * maxIndex;
  const nextActiveIndex = Math.min(maxIndex, Math.max(0, Math.round(floatIndex)));

  gsap.set(progressBar, { scaleX: progress });

  projects.forEach((project, index) => {
    const distance = index - floatIndex;
    const absoluteDistance = Math.abs(distance);
    const opacity = clamp(1 - absoluteDistance * 1.45, 0, 1);
    const titleY = clamp(distance * 112, -112, 112);
    const detailsY = clamp(distance * 28, -28, 28);
    const isActive = index === nextActiveIndex;

    project.classList.toggle('is-active', isActive);
    gsap.set(project, {
      autoAlpha: opacity,
      pointerEvents: isActive ? 'auto' : 'none'
    });
    gsap.set(titleLines[index], { '--work-title-y': `${titleY}%` });
    gsap.set(details[index], {
      autoAlpha: clamp(1 - absoluteDistance * 1.9, 0, 1),
      y: detailsY
    });
    projectLinks[index]?.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  if (nextActiveIndex !== activeIndex) {
    activeIndex = nextActiveIndex;
    updateCounter(current, nextActiveIndex + 1);
    setProjectBlob(blobScene, projects[nextActiveIndex], nextActiveIndex);
  }

  blobScene?.setBlobState?.({
    scrollProgress: progress,
    distortion: 1.02 + progress * 0.08,
    interactionStrength: 0.88 - progress * 0.08
  });
}

function setProjectBlob(blobScene, project, index, options = {}) {
  if (!blobScene || !project) return;

  const imageUrl = project.dataset.projectImage || project.dataset.img || null;

  if (typeof blobScene.setWorkProjectState === 'function') {
    blobScene.setWorkProjectState(index, {}, options);
  } else {
    blobScene.setPosition(index % 2 === 0 ? 0.28 : -0.24, 0);
    blobScene.setScale(1.14);
    blobScene.setDistortion(1.08);
  }

  if (typeof blobScene.setProjectTexture === 'function') {
    blobScene.setProjectTexture(imageUrl, project);
  } else {
    blobScene.setTexture?.(imageUrl);
  }
}

function setReducedMotionState(projects, titleLines, details, projectLinks, current, progressBar) {
  projects.forEach((project, index) => {
    project.classList.add('is-active');
    gsap.set(project, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(titleLines[index], { '--work-title-y': '0%' });
    gsap.set(details[index], { autoAlpha: 1, y: 0 });
    projectLinks[index]?.setAttribute('tabindex', '0');
  });

  if (current) current.textContent = '01';
  gsap.set(progressBar, { scaleX: 1 });
}

function createReducedMotionBlobTrigger(section, project, blobScene) {
  if (!section || !project || !blobScene) return;

  ScrollTrigger.create({
    id: 'work-reduced-blob',
    trigger: section,
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => setProjectBlob(blobScene, project, 0, { immediate: true }),
    onEnterBack: () => setProjectBlob(blobScene, project, 0, { immediate: true }),
    onLeaveBack: () => blobScene?.setState?.('hero')
  });
}

function updateCounter(current, value) {
  if (!current) return;

  const label = String(value).padStart(2, '0');

  if (current.textContent === label) return;

  gsap.fromTo(current, {
    y: 8,
    opacity: 0.35
  }, {
    y: 0,
    opacity: 1,
    duration: 0.28,
    ease: 'power2.out'
  });
  current.textContent = label;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
