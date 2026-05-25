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
import { DatePipe } from '@angular/common';
import { WeddingEvent } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-schedule',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section id="schedule" class="schedule" #sectionEl>
      <div class="schedule-inner">

        <!-- Header -->
        <div class="schedule-header" #headerEl>
          <p class="schedule-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Save the Date</span>
            <span class="eyebrow-rule"></span>
          </p>
          <h2 class="schedule-title">The Day</h2>
          <p class="schedule-sub">Our celebration, moment by moment</p>
        </div>

        <!-- Timeline -->
        @if (events && events.length > 0) {
          <div class="timeline-wrap">
            <div class="timeline-track" #trackEl></div>

            @for (e of sorted(); track e.id; let i = $index) {
              <div class="timeline-row" #row>
                <!-- Time -->
                <div class="row-time">
                  <span class="time-val">{{ e.startUtc.toDate() | date: 'h:mm' }}</span>
                  <span class="time-period">{{ e.startUtc.toDate() | date: 'a' }}</span>
                </div>

                <!-- Connector node -->
                <div class="row-node">
                  <div class="node-ring"></div>
                  <div class="node-dot">
                    <span class="node-icon">{{ icon(e.name) }}</span>
                  </div>
                </div>

                <!-- Event card -->
                <div class="row-card">
                  <div class="card-number">{{ formatNum(i + 1) }}</div>
                  <h3 class="card-title">{{ e.name }}</h3>
                  <p class="card-venue">{{ e.venue }}</p>
                  @if (e.address) {
                    <p class="card-address">{{ e.address }}</p>
                  }
                  @if (e.dressCode) {
                    <span class="card-badge">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1"/>
                        <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                      </svg>
                      {{ e.dressCode }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="schedule-empty">Schedule details coming soon.</p>
        }

      </div>
    </section>
  `,
  styles: [
    `
      .schedule {
        padding: 120px 0 140px;
        background: var(--color-pearl);
        position: relative;
        overflow: hidden;
      }

      .schedule::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(to top, var(--color-bg), transparent);
        pointer-events: none;
      }

      .schedule-inner {
        max-width: 860px;
        margin: 0 auto;
        padding: 0 24px;
      }

      /* ── Header ── */
      .schedule-header {
        text-align: center;
        margin-bottom: 80px;
        opacity: 0;
        transform: translateY(30px);
      }

      .schedule-eyebrow {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        font-size: 10px;
        letter-spacing: 0.34em;
        text-transform: uppercase;
        color: var(--color-gold);
        margin: 0 0 18px;
      }

      .eyebrow-rule {
        display: block;
        width: 36px;
        height: 1px;
        background: currentColor;
        opacity: 0.55;
      }

      .schedule-title {
        font-family: var(--font-serif);
        font-size: clamp(42px, 7vw, 72px);
        font-weight: 700;
        color: var(--color-fg);
        letter-spacing: -0.02em;
        line-height: 1;
        margin-bottom: 12px;
      }

      .schedule-sub {
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 17px;
        color: var(--color-fg-soft);
        margin: 0;
      }

      /* ── Timeline ── */
      .timeline-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      /* Animated vertical track line */
      .timeline-track {
        position: absolute;
        left: 118px;
        top: 28px;
        bottom: 28px;
        width: 1px;
        background: linear-gradient(
          to bottom,
          transparent,
          rgba(201, 168, 108, 0.3) 10%,
          rgba(201, 168, 108, 0.3) 90%,
          transparent
        );
        transform-origin: top;
        transform: scaleY(0);
      }

      /* ── Row ── */
      .timeline-row {
        display: grid;
        grid-template-columns: 90px 56px 1fr;
        gap: 0 24px;
        align-items: center;
        padding: 20px 0;
        opacity: 0;
        transform: translateX(-24px);
        position: relative;
      }

      /* ── Time ── */
      .row-time {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .time-val {
        font-family: var(--font-serif);
        font-size: 26px;
        font-weight: 700;
        color: var(--color-fg);
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      .time-period {
        font-size: 10px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-fg-soft);
        margin-top: 3px;
      }

      /* ── Node ── */
      .row-node {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }

      .node-ring {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 1px solid rgba(201, 168, 108, 0.22);
        animation: ring-pulse 3s ease-in-out infinite;
      }

      @keyframes ring-pulse {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50%       { opacity: 0.9; transform: scale(1.15); }
      }

      .node-dot {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-fg);
        border: 2px solid var(--color-gold);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 6px rgba(201, 168, 108, 0.08),
                    0 4px 16px rgba(25, 37, 25, 0.25);
        transition: transform 250ms var(--ease-bounce), box-shadow 250ms;
      }

      .timeline-row:hover .node-dot {
        transform: scale(1.12);
        box-shadow: 0 0 0 8px rgba(201, 168, 108, 0.12),
                    0 6px 20px rgba(25, 37, 25, 0.3);
      }

      .node-icon { font-size: 16px; line-height: 1; }

      /* ── Card ── */
      .row-card {
        background: white;
        border-radius: var(--radius-xl);
        padding: 24px 28px;
        box-shadow: var(--shadow-card);
        border: 1px solid rgba(25, 37, 25, 0.05);
        transition: transform 300ms var(--ease-smooth), box-shadow 300ms;
        position: relative;
        overflow: hidden;
      }

      .row-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(to bottom, var(--color-gold), var(--color-champagne));
        border-radius: 3px 0 0 3px;
      }

      .timeline-row:hover .row-card {
        transform: translateY(-3px) translateX(3px);
        box-shadow: var(--shadow-lift);
      }

      .card-number {
        font-size: 10px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--color-gold);
        margin-bottom: 6px;
      }

      .card-title {
        font-family: var(--font-serif);
        font-size: 22px;
        font-weight: 700;
        color: var(--color-fg);
        margin-bottom: 4px;
      }

      .card-venue {
        font-size: 14px;
        color: var(--color-fg-soft);
        margin: 0 0 2px;
      }

      .card-address {
        font-size: 12px;
        color: var(--color-fg-soft);
        opacity: 0.7;
        margin: 0 0 8px;
      }

      .card-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        background: rgba(201, 168, 108, 0.10);
        color: var(--color-amber);
        font-size: 11px;
        letter-spacing: 0.05em;
        margin-top: 6px;
      }

      .schedule-empty {
        text-align: center;
        color: var(--color-fg-soft);
        font-style: italic;
      }

      /* ── Responsive ── */
      @media (max-width: 640px) {
        .timeline-row {
          grid-template-columns: 60px 40px 1fr;
          gap: 0 12px;
        }
        .timeline-track { left: 80px; }
        .time-val { font-size: 18px; }
        .node-dot { width: 32px; height: 32px; }
        .node-icon { font-size: 13px; }
        .row-card { padding: 18px 20px; }
      }
    `,
  ],
})
export class ScheduleComponent implements AfterViewInit, OnDestroy {
  @Input() events: WeddingEvent[] = [];

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChild('headerEl')  headerEl!:  ElementRef<HTMLElement>;
  @ViewChild('trackEl')   trackEl!:   ElementRef<HTMLElement>;
  @ViewChildren('row')    rowEls!:    QueryList<ElementRef<HTMLElement>>;

  private ctx?: gsap.Context;

  sorted(): WeddingEvent[] {
    return [...this.events].sort((a, b) => a.order - b.order);
  }

  formatNum(n: number): string {
    return `Event ${String(n).padStart(2, '0')}`;
  }

  icon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('ceremony'))           return '💍';
    if (n.includes('reception') || n.includes('dinner')) return '🥂';
    if (n.includes('cocktail'))           return '🍸';
    if (n.includes('brunch'))             return '🥞';
    if (n.includes('photo'))              return '📸';
    return '✦';
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
      // Header reveal
      ScrollTrigger.create({
        trigger: '.schedule-header',
        start: 'top 82%',
        onEnter: () => {
          gsap.to('.schedule-header', {
            opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
          });
        },
        once: true,
      });

      // Timeline track draw (only when events exist)
      if (this.events && this.events.length > 0) {
        gsap.to('.timeline-track', {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.timeline-wrap',
            start: 'top 65%',
            end: 'bottom 50%',
            scrub: 1,
          },
        });
      }

      // Row stagger reveal
      this.rowEls.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row.nativeElement,
          start: 'top 82%',
          onEnter: () => {
            gsap.to(row.nativeElement, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power3.out',
              delay: i * 0.08,
            });
          },
          once: true,
        });
      });
    }, el);
  }
}
