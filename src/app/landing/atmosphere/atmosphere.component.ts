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

// ── Deterministic pseudo-random ────────────────────────────────────────────────
// Returns [0, 1) for any integer inputs. Reproducible across renders.
// Varies per particle id (a), cycle count (b), and channel (c).
const prng = (a: number, b: number, c = 0): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.9453) * 43758.5453;
  return v - Math.floor(v);
};
// Map [0,1) to [lo, hi)
const rng = (lo: number, hi: number, a: number, b: number, c = 0) =>
  lo + (hi - lo) * prng(a, b, c);

// ── SVG visual assets ──────────────────────────────────────────────────────────
const PETAL_D = [
  'M5,15 C2,12 0.5,8.5 0.5,6 C0.5,2.5 2.2,0.5 5,0.5 C7.8,0.5 9.5,2.5 9.5,6 C9.5,8.5 8,12 5,15Z',
  'M5,14 C1.5,11 1,8 1,5.5 C1,2 2.5,0.5 5,0.5 C7.5,0.5 9,2 9,5.5 C9,8 8.5,11 5,14Z',
  'M4.5,14 C1,11 0.5,7.5 1.5,5 C2.5,2 4,0.5 5.5,0.5 C8,0.5 9,2.5 8.5,5.5 C8,9 7,12 4.5,14Z',
];
const FLOWER_D = [
  'M12,2 C10,5 10,8 12,10 C14,8 14,5 12,2Z',
  'M19,5 C16,6 14,9 15,11 C17,10 19,8 19,5Z',
  'M19,19 C17,16 14,15 13,17 C15,19 17,20 19,19Z',
  'M5,19 C7,20 9,19 11,17 C10,15 7,16 5,19Z',
  'M5,5 C5,8 7,10 9,11 C10,9 8,6 5,5Z',
];

// ── Particle definitions ───────────────────────────────────────────────────────
// 5 bg · 4 mid · 5 fg = 14 total  (replaces 48 — 71% reduction in animated nodes)
//
// Each particle describes STATIC config. All motion parameters are derived
// fresh per cycle via prng(), so no two flights look identical.
interface P {
  id: number;
  layer: 'bg' | 'mid' | 'fg';
  x: number;          // CSS left % in viewport
  kind: 'petal' | 'flower';
  pi: number;         // petal shape index (0–2)
  color: string;      // CSS color (solid — no alpha; opacity is animated via GSAP)
  size: number;       // px width
  maxOp: number;      // peak opacity ceiling for this particle
  rot: number;        // base start rotation (deg)
  dur: number;        // base flight duration (s) — actual varies ±18% per cycle
  drift: number;      // primary horizontal drift (px, sign = direction)
  spin: number;       // total rotation over one complete flight (deg)
  phase: number;      // 0..1 — where in its cycle to begin on first load
}

