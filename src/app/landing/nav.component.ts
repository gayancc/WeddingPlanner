import {
  Component,
  HostListener,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  inject,
} from '@angular/core';
import { initGsap, gsap } from '../core/utils/gsap';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  template: `
    <nav class="nav" [class.nav--scrolled]="scrolled()" [class.nav--open]="menuOpen()" #navEl>
      <a class="nav-brand" href="#top" (click)="closeMenu()">
        <svg class="brand-gem" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 2L4 9l8 13 8-13-8-7z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M4 9h16M8 9L12 2l4 7" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
        <span class="brand-name">{{ coupleNames || 'Our Wedding' }}</span>
      </a>

      <ul class="nav-links" #linksEl>
        @for (link of navLinks; track link.href) {
          <li>
            <a [href]="link.href" class="nav-link" (click)="closeMenu()">{{ link.label }}</a>
          </li>
        }
      </ul>

      <button
        class="nav-hamburger"
        [class.nav-hamburger--open]="menuOpen()"
        (click)="toggleMenu()"
        aria-label="Toggle menu"
        [attr.aria-expanded]="menuOpen()"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- Mobile drawer -->
    <div class="mobile-drawer" [class.mobile-drawer--open]="menuOpen()" #drawerEl>
      <ul class="drawer-links">
        @for (link of navLinks; track link.href) {
          <li>
            <a [href]="link.href" class="drawer-link" (click)="closeMenu()">
              <span class="drawer-num">0{{ $index + 1 }}</span>
              <span>{{ link.label }}</span>
            </a>
          </li>
        }
      </ul>
    </div>

    @if (menuOpen()) {
      <div class="drawer-backdrop" (click)="closeMenu()"></div>
    }
  `,
  styles: [
    `
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 40px;
        transition:
          background 350ms var(--ease-smooth),
          padding 350ms var(--ease-smooth),
          box-shadow 350ms var(--ease-smooth);
      }

      .nav--scrolled {
        background: rgba(247, 243, 238, 0.92);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        box-shadow: 0 1px 0 rgba(25, 37, 25, 0.08), 0 4px 24px rgba(25, 37, 25, 0.06);
        padding: 12px 40px;
      }

      .nav-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: white;
        transition: color 350ms var(--ease-smooth);
      }

      .nav--scrolled .nav-brand { color: var(--color-fg); }

      .brand-gem {
        color: var(--color-gold);
        flex-shrink: 0;
      }

      .brand-name {
        font-family: var(--font-serif);
        font-size: 18px;
        letter-spacing: 0.02em;
        white-space: nowrap;
      }

      .nav-links {
        display: flex;
        gap: 6px;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .nav-link {
        display: block;
        padding: 8px 14px;
        font-size: 13px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.85);
        border-radius: var(--radius-full);
        transition:
          color 200ms,
          background 200ms;
        position: relative;
      }

      .nav--scrolled .nav-link { color: var(--color-fg-soft); }

      .nav-link::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 14px;
        right: 14px;
        height: 1px;
        background: var(--color-gold);
        transform: scaleX(0);
        transform-origin: center;
        transition: transform 250ms var(--ease-smooth);
      }

      .nav-link:hover { color: var(--color-gold); }
      .nav-link:hover::after { transform: scaleX(1); }

      .nav-hamburger {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
      }

      .nav-hamburger span {
        display: block;
        width: 24px;
        height: 1.5px;
        background: white;
        border-radius: 2px;
        transform-origin: center;
        transition:
          transform 300ms var(--ease-smooth),
          opacity 200ms,
          background 350ms;
      }

      .nav--scrolled .nav-hamburger span { background: var(--color-fg); }

      .nav-hamburger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
      .nav-hamburger--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .nav-hamburger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

      /* Mobile drawer */
      .mobile-drawer {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(320px, 85vw);
        background: var(--color-fg);
        z-index: 99;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translateX(100%);
        transition: transform 400ms var(--ease-cinematic);
      }

      .mobile-drawer--open { transform: translateX(0); }

      .drawer-links {
        list-style: none;
        margin: 0;
        padding: 24px;
        width: 100%;
      }

      .drawer-link {
        display: flex;
        align-items: baseline;
        gap: 16px;
        padding: 20px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: white;
        font-family: var(--font-serif);
        font-size: 26px;
        transition: color 200ms;
      }

      .drawer-link:hover { color: var(--color-gold); }

      .drawer-num {
        font-family: var(--font-sans);
        font-size: 11px;
        letter-spacing: 0.1em;
        color: var(--color-gold);
        flex-shrink: 0;
      }

      .drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 98;
        backdrop-filter: blur(4px);
        animation: fade-in 300ms forwards;
      }

      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

      @media (max-width: 860px) {
        .nav { padding: 16px 24px; }
        .nav--scrolled { padding: 12px 24px; }
        .nav-links { display: none; }
        .nav-hamburger { display: flex; }
      }
    `,
  ],
})
export class LandingNavComponent implements AfterViewInit, OnDestroy {
  @Input() coupleNames = '';
  @ViewChild('navEl') navEl!: ElementRef<HTMLElement>;

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  readonly navLinks = [
    { href: '#story', label: 'Our Story' },
    { href: '#schedule', label: 'The Day' },
    { href: '#location', label: 'Location' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#faq', label: 'FAQ' },
  ];

  private ctx?: gsap.Context;

  ngAfterViewInit() {
    initGsap();
    this.ctx = gsap.context(() => {
      gsap.from('.nav-brand, .nav-link', {
        opacity: 0,
        y: -12,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
        delay: 1.2,
      });
    }, this.navEl.nativeElement);
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 60);
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
    document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
  }

  closeMenu() {
    this.menuOpen.set(false);
    document.body.style.overflow = '';
  }
}
