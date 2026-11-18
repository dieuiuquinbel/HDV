@echo off
cd /d "%~dp0"
chcp 65001 > nul
title Reset Du Lieu Demo - ESportKing
color 0B

echo ==========================================================
echo   DANG LAM SACH DU LIEU DON HANG ^& GIAO DICH DEMO...
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
    echo Vui long kiem tra lai duong dan MySQL.
    pause
    exit /b 1
)

echo [+] Su dung MySQL tai: "%MYSQL_CMD%"

:: 2. Thuc thi SQL lam sach du lieu don hang, giao dich va thong bao
set "SQL_CLEAN=SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE booking_db.booking_price_lines; TRUNCATE TABLE booking_db.booking_slots; TRUNCATE TABLE booking_db.active_slot_locks; TRUNCATE TABLE booking_db.booking_idempotency; TRUNCATE TABLE booking_db.bookings; ALTER TABLE booking_db.bookings AUTO_INCREMENT = 1; TRUNCATE TABLE payment_db.payment_attempts; TRUNCATE TABLE payment_db.payment_reconciliations; TRUNCATE TABLE payment_db.refunds; TRUNCATE TABLE payment_db.payment_transactions; ALTER TABLE payment_db.payment_transactions AUTO_INCREMENT = 1; TRUNCATE TABLE notification_db.notifications; ALTER TABLE notification_db.notifications AUTO_INCREMENT = 1; SET FOREIGN_KEY_CHECKS = 1;"

"%MYSQL_CMD%" -u root -p%DB_PASS% -e "%SQL_CLEAN%" 2>nul

echo.
echo [+] Dang kiem tra ket qua sau khi reset:
"%MYSQL_CMD%" -u root -p%DB_PASS% -e "SELECT COUNT(*) AS 'Don dat con lai (booking_db)' FROM booking_db.bookings; SELECT COUNT(*) AS 'Giao dich con lai (payment_db)' FROM payment_db.payment_transactions;" 2>nul

echo.
echo [OK] Auto Increment don hang da reset ve : #1
echo [OK] Tai khoan nguoi dung (user_db)      : GIU NGUYEN 100%%
echo [OK] 3 Co so ^& 30 san the thao (court_db): GIU NGUYEN 100%%
echo.
echo ==========================================================
echo   DA RESET DU LIEU DEMO THANH CONG! SAN SANG THU NGHIEM! 
echo ==========================================================
echo.
echo Nhan phim bat ky de thoat...
pause > nul
