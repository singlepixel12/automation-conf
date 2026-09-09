import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function useAnimatedCounter(target: number, duration = 400) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      // The target is rendered as-is, so keep the ref in step with what is shown.
      prev.current = target;
      return;
    }

    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();
    let frame = 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = diff === 0 ? 1 : Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      prev.current = current;
      setValue(current);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, shouldReduceMotion]);

  return shouldReduceMotion ? target : value;
}
