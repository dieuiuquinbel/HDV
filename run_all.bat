@echo off
REM ===================================================================
REM File khoi dong he thong Sport Booking (1 Cua So Duy Nhat)
REM 6 Backend Services chay ngam ghi log vao thu muc logs
REM Co Healthcheck cho API Gateway san sang truoc khi mo Frontend
REM ===================================================================

chcp 65001 >nul
title HE THONG SPORT BOOKING (1 CUA SO DUY NHAT)

echo ===================================================================
echo       HE THONG DAT SAN THE THAO - SPORT BOOKING (MICROSERVICES)
echo ===================================================================
echo.

REM 0. Doc file .env neu co de nap bien moi truong (DB, JWT, SMTP Email...)
if exist ".env" (
    for /f "usebackq eol=# tokens=1* delims==" %%A in (".env") do (
        if not "%%A"=="" set "%%A=%%B"
    )
)

REM 1. Kiem tra Java
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [LOI] Khong tim thay Java! Vui long cai dat JDK 17 tro len va them vao PATH.
    pause
    exit /b 1
)

REM 2. Kiem tra Node va npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [LOI] Khong tim thay Node.js hoac npm! Vui long cai dat Node.js de khoi chay Frontend.
    pause
    exit /b 1
)

REM 3. Kiem tra MySQL dang chay tren cong 3306
netstat -ano | findstr :3306 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 goto MYSQL_OK

echo [CANH BAO] Khong phat hien MySQL dang lang nghe tren cong 3306!
echo Hay chac chan MySQL Server da duoc bat truoc khi chay backend.
echo Neu dung Docker: chay lenh 'docker compose up -d mysql'
echo.
set /p CONT="Ban co muon tiep tuc chay khong? (Nhap Y de tiep tuc): "
if /i "%CONT%" neq "Y" exit /b 1

:MYSQL_OK

REM Tao thu muc logs neu chua co
if not exist "logs" mkdir logs

REM 4. Kiem tra neu chua build JAR thi tien hanh build
if exist "user-service\target\user-service-1.0.0-SNAPSHOT.jar" goto JARS_OK
echo [THONG BAO] Dang build cac goi JAR lan dau tien...
call .\mvnw.cmd package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo [LOI] Build that bai! Vui long kiem tra lai ma nguon.
    pause
    exit /b 1
)

:JARS_OK

REM 5. Kiem tra node_modules cua Frontend
if exist "frontend\node_modules" goto NODE_OK
echo [THONG BAO] Dang cai dat thu vien Frontend (npm install)...
cd frontend
call npm install
cd ..

:NODE_OK

echo.
echo Dang khoi dong 6 Backend Services chay ngam va ghi log vao thu muc logs...
echo.

echo   - [1/6] User Service (Port 8081)...
start "" /B java -jar user-service\target\user-service-1.0.0-SNAPSHOT.jar > logs\user-service.log 2>&1

echo   - [2/6] Court Service (Port 8082)...
start "" /B java -jar court-service\target\court-service-1.0.0-SNAPSHOT.jar > logs\court-service.log 2>&1

echo   - [3/6] Booking Service (Port 8083)...
start "" /B java -jar booking-service\target\booking-service-1.0.0-SNAPSHOT.jar > logs\booking-service.log 2>&1

echo   - [4/6] Payment Service (Port 8084)...
start "" /B java -jar payment-service\target\payment-service-1.0.0-SNAPSHOT.jar > logs\payment-service.log 2>&1

echo   - [5/6] Notification Service (Port 8085)...
start "" /B java -jar notification-service\target\notification-service-1.0.0-SNAPSHOT.jar > logs\notification-service.log 2>&1

echo   - [6/6] API Gateway (Port 8080)...
start "" /B java -jar api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar > logs\api-gateway.log 2>&1

echo.
echo [OK] Toan bo 6 Backend Microservices da duoc khoi chay!
echo Dang doi API Gateway san sang tren port 8080...

set /a ATTEMPTS=0
:WAIT_LOOP
set /a ATTEMPTS+=1
timeout /t 2 /nobreak >nul
netstat -ano | findstr :8080 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] API Gateway da san sang!
    goto SERVICES_READY
)
if %ATTEMPTS% geq 25 (
    echo.
    echo [CANH BAO] Sau 50s Gateway chua phan hoi. Ban co the kiem tra log tai thu muc logs/
    goto SERVICES_READY
)
<nul set /p=.
goto WAIT_LOOP

:SERVICES_READY
echo.
echo ===================================================================
echo DANG KHOI CHAY GIAO DIEN FRONTEND (Port 5173)...
echo Dang tu dong mo trinh duyet web: http://localhost:5173
echo ===================================================================
echo.

start http://localhost:5173

cd frontend
npm run dev
