# ESportKing / Sport Booking — hướng dẫn chạy

Cập nhật tài liệu: **17/11/2026**. Java 21, Spring Boot 3.3.2, MySQL 8.0, React 18 và Vite.

## Đọc tài liệu

| Tài liệu | Nội dung sở hữu |
|---|---|
| [Sport.md](Sport.md) | Phạm vi, vai trò và nghiệp vụ hiện tại |
| [Program.md](Program.md) | Công việc còn lại, thứ tự ưu tiên và điều kiện kiểm chứng |
| [Thiết kế và API](docs/design-review-erd-api-contract.md) | Ranh giới service, ERD tham chiếu và hợp đồng kỹ thuật |
| [Lịch sử](docs/archive/lich-su-tai-lieu-truoc-2026-11-13.md) | Bản đặc tả, kế hoạch, rà soát và ghi nhận sửa lỗi trước đợt thống nhất |

Giữ giao diện hiện tại; giai đoạn tiếp theo ưu tiên logic và dữ liệu. Tính năng có mã không đồng nghĩa đã nghiệm thu. Các phần thanh toán/hoàn tiền là mô phỏng, VietQR chưa có xác nhận thu tiền từ ngân hàng.

## 1. Thành phần và điều kiện chạy

| Thành phần | Cổng local | Schema |
|---|---|---|
| Frontend | 5173 | — |
| API Gateway | 8080 | — |
| User | 8081 | user_db |
| Court | 8082 | court_db |
| Booking | 8083 | booking_db |
| Payment | 8084 | payment_db |
| Notification | 8085 | notification_db |

Cần JDK **21**, Node.js/npm, MySQL 8.0; cần Docker Compose nếu chọn chạy container. `mvnw.cmd` hiện ưu tiên đường Maven trên máy tác giả rồi gọi `mvn` trong PATH; đây chưa phải wrapper tự tải Maven dùng chung cho mọi máy.

Cấu hình local được đọc từ `application.yml` của từng service và biến môi trường. `run_all.bat` nạp `.env` nếu tệp tồn tại; `.env.example` đã được loại bỏ. Không chia sẻ thông tin bí mật trong `.env`.

- Mặc định local: MySQL `localhost:3306`, user `root`, password `123456`; đối chiếu cấu hình thực tế trên máy.
- Có thể ghi đè `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` khi chạy riêng từng service.
- Script nạp các biến trong `.env` theo đúng tên; nó không tự chuyển `MYSQL_PASSWORD` thành `SPRING_DATASOURCE_PASSWORD` cho Java. Compose có khai báo ánh xạ riêng.
- OTP dùng `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Khi chưa cấu hình SMTP, mã hiện ghi OTP trong log chế độ thử; mặc định không trả OTP trong HTTP response.
- Flyway tự động quản lý schema cho 5 database nghiệp vụ khi service khởi động.

## 2. Chạy local bằng Windows

Mở thư mục gốc dự án và chạy `run_all.bat`. Script kiểm tra Java/npm/cổng MySQL, build JAR nếu chưa thấy JAR User, cài thư viện frontend nếu thiếu, chạy backend và mở `http://localhost:5173`.

**Sau khi đổi mã backend**, build lại trước khi chạy vì script không tự phát hiện JAR đã cũ:

```powershell
.\mvnw.cmd package -DskipTests
.\run_all.bat
```

Chờ cổng Gateway mở chỉ là kiểm tra tiến trình lắng nghe, chưa chứng minh toàn bộ service sẵn sàng. Khi lỗi, xem `logs/` và endpoint `/actuator/health` của service local tương ứng. Không chạy script nhiều lần khi các tiến trình cũ còn chiếm cổng.

Dừng frontend bằng `Ctrl+C`; để dừng sạch toàn bộ 6 service backend đang chạy nền và giải phóng các cổng 8080-8085, chỉ cần chạy script `stop_all.bat`:

```powershell
.\stop_all.bat
```

Script sẽ tự động tìm và kết thúc nhanh các tiến trình đang chiếm cổng của hệ thống, giúp bạn có thể chạy lại `run_all.bat` bất cứ lúc nào mà không lo bị lỗi xung đột cổng.

## 3. Chạy Docker Compose

```powershell
docker compose up --build -d
docker compose logs -f
docker compose down
```

Frontend: `http://localhost:5173`; Gateway: `http://localhost:8080/api/v1`. Compose dùng một MySQL container với 5 schema riêng (`user_db`, `court_db`, `booking_db`, `payment_db`, `notification_db`), init script tại `docker/mysql/init.sql`. Init script chỉ chạy khi khởi tạo volume MySQL mới. Script SQL hiện gán cứng mật khẩu sport_user là 123456; nếu đổi MYSQL_PASSWORD phải đối chiếu tài khoản DB và cấu hình kết nối, không chỉ đổi .env. Không dùng `down -v` nếu cần giữ dữ liệu.

Đường chạy Docker và migration trên DB sạch cần được kiểm chứng theo [Program.md](Program.md); tài liệu này không tuyên bố đã chạy thành công trên máy mới.

## 4. Chạy riêng để phát triển

Ví dụ, trong terminal tại thư mục gốc:

```powershell
.\mvnw.cmd spring-boot:run -pl user-service
```

Thay tên module để chạy Gateway và các service còn lại, mỗi tiến trình một terminal. Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Tài khoản demo do `user-service/.../cauhinh/KhoiTaoDuLieuMau.java` tạo; dữ liệu DB cũ có thể khác seeder. Các tài khoản hiện được mô tả trong mã gồm `admin@esportking.vn` / `Admin@123`, `customer@esportking.vn` / `Customer@123`, `staff@esportking.vn` / `Staff@123`. Seeder hiện không tạo OWNER.

## 5. Build và kiểm thử

```powershell
.\mvnw.cmd -DskipTests compile
cd frontend
npm run build
```

Các lệnh trên kiểm tra biên dịch/build. Bộ kiểm thử tự động của Booking Service đã được cách ly hoàn toàn sang H2 in-memory DB (`jdbc:h2:mem:booking_test_db`), an toàn 100% khi chạy:

```powershell
.\mvnw.cmd test -pl booking-service
```

Bộ test bao gồm 9 test case tự động (PASS 9/9) kiểm tra: chống đặt trùng slot, tính idempotency, concurrency 2 luồng, đặt sân 90 phút, check-in chuyển CHECKED_IN giữ slot lock, trả sân COMPLETED giải phóng lock, phân quyền OWNER/STAFF/CUSTOMER, preview voucher giảm tiền cố định THETHAO50 và validation thời lượng/giờ hoạt động.
