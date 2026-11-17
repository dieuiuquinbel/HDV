-- Flyway Migration V2: Fix day_of_week column type to match Java Integer entity
ALTER TABLE operating_hours MODIFY day_of_week INT NOT NULL;
