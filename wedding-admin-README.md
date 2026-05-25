# Wedding Admin — Setup Guide

## Stack
- Angular 18 (standalone components, signals)
- Firebase (Firestore + Auth)
- AngularFire v18
- EmailJS (client-side email)
- qrcode (QR generation)
- SheetJS / xlsx (Excel export)

## 1. Firebase setup

1. Go to https://console.firebase.google.com → New project
2. Enable **Authentication** → Sign-in method → Google
3. Enable **Firestore Database** → Start in production mode
4. Register a **Web App** → copy the config object
5. Paste the config into `src/environments/environment.ts`

## 2. Firestore security rules

Copy `src/app/firestore.rules` content into the Firebase Console →
Firestore → Rules tab, then Publish.

## 3. EmailJS setup

1. Sign up at https://emailjs.com (free: 200 emails/month)
2. Add an email service (Gmail works fine)
3. Create an email template with these variables:
   - `{{to_email}}` — recipient
   - `{{to_name}}` — guest name(s)
   - `{{invite_url}}` — the unique RSVP link
   - `{{qr_code}}` — QR code image (base64 data URL — use as `<img src="{{qr_code}}" />`)
   - `{{wedding_label}}` — invitation label
4. Copy Service ID, Template ID, Public Key → `src/environments/environment.ts`

## 4. Install and run

```bash
npm install
npm start        # http://localhost:4200
```

## 5. Deploy to Firebase Hosting

```bash
npm install -g @angular/cli firebase-tools
firebase login
firebase init hosting  # set build output to: dist/wedding-admin/browser
npm run deploy
```

## Project structure

```
src/app/
├── core/
│   ├── models/invitation.model.ts     ← All TypeScript interfaces
│   ├── services/
│   │   ├── auth.service.ts            ← Google sign-in / sign-out
│   │   └── invitation.service.ts     ← Firestore CRUD, QR, email, export
│   └── guards/auth.guard.ts           ← Protect /admin routes
├── admin/
│   ├── login/login.component.ts       ← Google sign-in page
│   ├── layout/admin-layout.component.ts ← Sidebar shell
│   ├── dashboard/dashboard.component.ts ← Stats + recent RSVPs
│   └── guests/guest-list.component.ts  ← Table + modals
├── app.config.ts                       ← Firebase providers
├── app.routes.ts                       ← Lazy-loaded routes
└── firestore.rules                     ← Copy to Firebase Console
```

## Next steps (Phase 2)

- `src/app/guest/rsvp/rsvp.component.ts` — Public RSVP portal at `/i/:token`
- Events & menu management page
- Bulk CSV import for invitations
- Reminder email scheduling (via GitHub Actions cron)
