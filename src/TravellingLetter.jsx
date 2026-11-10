import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

// Preserve the original owl-post flight path, cached measurements, and reduced motion.
export default function TravellingLetter({ enabled, onOpen }) {
  const envelopeRef = useRef(null);
  useEffect(() => {
    const envelope = envelopeRef.current;
    if (!envelope || !enabled) return undefined;

    const hero = document.querySelector('.landing-hero');
    const showcase = document.querySelector('.campus-showcase');
    const heroArt = document.querySelector('.landing-hero-art');
    const challenge = document.querySelector('.challenge-section');
    const journey = document.querySelector('.journey-section');
    const prizes = document.querySelector('.prizes-section');
    const registration = document.querySelector('.registration-section');
    const faq = document.querySelector('.faq-section');
    const contact = document.querySelector('.contact-section');
    const footer = document.querySelector('.landing-footer');
    const sections = [hero, showcase, challenge, journey, prizes, registration, faq, contact, footer];
    const sectionTops = new Map();
    let envelopeWidth = envelope.offsetWidth;
    let scrollDirty = true;

    let frameId = 0;
    let lastFrameTime = 0;
    let currentPose = null;
    let targetPose = null;
    let attachedToOwl = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = preference.matches;
    let heroGeometry = null;
    let heroAnimation = null;
    const measureHero = () => {
      if (!heroArt) return;
      const rect = heroArt.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(heroArt).transform);
      const width = heroArt.offsetWidth;
      const height = heroArt.offsetHeight;
      heroGeometry = {
        left: rect.left - (width - rect.width) / 2 - matrix.m41,
        top: rect.top + window.scrollY - (height - rect.height) / 2 - matrix.m42,
        width, height, scale: matrix.m11, y: matrix.m42,
      };
      heroAnimation = heroArt.getAnimations().find(animation => animation.animationName === 'crest-hover');
    };
    const crestEase = value => {
      let low = 0;
      let high = 1;
      let t = value;
      for (let index = 0; index < 9; index++) {
        const x = ((0.52 * t - 0.78) * t + 1.26) * t;
        if (x < value) low = t; else high = t;
        t = (low + high) / 2;
      }
      return t * t * (3 - 2 * t);
    };
    const getAttachedPose = () => {
      if (!heroGeometry) measureHero();
      if (!heroGeometry) return null;
      let scale = heroGeometry.scale;
      let y = heroGeometry.y;
      if (heroAnimation && !reduceMotion) {
        const progress = ((Number(heroAnimation.currentTime) || 0) % 7000) / 7000;
        const float = crestEase(progress <= 0.5 ? progress * 2 : (1 - progress) * 2);
        scale = 1.01 + float * 0.015;
        y = float * -6;
      }
      const rect = {
        width: heroGeometry.width * scale,
        height: heroGeometry.height * scale,
        left: heroGeometry.left + heroGeometry.width * (1 - scale) / 2,
        top: heroGeometry.top - window.scrollY + heroGeometry.height * (1 - scale) / 2 + y,
      };
      const letterScale = Math.max(0.14, Math.min(0.42, rect.width * 0.26 / Math.max(1, envelopeWidth)));
      const visibleSizeRatio = envelopeWidth * letterScale / Math.max(1, rect.width);
      // The envelope's top fold (about 27% across, 23% down its square image)
      // sits on the beak; this keeps the owl's face clear as the art floats.
      return {
        x: ((rect.left + rect.width * (0.325 + (0.5 - 0.274) * visibleSizeRatio)) / window.innerWidth) * 100,
        y: ((rect.top + rect.height * (0.275 + (0.5 - 0.23) * visibleSizeRatio)) / window.innerHeight) * 100,
        scale: letterScale,
        rotate: -5,
      };
    };

    const updateScrollTransition = () => {
      if (!hero || !showcase || !heroArt || !envelope) return;

      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const absoluteTop = (element) => {
        if (!sectionTops.has(element)) sectionTops.set(element, element.getBoundingClientRect().top + scrollY);
        return sectionTops.get(element);
      };
      const heroTop = absoluteTop(hero);
      const venueTop = absoluteTop(showcase);
      const heroBottom = absoluteTop(hero) + hero.offsetHeight;
      const isNarrow = window.innerWidth <= 640;
      const guideRightX = isNarrow ? 60 : 88;
      const guideLeftX = isNarrow ? 40 : 12;
      const guideTopY = isNarrow ? 22 : 24;
      const guideBottomY = isNarrow ? 76 : 77;
      const guideScale = isNarrow ? 0.46 : Math.min(0.48, Math.max(0.39, 300 / envelopeWidth));
      const startAt = heroTop + viewportHeight * 0.18;
      const attachedPose = getAttachedPose();
      const releasePose = attachedPose
        ? { ...attachedPose, y: (attachedPose.y * viewportHeight / 100 + scrollY - startAt) / viewportHeight * 100 }
        : { x: 50, y: 50, scale: 0.2, rotate: -5 };
      const stops = [
        { at: startAt, ...releasePose },
        { at: heroBottom - viewportHeight * 0.18, x: guideRightX, y: guideTopY, scale: guideScale, rotate: 16 },
        { at: venueTop + viewportHeight * 0.18, x: guideRightX - (isNarrow ? 3 : 5), y: guideTopY + 4, scale: guideScale, rotate: -7 },
        { at: venueTop + viewportHeight * 0.8, x: guideRightX, y: 52, scale: guideScale, rotate: 8 },
        { at: venueTop + viewportHeight * 1.55, x: guideRightX - 8, y: guideBottomY, scale: guideScale, rotate: -8 },
        { at: venueTop + showcase.offsetHeight - viewportHeight * 0.18, x: guideRightX, y: guideTopY, scale: guideScale, rotate: 16 },
        { at: absoluteTop(challenge) + viewportHeight * 0.28, x: guideRightX, y: guideTopY, scale: guideScale, rotate: -7 },
        { at: absoluteTop(challenge) + viewportHeight * 0.82, x: guideRightX, y: guideBottomY, scale: guideScale, rotate: 8 },
        { at: absoluteTop(journey) + viewportHeight * 0.2, x: guideLeftX, y: guideBottomY, scale: guideScale, rotate: -12 },
        { at: absoluteTop(journey) + viewportHeight * 0.78, x: guideLeftX, y: guideTopY, scale: guideScale, rotate: 9 },
        ...(prizes ? [
          { at: absoluteTop(prizes) + viewportHeight * 0.2, x: guideRightX, y: guideTopY, scale: guideScale, rotate: -8 },
          { at: absoluteTop(prizes) + viewportHeight * 0.8, x: guideRightX - 6, y: guideBottomY, scale: guideScale, rotate: 10 },
        ] : []),
        { at: absoluteTop(registration) + viewportHeight * 0.2, x: guideLeftX + (isNarrow ? 12 : 10), y: guideBottomY, scale: guideScale, rotate: -10 },
        ...(faq ? [
          { at: absoluteTop(faq) + viewportHeight * 0.2, x: guideRightX, y: guideTopY, scale: guideScale, rotate: -7 },
          { at: absoluteTop(faq) + viewportHeight * 0.7, x: guideRightX - 4, y: guideBottomY, scale: guideScale, rotate: 8 },
        ] : []),
        { at: absoluteTop(footer) + viewportHeight * 0.25, x: guideLeftX, y: guideTopY, scale: guideScale, rotate: 8 },
      ];
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      let pose;
      attachedToOwl = scrollY < startAt;
      if (attachedToOwl) {
        pose = attachedPose || releasePose;
      } else {
        const segmentIndex = stops.findIndex((stop, index) => index < stops.length - 1 && scrollY <= stops[index + 1].at);
        const segment = Math.max(0, segmentIndex < 0 ? stops.length - 2 : segmentIndex);
        const from = stops[segment];
        const to = stops[segment + 1];
        const local = clamp((scrollY - from.at) / Math.max(1, to.at - from.at), 0, 1);
        const eased = local * local * (3 - 2 * local);
        const point = (a, b) => a + (b - a) * eased;
        pose = {
          x: point(from.x, to.x),
          y: point(from.y, to.y),
          scale: point(from.scale, to.scale),
          rotate: point(from.rotate, to.rotate),
        };
      }

      if (!attachedToOwl) {
        pose.x = clamp(pose.x, isNarrow ? 38 : 8, isNarrow ? 62 : 92);
        pose.y = clamp(pose.y, 12, 84);
      }
      targetPose = pose;
      if (!currentPose) currentPose = { ...pose };
      envelope.style.opacity = '1';
      // Keep the floating letter clear of the contact details and call buttons.
      const atContact = contact && scrollY + viewportHeight * 0.5 >= absoluteTop(contact);
      envelope.style.visibility = atContact ? 'hidden' : 'visible';

      const guiding = scrollY > heroTop + viewportHeight * 0.48;
      envelope.classList.toggle('is-guiding', guiding);
      envelope.style.pointerEvents = guiding ? 'auto' : 'none';
    };

    function animateEnvelope(time) {
      frameId = 0;
      if (document.hidden) return;
      if (scrollDirty) {
        scrollDirty = false;
        updateScrollTransition();
      }
      if (!targetPose || !currentPose) {
        frameId = 0;
        return;
      }
      if (attachedToOwl) {
        const pose = getAttachedPose();
        if (pose) {
          currentPose = pose;
          targetPose = { ...currentPose };
          envelope.style.transform = `translate3d(${currentPose.x}vw, ${currentPose.y}vh, 0) translate(-50%, -50%) scale(${currentPose.scale}) rotate(${currentPose.rotate}deg)`;
        }
        if (reduceMotion) {
          frameId = 0;
          return;
        }
        frameId = window.requestAnimationFrame(animateEnvelope);
        return;
      }
      const delta = lastFrameTime ? Math.min(48, time - lastFrameTime) : 16;
      lastFrameTime = time;
      const ease = reduceMotion ? 1 : 1 - Math.exp(-delta / 90);
      let remaining = 0;
      ['x', 'y', 'scale', 'rotate'].forEach((key) => {
        const difference = targetPose[key] - currentPose[key];
        currentPose[key] += difference * ease;
        remaining = Math.max(remaining, Math.abs(difference));
      });
      envelope.style.transform = `translate3d(${currentPose.x}vw, ${currentPose.y}vh, 0) translate(-50%, -50%) scale(${currentPose.scale}) rotate(${currentPose.rotate}deg)`;
      if (remaining > 0.015) frameId = window.requestAnimationFrame(animateEnvelope);
      else {
        currentPose = { ...targetPose };
        lastFrameTime = 0;
        frameId = 0;
      }
    }

    const scheduleUpdate = () => {
      scrollDirty = true;
      if (!frameId && !document.hidden) frameId = window.requestAnimationFrame(animateEnvelope);
    };
    const refreshLayout = () => {
      sectionTops.clear();
      envelopeWidth = envelope.offsetWidth;
      measureHero();
      scheduleUpdate();
    };
    const changeMotionPreference = () => { reduceMotion = preference.matches; refreshLayout(); };
    // Layout changes (fonts, images, FAQ, menu) invalidate the cached document positions.
    const observer = new ResizeObserver(refreshLayout);
    sections.filter(Boolean).forEach(section => observer.observe(section));
    observer.observe(document.querySelector('.landing-header'));
    observer.observe(envelope);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', refreshLayout);
    document.addEventListener('visibilitychange', scheduleUpdate);
    preference.addEventListener('change', changeMotionPreference);
    scheduleUpdate();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', refreshLayout);
      document.removeEventListener('visibilitychange', scheduleUpdate);
      preference.removeEventListener('change', changeMotionPreference);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [enabled]);

  return (
    <a ref={envelopeRef} className="scrolling-seal-guide" href="#invitation"
      aria-label="Open your HexWartz invitation letter" aria-haspopup="dialog"
      title="Open your HexWartz invitation"
      onClick={event => { event.preventDefault(); onOpen(); }}>
      <img className="scrolling-seal-envelope" src="/assets/optimized/envelope.webp" alt="" aria-hidden="true" width="480" height="480" />
      <span className="letter-guide-label"><span>THE OWL POST</span>Read your invitation<ArrowUpRight size={14} aria-hidden="true" /></span>
    </a>
  );
}
