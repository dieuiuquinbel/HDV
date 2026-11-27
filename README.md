# ESportKing — Hệ Thống Đặt Sân Thể Thao Thông Minh Chuẩn Thi Đấu
> **Đồ Án Chuyên Ngành: Phát Triển Phần Mềm Hướng Dịch Vụ (Service-Oriented Architecture - SOA & Microservices)**  
> **Phiên bản:** 2.2 (Cập nhật: 27/11/2026) — Hỗ trợ 6 Microservices, Redis Token Cache, RabbitMQ Async Notification, Trợ lý AI 2-trong-1, Gọi dịch vụ tại sân, Ví điện tử SportPay, Popup Hủy & Hoàn tiền thời gian thực (Framer Motion), cấu hình tài khoản tập trung `tai-khoan-mac-dinh.json` & Check-in QR động.

---

## 📚 Hệ Thống Tài Liệu Chuẩn Đồ Án

Hệ thống tài liệu dự án được tổ chức thành **5 tài liệu chuẩn mực**, phân định rõ ràng giữa Hướng dẫn vận hành, Kiến trúc nghiệp vụ, Phân công nhóm, Kỹ thuật bảo mật và Lịch trình hoàn thành:

| Tài liệu | Nội dung sở hữu chính |
|---|---|
| 📘 **[README.md](README.md)** *(Tài liệu này)* | Hướng dẫn cài đặt môi trường, phân bổ Port/Database, lệnh chạy 1-click Windows & Docker Compose, tài khoản demo. |
| 📗 **[KIEN_TRUC_VA_NGHIEP_VU.md](KIEN_TRUC_VA_NGHIEP_VU.md)** | Chi tiết kiến trúc 6 microservices, cách móc nối liên dịch vụ, cơ chế Gateway & CSRF, đặc tả 10 luồng nghiệp vụ từ Frontend đến Backend. |
| 📒 **[CAU_TRUC_CHUONG_TRINH_VA_PHAN_CONG_NHOM.md](CAU_TRUC_CHUONG_TRINH_VA_PHAN_CONG_NHOM.md)** | Cấu trúc thư mục chương trình, phân công 5 thành viên (mỗi người 1 microservice) và tổng hợp Service 6 (`api-gateway`) + hạ tầng cho Trưởng nhóm. |
| 🛡️ **[BAO_CAO_KY_THUAT_VA_BAO_MAT_HE_THONG.md](BAO_CAO_KY_THUAT_VA_BAO_MAT_HE_THONG.md)** | Báo cáo tổng hợp bảo mật (SQL/Prompt Injection, CSRF, JWT+Redis, OTP, QR HMAC), RBAC 4 roles, chống đặt trùng/quá giờ, thanh toán, hoàn tiền & câu hỏi phản biện. |
| 📙 **[BAO_CAO_TIEN_DO_PHAT_TRIEN.md](BAO_CAO_TIEN_DO_PHAT_TRIEN.md)** | Báo cáo tiến độ hoàn thành qua 5 giai đoạn, bảng đối chiếu tiêu chuẩn nghiệm thu đồ án và kịch bản Demo 7 bước trước hội đồng. |

---

## 1. Danh Mục Các Dịch Vụ & Phân Bổ Cổng (Ports & Schemas)

Hệ thống được thiết kế theo đúng kiến trúc vi dịch vụ (Microservices Architecture), trong đó mỗi service nghiệp vụ độc lập quản lý một cơ sở dữ liệu riêng biệt (Database-per-service pattern):

