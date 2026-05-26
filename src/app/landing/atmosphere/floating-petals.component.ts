import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

// ── Organic path shapes ───────────────────────────────────────────────────────
// x multipliers at 5 waypoints along the flight path (fraction of driftX)
const PATHS = {
  1: [ 0.20,  0.55,  0.80,  1.00,  1.15] as const, // consistent drift
  2: [ 0.30, -0.40,  0.65, -0.25,  0.50] as const, // pendulum L/R
  3: [ 0.40,  0.90,  0.50,  1.10,  0.80] as const, // S-curve
  4: [ 0.10,  0.20,  0.40,  0.60,  0.75] as const, // near-vertical
  5: [-0.30,  0.50, -0.60,  0.80, -0.20] as const, // wide oscillation
};

// ── SVG petal shapes (viewBox 0 0 10 16) ─────────────────────────────────────
const SVG = {
  1: 'M5,15 C2,12 0.5,8.5 0.5,6 C0.5,2.5 2.2,0.5 5,0.5 C7.8,0.5 9.5,2.5 9.5,6 C9.5,8.5 8,12 5,15Z',
  2: 'M5,14 C1.5,11 1,8 1,5.5 C1,2 2.5,0.5 5,0.5 C7.5,0.5 9,2 9,5.5 C9,8 8.5,11 5,14Z',
  3: 'M4.5,14 C1,11 0.5,7.5 1.5,5 C2.5,2 4,0.5 5.5,0.5 C8,0.5 9,2.5 8.5,5.5 C8,9 7,12 4.5,14Z',
};

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  iv: 'rgba(248,243,234,0.95)',  // warm ivory
  ch: 'rgba(231,211,161,0.90)',  // champagne gold
  bl: 'rgba(241,206,207,0.92)',  // soft blush
  ro: 'rgba(220,182,182,0.90)',  // muted rose
};

