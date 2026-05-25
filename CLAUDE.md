# Wedding Admin — Claude Code Project

## WHY
A full-stack wedding management platform for a couple to manage invitations, RSVPs, and guest information. Built as a free-hosted product on Firebase Spark tier using Angular + Firestore.

## WHAT
Three surfaces sharing a Firebase backend:
- **Public landing** (`/`) — couple's wedding website: hero, story, schedule, location, gallery, FAQ, accommodation
- **Admin panel** (`/admin/*`) — couple's private dashboard: add guests, generate QR codes, send email invites, view RSVP status, manage events/menu, edit site content, export guest list, bulk CSV import
- **Guest portal** (`/i/:token`) — public, no-login RSVP page guests access via unique tokenized URL or QR code

## HOW

The Angular app lives at the repo root. Run all commands from the repo root.

### Commands
```bash
npm start            # dev server at http://localhost:4200
npm run build        # production build → dist/wedding-admin/browser
npm run deploy       # ng build + firebase deploy --only hosting
ng generate component admin/my-feature --standalone   # new component
```

### Stack
- **Frontend**: Angular 18, standalone components, signals (`signal`, `computed`, `toSignal`)
- **Database**: Cloud Firestore (free tier — no Cloud Functions, no Cloud Storage)
- **Auth**: Firebase Auth with Google sign-in (admin only)
- **Email**: EmailJS (`@emailjs/browser`) — client-side, no backend
- **QR codes**: `qrcode` npm package — generated client-side, returns data URL
- **Excel export**: SheetJS (`xlsx`) — client-side, downloads .xlsx from Firestore data
- **Token generation**: `nanoid(32)` — 32-char URL-safe tokens (~192 bits entropy)

### Project structure
```
wedding-admin/src/app/
├── core/
│   ├── models/invitation.model.ts        ← All TypeScript interfaces
│   ├── services/
│   │   ├── auth.service.ts               ← Firebase Auth (Google sign-in)
│   │   ├── invitation.service.ts         ← Firestore CRUD, QR, email, export
│   │   ├── event.service.ts              ← Events + menu items CRUD
│   │   ├── settings.service.ts           ← /settings/global doc
│   │   ├── csv-import.service.ts         ← CSV → invitation drafts
│   │   └── notification.service.ts       ← Toast queue (signal-based)
│   ├── components/
│   │   ├── skeleton.component.ts         ← Shimmer placeholder
│   │   ├── toast-container.component.ts  ← Notification stack
│   │   └── confirm-dialog.component.ts   ← Modal for destructive actions
│   └── guards/auth.guard.ts              ← Protects /admin routes
├── admin/
│   ├── login/login.component.ts          ← Google sign-in page
│   ├── layout/admin-layout.component.ts  ← Sidebar shell + mobile hamburger + nav badges
│   ├── dashboard/dashboard.component.ts  ← Live stats (signals + onSnapshot)
│   ├── guests/guest-list.component.ts    ← Table + add/edit/QR/email/CSV-import modals
│   ├── events/event-management.component.ts ← Events + menu items
│   └── settings/settings.component.ts    ← Wedding settings (auto-saves per section)
├── guest/
│   ├── rsvp/rsvp-shell.component.ts      ← Token loader + state machine
│   ├── rsvp/rsvp-hero.component.ts       ← Personalized hero + countdown
│   ├── rsvp/rsvp-form.component.ts       ← Per-guest RSVP + menu + dietary
│   ├── rsvp/confirmation.component.ts    ← Post-submit summary + calendar links
│   └── not-found.component.ts            ← Invalid token fallback
├── landing/
│   ├── landing.component.ts              ← Shell composes all sections
│   ├── nav.component.ts                  ← Sticky scroll-spy nav
│   └── sections/{hero,story,schedule,location,gallery,accommodation,faq,footer}.component.ts
├── app.config.ts                          ← Firebase providers
├── app.routes.ts                          ← Lazy-loaded routes
└── firestore.rules                        ← Copy to Firebase Console
wedding-admin/src/environments/environment.ts  ← Firebase + EmailJS keys (DO NOT COMMIT)
wedding-admin/firebase.json + .firebaserc      ← Hosting config
```

