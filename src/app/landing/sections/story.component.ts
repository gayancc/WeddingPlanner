import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
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

        <!-- Section header -->
        <div class="story-header" #headerEl>
          <p class="story-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Two Lives · One Story</span>
            <span class="eyebrow-rule"></span>
          </p>
          <h2 class="story-title">Our Story</h2>
        </div>

        <!-- Vertical alternating timeline -->
        <div class="timeline" #timelineEl>
          <!-- Center line -->
          <div class="timeline-line" #lineEl aria-hidden="true"></div>

          @for (entry of sorted(); track entry.id; let i = $index) {
            <div class="timeline-entry"
                 [class.timeline-entry--right]="i % 2 !== 0"
                 #entry>

              <!-- Timeline dot -->
              <div class="entry-dot" aria-hidden="true">
                <div class="dot-inner"></div>
              </div>

              <!-- Card -->
              <div class="entry-card">
                @if (entry.photoUrl) {
                  <div class="card-photo">
                    <img [src]="entry.photoUrl" [alt]="entry.title" loading="lazy" />
                  </div>
                }
                <div class="card-body">
                  <span class="card-chapter">{{ chapterLabel(i) }}</span>
                  <time class="card-date">{{ entry.date }}</time>
                  <h3 class="card-title">{{ entry.title }}</h3>
                  <p class="card-desc">{{ entry.description }}</p>
                </div>
              </div>

            </div>
          }
        </div>

        <!-- Bottom ornament -->
        <div class="story-footer" aria-hidden="true">
          <span class="foot-rule"></span>
          <span class="foot-gem">✦</span>
          <span class="foot-rule"></span>
        </div>

      </section>
    }
  `,
  styles: [`
    /* ── Section shell ── */
    .story {
      background: var(--lc-bg, #F5F2ED);
      padding-bottom: 100px;
      position: relative; overflow: hidden;
    }

    /* ── Subtle tiled texture ── */
    .story::before {
      content: ''; position: absolute; inset: 0;
      background-image: radial-gradient(circle, rgba(44,74,46,.04) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }

    /* ── Header ── */
    .story-header {
      text-align: center;
      padding: 110px 24px 72px;
      opacity: 0;
    }

    .story-eyebrow {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; font-size: 10px; letter-spacing: .30em;
      text-transform: uppercase;
      color: var(--lc-green-mid, #4A7C59);
      margin: 0 0 18px;
    }

    .eyebrow-rule {
      display: block; width: 36px; height: 1px;
      background: rgba(44,74,46,.25);
    }

    .story-title {
      font-family: var(--font-serif);
      font-size: clamp(40px, 7vw, 70px);
      font-weight: 600;
      color: var(--lc-text, #1C1C1C);
      letter-spacing: -.02em; line-height: 1.1;
      margin: 0;
    }

    /* ── Timeline ── */
    .timeline {
      position: relative;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px 40px;
    }

    /* Vertical center line */
    .timeline-line {
      position: absolute;
      top: 0; bottom: 0; left: 50%;
      width: 1px;
      transform: translateX(-50%);
      background: linear-gradient(
        to bottom,
        transparent,
        rgba(44,74,46,.25) 8%,
        rgba(44,74,46,.20) 92%,
        transparent
      );
      transform-origin: top;
      transform: translateX(-50%) scaleY(0);
    }

    /* ── Entry ── */
    .timeline-entry {
      display: grid;
      grid-template-columns: 1fr 28px 1fr;
      align-items: start;
      gap: 0 20px;
      margin-bottom: 64px;
      position: relative;
    }

    /* Left entries: card in col 1, dot in col 2, empty col 3 */
    .timeline-entry .entry-dot { grid-column: 2; grid-row: 1; }
    .timeline-entry .entry-card { grid-column: 1; grid-row: 1; }

    /* Right entries: empty col 1, dot in col 2, card in col 3 */
    .timeline-entry--right .entry-card { grid-column: 3; }
    .timeline-entry--right .entry-dot  { grid-column: 2; }

    /* ── Dot ── */
    .entry-dot {
      display: flex; justify-content: center;
      padding-top: 24px;
    }

    .dot-inner {
      width: 14px; height: 14px;
      border-radius: 50%;
      background: var(--lc-surface, #fff);
      border: 2.5px solid var(--lc-green, #2C4A2E);
      box-shadow: 0 0 0 4px rgba(44,74,46,.08);
      flex-shrink: 0;
    }

    /* ── Card ── */
    .entry-card {
      background: var(--lc-surface, #fff);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow:
        0 2px 8px rgba(44,74,46,.06),
        0 8px 28px rgba(44,74,46,.06);
      border: 1px solid var(--lc-border, rgba(44,74,46,.10));
      opacity: 0;
      transition: box-shadow 300ms var(--ease-smooth), transform 300ms var(--ease-smooth);
    }

    .entry-card:hover {
      box-shadow:
        0 4px 16px rgba(44,74,46,.09),
        0 16px 40px rgba(44,74,46,.09);
      transform: translateY(-4px);
    }

    .card-photo {
      width: 100%; aspect-ratio: 16/9; overflow: hidden;
    }

    .card-photo img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 400ms var(--ease-smooth);
    }

    .entry-card:hover .card-photo img { transform: scale(1.04); }

    .card-body {
      padding: 20px 22px 22px;
    }

    .card-chapter {
      display: block;
      font-size: 9.5px; letter-spacing: .20em;
      text-transform: uppercase;
      color: var(--lc-green-mid, #4A7C59); font-weight: 500;
      margin-bottom: 4px;
    }

    .card-date {
      display: block;
      font-family: var(--font-serif); font-style: italic;
      font-size: 13px; color: var(--lc-muted, #6B6B6B);
      margin-bottom: 10px;
    }

    .card-title {
      font-family: var(--font-serif);
      font-size: clamp(18px, 2.5vw, 22px);
      font-weight: 600;
      color: var(--lc-text, #1C1C1C);
      margin: 0 0 10px; line-height: 1.3;
    }

    .card-desc {
      font-size: 14px; line-height: 1.65;
      color: var(--lc-muted, #6B6B6B);
      margin: 0;
    }

    /* ── Footer ornament ── */
    .story-footer {
      display: flex; align-items: center; justify-content: center;
      gap: 16px;
      padding-top: 20px;
      max-width: 280px; margin: 0 auto;
    }

    .foot-rule {
      flex: 1; height: 1px;
      background: linear-gradient(to right, transparent, rgba(44,74,46,.25));
    }
    .foot-rule:last-child {
      background: linear-gradient(to left, transparent, rgba(44,74,46,.25));
    }

    .foot-gem { color: var(--lc-gold, #C9A86C); font-size: 14px; }

    /* ── Responsive: single column on mobile ── */
    @media (max-width: 640px) {
      .story-header { padding: 80px 24px 56px; }

      .timeline { padding: 0 16px 20px; }

      .timeline-line { left: 20px; }

      .timeline-entry {
        grid-template-columns: 40px 1fr;
        gap: 0 12px;
        margin-bottom: 40px;
      }

      .timeline-entry .entry-dot      { grid-column: 1; }
      .timeline-entry .entry-card     { grid-column: 2; }
      .timeline-entry--right .entry-dot  { grid-column: 1; }
      .timeline-entry--right .entry-card { grid-column: 2; }
    }
  `],
})
export class StoryComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) entries!: CoupleStory[];

  @ViewChild('sectionEl')  sectionEl!:  ElementRef<HTMLElement>;
  @ViewChild('headerEl')   headerEl!:   ElementRef<HTMLElement>;
  @ViewChild('lineEl')     lineEl!:     ElementRef<HTMLElement>;
  @ViewChildren('entry')   entryEls!:   QueryList<ElementRef<HTMLElement>>;

  readonly sorted = computed(() =>
    [...(this.entries ?? [])].sort((a, b) => a.order - b.order)
  );

  chapterLabel(i: number): string {
    return `Chapter ${String(i + 1).padStart(2, '0')}`;
  }

  private ctx?: gsap.Context;

  ngAfterViewInit() {
    initGsap();
    this.initAnimations();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  private initAnimations() {
    const el = this.sectionEl.nativeElement;
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {

      if (reduced) {
        gsap.set(['.story-header', '.entry-card', '.timeline-line'], {
          opacity: 1, y: 0, x: 0, scaleY: 1,
        });
        return;
      }

      // ── Header reveal ──
      ScrollTrigger.create({
        trigger: this.headerEl.nativeElement,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to('.story-header', {
            opacity: 1, y: 0,
            duration: 0.9, ease: 'power3.out',
          });
        },
      });

      // ── Timeline line draws down ──
      gsap.to(this.lineEl.nativeElement, {
        scaleY: 1,
        duration: 1.6, ease: 'power3.inOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 70%',
          once: true,
        },
      });

      // ── Cards slide in from their side ──
      this.entryEls.forEach((entry, i) => {
        const isRight = i % 2 !== 0;
        const card = entry.nativeElement.querySelector('.entry-card');
        if (!card) return;

        gsap.fromTo(card,
          { opacity: 0, x: isRight ? 40 : -40, y: 20 },
          {
            opacity: 1, x: 0, y: 0,
            duration: 0.85,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: entry.nativeElement,
              start: 'top 82%',
              once: true,
            },
          }
        );

        // Dot scales in
        const dot = entry.nativeElement.querySelector('.dot-inner');
        if (dot) {
          gsap.fromTo(dot,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.5,
              ease: 'back.out(2.5)',
              scrollTrigger: {
                trigger: entry.nativeElement,
                start: 'top 80%',
                once: true,
              },
            }
          );
        }
      });

    }, el);
  }
}
