import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Usage in routes: { path: 'admin', canActivate: [roleGuard(['admin'])], ... }
export const roleGuard = (roles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasRole(...roles)) return true;
    router.navigate(['/board']);
    return false;
  };
};
