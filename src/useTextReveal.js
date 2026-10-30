import { useEffect } from 'react';

export default function useTextReveal(enabled) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = document.querySelectorAll('.landing-section-head, .journey-scene-copy, .prophet-headline, .contact-card, .hero-brand-lockup, .hero-arcane-desc, .hero-feature-pills');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('text-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    targets.forEach(element => { element.classList.add('text-reveal'); observer.observe(element); });
    return () => {
      observer.disconnect();
      targets.forEach(element => element.classList.remove('text-reveal', 'text-revealed'));
    };
  }, [enabled]);
}
