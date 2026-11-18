-- V3__add_customer_and_version.sql
-- Bo sung customer_id (mac dinh 0 de khong bi NullPointerException tren ban ghi cu) va version (cho JPA Optimistic Locking)
ALTER TABLE payment_transactions
    ADD COLUMN customer_id BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
