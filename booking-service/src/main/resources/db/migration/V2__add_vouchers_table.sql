-- V2__add_vouchers_table.sql
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    discount_percent INT NOT NULL DEFAULT 0,
    discount_amount DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    max_discount DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    min_order_amount DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_voucher_code_active (code, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO vouchers (code, description, discount_percent, discount_amount, max_discount, min_order_amount, is_active)
VALUES 
('CHAOBANMOI', 'Giam 20% cho khach hang moi toi da 100k', 20, 0, 100000, 100000, true),
('THETHAO50', 'Giam ngay 50k cho don tu 200k', 0, 50000, 50000, 200000, true),
('CUOITUAN', 'Giam 15% don san cuoi tuan toi da 80k', 15, 0, 80000, 150000, true)
ON DUPLICATE KEY UPDATE description=VALUES(description);
