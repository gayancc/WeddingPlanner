import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { initGsap, gsap } from '../../core/utils/gsap';

// Deterministic noise — same as atmosphere.component.ts, avoids synchronized stagger
const prng = (a: number, b: number, c = 0): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.9453) * 43758.5453;
  return v - Math.floor(v);
};

interface BokehDatum {
  id: number; x: number; y: number;
  size: number; opacity: number; blur: number;
  gold: boolean; driftX: number; driftY: number; dur: number;
}

interface FairyDatum {
  id: number; x: number; y: number;
  size: number; twinkleDur: number;
  driftX: number; driftY: number;
}

const BOKEH: BokehDatum[] = [
  { id: 0, x:  8, y: 14, size: 72, opacity: 0.045, blur: 20, gold: false, driftX:-18, driftY: 12, dur: 9  },
  { id: 1, x: 84, y:  9, size: 48, opacity: 0.040, blur: 14, gold: true,  driftX: 22, driftY:-14, dur:11  },
  { id: 2, x: 44, y: 76, size: 88, opacity: 0.030, blur: 26, gold: false, driftX: 14, driftY:-20, dur:14  },
  { id: 3, x: 71, y: 42, size: 40, opacity: 0.052, blur: 12, gold: true,  driftX:-24, driftY: 16, dur: 8  },
  { id: 4, x: 20, y: 90, size: 64, opacity: 0.034, blur: 18, gold: false, driftX: 20, driftY:-10, dur:12  },
  { id: 5, x: 58, y: 24, size: 36, opacity: 0.058, blur:  9, gold: true,  driftX:-14, driftY: 18, dur: 7  },
  { id: 6, x: 30, y: 55, size: 80, opacity: 0.030, blur: 22, gold: false, driftX: 18, driftY: 14, dur:15  },
  { id: 7, x: 93, y: 70, size: 56, opacity: 0.042, blur: 16, gold: true,  driftX:-20, driftY:-12, dur:10  },
];

const FAIRY: FairyDatum[] = [
  { id: 0, x: 12, y: 22, size: 3, twinkleDur: 2.2, driftX: -6, driftY:  8 },
  { id: 1, x: 38, y: 68, size: 2, twinkleDur: 1.8, driftX:  8, driftY: -6 },
  { id: 2, x: 67, y: 12, size: 4, twinkleDur: 2.5, driftX:-10, driftY: 12 },
  { id: 3, x: 85, y: 55, size: 2, twinkleDur: 1.6, driftX:  6, driftY: 10 },
  { id: 4, x: 25, y: 80, size: 3, twinkleDur: 2.0, driftX: -8, driftY: -8 },
  { id: 5, x: 54, y: 42, size: 2, twinkleDur: 2.8, driftX: 10, driftY:  6 },
];

@Component({
  selector: 'app-ambient',
  standalone: true,
  template: `
    <div class="ambient-wrap" aria-hidden="true">

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

    </div>
  `,
  styles: [`
    .ambient-wrap {
      position: fixed; inset: 0;
      pointer-events: none; z-index: 3; overflow: hidden;
    }

    .bokeh {
      position: absolute; border-radius: 50%;
      will-change: transform; transform: translateZ(0);
    }

    .fairy {
      position: absolute; border-radius: 50%;
      background: #FFF9F0;
      box-shadow: 0 0 6px 3px rgba(255, 248, 224, 0.7);
      will-change: transform, opacity; transform: translateZ(0);
    }

    @media (prefers-reduced-motion: reduce) { .ambient-wrap { display: none; } }
  `],
})
export class AmbientComponent implements AfterViewInit, OnDestroy {
  readonly bokeh = BOKEH;
  readonly fairy = FAIRY;

  @ViewChildren('bokehEl') bokehEls!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('fairyEl') fairyEls!: QueryList<ElementRef<HTMLElement>>;

  private ctx?: gsap.Context;

  ngAfterViewInit() {
    initGsap();
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.animate();
  }

  ngOnDestroy() { this.ctx?.revert(); }

  private animate() {
    this.ctx = gsap.context(() => {

      // Bokeh drift — delays via prng to break synchronized waves
      this.bokehEls.forEach((elRef, i) => {
        const b = this.bokeh[i];
        const delay = prng(b.id, 7) * b.dur * 0.8; // spread across first 80% of cycle
        gsap.to(elRef.nativeElement, {
          x: b.driftX, y: b.driftY,
          duration: b.dur,
          repeat: -1, yoyo: true,
          ease: 'sine.inOut',
          delay,
        });
      });

      // Fairy light twinkle + slow drift — independent prng delays per element
      this.fairyEls.forEach((elRef, i) => {
        const f = this.fairy[i];
        const el = elRef.nativeElement;
        const twinkleDelay = prng(f.id + 100, 3) * f.twinkleDur;
        const driftDelay   = prng(f.id + 200, 5) * f.twinkleDur * 2;

        gsap.to(el, {
          opacity: 0.08, scale: 0.4,
          duration: f.twinkleDur,
          repeat: -1, yoyo: true,
          ease: 'sine.inOut',
          delay: twinkleDelay,
        });

        gsap.to(el, {
          x: f.driftX, y: f.driftY,
          duration: f.twinkleDur * 3.2,
          repeat: -1, yoyo: true,
          ease: 'sine.inOut',
          delay: driftDelay,
        });
      });

    });
  }
}
