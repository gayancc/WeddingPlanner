import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./admin/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'i/:token',
    loadComponent: () =>
      import('./guest/rsvp/rsvp-shell.component').then((m) => m.RsvpShellComponent),
  },
  {
    path: 'i/:token/confirmed',
    loadComponent: () =>
      import('./guest/rsvp/confirmation.component').then((m) => m.ConfirmationComponent),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./guest/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'guests',
        loadComponent: () =>
          import('./admin/guests/guest-list.component').then((m) => m.GuestListComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./admin/events/event-management.component').then(
            (m) => m.EventManagementComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
