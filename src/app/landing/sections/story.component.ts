import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
  computed,
} from '@angular/core';
import { CoupleStory } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-story',
  standalone: true,
  template: `
    @if (entries && entries.length > 0) {
      <section id="story" class="story" #sectionEl>

        <!-- Section header — scrolls normally before stage pins -->
        <div class="story-header" #headerEl>
          <p class="story-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Two Lives · One Story</span>
            <span class="eyebrow-rule"></span>
          </p>
          <h2 class="story-title">Our Story</h2>
        </div>

        <!-- ─── Pinned stage ─────────────────────────────── -->
        <div class="story-stage" #stageEl>

          <!-- Atmospheric dark gradient -->
          <div class="stage-atmosphere" aria-hidden="true"></div>

          @if (sorted().length > 1) {
            <!-- Progress dots — bottom center -->
            <div class="stage-dots" aria-hidden="true">
              @for (e of sorted(); track e.id; let i = $index) {
                <div class="stage-dot" [class.stage-dot--active]="currentIdx() === i"></div>
              }
            </div>
          }

          <!-- Story cards — all absolutely positioned in the stage -->
          @for (entry of sorted(); track entry.id; let i = $index) {
            <div class="stage-card" #card>

              <!-- Large decorative chapter number -->
              <div class="card-deco" aria-hidden="true">{{ decoNum(i) }}</div>

              <!-- Left: Visual -->
              <div class="card-visual">
                @if (entry.photoUrl) {
                  <div class="card-img-frame">
                    <img
                      [src]="entry.photoUrl"
                      [alt]="entry.title"
                      class="card-img"
                      loading="lazy"
                    />
                    <div class="card-img-overlay"></div>
                  </div>
                } @else {
                  <div class="card-img-frame card-img-frame--empty">
                    <span class="empty-gem">✦</span>
                  </div>
                }
              </div>

              <!-- Right: Text -->
              <div class="card-body">
                <div class="cb-chapter">{{ chapterLabel(i) }}</div>
                <time class="cb-date">{{ entry.date }}</time>
                <h3 class="cb-title">{{ entry.title }}</h3>
                <p class="cb-desc">{{ entry.description }}</p>
              </div>

            </div>
          }
        </div>
        <!-- ─── End pinned stage ──────────────────────────── -->

      </section>
    }
  `,
  styles: [`
    .story {
      position: relative;
      background: linear-gradient(180deg, #16120E 0%, #192519 100%);
    }

    /* ── Section header (scrolls normally) ── */
    .story-header {
      text-align: center;
      padding: 120px 24px 80px;
      opacity: 0;
      transform: translateY(30px);
    }

    .story-eyebrow {
      display: flex; align-items: center; justify-content: center;
      gap: 18px; font-size: 10px; letter-spacing: .34em;
      text-transform: uppercase; color: var(--color-gold-dim);
      margin: 0 0 20px;
    }

    .eyebrow-rule {
      display: block; width: 40px; height: 1px;
      background: currentColor; opacity: .6;
    }

    .story-title {
      font-family: var(--font-serif);
      font-size: clamp(44px, 8vw, 80px);
      font-weight: 700; color: white;
      letter-spacing: -0.02em; line-height: 1;
    }

    /* ── Pinned stage ── */
    .story-stage {
      height: 100svh;
      position: relative;
      overflow: hidden;
      background: #16120E;
    }

    .stage-atmosphere {
      position: absolute; inset: 0;
      background: radial-gradient(
        ellipse 80% 60% at 50% 50%,
        rgba(201,168,108,.04) 0%, transparent 70%
      );
      pointer-events: none;
    }

    /* ── Progress dots ── */
    .stage-dots {
      position: absolute;
      bottom: 32px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 8px;
      z-index: 20;
    }

    .stage-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(201,168,108,.3);
      transition: background 400ms, transform 400ms;
    }

    .stage-dot--active {
      background: var(--color-gold);
      transform: scale(1.4);
    }

    /* ── Cards ── */
    .stage-card {
      position: absolute; inset: 0;
      display: grid;
      grid-template-columns: 52% 48%;
      align-items: center;
      will-change: transform, opacity;
    }

    /* Large decorative chapter number behind content */
    .card-deco {
      position: absolute;
      font-family: var(--font-serif);
      font-size: clamp(140px, 22vw, 260px);
      font-weight: 700;
      color: rgba(201,168,108,.04);
      right: 3%;
      top: 50%;
      transform: translateY(-50%);
      line-height: 1;
      pointer-events: none;
      user-select: none;
      z-index: 0;
      letter-spacing: -0.04em;
    }

    /* ── Card visual (left) ── */
    .card-visual {
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    .card-img-frame {
      position: absolute; inset: 0;
      overflow: hidden;
    }

    .card-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 8s ease-out;
      transform: scale(1.05);
    }

    .stage-card:hover .card-img { transform: scale(1.0); }

    .card-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        to right,
        rgba(22,18,14,.1) 0%,
        rgba(22,18,14,.5) 100%
      );
    }

    .card-img-frame--empty {
      background: rgba(255,255,255,.02);
      border-right: 1px solid rgba(201,168,108,.08);
      display: flex; align-items: center; justify-content: center;
    }

    .empty-gem {
      font-size: 48px; color: rgba(201,168,108,.2);
    }

    /* ── Card body (right) ── */
    .card-body {
      position: relative;
      z-index: 1;
      padding: 60px 64px 60px 48px;
      display: flex; flex-direction: column; justify-content: center;
    }

    .cb-chapter {
      font-size: 10px; letter-spacing: .3em;
      text-transform: uppercase;
      color: var(--color-gold-dim);
      margin-bottom: 20px;
    }

    .cb-date {
      display: block;
      font-family: var(--font-serif); font-style: italic;
      font-size: clamp(14px, 1.6vw, 18px);
      color: var(--color-gold);
      margin-bottom: 14px; letter-spacing: .04em;
    }

    .cb-title {
      font-family: var(--font-serif);
      font-size: clamp(26px, 4vw, 44px);
      font-weight: 700; color: white;
      margin-bottom: 20px; line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .cb-desc {
      font-size: 15px; line-height: 1.85;
      color: rgba(255,255,255,.55);
      margin: 0;
      max-width: 440px;
    }

    /* ── Responsive ── */
    @media (max-width: 860px) {
      .stage-card {
        grid-template-columns: 1fr;
        grid-template-rows: 45% 55%;
      }

      .card-visual { height: 100%; grid-row: 1; }

      .card-body {
        padding: 32px 28px;
        grid-row: 2;
        overflow-y: auto;
      }

      .cb-title { font-size: clamp(22px, 5vw, 32px); }

      .card-deco { font-size: clamp(80px, 18vw, 120px); }
    }

    @media (max-width: 540px) {
      .story-header { padding: 80px 20px 60px; }
      .card-body { padding: 24px 20px; }
    }
  `],
})
export class StoryComponent implements AfterViewInit, OnDestroy {
  @Input() entries: CoupleStory[] = [];

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChild('headerEl')  headerEl!:  ElementRef<HTMLElement>;
  @ViewChild('stageEl')   stageEl!:   ElementRef<HTMLElement>;
  @ViewChildren('card')   cardEls!:   QueryList<ElementRef<HTMLElement>>;

