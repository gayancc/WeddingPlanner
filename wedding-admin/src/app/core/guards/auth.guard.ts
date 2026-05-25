import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await firstValueFrom(authState(auth));

  if (user && authService.isAllowed(user.email)) return true;

  await router.navigate(['/login']);
  return false;
};
