import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { SafeUser } from '../auth/auth.service';
import { FeatureService } from './feature.service';
import { FEATURE_KEY_METADATA } from './require-feature.decorator';

// Like RequirePaidPlanGuard, but with an admin-controlled exception: a
// FREE-plan user can still use a specific AI operation if an admin has
// flipped that operation's Feature.freeEnabled on for their segment (Plans
// & Pricing admin panel). PAID users and BILLING_ENFORCED=false both bypass
// the check entirely, same as RequirePaidPlanGuard.
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureService: FeatureService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.BILLING_ENFORCED !== 'true') return true;

    const request = context.switchToHttp().getRequest<Request & { user: SafeUser | null }>();
    const user = request.user;
    const deniedMessage =
      'This feature requires a paid plan. The free plan covers merge, split, rotate, organize, ' +
      'and other tools that run entirely in your browser.';

    if (!user) throw new ForbiddenException(deniedMessage);
    if (user.plan === 'PAID') return true;
    if (!user.segment) throw new ForbiddenException(deniedMessage);

    const key = this.reflector.get<string>(FEATURE_KEY_METADATA, context.getHandler());
    if (!key) throw new ForbiddenException(deniedMessage);

    const allowed = await this.featureService.isFreeEnabled(user.segment, key);
    if (!allowed) throw new ForbiddenException(deniedMessage);
    return true;
  }
}
