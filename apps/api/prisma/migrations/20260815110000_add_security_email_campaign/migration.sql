-- AlterTable
ALTER TABLE `EmailCampaign` MODIFY COLUMN `key` ENUM('WELCOME', 'UPGRADE', 'WINBACK', 'SECURITY') NOT NULL;

-- Seed: security-change notification template, same identity as the other
-- three (navy header, white body) with a cautionary shield icon and a
-- redline "wasn't you?" line — see EmailCampaignService.sendSecurityAlert.
INSERT INTO `EmailCampaign` (`id`, `key`, `enabled`, `subject`, `body`) VALUES
(
  UUID(),
  'SECURITY',
  true,
  'Your Brief.ai {{CHANGE_TYPE}} was changed',
  '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
  <div style="background:#0F2340;padding:24px;text-align:center;">
    <span style="font-size:20px;font-weight:bold;color:#fff;">Brief.ai</span>
  </div>
  <div style="background:#fff;padding:32px;color:#101826;">
    <p style="text-align:center;font-size:28px;margin:0 0 16px;">&#128737;</p>
    <p>Hi {{NAME}},</p>
    <p>Your account {{CHANGE_TYPE}} was just changed. If this was you, no action is needed.</p>
    <p style="color:#C24444;font-weight:bold;">Wasn&#39;t you? Contact us immediately.</p>
  </div>
</div>'
);
