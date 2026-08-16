-- Seed: Compress (High Ratio) — server-side, image-recompression-based
-- compression (Ghostscript), individually admin-toggleable like every other
-- tool in the catalog-fix pass.
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), NULL, 'COMPRESS_HIGH_RATIO', 'Compress (High Ratio)', false, true, 0);
