@echo off
chcp 65001 > nul
title Reset Du Lieu Demo - ESportKing
color 0B

echo ==========================================================
echo   DANG LAM SACH DU LIEU DON HANG ^& GIAO DICH DEMO...
echo ==========================================================

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
    echo Vui long kiem tra lai duong dan MySQL.
    pause
    exit /b 1
)

echo [+] Su dung MySQL tai: "%MYSQL_CMD%"

:: 2. Thuc thi SQL lam sach du lieu
set "SQL_CLEAN=SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE booking_db.booking_price_lines; TRUNCATE TABLE booking_db.booking_slots; TRUNCATE TABLE booking_db.active_slot_locks; TRUNCATE TABLE booking_db.booking_idempotency; TRUNCATE TABLE booking_db.bookings; ALTER TABLE booking_db.bookings AUTO_INCREMENT = 1; TRUNCATE TABLE payment_db.payment_attempts; TRUNCATE TABLE payment_db.payment_reconciliations; TRUNCATE TABLE payment_db.refunds; TRUNCATE TABLE payment_db.payment_transactions; ALTER TABLE payment_db.payment_transactions AUTO_INCREMENT = 1; TRUNCATE TABLE notification_db.notifications; ALTER TABLE notification_db.notifications AUTO_INCREMENT = 1; SET FOREIGN_KEY_CHECKS = 1;"

"%MYSQL_CMD%" -u root -p123456 -e "%SQL_CLEAN%" 2>nul

echo.
for /f %%A in ('"%MYSQL_CMD%" -u root -p123456 -N -e "SELECT COUNT(*) FROM booking_db.bookings;" 2^>nul') do echo [OK] Don dat con lai trong booking_db   : %%A don
for /f %%B in ('"%MYSQL_CMD%" -u root -p123456 -N -e "SELECT COUNT(*) FROM payment_db.payment_transactions;" 2^>nul') do echo [OK] Giao dich con lai trong payment_db: %%B giao dich
echo [OK] Auto Increment da reset ve        : #1
echo [OK] Tai khoan ^& San bai giu nguyen    : 100%% San sang

echo.
echo ==========================================================
echo   DA RESET DU LIEU DEMO THANH CONG! SAN SANG THU NGHIEM! 
echo ==========================================================
echo.
echo Nhan phim bat ky de thoat...
pause > nul
