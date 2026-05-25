import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  authState,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  readonly user = toSignal<User | null>(authState(this.auth), { initialValue: null });
  readonly isAuthenticated = signal(false);

  constructor() {
    authState(this.auth).subscribe((u) => {
      // Enforce allowlist — sign out anyone not in the list
      if (u && !this.isAllowed(u.email)) {
        signOut(this.auth);
        this.isAuthenticated.set(false);
      } else {
        this.isAuthenticated.set(!!u);
      }
    });
  }

  isAllowed(email: string | null | undefined): boolean {
    if (!email) return false;
    return environment.allowedAdminEmails
      .map((e) => e.toLowerCase())
      .includes(email.toLowerCase());
  }

  async signIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);

    if (!this.isAllowed(result.user.email)) {
      await signOut(this.auth);
      throw new Error(
        `${result.user.email} is not authorised to access this admin panel.`
      );
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
