-- ===================================================================
-- Migration: V3__court_type_catalog_and_refactor.sql
-- Muc dich: Xay dung danh muc chuan court_type_catalog, tach biet operational courts,
--           ho tro thoi luong linh hoat 60/90/120p, chuan hoa status ACTIVE/INACTIVE/MAINTENANCE,
--           bo sung bang amenities va venue_amenities.
-- ===================================================================

-- 1. Bo sung day du 6 mon the thao chuan toan he thong
INSERT INTO sport_types (code, name) VALUES 
('BADMINTON', 'Cầu Lông'),
('FOOTBALL', 'Bóng Đá'),
('PICKLEBALL', 'Pickleball'),
('TENNIS', 'Tennis'),
('BASKETBALL', 'Bóng Rổ'),
('VOLLEYBALL', 'Bóng Chuyền')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Tao bang danh muc loai hinh san chuan toan he thong
CREATE TABLE IF NOT EXISTS court_type_catalog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sport_type_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    config_type VARCHAR(50) NOT NULL,    -- SINGLES, DOUBLES, 5_A_SIDE, 7_A_SIDE, 11_A_SIDE, 3X3, 5X5, BEACH, INDOOR
    surface VARCHAR(50) NOT NULL,        -- PVC_VINYL, WOOD, ARTIFICIAL_TURF, NATURAL_GRASS, HARD_ACRYLIC, CLAY, SAND
    environment VARCHAR(30) NOT NULL,    -- INDOOR, OUTDOOR, ROOFED
    default_capacity INT NOT NULL DEFAULT 4,
    dimensions VARCHAR(50) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_catalog_sport (sport_type_id),
    CONSTRAINT fk_catalog_sport FOREIGN KEY (sport_type_id) REFERENCES sport_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed danh muc chuan cho ca 6 mon the thao dung SELECT ID tu dong
-- Cầu lông
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'BADMINTON_PVC', 'Sân Cầu Lông Thảm PVC Thi Đấu', 'DOUBLES', 'PVC_VINYL', 'INDOOR', 4, '13.4m x 6.1m'
FROM sport_types WHERE code = 'BADMINTON'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'BADMINTON_WOOD', 'Sân Cầu Lông Sàn Gỗ Tự Nhiên', 'DOUBLES', 'WOOD', 'INDOOR', 4, '13.4m x 6.1m'
FROM sport_types WHERE code = 'BADMINTON'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Bóng đá
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'FOOTBALL_5_TURF', 'Sân Bóng Đá Mini 5 Người Cỏ Nhân Tạo', '5_A_SIDE', 'ARTIFICIAL_TURF', 'OUTDOOR', 10, '20m x 40m'
FROM sport_types WHERE code = 'FOOTBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'FOOTBALL_7_TURF', 'Sân Bóng Đá 7 Người Cỏ Nhân Tạo', '7_A_SIDE', 'ARTIFICIAL_TURF', 'OUTDOOR', 14, '30m x 50m'
FROM sport_types WHERE code = 'FOOTBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'FOOTBALL_11_GRASS', 'Sân Bóng Đá 11 Người Cỏ Tự Nhiên', '11_A_SIDE', 'NATURAL_GRASS', 'OUTDOOR', 22, '68m x 105m'
FROM sport_types WHERE code = 'FOOTBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'FOOTBALL_FUTSAL', 'Sân Futsal Trong Nhà Sàn Gỗ/Nhựa', '5_A_SIDE', 'WOOD', 'INDOOR', 10, '20m x 40m'
FROM sport_types WHERE code = 'FOOTBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Pickleball
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'PICKLEBALL_ACRYLIC_OUTDOOR', 'Sân Pickleball Bê Tông Acrylic Ngoài Trời', 'DOUBLES', 'HARD_ACRYLIC', 'OUTDOOR', 4, '13.4m x 6.1m'
FROM sport_types WHERE code = 'PICKLEBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'PICKLEBALL_INDOOR', 'Sân Pickleball Có Mái Che / Trong Nhà', 'DOUBLES', 'HARD_ACRYLIC', 'ROOFED', 4, '13.4m x 6.1m'
FROM sport_types WHERE code = 'PICKLEBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Tennis
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'TENNIS_HARD_COURT', 'Sân Tennis Mặt Sân Cứng Decoturf/Acrylic', 'DOUBLES', 'HARD_ACRYLIC', 'OUTDOOR', 4, '23.77m x 10.97m'
FROM sport_types WHERE code = 'TENNIS'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'TENNIS_CLAY', 'Sân Tennis Đất Nện Tiêu Chuẩn', 'DOUBLES', 'CLAY', 'OUTDOOR', 4, '23.77m x 10.97m'
FROM sport_types WHERE code = 'TENNIS'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Bóng rổ
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'BASKETBALL_3X3', 'Sân Bóng Rổ Nửa Sân (3x3) Ngoài Trời', '3X3', 'HARD_ACRYLIC', 'OUTDOOR', 6, '15m x 11m'
FROM sport_types WHERE code = 'BASKETBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'BASKETBALL_5X5_WOOD', 'Sân Bóng Rổ Toàn Sân (5x5) Sàn Gỗ Thi Đấu', '5X5', 'WOOD', 'INDOOR', 10, '28m x 15m'
FROM sport_types WHERE code = 'BASKETBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Bóng chuyền (sport_type_id = (SELECT id FROM sport_types WHERE code='VOLLEYBALL'))
INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'VOLLEYBALL_INDOOR', 'Sân Bóng Chuyền Thi Đấu Trong Nhà', 'INDOOR', 'WOOD', 'INDOOR', 12, '18m x 9m'
FROM sport_types WHERE code = 'VOLLEYBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO court_type_catalog (sport_type_id, code, name, config_type, surface, environment, default_capacity, dimensions)
SELECT id, 'VOLLEYBALL_BEACH', 'Sân Bóng Chuyền Bãi Biển / Cát Mịn', 'BEACH', 'SAND', 'OUTDOOR', 4, '16m x 8m'
FROM sport_types WHERE code = 'VOLLEYBALL'
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Bo sung cac cot thoi luong va court_type_id vao bang courts (Nullable ban dau)
ALTER TABLE courts 
    ADD COLUMN court_type_id BIGINT NULL AFTER sport_type_id,
    ADD COLUMN slot_step_minutes INT NOT NULL DEFAULT 30 AFTER base_price,
    ADD COLUMN min_duration_minutes INT NOT NULL DEFAULT 60 AFTER slot_step_minutes,
    ADD COLUMN max_duration_minutes INT NOT NULL DEFAULT 120 AFTER min_duration_minutes;