// ── Petal dataset ─────────────────────────────────────────────────────────────
// id, startX%, type(1/2/3), color, size(px), peakOpacity, initRot,
// duration(s), seekOffset(s), driftX(px), pathStyle(1-5), layer
const DATA = [
  // Background — slow · faint · small (9)
  { id: 0,  x:  3, t:1, c:C.iv, s: 7, o:0.28, r: 20, d:20, off: 0,   dx: 40, p:1 as 1, l:'bg'  },
  { id: 1,  x: 14, t:2, c:C.ch, s: 8, o:0.24, r:-35, d:24, off: 3.5, dx:-38, p:2 as 2, l:'bg'  },
  { id: 2,  x: 24, t:3, c:C.iv, s: 7, o:0.26, r: 55, d:22, off: 8,   dx: 50, p:3 as 3, l:'bg'  },
  { id: 3,  x: 36, t:1, c:C.bl, s: 8, o:0.22, r:-50, d:26, off: 1,   dx:-45, p:4 as 4, l:'bg'  },
  { id: 4,  x: 48, t:2, c:C.iv, s: 7, o:0.25, r: 70, d:21, off:12,   dx: 55, p:1 as 1, l:'bg'  },
  { id: 5,  x: 59, t:3, c:C.ch, s: 8, o:0.26, r:-28, d:23, off: 5,   dx:-52, p:5 as 5, l:'bg'  },
  { id: 6,  x: 71, t:1, c:C.bl, s: 7, o:0.22, r: 42, d:25, off:16,   dx: 46, p:2 as 2, l:'bg'  },
  { id: 7,  x: 83, t:2, c:C.iv, s: 8, o:0.24, r:-60, d:19, off: 7,   dx:-42, p:3 as 3, l:'bg'  },
  { id: 8,  x: 93, t:3, c:C.ch, s: 7, o:0.26, r: 32, d:22, off:19,   dx: 36, p:4 as 4, l:'bg'  },
  // Mid-ground — moderate (7)
  { id: 9,  x:  7, t:2, c:C.bl, s:12, o:0.40, r: 25, d:15, off: 2,   dx: 62, p:2 as 2, l:'mid' },
  { id:10,  x: 19, t:1, c:C.iv, s:13, o:0.36, r:-45, d:17, off: 6,   dx:-58, p:1 as 1, l:'mid' },
  { id:11,  x: 33, t:3, c:C.ro, s:11, o:0.42, r: 65, d:14, off:10,   dx: 70, p:3 as 3, l:'mid' },
  { id:12,  x: 46, t:2, c:C.ch, s:12, o:0.38, r:-30, d:16, off: 0.5, dx:-64, p:5 as 5, l:'mid' },
  { id:13,  x: 61, t:1, c:C.bl, s:13, o:0.40, r: 80, d:15, off:14,   dx: 56, p:4 as 4, l:'mid' },
  { id:14,  x: 74, t:3, c:C.iv, s:11, o:0.36, r:-55, d:18, off: 4,   dx:-60, p:2 as 2, l:'mid' },
  { id:15,  x: 87, t:2, c:C.ro, s:12, o:0.42, r: 45, d:14, off: 9,   dx: 54, p:1 as 1, l:'mid' },
  // Foreground — fast · visible · large (5)
  { id:16,  x: 12, t:1, c:C.ro, s:17, o:0.55, r: 30, d:11, off: 1,   dx: 82, p:3 as 3, l:'fg'  },
  { id:17,  x: 32, t:2, c:C.iv, s:19, o:0.48, r:-65, d:13, off: 7,   dx:-78, p:1 as 1, l:'fg'  },
  { id:18,  x: 54, t:3, c:C.bl, s:16, o:0.56, r: 75, d:10, off: 3,   dx: 88, p:2 as 2, l:'fg'  },
  { id:19,  x: 76, t:1, c:C.ch, s:18, o:0.50, r:-40, d:12, off:17,   dx:-84, p:4 as 4, l:'fg'  },
  { id:20,  x: 91, t:2, c:C.ro, s:17, o:0.54, r: 55, d:11, off: 5,   dx: 76, p:5 as 5, l:'fg'  },
];

