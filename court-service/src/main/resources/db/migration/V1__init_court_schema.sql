CREATE TABLE IF NOT EXISTS sport_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS venues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    INDEX idx_venues_owner (owner_id),
    INDEX idx_venues_status_district (status, district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venue_id BIGINT NOT NULL,
    sport_type_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 4,
    base_price DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    UNIQUE KEY uk_court_venue_name (venue_id, name),
    INDEX idx_courts_venue_status (venue_id, status),
    INDEX idx_courts_sport_status (sport_type_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operating_hours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NOT NULL,
    day_of_week TINYINT NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    UNIQUE KEY uk_operating_court_day (court_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS price_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NOT NULL,
    effective_from DATE,
    effective_to DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    INDEX idx_price_rules_court (court_id, status, effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
