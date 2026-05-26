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
  computed,
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
          <!-- Three-column parallax grid -->
          <div class="gallery-grid" #gridEl>
            @for (col of cols(); track $index; let ci = $index) {
              <div class="gallery-col" #colEl [attr.data-col]="ci">
                @for (url of col; track $index; let pi = $index) {
                  <button
                    class="gallery-item"
                    [class.gallery-item--rotated-pos]="(ci + pi) % 3 === 1"
                    [class.gallery-item--rotated-neg]="(ci + pi) % 3 === 2"
                    (click)="open(photoIndex(ci, pi))"
                    [attr.aria-label]="'View photo ' + (photoIndex(ci, pi) + 1)"
                  >
                    <div class="item-inner">
                      <img [src]="url" alt="" loading="lazy" class="item-img" />
                      <div class="item-overlay">
                        <div class="item-overlay-content">
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="13" stroke="white" stroke-width="1.2" opacity=".7"/>
                            <path d="M10 14h8M14 10v8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                          </svg>
                          <span>{{ photoIndex(ci, pi) + 1 }} / {{ photos.length }}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        } @else {
          <div class="gallery-empty" #emptyEl>
            <div class="empty-frame">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity=".3">
                <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="17" cy="20" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 32l10-8 7 6 6-5 13 9" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
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

          <button class="lb-nav lb-nav--prev"
            (click)="prev(); $event.stopPropagation()" aria-label="Previous photo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="lb-img-wrap" (click)="$event.stopPropagation()">
            <img [src]="photos[lightboxIdx()!]" alt="" class="lb-img" />
          </div>

          <button class="lb-nav lb-nav--next"
            (click)="next(); $event.stopPropagation()" aria-label="Next photo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="lb-counter">
            {{ (lightboxIdx() ?? 0) + 1 }} / {{ photos.length }}
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .gallery {
      padding: 120px 0 60px;
      background: var(--lc-bg, #F5F2ED);
      position: relative; overflow: hidden;
    }

    .gallery-inner {
      max-width: 1320px; margin: 0 auto; padding: 0 32px;
    }

    /* ── Header ── */
    .gallery-header {
      text-align: center; margin-bottom: 64px;
      opacity: 0; transform: translateY(30px);
    }

    .gallery-eyebrow {
      display: flex; align-items: center; justify-content: center;
      gap: 18px; font-size: 10px; letter-spacing: .30em;
      text-transform: uppercase; color: var(--lc-green-mid, #4A7C59); margin: 0 0 18px;
    }

    .eyebrow-rule { display: block; width: 36px; height: 1px; background: rgba(44,74,46,.25); }

    .gallery-title {
      font-family: var(--font-serif);
      font-size: clamp(40px, 7vw, 68px); font-weight: 600;
      color: var(--lc-text, #1C1C1C); letter-spacing: -.02em;
    }

    /* ── 3-column parallax grid ── */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: start;
    }

    .gallery-col {
      display: flex; flex-direction: column;
      gap: 16px;
      will-change: transform;
    }

    /* ── Gallery items ── */
    .gallery-item {
      background: none; border: none; padding: 0;
      cursor: pointer;
      border-radius: var(--radius-xl);
      overflow: hidden;
      opacity: 0;
      transform: scale(0.93);
      will-change: transform;
    }

    /* Editorial slight rotations — subtle depth */
    .gallery-item--rotated-pos { transform: scale(0.93) rotate(0.6deg); }
    .gallery-item--rotated-neg { transform: scale(0.93) rotate(-0.5deg); }

    .item-inner {
      position: relative; width: 100%; overflow: hidden;
      border-radius: inherit;
      aspect-ratio: 3 / 4;
    }

    /* Vary aspect ratio in middle column for visual interest */
    .gallery-col[data-col="1"] .item-inner:nth-child(even) {
      aspect-ratio: 4 / 3;
    }

    .item-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 700ms var(--ease-smooth);
      will-change: transform;
    }

    .gallery-item:hover .item-img { transform: scale(1.07); }

    .item-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        to top,
        rgba(44,74,46,.72) 0%,
        rgba(44,74,46,.14) 50%,
        transparent 100%
      );
      opacity: 0;
      transition: opacity 350ms var(--ease-smooth);
      display: flex; align-items: center; justify-content: center;
    }

    .gallery-item:hover .item-overlay { opacity: 1; }

    .item-overlay-content {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; color: white; font-size: 11px;
      letter-spacing: .14em; text-transform: uppercase;
      transform: translateY(10px);
      transition: transform 350ms var(--ease-smooth);
    }

    .gallery-item:hover .item-overlay-content { transform: translateY(0); }

    /* ── Empty state ── */
    .gallery-empty { display: flex; justify-content: center; opacity: 0; }

    .empty-frame {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      padding: 80px 48px;
      border: 1px solid var(--color-divider);
      border-radius: var(--radius-xl);
      color: var(--color-fg-soft);
    }

    .empty-frame p { margin: 0; font-style: italic; }

    /* ── Lightbox ── */
    .lightbox {
      position: fixed; inset: 0;
      background: rgba(12,10,8,.96);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      backdrop-filter: blur(12px);
      animation: lb-fade-in 280ms var(--ease-cinematic) forwards;
    }

    @keyframes lb-fade-in {
      from { opacity: 0; } to { opacity: 1; }
    }

    .lb-img-wrap {
      display: flex; align-items: center; justify-content: center;
      max-width: 88vw; max-height: 88vh;
      animation: lb-img-in 350ms var(--ease-cinematic) forwards;
    }

    @keyframes lb-img-in {
      from { opacity: 0; transform: scale(.94); }
      to   { opacity: 1; transform: scale(1); }
    }

    .lb-img {
      max-width: 88vw; max-height: 88vh;
      object-fit: contain; border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dark);
    }

    .lb-close {
      position: absolute; top: 20px; right: 20px;
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.15);
      color: white; display: flex; align-items: center;
      justify-content: center; cursor: pointer;
      transition: background 200ms, transform 200ms; z-index: 10;
    }

    .lb-close:hover { background: rgba(255,255,255,.15); transform: rotate(90deg); }

    .lb-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 52px; height: 52px; border-radius: 50%;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.12);
      color: white; display: flex; align-items: center;
      justify-content: center; cursor: pointer;
      transition: background 200ms, transform 200ms; z-index: 10;
    }

    .lb-nav:hover { background: rgba(255,255,255,.14); }
    .lb-nav--prev { left: 20px; }
    .lb-nav--prev:hover { transform: translateY(-50%) translateX(-3px); }
    .lb-nav--next { right: 20px; }
    .lb-nav--next:hover { transform: translateY(-50%) translateX(3px); }

    .lb-counter {
      position: absolute; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      font-size: 12px; letter-spacing: .18em;
      color: rgba(255,255,255,.45);
    }

    /* ── Responsive ── */
    @media (max-width: 860px) {
      .gallery-inner { padding: 0 16px; }
      .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .lb-nav--prev { left: 8px; } .lb-nav--next { right: 8px; }
    }

    @media (max-width: 540px) {
      .gallery-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    }
  `],
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  @Input() photos: string[] = [];

  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;
  @ViewChild('headerEl')  headerEl!:  ElementRef<HTMLElement>;
  @ViewChild('gridEl')    gridEl!:    ElementRef<HTMLElement>;
  @ViewChildren('colEl')  colEls!:    QueryList<ElementRef<HTMLElement>>;

  readonly lightboxIdx = signal<number | null>(null);

  // Distribute photos into 3 columns (first col starts higher for visual offset)
  readonly cols = computed(() => {
    const p = this.photos;
    return [
      p.filter((_, i) => i % 3 === 0),
      p.filter((_, i) => i % 3 === 1),
      p.filter((_, i) => i % 3 === 2),
    ];
  });

  // Map column+row index back to flat photos index for lightbox
  photoIndex(colIdx: number, rowIdx: number): number {
    return rowIdx * 3 + colIdx;
  }

  private ctx?: gsap.Context;

  open(i: number)  { this.lightboxIdx.set(Math.min(i, this.photos.length - 1)); }
  close()          { this.lightboxIdx.set(null); }

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
    if (e.key === 'Escape')          this.close();
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
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {

      // ── Header reveal ──
      ScrollTrigger.create({
        trigger: this.headerEl.nativeElement,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(this.headerEl.nativeElement, {
            opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
          });
        },
      });

      if (!this.photos || this.photos.length === 0) {
        ScrollTrigger.create({
          trigger: '.gallery-empty',
          start: 'top 82%',
          once: true,
          onEnter: () => { gsap.to('.gallery-empty', { opacity: 1, duration: 0.8 }); },
        });
        return;
      }

      // ── Items stagger reveal ──
      ScrollTrigger.create({
        trigger: this.gridEl.nativeElement,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to('.gallery-item', {
            opacity: 1, scale: 1, duration: 0.75,
            stagger: { amount: 0.7, from: 'start', grid: 'auto' },
            ease: 'power3.out',
          });
        },
      });

      if (prefersReduced) return;

      // ── 3-column parallax at different speeds ──
      // Column 0: slowest (drifts up less)
      // Column 1: neutral
      // Column 2: fastest (drifts up most)
      const parallaxSpeeds = [-6, -12, -18];

      this.colEls.forEach((col, i) => {
        gsap.to(col.nativeElement, {
          yPercent: parallaxSpeeds[i] ?? -12,
          ease: 'none',
          scrollTrigger: {
            trigger: this.gridEl.nativeElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });

    }, el);
  }
}
