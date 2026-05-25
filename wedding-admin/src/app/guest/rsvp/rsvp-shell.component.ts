import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

import { InvitationService } from '../../core/services/invitation.service';
import { EventService } from '../../core/services/event.service';
import { SettingsService } from '../../core/services/settings.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastContainerComponent } from '../../core/components/toast-container.component';
import { SkeletonComponent } from '../../core/components/skeleton.component';
import { Invitation } from '../../core/models/invitation.model';

import { RsvpHeroComponent } from './rsvp-hero.component';
import { RsvpFormComponent } from './rsvp-form.component';

@Component({
  selector: 'app-rsvp-shell',
  standalone: true,
  imports: [RsvpHeroComponent, RsvpFormComponent, ToastContainerComponent, SkeletonComponent],
  template: `
    @if (loading()) {
      <div class="loading">
        <app-skeleton width="100%" height="320px" radius="0 0 18px 18px" />
        <div style="padding:48px 24px; max-width:720px; margin:0 auto;">
          <app-skeleton height="160px" radius="14px" />
          <div style="height:12px"></div>
          <app-skeleton height="160px" radius="14px" />
        </div>
      </div>
    } @else if (error()) {
      <div class="error-state">
        <h2>We couldn't load your invitation</h2>
        <p>{{ error() }}</p>
        <button (click)="reload()">Try again</button>
      </div>
    } @else if (invitation() && settings()) {
      <app-rsvp-hero [invitation]="invitation()!" [settings]="settings()!" />
      <app-rsvp-form
        [invitation]="invitation()!"
        [events]="events()"
        [menuItems]="menuItems()"
        (submitted)="onSubmitted()"
      />
    }
    <app-toast-container />
  `,
  styles: [
    `
      :host { display: block; background: var(--color-bg); min-height: 100vh; }
      .loading { background: var(--color-bg); min-height: 100vh; }
      .error-state {
        max-width: 460px;
        margin: 80px auto;
        padding: 40px;
        background: var(--color-card);
        border-radius: var(--radius-lg);
        text-align: center;
        box-shadow: var(--shadow-card);
      }
      .error-state h2 { font-family: var(--font-serif); margin-bottom: 12px; }
      .error-state p { color: var(--color-fg-soft); margin: 0 0 20px; }
      .error-state button {
        background: var(--color-fg);
        color: white;
        border: none;
        padding: 10px 22px;
        border-radius: var(--radius-md);
        font-weight: 500;
      }
    `,
  ],
})
export class RsvpShellComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationSvc = inject(InvitationService);
  private eventSvc = inject(EventService);
  private settingsSvc = inject(SettingsService);
  private notify = inject(NotificationService);

  readonly token = signal<string>(this.route.snapshot.paramMap.get('token') ?? '');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly invitation = signal<Invitation | null>(null);

  readonly events = toSignal(this.eventSvc.listEvents(), { initialValue: [] });
  readonly menuItems = toSignal(this.eventSvc.listAllMenuItems(), { initialValue: [] });
  readonly settings = toSignal(this.settingsSvc.get(), { initialValue: undefined });

  constructor() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const inv = await this.invitationSvc.getByToken(this.token());
      if (!inv) {
        await this.router.navigate(['/not-found']);
        return;
      }
      this.invitation.set(inv);
      // Fire-and-forget mark opened
      this.invitationSvc.markOpened(this.token()).catch(() => {});
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Network error');
    } finally {
      this.loading.set(false);
    }
  }

  reload() {
    this.load();
  }

  async onSubmitted() {
    this.notify.success('Thank you! Your RSVP is saved.');
    await this.router.navigate(['/i', this.token(), 'confirmed']);
  }
}
