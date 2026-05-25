import {
  Component,
  HostListener,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
} from '@angular/core';
import { initGsap, gsap, ScrollTrigger } from '../../core/utils/gsap';

@Component({
  selector: 'app-landing-gallery',
  standalone: true,
  template: `
    <section id="gallery" class="gallery" #sectionEl>
      <div class="gallery-inner">

        <!-- Header -->
        <div class="gallery-header" #headerEl>
          <p class="gallery-eyebrow">
            <span class="eyebrow-rule"></span>
            <span>Captured Moments</span>
            <span class="eyebrow-rule"></span>
          </p>
          <h2 class="gallery-title">Our Gallery</h2>
        </div>

        @if (photos && photos.length > 0) {
          <div class="gallery-grid">
            @for (url of photos; track $index; let i = $index) {
              <button
                class="gallery-item"
                #item
                [class.gallery-item--wide]="isWide(i)"
                [class.gallery-item--tall]="isTall(i)"
                (click)="open(i)"
                [attr.aria-label]="'View photo ' + (i + 1)"
              >
                <div class="item-inner">
                  <img [src]="url" alt="" loading="lazy" class="item-img" />
                  <div class="item-overlay">
                    <div class="item-overlay-content">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="13" stroke="white" stroke-width="1.2" opacity="0.7"/>
                        <path d="M10 14h8M14 10v8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                      <span>{{ i + 1 }} / {{ photos.length }}</span>
                    </div>
                  </div>
                </div>
              </button>
            }
          </div>
        } @else {
          <div class="gallery-empty" #emptyEl>
            <div class="empty-frame">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
                <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="17" cy="20" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 32l10-8 7 6 6-5 13 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>Gallery coming soon</p>
            </div>
          </div>
        }

      </div>

      <!-- Premium Lightbox -->
      @if (lightboxIdx() !== null) {
        <div
          class="lightbox"
          #lightboxEl
          (click)="close()"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="'Photo ' + ((lightboxIdx() ?? 0) + 1) + ' of ' + photos.length"
        >
          <button class="lb-close" (click)="close(); $event.stopPropagation()" aria-label="Close lightbox">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <button class="lb-nav lb-nav--prev" (click)="prev(); $event.stopPropagation()" aria-label="Previous photo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="lb-img-wrap" (click)="$event.stopPropagation()">
            <img
              [src]="photos[lightboxIdx()!]"
              alt=""
              class="lb-img"
            />
          </div>

          <button class="lb-nav lb-nav--next" (click)="next(); $event.stopPropagation()" aria-label="Next photo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="lb-counter">
            {{ (lightboxIdx() ?? 0) + 1 }} / {{ photos.length }}
          </div>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .gallery {
        padding: 120px 0 140px;
        background: var(--color-bg);
        position: relative;
        overflow: hidden;
      }

      .gallery-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 32px;
      }

      /* ── Header ── */
      .gallery-header {
        text-align: center;
        margin-bottom: 64px;
        opacity: 0;
        transform: translateY(30px);
      }

      .gallery-eyebrow {
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

      .gallery-title {
        font-family: var(--font-serif);
        font-size: clamp(42px, 7vw, 72px);
        font-weight: 700;
        color: var(--color-fg);
        letter-spacing: -0.02em;
      }

      /* ── Bento Grid ── */
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: 280px;
        gap: 14px;
      }

      .gallery-item {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        border-radius: var(--radius-xl);
        overflow: hidden;
        opacity: 0;
        transform: scale(0.95);
      }

      /* Bento sizing */
      .gallery-item--wide { grid-column: span 2; }
      .gallery-item--tall { grid-row: span 2; }
      .gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }

      .item-inner {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: inherit;
      }

      .item-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 600ms var(--ease-smooth);
        will-change: transform;
      }

      .gallery-item:hover .item-img { transform: scale(1.07); }

      .item-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(25, 37, 25, 0.65) 0%,
          rgba(25, 37, 25, 0.10) 50%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 350ms var(--ease-smooth);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .gallery-item:hover .item-overlay { opacity: 1; }

      .item-overlay-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: white;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        transform: translateY(10px);
        transition: transform 350ms var(--ease-smooth);
      }

      .gallery-item:hover .item-overlay-content { transform: translateY(0); }

      /* ── Empty state ── */
      .gallery-empty {
        display: flex;
        justify-content: center;
        opacity: 0;
      }

      .empty-frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 80px 48px;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-xl);
        color: var(--color-fg-soft);
      }

      .empty-frame p { margin: 0; font-style: italic; }

      /* ── Lightbox ── */
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(12, 10, 8, 0.96);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        backdrop-filter: blur(12px);
        animation: lb-fade-in 280ms var(--ease-cinematic) forwards;
      }

      @keyframes lb-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      .lb-img-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 88vw;
        max-height: 88vh;
        animation: lb-img-in 350ms var(--ease-cinematic) forwards;
      }

      @keyframes lb-img-in {
        from { opacity: 0; transform: scale(0.94); }
        to   { opacity: 1; transform: scale(1); }
      }

      .lb-img {
        max-width: 88vw;
        max-height: 88vh;
        object-fit: contain;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-dark);
      }

      .lb-close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 200ms, transform 200ms;
        z-index: 10;
      }

      .lb-close:hover { background: rgba(255, 255, 255, 0.15); transform: rotate(90deg); }

      .lb-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 200ms, transform 200ms;
        z-index: 10;
      }

      .lb-nav:hover { background: rgba(255, 255, 255, 0.14); }
      .lb-nav--prev { left: 20px; }
      .lb-nav--prev:hover { transform: translateY(-50%) translateX(-3px); }
      .lb-nav--next { right: 20px; }
      .lb-nav--next:hover { transform: translateY(-50%) translateX(3px); }

      .lb-counter {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        letter-spacing: 0.18em;
        color: rgba(255, 255, 255, 0.45);
      }

      /* ── Responsive ── */
      @media (max-width: 860px) {
        .gallery-inner { padding: 0 16px; }
        .gallery-grid {
          grid-template-columns: repeat(2, 1fr);
          grid-auto-rows: 220px;
        }
        .gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 1; }
        .gallery-item--wide { grid-column: span 2; }
        .gallery-item--tall { grid-row: span 1; }
        .lb-nav--prev { left: 8px; }
        .lb-nav--next { right: 8px; }
      }

      @media (max-width: 540px) {
        .gallery-grid {
          grid-template-columns: 1fr 1fr;
          grid-auto-rows: 160px;
          gap: 8px;
        }
        .gallery-item:nth-child(1) { grid-column: span 2; }
      }
    `,
  ],
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  @Input() photos: string[] = [];

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChild('headerEl')  headerEl!:  ElementRef<HTMLElement>;
  @ViewChildren('item')   itemEls!:   QueryList<ElementRef<HTMLElement>>;

  readonly lightboxIdx = signal<number | null>(null);

  private ctx?: gsap.Context;

  isWide(i: number): boolean {
    // Items 4, 7 are wide (2-col span) for bento variety
    return i === 4 || i === 7;
  }

  isTall(i: number): boolean {
    // Item 2 is tall for layout variety
    return i === 2;
  }

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
    if (e.key === 'Escape')     this.close();
    else if (e.key === 'ArrowLeft')  this.prev();
    else if (e.key === 'ArrowRight') this.next();
  }

  ngAfterViewInit() {
    initGsap();
    this.initAnimations();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }

  private initAnimations() {
    const el = this.sectionEl.nativeElement;

    this.ctx = gsap.context(() => {
      // Header reveal
      ScrollTrigger.create({
        trigger: '.gallery-header',
        start: 'top 82%',
        onEnter: () => {
          gsap.to('.gallery-header', {
            opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
          });
        },
        once: true,
      });

      // Gallery items stagger reveal (only when photos exist)
      if (this.photos && this.photos.length > 0) {
        ScrollTrigger.create({
          trigger: '.gallery-grid',
          start: 'top 80%',
          onEnter: () => {
            gsap.to('.gallery-item', {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: { amount: 0.6, from: 'start' },
              ease: 'power3.out',
            });
          },
          once: true,
        });
      }

      // Empty state reveal
      ScrollTrigger.create({
        trigger: '.gallery-empty',
        start: 'top 82%',
        onEnter: () => {
          gsap.to('.gallery-empty', { opacity: 1, duration: 0.8 });
        },
        once: true,
      });
    }, el);
  }
}
