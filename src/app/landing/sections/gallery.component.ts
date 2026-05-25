import { Component, HostListener, Input, signal } from '@angular/core';

@Component({
  selector: 'app-landing-gallery',
  standalone: true,
  template: `
    <section id="gallery" class="gallery">
      <div class="head">
        <div class="ornament">✦</div>
        <h2>Gallery</h2>
        <p class="sub">A few of our favorite moments</p>
      </div>

      @if (photos && photos.length > 0) {
        <div class="grid">
          @for (url of photos; track $index; let i = $index) {
            <button class="thumb" (click)="open(i)" [attr.aria-label]="'Open photo ' + (i + 1)">
              <img [src]="url" alt="" loading="lazy" />
            </button>
          }
        </div>
      } @else {
        <div class="empty">
          <p>Gallery coming soon.</p>
        </div>
      }

      @if (lightboxIdx() !== null) {
        <div class="lightbox" (click)="close()">
          <button class="close" (click)="close(); $event.stopPropagation()" aria-label="Close">×</button>
          <button class="nav left" (click)="prev(); $event.stopPropagation()" aria-label="Previous">‹</button>
          <img [src]="photos[lightboxIdx()!]" alt="" (click)="$event.stopPropagation()" />
          <button class="nav right" (click)="next(); $event.stopPropagation()" aria-label="Next">›</button>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .gallery { padding: 96px 24px; max-width: 1200px; margin: 0 auto; }
      .head { text-align: center; margin-bottom: 48px; }
      .ornament { color: var(--color-gold); font-size: 24px; margin-bottom: 12px; }
      h2 { font-family: var(--font-serif); font-size: clamp(32px, 6vw, 48px); margin-bottom: 8px; }
      .sub { color: var(--color-fg-soft); font-style: italic; margin: 0; }
      .grid {
        column-count: 3;
        column-gap: 12px;
      }
      .thumb {
        display: block;
        width: 100%;
        margin-bottom: 12px;
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;
        break-inside: avoid;
        overflow: hidden;
        border-radius: var(--radius-md);
      }
      .thumb img {
        width: 100%;
        height: auto;
        transition: transform 400ms;
      }
      .thumb:hover img { transform: scale(1.04); }
      .empty {
        background: var(--color-card);
        padding: 56px 24px;
        text-align: center;
        border-radius: var(--radius-lg);
        color: var(--color-fg-soft);
      }
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.92);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        animation: fade 200ms;
      }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      .lightbox img {
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
      }
      .close, .nav {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
      }
      .close { top: 18px; right: 18px; }
      .nav.left { left: 18px; top: 50%; transform: translateY(-50%); }
      .nav.right { right: 18px; top: 50%; transform: translateY(-50%); }
      @media (max-width: 900px) {
        .grid { column-count: 2; }
      }
      @media (max-width: 500px) {
        .grid { column-count: 1; }
      }
    `,
  ],
})
export class GalleryComponent {
  @Input() photos: string[] = [];
  readonly lightboxIdx = signal<number | null>(null);

  open(i: number) { this.lightboxIdx.set(i); }
  close() { this.lightboxIdx.set(null); }
  prev() {
    const i = this.lightboxIdx();
    if (i === null) return;
    this.lightboxIdx.set((i - 1 + this.photos.length) % this.photos.length);
  }
  next() {
    const i = this.lightboxIdx();
    if (i === null) return;
    this.lightboxIdx.set((i + 1) % this.photos.length);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.lightboxIdx() === null) return;
    if (e.key === 'Escape') this.close();
    else if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'ArrowRight') this.next();
  }
}
