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

// ── Particle dataset ──────────────────────────────────────────────────────────
// id, x%, y%, size(px), opacity, driftX(px), driftY(px),
// pulseDur(s), driftDur(s), gold(bool)
const PARTICLES = [
  // Gold glow — warm champagne
  { id: 0,  x:  8, y: 18, s: 4, o: 0.55, dx:  14, dy: -10, pd: 2.2, dd: 7.0, gold: true  },
  { id: 1,  x: 22, y: 72, s: 3, o: 0.48, dx:  -8, dy:  16, pd: 1.8, dd: 8.5, gold: true  },
  { id: 2,  x: 38, y: 30, s: 5, o: 0.60, dx:  18, dy: -14, pd: 2.6, dd: 6.0, gold: true  },
  { id: 3,  x: 55, y: 85, s: 3, o: 0.45, dx: -12, dy:   8, pd: 2.0, dd: 9.0, gold: true  },
  { id: 4,  x: 72, y: 14, s: 4, o: 0.52, dx:  10, dy:  18, pd: 1.9, dd: 7.5, gold: true  },
  { id: 5,  x: 88, y: 60, s: 6, o: 0.58, dx: -16, dy: -12, pd: 2.4, dd: 5.5, gold: true  },
  { id: 6,  x: 14, y: 45, s: 3, o: 0.44, dx:  12, dy:  14, pd: 2.8, dd: 8.0, gold: true  },
  { id: 7,  x: 65, y: 40, s: 4, o: 0.50, dx:  -6, dy:  -8, pd: 2.1, dd: 6.5, gold: true  },
  { id: 8,  x: 46, y: 55, s: 5, o: 0.56, dx:  20, dy: -16, pd: 2.3, dd: 7.8, gold: true  },
  { id: 9,  x: 30, y: 92, s: 3, o: 0.42, dx:  -8, dy:  10, pd: 1.7, dd: 9.5, gold: true  },
  // Ivory dust — soft white
  { id: 10, x:  5, y: 65, s: 3, o: 0.35, dx:  16, dy: -12, pd: 3.0, dd: 8.2, gold: false },
  { id: 11, x: 18, y: 38, s: 4, o: 0.40, dx:  -10, dy:  8, pd: 2.5, dd: 7.0, gold: false },
  { id: 12, x: 33, y: 12, s: 3, o: 0.32, dx:  12, dy:  20, pd: 2.2, dd: 9.8, gold: false },
  { id: 13, x: 50, y: 68, s: 5, o: 0.38, dx: -14, dy: -10, pd: 2.7, dd: 6.8, gold: false },
  { id: 14, x: 62, y: 25, s: 3, o: 0.30, dx:   8, dy:  14, pd: 3.2, dd: 8.6, gold: false },
  { id: 15, x: 78, y: 82, s: 4, o: 0.36, dx: -18, dy:  -8, pd: 2.8, dd: 7.4, gold: false },
  { id: 16, x: 85, y: 48, s: 3, o: 0.34, dx:  10, dy:  12, pd: 2.4, dd: 9.2, gold: false },
  { id: 17, x: 95, y: 22, s: 4, o: 0.38, dx: -12, dy: -16, pd: 2.6, dd: 6.4, gold: false },
  { id: 18, x: 42, y: 78, s: 3, o: 0.30, dx:  14, dy:   6, pd: 3.1, dd: 8.8, gold: false },
  { id: 19, x: 70, y: 95, s: 4, o: 0.32, dx:  -8, dy: -14, pd: 2.9, dd: 7.6, gold: false },
];

@Component({
  selector: 'app-glow-particles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gp-host" aria-hidden="true">
      @for (p of particles; track p.id) {
        <span class="gp-particle" [class.gp-gold]="p.gold"
          [style.left.%]="p.x" [style.top.%]="p.y"
          [style.width.px]="p.s" [style.height.px]="p.s"
          [style.opacity]="p.o"
          [attr.data-gpid]="p.id">
        </span>
      }
    </div>
  `,
  styles: [`
    .gp-host {
      position: fixed; inset: 0;
      pointer-events: none; z-index: 1; overflow: hidden;
    }
    .gp-particle {
      position: absolute; border-radius: 50%;
      background: rgba(248,243,234,0.9);
      box-shadow: 0 0 8px 4px rgba(248,243,234,0.5);
      will-change: transform, opacity;
    }
    .gp-gold {
      background: rgba(201,168,108,0.9);
      box-shadow: 0 0 10px 5px rgba(201,168,108,0.4), 0 0 20px 8px rgba(201,168,108,0.15);
    }

    @media (max-width: 768px) {
      .gp-particle:nth-child(n+11) { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .gp-host { display: none; } }
  `],
})
export class GlowParticlesComponent implements OnInit, OnDestroy {
  private readonly pid = inject(PLATFORM_ID);
  private ctx?: gsap.Context;

  readonly particles = PARTICLES;

  ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    initGsap();
    requestAnimationFrame(() => requestAnimationFrame(() => this.boot()));
  }

  ngOnDestroy() { this.ctx?.revert(); }

  private boot() {
    const host = document.querySelector<HTMLElement>('.gp-host');
    if (!host) return;

    this.ctx = gsap.context(() => {
      PARTICLES.forEach((p, i) => {
        const el = host.querySelector<HTMLElement>(`[data-gpid="${p.id}"]`);
        if (!el) return;

        // Gentle pulse: scale + opacity
        gsap.to(el, {
          scale: 1.8,
          opacity: p.o * 0.25,
          duration: p.pd,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.18,
        });

        // Slow drift in place (small range, yoyo)
        gsap.to(el, {
          x: p.dx,
          y: p.dy,
          duration: p.dd,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.12,
        });
      });
    }, host);
  }
}
