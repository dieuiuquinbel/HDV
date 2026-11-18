CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS court_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tao tai khoan sport_user neu chua co va cap mat khau dong bo 123456
CREATE USER IF NOT EXISTS 'sport_user'@'%' IDENTIFIED BY '123456';
ALTER USER 'sport_user'@'%' IDENTIFIED BY '123456';
CREATE USER IF NOT EXISTS 'sport_user'@'localhost' IDENTIFIED BY '123456';
ALTER USER 'sport_user'@'localhost' IDENTIFIED BY '123456';

GRANT ALL PRIVILEGES ON user_db.* TO 'sport_user'@'%', 'sport_user'@'localhost';
GRANT ALL PRIVILEGES ON court_db.* TO 'sport_user'@'%', 'sport_user'@'localhost';
GRANT ALL PRIVILEGES ON booking_db.* TO 'sport_user'@'%', 'sport_user'@'localhost';
GRANT ALL PRIVILEGES ON payment_db.* TO 'sport_user'@'%', 'sport_user'@'localhost';
GRANT ALL PRIVILEGES ON notification_db.* TO 'sport_user'@'%', 'sport_user'@'localhost';
FLUSH PRIVILEGES;
