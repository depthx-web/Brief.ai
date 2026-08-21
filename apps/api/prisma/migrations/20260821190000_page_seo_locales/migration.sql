-- Per-locale overrides for a page's meta title/description/keywords, so an
-- admin can translate SEO copy the same way section content already works —
-- additive JSON column, `{ [locale]: { metaTitle?, metaDescription?, metaKeywords? } }`,
-- with the existing plain columns staying the English/default values.
ALTER TABLE `Page` ADD COLUMN `metaLocales` JSON NULL;