@Component({
  selector: 'app-floating-petals',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fp-host" aria-hidden="true">

      <div class="fp-layer fp-bg">
        @for (p of bg; track p.id) {
          <span class="fp-petal"
            [style.left.%]="p.x" [style.width.px]="p.s" [style.height.px]="p.s * 1.65"
            [style.color]="p.c" [attr.data-fpid]="p.id">
            <svg viewBox="0 0 10 16" fill="currentColor"><path [attr.d]="svgD(p.t)"/></svg>
          </span>
        }
      </div>

      <div class="fp-layer fp-mid">
        @for (p of mid; track p.id) {
          <span class="fp-petal"
            [style.left.%]="p.x" [style.width.px]="p.s" [style.height.px]="p.s * 1.65"
            [style.color]="p.c" [attr.data-fpid]="p.id">
            <svg viewBox="0 0 10 16" fill="currentColor"><path [attr.d]="svgD(p.t)"/></svg>
          </span>
        }
      </div>

      <div class="fp-layer fp-fg">
        @for (p of fg; track p.id) {
          <span class="fp-petal"
            [style.left.%]="p.x" [style.width.px]="p.s" [style.height.px]="p.s * 1.65"
            [style.color]="p.c" [attr.data-fpid]="p.id">
            <svg viewBox="0 0 10 16" fill="currentColor"><path [attr.d]="svgD(p.t)"/></svg>
          </span>
        }
      </div>

    </div>
  `,
  styles: [`
    .fp-host {
      position: fixed; inset: 0;
      pointer-events: none; z-index: 2; overflow: hidden;
    }
    .fp-layer { position: absolute; inset: 0; }
    .fp-bg  { z-index: 0; }
    .fp-mid { z-index: 1; }
    .fp-fg  { z-index: 2; }
    .fp-petal {
      position: absolute; top: 100vh; opacity: 0; display: block;
      will-change: transform;
    }
    .fp-petal svg { width: 100%; height: 100%; display: block; }

    @media (max-width: 768px) { .fp-bg { display: none; } }
    @media (prefers-reduced-motion: reduce) { .fp-host { display: none; } }
  `],
})
export class FloatingPetalsComponent implements OnInit, OnDestroy {
  private readonly pid = inject(PLATFORM_ID);
  private ctx?: gsap.Context;

  readonly bg  = DATA.filter(p => p.l === 'bg');
  readonly mid = DATA.filter(p => p.l === 'mid');
  readonly fg  = DATA.filter(p => p.l === 'fg');

  svgD(t: number): string { return SVG[t as 1|2|3] ?? SVG[1]; }

  ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    initGsap();
    // Two rAF: ensure Angular rendered all @for children
    requestAnimationFrame(() => requestAnimationFrame(() => this.boot()));
  }

  ngOnDestroy() { this.ctx?.revert(); }

  private boot() {
    const host = document.querySelector<HTMLElement>('.fp-host');
    if (!host) return;
    const vh = window.innerHeight;
    const mob = window.innerWidth <= 768;

    this.ctx = gsap.context(() => {

      DATA.forEach(p => {
        const el = host.querySelector<HTMLElement>(`[data-fpid="${p.id}"]`);
        if (!el) return;

        const shape = PATHS[p.p];
        const dx = p.dx * (mob ? 0.55 : 1);

        // Set initial transform state
        gsap.set(el, { rotation: p.r, transformOrigin: '50% 55%', scale: 0.7, opacity: 0 });

        // 7-waypoint organic flight path (transforms only — no layout props)
        const tween = gsap.to(el, {
          keyframes: [
            { y:-(vh*.10), x:dx*shape[0]*.3, rotation:p.r+8,  scale:.82, opacity:p.o*.85, ease:'power2.out', duration:p.d*.10 },
            { y:-(vh*.26), x:dx*shape[0]*.7, rotation:p.r-12, scale:.95, opacity:p.o,      ease:'sine.inOut', duration:p.d*.18 },
            { y:-(vh*.45), x:dx*shape[1],    rotation:p.r+22, scale:1.0, opacity:p.o,      ease:'none',       duration:p.d*.20 },
            { y:-(vh*.63), x:dx*shape[2],    rotation:p.r-8,  scale:1.0, opacity:p.o*.90,  ease:'none',       duration:p.d*.18 },
            { y:-(vh*.79), x:dx*shape[3],    rotation:p.r+18, scale:.90, opacity:p.o*.50,  ease:'sine.in',    duration:p.d*.20 },
            { y:-(vh*.93), x:dx*shape[4],    rotation:p.r-5,  scale:.76, opacity:p.o*.18,  ease:'power1.in',  duration:p.d*.10 },
            { y:-(vh*1.06),x:dx*shape[4]*1.1,rotation:p.r+12, scale:.60, opacity:0,         ease:'power2.in',  duration:p.d*.04 },
          ],
          repeat: -1,
          repeatDelay: p.d * .16,
          paused: true,
        });

        // Distribute petals at different heights on page load — instant premium feel
        tween.seek(p.off % p.d);
        tween.play();
      });

      // Scroll-driven depth separation: bg/mid layers shift at slightly different rates
      // creating the sense of three-dimensional space as the user scrolls
      if (!mob) {
        gsap.to(host.querySelector<HTMLElement>('.fp-bg'), {
          y: -200, ease: 'none',
          scrollTrigger: { start: 0, end: () => document.body.scrollHeight - vh, scrub: 2 },
        });
        gsap.to(host.querySelector<HTMLElement>('.fp-mid'), {
          y: -100, ease: 'none',
          scrollTrigger: { start: 0, end: () => document.body.scrollHeight - vh, scrub: 2 },
        });
      }

    }, host);
  }
}
