import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AccommodationItem } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-accommodation',
  standalone: true,
  template: `
    <section id="stay" class="acc" #sectionEl>
      <div class="acc-inner">

        <!-- Header -->
        <div class="acc-header" #headerEl>
          <p class="acc-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Rest & Relax</span>
            <span class="eyebrow-rule"></span>
          </p>
          <h2 class="acc-title">Where to Stay</h2>
          <p class="acc-sub">Our curated selection of nearby accommodations</p>
        </div>

        @if (items && items.length > 0) {
          <div class="acc-grid">
            @for (a of items; track a.name; let i = $index) {
              <article class="acc-card" #card>
                <div class="card-header">
                  <div class="card-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 10V18h14V10M1 10h18M10 2L1 10h18L10 2z"
                        stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="card-meta">
                    @if (a.distance) {
                      <span class="card-distance">{{ a.distance }}</span>
                    }
                  </div>
                </div>

                <h3 class="card-name">{{ a.name }}</h3>

                @if (a.address) {
                  <p class="card-addr">{{ a.address }}</p>
                }

                <div class="card-details">
                  @if (a.priceRange) {
                    <span class="card-price">{{ a.priceRange }}</span>
                  }
                  @if (a.phone) {
                    <a [href]="'tel:' + a.phone" class="card-phone">{{ a.phone }}</a>
                  }
                </div>

                @if (a.bookingUrl) {
                  <a class="card-cta" [href]="a.bookingUrl" target="_blank" rel="noopener">
                    <span>Book Now</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" stroke-width="1.3"
                        stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                }
              </article>
            }
          </div>
        } @else {
          <p class="acc-empty">Accommodation recommendations coming soon.</p>
        }

      </div>
    </section>
  `,
  styles: [
    `
      .acc {
        padding: 120px 0 140px;
        background: var(--color-pearl);
        position: relative;
        overflow: hidden;
      }

      .acc::before {
        content: '';
        position: absolute;
        top: -1px; left: 0; right: 0;
        height: 100px;
        background: linear-gradient(to bottom, var(--color-bg), transparent);
        pointer-events: none;
      }

      .acc-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
      }

      /* ── Header ── */
      .acc-header {
        text-align: center;
        margin-bottom: 64px;
        opacity: 0;
        transform: translateY(30px);
      }

      .acc-eyebrow {
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

      .acc-title {
        font-family: var(--font-serif);
        font-size: clamp(38px, 6vw, 64px);
        font-weight: 700;
        color: var(--color-fg);
        letter-spacing: -0.02em;
        margin-bottom: 12px;
      }

      .acc-sub {
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 16px;
        color: var(--color-fg-soft);
        margin: 0;
      }

      /* ── Grid ── */
      .acc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      /* ── Card ── */
      .acc-card {
        background: white;
        border-radius: var(--radius-xl);
        padding: 32px;
        box-shadow: var(--shadow-card);
        border: 1px solid rgba(25, 37, 25, 0.05);
        display: flex;
        flex-direction: column;
        gap: 0;
        transition: transform 350ms var(--ease-smooth), box-shadow 350ms;
        opacity: 0;
        transform: translateY(30px);
        position: relative;
        overflow: hidden;
      }

      .acc-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(to right, var(--color-gold), var(--color-champagne), transparent);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 400ms var(--ease-cinematic);
      }

      .acc-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-float);
      }

      .acc-card:hover::after { transform: scaleX(1); }

      /* Card header row */
      .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      .card-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(201, 168, 108, 0.08);
        border: 1px solid rgba(201, 168, 108, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gold);
      }

      .card-distance {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-gold);
        background: rgba(201, 168, 108, 0.08);
        padding: 5px 12px;
        border-radius: var(--radius-full);
      }

      .card-name {
        font-family: var(--font-serif);
        font-size: 22px;
        font-weight: 700;
        color: var(--color-fg);
        margin: 0 0 8px;
        line-height: 1.2;
      }

      .card-addr {
        font-size: 13px;
        color: var(--color-fg-soft);
        margin: 0 0 16px;
        line-height: 1.6;
      }

      .card-details {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 24px;
        flex: 1;
      }

      .card-price {
        font-size: 14px;
        color: var(--color-fg);
        font-weight: 500;
      }

      .card-phone {
        font-size: 13px;
        color: var(--color-fg-soft);
        transition: color 200ms;
      }

      .card-phone:hover { color: var(--color-gold); }

      .card-cta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 11px 22px;
        background: var(--color-fg);
        color: white;
        border-radius: var(--radius-full);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.04em;
        align-self: flex-start;
        transition: background 250ms, transform 200ms;
      }

      .card-cta:hover {
        background: var(--color-gold);
        color: var(--color-fg);
        transform: translateX(2px);
      }

      .acc-empty {
        text-align: center;
        color: var(--color-fg-soft);
        font-style: italic;
        font-size: 16px;
      }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        .acc-inner { padding: 0 20px; }
        .acc-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class AccommodationComponent implements AfterViewInit, OnDestroy {
  @Input() items: AccommodationItem[] = [];

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChild('headerEl')  headerEl!:  ElementRef<HTMLElement>;

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

    this.ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.acc-header',
        start: 'top 82%',
        onEnter: () => {
          gsap.to('.acc-header', {
            opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
          });
        },
        once: true,
      });

      ScrollTrigger.create({
        trigger: '.acc-grid',
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.acc-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    }, el);
  }
}
