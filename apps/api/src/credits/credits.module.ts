import { Global, Module } from '@nestjs/common';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { AuthModule } from '../auth/auth.module';

// Global: CreditsService is a genuinely cross-cutting dependency (the AI
// FeatureGuard, the billing webhook, and the admin/wallet modules all need
// it), and guards applied via @UseGuards() resolve their constructor
// dependencies through the *consuming* controller's module chain, not just
// FeaturesModule's — plumbing CreditsModule through every one of those
// import chains individually is more fragile than declaring it global once.
// Deliberately does NOT import BillingModule — LemonSqueezyService (in
// BillingModule) needs CreditsService for the order_created webhook, so the
// dependency only goes one way (BillingModule -> CreditsModule) to avoid a
// circular import, same fix pattern as WinBackModule for Mail<->Billing.
@Global()
@Module({
  imports: [PlatformSettingsModule, AuthModule],
  controllers: [CreditsController],
  providers: [CreditsService, PrismaService],
  exports: [CreditsService],
})
export class CreditsModule {}
