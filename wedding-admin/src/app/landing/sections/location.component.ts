import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { WeddingSettings } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-location',
  standalone: true,
  template: `
    <section id="location" class="loc">
      <div class="head">
        <div class="ornament">✦</div>
        <h2>The Venue</h2>
        <p class="venue-name">{{ settings.venue }}</p>
        <p class="muted">{{ settings.venueAddress }}</p>
      </div>

      @if (mapUrl()) {
        <div class="map-wrap">
          <iframe
            [src]="mapUrl()!"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="Venue map"
          ></iframe>
        </div>
      }

      <div class="actions">
        @if (settings.venueMapsUrl) {
          <a class="cta" [href]="settings.venueMapsUrl" target="_blank" rel="noopener">Get Directions</a>
        }
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h3>Parking</h3>
          <p>{{ settings.parkingInfo || 'Complimentary on-site parking available.' }}</p>
        </div>
        <div class="info-card">
          <h3>Nearest Airport</h3>
          <p>{{ settings.nearestAirport || 'See airport details in the FAQ below.' }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .loc {
        padding: 96px 24px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .head { text-align: center; margin-bottom: 32px; }
      .ornament { color: var(--color-gold); font-size: 24px; margin-bottom: 12px; }
      h2 { font-family: var(--font-serif); font-size: clamp(32px, 6vw, 48px); margin-bottom: 16px; }
      .venue-name {
        font-family: var(--font-serif);
        font-size: 22px;
        margin: 0 0 4px;
      }
      .muted { color: var(--color-fg-soft); margin: 0; }
      .map-wrap {
        margin: 32px 0;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-card);
      }
      iframe {
        width: 100%;
        height: 400px;
        border: 0;
        display: block;
      }
      .actions { text-align: center; margin-bottom: 48px; }
      .cta {
        display: inline-block;
        padding: 12px 32px;
        border: 1px solid var(--color-fg);
        color: var(--color-fg);
        font-family: var(--font-serif);
        font-size: 14px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        border-radius: var(--radius-md);
        transition: all 200ms;
      }
      .cta:hover { background: var(--color-fg); color: white; }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .info-card {
        background: var(--color-card);
        padding: 28px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-card);
      }
      h3 { font-family: var(--font-serif); font-size: 20px; margin-bottom: 8px; }
      .info-card p { margin: 0; color: var(--color-fg-soft); }
      @media (max-width: 700px) {
        .info-grid { grid-template-columns: 1fr; }
        iframe { height: 280px; }
      }
    `,
  ],
})
export class LocationComponent {
  @Input({ required: true }) settings!: WeddingSettings;
  private sanitizer = inject(DomSanitizer);

  mapUrl(): SafeResourceUrl | null {
    const url = this.settings.venueMapsUrl;
    if (!url) return null;
    // Only embed actual Google Maps embed URLs (defense in depth)
    if (!url.startsWith('https://www.google.com/maps/embed')) {
      // Allow the share/place URL too but rewrite the iframe to use a built embed:
      // simplest safe choice: do not embed if format unknown.
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
