import { Component, Input } from '@angular/core';

import { AccommodationItem } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-accommodation',
  standalone: true,
  template: `
    <section id="stay" class="acc">
      <div class="head">
        <div class="ornament">✦</div>
        <h2>Where to Stay</h2>
        <p class="sub">A short list of recommended hotels nearby</p>
      </div>

      @if (items && items.length > 0) {
        <div class="grid">
          @for (a of items; track a.name) {
            <article class="card">
              <h3>{{ a.name }}</h3>
              <p class="addr">{{ a.address }}</p>
              <p class="distance">{{ a.distance }}</p>
              @if (a.priceRange) { <p class="price">{{ a.priceRange }}</p> }
              @if (a.phone) { <p class="phone">{{ a.phone }}</p> }
              @if (a.bookingUrl) {
                <a class="cta" [href]="a.bookingUrl" target="_blank" rel="noopener">Book Now</a>
              }
            </article>
          }
        </div>
      } @else {
        <p class="empty">Accommodation recommendations coming soon.</p>
      }
    </section>
  `,
  styles: [
    `
      .acc {
        padding: 96px 24px;
        background: rgba(201, 168, 108, 0.06);
      }
      .head { text-align: center; margin-bottom: 56px; }
      .ornament { color: var(--color-gold); font-size: 24px; margin-bottom: 12px; }
      h2 { font-family: var(--font-serif); font-size: clamp(32px, 6vw, 48px); margin-bottom: 8px; }
      .sub { color: var(--color-fg-soft); font-style: italic; margin: 0; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 18px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .card {
        background: var(--color-card);
        padding: 28px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-card);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      h3 { font-family: var(--font-serif); font-size: 22px; margin-bottom: 4px; }
      .addr { color: var(--color-fg-soft); margin: 0; font-size: 14px; }
      .distance { color: var(--color-gold); font-size: 14px; margin: 0; font-style: italic; }
      .price { font-size: 14px; margin: 4px 0; }
      .phone { font-size: 14px; color: var(--color-fg-soft); margin: 0; }
      .cta {
        margin-top: 14px;
        align-self: flex-start;
        padding: 10px 22px;
        border: 1px solid var(--color-fg);
        color: var(--color-fg);
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: 500;
        transition: all 200ms;
      }
      .cta:hover { background: var(--color-fg); color: white; }
      .empty {
        text-align: center;
        color: var(--color-fg-soft);
        max-width: 460px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AccommodationComponent {
  @Input() items: AccommodationItem[] = [];
}
