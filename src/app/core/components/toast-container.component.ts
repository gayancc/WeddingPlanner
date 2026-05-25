import { Component, inject } from '@angular/core';

import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="stack" aria-live="polite" aria-atomic="true">
      @for (t of notifications.toasts(); track t.id) {
        <div class="toast" [class]="t.type" (click)="notifications.dismiss(t.id)">
          <span class="dot"></span>
          <span class="msg">{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .stack {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: calc(100vw - 32px);
      }
      .toast {
        background: var(--color-card);
        border-left: 4px solid var(--color-fg);
        border-radius: var(--radius-md);
        padding: 14px 18px;
        box-shadow: var(--shadow-modal);
        display: flex;
        gap: 12px;
        align-items: center;
        cursor: pointer;
        max-width: 360px;
        animation: slide-in 220ms ease-out;
      }
      .toast.success { border-color: var(--color-success); }
      .toast.error { border-color: var(--color-error); }
      .toast.info { border-color: var(--color-gold); }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
      }
      .toast.success .dot { color: var(--color-success); }
      .toast.error .dot { color: var(--color-error); }
      .toast.info .dot { color: var(--color-gold); }
      .msg { color: var(--color-fg); font-size: 14px; }
      @keyframes slide-in {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly notifications = inject(NotificationService);
}
