import { Component, Input, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { WeddingSettings } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [DatePipe],
  template: `
    <footer class="footer">
      <div class="ornament">✦</div>
      <h3>{{ settings.coupleNames }}</h3>
      @if (settings.weddingDate) {
        <p class="date">{{ settings.weddingDate.toDate() | date: 'MMMM d, y' }}</p>
      }
      <div class="divider"></div>
      <ul class="links">
        @if (settings.registryUrl) {
          <li><a [href]="settings.registryUrl" target="_blank" rel="noopener">Registry</a></li>
        }
        @if (settings.contactEmail) {
          <li><a [href]="'mailto:' + settings.contactEmail">Contact</a></li>
        }
      </ul>
      <p class="credit">Made with <span class="heart">♥</span></p>
      <p class="copy">© {{ year }} {{ settings.coupleNames }}</p>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--color-fg);
        color: #e3ddd0;
        padding: 64px 24px 48px;
        text-align: center;
      }
      .ornament { color: var(--color-gold); font-size: 28px; margin-bottom: 16px; }
      h3 { font-family: var(--font-serif); font-size: 28px; margin-bottom: 6px; color: white; }
      .date {
        font-family: var(--font-serif);
        font-style: italic;
        color: var(--color-gold-soft);
        margin: 0 0 24px;
      }
      .divider {
        width: 50px;
        height: 1px;
        margin: 0 auto 24px;
        background: var(--color-gold);
      }
      .links {
        display: flex;
        justify-content: center;
        gap: 24px;
        list-style: none;
        padding: 0;
        margin: 0 0 24px;
      }
      .links a {
        color: var(--color-gold-soft);
        font-size: 14px;
        text-decoration: underline;
      }
      .links a:hover { color: white; }
      .credit { font-style: italic; color: var(--color-gold-soft); margin: 0 0 8px; }
      .heart { color: var(--color-gold); }
      .copy { font-size: 12px; color: rgba(255, 255, 255, 0.4); margin: 0; }
    `,
  ],
})
export class FooterComponent {
  @Input({ required: true }) settings!: WeddingSettings;
  readonly year = new Date().getFullYear();
}
