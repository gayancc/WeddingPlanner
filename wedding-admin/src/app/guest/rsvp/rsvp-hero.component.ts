import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Invitation, WeddingSettings } from '../../core/models/invitation.model';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-rsvp-hero',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="hero">
      <div class="ornament">✦</div>
      <h1>{{ settings.coupleNames }}</h1>
      <p class="date">{{ settings.weddingDate.toDate() | date: 'EEEE, MMMM d, y' }}</p>
      <p class="venue">{{ settings.venue }}<br />{{ settings.venueAddress }}</p>

      <div class="divider"><span>·</span></div>

      <p class="greeting">You're invited,<br /><em>{{ invitation.label }}</em></p>

      <div class="countdown">
        <div><span class="num">{{ count().days }}</span><span class="lbl">days</span></div>
        <div><span class="num">{{ count().hours }}</span><span class="lbl">hours</span></div>
        <div><span class="num">{{ count().minutes }}</span><span class="lbl">min</span></div>
        <div><span class="num">{{ count().seconds }}</span><span class="lbl">sec</span></div>
      </div>

      <p class="deadline">Please respond by {{ settings.rsvpDeadline.toDate() | date: 'MMMM d, y' }}</p>
    </section>
  `,
  styles: [
    `
      .hero {
        text-align: center;
        padding: 64px 24px 48px;
        background: linear-gradient(180deg, rgba(247, 243, 238, 1) 0%, rgba(232, 222, 204, 0.6) 100%);
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      }
      .ornament { color: var(--color-gold); font-size: 28px; margin-bottom: 12px; }
      h1 {
        font-family: var(--font-serif);
        font-size: clamp(36px, 8vw, 64px);
        line-height: 1.1;
        margin-bottom: 12px;
      }
      .date {
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 18px;
        color: var(--color-fg-soft);
        margin-bottom: 4px;
      }
      .venue {
        color: var(--color-fg-soft);
        font-size: 14px;
        margin-bottom: 32px;
      }
      .divider {
        width: 60px;
        height: 1px;
        margin: 0 auto 28px;
        background: var(--color-gold);
        position: relative;
      }
      .divider span {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--color-gold);
        background: var(--color-bg);
        padding: 0 8px;
      }
      .greeting {
        font-family: var(--font-serif);
        font-size: 22px;
        margin-bottom: 32px;
      }
      .greeting em { color: var(--color-gold); font-style: italic; }
      .countdown {
        display: inline-flex;
        gap: 18px;
        padding: 16px 24px;
        background: var(--color-fg);
        color: white;
        border-radius: var(--radius-lg);
        margin-bottom: 24px;
      }
      .countdown div {
        text-align: center;
        min-width: 50px;
      }
      .countdown .num {
        font-family: var(--font-serif);
        font-size: 28px;
        display: block;
        line-height: 1;
      }
      .countdown .lbl {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-gold-soft);
      }
      .deadline {
        font-size: 13px;
        color: var(--color-fg-soft);
        font-style: italic;
        margin: 0;
      }
      @media (max-width: 500px) {
        .countdown { gap: 10px; padding: 14px 16px; }
        .countdown .num { font-size: 22px; }
      }
    `,
  ],
})
export class RsvpHeroComponent implements OnInit, OnDestroy {
  @Input({ required: true }) settings!: WeddingSettings;
  @Input({ required: true }) invitation!: Invitation;

  readonly count = signal<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private timer: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private tick() {
    const target = this.settings.weddingDate.toDate().getTime();
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1000);
    this.count.set({ days, hours, minutes, seconds });
  }
}
