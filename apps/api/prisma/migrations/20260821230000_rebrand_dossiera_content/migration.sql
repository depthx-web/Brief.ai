-- Rebrand: replace "Brief.ai" with "Dossiera" inside data seeded by earlier
-- migrations, rather than editing those migration files in place (which
-- would change their checksum and break `prisma migrate deploy` on any
-- environment that already applied them). This is a data-only correction,
-- not a schema change — scope is visible display text only (title/subject/
-- body copy), matching the same scope as the code-level rebrand. The
-- domain (brief.ai) and support@brief.ai addresses are untouched.

UPDATE `Page`
SET
  `metaTitle` = REPLACE(`metaTitle`, 'Brief.ai', 'Dossiera'),
  `metaDescription` = REPLACE(`metaDescription`, 'Brief.ai', 'Dossiera')
WHERE `metaTitle` LIKE '%Brief.ai%' OR `metaDescription` LIKE '%Brief.ai%';

UPDATE `ContentSection`
SET
  `draftFields` = REPLACE(`draftFields`, 'Brief.ai', 'Dossiera'),
  `publishedFields` = REPLACE(`publishedFields`, 'Brief.ai', 'Dossiera')
WHERE `draftFields` LIKE '%Brief.ai%' OR `publishedFields` LIKE '%Brief.ai%';

UPDATE `EmailCampaign`
SET
  `subject` = REPLACE(`subject`, 'Brief.ai', 'Dossiera'),
  `body` = REPLACE(`body`, 'Brief.ai', 'Dossiera')
WHERE `subject` LIKE '%Brief.ai%' OR `body` LIKE '%Brief.ai%';
