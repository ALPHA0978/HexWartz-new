import { useEffect, useRef } from 'react';

export default function useTextReveal(enabled) {
  const scope = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let generation = 0;
    let stopMotion;
    const configure = async () => {
      const current = ++generation;
      stopMotion?.();
      stopMotion = undefined;
      if (preference.matches) return;
      try {
        const { setupSiteMotion } = await import('./motionOrchestrator');
        if (!disposed && current === generation && !preference.matches && scope.current) {
          stopMotion = setupSiteMotion(scope.current);
        }
      } catch {
        // Animation is progressive enhancement; all content stays readable.
      }
    };
    configure();
    preference.addEventListener('change', configure);
    return () => {
      disposed = true;
      generation++;
      preference.removeEventListener('change', configure);
      stopMotion?.();
    };
  }, [enabled]);
  return scope;
}
