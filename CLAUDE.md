# Wedding Admin — Claude Code Project

## WHY
A full-stack wedding management platform for a couple to manage invitations, RSVPs, and guest information. Built as a free-hosted product on Firebase Spark tier using Angular + Firestore.

## WHAT
Two Angular SPAs sharing a Firebase backend:
- **Admin panel** (`/admin/*`) — couple's private dashboard: add guests, generate QR codes, send email invites, view RSVP status, export guest list
- **Guest portal** (`/i/:token`) — public, no-login RSVP page guests access via unique tokenized URL or QR code

## HOW

### Commands
```bash
npm start            # dev server at http://localhost:4200
npm run build        # production build → dist/
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
src/app/
├── core/
│   ├── models/invitation.model.ts     ← All TypeScript interfaces
│   ├── services/
│   │   ├── auth.service.ts            ← Firebase Auth (Google sign-in)
│   │   └── invitation.service.ts     ← Firestore CRUD, QR, email, export
│   └── guards/auth.guard.ts           ← Protects /admin routes
├── admin/
│   ├── login/login.component.ts       ← Google sign-in page
│   ├── layout/admin-layout.component.ts ← Sidebar shell + router-outlet
│   ├── dashboard/dashboard.component.ts ← Live stats (signals + onSnapshot)
│   └── guests/guest-list.component.ts  ← Table + add/edit/QR modals
├── guest/
│   └── rsvp/rsvp.component.ts         ← ⬅ TODO (Phase 2)
├── app.config.ts                       ← Firebase providers
├── app.routes.ts                       ← Lazy-loaded routes
└── firestore.rules                     ← Copy to Firebase Console
src/environments/environment.ts         ← Firebase + EmailJS keys (DO NOT COMMIT)
```

### Data model (Firestore)
```
/invitations/{token}           ← token is document ID (nanoid 32)
  label, allowsPlusOne, createdAt, sentAt?, openedAt?,
  guests: Guest[]              ← embedded array, always fetched together

/events/{eventId}              ← ceremony, reception, etc.
/menuItems/{itemId}            ← per event
/settings/global               ← couple names, wedding date, photo URL
```

### Key conventions
- **Signals over BehaviorSubjects** — use `signal()`, `computed()`, `toSignal()` everywhere
- **`inject()` over constructor injection** — modern Angular DI pattern
- **Standalone components only** — no NgModules
- **`@if`, `@for`, `@switch`** — use new Angular control flow syntax, not `*ngIf`, `*ngFor`
- **Security**: guests access data via token-as-document-ID — knowing the token = access. Admin routes require Firebase Auth JWT.
- **No Cloud Functions / Cloud Storage** — Firebase Spark tier only. All logic runs client-side.
- **CSS in component** — each component's `styles: []` array. No global stylesheet beyond Google Fonts import.
- **Color tokens** (use these consistently):
  - `#192519` dark green (sidebar, primary button)
  - `#C9A86C` gold (accents, ornaments)
  - `#F7F3EE` ivory (background)
  - `#3A7D44` success green, `#9B2F2F` error red, `#A0652A` amber/pending
- **Fonts**: 'Playfair Display' (headings/titles), 'DM Sans' (body) — loaded via Google Fonts in index.html

### Build status
- ✅ Phase 1 complete: auth, admin layout, dashboard, guest list + modals, invitation service
- ⬜ Phase 2: guest RSVP portal (`/i/:token`)
- ⬜ Phase 3: events + menu management page
- ⬜ Phase 4: bulk CSV import, reminder emails via GitHub Actions cron

### Environment setup
Copy `src/environments/environment.ts` and fill in:
- Firebase project config (from Firebase Console → Project Settings → Web App)
- EmailJS serviceId, templateId, publicKey (from emailjs.com)
- Add `environment.ts` to `.gitignore`
