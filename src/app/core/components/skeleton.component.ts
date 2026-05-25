import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: '<div class="skeleton" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>',
  styles: [
    `
      .skeleton {
        display: block;
        background: linear-gradient(
          90deg,
          rgba(25, 37, 25, 0.06) 0%,
          rgba(25, 37, 25, 0.12) 50%,
          rgba(25, 37, 25, 0.06) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '4px';
}
