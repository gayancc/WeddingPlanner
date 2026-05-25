import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import emailjs from '@emailjs/browser';

import { SettingsService } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AccommodationItem,
  CoupleStory,
  FaqItem,
  WeddingSettings,
} from '../../core/models/invitation.model';
import { SkeletonComponent } from '../../core/components/skeleton.component';
import { environment } from '../../../environments/environment';

interface SettingsForm {
  person1Name: string;
  person2Name: string;
  coupleNames: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  rsvpDeadline: string;
  dressCode: string;
  venue: string;
  venueAddress: string;
  venueMapsUrl: string;
  heroPhotoUrl: string;
  registryUrl: string;
  websiteUrl: string;
  contactEmail: string;
  parkingInfo: string;
  nearestAirport: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  story: CoupleStory[];
  faq: FaqItem[];
  accommodation: AccommodationItem[];
  galleryPhotoUrls: string[];
}

type SectionKey = 'couple' | 'day' | 'venue' | 'website' | 'email' | 'story' | 'faq' | 'accommodation' | 'gallery';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <header class="topbar">
      <div>
        <h1>Settings</h1>
        <p class="sub">All the details that power your wedding website.</p>
      </div>
    </header>

    @if (loaded()) {
      <!-- Couple -->
      <section class="card">
        <header class="card-head">
          <h2>The Couple</h2>
          @if (savedKey() === 'couple') { <span class="saved">Saved ✓</span> }
        </header>
        <div class="grid-3">
          <label>Person 1 name <input type="text" [(ngModel)]="form.person1Name" (blur)="save('couple')" /></label>
          <label>Person 2 name <input type="text" [(ngModel)]="form.person2Name" (blur)="save('couple')" /></label>
          <label>Combined display <input type="text" [(ngModel)]="form.coupleNames" (blur)="save('couple')" placeholder="Her & Him" /></label>
        </div>
      </section>

      <!-- The Day -->
      <section class="card">
        <header class="card-head">
          <h2>The Day</h2>
          @if (savedKey() === 'day') { <span class="saved">Saved ✓</span> }
        </header>
        <div class="grid-2">
          <label>Wedding date <input type="date" [(ngModel)]="form.weddingDate" (blur)="save('day')" /></label>
          <label>RSVP deadline <input type="date" [(ngModel)]="form.rsvpDeadline" (blur)="save('day')" /></label>
          <label>Ceremony time <input type="text" [(ngModel)]="form.ceremonyTime" (blur)="save('day')" placeholder="4:00 PM" /></label>
          <label>Reception time <input type="text" [(ngModel)]="form.receptionTime" (blur)="save('day')" placeholder="6:00 PM" /></label>
        </div>
        <label>Dress code <input type="text" [(ngModel)]="form.dressCode" (blur)="save('day')" placeholder="Black tie optional" /></label>
      </section>

      <!-- Venue -->
      <section class="card">
        <header class="card-head">
          <h2>Venue</h2>
          @if (savedKey() === 'venue') { <span class="saved">Saved ✓</span> }
        </header>
        <label>Venue name <input type="text" [(ngModel)]="form.venue" (blur)="save('venue')" /></label>
        <label>Full address <input type="text" [(ngModel)]="form.venueAddress" (blur)="save('venue')" /></label>
        <label>Google Maps URL <input type="url" [(ngModel)]="form.venueMapsUrl" (blur)="save('venue')" placeholder="https://www.google.com/maps/embed?..." /></label>
        <div class="grid-2">
          <label>Parking info <input type="text" [(ngModel)]="form.parkingInfo" (blur)="save('venue')" placeholder="Free on-site parking" /></label>
          <label>Nearest airport <input type="text" [(ngModel)]="form.nearestAirport" (blur)="save('venue')" /></label>
        </div>
      </section>

      <!-- Website -->
      <section class="card">
        <header class="card-head">
          <h2>Website</h2>
          @if (savedKey() === 'website') { <span class="saved">Saved ✓</span> }
        </header>
        <label>Hero photo URL <input type="url" [(ngModel)]="form.heroPhotoUrl" (blur)="save('website')" /></label>
        @if (form.heroPhotoUrl) {
          <img class="preview" [src]="form.heroPhotoUrl" alt="hero preview" />
        }
        <div class="grid-2">
          <label>Registry URL <input type="url" [(ngModel)]="form.registryUrl" (blur)="save('website')" /></label>
          <label>Website URL <input type="url" [(ngModel)]="form.websiteUrl" (blur)="save('website')" placeholder="https://...firebaseapp.com" /></label>
        </div>
        <label>Contact email <input type="email" [(ngModel)]="form.contactEmail" (blur)="save('website')" /></label>
      </section>

      <!-- Email -->
      <section class="card">
        <header class="card-head">
          <h2>Email (EmailJS)</h2>
          @if (savedKey() === 'email') { <span class="saved">Saved ✓</span> }
        </header>
        <p class="hint">Leave blank to use values from environment.ts. <a href="https://www.emailjs.com/docs/" target="_blank" rel="noopener">EmailJS docs ↗</a></p>
        <div class="grid-3">
          <label>Service ID <input type="text" [(ngModel)]="form.emailjsServiceId" (blur)="save('email')" /></label>
          <label>Template ID <input type="text" [(ngModel)]="form.emailjsTemplateId" (blur)="save('email')" /></label>
          <label>Public key <input type="text" [(ngModel)]="form.emailjsPublicKey" (blur)="save('email')" /></label>
        </div>
        <button class="ghost" (click)="sendTestEmail()" [disabled]="testing()">
          {{ testing() ? 'Sending…' : 'Send test email to ' + (auth.user()?.email ?? 'yourself') }}
        </button>
      </section>

      <!-- Story -->
      <section class="card">
        <header class="card-head">
          <h2>Our Story</h2>
          <button class="link" (click)="addStory()">+ Add entry</button>
        </header>
        @if (form.story.length === 0) {
          <p class="muted">Tell visitors a few moments from your story.</p>
        }
        @for (s of form.story; track s.id; let i = $index) {
          <div class="row">
            <input type="text" placeholder="Date (e.g. June 2019)" [(ngModel)]="s.date" (blur)="save('story')" />
            <input type="text" placeholder="Title" [(ngModel)]="s.title" (blur)="save('story')" />
            <input type="text" placeholder="Description" [(ngModel)]="s.description" (blur)="save('story')" />
            <input type="url" placeholder="Photo URL (optional)" [(ngModel)]="s.photoUrl" (blur)="save('story')" />
            <button class="link danger" (click)="removeStory(i)">×</button>
          </div>
        }
      </section>

      <!-- FAQ -->
      <section class="card">
        <header class="card-head">
          <h2>FAQ</h2>
          <button class="link" (click)="addFaq()">+ Add Q&amp;A</button>
        </header>
        @for (f of form.faq; track $index; let i = $index) {
          <div class="row">
            <input type="text" placeholder="Question" [(ngModel)]="f.question" (blur)="save('faq')" />
            <input type="text" placeholder="Answer" [(ngModel)]="f.answer" (blur)="save('faq')" />
            <button class="link danger" (click)="removeFaq(i)">×</button>
          </div>
        }
      </section>

      <!-- Accommodation -->
      <section class="card">
        <header class="card-head">
          <h2>Accommodation</h2>
          <button class="link" (click)="addAcc()">+ Add hotel</button>
        </header>
        @for (a of form.accommodation; track $index; let i = $index) {
          <div class="row">
            <input type="text" placeholder="Name" [(ngModel)]="a.name" (blur)="save('accommodation')" />
            <input type="text" placeholder="Address" [(ngModel)]="a.address" (blur)="save('accommodation')" />
            <input type="text" placeholder="Distance" [(ngModel)]="a.distance" (blur)="save('accommodation')" />
            <input type="text" placeholder="Phone" [(ngModel)]="a.phone" (blur)="save('accommodation')" />
            <input type="text" placeholder="Price range" [(ngModel)]="a.priceRange" (blur)="save('accommodation')" />
            <input type="url" placeholder="Booking URL" [(ngModel)]="a.bookingUrl" (blur)="save('accommodation')" />
            <button class="link danger" (click)="removeAcc(i)">×</button>
          </div>
        }
      </section>

      <!-- Gallery -->
      <section class="card">
        <header class="card-head">
          <h2>Gallery photos</h2>
          <button class="link" (click)="addPhoto()">+ Add photo URL</button>
        </header>
        @if (form.galleryPhotoUrls.length === 0) {
          <p class="muted">Add image URLs to populate the public gallery section.</p>
        }
        @for (url of form.galleryPhotoUrls; track $index; let i = $index) {
          <div class="row">
            <input type="url" [ngModel]="url" (ngModelChange)="updatePhoto(i, $event)" (blur)="save('gallery')" placeholder="https://..." />
            @if (url) { <img class="thumb" [src]="url" alt="" /> }
            <button class="link danger" (click)="removePhoto(i)">×</button>
          </div>
        }
      </section>
    } @else {
      <app-skeleton height="120px" radius="14px" />
    }
  `,
  styles: [
    `
      :host { display: block; max-width: 900px; }
      h1 { font-family: var(--font-serif); font-size: 32px; margin-bottom: 4px; }
      .sub { color: var(--color-fg-soft); margin: 0 0 28px; }
      .card {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 24px 28px;
        margin-bottom: 18px;
        box-shadow: var(--shadow-card);
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }
      h2 { font-family: var(--font-serif); font-size: 22px; }
      .saved {
        font-size: 12px;
        color: var(--color-success);
        font-weight: 500;
        animation: pop 200ms ease-out;
      }
      @keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

      label {
        display: block;
        margin-bottom: 14px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-soft);
      }
      input, select, textarea {
        display: block;
        width: 100%;
        margin-top: 6px;
        padding: 10px 12px;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        background: var(--color-bg);
        font-size: 14px;
        color: var(--color-fg);
        text-transform: none;
        letter-spacing: 0;
      }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
      .preview {
        max-width: 240px;
        max-height: 160px;
        object-fit: cover;
        border-radius: var(--radius-md);
        margin-bottom: 14px;
        border: 1px solid var(--color-divider);
      }
      .hint { font-size: 13px; color: var(--color-fg-soft); margin-bottom: 14px; }
      .hint a { color: var(--color-gold); text-decoration: underline; }
      .muted { color: var(--color-fg-soft); font-size: 13px; margin-bottom: 12px; }
      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) 36px;
        gap: 8px;
        margin-bottom: 10px;
        align-items: center;
      }
      .row input { margin: 0; }
      .thumb {
        width: 80px;
        height: 60px;
        object-fit: cover;
        border-radius: var(--radius-sm);
      }
      .ghost {
        background: var(--color-card);
        color: var(--color-fg);
        border: 1px solid var(--color-divider);
        padding: 10px 16px;
        border-radius: var(--radius-md);
        font-size: 13px;
      }
      .ghost:disabled { opacity: 0.5; cursor: not-allowed; }
      .link {
        background: transparent;
        border: none;
        color: var(--color-gold);
        font-size: 13px;
        font-weight: 500;
      }
      .link.danger { color: var(--color-error); }
      @media (max-width: 700px) {
        .grid-2, .grid-3 { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class SettingsComponent {
  private svc = inject(SettingsService);
  readonly auth = inject(AuthService);
  private notify = inject(NotificationService);

  readonly loaded = signal(false);
  readonly savedKey = signal<SectionKey | null>(null);
  readonly testing = signal(false);

  form: SettingsForm = this.emptyForm();

  private destroyRef = inject(DestroyRef);
  // Prevents re-initializing the form after the user has started editing
  private formInitialized = false;

  constructor() {
    // Subscribe directly to the Firestore observable so the first real emission
    // (not a synchronous initialValue) populates the form exactly once.
    this.svc.get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => {
        if (this.formInitialized) return;
        this.form = this.fromRemote(s);
        this.loaded.set(true);
        this.formInitialized = true;
      });
  }

  async save(section: SectionKey) {
    try {
      const payload = this.toRemotePartial(section);
      await this.svc.update(payload);
      this.savedKey.set(section);
      setTimeout(() => {
        if (this.savedKey() === section) this.savedKey.set(null);
      }, 2000);
    } catch (e: unknown) {
      this.notify.error('Save failed');
    }
  }

  addStory() {
    this.form.story = [
      ...this.form.story,
      { id: crypto.randomUUID(), date: '', title: '', description: '', order: this.form.story.length },
    ];
    this.save('story');
  }
  removeStory(i: number) {
    this.form.story = this.form.story.filter((_, idx) => idx !== i);
    this.save('story');
  }
  addFaq() {
    this.form.faq = [...this.form.faq, { question: '', answer: '' }];
    this.save('faq');
  }
  removeFaq(i: number) {
    this.form.faq = this.form.faq.filter((_, idx) => idx !== i);
    this.save('faq');
  }
  addAcc() {
    this.form.accommodation = [...this.form.accommodation, { name: '', address: '', distance: '' }];
    this.save('accommodation');
  }
  removeAcc(i: number) {
    this.form.accommodation = this.form.accommodation.filter((_, idx) => idx !== i);
    this.save('accommodation');
  }
  addPhoto() {
    this.form.galleryPhotoUrls = [...this.form.galleryPhotoUrls, ''];
  }
  updatePhoto(i: number, val: string) {
    this.form.galleryPhotoUrls = this.form.galleryPhotoUrls.map((u, idx) => (idx === i ? val : u));
  }
  removePhoto(i: number) {
    this.form.galleryPhotoUrls = this.form.galleryPhotoUrls.filter((_, idx) => idx !== i);
    this.save('gallery');
  }

  async sendTestEmail() {
    const to = this.auth.user()?.email;
    if (!to) {
      this.notify.error('No admin email available');
      return;
    }
    this.testing.set(true);
    try {
      await emailjs.send(
        this.form.emailjsServiceId || environment.emailjs.serviceId,
        this.form.emailjsTemplateId || environment.emailjs.templateId,
        {
          to_email: to,
          to_name: 'Wedding Admin',
          invite_url: this.form.websiteUrl,
          qr_code: '',
          wedding_label: 'Test invitation',
          couple_names: this.form.coupleNames,
          wedding_date: this.form.weddingDate,
        },
        { publicKey: this.form.emailjsPublicKey || environment.emailjs.publicKey },
      );
      this.notify.success(`Test email sent to ${to}`);
    } catch (e: unknown) {
      this.notify.error(e instanceof Error ? e.message : 'Test failed');
    } finally {
      this.testing.set(false);
    }
  }

  private emptyForm(): SettingsForm {
    return {
      person1Name: '', person2Name: '', coupleNames: '',
      weddingDate: '', ceremonyTime: '', receptionTime: '', rsvpDeadline: '',
      dressCode: '', venue: '', venueAddress: '', venueMapsUrl: '',
      heroPhotoUrl: '', registryUrl: '', websiteUrl: '', contactEmail: '',
      parkingInfo: '', nearestAirport: '',
      emailjsServiceId: '', emailjsTemplateId: '', emailjsPublicKey: '',
      story: [], faq: [], accommodation: [], galleryPhotoUrls: [],
    };
  }

  private fromRemote(s: WeddingSettings | undefined): SettingsForm {
    if (!s) return this.emptyForm();
    const dateStr = (t?: Timestamp) => (t ? t.toDate().toISOString().slice(0, 10) : '');
    return {
      person1Name: s.person1Name ?? '',
      person2Name: s.person2Name ?? '',
      coupleNames: s.coupleNames ?? '',
      weddingDate: dateStr(s.weddingDate),
      ceremonyTime: s.ceremonyTime ?? '',
      receptionTime: s.receptionTime ?? '',
      rsvpDeadline: dateStr(s.rsvpDeadline),
      dressCode: s.dressCode ?? '',
      venue: s.venue ?? '',
      venueAddress: s.venueAddress ?? '',
      venueMapsUrl: s.venueMapsUrl ?? '',
      heroPhotoUrl: s.heroPhotoUrl ?? '',
      registryUrl: s.registryUrl ?? '',
      websiteUrl: s.websiteUrl ?? '',
      contactEmail: s.contactEmail ?? '',
      parkingInfo: s.parkingInfo ?? '',
      nearestAirport: s.nearestAirport ?? '',
      emailjsServiceId: s.emailjsServiceId ?? '',
      emailjsTemplateId: s.emailjsTemplateId ?? '',
      emailjsPublicKey: s.emailjsPublicKey ?? '',
      story: s.story ?? [],
      faq: s.faq ?? [],
      accommodation: s.accommodation ?? [],
      galleryPhotoUrls: s.galleryPhotoUrls ?? [],
    };
  }

  private toRemotePartial(section: SectionKey): Partial<WeddingSettings> {
    const f = this.form;
    const toTs = (s: string) => (s ? Timestamp.fromDate(new Date(s)) : undefined);
    switch (section) {
      case 'couple':
        return { person1Name: f.person1Name, person2Name: f.person2Name, coupleNames: f.coupleNames };
      case 'day':
        return {
          weddingDate: toTs(f.weddingDate)!,
          rsvpDeadline: toTs(f.rsvpDeadline)!,
          ceremonyTime: f.ceremonyTime,
          receptionTime: f.receptionTime,
          dressCode: f.dressCode,
        };
      case 'venue':
        return {
          venue: f.venue,
          venueAddress: f.venueAddress,
          venueMapsUrl: f.venueMapsUrl,
          parkingInfo: f.parkingInfo,
          nearestAirport: f.nearestAirport,
        };
      case 'website':
        return {
          heroPhotoUrl: f.heroPhotoUrl,
          registryUrl: f.registryUrl,
          websiteUrl: f.websiteUrl,
          contactEmail: f.contactEmail,
        };
      case 'email':
        return {
          emailjsServiceId: f.emailjsServiceId,
          emailjsTemplateId: f.emailjsTemplateId,
          emailjsPublicKey: f.emailjsPublicKey,
        };
      case 'story': return { story: f.story };
      case 'faq': return { faq: f.faq };
      case 'accommodation': return { accommodation: f.accommodation };
      case 'gallery': return { galleryPhotoUrls: f.galleryPhotoUrls };
    }
  }
}