const PARTICLES: P[] = [
  // BG — very slow (30–38 s), barely visible (0.17–0.20), tiny (7–8 px)
  // These create the sense of atmospheric depth, almost subliminal.
  { id: 0,  layer:'bg',  x:  5, kind:'petal',  pi:0, color:'#F8F3EA', size: 8, maxOp:0.20, rot: 15, dur:36, drift: 44, spin:150, phase:0.12 },
  { id: 1,  layer:'bg',  x: 21, kind:'petal',  pi:1, color:'#E7D3A1', size: 7, maxOp:0.17, rot:-35, dur:32, drift:-48, spin:130, phase:0.48 },
  { id: 2,  layer:'bg',  x: 44, kind:'petal',  pi:2, color:'#F8F3EA', size: 8, maxOp:0.19, rot: 55, dur:38, drift: 42, spin:160, phase:0.71 },
  { id: 3,  layer:'bg',  x: 67, kind:'petal',  pi:0, color:'#F1CECF', size: 7, maxOp:0.17, rot:-50, dur:30, drift:-36, spin:140, phase:0.27 },
  { id: 4,  layer:'bg',  x: 88, kind:'petal',  pi:1, color:'#E7D3A1', size: 8, maxOp:0.18, rot: 70, dur:34, drift: 46, spin:155, phase:0.61 },

  // MID — medium speed (18–26 s), readable (0.30–0.38), moderate (11–13 px)
  { id: 5,  layer:'mid', x: 11, kind:'petal',  pi:2, color:'#F1CECF', size:13, maxOp:0.36, rot: 25, dur:22, drift: 65, spin:180, phase:0.16 },
  { id: 6,  layer:'mid', x: 35, kind:'petal',  pi:0, color:'#F8F3EA', size:11, maxOp:0.30, rot:-42, dur:26, drift:-58, spin:165, phase:0.58 },
  { id: 7,  layer:'mid', x: 60, kind:'petal',  pi:1, color:'#DCB6B6', size:12, maxOp:0.38, rot: 62, dur:20, drift: 70, spin:195, phase:0.82 },
  { id: 8,  layer:'mid', x: 82, kind:'petal',  pi:2, color:'#E7D3A1', size:11, maxOp:0.32, rot:-28, dur:24, drift:-54, spin:170, phase:0.37 },

  // FG — livelier (12–18 s), most visible (0.36–0.46), large (16–22 px)
  { id: 9,  layer:'fg',  x: 16, kind:'petal',  pi:0, color:'#DCB6B6', size:18, maxOp:0.46, rot: 30, dur:15, drift: 80, spin:215, phase:0.22 },
  { id:10,  layer:'fg',  x: 40, kind:'flower', pi:0, color:'#F1CECF', size:22, maxOp:0.38, rot:-60, dur:18, drift:-74, spin:235, phase:0.68 },
  { id:11,  layer:'fg',  x: 62, kind:'petal',  pi:1, color:'#F8F3EA', size:16, maxOp:0.43, rot: 75, dur:14, drift: 86, spin:255, phase:0.42 },
  { id:12,  layer:'fg',  x: 80, kind:'flower', pi:0, color:'#E7D3A1', size:20, maxOp:0.36, rot:-22, dur:17, drift:-68, spin:200, phase:0.87 },
  { id:13,  layer:'fg',  x: 94, kind:'petal',  pi:2, color:'#DCB6B6', size:17, maxOp:0.42, rot: 52, dur:16, drift: 64, spin:225, phase:0.10 },
];

