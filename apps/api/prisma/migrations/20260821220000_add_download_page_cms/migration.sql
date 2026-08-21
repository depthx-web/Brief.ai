-- Seed: "download" page — setup instructions, a screenshot, and FAQ for the
-- desktop app download page (see cms.service.ts CMS_PAGES entry 'download').
-- `screenshot.url` is deliberately seeded empty: the frontend picks a
-- locale-aware default screenshot (one real asset per language, see
-- DownloadContent.tsx) when this is blank, only overriding with a single
-- fixed image for every locale once an admin actually publishes one here —
-- same non-localized-image convention as Page.ogImageUrl.
-- Both draftFields and publishedFields are seeded together so the page
-- shows real content immediately rather than waiting on a first Publish.

SET @downloadPageId = UUID();

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (@downloadPageId, 'download', 'Download — Brief.ai Desktop', 'Get the Brief.ai desktop app — local PDF tools that run entirely on your machine, no upload required.');

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`) VALUES
(
  UUID(), @downloadPageId, 'instructions', 0,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('title', 'Download the installer', 'body', 'Pick the version for your operating system below. Every build is signed, so you shouldn''t see extra security warnings.'),
    JSON_OBJECT('title', 'Run the installer', 'body', 'Open the downloaded file and follow the prompts — no special permissions beyond your OS''s normal installer flow.'),
    JSON_OBJECT('title', 'Start converting files right away', 'body', 'Merge, split, compress, protect, and convert files completely offline. No account needed for any of it.'),
    JSON_OBJECT('title', 'Sign in only for AI features', 'body', 'AI tools like contract comparison and clause analysis need an internet connection and a signed-in account — everything else works without one.')
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('title', 'Download the installer', 'body', 'Pick the version for your operating system below. Every build is signed, so you shouldn''t see extra security warnings.'),
    JSON_OBJECT('title', 'Run the installer', 'body', 'Open the downloaded file and follow the prompts — no special permissions beyond your OS''s normal installer flow.'),
    JSON_OBJECT('title', 'Start converting files right away', 'body', 'Merge, split, compress, protect, and convert files completely offline. No account needed for any of it.'),
    JSON_OBJECT('title', 'Sign in only for AI features', 'body', 'AI tools like contract comparison and clause analysis need an internet connection and a signed-in account — everything else works without one.')
  )),
  NOW(3)
),
(
  UUID(), @downloadPageId, 'screenshot', 1,
  JSON_OBJECT('url', ''),
  JSON_OBJECT('url', ''),
  NOW(3)
),
(
  UUID(), @downloadPageId, 'faq', 2,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('q', 'Which operating systems are supported?', 'a', 'Windows, Mac, and Linux.'),
    JSON_OBJECT('q', 'Do I need an account to use it?', 'a', 'No — every core tool works fully offline with no sign-in required. You only need an account for AI features.'),
    JSON_OBJECT('q', 'Is my data uploaded anywhere?', 'a', 'Core tools process files entirely on your device. Only AI features send extracted text to our AI server, and only while you''re using them.'),
    JSON_OBJECT('q', 'Is the desktop app free?', 'a', 'Yes — the desktop app itself is free to install. AI features use the same credit system as the web app.'),
    JSON_OBJECT('q', 'How do I get updates?', 'a', 'The app checks for updates automatically and prompts you before installing one.')
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('q', 'Which operating systems are supported?', 'a', 'Windows, Mac, and Linux.'),
    JSON_OBJECT('q', 'Do I need an account to use it?', 'a', 'No — every core tool works fully offline with no sign-in required. You only need an account for AI features.'),
    JSON_OBJECT('q', 'Is my data uploaded anywhere?', 'a', 'Core tools process files entirely on your device. Only AI features send extracted text to our AI server, and only while you''re using them.'),
    JSON_OBJECT('q', 'Is the desktop app free?', 'a', 'Yes — the desktop app itself is free to install. AI features use the same credit system as the web app.'),
    JSON_OBJECT('q', 'How do I get updates?', 'a', 'The app checks for updates automatically and prompts you before installing one.')
  )),
  NOW(3)
);
