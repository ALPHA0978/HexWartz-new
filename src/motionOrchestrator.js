import { animate } from 'framer-motion/dom/mini';
import { spring } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];
const GROUPS = '.hero-brand-lockup, .hero-tagline-arcane, .hero-arcane-desc, .hero-date-badge, .hero-feature-pills, .hero-action-row, .hero-community-actions, .landing-section-head, .house-track-card, .codex-pill-item, .codex-card, .codex-action-strip, .clean-vault-card, .prophet-moving-photo-frame, .prophet-article-body, .faq-card, .contact-card, .landing-footer, .journey-scene-copy';
const ACTIONS = '.hero-action-row a, .hero-community-actions a, .codex-strip-actions a, .prophet-action-strip a, .contact-action, .header-music-toggle, .landing-menu-toggle, .proper-probe-btn, .journey-chapter, .letter-invitation-trigger, .invitation-close';

export function setupSiteMotion(scope) {
  const seen = new WeakSet();
  const active = new Map();
  const groups = [...scope.querySelectorAll(GROUPS)];
  const interactions = new WeakMap();
  let disposed = false;

  const restore = (element, saved) => {
    for (const [property, value] of Object.entries(saved)) {
      if (value) element.style.setProperty(property, value);
      else element.style.removeProperty(property);
    }
  };
  const run = (element, frames, options, savedOverride) => {
    if (disposed || !element.isConnected) return;
    const previous = active.get(element);
    previous?.control.stop();
    const saved = savedOverride || previous?.saved || Object.fromEntries(
      Object.keys(frames).map(property => [property, element.style.getPropertyValue(property)])
    );
    const control = animate(element, frames, options);
    const entry = { control, saved };
    active.set(element, entry);
    control.then(() => {
      if (active.get(element) !== entry) return;
      restore(element, saved);
      active.delete(element);
    });
  };
  const enter = (element, delay = 0, distance = 12) => {
    const base = getComputedStyle(element).transform;
    run(element, {
      opacity: [0, 1],
      transform: [`translate3d(0, ${distance}px, 0) ${base === 'none' ? '' : base}`.trim(), base],
    }, { duration: 0.55, delay, ease: EASE });
  };
  const reveal = group => {
    if (seen.has(group) || group.closest('.journey-scene[aria-hidden="true"]')) return;
    seen.add(group);
    observer.unobserve(group);
    const words = [...group.querySelectorAll('.motion-word')];
    const isHeading = group.matches('.landing-section-head');
    const isCard = group.matches('.house-track-card, .codex-card, .contact-card');
    if (isCard) {
      run(group, { opacity: [0, 1] }, { duration: 0.45, ease: EASE });
      const details = group.querySelectorAll('.house-card-header, .track-desc, .house-card-footer, .codex-card-meta, .codex-card-tagline, .codex-list-item, .codex-card-footer, .contact-eyebrow, .contact-number, .contact-icon, .contact-card > p:not(.contact-eyebrow), .contact-card > .contact-action');
      details.forEach((element, index) => enter(element, Math.min(index * 0.035, 0.21), 8));
    } else if (isHeading) {
      group.querySelectorAll(':scope > .section-cutout, :scope > .section-kicker-sparkles, :scope > .section-kicker, :scope > .section-desc-3d')
        .forEach((element, index) => enter(element, index * 0.055, 10));
    } else {
      const children = group.matches('.hero-action-row, .hero-community-actions, .hero-feature-pills, .landing-footer, .prophet-article-body, .journey-scene-copy')
        ? [...group.children].filter(element => !element.querySelector('.motion-word')) : [];
      if (children.length) children.forEach((element, index) => enter(element, Math.min(index * 0.05, 0.2), 10));
      else if (!words.length) enter(group, 0, 12);
    }
    words.forEach((word, index) => enter(word, Math.min(index * 0.025, 0.24), 9));
    group.removeAttribute('data-motion-pending');
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  groups.forEach(group => {
    if (group.getBoundingClientRect().bottom < 0) { seen.add(group); return; }
    group.setAttribute('data-motion-pending', '');
    observer.observe(group);
  });

  // React owns content. Only new FAQ panes and changed chapter/menu state are observed.
  const changes = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'attributes') {
        if (record.target.matches('.landing-nav.is-open')) {
          enter(record.target, 0, -6);
          record.target.querySelectorAll('a').forEach((link, index) => enter(link, index * 0.018, 5));
        } else if (record.target.matches('.journey-scene[aria-hidden="false"]')) {
          const copy = record.target.querySelector('.journey-scene-copy');
          if (copy && copy.getBoundingClientRect().top < window.innerHeight) reveal(copy);
        }
      } else {
        record.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.matches('.faq-answer-pane')) enter(node, 0, 6);
        });
      }
    });
  });
  const faq = scope.querySelector('.faq-list');
  if (faq) changes.observe(faq, { childList: true, subtree: true });
  scope.querySelectorAll('.journey-scene').forEach(scene => changes.observe(scene, { attributes: true, attributeFilter: ['aria-hidden'] }));
  const navigation = scope.querySelector('.landing-nav');
  if (navigation) changes.observe(navigation, { attributes: true, attributeFilter: ['class'] });

  const actionFor = event => event.target instanceof Element ? event.target.closest(ACTIONS) : null;
  const interact = (element, scale) => {
    // A click still works during an entrance; don't interrupt its opacity cleanup.
    if (active.get(element)?.saved.opacity !== undefined) return;
    let resting = interactions.get(element);
    if (!resting) {
      resting = { transform: element.style.transform, base: getComputedStyle(element).transform };
      interactions.set(element, resting);
    }
    run(element, { transform: `${resting.base === 'none' ? '' : resting.base} scale(${scale})`.trim() },
      { type: spring, stiffness: 420, damping: 30, mass: 0.6 }, { transform: resting.transform });
  };
  const pointerOver = event => {
    if (event.pointerType !== 'mouse') return;
    const element = actionFor(event);
    if (!element || element.contains(event.relatedTarget) || active.has(element)) return;
    interact(element, 1.025);
  };
  const pointerOut = event => {
    const element = actionFor(event);
    if (!element || element.contains(event.relatedTarget)) return;
    interact(element, 1);
    interactions.delete(element);
  };
  const pointerDown = event => {
    const element = actionFor(event);
    if (element && !element.disabled) interact(element, 0.975);
  };
  const pointerUp = event => {
    const element = actionFor(event);
    if (element) { interact(element, 1); interactions.delete(element); }
  };
  const visibility = () => active.forEach(({ control }) => document.hidden ? control.pause() : control.play());
  scope.addEventListener('pointerover', pointerOver);
  scope.addEventListener('pointerout', pointerOut);
  scope.addEventListener('pointerdown', pointerDown);
  scope.addEventListener('pointerup', pointerUp);
  scope.addEventListener('pointercancel', pointerUp);
  document.addEventListener('visibilitychange', visibility);

  return () => {
    disposed = true;
    observer.disconnect();
    changes.disconnect();
    active.forEach(({ control, saved }, element) => { control.stop(); restore(element, saved); });
    active.clear();
    groups.forEach(group => group.removeAttribute('data-motion-pending'));
    scope.removeEventListener('pointerover', pointerOver);
    scope.removeEventListener('pointerout', pointerOut);
    scope.removeEventListener('pointerdown', pointerDown);
    scope.removeEventListener('pointerup', pointerUp);
    scope.removeEventListener('pointercancel', pointerUp);
    document.removeEventListener('visibilitychange', visibility);
  };
}