-- 5. Chuan hoa status cu sang tap ACTIVE / INACTIVE / MAINTENANCE
UPDATE courts SET status = 'ACTIVE' WHERE status IN ('AVAILABLE', 'OCCUPIED', 'ACTIVE', 'CONFIRMED');
UPDATE courts SET status = 'INACTIVE' WHERE status = 'INACTIVE';
UPDATE courts SET status = 'MAINTENANCE' WHERE status = 'MAINTENANCE';

-- 6. Backfill an toan court_type_id cho toan bo san hien tai (neu co)
-- Cau long
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'BADMINTON_PVC') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'BADMINTON') AND court_type_id IS NULL;

-- Bong da 5 nguoi
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'FOOTBALL_5_TURF') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'FOOTBALL') AND (name LIKE '%5%' OR name LIKE '%Mini%') AND court_type_id IS NULL;

-- Bong da 11 nguoi
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'FOOTBALL_11_GRASS') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'FOOTBALL') AND name LIKE '%11%' AND court_type_id IS NULL;

-- Bong da 7 nguoi (hoac mac dinh bong da con lai)
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'FOOTBALL_7_TURF') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'FOOTBALL') AND court_type_id IS NULL;

-- Pickleball co mai che / VIP
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'PICKLEBALL_INDOOR') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'PICKLEBALL') AND (name LIKE '%Mái Che%' OR name LIKE '%VIP%') AND court_type_id IS NULL;

-- Pickleball ngoai troi / tieu chuan
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'PICKLEBALL_ACRYLIC_OUTDOOR') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'PICKLEBALL') AND court_type_id IS NULL;

-- Tennis
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'TENNIS_HARD_COURT') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'TENNIS') AND court_type_id IS NULL;

-- Bong ro
UPDATE courts SET court_type_id = (SELECT id FROM court_type_catalog WHERE code = 'BASKETBALL_5X5_WOOD') 
WHERE sport_type_id = (SELECT id FROM sport_types WHERE code = 'BASKETBALL') AND court_type_id IS NULL;

-- Fallback cho bat ky san nao con sot
UPDATE courts c
JOIN court_type_catalog ctc ON ctc.sport_type_id = c.sport_type_id
SET c.court_type_id = ctc.id
WHERE c.court_type_id IS NULL;

-- 7. Sau khi backfill hoan tat 100%, bat buoc NOT NULL va tao khoa ngoai
ALTER TABLE courts MODIFY COLUMN court_type_id BIGINT NOT NULL;
ALTER TABLE courts ADD CONSTRAINT fk_courts_catalog FOREIGN KEY (court_type_id) REFERENCES court_type_catalog(id);
CREATE INDEX idx_courts_catalog ON courts(court_type_id);

-- 8. Tao bang danh muc tien ich amenities va bang quan he venue_amenities
CREATE TABLE IF NOT EXISTS amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO amenities (code, name, icon) VALUES 
('LIGHTING', 'Đèn chiếu sáng ban đêm', 'lightbulb'),
('PARKING', 'Bãi đỗ ô tô & xe máy', 'car'),
('SHOWER', 'Phòng thay đồ & tắm nóng lạnh', 'bath'),
('DRINK', 'Căn tin & nước giải khát', 'coffee'),
('RENTAL_EQUIPMENT', 'Cho thuê vợt, bóng & áo bib', 'shirt'),
('WIFI', 'Wifi miễn phí tốc độ cao', 'wifi')
ON DUPLICATE KEY UPDATE name=VALUES(name);

CREATE TABLE IF NOT EXISTS venue_amenities (
    venue_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (venue_id, amenity_id),
    CONSTRAINT fk_va_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    CONSTRAINT fk_va_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gan tien ich tieu chuan cho tat ca cac cum san hien co (venues 1 den 8)
INSERT IGNORE INTO venue_amenities (venue_id, amenity_id)
SELECT v.id, a.id FROM venues v CROSS JOIN amenities a WHERE a.code IN ('LIGHTING', 'PARKING', 'DRINK');

INSERT IGNORE INTO venue_amenities (venue_id, amenity_id)
SELECT v.id, a.id FROM venues v CROSS JOIN amenities a WHERE v.id IN (1, 3, 5, 6, 8) AND a.code IN ('SHOWER', 'WIFI');

INSERT IGNORE INTO venue_amenities (venue_id, amenity_id)
SELECT v.id, a.id FROM venues v CROSS JOIN amenities a WHERE v.id IN (2, 4, 7) AND a.code IN ('RENTAL_EQUIPMENT');
