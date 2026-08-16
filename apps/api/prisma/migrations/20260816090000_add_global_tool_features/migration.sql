-- AlterTable: segment becomes nullable — a null-segment Feature row applies
-- to every workspace (Office<->PDF conversion, Protect, Remove Password)
-- rather than one profession's AI operation. See schema.prisma for the
-- FeatureGuard lookup semantics and the MySQL NULL-uniqueness caveat.
ALTER TABLE `Feature` MODIFY COLUMN `segment` ENUM('LAWYER', 'ACCOUNTANT', 'RESEARCHER') NULL;

-- Seed: the 4 tools previously gated by the blanket RequirePaidPlanGuard,
-- now individually admin-toggleable the same way the 14 AI operations
-- already are. freeEnabled starts false (matches current live behavior —
-- BILLING_ENFORCED gates all of this anyway, so this migration changes
-- nothing until an admin actually flips a toggle).
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), NULL, 'OFFICE_TO_PDF', 'Office to PDF', false, true, 0),
  (UUID(), NULL, 'PDF_TO_OFFICE', 'PDF to Office', false, true, 1),
  (UUID(), NULL, 'PROTECT_PDF', 'Protect PDF', false, true, 0),
  (UUID(), NULL, 'REMOVE_PASSWORD', 'Remove Password', false, true, 1);
