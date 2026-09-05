import type { Variants } from 'framer-motion';

/** Easing shared by every page entrance. */
const pageEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/**
 * Wrapper for a routed page. Children using {@link pageItemVariants} settle in
 * quick succession rather than cascading down the page.
 */
export const pageContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};

/** A single block of page content: a short, shallow fade up. */
export const pageItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: pageEase } },
};
