import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Like JwtAuthGuard, but never rejects the request — AI tools work
// anonymously too. If a valid token is present, req.user is populated
// (used to tag jobs to an account for the audit-log / usage-tracking view);
// if not, the request just proceeds with no user.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
