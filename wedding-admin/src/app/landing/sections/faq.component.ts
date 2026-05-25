import { Component, Input, computed, signal } from '@angular/core';

import { FaqItem } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  template: `
    <section id="faq" class="faq">
      <div class="head">
        <div class="ornament">✦</div>
        <h2>Questions</h2>
      </div>
      <div class="list">
        @for (item of effective(); track item.question; let i = $index) {
          <div class="row" [class.open]="openIdx() === i">
            <button class="q" (click)="toggle(i)" [attr.aria-expanded]="openIdx() === i">
              <span>{{ item.question }}</span>
              <span class="caret">{{ openIdx() === i ? '−' : '+' }}</span>
            </button>
            @if (openIdx() === i) {
              <div class="a">{{ item.answer }}</div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .faq { padding: 96px 24px; max-width: 800px; margin: 0 auto; }
      .head { text-align: center; margin-bottom: 48px; }
      .ornament { color: var(--color-gold); font-size: 24px; margin-bottom: 12px; }
      h2 { font-family: var(--font-serif); font-size: clamp(32px, 6vw, 48px); }
      .list { display: flex; flex-direction: column; }
      .row {
        border-top: 1px solid var(--color-divider);
      }
      .row:last-child { border-bottom: 1px solid var(--color-divider); }
      .q {
        width: 100%;
        background: transparent;
        border: none;
        padding: 22px 0;
        text-align: left;
        font-family: var(--font-serif);
        font-size: 18px;
        color: var(--color-fg);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 18px;
      }
      .caret {
        color: var(--color-gold);
        font-size: 24px;
        font-weight: 300;
      }
      .a {
        padding: 0 0 22px;
        color: var(--color-fg-soft);
        line-height: 1.7;
      }
    `,
  ],
})
export class FaqComponent {
  @Input() items: FaqItem[] = [];
  @Input() dressCode: string | undefined = undefined;

  readonly openIdx = signal<number | null>(null);

  readonly effective = computed(() => {
    if (this.items && this.items.length > 0) return this.items;
    return this.defaults();
  });

  private defaults(): FaqItem[] {
    return [
      { question: 'Can I bring a plus-one?', answer: 'Please check your personal invitation — it indicates whether a plus-one is included.' },
      { question: 'Is there parking at the venue?', answer: 'Yes, complimentary parking is available on-site.' },
      { question: 'What is the dress code?', answer: this.dressCode || 'Cocktail / semi-formal attire.' },
      { question: 'Where should I RSVP?', answer: 'Check your email for your personal invitation link, or contact us directly if you need it resent.' },
    ];
  }

  toggle(i: number) {
    this.openIdx.set(this.openIdx() === i ? null : i);
  }
}
