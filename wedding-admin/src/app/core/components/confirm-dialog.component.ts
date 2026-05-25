import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="overlay" (click)="onCancel()">
      <div class="card" (click)="$event.stopPropagation()">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="actions">
          <button type="button" class="ghost" (click)="onCancel()">{{ cancelLabel }}</button>
          <button type="button" class="danger" (click)="onConfirm()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(25, 37, 25, 0.5);
        backdrop-filter: blur(4px);
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fade 160ms ease-out;
      }
      .card {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 28px;
        max-width: 420px;
        width: 100%;
        box-shadow: var(--shadow-modal);
      }
      h3 {
        font-family: var(--font-serif);
        font-size: 22px;
        margin-bottom: 8px;
      }
      p {
        color: var(--color-fg-soft);
        margin: 0 0 24px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      button {
        padding: 10px 18px;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-divider);
        background: transparent;
        color: var(--color-fg);
        font-weight: 500;
      }
      .danger {
        background: var(--color-error);
        color: white;
        border-color: var(--color-error);
      }
      .ghost:hover { background: rgba(25, 37, 25, 0.04); }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}
