import { Component, HostListener, Input, signal } from '@angular/core';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  template: `
    <nav class="nav" [class.scrolled]="scrolled()">
      <a class="brand" href="#top">
        <span class="ornament">✦</span>
        <span class="names">{{ coupleNames || 'Our Wedding' }}</span>
      </a>
      <ul class="links">
        <li><a href="#story">Our Story</a></li>
        <li><a href="#schedule">The Day</a></li>
        <li><a href="#location">Location</a></li>
        <li><a href="#gallery">Gallery</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
    </nav>
  `,
  styles: [
    `
      .nav {
        position: sticky;
        top: 0;
        z-index: 50;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 28px;
        background: transparent;
        transition: all 200ms;
      }
      .nav.scrolled {
        background: rgba(247, 243, 238, 0.94);
        backdrop-filter: blur(10px);
        box-shadow: 0 1px 0 var(--color-divider);
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--color-fg);
      }
      .ornament { color: var(--color-gold); font-size: 20px; }
      .names { font-family: var(--font-serif); font-size: 20px; }
      ul.links {
        display: flex;
        gap: 20px;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      ul.links a {
        font-size: 14px;
        color: var(--color-fg);
        transition: color 160ms;
      }
      ul.links a:hover { color: var(--color-gold); }
      @media (max-width: 720px) {
        ul.links { display: none; }
      }
    `,
  ],
})
export class LandingNavComponent {
  @Input() coupleNames = '';
  readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }
}
