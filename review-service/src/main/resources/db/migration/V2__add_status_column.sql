-- V1 already defines status. Normalize legacy values without adding the column twice.
UPDATE reviews SET status = 'PUBLISHED' WHERE status = 'APPROVED';
