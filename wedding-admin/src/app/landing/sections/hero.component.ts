import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { WeddingSettings } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section id="top" class="hero" [style.background-image]="bgImage()">
      <div class="overlay"></div>
      <div class="content">
        <div class="ornament">✦</div>
        <h1>{{ settings.coupleNames || 'We Said Yes' }}</h1>
        <p class="date">
          @if (settings.weddingDate) {
            {{ settings.weddingDate.toDate() | date: 'EEEE, MMMM d, y' }}
          }
        </p>
        <p class="venue">{{ settings.venue }}</p>

        <div class="countdown">
          <div><span class="num">{{ days() }}</span><span class="lbl">days</span></div>
          <div><span class="num">{{ hours() }}</span><span class="lbl">hours</span></div>
          <div><span class="num">{{ minutes() }}</span><span class="lbl">min</span></div>
          <div><span class="num">{{ seconds() }}</span><span class="lbl">sec</span></div>
        </div>

        <a href="#schedule" class="cta">Save the Date</a>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        position: relative;
        min-height: 100vh;
        background-size: cover;
        background-position: center;
        background-color: var(--color-fg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        padding: 24px;
      }
      .hero:not([style*="background-image"]) {
        background: linear-gradient(135deg, #192519 0%, #2b3e2b 50%, #3c5a3c 100%);
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(25, 37, 25, 0.3) 0%, rgba(25, 37, 25, 0.65) 100%);
      }
      .content {
        position: relative;
        text-align: center;
        max-width: 720px;
        z-index: 1;
        animation: rise 900ms ease-out;
      }
      @keyframes rise {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .ornament { color: var(--color-gold); font-size: 30px; margin-bottom: 18px; }
      h1 {
        font-family: var(--font-serif);
        font-size: clamp(48px, 11vw, 96px);
        line-height: 1.05;
        margin-bottom: 14px;
        text-shadow: 0 2px 24px rgba(0, 0, 0, 0.3);
      }
      .date {
        font-family: var(--font-serif);
        font-style: italic;
        font-size: clamp(18px, 3vw, 22px);
        color: var(--color-gold-soft);
        margin: 0 0 4px;
      }
      .venue {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.85);
        margin: 0 0 36px;
      }
      .countdown {
        display: inline-flex;
        gap: 18px;
        padding: 16px 28px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        border-radius: var(--radius-lg);
        margin-bottom: 28px;
      }
      .countdown div { text-align: center; min-width: 50px; }
      .countdown .num {
        display: block;
        font-family: var(--font-serif);
        font-size: 28px;
        line-height: 1;
      }
      .countdown .lbl {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-gold-soft);
      }
      .cta {
        display: inline-block;
        padding: 14px 36px;
        border: 1px solid var(--color-gold);
        color: white;
        font-family: var(--font-serif);
        font-size: 15px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        border-radius: var(--radius-md);
        transition: all 200ms;
      }
      .cta:hover {
        background: var(--color-gold);
        color: var(--color-fg);
      }
      @media (max-width: 500px) {
        .countdown { gap: 10px; padding: 14px 18px; }
        .countdown .num { font-size: 22px; }
      }
    `,
  ],
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input({ required: true }) settings!: WeddingSettings;

  readonly days = signal(0);
  readonly hours = signal(0);
  readonly minutes = signal(0);
  readonly seconds = signal(0);
  private timer: ReturnType<typeof setInterval> | undefined;

  bgImage(): string {
    return this.settings.heroPhotoUrl
      ? `url('${this.settings.heroPhotoUrl}')`
      : '';
  }

  ngOnInit() {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private tick() {
    if (!this.settings.weddingDate) return;
    const target = this.settings.weddingDate.toDate().getTime();
    const diff = Math.max(0, target - Date.now());
    this.days.set(Math.floor(diff / 86_400_000));
    this.hours.set(Math.floor((diff % 86_400_000) / 3_600_000));
    this.minutes.set(Math.floor((diff % 3_600_000) / 60_000));
    this.seconds.set(Math.floor((diff % 60_000) / 1000));
  }
}
