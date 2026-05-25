import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

import { InvitationService } from '../../core/services/invitation.service';
import { SettingsService } from '../../core/services/settings.service';
import { SkeletonComponent } from '../../core/components/skeleton.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SkeletonComponent, DatePipe],
  template: `
    <header class="hero">
      <h1>Dashboard</h1>
      <p class="sub">A live picture of your wedding plans.</p>
    </header>

    @if (invitations() === undefined) {
      <div class="grid">
        @for (i of [1,2,3,4]; track i) {
          <app-skeleton height="120px" radius="14px" />
        }
      </div>
    } @else {
      <section class="grid">
        <div class="stat">
          <div class="num">{{ totalInvites() }}</div>
          <div class="label">Invitations</div>
        </div>
        <div class="stat">
          <div class="num accent">{{ totalGuests() }}</div>
          <div class="label">Total guests</div>
        </div>
        <div class="stat">
          <div class="num success">{{ attending() }}</div>
          <div class="label">Attending</div>
        </div>
        <div class="stat">
          <div class="num error">{{ declined() }}</div>
          <div class="label">Declined</div>
        </div>
        <div class="stat">
          <div class="num amber">{{ pending() }}</div>
          <div class="label">Pending response</div>
        </div>
        <div class="stat">
          <div class="num">{{ openedCount() }}</div>
          <div class="label">Links opened</div>
        </div>
      </section>

      @if (settings(); as s) {
        <section class="info-card">
          <div>
            <div class="label-light">Wedding date</div>
            <div class="big">{{ s.weddingDate.toDate() | date: 'EEEE, MMMM d, y' }}</div>
          </div>
          <div>
            <div class="label-light">RSVP deadline</div>
            <div class="big">{{ s.rsvpDeadline.toDate() | date: 'MMMM d, y' }}</div>
          </div>
        </section>
      }

      <section class="recent">
        <h2>Recent RSVPs</h2>
        @if (recent().length === 0) {
          <p class="empty">No responses yet — once guests start to RSVP, you'll see them here.</p>
        } @else {
          <ul>
            @for (r of recent(); track r.guestId) {
              <li>
                <span class="who">{{ r.name }}</span>
                <span class="status" [class]="r.rsvp">{{ r.rsvp }}</span>
                <span class="when">{{ r.when | date: 'MMM d, h:mm a' }}</span>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; max-width: 1200px; }
      .hero h1 {
        font-family: var(--font-serif);
        font-size: 36px;
        margin-bottom: 4px;
      }
      .sub { color: var(--color-fg-soft); margin: 0 0 32px; }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 16px;
        margin-bottom: 28px;
      }
      .stat {
        background: var(--color-card);
        padding: 22px 20px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-card);
      }
      .num {
        font-family: var(--font-serif);
        font-size: 36px;
        line-height: 1;
        color: var(--color-fg);
      }
      .num.accent { color: var(--color-gold); }
      .num.success { color: var(--color-success); }
      .num.error { color: var(--color-error); }
      .num.amber { color: var(--color-amber); }
      .label { margin-top: 8px; color: var(--color-fg-soft); font-size: 13px; }

      .info-card {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 24px 28px;
        box-shadow: var(--shadow-card);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        margin-bottom: 28px;
      }
      .label-light {
        font-size: 12px;
        color: var(--color-fg-soft);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .big { font-family: var(--font-serif); font-size: 22px; }

      .recent {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 24px 28px;
        box-shadow: var(--shadow-card);
      }
      h2 { font-family: var(--font-serif); font-size: 22px; margin-bottom: 16px; }
      .empty { color: var(--color-fg-soft); }
      ul { list-style: none; padding: 0; margin: 0; }
      li {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-divider);
        align-items: center;
      }
      li:last-child { border-bottom: none; }
      .who { font-weight: 500; }
      .status {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 99px;
        text-transform: capitalize;
      }
      .status.attending { background: rgba(58, 125, 68, 0.12); color: var(--color-success); }
      .status.declined { background: rgba(155, 47, 47, 0.12); color: var(--color-error); }
      .status.pending { background: rgba(160, 101, 42, 0.12); color: var(--color-amber); }
      .when { font-size: 12px; color: var(--color-fg-soft); }

      @media (max-width: 600px) {
        .info-card { grid-template-columns: 1fr; gap: 16px; }
        li { grid-template-columns: 1fr; gap: 4px; }
      }
    `,
  ],
})
export class DashboardComponent {
  private invitationsSvc = inject(InvitationService);
  private settingsSvc = inject(SettingsService);

  readonly invitations = toSignal(this.invitationsSvc.list(), { initialValue: undefined });
  readonly settings = toSignal(this.settingsSvc.get(), { initialValue: undefined });

  readonly totalInvites = computed(() => this.invitations()?.length ?? 0);
  readonly totalGuests = computed(
    () => this.invitations()?.reduce((n, i) => n + i.guests.length, 0) ?? 0,
  );
  readonly attending = computed(() => this.countBy('attending'));
  readonly declined = computed(() => this.countBy('declined'));
  readonly pending = computed(() => this.countBy('pending'));
  readonly openedCount = computed(
    () => this.invitations()?.filter((i) => !!i.openedAt).length ?? 0,
  );

  readonly recent = computed(() => {
    const rows: { guestId: string; name: string; rsvp: string; when: Date }[] = [];
    for (const inv of this.invitations() ?? []) {
      for (const g of inv.guests) {
        if (g.respondedAt) {
          rows.push({
            guestId: g.id,
            name: `${g.firstName} ${g.lastName}`,
            rsvp: g.rsvp,
            when: g.respondedAt.toDate(),
          });
        }
      }
    }
    return rows.sort((a, b) => b.when.getTime() - a.when.getTime()).slice(0, 8);
  });

  private countBy(status: 'attending' | 'declined' | 'pending'): number {
    return this.invitations()?.reduce(
      (n, i) => n + i.guests.filter((g) => g.rsvp === status).length, 0,
    ) ?? 0;
  }
}
