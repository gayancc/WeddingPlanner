import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CoupleStory } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-story',
  standalone: true,
  template: `
    @if (entries && entries.length > 0) {
      <section id="story" class="story" #sectionEl>

        <!-- Atmospheric background -->
        <div class="story-bg" aria-hidden="true"></div>

        <div class="story-inner">
          <!-- Section header -->
          <div class="story-header" #headerEl>
            <p class="story-eyebrow">
              <span class="eyebrow-rule"></span>
              <span>Two Lives · One Story</span>
              <span class="eyebrow-rule"></span>
            </p>
            <h2 class="story-title">Our Story</h2>
          </div>

          <!-- Timeline entries -->
          <div class="story-timeline">
            @for (entry of sorted(); track entry.id; let i = $index) {
              <article class="story-entry" #entry [class.story-entry--right]="i % 2 !== 0">

                <!-- Chapter number -->
                <div class="entry-chapter">{{ formatNum(i + 1) }}</div>

                <!-- Image -->
                @if (entry.photoUrl) {
                  <div class="entry-image-wrap">
                    <div class="entry-image-frame">
                      <img
                        [src]="entry.photoUrl"
                        [alt]="entry.title"
                        loading="lazy"
                        class="entry-image"
                      />
                      <div class="entry-image-overlay"></div>
                    </div>
                  </div>
                } @else {
                  <div class="entry-image-wrap entry-image-wrap--empty">
                    <div class="entry-image-frame entry-image-frame--empty">
                      <span class="entry-placeholder-gem">✦</span>
                    </div>
                  </div>
                }

                <!-- Text -->
                <div class="entry-body">
                  <time class="entry-date">{{ entry.date }}</time>
                  <h3 class="entry-title">{{ entry.title }}</h3>
                  <p class="entry-desc">{{ entry.description }}</p>
                </div>

                <!-- Connector dot -->
                <div class="entry-dot" aria-hidden="true">
                  <div class="dot-inner"></div>
                </div>

              </article>
            }

            <!-- Timeline vertical line -->
            <div class="timeline-line" #timelineLine aria-hidden="true"></div>
          </div>
        </div>

      </section>
    }
  `,
  styles: [
    `
      .story {
        position: relative;
        padding: 120px 0 140px;
        overflow: hidden;
      }

      /* ── Atmospheric dark background ── */
      .story-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          var(--color-bg) 0%,
          #1e2b1e 15%,
          #1a2618 80%,
          #1e2b1e 92%,
          var(--color-bg) 100%
        );
      }

      .story-bg::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse 80% 60% at 50% 50%,
          rgba(201, 168, 108, 0.04) 0%,
          transparent 70%
        );
      }

      /* ── Inner wrapper ── */
      .story-inner {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      /* ── Header ── */
      .story-header {
        text-align: center;
        margin-bottom: 96px;
        opacity: 0;
        transform: translateY(30px);
      }

      .story-eyebrow {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        font-size: 10px;
        letter-spacing: 0.34em;
        text-transform: uppercase;
        color: var(--color-gold-dim);
        margin: 0 0 20px;
      }

      .eyebrow-rule {
        display: block;
        width: 40px;
        height: 1px;
        background: currentColor;
        opacity: 0.6;
      }

      .story-title {
        font-family: var(--font-serif);
        font-size: clamp(44px, 8vw, 80px);
        font-weight: 700;
        color: white;
        letter-spacing: -0.02em;
        line-height: 1;
      }

      /* ── Timeline container ── */
      .story-timeline {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 80px;
      }

      /* Vertical connector line */
      .timeline-line {
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(201, 168, 108, 0.25) 10%,
          rgba(201, 168, 108, 0.35) 50%,
          rgba(201, 168, 108, 0.25) 90%,
          transparent 100%
        );
        transform: translateX(-50%);
        transform-origin: top;
        scaleY: 0;
      }

      /* ── Entry ── */
      .story-entry {
        display: grid;
        grid-template-columns: 1fr 80px 1fr;
        grid-template-rows: auto;
        align-items: center;
        gap: 0 32px;
        position: relative;
        opacity: 0;
        transform: translateY(50px);
      }

      /* Image: left, text: right */
      .entry-image-wrap { grid-column: 1; grid-row: 1; }
      .entry-body       { grid-column: 3; grid-row: 1; }
      .entry-dot        { grid-column: 2; grid-row: 1; justify-self: center; }
      .entry-chapter    { grid-column: 1; grid-row: 2; }

      /* Flipped entry: image right, text left */
      .story-entry--right .entry-image-wrap { grid-column: 3; }
      .story-entry--right .entry-body       { grid-column: 1; text-align: right; }
      .story-entry--right .entry-chapter    { grid-column: 3; text-align: left; }

      /* ── Chapter number ── */
      .entry-chapter {
        font-family: var(--font-serif);
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--color-gold-dim);
        margin-top: 14px;
        padding: 0 12px;
      }

      .story-entry--right .entry-chapter { text-align: left; }

      /* ── Image frame ── */
      .entry-image-frame {
        position: relative;
        border-radius: var(--radius-xl);
        overflow: hidden;
        aspect-ratio: 4 / 3;
        box-shadow: var(--shadow-dark);
        will-change: transform;
      }

      .entry-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 600ms var(--ease-smooth);
      }

      .entry-image-frame:hover .entry-image { transform: scale(1.06); }

      .entry-image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(16, 12, 8, 0.35) 0%,
          transparent 50%
        );
      }

      /* Empty image placeholder */
      .entry-image-frame--empty {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(201, 168, 108, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 240px;
      }

      .entry-placeholder-gem {
        font-size: 32px;
        color: var(--color-gold-dim);
      }

      /* ── Connector dot ── */
      .entry-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-fg);
        border: 2px solid rgba(201, 168, 108, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }

      .entry-dot::before {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: rgba(201, 168, 108, 0.08);
        animation: dot-pulse 2.5s ease-in-out infinite;
      }

      @keyframes dot-pulse {
        0%, 100% { opacity: 0; transform: scale(1); }
        50%       { opacity: 1; transform: scale(1.4); }
      }

      .dot-inner {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--color-gold);
      }

      /* ── Text body ── */
      .entry-body { padding: 8px 0; }

      .entry-date {
        display: block;
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 13px;
        color: var(--color-gold);
        margin-bottom: 10px;
        letter-spacing: 0.04em;
      }

      .entry-title {
        font-family: var(--font-serif);
        font-size: clamp(22px, 3.5vw, 30px);
        font-weight: 700;
        color: white;
        margin-bottom: 12px;
        line-height: 1.2;
      }

      .entry-desc {
        font-size: 15px;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.60);
        margin: 0;
      }

      /* ── Responsive ── */
      @media (max-width: 860px) {
        .story-timeline { gap: 60px; }

        .story-entry,
        .story-entry--right {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto auto;
          gap: 20px 0;
          text-align: left !important;
        }

        .story-entry .entry-image-wrap,
        .story-entry--right .entry-image-wrap { grid-column: 1; grid-row: 1; }

        .story-entry .entry-body,
        .story-entry--right .entry-body {
          grid-column: 1;
          grid-row: 2;
          text-align: left !important;
        }

        .story-entry .entry-dot,
        .story-entry--right .entry-dot { display: none; }

        .story-entry .entry-chapter,
        .story-entry--right .entry-chapter {
          grid-column: 1;
          grid-row: 3;
          padding: 0;
        }

        .timeline-line { display: none; }
      }
    `,
  ],
})
export class StoryComponent implements AfterViewInit, OnDestroy {
  @Input() entries: CoupleStory[] = [];

