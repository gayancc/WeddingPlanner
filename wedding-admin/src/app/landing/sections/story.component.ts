import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChildren,
  QueryList,
  OnDestroy,
} from '@angular/core';

import { CoupleStory } from '../../core/models/invitation.model';

@Component({
  selector: 'app-landing-story',
  standalone: true,
  template: `
    @if (entries && entries.length > 0) {
      <section id="story" class="story">
        <div class="head">
          <div class="ornament">✦</div>
          <h2>Our Story</h2>
        </div>
        <div class="timeline">
          @for (s of sorted(); track s.id; let i = $index) {
            <div class="entry" #entry [class.left]="i % 2 === 0">
              @if (s.photoUrl) {
                <img class="photo" [src]="s.photoUrl" alt="" loading="lazy" />
              }
              <div class="body">
                <div class="chip">{{ s.date }}</div>
                <h3>{{ s.title }}</h3>
                <p>{{ s.description }}</p>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .story {
        padding: 96px 24px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .head { text-align: center; margin-bottom: 64px; }
      .ornament { color: var(--color-gold); font-size: 24px; margin-bottom: 12px; }
      h2 {
        font-family: var(--font-serif);
        font-size: clamp(32px, 6vw, 48px);
      }
      .timeline {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 48px;
      }
      .timeline::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--color-gold-soft);
        transform: translateX(-50%);
      }
      .entry {
        display: grid;
        grid-template-columns: 1fr 60px 1fr;
        gap: 24px;
        align-items: center;
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 700ms ease-out, transform 700ms ease-out;
      }
      .entry.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .entry .photo, .entry .body { grid-column: span 1; }
      .entry .body { grid-column: 3; }
      .entry .photo { grid-column: 1; }
      .entry.left .body { grid-column: 1; text-align: right; order: 1; }
      .entry.left .photo { grid-column: 3; order: 3; }
      .photo {
        width: 100%;
        max-width: 280px;
        height: 200px;
        object-fit: cover;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-card);
      }
      .body { padding: 12px 0; }
      .chip {
        display: inline-block;
        font-family: var(--font-serif);
        font-style: italic;
        color: var(--color-gold);
        font-size: 14px;
        margin-bottom: 8px;
      }
      h3 { font-family: var(--font-serif); font-size: 24px; margin-bottom: 8px; }
      p { color: var(--color-fg-soft); margin: 0; }
      @media (max-width: 720px) {
        .timeline::before { left: 16px; }
        .entry, .entry.left {
          grid-template-columns: 32px 1fr;
          text-align: left !important;
        }
        .entry .photo, .entry .body, .entry.left .photo, .entry.left .body {
          grid-column: 2 !important;
          order: 0 !important;
        }
        .photo { max-width: 100%; height: 180px; }
      }
    `,
  ],
})
export class StoryComponent implements AfterViewInit, OnDestroy {
  @Input() entries: CoupleStory[] = [];
  @ViewChildren('entry') items!: QueryList<ElementRef<HTMLElement>>;
  private observer?: IntersectionObserver;

  sorted(): CoupleStory[] {
    return [...this.entries].sort((a, b) => a.order - b.order);
  }

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      (rows) => {
        for (const r of rows) {
          if (r.isIntersecting) {
            r.target.classList.add('visible');
            this.observer?.unobserve(r.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    this.items.forEach((el) => this.observer!.observe(el.nativeElement));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
