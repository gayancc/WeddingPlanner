import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { initGsap, gsap } from '../../core/utils/gsap';

// ─── Particle data (deterministic — no Math.random at runtime) ──────────────

interface BokehDatum {
  id: number; x: number; y: number;
  size: number; opacity: number; blur: number;
  gold: boolean; driftX: number; driftY: number; dur: number;
}

interface FairyDatum {
  id: number; x: number; y: number;
  size: number; twinkleDur: number; twinkleDelay: number;
  driftX: number; driftY: number;
}

interface PetalDatum {
  id: number; x: number; size: number;
  fallDur: number; startDelay: number; dir: 1 | -1; swing: number;
}

const BOKEH: BokehDatum[] = [
  { id: 0,  x: 5,  y: 12, size: 68, opacity: 0.050, blur: 18, gold: false, driftX: -18, driftY: 12,  dur: 9  },
  { id: 1,  x: 88, y: 8,  size: 44, opacity: 0.045, blur: 12, gold: true,  driftX: 22,  driftY: -14, dur: 11 },
  { id: 2,  x: 42, y: 78, size: 90, opacity: 0.032, blur: 24, gold: false, driftX: 14,  driftY: -20, dur: 14 },
  { id: 3,  x: 73, y: 44, size: 36, opacity: 0.058, blur: 10, gold: true,  driftX: -24, driftY: 16,  dur: 8  },
  { id: 4,  x: 18, y: 91, size: 60, opacity: 0.038, blur: 16, gold: false, driftX: 20,  driftY: -10, dur: 12 },
  { id: 5,  x: 55, y: 22, size: 32, opacity: 0.062, blur: 8,  gold: true,  driftX: -14, driftY: 18,  dur: 7  },
  { id: 6,  x: 28, y: 54, size: 76, opacity: 0.034, blur: 20, gold: false, driftX: 18,  driftY: 14,  dur: 15 },
  { id: 7,  x: 82, y: 80, size: 40, opacity: 0.048, blur: 12, gold: true,  driftX: -20, driftY: -12, dur: 10 },
  { id: 8,  x: 65, y: 96, size: 52, opacity: 0.040, blur: 16, gold: false, driftX: 16,  driftY: -18, dur: 13 },
  { id: 9,  x: 35, y: 5,  size: 28, opacity: 0.060, blur: 8,  gold: true,  driftX: -18, driftY: 20,  dur: 8  },
  { id: 10, x: 93, y: 38, size: 64, opacity: 0.034, blur: 20, gold: false, driftX: 22,  driftY: 12,  dur: 16 },
  { id: 11, x: 10, y: 62, size: 48, opacity: 0.048, blur: 14, gold: true,  driftX: -16, driftY: -16, dur: 11 },
  { id: 12, x: 48, y: 58, size: 38, opacity: 0.044, blur: 10, gold: false, driftX: 20,  driftY: -8,  dur: 9  },
  { id: 13, x: 76, y: 18, size: 72, opacity: 0.032, blur: 22, gold: true,  driftX: -12, driftY: 22,  dur: 14 },
  { id: 14, x: 22, y: 36, size: 26, opacity: 0.062, blur: 6,  gold: false, driftX: 24,  driftY: -14, dur: 7  },
  { id: 15, x: 95, y: 68, size: 58, opacity: 0.038, blur: 16, gold: true,  driftX: -20, driftY: 10,  dur: 12 },
  { id: 16, x: 48, y: 88, size: 34, opacity: 0.052, blur: 10, gold: false, driftX: 14,  driftY: -20, dur: 10 },
  { id: 17, x: 62, y: 40, size: 50, opacity: 0.044, blur: 14, gold: true,  driftX: -22, driftY: 16,  dur: 13 },
];

