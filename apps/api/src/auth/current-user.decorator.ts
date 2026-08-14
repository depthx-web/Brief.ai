import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { SafeUser } from './auth.service';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): SafeUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user: SafeUser }>();
  return request.user;
});

// For routes guarded by OptionalJwtAuthGuard, where being logged in is
// optional — req.user is null when no valid token was sent.
export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SafeUser | null => {
    const request = ctx.switchToHttp().getRequest<Request & { user: SafeUser | null }>();
    return request.user ?? null;
  }
);