### Routes
- `/` → landing page (public)
- `/i/:token` → guest RSVP portal (public)
- `/i/:token/confirmed` → confirmation page
- `/login` → admin Google sign-in
- `/admin/dashboard|guests|events|settings` → admin (auth-gated)
- `/not-found` → invalid token fallback

### Data model (Firestore)
```
/invitations/{token}           ← token is document ID (nanoid 32)
  label, allowsPlusOne, createdAt, sentAt?, openedAt?,
  guests: Guest[]              ← embedded array, always fetched together
    guest.menuChoices: Record<eventId, menuItemId>
    guest.dietary: string[]    ← Vegetarian, Vegan, Gluten-free, etc.

/events/{eventId}              ← ceremony, reception, etc.
/menuItems/{itemId}            ← per event, references eventId
/settings/global               ← couple names, dates, venue, story, faq, accommodation, gallery URLs
```

### Key conventions
- **Signals over BehaviorSubjects** — use `signal()`, `computed()`, `toSignal()` everywhere
- **`inject()` over constructor injection** — modern Angular DI pattern
- **Standalone components only** — no NgModules
- **`@if`, `@for`, `@switch`** — use new Angular control flow syntax, not `*ngIf`, `*ngFor`
- **Security**: guests access data via token-as-document-ID — knowing the token = access. Admin routes require Firebase Auth JWT.
- **No Cloud Functions / Cloud Storage** — Firebase Spark tier only. All logic runs client-side. Gallery photos referenced by external URL.
- **CSS in component** — each component's `styles: []` array. Global tokens in `src/styles.css`. No additional global CSS.
- **Notifications, dialogs, skeletons** — use `NotificationService.show()`, `ConfirmDialogComponent`, `SkeletonComponent`. Never use `alert()`/`confirm()`/blank screens.
- **Color tokens** (CSS variables in styles.css):
  - `--color-fg: #192519` dark green (sidebar, primary button)
  - `--color-gold: #C9A86C` (accents, ornaments)
  - `--color-bg: #F7F3EE` ivory (background)
  - `--color-success: #3A7D44`, `--color-error: #9B2F2F`, `--color-amber: #A0652A`
- **Fonts**: 'Playfair Display' (headings/titles), 'DM Sans' (body) — loaded via Google Fonts in index.html

### Build status
- ✅ Phase 1 complete: auth, admin layout, dashboard, guest list + modals, invitation service
- ✅ Phase 2 complete: events + menu management page (`/admin/events`)
- ✅ Phase 3 complete: settings page (`/admin/settings`) + CSV bulk import in guest list
- ✅ Phase 4 complete: guest RSVP portal (`/i/:token` + `/i/:token/confirmed`)
- ✅ Phase 5 complete: public landing page (`/`) — hero, story, schedule, location, gallery, accommodation, FAQ, footer
- ✅ Phase 6 complete: shared UI (skeleton, toast, confirm-dialog), mobile responsiveness, validation
- ⬜ Future: reminder emails via GitHub Actions cron, photo uploads (would need Cloud Storage / Blaze tier)

### Environment setup
1. Edit `wedding-admin/src/environments/environment.ts` and fill in:
   - Firebase project config (Firebase Console → Project Settings → Web App)
   - EmailJS `serviceId`, `templateId`, `publicKey` (from emailjs.com)
   - `siteUrl` (your deployed URL — used in QR codes and invite emails)
2. Firebase Console → Authentication → enable Google sign-in
3. Firebase Console → Firestore → Rules → paste contents of `wedding-admin/src/app/firestore.rules`
4. Update `wedding-admin/.firebaserc` with your real Firebase project ID
5. `environment.ts` and `.firebase/` are gitignored — keep your keys local
