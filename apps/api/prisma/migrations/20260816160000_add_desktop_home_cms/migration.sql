-- Seed: "desktop-home" page — the single "announcement" section backs the
-- news/promo card on the Brief.ai desktop app's Home screen. Not a real
-- website page (no route renders this slug on the web) — reusing the
-- existing generic Page/ContentSection CMS machinery here specifically so
-- an admin can edit and publish that one card from /admin/content without
-- any new backend surface, rather than building a bespoke "announcements"
-- feature for a single card.
-- Both draftFields and publishedFields are seeded together (unlike a
-- brand-new page normally waiting on its first Publish click) so the card
-- shows real content immediately instead of the frontend's hardcoded
-- fallback until someone remembers to publish it.

SET @desktopHomeId = UUID();

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (@desktopHomeId, 'desktop-home', NULL, NULL);

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`) VALUES
(
  UUID(), @desktopHomeId, 'announcement', 0,
  JSON_OBJECT(
    'badge', 'New',
    'kicker', 'Product update',
    'headline', 'AI Contract Compare is here',
    'body', 'Redline two versions of any contract side-by-side and get every change explained in plain English — included with every Legal workspace.',
    'ctaLabel', 'See what''s new',
    'ctaHref', '/contract-compare'
  ),
  JSON_OBJECT(
    'badge', 'New',
    'kicker', 'Product update',
    'headline', 'AI Contract Compare is here',
    'body', 'Redline two versions of any contract side-by-side and get every change explained in plain English — included with every Legal workspace.',
    'ctaLabel', 'See what''s new',
    'ctaHref', '/contract-compare'
  ),
  NOW(3)
);
