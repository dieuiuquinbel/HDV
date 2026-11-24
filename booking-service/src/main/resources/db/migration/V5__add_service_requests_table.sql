-- V5__add_service_requests_table.sql
-- Bang luu yeu cau goi nuoc / dung cu phuc vu tai san (dong bo da thiet bi & da trinh duyet)
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    venue_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    court_name VARCHAR(255) NOT NULL,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    items TEXT NOT NULL,
    total_amount DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_sr_venue_status (venue_id, status, created_at DESC),
    INDEX idx_sr_booking (booking_id),
    INDEX idx_sr_customer (customer_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
