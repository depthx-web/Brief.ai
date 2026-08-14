import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { SafeUser } from '../auth/auth.service';

// Gates AI / OCR / server-side conversion behind a paid plan, per the Free
// Plan spec: only pure client-side WASM tools (merge/split/rotate/etc.) stay
// free. Pair with OptionalJwtAuthGuard so req.user is populated (or null)
// before this runs.
//
// Toggled by BILLING_ENFORCED (default off) so the gate can ship without
// locking everyone out before Lemon Squeezy is actually configured and live.
@Injectable()
export class RequirePaidPlanGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (process.env.BILLING_ENFORCED !== 'true') return true;

    const request = context.switchToHttp().getRequest<Request & { user: SafeUser | null }>();
    if (!request.user || request.user.plan !== 'PAID') {
      throw new ForbiddenException(
        'This feature requires a paid plan. The free plan covers merge, split, rotate, organize, ' +
          'and other tools that run entirely in your browser.'
      );
    }
    return true;
  }
}