@Component({
  selector: 'app-atmosphere',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atm-host" aria-hidden="true">

      <!-- Background layer: slowest, faintest, deepest parallax -->
      <div class="atm-layer atm-bg">
        @for (p of bg; track p.id) {
          <span class="atm-el"
            [style.left.%]="p.x"
            [style.width.px]="p.size"
            [style.height.px]="p.kind === 'petal' ? p.size * 1.7 : p.size"
            [style.color]="p.color"
            [attr.data-pid]="p.id">
            @if (p.kind === 'petal') {
              <svg viewBox="0 0 10 16" fill="currentColor">
                <path [attr.d]="petalD(p.pi)" />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="currentColor">
                @for (d of flowerD; track $index) { <path [attr.d]="d" /> }
                <circle cx="12" cy="12" r="2.2" fill="rgba(255,240,200,0.85)" />
              </svg>
            }
          </span>
        }
      </div>

      <!-- Mid-ground layer -->
      <div class="atm-layer atm-mid">
        @for (p of mid; track p.id) {
          <span class="atm-el"
            [style.left.%]="p.x"
            [style.width.px]="p.size"
            [style.height.px]="p.kind === 'petal' ? p.size * 1.7 : p.size"
            [style.color]="p.color"
            [attr.data-pid]="p.id">
            @if (p.kind === 'petal') {
              <svg viewBox="0 0 10 16" fill="currentColor">
                <path [attr.d]="petalD(p.pi)" />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="currentColor">
                @for (d of flowerD; track $index) { <path [attr.d]="d" /> }
                <circle cx="12" cy="12" r="2.2" fill="rgba(255,240,200,0.85)" />
              </svg>
            }
          </span>
        }
      </div>

      <!-- Foreground layer: fastest, most visible, no parallax (reads as "close") -->
      <div class="atm-layer atm-fg">
        @for (p of fg; track p.id) {
          <span class="atm-el"
            [style.left.%]="p.x"
            [style.width.px]="p.size"
            [style.height.px]="p.kind === 'petal' ? p.size * 1.7 : p.size"
            [style.color]="p.color"
            [attr.data-pid]="p.id">
            @if (p.kind === 'petal') {
              <svg viewBox="0 0 10 16" fill="currentColor">
                <path [attr.d]="petalD(p.pi)" />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="currentColor">
                @for (d of flowerD; track $index) { <path [attr.d]="d" /> }
                <circle cx="12" cy="12" r="2.2" fill="rgba(255,240,200,0.85)" />
              </svg>
            }
          </span>
        }
      </div>

    </div>
  `,
  styles: [`
    .atm-host {
      position: fixed; inset: 0;
      pointer-events: none; z-index: 2; overflow: hidden;
    }
    .atm-layer { position: absolute; inset: 0; }

    .atm-el {
      position: absolute;
      top: 100vh;        /* start below viewport */
      opacity: 0;
      display: block;
      will-change: transform, opacity;
    }
    .atm-el svg { width: 100%; height: 100%; display: block; }

    /* Hide slowest bg layer on mobile — saves CPU for smaller screens */
    @media (max-width: 768px) { .atm-bg { display: none; } }

    /* Honour prefers-reduced-motion: hide entire system */
    @media (prefers-reduced-motion: reduce) { .atm-host { display: none; } }
  `],
})
export class AtmosphereComponent implements OnInit, OnDestroy {
  private readonly pid = inject(PLATFORM_ID);

  // Active timelines — tracked so we can kill them on destroy
  private tls: gsap.core.Timeline[] = [];
  private destroyed = false;

  readonly bg     = PARTICLES.filter(p => p.layer === 'bg');
  readonly mid    = PARTICLES.filter(p => p.layer === 'mid');
  readonly fg     = PARTICLES.filter(p => p.layer === 'fg');
  readonly flowerD = FLOWER_D;

  petalD(i: number): string { return PETAL_D[i] ?? PETAL_D[0]; }

  ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    initGsap();
    // Two rAF: ensure Angular has rendered all @for children into the DOM
    requestAnimationFrame(() => requestAnimationFrame(() => this.boot()));
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.tls.forEach(tl => tl.kill());
    this.tls = [];
  }

  private boot() {
    const host = document.querySelector<HTMLElement>('.atm-host');
    if (!host) return;
    const mob = window.innerWidth <= 768;

    PARTICLES.forEach(p => {
      // Skip bg layer on mobile (already CSS-hidden, skip JS too)
      if (mob && p.layer === 'bg') return;

      const el = host.querySelector<HTMLElement>(`[data-pid="${p.id}"]`);
      if (!el) return;

      // Start each particle at its pre-computed phase so the viewport is
      // richly populated the instant the page renders — no empty start.
      this.launchCycle(el, p, 0, p.phase);
    });

    // Scroll parallax: applied to LAYER CONTAINERS, not individual elements.
    // This completely decouples the floating animations from scroll,
    // eliminating the "scroll fighting" stutters of the previous system.
    if (!mob) this.initParallax(host);
  }

  // ── Organic flight cycle ──────────────────────────────────────────────────────
  // Each call builds a FRESH 4-phase GSAP timeline with per-cycle PRNG variation.
  // The 4 phases create a natural S-curve: emerge → float up → fade → exit.
  // Duration, lateral drift, sway amplitude, spin, and peak opacity all vary
  // deterministically between cycles — so no two flights look identical.
  private launchCycle(el: HTMLElement, p: P, cycle: number, initPhase = 0) {
    if (this.destroyed) return;

    const vh  = window.innerHeight;
    const ds  = window.innerWidth <= 768 ? 0.50 : 1; // drift scale on mobile

    // ── Per-cycle variation via deterministic noise ───────────────────────────
    // Duration: ±18% variance prevents all particles locking to the same period
    const dur    = rng(p.dur * 0.82, p.dur * 1.18, p.id, cycle, 0);

    // Primary drift: how far the particle travels horizontally
    const drift  = rng(p.drift * 0.78, p.drift * 1.22, p.id, cycle, 1) * ds;

    // Sway: midpoint lateral deviation — creates the S-curve organic path.
    // Pushes against the primary drift direction at the peak of the arc.
    const sway   = drift * rng(-0.42, 0.42, p.id, cycle, 2);

    // Spin: total degrees rotated over the full flight.
    // 85% chance to spin in primary drift direction, 15% chance to reverse —
    // avoids every particle spinning the same way at the same time.
    const spinDir = prng(p.id, cycle, 4) > 0.15 ? Math.sign(p.drift) : -Math.sign(p.drift);
    const spin   = rng(p.spin * 0.68, p.spin * 1.32, p.id, cycle, 3) * spinDir;

    // Opacity: varies subtly per cycle (±25%) — creates organic "breathing"
    const peakOp = rng(p.maxOp * 0.72, p.maxOp, p.id, cycle, 5);

    // Starting rotation and scale vary to prevent synchronized visual grouping
    const rot0   = p.rot + rng(-14, 14, p.id, cycle, 6);
    const sc0    = rng(0.56, 0.76, p.id, cycle, 7);

    // ── Phase timing: 4 organic phases totalling `dur` seconds ───────────────
    // Rationale: fewer phases = smoother transitions = less robotic stairstepping
    const t1 = dur * 0.11; // Emerge:  quick fade-in from below
    const t2 = dur * 0.40; // Float:   long lazy drift toward S-curve peak
    const t3 = dur * 0.33; // Fade:    drift corrects, opacity falls naturally
    const t4 = dur * 0.16; // Exit:    fast final fade off-screen (compressed = snappy)

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        const i = this.tls.indexOf(tl);
        if (i > -1) this.tls.splice(i, 1);
        // Next cycle gets a fresh tween with new variation parameters
        this.launchCycle(el, p, cycle + 1);
      },
    });
    this.tls.push(tl);

    tl
      // Establish starting state at timeline position 0
      // (gsap.set inside timeline so seek() interpolates correctly through it)
      .set(el, {
        y: 60, x: 0,
        rotation: rot0, opacity: 0,
        scale: sc0, transformOrigin: '50% 55%',
      })

      // Phase 1 — Emerge: rises quickly from below, first breath of opacity
      .to(el, {
        y: -(vh * 0.12),
        x: sway * 0.28,                         // slight early lean
        rotation: rot0 + spin * 0.09,
        opacity: peakOp * 0.58,
        scale: rng(0.80, 0.90, p.id, cycle, 8),
        duration: t1,
        ease: 'power2.out',
      })

      // Phase 2 — Float: long, lazy main drift; reaches S-curve midpoint (sway peak)
      .to(el, {
        y: -(vh * 0.50),
        x: drift * 0.52 + sway,                // primary drift + full sway
        rotation: rot0 + spin * 0.50,
        opacity: peakOp,                        // peak opacity exactly at mid-point
        scale: 1.0,
        duration: t2,
        ease: 'sine.inOut',                     // silky — no hard acceleration edges
      })

      // Phase 3 — Fade: sway corrects back toward primary line, opacity dims
      .to(el, {
        y: -(vh * 0.86),
        x: drift + sway * 0.10,                // sway dissipates, pure drift remains
        rotation: rot0 + spin * 0.87,
        opacity: peakOp * 0.26,
        scale: rng(0.74, 0.86, p.id, cycle, 9),
        duration: t3,
        ease: 'sine.in',
      })

      // Phase 4 — Exit: fast final fade off-screen
      .to(el, {
        y: -(vh * 1.10),
        x: drift * 1.06,
        rotation: rot0 + spin,
        opacity: 0,
        scale: rng(0.48, 0.64, p.id, cycle, 10),
        duration: t4,
        ease: 'power3.in',
      });

    // Seek to initPhase position: element appears mid-flight instantly on load.
    // On subsequent cycles initPhase = 0, so they always start from the bottom.
    if (initPhase > 0) tl.seek(initPhase * dur);
    tl.play();
  }

  // ── Scroll-driven parallax on layer containers ─────────────────────────────
  // Key insight: parallax targets the CONTAINER, not individual elements.
  // Floating animations run on individual elements independently —
  // zero conflict, no scroll-induced stutters.
  private initParallax(host: HTMLElement) {
    const bgLayer  = host.querySelector<HTMLElement>('.atm-bg');
    const midLayer = host.querySelector<HTMLElement>('.atm-mid');
    if (!bgLayer || !midLayer) return;

    const totalScroll = () => Math.max(document.body.scrollHeight - window.innerHeight, 1);

    // bg moves most (deepest) — mid moves half as much — fg has no parallax (closest)
    gsap.to(bgLayer, {
      y: -180, ease: 'none',
      scrollTrigger: { start: 0, end: totalScroll, scrub: 1.4 },
    });
    gsap.to(midLayer, {
      y: -90, ease: 'none',
      scrollTrigger: { start: 0, end: totalScroll, scrub: 1.4 },
    });
  }
}
