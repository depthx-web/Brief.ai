-- Splits the generic "Office to PDF" / "PDF to Office" tools into per-format
-- entries (Word, Excel, PowerPoint), each individually admin-toggleable —
-- per the tools-catalog-fix doc's Convert table. The underlying conversion
-- engine (LibreOffice via ConversionService) was always format-generic; this
-- only changes routing/admin granularity, not the conversion itself.

-- Rename the two existing rows in place (preserves id/history) — they now
-- represent PowerPoint specifically, since Word and Excel get their own
-- dedicated rows below.
UPDATE `Feature` SET `key` = 'POWERPOINT_TO_PDF', `label` = 'PowerPoint to PDF', `order` = 4
  WHERE `segment` IS NULL AND `key` = 'OFFICE_TO_PDF';
UPDATE `Feature` SET `key` = 'PDF_TO_POWERPOINT', `label` = 'PDF to PowerPoint', `order` = 5
  WHERE `segment` IS NULL AND `key` = 'PDF_TO_OFFICE';

-- New: Word and Excel, split out and prioritized first per the catalog fix.
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), NULL, 'WORD_TO_PDF', 'Word to PDF', false, true, 0),
  (UUID(), NULL, 'PDF_TO_WORD', 'PDF to Word', false, true, 1),
  (UUID(), NULL, 'EXCEL_TO_PDF', 'Excel to PDF', false, true, 2),
  (UUID(), NULL, 'PDF_TO_EXCEL', 'PDF to Excel', false, true, 3);
