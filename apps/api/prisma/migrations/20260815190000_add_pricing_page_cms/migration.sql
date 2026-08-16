-- Seed: the "pricing" page — second page wired into the CMS (previously only
-- "home"), proving out the multi-page architecture built in Batch 5, Part 9
-- §1. Sections mirror the copy already hardcoded in PricingPage.tsx as of
-- this batch — draftFields and publishedFields start identical, so this
-- migration changes nothing live until an admin edits and publishes.
SET @pageId = UUID();

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (@pageId, 'pricing', 'Pricing — Brief.ai', 'Plans for legal, accounting, and research professionals — free core tools, paid AI features per workspace.');

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`) VALUES
(
  UUID(), @pageId, 'intro', 0,
  JSON_OBJECT('heading', 'A plan for every profession'),
  JSON_OBJECT('heading', 'A plan for every profession'),
  NOW(3)
),
(
  UUID(), @pageId, 'faq', 1,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('q', 'Is my document content used to train any AI model?', 'a', 'No. Your files and extracted text are sent only to process your request, never used for training.'),
    JSON_OBJECT('q', 'Can I switch professions/workspace later?', 'a', 'Yes — change it anytime from Settings or the dashboard sidebar. It only affects which workspace view you see, not your saved documents.'),
    JSON_OBJECT('q', 'What does "processed locally" mean?', 'a', 'Merge, split, rotate, organize, and other core tools run entirely in your browser — the file never leaves your device, and they stay free with no usage cap.'),
    JSON_OBJECT('q', 'What needs a paid plan?', 'a', 'AI features and anything that needs our servers (Office↔PDF conversion, password protect/remove) are part of a paid workspace plan. OCR runs locally in your browser and stays free.')
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('q', 'Is my document content used to train any AI model?', 'a', 'No. Your files and extracted text are sent only to process your request, never used for training.'),
    JSON_OBJECT('q', 'Can I switch professions/workspace later?', 'a', 'Yes — change it anytime from Settings or the dashboard sidebar. It only affects which workspace view you see, not your saved documents.'),
    JSON_OBJECT('q', 'What does "processed locally" mean?', 'a', 'Merge, split, rotate, organize, and other core tools run entirely in your browser — the file never leaves your device, and they stay free with no usage cap.'),
    JSON_OBJECT('q', 'What needs a paid plan?', 'a', 'AI features and anything that needs our servers (Office↔PDF conversion, password protect/remove) are part of a paid workspace plan. OCR runs locally in your browser and stays free.')
  )),
  NOW(3)
);
