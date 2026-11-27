@echo off
cd /d "%~dp0"
chcp 65001 > nul
title Reset Du Lieu Demo - ESportKing
color 0B

echo ==========================================================
echo   DANG LAM SACH TOAN BO DON HANG, GIAO DICH ^& TIEN VI...
echo ==========================================================
echo.

:: 0. Doc cau hinh mat khau tu .env neu co
set "DB_PASS=123456"
if exist ".env" (
    for /f "usebackq eol=# tokens=1* delims==" %%A in (".env") do (
        if /i "%%A"=="SPRING_DATASOURCE_PASSWORD" set "DB_PASS=%%B"
        if /i "%%A"=="DB_PASSWORD" set "DB_PASS=%%B"
    )
)

:: 1. Tim duong dan mysql.exe
set "MYSQL_CMD="
for %%I in (mysql.exe) do set "MYSQL_CMD=%%~$PATH:I"

if not defined MYSQL_CMD (
    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        set "MYSQL_CMD=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" (
        set "MYSQL_CMD=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
    ) else (
        for /f "delims=" %%F in ('powershell -NoProfile -Command "(Get-ChildItem -Path 'C:\Program Files\MySQL' -Recurse -Filter 'mysql.exe' -ErrorAction SilentlyContinue | Select-Object -First 1).FullName"') do set "MYSQL_CMD=%%F"
    )
)

if not defined MYSQL_CMD (
    echo [LOI] Khong tim thay mysql.exe tren he thong!
    exit /b 1
)

echo [+] Su dung MySQL tai: "%MYSQL_CMD%"

:: 2. Thuc thi SQL xoa sach don hang, giao dich, vi, thong bao va chuan hoa 5 user (ID 1..5)
set "SQL_CLEAN=SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE booking_db.booking_price_lines; TRUNCATE TABLE booking_db.booking_slots; TRUNCATE TABLE booking_db.active_slot_locks; TRUNCATE TABLE booking_db.booking_idempotency; TRUNCATE TABLE booking_db.bookings; ALTER TABLE booking_db.bookings AUTO_INCREMENT = 1; TRUNCATE TABLE payment_db.payment_attempts; TRUNCATE TABLE payment_db.payment_reconciliations; TRUNCATE TABLE payment_db.refunds; TRUNCATE TABLE payment_db.payment_transactions; ALTER TABLE payment_db.payment_transactions AUTO_INCREMENT = 1; TRUNCATE TABLE payment_db.wallet_transactions; TRUNCATE TABLE payment_db.wallets; ALTER TABLE payment_db.wallets AUTO_INCREMENT = 1; TRUNCATE TABLE notification_db.notifications; ALTER TABLE notification_db.notifications AUTO_INCREMENT = 1; TRUNCATE TABLE user_db.otps; DELETE FROM user_db.users WHERE email NOT IN ('admin', 'staff1', 'staff2', 'staff3', 'customer'); UPDATE user_db.users SET id = id + 1000; UPDATE user_db.users SET id = 1 WHERE email = 'admin'; UPDATE user_db.users SET id = 2 WHERE email = 'staff1'; UPDATE user_db.users SET id = 3 WHERE email = 'staff2'; UPDATE user_db.users SET id = 4 WHERE email = 'staff3'; UPDATE user_db.users SET id = 5 WHERE email = 'customer'; ALTER TABLE user_db.users AUTO_INCREMENT = 6; INSERT INTO payment_db.wallets (user_id, balance, status) VALUES (5, 1000000.00, 'ACTIVE'); SET FOREIGN_KEY_CHECKS = 1;"

"%MYSQL_CMD%" -u root -p%DB_PASS% -e "%SQL_CLEAN%"
if %ERRORLEVEL% neq 0 (
    echo [LOI] Khong the thuc thi SQL lam sach du lieu! Kiem tra lai mat khau MySQL trong .env.
    exit /b 1
)

"%MYSQL_CMD%" -u root -p%DB_PASS% -e "SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE booking_db.service_requests; ALTER TABLE booking_db.service_requests AUTO_INCREMENT = 1; SET FOREIGN_KEY_CHECKS = 1;" 2>nul

echo.
echo [+] Ket qua xac minh sau khi reset:
"%MYSQL_CMD%" -u root -p%DB_PASS% -e "SELECT COUNT(*) AS 'Don dat (bookings)' FROM booking_db.bookings; SELECT COUNT(*) AS 'Giao dich (payments)' FROM payment_db.payment_transactions; SELECT COUNT(*) AS 'Thong bao (notifications)' FROM notification_db.notifications; SELECT id, email, role FROM user_db.users ORDER BY id; SELECT user_id, balance AS 'So du vi' FROM payment_db.wallets;"

echo.
echo [OK] DA RESET SACH TOAN BO DU LIEU! SAN SANG DAT LAI TU DON #1!
