import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { InvitationService } from '../../core/services/invitation.service';
import { SettingsService } from '../../core/services/settings.service';
import { EventService } from '../../core/services/event.service';
import { Invitation, MenuItem } from '../../core/models/invitation.model';
import { SkeletonComponent } from '../../core/components/skeleton.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink, DatePipe, KeyValuePipe, SkeletonComponent],
  template: `
    @if (invitation() && settings()) {
      <div class="page">
        <div class="card">
          <svg class="check" viewBox="0 0 64 64" width="80" height="80" aria-hidden="true">
            <circle cx="32" cy="32" r="29" fill="none" stroke="#C9A86C" stroke-width="2" />
            <path d="M20 33 L29 42 L46 24"
                  fill="none" stroke="#3A7D44" stroke-width="3"
                  stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <h1>Thank you, {{ guestNames() }}!</h1>
          <p class="lead">Your RSVP is confirmed for {{ settings()!.coupleNames }}'s wedding.</p>

          <ul class="summary">
            @for (g of invitation()!.guests; track g.id) {
              <li>
                <strong>{{ g.firstName }} {{ g.lastName }}</strong>
                @switch (g.rsvp) {
                  @case ('attending') { <span class="status ok">Attending</span> }
                  @case ('declined') { <span class="status no">Unable to attend</span> }
                  @default { <span class="status pending">Pending</span> }
                }
                @if (g.rsvp === 'attending') {
                  <div class="choices">
                    @for (eId of g.menuChoices | keyvalue; track eId.key) {
                      <span class="choice">{{ menuName(eId.value) }}</span>
                    }
                  </div>
                }
              </li>
            }
          </ul>

          <div class="meta">
            <div>
              <div class="lbl">When</div>
              <div class="val">{{ settings()!.weddingDate.toDate() | date: 'EEEE, MMMM d, y' }}</div>
            </div>
            <div>
              <div class="lbl">Where</div>
              <div class="val">{{ settings()!.venue }}</div>
            </div>
          </div>

          <div class="actions">
            <a [href]="googleCalUrl()" target="_blank" rel="noopener">+ Google Calendar</a>
            <button class="link" (click)="downloadIcs()">+ Apple / .ics</button>
            @if (settings()!.registryUrl) {
              <a [href]="settings()!.registryUrl" target="_blank" rel="noopener">Registry</a>
            }
          </div>

          <p class="change">
            Need to change your response?
            <a [routerLink]="['/i', token()]">Go back to your invitation →</a>
          </p>
        </div>
      </div>
    } @else {
      <div class="page"><app-skeleton width="100%" height="400px" radius="18px" /></div>
    }
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: var(--color-bg);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 48px 16px;
      }
      .card {
        background: var(--color-card);
        max-width: 560px;
        width: 100%;
        padding: 48px 36px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-card);
        text-align: center;
      }
      .check { display: block; margin: 0 auto 24px; }
      .check path { stroke-dasharray: 60; stroke-dashoffset: 60; animation: draw 700ms ease-out forwards 200ms; }
      @keyframes draw { to { stroke-dashoffset: 0; } }
      h1 { font-family: var(--font-serif); font-size: 32px; margin-bottom: 8px; }
      .lead { color: var(--color-fg-soft); margin: 0 0 28px; }
      .summary { list-style: none; padding: 0; margin: 0 0 28px; }
      .summary li {
        padding: 14px 0;
        border-top: 1px solid var(--color-divider);
        text-align: left;
      }
      .summary li:last-child { border-bottom: 1px solid var(--color-divider); }
      .status {
        margin-left: 8px;
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 99px;
      }
      .status.ok { background: rgba(58, 125, 68, 0.12); color: var(--color-success); }
      .status.no { background: rgba(155, 47, 47, 0.12); color: var(--color-error); }
      .status.pending { background: rgba(160, 101, 42, 0.12); color: var(--color-amber); }
      .choices { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px; }
      .choice {
        font-size: 12px;
        background: var(--color-bg);
        padding: 3px 10px;
        border-radius: 99px;
        color: var(--color-fg-soft);
      }
      .meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin: 28px 0;
        padding: 18px;
        background: var(--color-bg);
        border-radius: var(--radius-md);
      }
      .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-fg-soft); }
      .val { font-family: var(--font-serif); font-size: 16px; margin-top: 4px; }
      .actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      .actions a, .actions button {
        color: var(--color-gold);
        font-size: 14px;
        text-decoration: underline;
        background: transparent;
        border: none;
        padding: 0;
      }
      .change { font-size: 13px; color: var(--color-fg-soft); margin: 0; }
      .change a { color: var(--color-gold); }
      @media (max-width: 500px) {
        .meta { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class ConfirmationComponent {
  private route = inject(ActivatedRoute);
  private invitationSvc = inject(InvitationService);
  private settingsSvc = inject(SettingsService);
  private eventSvc = inject(EventService);

  readonly token = signal(this.route.snapshot.paramMap.get('token') ?? '');
  readonly invitation = signal<Invitation | null>(null);
  readonly settings = toSignal(this.settingsSvc.get(), { initialValue: undefined });
  readonly menuItems = toSignal(this.eventSvc.listAllMenuItems(), { initialValue: [] });

  readonly guestNames = computed(() => {
    const inv = this.invitation();
    if (!inv) return '';
    return inv.guests.map((g) => g.firstName).join(' & ');
  });

  constructor() {
    this.load();
  }

  async load() {
    const inv = await this.invitationSvc.getByToken(this.token());
    if (inv) this.invitation.set(inv);
  }

  menuName(itemId: unknown): string {
    const id = String(itemId);
    return this.menuItems().find((i) => i.id === id)?.name ?? '';
  }

  googleCalUrl(): string {
    const s = this.settings();
    if (!s) return '#';
    const start = s.weddingDate.toDate();
    const end = new Date(start.getTime() + 5 * 60 * 60 * 1000); // assume 5 hours
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${s.coupleNames}'s Wedding`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: 'Wedding celebration',
      location: `${s.venue}, ${s.venueAddress}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  downloadIcs(): void {
    const s = this.settings();
    if (!s) return;
    const start = s.weddingDate.toDate();
    const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding//EN',
      'BEGIN:VEVENT',
      `UID:${this.token()}@wedding`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${s.coupleNames}'s Wedding`,
      `LOCATION:${s.venue}, ${s.venueAddress}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding.ics';
    a.click();
    URL.revokeObjectURL(url);
  }
}