| Tên Dịch Vụ | Module Thư Mục | Cổng (Port) | Schema Database | Chức Năng Cốt Lõi |
|---|---|---|---|---|
| **API Gateway** | `api-gateway` | **8080** | *(Redis Cache)* | Cổng vào duy nhất (Single Entrypoint), định tuyến đường dẫn, giải mã JWT từ Cookie, chống CSRF Double Submit, kiểm tra thu hồi phiên qua **Redis** (`Token Revocation`). |
| **User Service** | `user-service` | **8081** | `user_db` | Quản lý người dùng, phân quyền chuẩn hóa 3 vai trò (`CUSTOMER`, `STAFF`, `ADMIN`), đăng nhập/đăng ký, gửi & xác thực mã OTP, tự động nạp/đồng bộ tài khoản từ `tai-khoan-mac-dinh.json` và đồng bộ `tokenVersion` lên Redis. |
| **Court Service** | `court-service` | **8082** | `court_db` | Quản lý danh mục 3 cơ sở tại Hà Nội, môn thể thao (Bóng đá, Cầu lông, Bóng rổ, Tennis), 30 sân thi đấu độc lập, bảng giá theo khung giờ, phụ phí giờ vàng/đèn LED và tiện ích. |
| **Booking Service** | `booking-service` | **8083** | `booking_db` | Lịch khả dụng, lưới khung giờ 30 phút, khóa slot tạm thời 10 phút chống đặt trùng, báo giá real-time, Voucher Engine, QR Check-in HMAC, **Trợ lý AI (Gemini API)** và **Yêu cầu phục vụ tại sân** (`service_requests`). |
| **Payment Service** | `payment-service` | **8084** | `payment_db` | Quản lý giao dịch thanh toán (VietQR Techcombank, Thẻ Visa/Mastercard, Ví điện tử SportPay), nạp tiền VietQR vào ví, rút tiền demo về ngân hàng, hoàn tiền tự động vào ví khi hủy đơn. |
| **Notification Service** | `notification-service` | **8085** | `notification_db` | Nhận sự kiện bất đồng bộ qua **RabbitMQ** (kèm fallback REST), lưu trữ thông báo in-app theo vai trò & cơ sở, bộ đếm chưa đọc thời gian thực, đánh dấu đã đọc (`read-all`). |
| **Web Frontend** | `frontend` | **5173** | *(Client SPA)* | Ứng dụng React 18 + Vite + Tailwind CSS, Widget nổi **Trợ lý AI & Gọi phục vụ tại sân** (linh vật mèo), Role Route Guards, Modal Ví SportPay (Portal), âm thanh chuông Web Audio API. |
| **Hạ tầng (Docker)** | `docker-compose.yml` | **3306 / 6379 / 5672** | `MySQL / Redis / RabbitMQ` | Đóng gói đồng bộ **10 container** trong mạng nội bộ `sport-network` (MySQL 8.0, Redis 7, RabbitMQ 3.13 Management UI port `15672`, 6 microservices và Frontend Nginx). |

---

## 2. Yêu Cầu Môi Trường Cài Đặt

Trước khi khởi động hệ thống, máy tính của bạn cần được cài đặt sẵn:
* **Java Development Kit (JDK):** Phiên bản **21** (Khuyến nghị Oracle JDK 21 hoặc Eclipse Temurin 21).
* **Node.js & npm:** Phiên bản Node.js **18.x** hoặc **20.x**.
* **Hệ quản trị CSDL:** **MySQL 8.0** đang chạy tại `localhost:3306`.
* **Maven:** Dự án đã tích hợp sẵn Maven Wrapper (`mvnw.cmd`), không bắt buộc cài Maven toàn cục.
* **Docker & Docker Compose:** *(Tùy chọn)* Nếu muốn chạy toàn bộ hệ thống bằng container.

---

## 3. Hướng Dẫn Chạy Trên Windows (Local Development)

### Bước 1: Chuẩn bị Cơ sở dữ liệu MySQL
1. Khởi động MySQL Server trên máy (port mặc định `3306`).
2. Mở MySQL Workbench hoặc dòng lệnh và tạo sẵn 5 schema bằng script tại `docker/mysql/init.sql`, hoặc chạy script SQL sau:
   ```sql
   CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS court_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Flyway Migration trong từng service sẽ tự động tạo bảng và nạp dữ liệu mẫu khi service khởi động).*

### Bước 2: Chạy 1-Click Toàn Bộ Hệ Thống
Mở Command Prompt hoặc PowerShell tại thư mục gốc dự án và chạy:
```powershell
.\run_all.bat
```
*Script sẽ tự động:*
* Kiểm tra phiên bản Java, Node.js và cổng MySQL.
* Biên dịch dự án nếu thiếu file `.jar`.
* Cài đặt `node_modules` cho frontend nếu chạy lần đầu.
* Khởi động ngầm 6 microservices backend (ghi log riêng vào thư mục `logs/`).
* Khởi động Vite frontend và tự động mở trình duyệt tại địa chỉ: **`http://localhost:5173`**.

