import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';
import { Title, Meta } from '@angular/platform-browser';

import { SettingsService } from '../core/services/settings.service';
import { EventService } from '../core/services/event.service';
import { WeddingSettings } from '../core/models/invitation.model';
import { SkeletonComponent } from '../core/components/skeleton.component';

import { AmbientComponent } from './ambient/ambient.component';
import { LandingNavComponent } from './nav.component';
import { HeroComponent } from './sections/hero.component';
import { StoryComponent } from './sections/story.component';
import { ScheduleComponent } from './sections/schedule.component';
import { LocationComponent } from './sections/location.component';
import { GalleryComponent } from './sections/gallery.component';
import { AccommodationComponent } from './sections/accommodation.component';
import { FaqComponent } from './sections/faq.component';
import { FooterComponent } from './sections/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    AmbientComponent,
    LandingNavComponent,
    HeroComponent,
    StoryComponent,
    ScheduleComponent,
    LocationComponent,
    GalleryComponent,
    AccommodationComponent,
    FaqComponent,
    FooterComponent,
    SkeletonComponent,
  ],
  template: `
    <!-- Global ambient atmosphere — always present -->
    <app-ambient />

    <app-landing-nav [coupleNames]="effective().coupleNames" />

    @if (loaded()) {
      <app-landing-hero [settings]="effective()" />
      @if (effective().story.length > 0) {
        <app-landing-story [entries]="effective().story" />
      }
      <app-landing-schedule [events]="events()" />
      <app-landing-location [settings]="effective()" />
      <app-landing-gallery [photos]="effective().galleryPhotoUrls" />
      <app-landing-accommodation [items]="effective().accommodation" />
      <app-landing-faq [items]="effective().faq" [dressCode]="effective().dressCode" />
      <app-landing-footer [settings]="effective()" />
    } @else {
      <div class="placeholder">
        <app-skeleton height="100vh" radius="0" />
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        background: var(--color-bg);
      }
      .placeholder { min-height: 100vh; }
    `,
  ],
})
export class LandingComponent {
  private settingsSvc = inject(SettingsService);
  private eventSvc    = inject(EventService);
  private titleSvc    = inject(Title);
  private metaSvc     = inject(Meta);

  readonly settings = toSignal(this.settingsSvc.get(), { initialValue: undefined });
  readonly events   = toSignal(this.eventSvc.listEvents(), { initialValue: [] });

  readonly loaded = computed(() => this.settings() !== undefined || true);

  // Merge Firestore data with fallback so missing fields always have defaults.
  // Without this, a partial doc (e.g. only "The Day" saved) returns undefined
  // for coupleNames, venue, story, etc., overriding the sensible defaults.
  readonly effective = computed<WeddingSettings>(() => {
    const s = this.settings();
    return s ? { ...this.fallback(), ...s } : this.fallback();
  });

  constructor() {
    effect(() => {
      const s = this.effective();
      const names = s.coupleNames || 'Her & Him';
      const pageTitle = `${names} — Wedding`;
      this.titleSvc.setTitle(pageTitle);
      this.metaSvc.updateTag({ name: 'description', content: `You're invited to ${names}'s wedding. RSVP via your personal invitation link.` });
      this.metaSvc.updateTag({ property: 'og:title', content: pageTitle });
      this.metaSvc.updateTag({ property: 'og:description', content: `Join us to celebrate ${names}.` });
    });
  }

  private fallback(): WeddingSettings {
    const now     = new Date();
    const wedding = new Date(now.getFullYear() + 1, 8, 13);
    const rsvp    = new Date(now.getFullYear() + 1, 7, 1);
    return {
      coupleNames:     'Her & Him',
      person1Name:     '',
      person2Name:     '',
      weddingDate:     Timestamp.fromDate(wedding),
      rsvpDeadline:    Timestamp.fromDate(rsvp),
      ceremonyTime:    '4:00 PM',
      receptionTime:   '6:00 PM',
      venue:           'Venue TBD',
      venueAddress:    '',
      websiteUrl:      '',
      story:           [],
      faq:             [],
      accommodation:   [],
      galleryPhotoUrls:[],
    };
  }
}
