import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;

export function initGsap(): void {
  if (!initialized && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initialized = true;
  }
}

export { gsap, ScrollTrigger };
