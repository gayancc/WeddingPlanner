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
  NgZone,
} from '@angular/core';
import { initGsap, gsap } from '../core/utils/gsap';

const SECTIONS = [
  { id: 'story',    href: '#story',    label: 'Our Story' },
  { id: 'schedule', href: '#schedule', label: 'The Day' },
  { id: 'location', href: '#location', label: 'Location' },
  { id: 'gallery',  href: '#gallery',  label: 'Gallery' },
  { id: 'stay',     href: '#stay',     label: 'Stay' },
  { id: 'faq',      href: '#faq',      label: 'FAQ' },
];

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  template: `
    <!-- Scroll progress line at very top -->
    <div class="nav-progress" #progressEl aria-hidden="true"></div>

    <nav class="nav" [class.nav--scrolled]="scrolled()" [class.nav--open]="menuOpen()" #navEl>
      <a class="nav-brand" href="/" (click)="scrollTop($event); closeMenu()">
        <svg class="brand-icon" viewBox="0 0 32 20" width="28" height="18" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="22" cy="10" r="8" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        <span class="brand-name">{{ coupleNames || 'Her &amp; Him' }}</span>
      </a>

      <ul class="nav-links" #linksEl>
        @for (link of navLinks; track link.href) {
          <li>
            <a
              href="/"
              class="nav-link"
              [class.nav-link--active]="activeSection() === link.id"
              (click)="scrollTo(link.id, $event); closeMenu()"
            >
              {{ link.label }}
            </a>
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
            <a href="/" class="drawer-link" (click)="scrollTo(link.id, $event); closeMenu()">
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
  styles: [`
    /* ── Scroll progress bar ── */
    .nav-progress {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 2px;
      background: linear-gradient(to right, var(--lc-green), var(--lc-green-mid));
      transform-origin: left;
      transform: scaleX(0);
      z-index: 101;
      pointer-events: none;
    }

    /* ── Nav shell ── */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 40px;
      background: rgba(245, 242, 237, 0.88);
      backdrop-filter: blur(18px) saturate(160%);
      -webkit-backdrop-filter: blur(18px) saturate(160%);
      border-bottom: 1px solid transparent;
      transition:
        background 320ms var(--ease-smooth),
        border-color 320ms var(--ease-smooth),
        padding 320ms var(--ease-smooth),
        box-shadow 320ms var(--ease-smooth);
    }

    .nav--scrolled {
      background: rgba(245, 242, 237, 0.97);
      border-color: var(--lc-border);
      box-shadow: 0 1px 0 var(--lc-border), 0 4px 20px rgba(44,74,46,.06);
      padding: 10px 40px;
    }

    /* ── Brand ── */
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      color: var(--lc-green);
      transition: opacity 200ms;
    }
    .nav-brand:hover { opacity: 0.75; }

    .brand-icon { flex-shrink: 0; }

    .brand-name {
      font-family: var(--font-serif);
      font-size: 17px;
      font-weight: 600;
      letter-spacing: .01em;
      color: var(--lc-text);
      white-space: nowrap;
    }

    /* ── Desktop links ── */
    .nav-links {
      display: flex; gap: 4px; list-style: none; margin: 0; padding: 0;
    }

    .nav-link {
      display: block; padding: 7px 16px;
      font-size: 12.5px; letter-spacing: .06em;
      text-transform: uppercase;
      font-weight: 500;
      color: var(--lc-muted);
      border-radius: var(--radius-full);
      transition: color 200ms, background 200ms;
    }

    .nav-link:hover {
      color: var(--lc-green);
      background: var(--lc-green-soft);
    }

    .nav-link--active {
      background: var(--lc-green) !important;
      color: white !important;
    }

    /* ── Hamburger ── */
    .nav-hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; padding: 8px; cursor: pointer;
    }

    .nav-hamburger span {
      display: block; width: 24px; height: 1.5px;
      background: var(--lc-text); border-radius: 2px;
      transform-origin: center;
      transition: transform 300ms var(--ease-smooth), opacity 200ms;
    }

    .nav-hamburger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
    .nav-hamburger--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .nav-hamburger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

    /* ── Mobile drawer ── */
    .mobile-drawer {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(300px, 82vw);
      background: var(--lc-green);
      z-index: 99;
      display: flex; align-items: center; justify-content: center;
      transform: translateX(100%);
      transition: transform 380ms var(--ease-cinematic);
    }

    .mobile-drawer--open { transform: translateX(0); }

    .drawer-links {
      list-style: none; margin: 0; padding: 24px; width: 100%;
    }

    .drawer-link {
      display: flex; align-items: baseline; gap: 14px;
      padding: 18px 0;
      border-bottom: 1px solid rgba(255,255,255,.10);
      color: white; font-family: var(--font-serif);
      font-size: 24px; transition: color 200ms;
    }

    .drawer-link:hover { color: var(--lc-gold); }

    .drawer-num {
      font-family: var(--font-sans); font-size: 10px;
      letter-spacing: .12em; color: rgba(201,168,108,.7); flex-shrink: 0;
    }

    .drawer-backdrop {
      position: fixed; inset: 0;
      background: rgba(44,74,46,.35); z-index: 98;
      backdrop-filter: blur(4px);
      animation: fade-in 300ms forwards;
    }

    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

    @media (max-width: 860px) {
      .nav { padding: 14px 20px; }
      .nav--scrolled { padding: 10px 20px; }
      .nav-links { display: none; }
      .nav-hamburger { display: flex; }
    }
  `],
})
export class LandingNavComponent implements AfterViewInit, OnDestroy {
  @Input() coupleNames = '';

  @ViewChild('navEl')      navEl!:      ElementRef<HTMLElement>;
  @ViewChild('progressEl') progressEl!: ElementRef<HTMLElement>;

  readonly scrolled      = signal(false);
  readonly menuOpen      = signal(false);
  readonly activeSection = signal<string>('');

  readonly navLinks = SECTIONS;

  private ctx?: gsap.Context;
  private observer?: IntersectionObserver;
  private zone = inject(NgZone);

  ngAfterViewInit() {
    initGsap();
    this.ctx = gsap.context(() => {
      gsap.from(['.nav-brand', '.nav-link'], {
        opacity: 0, y: -10,
        duration: 0.6, stagger: 0.05,
        ease: 'power3.out', delay: 0.8,
      });
    }, this.navEl.nativeElement);

    this.updateProgress();
    this.initSectionObserver();
  }

  ngOnDestroy() {
    this.ctx?.revert();
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 50);
    this.updateProgress();
  }

  scrollTo(id: string, e: Event) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollTop(e: Event) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
    document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
  }

  closeMenu() {
    this.menuOpen.set(false);
    document.body.style.overflow = '';
  }

  private updateProgress() {
    const el = this.progressEl?.nativeElement;
    if (!el) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    el.style.transform = `scaleX(${progress})`;
  }

  private initSectionObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              if (id) this.zone.run(() => this.activeSection.set(id));
            }
          }
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );

      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el) this.observer!.observe(el);
      }
    });
  }
}
