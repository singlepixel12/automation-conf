import type { Variants } from 'framer-motion';

/** Easing shared by every page entrance. */
const pageEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/**
 * Wrapper for a routed page. Children using {@link pageItemVariants} assemble in
 * a readable order rather than arriving together, while staying short enough on
 * a block-heavy page to never read as waiting.
 */
export const pageContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

/**
 * A single block of page content: a shallow fade up with enough travel to be
 * legible. Ambient by design: quieter than the scheduling dispatch gesture,
 * which stays the loudest motion in the app.
 */
export const pageItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: pageEase } },
};
