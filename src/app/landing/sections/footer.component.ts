import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { WeddingSettings } from '../../core/models/invitation.model';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [DatePipe],
  template: `
    <footer class="footer" #footerEl>

      <!-- Atmospheric glow -->
      <div class="footer-glow" aria-hidden="true"></div>

      <div class="footer-inner">

        <!-- Top ornament -->
        <div class="footer-ornament" #ornEl>
          <span class="orn-rule"></span>
          <span class="orn-gem">✦</span>
          <span class="orn-rule"></span>
        </div>

        <!-- Couple names headline -->
        <h2 class="footer-names" #namesEl>
          {{ settings.coupleNames || 'Her &amp; Him' }}
        </h2>

        @if (settings.weddingDate) {
          <p class="footer-date" #dateEl>
            {{ settings.weddingDate.toDate() | date: 'MMMM d, y' }}
          </p>
        }

        @if (settings.venue) {
          <p class="footer-venue" #venueEl>{{ settings.venue }}</p>
        }

        <!-- Divider -->
        <div class="footer-divider" aria-hidden="true"></div>

        <!-- Links -->
        <nav class="footer-nav" #navEl aria-label="Footer navigation">
          <ul>
            @if (settings.registryUrl) {
              <li>
                <a [href]="settings.registryUrl" target="_blank" rel="noopener" class="footer-link">
                  Registry
                </a>
              </li>
            }
            @if (settings.contactEmail) {
              <li>
                <a [href]="'mailto:' + settings.contactEmail" class="footer-link">
                  Contact Us
                </a>
              </li>
            }
            <li>
              <a href="#top" class="footer-link footer-link--top" (click)="scrollTop($event)">
                Back to Top ↑
              </a>
            </li>
          </ul>
        </nav>

        <!-- Bottom bar -->
        <div class="footer-bottom" #bottomEl>
          <p class="footer-credit">
            Made with <span class="heart">♥</span> for our special day
          </p>
          <p class="footer-copy">
            © {{ year }} {{ settings.coupleNames || 'Her &amp; Him' }}
          </p>
        </div>

      </div>

    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--color-warm-dark);
        position: relative;
        overflow: hidden;
        padding: 0;
      }

      /* Atmospheric gold glow at top */
      .footer-glow {
        position: absolute;
        top: -120px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 300px;
        background: radial-gradient(
          ellipse 70% 60% at 50% 0%,
          rgba(201, 168, 108, 0.07) 0%,
          transparent 70%
        );
        pointer-events: none;
      }

      /* Noise texture overlay */
      .footer::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        pointer-events: none;
        opacity: 0.4;
      }

      .footer-inner {
        position: relative;
        z-index: 1;
        max-width: 860px;
        margin: 0 auto;
        padding: 100px 32px 64px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* ── Ornament ── */
      .footer-ornament {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 48px;
        opacity: 0;
        transform: translateY(20px);
      }

      .orn-rule {
        display: block;
        width: 80px;
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(201, 168, 108, 0.35), transparent);
      }

      .orn-gem {
        color: var(--color-gold);
        font-size: 18px;
      }

      /* ── Names ── */
      .footer-names {
        font-family: var(--font-serif);
        font-size: clamp(48px, 10vw, 96px);
        font-weight: 700;
        color: white;
        letter-spacing: -0.02em;
        line-height: 1;
        margin: 0 0 18px;
        opacity: 0;
        transform: translateY(30px);
        text-shadow: 0 4px 40px rgba(0, 0, 0, 0.4);
      }

      /* ── Date ── */
      .footer-date {
        font-family: var(--font-serif);
        font-style: italic;
        font-size: clamp(16px, 2.5vw, 20px);
        color: var(--color-gold-soft);
        margin: 0 0 8px;
        letter-spacing: 0.04em;
        opacity: 0;
        transform: translateY(20px);
      }

      /* ── Venue ── */
      .footer-venue {
        font-size: 12px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.30);
        margin: 0 0 48px;
        opacity: 0;
      }

      /* ── Divider ── */
      .footer-divider {
        width: 1px;
        height: 64px;
        background: linear-gradient(
          to bottom,
          rgba(201, 168, 108, 0.35),
          transparent
        );
        margin-bottom: 48px;
      }

      /* ── Nav links ── */
      .footer-nav ul {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
        list-style: none;
        margin: 0 0 56px;
        padding: 0;
        opacity: 0;
        transform: translateY(20px);
      }

      .footer-link {
        display: block;
        padding: 10px 22px;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-full);
        transition: all 280ms var(--ease-smooth);
      }

      .footer-link:hover {
        color: var(--color-gold-soft);
        border-color: rgba(201, 168, 108, 0.35);
        background: rgba(201, 168, 108, 0.06);
      }

      .footer-link--top {
        color: var(--color-gold-dim);
        border-color: rgba(201, 168, 108, 0.2);
      }

      /* ── Bottom bar ── */
      .footer-bottom {
        opacity: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 32px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .footer-credit {
        font-style: italic;
        color: rgba(255, 255, 255, 0.28);
        font-size: 13px;
        margin: 0;
      }

      .heart { color: var(--color-gold); }

      .footer-copy {
        font-size: 11px;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.16);
        margin: 0;
      }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        .footer-inner { padding: 80px 20px 48px; }
        .orn-rule { width: 48px; }
        .footer-nav ul { gap: 6px; }
      }
    `,
  ],
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) settings!: WeddingSettings;

  @ViewChild('footerEl') footerEl!: ElementRef<HTMLElement>;

  readonly year = new Date().getFullYear();
  private ctx?: gsap.Context;

  scrollTop(e: Event) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    initGsap();
    this.initAnimations();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  private initAnimations() {
    const el = this.footerEl.nativeElement;

    this.ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      });

      tl.to('.footer-ornament', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('.footer-names',    { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out' }, '-=0.5')
        .to('.footer-date',     { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .to('.footer-venue',    { opacity: 1,        duration: 0.6 },                    '-=0.4')
        .to('.footer-nav ul',   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
        .to('.footer-bottom',   { opacity: 1,        duration: 0.6 },                    '-=0.3');

      // Subtle floating glow animation
      gsap.to('.footer-glow', {
        y: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);
  }
}
