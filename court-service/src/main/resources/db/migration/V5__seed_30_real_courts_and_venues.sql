-- ===================================================================
-- Migration: V5__seed_30_real_courts_and_venues.sql
-- Muc dich: Chuan hoa 3 Co So Ha Noi va 30 san the thao vat ly thuc te
--           (10 san/co so x 3 co so, kem court_code va image_url cuc bo)
-- ===================================================================

-- 1. Bo sung cot court_code va image_url an toan tren MySQL
SET @dbname = DATABASE();
SET @tablename = 'courts';

SET @col_code = 'court_code';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col_code) > 0,
    'SELECT 1',
    'ALTER TABLE courts ADD COLUMN court_code VARCHAR(50) NULL AFTER name'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @col_img = 'image_url';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @col_img) > 0,
    'SELECT 1',
    'ALTER TABLE courts ADD COLUMN image_url VARCHAR(255) NULL AFTER court_code'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Bo sung loai hinh san catalog con thieu
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'BADMINTON_PRO', 'Sân Cầu Lông Thảm Yonex Pro Cao Cấp', 'DOUBLES', 'PVC_VINYL', 'INDOOR', 4, '13.4m x 6.1m'
FROM sport_types WHERE code = 'BADMINTON'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'TENNIS_GRASS', 'Sân Tennis Mặt Sân Cỏ Wimbledon', 'DOUBLES', 'NATURAL_GRASS', 'OUTDOOR', 4, '23.77m x 10.97m'
FROM sport_types WHERE code = 'TENNIS'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Chuan hoa 3 co so eSportKing tai Ha Noi (CS1: Cau Giay, CS2: Dong Da, CS3: Ha Dong)
INSERT INTO venues (id, owner_id, name, address, district, latitude, longitude, description, status, created_at, updated_at)
VALUES 
(1, 1, 'Trung Tâm Thể Thao ESportKing - Cơ Sở 1 (Cầu Giấy)', 'Số 18 Phố Duy Tân, Phường Dịch Vọng Hậu', 'Quận Cầu Giấy', 21.03130000, 105.78350000, 'Tổ hợp thể thao phức hợp đạt chuẩn thi đấu quốc gia tại Cầu Giấy.', 'ACTIVE', NOW(3), NOW(3)),
(2, 1, 'Trung Tâm Thể Thao ESportKing - Cơ Sở 2 (Đống Đa)', 'Số 102 Phố Trường Chinh, Phường Phương Mai', 'Quận Đống Đa', 21.00280000, 105.83920000, 'Cụm thể thao cao cấp trung tâm Đống Đa với sàn gỗ tự nhiên và sân đất nện.', 'ACTIVE', NOW(3), NOW(3)),
(3, 1, 'Trung Tâm Thể Thao ESportKing - Cơ Sở 3 (Hà Đông)', 'Số 27 Đường Quang Trung, Phường Quang Trung', 'Quận Hà Đông', 20.97210000, 105.77450000, 'Tổ hợp thể thao sinh thái rộng rãi tại Hà Đông với bãi xe lớn và sân cỏ tự nhiên.', 'ACTIVE', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    address = VALUES(address),
    district = VALUES(district),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    description = VALUES(description),
    updated_at = NOW(3);

-- 4. Cap nhat ma san va anh cuc bo cho cac san da co (neu co)
-- Bong da CS1
UPDATE courts SET court_code = 'BD-CS1-01', image_url = '/images/courts/football/football_5_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%B1%' OR (venue_id = 1 AND name LIKE '%5%');
UPDATE courts SET court_code = 'BD-CS1-02', image_url = '/images/courts/football/football_7_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%B2%' OR (venue_id = 1 AND name LIKE '%7%');
UPDATE courts SET court_code = 'BD-CS1-03', image_url = '/images/courts/football/football_11_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%11%';

-- Cau long CS1
UPDATE courts SET court_code = 'CL-CS1-01', image_url = '/images/courts/badminton/badminton_pvc_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%A1%';
UPDATE courts SET court_code = 'CL-CS1-02', image_url = '/images/courts/badminton/badminton_pro_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%A2%';

-- Bong ro CS1
UPDATE courts SET court_code = 'BR-CS1-01', image_url = '/images/courts/basketball/basketball_5x5_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%E1%' OR (venue_id = 1 AND name LIKE '%Bóng Rổ%');
UPDATE courts SET court_code = 'BR-CS1-02', image_url = '/images/courts/basketball/basketball_3x3_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%E2%' OR (venue_id = 1 AND name LIKE '%3x3%');

-- Tennis CS1
UPDATE courts SET court_code = 'TN-CS1-01', image_url = '/images/courts/tennis/tennis_hard_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%D1%';
UPDATE courts SET court_code = 'TN-CS1-02', image_url = '/images/courts/tennis/tennis_clay_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%D2%';
UPDATE courts SET court_code = 'TN-CS1-03', image_url = '/images/courts/tennis/tennis_grass_cs1.jpg' WHERE venue_id = 1 AND name LIKE '%D3%';

-- Bong da CS2
UPDATE courts SET court_code = 'BD-CS2-01', image_url = '/images/courts/football/football_5_cs2.jpg' WHERE venue_id = 2 AND (name LIKE '%5%' OR name LIKE '%B1%');
UPDATE courts SET court_code = 'BD-CS2-02', image_url = '/images/courts/football/football_7_cs2.jpg' WHERE venue_id = 2 AND (name LIKE '%7%' OR name LIKE '%B2%');
UPDATE courts SET court_code = 'BD-CS2-03', image_url = '/images/courts/football/football_11_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%11%';

-- Cau long CS2
UPDATE courts SET court_code = 'CL-CS2-01', image_url = '/images/courts/badminton/badminton_pvc_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%A1%';
UPDATE courts SET court_code = 'CL-CS2-02', image_url = '/images/courts/badminton/badminton_pro_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%A2%';

-- Bong ro CS2
UPDATE courts SET court_code = 'BR-CS2-01', image_url = '/images/courts/basketball/basketball_5x5_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%E1%';
UPDATE courts SET court_code = 'BR-CS2-02', image_url = '/images/courts/basketball/basketball_3x3_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%E2%';

-- Tennis CS2
UPDATE courts SET court_code = 'TN-CS2-01', image_url = '/images/courts/tennis/tennis_hard_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%D1%';
UPDATE courts SET court_code = 'TN-CS2-02', image_url = '/images/courts/tennis/tennis_clay_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%D2%';
UPDATE courts SET court_code = 'TN-CS2-03', image_url = '/images/courts/tennis/tennis_grass_cs2.jpg' WHERE venue_id = 2 AND name LIKE '%D3%';

-- Bong da CS3
UPDATE courts SET court_code = 'BD-CS3-01', image_url = '/images/courts/football/football_5_cs3.jpg' WHERE venue_id = 3 AND (name LIKE '%5%' OR name LIKE '%B4%');
UPDATE courts SET court_code = 'BD-CS3-02', image_url = '/images/courts/football/football_7_cs3.jpg' WHERE venue_id = 3 AND (name LIKE '%7%' OR name LIKE '%B1%');
UPDATE courts SET court_code = 'BD-CS3-03', image_url = '/images/courts/football/football_11_cs3.jpg' WHERE venue_id = 3 AND (name LIKE '%11%' OR name LIKE '%B3%');

-- Cau long CS3
UPDATE courts SET court_code = 'CL-CS3-01', image_url = '/images/courts/badminton/badminton_pvc_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%A1%';
UPDATE courts SET court_code = 'CL-CS3-02', image_url = '/images/courts/badminton/badminton_pro_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%A2%';

-- Bong ro CS3
UPDATE courts SET court_code = 'BR-CS3-01', image_url = '/images/courts/basketball/basketball_5x5_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%E1%';
UPDATE courts SET court_code = 'BR-CS3-02', image_url = '/images/courts/basketball/basketball_3x3_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%E2%';

-- Tennis CS3
UPDATE courts SET court_code = 'TN-CS3-01', image_url = '/images/courts/tennis/tennis_hard_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%D1%';
UPDATE courts SET court_code = 'TN-CS3-02', image_url = '/images/courts/tennis/tennis_clay_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%D2%';
UPDATE courts SET court_code = 'TN-CS3-03', image_url = '/images/courts/tennis/tennis_grass_cs3.jpg' WHERE venue_id = 3 AND name LIKE '%D3%';
