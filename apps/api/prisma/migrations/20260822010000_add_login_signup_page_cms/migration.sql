-- Seed: "login" and "signup" pages — SEO fields only (no ContentSection
-- rows), same pattern as the 'tools' page migration. Plain string columns,
-- no JSON — safe on MariaDB as well as MySQL.

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (UUID(), 'login', 'Log In — Dossiera', 'Log in to your Dossiera account to access AI-powered tools and your document library.'),
  (UUID(), 'signup', 'Sign Up — Dossiera', 'Create a free Dossiera account — core PDF tools are free forever, with paid AI features per workspace.');
