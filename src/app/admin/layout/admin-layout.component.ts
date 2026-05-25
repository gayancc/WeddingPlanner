import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/services/auth.service';
import { InvitationService } from '../../core/services/invitation.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastContainerComponent } from '../../core/components/toast-container.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="shell" [class.menu-open]="menuOpen()">
      <button class="hamburger" type="button" (click)="menuOpen.set(!menuOpen())" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>

      @if (menuOpen()) {
        <div class="overlay" (click)="menuOpen.set(false)"></div>
      }

      <aside class="sidebar">
        <div class="brand">
          <div class="ornament">✦</div>
          <div>
            <div class="brand-title">Wedding</div>
            <div class="brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="menuOpen.set(false)">
            <span>Dashboard</span>
            @if (pendingCount() > 0) {
              <span class="badge">{{ pendingCount() }}</span>
            }
          </a>
          <a routerLink="/admin/guests" routerLinkActive="active" (click)="menuOpen.set(false)">
            <span>Guest List</span>
            @if (unsentCount() > 0) {
              <span class="dot" title="Invitations not yet sent"></span>
            }
          </a>
          <a routerLink="/admin/events" routerLinkActive="active" (click)="menuOpen.set(false)">
            <span>Events &amp; Menu</span>
          </a>
          <a routerLink="/admin/settings" routerLinkActive="active" (click)="menuOpen.set(false)">
            <span>Settings</span>
          </a>
        </nav>

        <div class="user">
          @if (auth.user(); as u) {
            <div class="email">{{ u.email }}</div>
          }
          <button class="signout" type="button" (click)="signOut()">Sign out</button>
        </div>
      </aside>

      <main>
        <router-outlet />
      </main>

      <app-toast-container />
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px 1fr;
        background: var(--color-bg);
      }
      .sidebar {
        background: #192519;
        color: #e3ddd0;
        padding: 28px 22px;
        display: flex;
        flex-direction: column;
        gap: 28px;
        position: sticky;
        top: 0;
        height: 100vh;
        z-index: 20;
      }
      .brand {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .ornament { color: var(--color-gold); font-size: 22px; }
      .brand-title { font-family: var(--font-serif); font-size: 20px; }
      .brand-sub { font-size: 12px; color: var(--color-gold-soft); letter-spacing: 0.05em; }

      nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
      nav a {
        padding: 12px 14px;
        border-radius: var(--radius-md);
        color: #c5beae;
        font-size: 14px;
        font-weight: 500;
        transition: all 160ms;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      nav a:hover { background: rgba(255, 255, 255, 0.06); color: white; }
      nav a.active {
        background: rgba(201, 168, 108, 0.18);
        color: white;
      }
      .badge {
        background: var(--color-gold);
        color: var(--color-fg);
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-amber);
      }

      .user {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 16px;
      }
      .email {
        font-size: 12px;
        color: #a8a193;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .signout {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #c5beae;
        padding: 8px 14px;
        border-radius: var(--radius-md);
        font-size: 13px;
        width: 100%;
      }
      .signout:hover { background: rgba(255, 255, 255, 0.06); }

      main {
        padding: 32px 40px;
        overflow-x: hidden;
      }

      .hamburger {
        display: none;
        position: fixed;
        top: 14px;
        left: 14px;
        width: 42px;
        height: 42px;
        border-radius: var(--radius-md);
        background: var(--color-fg);
        border: none;
        z-index: 40;
        padding: 11px 10px;
        flex-direction: column;
        justify-content: space-between;
      }
      .hamburger span {
        display: block;
        height: 2px;
        background: white;
        border-radius: 2px;
      }

      .overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(25, 37, 25, 0.4);
        z-index: 15;
      }

      @media (max-width: 768px) {
        .shell { grid-template-columns: 1fr; }
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: 260px;
          transform: translateX(-100%);
          transition: transform 220ms ease;
        }
        .menu-open .sidebar { transform: translateX(0); }
        .menu-open .overlay { display: block; }
        .hamburger { display: flex; }
        main { padding: 72px 18px 24px; }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private invitations = inject(InvitationService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  readonly menuOpen = signal(false);

  readonly invList = toSignal(this.invitations.list(), { initialValue: [] });
  readonly pendingCount = computed(
    () => this.invList().reduce(
      (n, inv) => n + inv.guests.filter((g) => g.rsvp === 'pending').length, 0,
    ),
  );
  readonly unsentCount = computed(
    () => this.invList().filter((i) => !i.sentAt).length,
  );

  async signOut() {
    await this.auth.signOut();
    this.notify.info('Signed out');
    await this.router.navigate(['/login']);
  }
}
