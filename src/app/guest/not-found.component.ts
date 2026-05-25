import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="ornament">✦</div>
        <h1>Invitation not found</h1>
        <p>
          This invitation link may have expired or is incorrect.
          Please contact {{ coupleName() }} for a new link.
        </p>
        <a routerLink="/">Visit the wedding site →</a>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: var(--color-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        background: var(--color-card);
        padding: 56px 40px;
        border-radius: var(--radius-lg);
        text-align: center;
        max-width: 460px;
        box-shadow: var(--shadow-card);
      }
      .ornament { color: var(--color-gold); font-size: 36px; margin-bottom: 16px; }
      h1 { font-family: var(--font-serif); font-size: 32px; margin-bottom: 12px; }
      p { color: var(--color-fg-soft); margin: 0 0 24px; }
      a { color: var(--color-gold); font-weight: 500; }
    `,
  ],
})
export class NotFoundComponent {
  private settingsSvc = inject(SettingsService);
  private settings = toSignal(this.settingsSvc.get(), { initialValue: undefined });
  readonly coupleName = computed(() => this.settings()?.coupleNames || 'the couple');
}
