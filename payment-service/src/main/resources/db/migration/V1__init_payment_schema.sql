CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    method VARCHAR(50) NOT NULL DEFAULT 'SIMULATED',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(100) NOT NULL UNIQUE,
    callback_status VARCHAR(50),
    attempt_count INT NOT NULL DEFAULT 1,
    current_attempt_reference VARCHAR(100) NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_payment_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    attempt_no INT NOT NULL,
    attempt_reference VARCHAR(100) NOT NULL UNIQUE,
    provider_transaction_code VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    requested_at DATETIME(3) NOT NULL,
    completed_at DATETIME(3),
    raw_callback_summary TEXT,
    UNIQUE KEY uk_payment_attempt_no (payment_id, attempt_no),
    INDEX idx_attempts_payment (payment_id, requested_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_reconciliations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    next_retry_at DATETIME(3),
    last_error TEXT,
    resolved_at DATETIME(3),
    INDEX idx_reconciliation_status (status, next_retry_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
