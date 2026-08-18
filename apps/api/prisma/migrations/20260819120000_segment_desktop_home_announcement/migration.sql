-- The desktop Home news/promo card now varies by workspace segment
-- (Legal/Accounting/Research), each independently editable from
-- /admin/content. The original single "announcement" section was always
-- Legal-flavored ("included with every Legal workspace") — rename it to
-- announcement_lawyer rather than re-seeding, so any edits already made
-- through the admin panel are preserved as the Lawyer variant.

UPDATE `ContentSection` cs
JOIN `Page` p ON p.id = cs.pageId
SET cs.sectionKey = 'announcement_lawyer', cs.`order` = 0
WHERE p.slug = 'desktop-home' AND cs.sectionKey = 'announcement';

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
SELECT
  UUID(), p.id, 'announcement_accountant', 1,
  JSON_OBJECT(
    'badge', 'New',
    'kicker', 'Product update',
    'headline', 'AI Bank Reconciliation is here',
    'body', 'Compare a bank statement against your recorded invoices and get every discrepancy flagged automatically — included with every Accounting workspace.',
    'ctaLabel', 'See what''s new',
    'ctaHref', '/bank-reconciliation'
  ),
  JSON_OBJECT(
    'badge', 'New',
    'kicker', 'Product update',
    'headline', 'AI Bank Reconciliation is here',
    'body', 'Compare a bank statement against your recorded invoices and get every discrepancy flagged automatically — included with every Accounting workspace.',
    'ctaLabel', 'See what''s new',
    'ctaHref', '/bank-reconciliation'
  ),
  NOW(3)
FROM `Page` p WHERE p.slug = 'desktop-home';

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
SELECT
  UUID(), p.id, 'announcement_researcher', 2,
  JSON_OBJECT(
    'badge', 'New',
    'kicker', 'Product update',
    'headline', 'AI Multi-Paper Compare is here',
    'body', 'Compare the methodology and results of two papers side by side, with every difference explained in plain English — included with every Research workspace.',
    'ctaLabel', 'See what''s new',
    'ctaHref', '/multi-paper-compare'
  ),
  JSON_OBJECT(
    'badge', 'New',
    'kicker', 'Product update',
    'headline', 'AI Multi-Paper Compare is here',
    'body', 'Compare the methodology and results of two papers side by side, with every difference explained in plain English — included with every Research workspace.',
    'ctaLabel', 'See what''s new',
    'ctaHref', '/multi-paper-compare'
  ),
  NOW(3)
FROM `Page` p WHERE p.slug = 'desktop-home';
