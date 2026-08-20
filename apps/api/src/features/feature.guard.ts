import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { SafeUser } from '../auth/auth.service';
import { FeatureService } from './feature.service';
import { FEATURE_KEY_METADATA } from './require-feature.decorator';
import { CreditsService } from '../credits/credits.service';

// Gates every tool that needs a paid plan by default — AI operations and
// server-side conversions (Office<->PDF, Protect, Remove Password) alike —
// with two admin-controlled exceptions: a FREE-plan user can still use a
// specific tool if an admin has flipped its Feature.freeEnabled on (Plans &
// Pricing admin panel — either for their segment, for a per-profession AI
// operation, or globally, for a tool available to every workspace), OR by
// spending one pre-paid credit if they have a balance (Batch 5, Part 6 §7 —
// the pay-as-you-go plan). PAID users and BILLING_ENFORCED=false both
// bypass the check entirely either way.
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureService: FeatureService,
    private readonly creditsService: CreditsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.BILLING_ENFORCED !== 'true') return true;

    const request = context.switchToHttp().getRequest<Request & { user: SafeUser | null }>();
    const user = request.user;
    const deniedMessage =
      'This feature requires a paid plan, or a credit if you are on pay-as-you-go. The free ' +
      'plan covers merge, split, rotate, organize, and other tools that run entirely in your browser.';

    if (!user) throw new ForbiddenException(deniedMessage);
    if (user.plan === 'PAID') return true;

    const key = this.reflector.get<string>(FEATURE_KEY_METADATA, context.getHandler());
    if (key && (await this.featureService.isFreeEnabled(user.segment ?? null, key))) return true;

    const operationLabel = key ? await this.featureService.findLabel(user.segment ?? null, key) : null;
    if (await this.creditsService.consumeCreditIfAvailable(user.id, operationLabel ?? undefined)) return true;

    throw new ForbiddenException(deniedMessage);
  }
}