const FAIRY: FairyDatum[] = [
  { id: 0,  x: 12, y: 22, size: 3, twinkleDur: 2.2, twinkleDelay: 0.0, driftX: -6,  driftY: 8  },
  { id: 1,  x: 38, y: 68, size: 2, twinkleDur: 1.8, twinkleDelay: 0.5, driftX: 8,   driftY: -6 },
  { id: 2,  x: 67, y: 12, size: 4, twinkleDur: 2.5, twinkleDelay: 1.0, driftX: -10, driftY: 12 },
  { id: 3,  x: 85, y: 55, size: 2, twinkleDur: 1.6, twinkleDelay: 1.4, driftX: 6,   driftY: 10 },
  { id: 4,  x: 25, y: 80, size: 3, twinkleDur: 2.0, twinkleDelay: 0.7, driftX: -8,  driftY: -8 },
  { id: 5,  x: 54, y: 42, size: 2, twinkleDur: 2.8, twinkleDelay: 1.8, driftX: 10,  driftY: 6  },
  { id: 6,  x: 78, y: 90, size: 3, twinkleDur: 1.9, twinkleDelay: 0.3, driftX: -6,  driftY: -10},
  { id: 7,  x: 8,  y: 48, size: 4, twinkleDur: 2.3, twinkleDelay: 1.2, driftX: 8,   driftY: 8  },
  { id: 8,  x: 43, y: 15, size: 2, twinkleDur: 1.7, twinkleDelay: 1.6, driftX: -10, driftY: -6 },
  { id: 9,  x: 92, y: 28, size: 3, twinkleDur: 2.6, twinkleDelay: 0.8, driftX: 6,   driftY: -12},
  { id: 10, x: 62, y: 72, size: 2, twinkleDur: 2.1, twinkleDelay: 2.0, driftX: -8,  driftY: 10 },
  { id: 11, x: 30, y: 95, size: 3, twinkleDur: 2.4, twinkleDelay: 0.4, driftX: 10,  driftY: -8 },
  { id: 12, x: 71, y: 35, size: 2, twinkleDur: 1.8, twinkleDelay: 1.5, driftX: -6,  driftY: 6  },
  { id: 13, x: 18, y: 58, size: 4, twinkleDur: 2.7, twinkleDelay: 0.9, driftX: 8,   driftY: -6 },
];

const PETALS: PetalDatum[] = [
  { id: 0, x: 8,  size: 16, fallDur: 20, startDelay: 0,  dir: 1,  swing: 35 },
  { id: 1, x: 22, size: 13, fallDur: 24, startDelay: 4,  dir: -1, swing: 28 },
  { id: 2, x: 45, size: 19, fallDur: 18, startDelay: 8,  dir: 1,  swing: 42 },
  { id: 3, x: 62, size: 14, fallDur: 22, startDelay: 2,  dir: -1, swing: 32 },
  { id: 4, x: 78, size: 20, fallDur: 19, startDelay: 11, dir: 1,  swing: 38 },
  { id: 5, x: 91, size: 15, fallDur: 26, startDelay: 6,  dir: -1, swing: 25 },
];