  readonly currentIdx = signal(0);

  private ctx?: gsap.Context;

  sorted(): CoupleStory[] {
    return [...this.entries].sort((a, b) => a.order - b.order);
  }

  chapterLabel(i: number): string {
    return `Chapter ${String(i + 1).padStart(2, '0')}`;
  }

  decoNum(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  ngAfterViewInit() {
    initGsap();
    if (typeof window === 'undefined') return;
    this.initAnimations();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  private initAnimations() {
    const el = this.sectionEl.nativeElement;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {

      // ── Header reveal ──
      ScrollTrigger.create({
        trigger: this.headerEl.nativeElement,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(this.headerEl.nativeElement, {
            opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          });
        },
      });

      const sorted = this.sorted();
      const n = sorted.length;

      if (n === 0) return;

      if (n === 1 || prefersReduced) {
        // Single entry: just reveal it on scroll
        this.initSingleEntry();
        return;
      }

      this.initPinnedScene(n);

    }, el);
  }

  private initSingleEntry() {
    const cards = this.cardEls.toArray();
    if (cards.length === 0) return;

    const card = cards[0].nativeElement;
    gsap.set(card, { opacity: 0, x: 60 });

    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(card, { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out' });
      },
    });
  }

  private initPinnedScene(n: number) {
    const stage = this.stageEl.nativeElement;
    const cards = this.cardEls.toArray().map((c) => c.nativeElement);

    // Initial state: first card visible, rest off-screen right
    gsap.set(cards[0], { xPercent: 0, opacity: 1 });
    cards.slice(1).forEach((c) => gsap.set(c, { xPercent: 100, opacity: 0 }));

    // Total pinned scroll = (n-1) * viewport heights
    const scrollDistance = (n - 1) * window.innerHeight;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        pin: true,
        anticipatePin: 1,
        start: 'top top',
        end: `+=${scrollDistance}`,
        scrub: 0.9,
        onUpdate: (self) => {
          // Track which card should be "active" for progress dots
          const progress = self.progress;
          const newIdx = Math.min(Math.floor(progress * n + 0.1), n - 1);
          if (newIdx !== this.currentIdx()) {
            this.currentIdx.set(newIdx);
          }
        },
      },
    });

    // Build card transition sequence
    // Each transition slot = 1 "timeline unit"
    // Card i holds for ~70% of its slot, exits in the last ~35%
    // Overlap with incoming card by ~10%
    for (let i = 0; i < n - 1; i++) {
      const cur  = cards[i];
      const next = cards[i + 1];
      const base = i; // timeline position for this slot

      // Current card slides out to the left
      tl.to(cur, {
        xPercent: -108,
        opacity: 0,
        duration: 0.38,
        ease: 'power2.inOut',
      }, base + 0.62);

      // Next card slides in from the right (slight overlap)
      tl.fromTo(next,
        { xPercent: 108, opacity: 0 },
        { xPercent: 0,   opacity: 1, duration: 0.38, ease: 'power2.out' },
        base + 0.68
      );
    }
  }
}
