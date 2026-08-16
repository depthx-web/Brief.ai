-- Seed: PDF to HTML (PDF to Web Page) — server-side via poppler's
-- pdftohtml, individually admin-toggleable like every other tool in the
-- catalog-fix pass. PDF to Plain Text is client-side/free and needs no
-- Feature row (same as merge/split/etc).
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), NULL, 'PDF_TO_HTML', 'PDF to HTML', false, true, 6);
