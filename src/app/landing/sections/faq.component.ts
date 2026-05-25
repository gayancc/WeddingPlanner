import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
  computed,
} from '@angular/core';
import { FaqItem } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  template: `
    <section id="faq" class="faq" #sectionEl>
      <div class="faq-inner">

        <div class="faq-header" #headerEl>
          <p class="faq-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>We Have Answers</span>
            <span class="eyebrow-rule"></span>
          </p>
          <h2 class="faq-title">Questions</h2>
        </div>

        <div class="faq-list" #listEl>
          @for (item of effective(); track i; let i = $index) {
            <div class="faq-row" [class.faq-row--open]="openIdx() === i" #row>
              <button
                class="faq-q"
                (click)="toggle(i)"
                [attr.aria-expanded]="openIdx() === i"
              >
                <span class="q-text">{{ item.question }}</span>
                <span class="q-icon" #icon>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </span>
              </button>
              <div class="faq-a" #answer>
                <div class="faq-a-inner">{{ item.answer }}</div>
              </div>
            </div>
          }
        </div>

      </div>
    </section>
  `,
  styles: [
    `
      .faq {
        padding: 120px 0 140px;
        background: var(--color-bg);
        position: relative;
        overflow: hidden;
      }

      .faq::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 180px;
        background: linear-gradient(to bottom, transparent, #16120E);
        pointer-events: none;
        z-index: 0;
      }

      .faq-inner {
        position: relative;
        z-index: 1;
        max-width: 760px;
        margin: 0 auto;
        padding: 0 32px;
      }

      /* ── Header ── */
      .faq-header {
        text-align: center;
        margin-bottom: 72px;
        opacity: 0;
        transform: translateY(30px);
      }

      .faq-eyebrow {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        font-size: 10px;
        letter-spacing: 0.34em;
        text-transform: uppercase;
        color: var(--color-gold);
        margin: 0 0 18px;
      }

      .eyebrow-rule {
        display: block;
        width: 36px;
        height: 1px;
        background: currentColor;
        opacity: 0.55;
      }

      .faq-title {
        font-family: var(--font-serif);
        font-size: clamp(40px, 7vw, 68px);
        font-weight: 700;
        color: var(--color-fg);
        letter-spacing: -0.02em;
      }

      /* ── List ── */
      .faq-list {
        display: flex;
        flex-direction: column;
      }

      .faq-row {
        border-top: 1px solid var(--color-divider);
        opacity: 0;
        position: relative;
      }

      .faq-row:last-child { border-bottom: 1px solid var(--color-divider); }

      /* Gold left accent on open */
      .faq-row::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--color-gold);
        transform: scaleY(0);
        transform-origin: top;
        transition: transform 350ms var(--ease-cinematic);
      }

      .faq-row--open::before { transform: scaleY(1); }

      /* ── Question button ── */
      .faq-q {
        width: 100%;
        background: transparent;
        border: none;
        padding: 26px 0 26px 16px;
        text-align: left;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        cursor: pointer;
        transition: padding-left 300ms var(--ease-smooth);
      }

      .faq-row--open .faq-q { padding-left: 20px; }

      .q-text {
        font-family: var(--font-serif);
        font-size: clamp(16px, 2.2vw, 19px);
        color: var(--color-fg);
        line-height: 1.4;
        transition: color 250ms;
      }

      .faq-row--open .q-text { color: var(--color-fg); }
      .faq-q:hover .q-text { color: var(--color-gold); }

      .q-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--color-divider);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gold);
        flex-shrink: 0;
        transition:
          background 250ms,
          border-color 250ms,
          transform 350ms var(--ease-bounce);
      }

      .faq-row--open .q-icon {
        background: var(--color-gold);
        color: white;
        border-color: var(--color-gold);
        transform: rotate(45deg);
      }

      /* ── Answer ── */
      .faq-a {
        overflow: hidden;
        height: 0;
      }

      .faq-a-inner {
        padding: 0 16px 28px 20px;
        font-size: 15px;
        line-height: 1.85;
        color: var(--color-fg-soft);
      }
    `,
  ],
})
export class FaqComponent implements AfterViewInit, OnDestroy {
  @Input() items: FaqItem[] = [];
  @Input() dressCode: string | undefined = undefined;

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChildren('answer') answers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('row')    rows!:    QueryList<ElementRef<HTMLElement>>;

  readonly openIdx = signal<number | null>(null);

  readonly effective = computed(() => {
    if (this.items && this.items.length > 0) return this.items;
    return this.defaults();
  });

  private ctx?: gsap.Context;

  private defaults(): FaqItem[] {
    return [
      {
        question: 'Can I bring a plus-one?',
        answer: 'Please check your personal invitation — it indicates whether a plus-one is included. If you have questions, feel free to reach out to us directly.',
      },
      {
        question: 'Is there parking at the venue?',
        answer: 'Yes, complimentary parking is available on-site. Valet options may also be available — details will be included with your invitation.',
      },
      {
        question: 'What is the dress code?',
        answer: this.dressCode || 'We\'d love for guests to dress in cocktail / semi-formal attire. Think elegant and celebratory — we want everyone to feel and look their best.',
      },
      {
        question: 'Where should I RSVP?',
        answer: 'Check your email for your personal invitation link containing your unique RSVP code. If you need it resent, please contact us and we\'ll take care of it right away.',
      },
      {
        question: 'Are children welcome?',
        answer: 'We love children! Please check your individual invitation for guidance, as our venue capacity requires that we be selective. Children of immediate family are warmly welcomed.',
      },
    ];
  }

  ngAfterViewInit() {
    initGsap();
    // Initialize all answers as height 0
    this.answers.forEach((a) => {
      gsap.set(a.nativeElement, { height: 0, overflow: 'hidden' });
    });
    this.initAnimations();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  toggle(i: number) {
    const answersArr = this.answers.toArray();
    const current = this.openIdx();

    if (current !== null && current !== i) {
      // Close currently open
      gsap.to(answersArr[current].nativeElement, {
        height: 0,
        duration: 0.35,
        ease: 'power3.in',
      });
    }

    if (current === i) {
      // Close this one
      gsap.to(answersArr[i].nativeElement, {
        height: 0,
        duration: 0.35,
        ease: 'power3.in',
      });
      this.openIdx.set(null);
    } else {
      // Open this one
      this.openIdx.set(i);
      gsap.to(answersArr[i].nativeElement, {
        height: 'auto',
        duration: 0.45,
        ease: 'power3.out',
      });
    }
  }

  private initAnimations() {
    const el = this.sectionEl.nativeElement;
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {

      // Header reveal
      ScrollTrigger.create({
        trigger: el.querySelector('.faq-header') as HTMLElement,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to('.faq-header', {
            opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
          });
        },
      });

      if (prefersReduced) {
        gsap.set('.faq-row', { opacity: 1, y: 0, x: 0 });
        return;
      }

      // Set rows with alternating X offset for cinematic stagger
      const rowEls = el.querySelectorAll<HTMLElement>('.faq-row');
      rowEls.forEach((row, i) => {
        gsap.set(row, {
          opacity: 0,
          x: i % 2 === 0 ? -32 : 32,
          y: 16,
        });
      });

      ScrollTrigger.create({
        trigger: el.querySelector('.faq-list') as HTMLElement,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to('.faq-row', {
            opacity: 1, x: 0, y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
      });

    }, el);
  }
}
