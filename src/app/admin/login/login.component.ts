import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="page">
      <div class="card">
        <div class="ornament">✦</div>
        <h1>Wedding Admin</h1>
        <p class="sub">Sign in to manage invitations and RSVPs.</p>

        <button class="google-btn" (click)="signIn()" [disabled]="busy()">
          @if (busy()) {
            <span>Signing in…</span>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            <span>Sign in with Google</span>
          }
        </button>

        <p class="footer">Only authorised accounts can access this panel.</p>
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
        border-radius: var(--radius-lg);
        padding: 48px 36px;
        max-width: 420px;
        width: 100%;
        box-shadow: var(--shadow-card);
        text-align: center;
      }
      .ornament {
        color: var(--color-gold);
        font-size: 28px;
        margin-bottom: 12px;
      }
      h1 {
        font-family: var(--font-serif);
        font-size: 32px;
        margin-bottom: 8px;
      }
      .sub {
        color: var(--color-fg-soft);
        margin: 0 0 32px;
      }
      .google-btn {
        width: 100%;
        padding: 14px 20px;
        background: var(--color-fg);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-size: 15px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        transition: opacity 160ms;
      }
      .google-btn:hover { opacity: 0.9; }
      .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .footer {
        margin-top: 24px;
        font-size: 12px;
        color: var(--color-fg-soft);
      }
    `,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  readonly busy = signal(false);

  async signIn() {
    this.busy.set(true);
    try {
      await this.auth.signIn();
      await this.router.navigate(['/admin/dashboard']);
    } catch (e: unknown) {
      const msg = this.friendlyError(e);
      this.notify.error(msg);
    } finally {
      this.busy.set(false);
    }
  }

  private friendlyError(e: unknown): string {
    if (!(e instanceof Error)) return 'Sign-in failed. Please try again.';

    const code = (e as { code?: string }).code ?? '';

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return 'Sign-in cancelled.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorised in Firebase Console → Authentication → Settings → Authorised domains.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Google sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method and enable Google.';
    }
    if (code === 'auth/invalid-api-key' || code === 'auth/invalid-credential') {
      return 'Firebase is not configured. Fill in the real values in environment.ts.';
    }

    // Custom "not authorised" error thrown after email check
    if (e.message.includes('not authorised')) return e.message;

    return e.message || 'Sign-in failed. Please try again.';
  }
}
