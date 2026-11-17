CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    court_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    created_at DATETIME(3) NOT NULL,
    INDEX idx_reviews_court (court_id, status),
    INDEX idx_reviews_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