@Component({
  selector: 'app-ambient',
  standalone: true,
  template: `
    <div class="ambient-wrap" aria-hidden="true">

      <!-- Bokeh — soft blurred orbs drifting slowly -->
      @for (b of bokeh; track b.id) {
        <div
          class="bokeh"
          #bokehEl
          [style.left.%]="b.x"
          [style.top.%]="b.y"
          [style.width.px]="b.size"
          [style.height.px]="b.size"
          [style.opacity]="b.opacity"
          [style.filter]="'blur(' + b.blur + 'px)'"
          [style.background]="b.gold
            ? 'radial-gradient(circle at 40% 40%, #EDE0C8, #C9A86C 60%, transparent)'
            : 'radial-gradient(circle at 40% 40%, #FFFDF8, #F5EDD9 60%, transparent)'">
        </div>
      }

      <!-- Fairy lights — tiny bright dots that twinkle -->
      @for (f of fairy; track f.id) {
        <div
          class="fairy"
          #fairyEl
          [style.left.%]="f.x"
          [style.top.%]="f.y"
          [style.width.px]="f.size"
          [style.height.px]="f.size">
        </div>
      }

      <!-- Petals — drift from top to bottom -->
      @for (p of petals; track p.id) {
        <div
          class="petal"
          #petalEl
          [style.left.%]="p.x"
          [style.width.px]="p.size"
          [style.height.px]="p.size * 1.65">
        </div>
      }

    </div>
  `,
  styles: [
    `
      .ambient-wrap {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 3;
        overflow: hidden;
      }

      /* Bokeh — drifting glow orbs */
      .bokeh {
        position: absolute;
        border-radius: 50%;
        will-change: transform;
        transform: translateZ(0);
      }

      /* Fairy lights — tiny sparkling dots */
      .fairy {
        position: absolute;
        border-radius: 50%;
        background: #FFF9F0;
        box-shadow: 0 0 6px 3px rgba(255, 248, 224, 0.7);
        will-change: transform, opacity;
        transform: translateZ(0);
      }

      /* Petals — soft elongated shapes */
      .petal {
        position: absolute;
        top: -60px;
        left: 0;
        background: linear-gradient(
          135deg,
          rgba(224, 202, 160, 0.22),
          rgba(201, 168, 108, 0.14)
        );
        border-radius: 50% 0 50% 0;
        will-change: transform, opacity;
        transform: translateZ(0);
        opacity: 0;
      }
    `,
  ],
})
export class AmbientComponent implements AfterViewInit, OnDestroy {
  readonly bokeh  = BOKEH;
  readonly fairy  = FAIRY;
  readonly petals = PETALS;

  @ViewChildren('bokehEl') bokehEls!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('fairyEl') fairyEls!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('petalEl') petalEls!: QueryList<ElementRef<HTMLElement>>;

  private ctx?: gsap.Context;
  private petalTimelines: gsap.core.Timeline[] = [];

  ngAfterViewInit() {
    initGsap();
    if (typeof window === 'undefined') return;
    this.animate();
  }

  ngOnDestroy() {
    this.petalTimelines.forEach((tl) => tl.kill());
    this.ctx?.revert();
  }

  private animate() {
    this.ctx = gsap.context(() => {

      // ── Bokeh drift ─────────────────────────────────────────
      this.bokehEls.forEach((elRef, i) => {
        const b = this.bokeh[i];
        gsap.to(elRef.nativeElement, {
          x: b.driftX,
          y: b.driftY,
          duration: b.dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.38,
        });
      });

      // ── Fairy light twinkle + slow drift ────────────────────
      this.fairyEls.forEach((elRef, i) => {
        const f = this.fairy[i];
        const el = elRef.nativeElement;

        // Twinkle opacity + scale
        gsap.to(el, {
          opacity: 0.08,
          scale: 0.4,
          duration: f.twinkleDur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: f.twinkleDelay,
        });

        // Slow spatial drift
        gsap.to(el, {
          x: f.driftX,
          y: f.driftY,
          duration: f.twinkleDur * 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: f.twinkleDelay * 1.5,
        });
      });

    });

    // ── Petal fall ──────────────────────────────────────────
    // Managed outside GSAP context so recursive callbacks work cleanly
    this.petalEls.forEach((elRef, i) => {
      const p = this.petals[i];
      gsap.delayedCall(p.startDelay, () => this.runPetal(elRef.nativeElement, p));
    });
  }

  private runPetal(el: HTMLElement, p: PetalDatum) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const startX = (p.x / 100) * vw;

    const tl = gsap.timeline({
      onComplete: () => {
        this.petalTimelines = this.petalTimelines.filter((t) => t !== tl);
        this.runPetal(el, p);
      },
    });

    this.petalTimelines.push(tl);

    tl.set(el, { x: startX, y: -60, rotation: 0, opacity: 0 })
      .to(el, { opacity: 0.18, duration: 1.5, ease: 'power2.in' })
      .to(
        el,
        {
          y: vh + 80,
          x: startX + p.dir * p.swing,
          rotation: p.dir * (200 + p.id * 35),
          duration: p.fallDur,
          ease: 'none',
        },
        0,
      )
      .to(el, { opacity: 0, duration: 2.5, ease: 'power2.out' }, `-=3`);
  }
}
