-- Seed: "tools" page — SEO fields only (no ContentSection rows) for the
-- tools catalog route (/tools), which previously had zero admin-editable
-- metadata at all (no generateMetadata in the page, no CMS entry). Plain
-- string columns only, no JSON — safe on MariaDB (this environment's real
-- engine, per the 20260821230000 incident) as well as MySQL.

INSERT INTO `Page` (`id`, `slug`, `metaTitle`, `metaDescription`) VALUES
  (UUID(), 'tools', 'All Tools — Dossiera', 'Every PDF and AI-powered document tool in one place — convert, organize, protect, and analyze, free for core tools with no account required.');
