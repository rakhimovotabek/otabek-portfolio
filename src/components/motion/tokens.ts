/** Shared timing; transforms belong to GSAP except the Motion contact controls. */
export const motionTokens = {
  ease: "power3.out",
  settle: "power2.inOut",
  entrance: 0.9,
  scrub: 0.45,
  desktop: "(min-width: 1100px) and (min-height: 760px)",
  preference: "(prefers-reduced-motion: no-preference)",
} as const;

export type MotionEngine = typeof import("gsap").gsap;