### Bước 3: Đóng / Dừng Hệ Thống Khi Không Sử Dụng
* Dừng Frontend: Nhấn tổ hợp phím `Ctrl + C` tại cửa sổ dòng lệnh frontend.
* Dừng Backend: Để tắt các service backend đang chạy nền và giải phóng các cổng 8080–8085, bạn có thể đóng cửa sổ terminal tương ứng hoặc kết thúc tiến trình `java.exe` qua Task Manager (hoặc chạy lệnh: `Stop-Process -Name java -Force` trong PowerShell).

---

## 4. Hướng Dẫn Chạy Bằng Docker Compose

Nếu môi trường đã có Docker Desktop:
```powershell
# 1. Khởi động toàn bộ 10 container (MySQL, Redis, RabbitMQ, 6 backend services, frontend)
docker compose up --build -d

# 2. Xem log hợp nhất toàn hệ thống
docker compose logs -f

# 3. Dừng và giải phóng container
docker compose down
```
* Sau khi khởi động thành công:
  * Frontend: `http://localhost:5173`
  * API Gateway: `http://localhost:8080/api/v1`
  * RabbitMQ Management UI: `http://localhost:15672` (`guest` / `guest`)
  * Redis: `localhost:6379`
  * MySQL: `localhost:3306` (user: `sport_user`, password: `123456`)

---

## 5. Danh Sách Tài Khoản Thử Nghiệm (Demo Accounts)

Toàn bộ tài khoản mặc định được quản lý tập trung tại **1 file duy nhất** ở thư mục gốc: **[`tai-khoan-mac-dinh.json`](tai-khoan-mac-dinh.json)**. Khi bạn sửa file này, cả giao diện Frontend (nút 1-Click Login) lẫn `user-service` (khi khởi động lại) sẽ tự động đồng bộ mà không cần sửa code hay build lại JAR.

| Vai Trò | Tên Đăng Nhập | Mật Khẩu | Quyền Hạn & Phạm Vi Hoạt Động |
|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | Quản trị toàn hệ thống tại `/admin`, xem thống kê doanh thu đa chiều, quản lý tài khoản người dùng, điều chỉnh giá/trạng thái 30 sân và kiểm tra trạm check-in tất cả cơ sở. |
| **STAFF (CS1)** | `staff1` | `staff123` | Nhân viên trực ban Cơ Sở 1 (Cầu Giấy): Chuyên trách màn hình Trạm Check-in QR (`/checkin`), đối soát vé, xác nhận nhận sân/trả sân và điều phối dịch vụ tại sân. |
| **STAFF (CS2)** | `staff2` | `staff123` | Nhân viên trực ban Cơ Sở 2 (Đống Đa). |
| **STAFF (CS3)** | `staff3` | `staff123` | Nhân viên trực ban Cơ Sở 3 (Long Biên). |
| **CUSTOMER** | `customer` | `customer123` | Khách hàng thành viên: Được khởi tạo sẵn **1.000.000 đ** trong Ví SportPay để trải nghiệm đặt sân 1-chạm, hủy vé qua popup hoàn tiền tự động vào ví, và rút tiền demo về ngân hàng. |

---

## 6. Tiện Ích Làm Sạch Dữ Liệu Demo (`reset_demo_data.bat`)

Trong quá trình chạy thử hoặc demo trước hội đồng, nếu bạn đã tạo nhiều đơn đặt sân, vé check-in và biến động số dư ví, bạn có thể đưa toàn bộ cơ sở dữ liệu về trạng thái sạch sẽ ban đầu bằng lệnh:
```powershell
.\reset_demo_data.bat
```
Script sẽ tự động làm sạch các bảng dữ liệu phát sinh (`bookings`, `active_slot_locks`, `service_requests`, `payment_transactions`, `wallets`, `notifications`), chuẩn hóa ID tài khoản mẫu (`1..5`), giữ nguyên danh mục 30 sân và dữ liệu chuẩn của hệ thống.