  @ViewChild('sectionEl')    sectionEl!:    ElementRef<HTMLElement>;
  @ViewChild('timelineLine') timelineLine!: ElementRef<HTMLElement>;
  @ViewChild('headerEl')     headerEl!:     ElementRef<HTMLElement>;
  @ViewChildren('entry')     entryEls!:     QueryList<ElementRef<HTMLElement>>;

  private ctx?: gsap.Context;

  sorted(): CoupleStory[] {
    return [...this.entries].sort((a, b) => a.order - b.order);
  }

  formatNum(n: number): string {
    return `Chapter ${String(n).padStart(2, '0')}`;
  }

  ngAfterViewInit() {
    initGsap();
    this.initAnimations();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  private initAnimations() {
    const el = this.sectionEl.nativeElement;

    this.ctx = gsap.context(() => {
      // Section header reveal
      ScrollTrigger.create({
        trigger: '.story-header',
        start: 'top 82%',
        onEnter: () => {
          gsap.to('.story-header', {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });

      // Timeline line draw
      gsap.fromTo('.timeline-line',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.story-timeline',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1.5,
          },
        }
      );

      // Entry reveals — alternating from left/right
      this.entryEls.forEach((entry, i) => {
        const isRight = i % 2 !== 0;
        const xFrom = isRight ? 60 : -60;

        ScrollTrigger.create({
          trigger: entry.nativeElement,
          start: 'top 80%',
          onEnter: () => {
            gsap.to(entry.nativeElement, {
              opacity: 1,
              y: 0,
              duration: 1.0,
              ease: 'power3.out',
            });
            // Image parallax entrance
            const img = entry.nativeElement.querySelector('.entry-image-frame');
            if (img) {
              gsap.from(img, {
                x: xFrom * 0.4,
                duration: 1.2,
                ease: 'power3.out',
              });
            }
          },
          once: true,
        });

        // Image parallax on scroll
        const img = entry.nativeElement.querySelector('.entry-image');
        if (img) {
          gsap.to(img, {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: entry.nativeElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        }
      });
    }, el);
  }
}
