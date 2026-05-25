import { Component, Input, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { WeddingEvent } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-schedule',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section id="schedule" class="schedule">
      <div class="head">
        <div class="ornament">✦</div>
        <h2>The Day</h2>
        <p>Our schedule of celebrations</p>
      </div>
      @if (events && events.length > 0) {
        <div class="timeline">
          @for (e of sorted(); track e.id; let i = $index) {
            <div class="row">
              <div class="time">
                <span class="hr">{{ e.startUtc.toDate() | date: 'h:mm a' }}</span>
              </div>
              <div class="dot">{{ icon(e.name) }}</div>
              <div class="card">
                <h3>{{ e.name }}</h3>
                <p>{{ e.venue }}</p>
                @if (e.address) { <p class="muted">{{ e.address }}</p> }
                @if (e.dressCode) { <span class="chip">{{ e.dressCode }}</span> }
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="empty">Schedule details coming soon.</p>
      }
    </section>
  `,
  styles: [
    `
      .schedule {
        padding: 96px 24px;
        background: rgba(201, 168, 108, 0.06);
        max-width: 100%;
      }
      .head {
        text-align: center;
        margin-bottom: 64px;
        max-width: 1100px;
        margin-left: auto;
        margin-right: auto;
      }
      .ornament { color: var(--color-gold); font-size: 24px; margin-bottom: 12px; }
      h2 { font-family: var(--font-serif); font-size: clamp(32px, 6vw, 48px); margin-bottom: 8px; }
      .head p { color: var(--color-fg-soft); font-style: italic; }
      .timeline {
        max-width: 720px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .row {
        display: grid;
        grid-template-columns: 100px 32px 1fr;
        gap: 16px;
        align-items: flex-start;
      }
      .time {
        text-align: right;
        padding-top: 18px;
      }
      .hr {
        font-family: var(--font-serif);
        font-size: 20px;
      }
      .dot {
        margin-top: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-gold);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      .card {
        background: var(--color-card);
        padding: 18px 22px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-card);
      }
      h3 { font-family: var(--font-serif); font-size: 22px; margin-bottom: 4px; }
      p { margin: 2px 0; }
      .muted { color: var(--color-fg-soft); font-size: 13px; }
      .chip {
        display: inline-block;
        margin-top: 6px;
        padding: 3px 10px;
        border-radius: 99px;
        background: rgba(201, 168, 108, 0.18);
        color: var(--color-amber);
        font-size: 12px;
      }
      .empty { text-align: center; color: var(--color-fg-soft); }
      @media (max-width: 600px) {
        .row { grid-template-columns: 70px 28px 1fr; gap: 10px; }
        .time { padding-top: 14px; }
        .hr { font-size: 16px; }
      }
    `,
  ],
})
export class ScheduleComponent {
  @Input() events: WeddingEvent[] = [];

  sorted(): WeddingEvent[] {
    return [...this.events].sort((a, b) => a.order - b.order);
  }

  icon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('ceremony')) return '💍';
    if (n.includes('reception') || n.includes('dinner')) return '🥂';
    if (n.includes('cocktail')) return '🍸';
    if (n.includes('brunch')) return '🥞';
    return '✦';
  }
}
