-- V3__add_checked_in_at.sql
ALTER TABLE bookings
    ADD COLUMN checked_in_at DATETIME(3) NULL;
