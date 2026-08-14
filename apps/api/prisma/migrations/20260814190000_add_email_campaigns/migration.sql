-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `subscriptionCancelledAt` DATETIME(3) NULL,
  ADD COLUMN `winBackEmailSentAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `EmailCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `key` ENUM('WELCOME', 'UPGRADE', 'WINBACK') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,

    UNIQUE INDEX `EmailCampaign_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed: default templates matching the Brief.ai identity (navy header with
-- wordmark, white body, green CTA button) — editable from the admin panel.
INSERT INTO `EmailCampaign` (`id`, `key`, `enabled`, `subject`, `body`) VALUES
(
  UUID(),
  'WELCOME',
  true,
  'Welcome to Brief.ai',
  '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
  <div style="background:#0F2340;padding:24px;text-align:center;">
    <span style="font-size:20px;font-weight:bold;color:#fff;">Brief.ai</span>
  </div>
  <div style="background:#fff;padding:32px;color:#101826;">
    <p>Hi {{NAME}},</p>
    <p>Your Brief.ai account is ready. Merge, split, and organize PDFs free with no account needed, or sign in any time for AI-powered analysis and your personal document library.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="{{DASHBOARD_URL}}" style="background:#1E9D75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Go to your dashboard</a>
    </p>
  </div>
</div>'
),
(
  UUID(),
  'UPGRADE',
  true,
  'You are on {{PLAN_CYCLE}} now',
  '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
  <div style="background:#0F2340;padding:24px;text-align:center;">
    <span style="font-size:20px;font-weight:bold;color:#fff;">Brief.ai</span>
  </div>
  <div style="background:#fff;padding:32px;color:#101826;">
    <p>Hi {{NAME}},</p>
    <p>Your plan is now active on the {{PLAN_CYCLE}} cycle. AI features, OCR, and document conversion are unlocked on your account.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="{{DASHBOARD_URL}}" style="background:#1E9D75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Open Brief.ai</a>
    </p>
  </div>
</div>'
),
(
  UUID(),
  'WINBACK',
  true,
  'We would love to have you back',
  '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
  <div style="background:#0F2340;padding:24px;text-align:center;">
    <span style="font-size:20px;font-weight:bold;color:#fff;">Brief.ai</span>
  </div>
  <div style="background:#fff;padding:32px;color:#101826;">
    <p>Hi {{NAME}},</p>
    <p>We noticed your Brief.ai plan lapsed a little while ago. Here is a code for 20% off if you would like to come back: <strong>{{DISCOUNT_CODE}}</strong></p>
    <p style="text-align:center;margin:32px 0;">
      <a href="{{PRICING_URL}}" style="background:#1E9D75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Reactivate your plan</a>
    </p>
  </div>
</div>'
);
