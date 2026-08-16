-- Seed: "privacy" and "terms" pages — long-form legal text represented as a
-- single repeating "body" section (items: [{title, body}]), reusing the
-- same list-of-fields shape as the FAQ section elsewhere rather than
-- inventing a rich-text field type. Paragraph breaks within a section are
-- encoded as a blank line (\n\n) and split back into <p> tags on render.
-- Both pages' hyperlinked references (to /privacy, to mailto:) are flattened
-- to plain text for this first editable pass.

SET @privacyId = UUID();

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (@privacyId, 'privacy', 'Privacy Policy — Brief.ai', 'How Brief.ai collects, processes, retains, and deletes your account and document data.');

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`) VALUES
(
  UUID(), @privacyId, 'body', 0,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('title', 'Overview', 'body', 'Brief.ai is a document tool built around a simple rule: your files are yours, and we keep as little of them as we can. This policy explains what we collect, how long we keep it, and when your documents are processed on our servers versus entirely inside your own browser.'),
    JSON_OBJECT('title', 'Information we collect', 'body', 'Creating an account requires only an email address, a password, and the professional workspace you choose (Lawyer, Accountant, or Researcher). If you sign in with Google, we receive your email and display name from your Google account instead.\n\nDocuments you upload to your Library, and any files you send through an AI-powered tool, are received by our servers to process your request. Documents you process with a browser-only tool (merge, split, rotate, and similar) never leave your device.'),
    JSON_OBJECT('title', 'How we use information', 'body', 'We use your account details to run the service — authenticating you, applying your plan''s limits, and remembering your workspace preferences. Document content sent to an AI tool is used only to generate the response you asked for, in that single request. We do not use your document content to train any AI model, ours or a third party''s.'),
    JSON_OBJECT('title', 'Data retention & auto-deletion', 'body', 'Files uploaded to a Library project are kept for 24 hours by default, then permanently deleted, unless you extend that project''s retention to 7 or 30 days from the project''s options menu. Once a project expires, its files are removed from our storage — there is no recovery period.\n\nFiles sent through a server-side tool without being saved to your Library (a one-off conversion, for example) are deleted within one hour of the job completing.'),
    JSON_OBJECT('title', 'AI processing', 'body', 'AI features are powered by third-party language model providers. The relevant page or question text is sent to the provider to generate a response and is not retained by Brief.ai beyond that request. We do not permit these providers to use your content to train their models.'),
    JSON_OBJECT('title', 'Cookies & local storage', 'body', 'We use your browser''s local storage to keep you signed in and to remember interface preferences like your last-used workspace. We do not use third-party advertising or tracking cookies.'),
    JSON_OBJECT('title', 'Your rights', 'body', 'You can update your name, email, or password at any time from Settings. You can delete any document or project individually, or permanently delete your entire account and every document in it from Settings — this action is immediate and cannot be undone.'),
    JSON_OBJECT('title', 'Changes to this policy', 'body', 'If we make a material change to how we handle your data, we will update the date at the top of this page and, where appropriate, notify you by email.'),
    JSON_OBJECT('title', 'Contact', 'body', 'Questions about this policy can be sent to support@brief.ai.')
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('title', 'Overview', 'body', 'Brief.ai is a document tool built around a simple rule: your files are yours, and we keep as little of them as we can. This policy explains what we collect, how long we keep it, and when your documents are processed on our servers versus entirely inside your own browser.'),
    JSON_OBJECT('title', 'Information we collect', 'body', 'Creating an account requires only an email address, a password, and the professional workspace you choose (Lawyer, Accountant, or Researcher). If you sign in with Google, we receive your email and display name from your Google account instead.\n\nDocuments you upload to your Library, and any files you send through an AI-powered tool, are received by our servers to process your request. Documents you process with a browser-only tool (merge, split, rotate, and similar) never leave your device.'),
    JSON_OBJECT('title', 'How we use information', 'body', 'We use your account details to run the service — authenticating you, applying your plan''s limits, and remembering your workspace preferences. Document content sent to an AI tool is used only to generate the response you asked for, in that single request. We do not use your document content to train any AI model, ours or a third party''s.'),
    JSON_OBJECT('title', 'Data retention & auto-deletion', 'body', 'Files uploaded to a Library project are kept for 24 hours by default, then permanently deleted, unless you extend that project''s retention to 7 or 30 days from the project''s options menu. Once a project expires, its files are removed from our storage — there is no recovery period.\n\nFiles sent through a server-side tool without being saved to your Library (a one-off conversion, for example) are deleted within one hour of the job completing.'),
    JSON_OBJECT('title', 'AI processing', 'body', 'AI features are powered by third-party language model providers. The relevant page or question text is sent to the provider to generate a response and is not retained by Brief.ai beyond that request. We do not permit these providers to use your content to train their models.'),
    JSON_OBJECT('title', 'Cookies & local storage', 'body', 'We use your browser''s local storage to keep you signed in and to remember interface preferences like your last-used workspace. We do not use third-party advertising or tracking cookies.'),
    JSON_OBJECT('title', 'Your rights', 'body', 'You can update your name, email, or password at any time from Settings. You can delete any document or project individually, or permanently delete your entire account and every document in it from Settings — this action is immediate and cannot be undone.'),
    JSON_OBJECT('title', 'Changes to this policy', 'body', 'If we make a material change to how we handle your data, we will update the date at the top of this page and, where appropriate, notify you by email.'),
    JSON_OBJECT('title', 'Contact', 'body', 'Questions about this policy can be sent to support@brief.ai.')
  )),
  NOW(3)
);

SET @termsId = UUID();

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (@termsId, 'terms', 'Terms of Service — Brief.ai', 'The terms that govern use of Brief.ai''s free and paid PDF and AI-powered document tools.');

INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`) VALUES
(
  UUID(), @termsId, 'body', 0,
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('title', 'Acceptance of terms', 'body', 'By creating an account or using any tool on Brief.ai, you agree to these terms. If you do not agree, please don''t use the service.'),
    JSON_OBJECT('title', 'Description of service', 'body', 'Brief.ai provides PDF tools and AI-powered document analysis for legal, accounting, and research workflows. Some tools run entirely in your browser; others require uploading a file to our servers for processing, as described in our Privacy Policy.'),
    JSON_OBJECT('title', 'Free and paid plans', 'body', 'The free plan covers browser-only tools with no account required. AI features and server-side conversion are part of a paid workspace plan, billed on a weekly, monthly, quarterly, or yearly cycle through our payment processor. Prices and included features are shown on the Pricing page and may change with notice.'),
    JSON_OBJECT('title', 'Account responsibilities', 'body', 'You''re responsible for keeping your password confidential and for all activity under your account. Notify us right away if you believe your account has been accessed without authorization.'),
    JSON_OBJECT('title', 'Acceptable use', 'body', 'You agree not to upload content you don''t have the right to process, use the service to break the law, or attempt to disrupt, reverse-engineer, or gain unauthorized access to any part of Brief.ai.'),
    JSON_OBJECT('title', 'Intellectual property', 'body', 'You retain full ownership of every document you upload and every file our tools generate for you. Brief.ai and its branding are our property; using the service doesn''t grant you rights to either.'),
    JSON_OBJECT('title', 'Termination', 'body', 'You can delete your account at any time from Settings. We may suspend or terminate an account that violates these terms, misuses the service, or goes unpaid on a paid plan.'),
    JSON_OBJECT('title', 'Disclaimers & limitation of liability', 'body', 'Brief.ai is provided "as is." AI-generated analysis is a starting point, not professional legal, accounting, or research advice — always verify results before relying on them. To the extent permitted by law, Brief.ai isn''t liable for indirect or consequential damages arising from use of the service.'),
    JSON_OBJECT('title', 'Changes to these terms', 'body', 'We may update these terms as the product evolves. Material changes will be reflected in the date at the top of this page.'),
    JSON_OBJECT('title', 'Contact', 'body', 'Questions about these terms can be sent to support@brief.ai.')
  )),
  JSON_OBJECT('items', JSON_ARRAY(
    JSON_OBJECT('title', 'Acceptance of terms', 'body', 'By creating an account or using any tool on Brief.ai, you agree to these terms. If you do not agree, please don''t use the service.'),
    JSON_OBJECT('title', 'Description of service', 'body', 'Brief.ai provides PDF tools and AI-powered document analysis for legal, accounting, and research workflows. Some tools run entirely in your browser; others require uploading a file to our servers for processing, as described in our Privacy Policy.'),
    JSON_OBJECT('title', 'Free and paid plans', 'body', 'The free plan covers browser-only tools with no account required. AI features and server-side conversion are part of a paid workspace plan, billed on a weekly, monthly, quarterly, or yearly cycle through our payment processor. Prices and included features are shown on the Pricing page and may change with notice.'),
    JSON_OBJECT('title', 'Account responsibilities', 'body', 'You''re responsible for keeping your password confidential and for all activity under your account. Notify us right away if you believe your account has been accessed without authorization.'),
    JSON_OBJECT('title', 'Acceptable use', 'body', 'You agree not to upload content you don''t have the right to process, use the service to break the law, or attempt to disrupt, reverse-engineer, or gain unauthorized access to any part of Brief.ai.'),
    JSON_OBJECT('title', 'Intellectual property', 'body', 'You retain full ownership of every document you upload and every file our tools generate for you. Brief.ai and its branding are our property; using the service doesn''t grant you rights to either.'),
    JSON_OBJECT('title', 'Termination', 'body', 'You can delete your account at any time from Settings. We may suspend or terminate an account that violates these terms, misuses the service, or goes unpaid on a paid plan.'),
    JSON_OBJECT('title', 'Disclaimers & limitation of liability', 'body', 'Brief.ai is provided "as is." AI-generated analysis is a starting point, not professional legal, accounting, or research advice — always verify results before relying on them. To the extent permitted by law, Brief.ai isn''t liable for indirect or consequential damages arising from use of the service.'),
    JSON_OBJECT('title', 'Changes to these terms', 'body', 'We may update these terms as the product evolves. Material changes will be reflected in the date at the top of this page.'),
    JSON_OBJECT('title', 'Contact', 'body', 'Questions about these terms can be sent to support@brief.ai.')
  )),
  NOW(3)
);
