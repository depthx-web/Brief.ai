import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

// Admin access is a shared secret header, not a user account/role — there's
// no admin login flow, just a token issued out-of-band (ADMIN_TOKEN env var).
// Fails closed: no ADMIN_TOKEN configured means no access, not open access.
@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-admin-token'];
    const expected = process.env.ADMIN_TOKEN;
    if (!expected || token !== expected) {
      throw new UnauthorizedException('Invalid admin token.');
    }
    return true;
  }
}
