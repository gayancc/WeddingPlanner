import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WeddingSettings } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-location',
  standalone: true,
  template: `
    <section id="location" class="location" #sectionEl>
      <div class="location-inner">

        <!-- Left: dark info panel -->
        <div class="location-info" #infoEl>
          <p class="info-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Where to Find Us</span>
          </p>
          <h2 class="info-title">The Venue</h2>
          <p class="info-name">{{ settings.venue }}</p>
          @if (settings.venueAddress) {
            <p class="info-address">{{ settings.venueAddress }}</p>
          }

          <div class="info-divider" aria-hidden="true">
            <span></span><span class="gem">✦</span><span></span>
          </div>

          <div class="info-details">
            <div class="info-detail">
              <div class="detail-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M9 5v4l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <div class="detail-label">Ceremony</div>
                <div class="detail-value">{{ settings.ceremonyTime || 'TBD' }}</div>
              </div>
            </div>
            <div class="info-detail">
              <div class="detail-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L3 6v10h12V6L9 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                  <rect x="6.5" y="10" width="5" height="6" rx="0.5" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </div>
              <div>
                <div class="detail-label">Reception</div>
                <div class="detail-value">{{ settings.receptionTime || 'TBD' }}</div>
              </div>
            </div>
            @if (settings.parkingInfo) {
              <div class="info-detail">
                <div class="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
                    <path d="M6 10V7h3a1.5 1.5 0 010 3H6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <div class="detail-label">Parking</div>
                  <div class="detail-value">{{ settings.parkingInfo }}</div>
                </div>
              </div>
            }
          </div>

          @if (settings.venueMapsUrl) {
            <a class="info-cta" [href]="settings.venueMapsUrl" target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.79 2 4 3.79 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
              </svg>
              <span>Get Directions</span>
            </a>
          }
        </div>

        <!-- Right: map -->
        <div class="location-map" #mapEl>
          @if (mapUrl()) {
            <iframe
              [src]="mapUrl()!"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
              title="Venue map"
              class="map-iframe"
            ></iframe>
          } @else {
            <div class="map-placeholder">
              <div class="map-placeholder-inner">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.35">
                  <circle cx="24" cy="22" r="12" stroke="currentColor" stroke-width="2"/>
                  <circle cx="24" cy="22" r="4" fill="currentColor"/>
                  <path d="M24 34v8M16 40h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>Map coming soon</p>
              </div>
            </div>
          }
        </div>

      </div>
    </section>
  `,
  styles: [
    `
      .location {
        padding: 0;
        overflow: hidden;
        background: var(--color-bg);
      }

      .location-inner {
        display: grid;
        grid-template-columns: 460px 1fr;
        min-height: 640px;
      }

      /* ── Info panel (dark) ── */
      .location-info {
        background: var(--color-fg);
        padding: 80px 56px 80px 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateX(-40px);
      }

      /* Atmospheric glow top-right */
      .location-info::before {
        content: '';
        position: absolute;
        top: -80px;
        right: -80px;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(201, 168, 108, 0.08) 0%, transparent 70%);
        pointer-events: none;
      }

      .info-eyebrow {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 10px;
        letter-spacing: 0.34em;
        text-transform: uppercase;
        color: var(--color-gold-dim);
        margin: 0 0 20px;
      }

      .eyebrow-rule {
        display: block;
        width: 28px;
        height: 1px;
        background: currentColor;
      }

      .info-title {
        font-family: var(--font-serif);
        font-size: clamp(36px, 5vw, 56px);
        font-weight: 700;
        color: white;
        letter-spacing: -0.02em;
        line-height: 1;
        margin-bottom: 20px;
      }

      .info-name {
        font-family: var(--font-serif);
        font-size: 20px;
        color: var(--color-gold-soft);
        margin: 0 0 8px;
      }

      .info-address {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0 0 28px;
        line-height: 1.6;
      }

      .info-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
      }

      .info-divider span:not(.gem) {
        flex: 1;
        height: 1px;
        background: rgba(201, 168, 108, 0.18);
      }

      .gem { color: var(--color-gold); font-size: 12px; }

      /* ── Details list ── */
      .info-details {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-bottom: 40px;
      }

      .info-detail {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }

      .detail-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(201, 168, 108, 0.10);
        border: 1px solid rgba(201, 168, 108, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gold);
        flex-shrink: 0;
      }

      .detail-label {
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-gold-dim);
        margin-bottom: 3px;
      }

      .detail-value {
        font-family: var(--font-serif);
        font-size: 16px;
        color: white;
      }

      /* ── CTA ── */
      .info-cta {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 13px 28px;
        border: 1px solid rgba(201, 168, 108, 0.45);
        color: var(--color-gold-soft);
        border-radius: var(--radius-full);
        font-size: 13px;
        letter-spacing: 0.08em;
        align-self: flex-start;
        transition: all 280ms var(--ease-smooth);
        position: relative;
        overflow: hidden;
      }

      .info-cta::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--color-gold);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 300ms var(--ease-cinematic);
        border-radius: inherit;
      }

      .info-cta svg, .info-cta span { position: relative; z-index: 1; }
      .info-cta:hover::before { transform: scaleX(1); }
      .info-cta:hover { color: var(--color-fg); border-color: var(--color-gold); }

      /* ── Map ── */
      .location-map {
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateX(40px);
      }

      .map-iframe {
        width: 100%;
        height: 100%;
        min-height: 500px;
        border: 0;
        display: block;
        filter: saturate(0.85) contrast(1.05);
        transition: filter 400ms;
      }

      .map-iframe:hover { filter: saturate(1) contrast(1); }

      .map-placeholder {
        width: 100%;
        height: 100%;
        min-height: 500px;
        background: linear-gradient(135deg, #e8e4de, #d4cfc8);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .map-placeholder-inner {
        text-align: center;
        color: var(--color-fg-soft);
      }

      .map-placeholder-inner p {
        margin: 12px 0 0;
        font-size: 14px;
        font-style: italic;
      }

      /* ── Responsive ── */
      @media (max-width: 960px) {
        .location-inner {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto;
          min-height: auto;
        }

        .location-info {
          padding: 72px 40px;
          transform: translateY(-40px);
        }

        .location-map {
          transform: translateY(40px);
          min-height: 360px;
        }

        .map-iframe { min-height: 360px; }
      }

      @media (max-width: 600px) {
        .location-info { padding: 56px 24px; }
      }
    `,
  ],
})
export class LocationComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) settings!: WeddingSettings;

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChild('infoEl')    infoEl!:    ElementRef<HTMLElement>;
  @ViewChild('mapEl')     mapEl!:     ElementRef<HTMLElement>;

  private sanitizer = inject(DomSanitizer);
  private ctx?: gsap.Context;

  mapUrl(): SafeResourceUrl | null {
    const url = this.settings.venueMapsUrl;
    if (!url || !url.startsWith('https://www.google.com/maps/embed')) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
      // Info panel slides in from left
      ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        onEnter: () => {
          gsap.to('.location-info', {
            opacity: 1, x: 0, duration: 1.0, ease: 'power3.out',
          });
          gsap.to('.location-map', {
            opacity: 1, x: 0, duration: 1.0, ease: 'power3.out', delay: 0.15,
          });
        },
        once: true,
      });

      // Detail items stagger
      ScrollTrigger.create({
        trigger: '.info-details',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.info-detail', {
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    }, el);
  }
}
