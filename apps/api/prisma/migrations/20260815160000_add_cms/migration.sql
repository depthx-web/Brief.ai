-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `metaKeywords` JSON NULL,
    `ogImageUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentSection` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `sectionKey` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `draftFields` JSON NOT NULL,
    `publishedFields` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContentSection_pageId_sectionKey_key`(`pageId`, `sectionKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContentSection` ADD CONSTRAINT `ContentSection_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: the "home" page, with sections pre-populated from the copy already
-- hardcoded in apps/web/src/app/(marketing)/page.tsx as of Batch 5 — both
-- draftFields and publishedFields start identical to that copy, so running
-- this migration changes nothing on the live site until an admin actually
-- edits and publishes something. Only Hero/Workspaces/Trust/FAQ are CMS-
-- driven in this first pass (see Part 9 §1 scoping note) — How It Works,
-- the closing CTA, and the footer stay hardcoded for now.
SET @pageId = UUID();

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (@pageId, 'home', 'Brief.ai — PDF Tools', 'Professional PDF tools built for legal, accounting, and research professionals.');

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`) VALUES
(
  UUID(), @pageId, 'hero', 0,
  JSON_OBJECT(
    'eyebrow', 'AI-Powered PDF Platform',
    'headingLine1', 'Your documents speak.',
    'headingLine2', 'You just listen.',
    'subtext', 'Professional PDF tools built for three different worlds — contracts, invoices, and research papers. Brief.ai understands what each one means to an expert in that field.'
  ),
  JSON_OBJECT(
    'eyebrow', 'AI-Powered PDF Platform',
    'headingLine1', 'Your documents speak.',
    'headingLine2', 'You just listen.',
    'subtext', 'Professional PDF tools built for three different worlds — contracts, invoices, and research papers. Brief.ai understands what each one means to an expert in that field.'
  ),
  NOW(3)
),
(
  UUID(), @pageId, 'workspaces', 1,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('eyebrow', 'Legal', 'title', 'For Lawyers & Firms', 'description', 'Compare two versions of a contract, spot unusual clauses, and pull out obligations and dates automatically.', 'features', JSON_ARRAY('Contract comparison (redline)', 'Non-standard clause detection', 'Semantic search across your contract library')),
    JSON_OBJECT('eyebrow', 'Accounting', 'title', 'For Accountants & Small Business', 'description', 'Turn invoices and statements into clean, structured data ready to export in minutes.', 'features', JSON_ARRAY('High-accuracy data extraction', 'Automatic expense categorization', 'Ready export to QuickBooks/Xero')),
    JSON_OBJECT('eyebrow', 'Research', 'title', 'For Researchers & Grad Students', 'description', 'Chat with any research paper, summarize it your way, and pull a citation-ready reference list.', 'features', JSON_ARRAY('Chat with the paper', 'BibTeX / APA reference export', 'Searchable personal research library'))
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('eyebrow', 'Legal', 'title', 'For Lawyers & Firms', 'description', 'Compare two versions of a contract, spot unusual clauses, and pull out obligations and dates automatically.', 'features', JSON_ARRAY('Contract comparison (redline)', 'Non-standard clause detection', 'Semantic search across your contract library')),
    JSON_OBJECT('eyebrow', 'Accounting', 'title', 'For Accountants & Small Business', 'description', 'Turn invoices and statements into clean, structured data ready to export in minutes.', 'features', JSON_ARRAY('High-accuracy data extraction', 'Automatic expense categorization', 'Ready export to QuickBooks/Xero')),
    JSON_OBJECT('eyebrow', 'Research', 'title', 'For Researchers & Grad Students', 'description', 'Chat with any research paper, summarize it your way, and pull a citation-ready reference list.', 'features', JSON_ARRAY('Chat with the paper', 'BibTeX / APA reference export', 'Searchable personal research library'))
  )),
  NOW(3)
),
(
  UUID(), @pageId, 'trust', 2,
  JSON_OBJECT('heading', 'Privacy isn''t a feature. It''s the foundation.'),
  JSON_OBJECT('heading', 'Privacy isn''t a feature. It''s the foundation.'),
  NOW(3)
),
(
  UUID(), @pageId, 'faq', 3,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('q', 'Is my data safe?', 'a', 'Yes. Simple tools run entirely in your browser and never touch our servers. Anything that does need server-side processing — AI analysis, OCR, conversions — is deleted permanently within one hour of completion, and your documents are never used to train any AI model.'),
    JSON_OBJECT('q', 'Do I need a credit card to start?', 'a', 'No. Merge, split, rotate, and compress are free forever with no account and no card required. You only pay once you want AI-powered analysis, chat, or comparisons.'),
    JSON_OBJECT('q', 'What happens to my files after 24 hours?', 'a', 'Files saved to a Library project are automatically and permanently deleted after 24 hours, unless you extend that project''s retention to 7 or 30 days from its options menu.'),
    JSON_OBJECT('q', 'Which plan is right for me?', 'a', 'Start with the workspace that matches your work — Legal, Accounting, or Research — then pick weekly, monthly, quarterly, or yearly billing. You can switch workspace or cycle anytime from your dashboard.'),
    JSON_OBJECT('q', 'Can I cancel anytime?', 'a', 'Yes, anytime from your account settings. You keep access through the end of your current billing period, and no cancellation fee applies.')
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('q', 'Is my data safe?', 'a', 'Yes. Simple tools run entirely in your browser and never touch our servers. Anything that does need server-side processing — AI analysis, OCR, conversions — is deleted permanently within one hour of completion, and your documents are never used to train any AI model.'),
    JSON_OBJECT('q', 'Do I need a credit card to start?', 'a', 'No. Merge, split, rotate, and compress are free forever with no account and no card required. You only pay once you want AI-powered analysis, chat, or comparisons.'),
    JSON_OBJECT('q', 'What happens to my files after 24 hours?', 'a', 'Files saved to a Library project are automatically and permanently deleted after 24 hours, unless you extend that project''s retention to 7 or 30 days from its options menu.'),
    JSON_OBJECT('q', 'Which plan is right for me?', 'a', 'Start with the workspace that matches your work — Legal, Accounting, or Research — then pick weekly, monthly, quarterly, or yearly billing. You can switch workspace or cycle anytime from your dashboard.'),
    JSON_OBJECT('q', 'Can I cancel anytime?', 'a', 'Yes, anytime from your account settings. You keep access through the end of your current billing period, and no cancellation fee applies.')
  )),
  NOW(3)
);
