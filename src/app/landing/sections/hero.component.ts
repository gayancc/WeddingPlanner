import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { WeddingSettings } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

const PARTICLES = [
  { id: 0,  x: 8,  y: 15, size: 5,  opacity: 0.25 },
  { id: 1,  x: 18, y: 72, size: 3,  opacity: 0.18 },
  { id: 2,  x: 30, y: 40, size: 7,  opacity: 0.20 },
  { id: 3,  x: 45, y: 82, size: 4,  opacity: 0.22 },
  { id: 4,  x: 60, y: 22, size: 6,  opacity: 0.15 },
  { id: 5,  x: 72, y: 58, size: 3,  opacity: 0.28 },
  { id: 6,  x: 85, y: 35, size: 8,  opacity: 0.16 },
  { id: 7,  x: 92, y: 75, size: 4,  opacity: 0.20 },
  { id: 8,  x: 12, y: 88, size: 5,  opacity: 0.18 },
  { id: 9,  x: 55, y: 10, size: 3,  opacity: 0.24 },
  { id: 10, x: 78, y: 90, size: 6,  opacity: 0.14 },
  { id: 11, x: 38, y: 60, size: 4,  opacity: 0.20 },
  { id: 12, x: 65, y: 48, size: 5,  opacity: 0.17 },
  { id: 13, x: 22, y: 30, size: 3,  opacity: 0.22 },
];

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section id="top" class="hero" #heroEl>

      <!-- Parallax background layer -->
      <div class="hero-bg" #heroBg
        [style.background-image]="bgImage()"
        [class.hero-bg--gradient]="!settings.heroPhotoUrl">
      </div>

      <!-- Atmospheric overlays -->
      <div class="hero-overlay"></div>
      <div class="hero-vignette"></div>
      <div class="hero-glow"></div>

      <!-- Mouse-follow warm light -->
      <div class="hero-mouse-light" #mouseLightEl aria-hidden="true"></div>

      <!-- Floating gold particles -->
      @for (p of particles; track p.id) {
        <div
          class="hero-particle"
          #particle
          [style.left.%]="p.x"
          [style.top.%]="p.y"
          [style.width.px]="p.size"
          [style.height.px]="p.size"
          [style.opacity]="p.opacity">
        </div>
      }

      <!-- Main content -->
      <div class="hero-content" #contentEl>

        <div class="hero-eyebrow" #eyebrow>
          <span class="eyebrow-rule"></span>
          <span class="eyebrow-text">We Are Getting Married</span>
          <span class="eyebrow-rule"></span>
        </div>

        <!-- Character-split couple names -->
        <h1 class="hero-names" #namesEl>
          @for (ch of nameChars; track $index) {
            <span class="name-char" [class.name-space]="ch === ' '">{{ ch }}</span>
          }
        </h1>

        @if (settings.weddingDate) {
          <p class="hero-date" #dateEl>
            {{ settings.weddingDate.toDate() | date: 'EEEE · MMMM d, y' }}
          </p>
        }

        <p class="hero-venue" #venueEl>{{ settings.venue }}</p>

        <div class="hero-rule" #ruleEl>
          <span class="rule-line"></span>
          <span class="rule-gem">✦</span>
          <span class="rule-line"></span>
        </div>

        <!-- Glassmorphic countdown -->
        <div class="hero-countdown" #countdownEl>
          @for (unit of countdownUnits(); track unit.label) {
            <div class="cu">
              <div class="cu-glass">
                <span class="cu-num">{{ unit.value }}</span>
              </div>
              <span class="cu-lbl">{{ unit.label }}</span>
            </div>
          }
        </div>

        <!-- CTA -->
        <a href="#schedule" class="hero-cta" #ctaEl>
          <span class="cta-fill"></span>
          <span class="cta-label">Explore Our Day</span>
          <svg class="cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>

      <!-- Scroll indicator -->
      <div class="hero-scroll" #scrollEl aria-hidden="true">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span class="scroll-label">Scroll</span>
      </div>

    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 100svh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #16120E;
    }

    /* ── Background ── */
    .hero-bg {
      position: absolute;
      inset: -15%;
      background-size: cover;
      background-position: center;
      will-change: transform;
      transform: translateZ(0);
    }

    .hero-bg--gradient {
      background: linear-gradient(135deg, #192519 0%, #2a3d2a 40%, #3c5534 70%, #2b3e2b 100%);
    }

    /* ── Atmospheric layers ── */
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        175deg,
        rgba(16,12,8,.20) 0%,
        rgba(16,12,8,.50) 45%,
        rgba(16,12,8,.82) 100%
      );
      z-index: 1;
    }

    .hero-vignette {
      position: absolute; inset: 0;
      background: radial-gradient(
        ellipse 100% 100% at 50% 50%,
        transparent 35%, rgba(16,12,8,.55) 100%
      );
      z-index: 2;
    }

    .hero-glow {
      position: absolute; inset: 0;
      background: radial-gradient(
        ellipse 70% 50% at 50% 55%,
        rgba(201,168,108,.09) 0%, transparent 70%
      );
      z-index: 3;
      animation: breathe-glow 7s ease-in-out infinite;
    }

    /* ── Mouse-follow warm light ── */
    .hero-mouse-light {
      position: absolute;
      top: 50%; left: 50%;
      width: 600px; height: 600px;
      margin: -300px 0 0 -300px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(201,168,108,.10) 0%,
        rgba(201,168,108,.04) 40%,
        transparent 70%
      );
      pointer-events: none;
      z-index: 4;
      will-change: transform;
    }

    /* ── Particles ── */
    .hero-particle {
      position: absolute;
      background: var(--color-gold);
      border-radius: 50%;
      z-index: 4;
      will-change: transform;
      filter: blur(0.5px);
    }

    /* ── Content ── */
    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 120px 24px 80px;
      max-width: 900px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      will-change: transform, opacity;
    }

    /* Eyebrow */
    .hero-eyebrow {
      display: flex; align-items: center; gap: 18px;
      margin-bottom: 32px; opacity: 0;
    }

    .eyebrow-rule {
      display: block; width: 44px; height: 1px;
      background: rgba(201,168,108,.55);
    }

    .eyebrow-text {
      font-size: 10px; letter-spacing: .38em;
      text-transform: uppercase; color: var(--color-gold-soft);
      white-space: nowrap;
    }

    /* ── Character-split names ── */
    .hero-names {
      font-family: var(--font-serif);
      font-size: clamp(52px, 11vw, 116px);
      font-weight: 700;
      line-height: 1.0;
      color: white;
      letter-spacing: -0.02em;
      margin: 0 0 22px;
      text-shadow: 0 4px 48px rgba(0,0,0,.45);
    }

    .name-char {
      display: inline-block;
      will-change: transform, opacity;
    }

    .name-space {
      display: inline-block;
      width: 0.28em;
    }

    /* Date */
    .hero-date {
      font-family: var(--font-serif); font-style: italic;
      font-size: clamp(16px, 2.4vw, 22px);
      color: var(--color-gold-soft);
      margin: 0 0 8px; letter-spacing: .04em; opacity: 0;
    }

    /* Venue */
    .hero-venue {
      font-size: 12px; letter-spacing: .24em;
      text-transform: uppercase;
      color: rgba(255,255,255,.55);
      margin: 0 0 36px; opacity: 0;
    }

    /* Ornamental rule */
    .hero-rule {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 36px; opacity: 0;
    }

    .rule-line {
      display: block; width: 56px; height: 1px;
      background: linear-gradient(to right, transparent, rgba(201,168,108,.5), transparent);
    }

    .rule-gem { color: var(--color-gold); font-size: 14px; }

    /* ── Countdown ── */
    .hero-countdown {
      display: flex; gap: 14px; margin-bottom: 40px; opacity: 0;
    }

    .cu { display: flex; flex-direction: column; align-items: center; gap: 10px; }

    .cu-glass {
      width: 72px; height: 72px; border-radius: 18px;
      background: rgba(255,255,255,.055);
      border: 1px solid rgba(255,255,255,.10);
      backdrop-filter: blur(16px) saturate(150%);
      -webkit-backdrop-filter: blur(16px) saturate(150%);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 300ms, box-shadow 300ms;
    }

    .cu-glass:hover {
      border-color: rgba(201,168,108,.35);
      box-shadow: 0 0 20px rgba(201,168,108,.12);
    }

    .cu-num {
      font-family: var(--font-serif); font-size: 26px; font-weight: 700;
      color: white; line-height: 1; font-variant-numeric: tabular-nums;
    }

    .cu-lbl {
      font-size: 9px; letter-spacing: .22em;
      text-transform: uppercase; color: var(--color-gold-dim);
    }

    /* ── CTA ── */
    .hero-cta {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 15px 42px;
      border: 1px solid rgba(201,168,108,.6);
      color: white; font-family: var(--font-serif);
      font-size: 13px; letter-spacing: .14em;
      text-transform: uppercase; border-radius: var(--radius-full);
      position: relative; overflow: hidden;
      opacity: 0;
      transition: border-color 300ms, color 300ms;
    }

    .cta-fill {
      position: absolute; inset: 0;
      background: var(--color-gold);
      transform: scaleX(0); transform-origin: left;
      transition: transform 350ms var(--ease-cinematic);
      border-radius: inherit;
    }

    .hero-cta:hover .cta-fill { transform: scaleX(1); }
    .hero-cta:hover { color: var(--color-fg); border-color: var(--color-gold); }

    .cta-label, .cta-arrow { position: relative; z-index: 1; }
    .cta-arrow { animation: float-down 2s ease-in-out infinite; }

    @keyframes float-down {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(4px); }
    }

    /* ── Scroll indicator ── */
    .hero-scroll {
      position: absolute; bottom: 36px; left: 50%;
      transform: translateX(-50%);
      z-index: 10; display: flex; flex-direction: column;
      align-items: center; gap: 10px; opacity: 0;
    }

    .scroll-mouse {
      width: 22px; height: 36px;
      border: 1.5px solid rgba(255,255,255,.28);
      border-radius: 11px;
      display: flex; align-items: flex-start;
      justify-content: center; padding-top: 6px;
    }

    .scroll-wheel {
      width: 2.5px; height: 7px;
      background: rgba(255,255,255,.55);
      border-radius: 3px;
      animation: wheel 2s ease-in-out infinite;
    }

    @keyframes wheel {
      0%   { opacity: 1; transform: translateY(0); }
      80%  { opacity: 0; transform: translateY(10px); }
      100% { opacity: 0; }
    }

    .scroll-label {
      font-size: 9px; letter-spacing: .3em;
      text-transform: uppercase; color: rgba(255,255,255,.35);
    }

    @media (max-width: 540px) {
      .hero-countdown { gap: 8px; }
      .cu-glass { width: 58px; height: 58px; }
      .cu-num { font-size: 20px; }
      .eyebrow-rule { width: 28px; }
    }
  `],
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) settings!: WeddingSettings;

  @ViewChild('heroEl')       heroEl!:       ElementRef<HTMLElement>;
  @ViewChild('heroBg')       heroBg!:       ElementRef<HTMLElement>;
  @ViewChild('mouseLightEl') mouseLightEl!: ElementRef<HTMLElement>;
  @ViewChild('contentEl')    contentEl!:    ElementRef<HTMLElement>;
  @ViewChildren('particle')  particleEls!:  QueryList<ElementRef<HTMLElement>>;

  readonly days    = signal(0);
  readonly hours   = signal(0);
  readonly minutes = signal(0);
  readonly seconds = signal(0);
  readonly particles = PARTICLES;

  // Getter (not computed signal) so it re-evaluates when @Input settings changes.
  // computed() only tracks Angular signal reads — plain @Input properties are invisible to it.
  get nameChars(): string[] {
    return (this.settings.coupleNames || 'Her & Him').split('');
  }

  readonly countdownUnits = computed(() => [
    { value: String(this.days()).padStart(2, '0'),    label: 'Days' },
    { value: String(this.hours()).padStart(2, '0'),   label: 'Hours' },
    { value: String(this.minutes()).padStart(2, '0'), label: 'Mins' },
    { value: String(this.seconds()).padStart(2, '0'), label: 'Secs' },
  ]);

  private timer?: ReturnType<typeof setInterval>;
  private ctx?: gsap.Context;

  bgImage(): string {
    return this.settings.heroPhotoUrl ? `url('${this.settings.heroPhotoUrl}')` : '';
  }

  ngOnInit() {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngAfterViewInit() {
    initGsap();
    this.initAnimations();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.ctx?.revert();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.heroEl) return;
    const rect = this.heroEl.nativeElement.getBoundingClientRect();
    // Only active when hero is visible
    if (rect.bottom < 0 || rect.height === 0) return;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;  // −1 to 1
    const dy = (e.clientY - rect.top - cy) / cy;

    // Layer 1: background drifts with cursor (slow, same direction)
    gsap.to(this.heroBg.nativeElement, {
      x: dx * 22, y: dy * 14,
      duration: 1.8, ease: 'power2.out', overwrite: 'auto',
    });

    // Layer 2: content shifts subtly with cursor
    gsap.to(this.contentEl.nativeElement, {
      x: dx * 7, y: dy * 4,
      duration: 2.5, ease: 'power3.out', overwrite: 'auto',
    });

    // Layer 3: particles move opposite (depth illusion)
    gsap.to('.hero-particle', {
      x: -dx * 16, y: -dy * 10,
      duration: 1.5, ease: 'power2.out', overwrite: 'auto',
    });

    // Mouse warm light tracks cursor precisely
    gsap.to(this.mouseLightEl.nativeElement, {
      x: e.clientX - rect.left - cx,
      y: e.clientY - rect.top - cy,
      duration: 0.55, ease: 'power1.out', overwrite: 'auto',
    });
  }

  private tick() {
    if (!this.settings.weddingDate) return;
    const diff = Math.max(0, this.settings.weddingDate.toDate().getTime() - Date.now());
    this.days.set(Math.floor(diff / 86_400_000));
    this.hours.set(Math.floor((diff % 86_400_000) / 3_600_000));
    this.minutes.set(Math.floor((diff % 3_600_000) / 60_000));
    this.seconds.set(Math.floor((diff % 60_000) / 1000));
  }

  private initAnimations() {
    const el = this.heroEl.nativeElement;
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {

      if (prefersReduced) {
        gsap.set(['.hero-eyebrow', '.name-char', '.hero-date', '.hero-venue',
          '.hero-rule', '.hero-countdown', '.hero-cta', '.hero-scroll'],
          { opacity: 1, y: 0, yPercent: 0, rotateZ: 0 });
        return;
      }

      // ── Initial states for character split ──
      gsap.set('.name-char:not(.name-space)', {
        opacity: 0,
        yPercent: 110,
        rotateZ: (i: number) => i % 2 === 0 ? 7 : -7,
      });
      gsap.set('.name-space', { opacity: 1 });

      // ── Cinematic entrance timeline ──
      const tl = gsap.timeline({ delay: 0.25 });

      tl.to('.hero-eyebrow', { opacity: 1, duration: 0.9, ease: 'power3.out' })
        // Characters cascade in from below, each settling from a slight tilt
        .to('.name-char:not(.name-space)', {
          opacity: 1,
          yPercent: 0,
          rotateZ: 0,
          duration: 1.15,
          stagger: { each: 0.042, ease: 'power1.in' },
          ease: 'power4.out',
        }, '-=0.5')
        .to('.hero-date',      { opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.55')
        .to('.hero-venue',     { opacity: 1, duration: 0.6 }, '-=0.45')
        .to('.hero-rule',      { opacity: 1, duration: 0.5 }, '-=0.35')
        .to('.hero-countdown', { opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.4')
        .to('.hero-cta',       { opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .to('.hero-scroll',    { opacity: 1, duration: 0.6 }, '-=0.35');

      // ── Floating particles (depth: different speeds) ──
      this.particleEls.forEach((p, i) => {
        const pEl = p.nativeElement;
        gsap.to(pEl, {
          y: -15 + ((i * 7) % 25),
          x: -8  + ((i * 5) % 14),
          duration: 3.5 + (i * 0.8) % 3.5,
          repeat: -1, yoyo: true,
          ease: 'sine.inOut', delay: i * 0.22,
        });
      });

      // ── Background parallax (scroll) ──
      gsap.to('.hero-bg', {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1.5 },
      });

      // Background subtly zooms as hero exits
      gsap.to('.hero-bg', {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 2 },
      });

      // ── Content slow upward drift on scroll ──
      gsap.to('.hero-content', {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 },
      });

      // Particles drift upward faster
      gsap.to('.hero-particle', {
        yPercent: -35,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 2 },
      });

      // ── Cinematic scroll exit: chars disperse as hero leaves ──
      // This plays as you scroll past 20% of the hero section
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: '20% top',
          end: 'bottom top',
          scrub: 1.2,
        }
      })
        .to('.name-char:not(.name-space)', {
          opacity: 0,
          yPercent: -20,
          stagger: { each: 0.018, from: 'center' },
          ease: 'none',
        }, 0)
        .to(['.hero-date', '.hero-venue', '.hero-rule', '.hero-countdown', '.hero-cta', '.hero-eyebrow'], {
          opacity: 0,
          ease: 'none',
        }, 0);

    }, el);
  }
}
