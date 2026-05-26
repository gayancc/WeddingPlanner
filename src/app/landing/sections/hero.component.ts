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
} from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';
import { WeddingSettings } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

const PETALS = [
  { id:  0, x:  6, y: 12, w: 11, h: 19, opacity: 0.20, rot:  20, floatY: 16, floatDur: 5.2, white: true  },
  { id:  1, x: 20, y: 58, w:  8, h: 14, opacity: 0.15, rot: -30, floatY: 12, floatDur: 6.8, white: true  },
  { id:  2, x: 32, y: 22, w: 13, h: 22, opacity: 0.13, rot:  50, floatY: 18, floatDur: 7.4, white: true  },
  { id:  3, x: 14, y: 72, w: 10, h: 18, opacity: 0.16, rot: -15, floatY: 10, floatDur: 5.8, white: true  },
  { id:  4, x: 26, y: 88, w:  9, h: 16, opacity: 0.12, rot:  40, floatY: 14, floatDur: 8.2, white: true  },
  { id:  5, x:  8, y: 42, w:  7, h: 12, opacity: 0.18, rot: -55, floatY: 20, floatDur: 6.0, white: true  },
  { id:  6, x: 40, y:  8, w: 12, h: 21, opacity: 0.11, rot:  70, floatY: 15, floatDur: 7.0, white: true  },
  { id:  7, x: 44, y: 48, w:  8, h: 14, opacity: 0.14, rot: -25, floatY: 11, floatDur: 9.0, white: true  },
  { id:  8, x: 58, y: 18, w: 10, h: 18, opacity: 0.13, rot:  35, floatY: 14, floatDur: 6.4, white: false },
  { id:  9, x: 72, y: 62, w:  9, h: 16, opacity: 0.10, rot: -45, floatY: 16, floatDur: 7.8, white: false },
  { id: 10, x: 84, y: 28, w: 12, h: 21, opacity: 0.09, rot:  60, floatY: 20, floatDur: 5.6, white: false },
  { id: 11, x: 66, y: 82, w:  8, h: 14, opacity: 0.11, rot: -20, floatY: 12, floatDur: 8.6, white: false },
  { id: 12, x: 90, y: 14, w: 11, h: 19, opacity: 0.08, rot:  80, floatY: 18, floatDur: 6.2, white: false },
  { id: 13, x: 78, y: 50, w:  7, h: 12, opacity: 0.12, rot: -65, floatY: 10, floatDur: 7.2, white: false },
  { id: 14, x: 94, y: 74, w: 10, h: 18, opacity: 0.07, rot:  25, floatY: 16, floatDur: 9.4, white: false },
  { id: 15, x: 60, y: 92, w:  9, h: 16, opacity: 0.10, rot: -40, floatY: 13, floatDur: 5.4, white: false },
];

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [DatePipe, NgStyle],
  template: `
    <section id="top" class="hero" #heroEl>

      <!-- ─── Left: photo panel ─── -->
      <div class="hero-photo" #photoEl>
        <div class="photo-bg" [ngStyle]="photoBgStyle"></div>
        <!-- Organic green paint-stroke accent -->
        <svg class="photo-stroke" viewBox="0 0 260 200" fill="none" aria-hidden="true" preserveAspectRatio="none">
          <path d="M0 160 Q60 120 130 140 Q200 160 260 120 L260 200 L0 200 Z"
                fill="rgba(44,74,46,.55)"/>
          <path d="M0 178 Q80 155 160 170 Q220 180 260 155 L260 200 L0 200 Z"
                fill="rgba(44,74,46,.85)"/>
        </svg>
        <!-- Right-edge fade into panel -->
        <div class="photo-fade" aria-hidden="true"></div>
      </div>

      <!-- ─── Right: content panel ─── -->
      <div class="hero-panel" #panelEl>

        <!-- Leaf cluster top-right -->
        <svg class="deco-leaf" viewBox="0 0 140 160" fill="none" aria-hidden="true">
          <path d="M110 10 Q140 50 100 80 Q70 100 50 70 Q30 45 60 20 Q80 5 110 10Z"
                fill="rgba(44,74,46,.09)" stroke="rgba(44,74,46,.18)" stroke-width="1"/>
          <path d="M95 5 Q130 30 115 65 Q100 90 75 72 Q55 56 70 28 Q82 8 95 5Z"
                fill="rgba(44,74,46,.06)" stroke="rgba(44,74,46,.14)" stroke-width="1"/>
          <path d="M70 30 Q65 20 80 8" stroke="rgba(44,74,46,.22)" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M90 55 Q95 42 112 35" stroke="rgba(44,74,46,.18)" stroke-width="1" stroke-linecap="round"/>
          <path d="M68 72 Q55 80 42 100 Q35 115 48 128 Q58 140 72 130 Q88 118 82 100 Q78 86 68 72Z"
                fill="rgba(201,168,108,.08)" stroke="rgba(201,168,108,.20)" stroke-width="1"/>
          <path d="M56 72 L70 128" stroke="rgba(201,168,108,.18)" stroke-width="1" stroke-linecap="round"/>
        </svg>

        <!-- Floral accent bottom-left -->
        <svg class="deco-floral" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <circle cx="60" cy="60" r="18" fill="rgba(44,74,46,.07)" stroke="rgba(44,74,46,.16)" stroke-width="1"/>
          <circle cx="60" cy="60" r="8" fill="rgba(201,168,108,.15)"/>
          @for (angle of petalAngles; track angle) {
            <ellipse cx="60" cy="36" rx="7" ry="14"
                     fill="rgba(44,74,46,.07)" stroke="rgba(44,74,46,.14)" stroke-width="1"
                     [attr.transform]="'rotate(' + angle + ', 60, 60)'"/>
          }
        </svg>

        <!-- Content -->
        <div class="hero-content" #contentEl>

          <p class="hero-eyebrow" #eyebrowEl>
            <span class="eyebrow-rule"></span>
            <span>Wedding Of</span>
            <span class="eyebrow-rule"></span>
          </p>

          <h1 class="hero-names" #namesEl>{{ settings.coupleNames || 'Her &amp; Him' }}</h1>

          @if (settings.weddingDate) {
            <p class="hero-date" #dateEl>
              {{ settings.weddingDate.toDate() | date: 'MMMM d, y' }}
            </p>
          }

          @if (settings.venue) {
            <p class="hero-venue" #venueEl>{{ settings.venue }}</p>
          }

          <!-- Ornament divider -->
          <div class="hero-ornament" #ornEl aria-hidden="true">
            <span class="orn-line"></span>
            <span class="orn-gem">✦</span>
            <span class="orn-line"></span>
          </div>

          <!-- Countdown -->
          @if (settings.weddingDate) {
            <div class="hero-countdown" #countdownEl>
              @for (unit of countdownUnits(); track unit.label) {
                <div class="cu-tile" #tile>
                  <span class="cu-num">{{ unit.value }}</span>
                  <span class="cu-label">{{ unit.label }}</span>
                </div>
                @if (!$last) { <span class="cu-sep">·</span> }
              }
            </div>
          }

          <!-- CTA buttons -->
          <div class="hero-cta" #ctaEl>
            <a href="#story" class="cta-primary">Our Story</a>
            <a href="#schedule" class="cta-outline">View Schedule</a>
          </div>

        </div>

        <!-- Social links or website url -->
        @if (settings.websiteUrl) {
          <p class="hero-url" #urlEl>{{ settings.websiteUrl }}</p>
        }
      </div>

      <!-- Scroll indicator — vertically centered on the seam -->
      <button class="hero-scroll" #scrollEl (click)="scrollDown()" aria-label="Scroll to content">
        <span class="scroll-line"></span>
        <span class="scroll-label">Scroll</span>
      </button>

      <!-- Floating petals -->
      @for (p of petals; track p.id) {
        <span
          class="hero-petal"
          [class.hero-petal--dark]="!p.white"
          [style.left.%]="p.x"
          [style.top.%]="p.y"
          [style.width.px]="p.w"
          [style.height.px]="p.h"
          aria-hidden="true"
        >
          <svg viewBox="0 0 8 14" fill="currentColor">
            <path d="M4 1 C7 3 7 11 4 13 C1 11 1 3 4 1Z"/>
          </svg>
        </span>
      }

    </section>
  `,
  styles: [`
    /* ── Shell ── */
    .hero {
      position: relative;
      min-height: 100svh;
      display: grid;
      grid-template-columns: 52fr 48fr;
      overflow: hidden;
    }

    /* ── Photo panel ── */
    .hero-photo {
      position: relative;
      overflow: hidden;
    }

    .photo-bg {
      position: absolute; inset: -6%;
      /* Gradient always visible; photo layers on top when set */
      background-image: linear-gradient(155deg, #1e3820 0%, #2C4A2E 30%, #4A7C59 60%, #8baf8c 82%, #c5d5b8 100%);
      background-size: cover;
      background-position: center 20%;
      transform-origin: center;
    }

    .photo-stroke {
      position: absolute; bottom: 0; left: 0; right: 0;
      width: 100%; height: 200px;
      pointer-events: none;
    }

    .photo-fade {
      position: absolute; right: 0; top: 0; bottom: 0; width: 160px;
      background: linear-gradient(to right, transparent, var(--lc-bg, #F5F2ED));
      pointer-events: none;
    }

    /* ── Content panel ── */
    .hero-panel {
      position: relative;
      background: var(--lc-bg, #F5F2ED);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 56px 80px 32px;
      overflow: hidden;
    }

    /* ── Decorative elements ── */
    .deco-leaf {
      position: absolute;
      top: -10px; right: -10px;
      width: 160px; height: 180px;
      pointer-events: none;
      opacity: 0;
    }

    .deco-floral {
      position: absolute;
      bottom: 60px; left: 20px;
      width: 110px; height: 110px;
      pointer-events: none;
      opacity: 0;
    }

    /* ── Content ── */
    .hero-content {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    /* Eyebrow */
    .hero-eyebrow {
      display: flex; align-items: center; gap: 12px;
      justify-content: center;
      font-size: 11px; letter-spacing: .22em;
      text-transform: uppercase; font-weight: 500;
      color: var(--lc-green, #2C4A2E);
      margin: 0 0 16px;
      opacity: 0;
    }

    .eyebrow-rule {
      flex: 1; max-width: 48px; height: 1px;
      background: linear-gradient(to right, transparent, rgba(44,74,46,.35));
    }
    .eyebrow-rule:last-child {
      background: linear-gradient(to left, transparent, rgba(44,74,46,.35));
    }

    /* Script couple names */
    .hero-names {
      font-family: var(--font-script, 'Dancing Script', cursive);
      font-size: clamp(48px, 7.5vw, 92px);
      font-weight: 600;
      color: var(--lc-text, #1C1C1C);
      line-height: 1.05;
      margin: 0 0 10px;
      opacity: 0;
    }

    /* Date */
    .hero-date {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: clamp(15px, 1.8vw, 18px);
      color: var(--lc-green, #2C4A2E);
      letter-spacing: .04em;
      margin: 0 0 6px;
      opacity: 0;
    }

    /* Venue */
    .hero-venue {
      font-size: 11.5px; letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--lc-muted, #6B6B6B);
      margin: 0 0 28px;
      opacity: 0;
    }

    /* Ornament */
    .hero-ornament {
      display: flex; align-items: center; gap: 12px;
      justify-content: center;
      margin-bottom: 28px;
      opacity: 0;
    }

    .orn-line {
      flex: 1; max-width: 60px; height: 1px;
      background: var(--lc-border, rgba(44,74,46,.13));
    }

    .orn-gem {
      font-size: 12px; color: var(--lc-gold, #C9A86C);
    }

    /* ── Countdown ── */
    .hero-countdown {
      display: flex; align-items: center;
      justify-content: center; gap: 10px;
      margin-bottom: 32px;
      opacity: 0;
    }

    .cu-tile {
      background: var(--lc-surface, #fff);
      border: 1px solid var(--lc-border, rgba(44,74,46,.13));
      border-radius: var(--radius-md);
      padding: 12px 16px 10px;
      min-width: 64px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(44,74,46,.06), 0 8px 24px rgba(44,74,46,.04);
    }

    .cu-num {
      display: block;
      font-family: var(--font-serif);
      font-size: clamp(22px, 3vw, 30px);
      font-weight: 600;
      color: var(--lc-green, #2C4A2E);
      line-height: 1;
    }

    .cu-label {
      display: block;
      font-size: 9px; letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--lc-muted, #6B6B6B);
      margin-top: 4px;
    }

    .cu-sep {
      font-size: 22px; color: var(--lc-gold, #C9A86C);
      font-weight: 300; line-height: 1;
      margin-top: -8px;
    }

    /* ── CTA buttons ── */
    .hero-cta {
      display: flex; gap: 12px; justify-content: center;
      flex-wrap: wrap;
      opacity: 0;
    }

    .cta-primary {
      display: inline-block;
      padding: 13px 28px;
      background: var(--lc-green, #2C4A2E);
      color: white;
      font-size: 12px; letter-spacing: .12em;
      text-transform: uppercase; font-weight: 500;
      border-radius: var(--radius-full);
      transition: background 250ms var(--ease-smooth), transform 200ms;
    }

    .cta-primary:hover {
      background: var(--lc-green-mid, #4A7C59);
      transform: translateY(-2px);
    }

    .cta-outline {
      display: inline-block;
      padding: 12px 28px;
      background: transparent;
      color: var(--lc-green, #2C4A2E);
      border: 1.5px solid var(--lc-green, #2C4A2E);
      font-size: 12px; letter-spacing: .12em;
      text-transform: uppercase; font-weight: 500;
      border-radius: var(--radius-full);
      transition: background 250ms var(--ease-smooth), color 250ms, transform 200ms;
    }

    .cta-outline:hover {
      background: var(--lc-green-soft, rgba(44,74,46,.07));
      transform: translateY(-2px);
    }

    /* ── Website url ── */
    .hero-url {
      position: absolute; bottom: 32px;
      font-size: 11px; letter-spacing: .1em;
      color: var(--lc-muted, #6B6B6B);
      opacity: 0;
    }

    /* ── Scroll indicator ── */
    .hero-scroll {
      position: absolute;
      bottom: 32px; left: 50%;
      transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      background: none; border: none; cursor: pointer;
      color: var(--lc-muted, #6B6B6B);
      opacity: 0;
      z-index: 2;
    }

    .scroll-line {
      width: 1px; height: 36px;
      background: linear-gradient(to bottom, transparent, var(--lc-green, #2C4A2E));
      animation: scroll-pulse 1.8s ease-in-out infinite;
    }

    .scroll-label {
      font-size: 9px; letter-spacing: .18em;
      text-transform: uppercase;
    }

    @keyframes scroll-pulse {
      0%, 100% { opacity: 0.4; transform: scaleY(0.7) translateY(-4px); }
      50%       { opacity: 1;   transform: scaleY(1)   translateY(0); }
    }

    /* ── Floating petals ── */
    .hero-petal {
      position: absolute;
      pointer-events: none;
      opacity: 0;
      will-change: transform;
      z-index: 2;
      display: block;
      color: rgba(255,255,255,0.6);
    }
    .hero-petal--dark { color: rgba(44,74,46,0.45); }
    .hero-petal svg { width: 100%; height: 100%; display: block; }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .hero {
        grid-template-columns: 1fr;
        grid-template-rows: 45svh 1fr;
        min-height: 100svh;
      }

      .photo-fade {
        right: auto; left: 0; top: auto; bottom: 0; width: 100%; height: 80px;
        background: linear-gradient(to bottom, transparent, var(--lc-bg, #F5F2ED));
      }

      .photo-stroke { height: 120px; }

      .hero-panel {
        padding: 40px 24px 80px;
        justify-content: flex-start;
      }

      .hero-names { font-size: clamp(44px, 12vw, 64px); }

      .cu-tile { min-width: 52px; padding: 10px 10px 8px; }
      .cu-num  { font-size: 22px; }

      .deco-leaf   { width: 110px; height: 120px; }
      .deco-floral { display: none; }

      .hero-scroll { display: none; }
    }

    @media (max-width: 480px) {
      .hero-cta { flex-direction: column; align-items: center; }
      .cta-primary, .cta-outline { width: 100%; max-width: 220px; text-align: center; }
    }
  `],
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) settings!: WeddingSettings;

  @ViewChild('heroEl')    heroEl!:    ElementRef<HTMLElement>;
  @ViewChild('photoEl')   photoEl!:   ElementRef<HTMLElement>;
  @ViewChild('panelEl')   panelEl!:   ElementRef<HTMLElement>;
  @ViewChild('contentEl') contentEl!: ElementRef<HTMLElement>;
  @ViewChildren('tile')   tileEls!:   QueryList<ElementRef<HTMLElement>>;

  readonly days    = signal(0);
  readonly hours   = signal(0);
  readonly minutes = signal(0);
  readonly seconds = signal(0);

  readonly petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  readonly petals = PETALS;

  get photoBgStyle(): object {
    const url = this.settings.heroPhotoUrl;
    if (!url) return {};
    const gradient = 'linear-gradient(155deg, #1e3820 0%, #2C4A2E 30%, #4A7C59 60%, #8baf8c 82%, #c5d5b8 100%)';
    return { 'background-image': `url('${url}'), ${gradient}` };
  }

  readonly countdownUnits = computed(() => [
    { value: String(this.days()).padStart(2, '0'),    label: 'Days' },
    { value: String(this.hours()).padStart(2, '0'),   label: 'Hours' },
    { value: String(this.minutes()).padStart(2, '0'), label: 'Mins' },
    { value: String(this.seconds()).padStart(2, '0'), label: 'Secs' },
  ]);

  private timer?: ReturnType<typeof setInterval>;
  private ctx?: gsap.Context;

  scrollDown() {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {

      if (reduced) {
        gsap.set(['.hero-eyebrow', '.hero-names', '.hero-date', '.hero-venue',
          '.hero-ornament', '.hero-countdown', '.hero-cta', '.hero-scroll',
          '.hero-url', '.deco-leaf', '.deco-floral', '.photo-bg'],
          { opacity: 1, y: 0, scale: 1, rotate: 0 });
        return;
      }

      // ── Photo: scale in from slightly zoomed ──
      gsap.fromTo('.photo-bg',
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out' }
      );

      // ── Decorative elements ──
      gsap.to('.deco-leaf', {
        opacity: 1, rotate: 0,
        duration: 1.2, ease: 'power3.out', delay: 0.5,
      });
      gsap.set('.deco-leaf', { opacity: 0, rotate: -12 });

      gsap.to('.deco-floral', {
        opacity: 1, scale: 1,
        duration: 1.0, ease: 'back.out(1.6)', delay: 0.7,
      });
      gsap.set('.deco-floral', { opacity: 0, scale: 0.6 });

      // ── Content cascade ──
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo('.hero-eyebrow',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      )
      .fromTo('.hero-names',
        { opacity: 0, y: 32, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'back.out(1.4)' },
        '-=0.4'
      )
      .fromTo('.hero-date',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-venue',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.hero-ornament',
        { opacity: 0, scaleX: 0.5 },
        { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );

      // Countdown tiles stagger with spring
      tl.fromTo('.cu-tile',
        { opacity: 0, y: 20, scale: 0.85 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          stagger: { each: 0.09, ease: 'power2.out' },
          ease: 'back.out(1.7)',
        },
        '-=0.3'
      );

      tl.fromTo('.hero-cta',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(['.hero-scroll', '.hero-url'],
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        '-=0.2'
      );

      // ── Scroll parallax: photo moves slower than viewport ──
      gsap.to('.photo-bg', {
        yPercent: 18, scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1.8 },
      });

      // Gentle floating on decorative elements
      gsap.to('.deco-leaf', {
        y: -12, rotate: 4,
        duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      gsap.to('.deco-floral', {
        y: 10, rotate: -6,
        duration: 5.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });

      // ── Floating petals ──
      el.querySelectorAll<HTMLElement>('.hero-petal').forEach((petal, i) => {
        const p = PETALS[i];
        if (!p) return;
        gsap.set(petal, { rotation: p.rot, transformOrigin: '50% 60%' });
        // Fade in staggered
        gsap.to(petal, {
          opacity: p.opacity,
          duration: 1.4,
          delay: 1.0 + i * 0.15,
          ease: 'power2.out',
        });
        // Continuous gentle float
        gsap.to(petal, {
          y: -p.floatY,
          x: i % 2 === 0 ? 7 : -7,
          rotation: p.rot + (i % 2 === 0 ? 18 : -18),
          duration: p.floatDur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.28,
        });
      });

    }, el);
  }
}
