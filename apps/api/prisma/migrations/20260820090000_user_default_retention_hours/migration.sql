-- Adds a per-user default file retention setting (Settings -> Privacy ->
-- "Default file retention"). Null keeps today's platform default (24h);
-- 0 means "Never" (only ever set for paid accounts, enforced server-side).

ALTER TABLE `User` ADD COLUMN `defaultRetentionHours` INT NULL;
