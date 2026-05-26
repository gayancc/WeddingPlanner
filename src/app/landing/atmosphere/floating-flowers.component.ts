import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initGsap, gsap } from '../../core/utils/gsap';

// ── 5-petal cherry blossom SVG paths (viewBox 0 0 24 24) ─────────────────────
const FLOWER_PATHS = [
  // Petal 1 — top
  'M12,2 C10,5 10,8 12,10 C14,8 14,5 12,2Z',
  // Petal 2 — top-right
  'M19,5 C16,6 14,9 15,11 C17,10 19,8 19,5Z',
  // Petal 3 — bottom-right
  'M19,19 C17,16 14,15 13,17 C15,19 17,20 19,19Z',
  // Petal 4 — bottom-left
  'M5,19 C7,20 9,19 11,17 C10,15 7,16 5,19Z',
  // Petal 5 — top-left
  'M5,5 C5,8 7,10 9,11 C10,9 8,6 5,5Z',
];

// ── Flower dataset ────────────────────────────────────────────────────────────
// id, startX%, size(px), peakOpacity, initRot(deg), duration(s), seekOffset(s),
// driftX(px), spinSpeed(deg/s), hue(for color), layer
const FLOWERS = [
  // Foreground — large, visible (3)
  { id: 0, x: 18, s: 22, o: 0.42, r:  30, d: 14, off:  2, dx:  64, spin: 45, warm: true  },
  { id: 1, x: 56, s: 20, o: 0.38, r: -50, d: 16, off:  8, dx: -72, spin:-36, warm: false },
  { id: 2, x: 84, s: 24, o: 0.40, r:  70, d: 13, off:  5, dx:  56, spin: 54, warm: true  },
  // Mid — medium (2)
  { id: 3, x:  7, s: 16, o: 0.30, r: -20, d: 18, off: 11, dx: -48, spin:-30, warm: false },
  { id: 4, x: 40, s: 18, o: 0.28, r:  55, d: 20, off:  3, dx:  60, spin: 42, warm: true  },
  // Background — small, faint (2)
  { id: 5, x: 67, s: 12, o: 0.20, r: -40, d: 24, off: 14, dx: -36, spin:-24, warm: false },
  { id: 6, x: 93, s: 14, o: 0.22, r:  25, d: 22, off:  7, dx:  44, spin: 30, warm: true  },
];

// Warm = soft blush/rose; Cool = ivory/champagne
const WARM_COLOR = 'rgba(220,182,182,0.92)';  // muted rose
const COOL_COLOR = 'rgba(241,206,207,0.88)';  // soft blush

@Component({
  selector: 'app-floating-flowers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ff-host" aria-hidden="true">
      @for (f of flowers; track f.id) {
        <span class="ff-flower"
          [style.left.%]="f.x"
          [style.width.px]="f.s"
          [style.height.px]="f.s"
          [style.color]="f.warm ? warm : cool"
          [attr.data-ffid]="f.id">
          <svg viewBox="0 0 24 24" fill="currentColor">
            @for (path of petalPaths; track $index) {
              <path [attr.d]="path" [style.opacity]="0.85 + $index * 0.03" />
            }
            <circle cx="12" cy="12" r="2.2" fill="rgba(255,240,200,0.9)" />
          </svg>
        </span>
      }
    </div>
  `,
  styles: [`
    .ff-host {
      position: fixed; inset: 0;
      pointer-events: none; z-index: 2; overflow: hidden;
    }
    .ff-flower {
      position: absolute; top: 100vh; opacity: 0; display: block;
      will-change: transform;
    }
    .ff-flower svg { width: 100%; height: 100%; display: block; }

    @media (max-width: 768px) {
      .ff-flower:nth-child(n+4) { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .ff-host { display: none; } }
  `],
})
export class FloatingFlowersComponent implements OnInit, OnDestroy {
  private readonly pid = inject(PLATFORM_ID);
  private ctx?: gsap.Context;

  readonly flowers = FLOWERS;
  readonly petalPaths = FLOWER_PATHS;
  readonly warm = WARM_COLOR;
  readonly cool = COOL_COLOR;

  ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    initGsap();
    requestAnimationFrame(() => requestAnimationFrame(() => this.boot()));
  }

  ngOnDestroy() { this.ctx?.revert(); }

  private boot() {
    const host = document.querySelector<HTMLElement>('.ff-host');
    if (!host) return;
    const vh = window.innerHeight;
    const mob = window.innerWidth <= 768;

    this.ctx = gsap.context(() => {
      FLOWERS.forEach(f => {
        const el = host.querySelector<HTMLElement>(`[data-ffid="${f.id}"]`);
        if (!el) return;

        const dx = f.dx * (mob ? 0.5 : 1);
        const totalSpin = f.spin * f.d;

        gsap.set(el, { rotation: f.r, transformOrigin: '50% 50%', scale: 0.6, opacity: 0 });

        const tween = gsap.to(el, {
          keyframes: [
            { y: -(vh * .08), x: dx * .20, rotation: f.r + totalSpin * .08, scale: .78, opacity: f.o * .7,  ease: 'power2.out',  duration: f.d * .10 },
            { y: -(vh * .22), x: dx * .35, rotation: f.r + totalSpin * .22, scale: .90, opacity: f.o,       ease: 'sine.inOut',  duration: f.d * .16 },
            { y: -(vh * .40), x: dx * .55, rotation: f.r + totalSpin * .40, scale: 1.0, opacity: f.o,       ease: 'none',        duration: f.d * .20 },
            { y: -(vh * .60), x: dx * .72, rotation: f.r + totalSpin * .60, scale: 1.0, opacity: f.o * .85, ease: 'none',        duration: f.d * .20 },
            { y: -(vh * .78), x: dx * .88, rotation: f.r + totalSpin * .78, scale: .88, opacity: f.o * .45, ease: 'sine.in',     duration: f.d * .20 },
            { y: -(vh * .94), x: dx,       rotation: f.r + totalSpin,       scale: .70, opacity: f.o * .12, ease: 'power1.in',   duration: f.d * .10 },
            { y: -(vh * 1.05),x: dx * 1.1, rotation: f.r + totalSpin * 1.1, scale: .55, opacity: 0,         ease: 'power2.in',   duration: f.d * .04 },
          ],
          repeat: -1,
          repeatDelay: f.d * .20,
          paused: true,
        });

        tween.seek(f.off % f.d);
        tween.play();
      });
    }, host);
  }
}
