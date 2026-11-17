CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_slot TIME NOT NULL,
    end_slot TIME NOT NULL,
    total_amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(50) NOT NULL,
    expired_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_bookings_customer (customer_id, created_at DESC),
    INDEX idx_bookings_court_date (court_id, booking_date),
    INDEX idx_bookings_status_expired (status, expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    slot_start TIME NOT NULL,
    slot_end TIME NOT NULL,
    UNIQUE KEY uk_booking_slot_start (booking_id, slot_start),
    INDEX idx_booking_slots_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_price_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    slot_start TIME NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    line_amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    UNIQUE KEY uk_price_line_slot (booking_id, slot_start),
    INDEX idx_booking_price_lines_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS active_slot_locks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    slot_start TIME NOT NULL,
    created_at DATETIME(3) NOT NULL,
    UNIQUE KEY uk_active_slot_lock (court_id, booking_date, slot_start),
    INDEX idx_active_slot_locks_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_idempotency (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    booking_id BIGINT NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    UNIQUE KEY uk_customer_idempotency (customer_id, idempotency_key),
    INDEX idx_idempotency_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
