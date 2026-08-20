-- Token Economics admin panel: conversion rate used for AI-usage/credit-pack math.
ALTER TABLE `PlatformSettings` ADD COLUMN `tokensPerDollar` INT NOT NULL DEFAULT 500;

-- Retention-warning email dedupe flag (Batch: automated email system).
ALTER TABLE `LibraryDocument` ADD COLUMN `retentionWarningSent` BOOLEAN NOT NULL DEFAULT false;

-- New automated-email trigger types.
ALTER TABLE `EmailCampaign` MODIFY COLUMN `key` ENUM(
  'WELCOME',
  'UPGRADE',
  'WINBACK',
  'SECURITY',
  'RETENTION_WARNING',
  'SIGNUP_CONFIRMATION',
  'PAYMENT_RECEIPT',
  'PLAN_CHANGED',
  'CANCELLATION_CONFIRMATION',
  'REFERRAL_SUCCESS'
) NOT NULL;

INSERT INTO `EmailCampaign` (`id`, `key`, `enabled`, `subject`, `body`) VALUES
(UUID(), 'RETENTION_WARNING', true,
  'Your file "{{FILENAME}}" deletes in 1 hour',
  '<p>Hi {{NAME}},</p><p><strong>{{FILENAME}}</strong> will be automatically and permanently deleted in about an hour, per your retention settings.</p><p>Want to keep it longer? <a href="{{LIBRARY_URL}}">Open your Library</a> and extend its retention before it expires.</p>'),
(UUID(), 'SIGNUP_CONFIRMATION', true,
  'Confirm your Brief.ai account',
  '<p>Hi {{NAME}},</p><p>Thanks for signing up for Brief.ai. Please confirm your email address to activate your account.</p><p><a href="{{CONFIRM_URL}}">Confirm my email</a></p>'),
(UUID(), 'PAYMENT_RECEIPT', true,
  'Your Brief.ai receipt',
  '<p>Hi {{NAME}},</p><p>This confirms a successful payment of {{AMOUNT}} on your Brief.ai subscription.</p><p><a href="{{DASHBOARD_URL}}">View your account</a></p>'),
(UUID(), 'PLAN_CHANGED', true,
  'Your Brief.ai plan has changed',
  '<p>Hi {{NAME}},</p><p>Your billing cycle is now <strong>{{PLAN_CYCLE}}</strong>. This takes effect on your next billing date.</p><p><a href="{{DASHBOARD_URL}}">View your account</a></p>'),
(UUID(), 'CANCELLATION_CONFIRMATION', true,
  'Your Brief.ai subscription was cancelled',
  '<p>Hi {{NAME}},</p><p>Your subscription has been cancelled. You&#39;ll keep access through the end of your current billing period.</p><p>Changed your mind? <a href="{{PRICING_URL}}">Resubscribe anytime</a>.</p>'),
(UUID(), 'REFERRAL_SUCCESS', true,
  'You just earned a referral commission',
  '<p>Hi {{NAME}},</p><p>Someone you referred just subscribed to Brief.ai, and you&#39;ve earned <strong>{{AMOUNT}}</strong> in commission.</p><p><a href="{{REFERRALS_URL}}">View your referral earnings</a></p>');
