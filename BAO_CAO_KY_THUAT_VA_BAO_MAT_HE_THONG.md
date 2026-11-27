# ESportKing — Báo Cáo Kỹ Thuật, Bảo Mật & Các Cơ Chế Xử Lý Cốt Lõi
> **Tài liệu Tổng hợp Bảo vệ Đồ án Môn: Phát Triển Phần Mềm Hướng Dịch Vụ (SOA & Microservices)**  
> **Hệ thống:** ESportKing Smart Sport Booking Platform (Hà Nội — 6 Microservices, 5 Database, Redis, RabbitMQ, React 18)  
> **Cập nhật:** 26/11/2026 (Phiên bản nghiệm thu v2.2)

---

## MỤC LỤC
1. [Cơ Chế Phòng Chống Tấn Công (SQL Injection, Prompt Injection, XSS, CSRF, IDOR)](#1-cơ-chế-phòng-chống-tấn-công-sql-injection-prompt-injection-xss-csrf-idor)
2. [Kiến Trúc Bảo Mật Đa Tầng (Gateway, JWT, Redis, OTP, QR HMAC)](#2-kiến-trúc-bảo-mật-đa-tầng-gateway-jwt-redis-otp-qr-hmac)
3. [Hệ Thống Phân Quyền RBAC (4 Roles) & Kiểm Soát Truy Cập](#3-hệ-thống-phân-quyền-rbac-4-roles--kiểm-soát-truy-cập)
4. [Cơ Chế Ngăn Chặn Đặt Trùng Sân & Đặt Quá Giờ / Sai Khung Giờ](#4-cơ-chế-ngăn-chặn-đặt-trùng-sân--đặt-quá-giờ--sai-khung-giờ)
5. [Cơ Chế Thanh Toán Demo & Ví Điện Tử SportPay](#5-cơ-chế-thanh-toán-demo--ví-điện-tử-sportpay)
6. [Cơ Chế Hủy Đơn & Hoàn Tiền Tự Động (100% / 80% / 50%)](#6-cơ-chế-hủy-đơn--hoàn-tiền-tự-động-100--80--50)
7. [Tổng Hợp Các Luồng Xử Lý Chính & Tác Vụ Chạy Nền (Đồng Bộ & Bất Đồng Bộ)](#7-tổng-hợp-các-luồng-xử-lý-chính--tác-vụ-chạy-nền-đồng-bộ--bất-đồng-bộ)
8. [Các Tối Ưu Hóa Đã Thực Hiện & Đánh Giá Chức Năng Có Thể Tinh Giản](#8-các-tối-ưu-hóa-đã-thực-hiện--đánh-giá-chức-năng-có-thể-tinh-giản)
9. [Bộ Câu Hỏi Phản Biện Thường Gặp Của Hội Đồng & Cách Trả Lời](#9-bộ-câu-hỏi-phản-biện-thường-gặp-của-hội-đồng--cách-trả-lời)

---

## 1. Cơ Chế Phòng Chống Tấn Công (SQL Injection, Prompt Injection, XSS, CSRF, IDOR)

| Loại tấn công | Cách hệ thống ngăn chặn | Minh chứng trong mã nguồn |
|---|---|---|
| **SQL Injection** | 100% truy vấn CSDL dùng **Spring Data JPA / Hibernate Parameterized Query** (`:param` / PreparedStatement), tuyệt đối không cộng chuỗi SQL từ input người dùng. Mọi dữ liệu đầu vào đều đi qua **Bean Validation** (`@Valid`, `@NotBlank`, `@Email`, `@Min`, `@Size`). | Toàn bộ `khodulieu/*.java` (`KhoDonDatSan`, `KhoGiaoDichThanhToan`, `KhoSanCon`, `KhoNguoiDung`...) đều dùng named parameter `@Param(...)`. |
| **Prompt Injection & SQL Injection trên Trợ lý AI** | Giới hạn độ dài tin nhắn (`MAX_MESSAGE_LENGTH = 800`), lọc đầu vào bằng biểu thức chính quy `DANGEROUS_INPUT_PATTERN` chặn `ignore previous instructions`, `reveal system prompt`, `union select`, `drop table`, `' or '1'='1`... Đồng thời lọc đầu ra bằng `SENSITIVE_OUTPUT_PATTERN` để tự che giấu nếu vô tình lọt chuỗi dạng khóa bí mật (`AIza...`, `AQ....`, `Bearer ...`). | `booking-service/.../DichVuTroLyAi.java` |
| **XSS (Cross-Site Scripting)** | React tự động escape nội dung JSX; JWT lưu trong **Cookie `HttpOnly`** nên mã JS độc hại (nếu có) cũng không đọc trộm được token. Ở phía Email HTML, toàn bộ dữ liệu động (họ tên, tên sân, nội dung) đều đi qua hàm `escapeHtml()` trước khi chèn vào template. | `notification-service/.../DichVuGuiEmail.java`, `user-service/.../DichVuNguoiDung.java` |
| **CSRF (Cross-Site Request Forgery)** | Áp dụng chuẩn **Double Submit Cookie**: mọi request thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) bắt buộc phải có đồng thời Cookie `XSRF-TOKEN` và Header `X-CSRF-Token` khớp nhau 100% mới được đi qua API Gateway. | `api-gateway/.../BoLocBaoMatVaCsrf.java`, `frontend/src/dichvu/api.js` |
| **Giả mạo Header & Gọi lén API Nội bộ** | Gateway tự động **xóa sạch (Header Stripping)** mọi header nhạy cảm (`X-User-Id`, `X-User-Role`, `X-Gateway-Token`) do client gửi lên, đồng thời chặn cứng mọi truy cập từ bên ngoài vào `/internal/**` (`403 FORBIDDEN`). Giao tiếp liên dịch vụ bắt buộc mang `X-Internal-Api-Key`. | `api-gateway/.../BoLocBaoMatVaCsrf.java`, `DieuKhienNoiBo*.java` |
| **IDOR & Giả mạo vé QR Check-in** | Mọi API xem/hủy đơn đều kiểm tra `booking.getCustomerId().equals(userId)` (trừ `ADMIN`). Mã QR Check-in có cấu trúc `SPORT-CHECKIN.{bookingId}.{customerId}.{expiry}.{hmac}` được ký bằng **HMAC-SHA256**, tự hết hạn và từ chối ngay nếu bị sửa bất kỳ ký tự nào. | `booking-service/.../CheckinSecurityUtil.java`, `DichVuDatSan.java` |

---

## 2. Kiến Trúc Bảo Mật Đa Tầng (Gateway, JWT, Redis, OTP, QR HMAC)

1. **Xác thực JWT qua HttpOnly Cookie + Thu hồi phiên tức thì bằng Redis:**
   - Mật khẩu người dùng được băm 1 chiều bằng **BCrypt** (`BCryptPasswordEncoder`).
   - Khi đăng nhập thành công, `user-service` cấp JWT ký **HMAC-SHA256** (chứa `userId`, `role`, `tokenVersion`) đặt trong Cookie `HttpOnly` (`access_token`).
   - Mỗi request đi qua `api-gateway` (`DichVuKiemTraToken.java`) sẽ đối chiếu `tokenVersion` trong JWT với cache trên **Redis 7** (`user:token_version:{id}`, fallback sang `user-service`). Khi Admin khóa tài khoản hoặc đổi quyền, `tokenVersion` tăng lên → phiên cũ bị đá văng **ngay lập tức** dù JWT chưa hết hạn.
2. **Bảo mật Xác thực OTP Đăng ký & Chống Spam/Brute-force:**
   - Sinh mã 6 chữ số ngẫu nhiên bằng `java.security.SecureRandom` (an toàn mật mã).
   - Thời hạn OTP: **5 phút** (`expiresAt`).
   - Chống dò mã (Brute-force): nhập sai tối đa **5 lần** → tự động vô hiệu hóa toàn bộ mã OTP cũ (`invalidateOldOtps`).
   - Chống tấn công spam email (DoS): ép **cooldown 10 giây** giữa 2 lần gửi lại và giới hạn ngầm **tối đa 3 lần gửi lại** mỗi email (`429 TOO_MANY_REQUESTS` tại `DichVuNguoiDung.java`).
   - Gửi email OTP chạy bất đồng bộ **`@Async`** (`DichVuEmailOtp.guiMaOtpAsync`) giúp API phản hồi `< 100ms` thay vì chờ Gmail SMTP ~3 giây.

---

## 3. Hệ Thống Phân Quyền RBAC (3 Vai Trò Chuẩn Hóa) & Kiểm Soát Truy Cập

Hệ thống áp dụng phân quyền theo vai trò (**RBAC — 3 Roles chuẩn hóa**: `CUSTOMER`, `STAFF`, `ADMIN`) kiểm soát chặt chẽ ở **cả 2 lớp** (Backend đọc `X-User-Role` do Gateway gắn + Frontend `Role Route Guards` tại `App.jsx`). Toàn bộ tài khoản mẫu được quản lý tập trung tại **[`tai-khoan-mac-dinh.json`](tai-khoan-mac-dinh.json)** ở thư mục gốc:

| Role | Tài khoản mẫu | Phạm vi quyền hạn |
|---|---|---|
| **`CUSTOMER`** | `customer` / `customer123` | Tìm sân, xem lịch trống, báo giá, áp voucher, đặt sân, thanh toán (VietQR / Visa / Ví SportPay), xem vé QR & chỉ đường Google Maps, hủy đơn qua popup hoàn tiền thời gian thực (`ModalHuyHoanTien.jsx`), gọi phục vụ tại sân khi đã Check-in, chat Trợ lý AI. |
| **`STAFF`** | `staff1` / `staff123` *(CS1 — Cầu Giấy)*<br/>`staff2` / `staff123` *(CS2 — Đống Đa)*<br/>`staff3` / `staff123` *(CS3 — Long Biên)* | Truy cập cổng `/checkin` gồm 2 tab: **Check-in & Lịch Sân** (quét QR nhận sân, phát hiện khách đi nhầm cơ sở, xác nhận trả sân) và **Yêu Cầu Phục Vụ** (xử lý gọi nước/dụng cụ tại sân). **Khóa cứng phạm vi đúng cơ sở được phân công.** |
| **`ADMIN`** | `admin` / `admin123` | Toàn quyền hệ thống tại `/admin` (đã gộp chức năng quản lý sân `/owner`, `/quan-ly-san` → `/admin`): Dashboard thống kê doanh thu/đơn đặt thực từ DB, quản lý toàn bộ 30 sân & bảng giá, quản lý tài khoản (tạo/sửa/khóa/mở khóa/xóa, bảo vệ 5 tài khoản lõi), giám sát trạm Check-in cả 3 cơ sở. |

---

## 4. Cơ Chế Ngăn Chặn Đặt Trùng Sân & Đặt Quá Giờ / Sai Khung Giờ

### 4.1. Chống đặt quá giờ, giờ quá khứ & sai bước thời gian (Kiểm tra 2 lớp FE + BE)
- **Lưới khung giờ cố định 30 phút (`06:00 – 22:30`)**:
  - Hàm `kiemTraThoiLuongVaGioHoatDong()` trong `DichVuDatSan.java` bắt buộc `startSlot` phải rơi vào mốc `:00` hoặc `:30` (`INVALID_START_TIME`), thời lượng phải là bội số của 30 phút (`INVALID_DURATION`), nằm trong khoảng `[minDuration, maxDuration]` (`60p – 720p`).
- **Chặn đặt qua nửa đêm & vượt giờ đóng cửa:**
  - Nếu `startSlot + durationMinutes` sang ngày hôm sau → ném lỗi `422 BOOKING_TIME_INVALID`.
  - Nếu `startSlot < openTime` hoặc `endSlot > closeTime` (`22:30`) → ném lỗi `409 OUT_OF_OPERATING_HOURS`.
  - Phía Frontend (`TrangChiTietSan.jsx`): tự động làm mờ/vô hiệu hóa các khung giờ đã qua hoặc kín lịch, tự động chuyển ngày mặc định sang **Ngày mai** nếu hôm nay đã hết slot, và tự hạ thời lượng thuê nếu vượt giờ đóng cửa.

### 4.2. Chống đặt trùng sân tuyệt đối (Concurrency / Double-Booking)
1. **Khóa duy nhất mức CSDL (`active_slot_locks`):** Bảng `active_slot_locks` đặt ràng buộc `UNIQUE KEY uk_court_date_slot (court_id, booking_date, slot_time)`. Khi 100 khách cùng bấm đặt 1 khung giờ tại cùng 1 thời điểm, chỉ đúng **1 giao dịch** chèn khóa thành công; 99 yêu cầu còn lại nhận ngay `409 SLOT_UNAVAILABLE` (đã có kiểm thử đa luồng trong `KiemThuChongDatTrung.java`).
2. **Idempotency-Key (`booking_idempotency`):** Chống lỗi khách bấm đúp nút "Đặt sân" tạo ra 2 đơn giống hệt nhau bằng mã băm SHA-256 của payload + `Idempotency-Key`.
3. **Giữ chỗ tạm 10 phút & Tự giải phóng:** Đơn `PENDING_PAYMENT` có `expiredAt = now + 10 phút`. Quá 10 phút không thanh toán, scheduler tự chuyển `EXPIRED` và xóa `active_slot_locks`.
4. **Giữ khóa trong suốt ca thi đấu:** Khi khách `CHECKED_IN`, khóa slot vẫn được giữ nguyên và chỉ xóa khi trả sân (`COMPLETED`), tránh tuyệt đối tình trạng đặt đè lên sân đang có người chơi.

---

## 5. Cơ Chế Thanh Toán Demo & Ví Điện Tử SportPay

Hệ thống hỗ trợ **3 phương thức thanh toán** tại `TrangThanhToan.jsx` & `payment-service`:
1. **Chuyển khoản VietQR (Techcombank):** `DichVuVietQR.java` sinh chuỗi chuẩn EMVCo + hình ảnh QR động bằng thư viện **ZXing**, chứa sẵn số tiền và nội dung định danh `BOOKING_{id}`.
2. **Ví Điện Tử SportPay (1-Chạm):**
   - Mỗi tài khoản mới được khởi tạo sẵn **1.000.000 VNĐ** trải nghiệm.
   - Hỗ trợ **Nạp tiền qua VietQR** và **Rút tiền demo về ngân hàng** (8 ngân hàng, ràng buộc số tiền `> 2.000đ`, không vượt số dư, checkbox xác nhận).
   - Dùng **Khóa bi quan (`PESSIMISTIC_WRITE`)** khi trừ/cộng số dư (`KhoThongTinVi.findByUserIdWithLock`, `KhoGiaoDichThanhToan.findByIdWithLock`) để ngăn chặn triệt để lỗi trừ/hoàn tiền trùng khi gửi nhiều request đồng thời.
   - Ghi vết toàn bộ biến động (`TOP_UP`, `PAYMENT`, `REFUND`, `WITHDRAW`) kèm `balance_before` và `balance_after` trong bảng `wallet_transactions`.
3. **Thẻ Quốc Tế (Visa/Mastercard Demo):** Form mô phỏng kiểm tra định dạng số thẻ, ngày hết hạn và CVV.
4. **Xử lý Race Condition khi xác nhận thanh toán:** `DichVuDatSan.xacNhanThanhToanNoiBo()` dùng `transactionTemplate` cập nhật có điều kiện trạng thái (`PENDING_PAYMENT → CONFIRMED`), đảm bảo không xảy ra xung đột nếu Webhook thanh toán đến đúng giây thứ 600 khi scheduler đang chạy hết hạn.

---

## 6. Cơ Chế Hủy Đơn & Hoàn Tiền Tự Động (100% / 80% / 50%)

Áp dụng chính sách theo khoảng thời gian trước giờ thi đấu (**Time-window Policy**, múi giờ `Asia/Ho_Chi_Minh`) tại `DichVuDatSan.java` & `TrangVeCuaToi.jsx`:

| Khoảng thời gian hủy trước giờ bắt đầu | Tỷ lệ hoàn tiền | Trạng thái & Xử lý tự động |
|---|:---:|---|
| **Trước ≥ 12 giờ** | **100%** | Đổi `CANCELLED_REFUNDED` → Cộng 100% vào Ví SportPay → Xóa `active_slot_locks` → Thông báo In-App & Email. |
| **Từ 5 giờ đến dưới 12 giờ** | **80%** | Đổi `CANCELLED_REFUNDED` → Cộng 80% vào Ví SportPay → Xóa `active_slot_locks` → Thông báo In-App & Email. |
| **Dưới 5 giờ (sát giờ chơi)** | **50%** | Đổi `CANCELLED_REFUNDED` → Cộng 50% vào Ví SportPay → Xóa `active_slot_locks` → Thông báo In-App & Email. |
| **Đã qua giờ bắt đầu thi đấu** | **Từ chối hủy** | Trả lỗi `409 BOOKING_ALREADY_STARTED`. |

*Nếu gọi `payment-service` hoàn tiền gặp sự cố mạng, đơn được giữ ở trạng thái `REFUND_PENDING` để đối soát (`payment_reconciliations`), không bao giờ mất tiền của khách.*

---

## 7. Tổng Hợp Các Luồng Xử Lý Chính & Tác Vụ Chạy Nền (Đồng Bộ & Bất Đồng Bộ)

### A. 10 Luồng Nghiệp Vụ Đồng Bộ (Request–Response qua API Gateway)
1. **Đăng ký → OTP Email (`@Async`) → Kích hoạt → Đăng nhập (JWT HttpOnly + CSRF).**
2. **Tìm sân & Xem lịch trống 30 phút** (`court-service` + `booking-service /availability`).
3. **Báo giá Real-time & Tự động chọn Voucher lợi nhất** (`POST /bookings/preview` — 8 mã ưu đãi).
4. **Đặt sân & Giữ slot 10 phút** (`POST /bookings` + `Idempotency-Key` + `active_slot_locks`).
5. **Thanh toán 3 phương thức** (VietQR / SportPay / Visa) → Xác nhận đơn → Sinh QR Check-in HMAC + Gửi Email HTML đính kèm ảnh QR PNG & nút chỉ đường Google Maps.
6. **Quản lý Ví SportPay** (Xem số dư, lịch sử audit, Nạp VietQR, Rút tiền demo).
7. **Hủy đơn & Hoàn tiền tự động** (`100% / 80% / 50%` vào Ví SportPay + nhả slot).
8. **Check-in nhận sân & Check-out trả sân** (Staff quét QR, kiểm tra đúng cơ sở, giữ slot khi `CHECKED_IN`, giải phóng khi `COMPLETED`, gửi thông báo + email).
9. **Gọi dịch vụ phục vụ tại sân** (`service_requests` → thông báo tức thì đúng cơ sở cho Staff/Admin).
10. **Trợ lý AI 2-trong-1** (FAQ tức thì phía Client + Gemini API `gemini-3.8-flash` / fallback `gemini-3.6-flash` có guardrails).

### B. 4 Luồng Chạy Nền / Bất Đồng Bộ (Async & Event-Driven)
1. **Scheduler định kỳ 15 giây (`TacVuKiemTraHetHan.java`):**
   - Quét & hủy đơn `PENDING_PAYMENT` quá 10 phút → `EXPIRED` + nhả lock.
   - Quét & tự động hoàn tất đơn `CONFIRMED` / `CHECKED_IN` đã qua giờ chơi → `COMPLETED` + gửi thông báo & email.
   - **Nhắc lịch tự động trước 5 tiếng (`BOOKING_REMINDER_5H`)**: Quét đơn `CONFIRMED` còn `0 < t <= 300 phút` → gửi chuông in-app + Email HTML kèm ảnh QR Check-in & link Google Maps (chống gửi trùng bằng `event_id` unique).
2. **Hàng đợi RabbitMQ (`CauHinhRabbitMq` & `NguoiLangNgheThongBao`):** Truyền sự kiện thông báo bất đồng bộ từ `booking-service` và `payment-service` sang `notification-service` (có fallback REST nội bộ nếu chạy local không bật RabbitMQ).
3. **Gửi Email HTML bất đồng bộ (`@Async`):** `DichVuEmailOtp` (`user-service`) và `DichVuGuiEmail` (`notification-service`) chạy trên thread pool riêng, không làm chậm API người dùng.
4. **Đồng bộ Redis Cache (`user:token_version:{id}`):** Kiểm tra thu hồi phiên tức thì tại API Gateway.

---

## 8. Các Tối Ưu Hóa Đã Thực Hiện & Đánh Giá Chức Năng Có Thể Tinh Giản

### 8.1. Những tối ưu hóa đã hoàn thành
- **Loại bỏ `review-service`** từ Giai đoạn 3 và **gỡ bỏ trang dư thừa `TrangQuanLySanChu.jsx`** (gộp `/owner`, `/quan-ly-san` → `/admin`), chuẩn hóa toàn bộ giao diện còn đúng **3 vai trò** (`CUSTOMER`, `STAFF`, `ADMIN`) và **9 trang** chức năng tinh gọn.
- **Clean Code toàn hệ thống:** Xóa file rác `tempCodeRunnerFile.bat`, thư mục `.github/modernize/`, log rỗng; loại bỏ **100% `window.alert()` / `window.confirm()`** bằng hệ thống Toast toàn cục (`ToastThongBao.jsx`) và popup hủy/hoàn tiền có animation (`ModalHuyHoanTien.jsx`).
- **Tối ưu cấu trúc Frontend (DRY & Modular):** Tách dùng chung `danhSachVoucher.js`, `thoiGianSan.js`, `dinhDang.js` (QR/VNĐ/Web Audio), `thongBao.js`, tách 5 modal quản trị ra `CacModalAdmin.jsx`; kết hợp `React.lazy()` + `<Suspense>` và `manualChunks` giữ chunk chính chỉ ~`56 kB` (`~15 kB` gzip).
- **Tối ưu cấu trúc Backend (SRP & Config):** Tách `DichVuTinhGiaVaKiemTraSan.java` ra khỏi `DichVuDatSan.java`, gộp thông tin 3 cơ sở vào `ThongTinCoSoUtil.java`, bỏ `hibernate.dialect` deprecation trên các `application.yml`, và tập trung toàn bộ tài khoản mẫu vào 1 file duy nhất `tai-khoan-mac-dinh.json`.
- **Tăng tốc phản hồi đăng ký/gửi OTP:** Chuyển gửi SMTP sang `@Async`, giảm thời gian chờ từ **~3 giây xuống `< 100ms`**.

### 8.2. Đánh giá các thành phần giữ lại
| Thành phần | Mức độ cần thiết cho đồ án | Ghi chú |
|---|---|---|
| **Popup Hủy & Hoàn tiền (`ModalHuyHoanTien.jsx`)** | Cao (minh bạch chính sách 100% / 80% / 50% theo đồng hồ đếm ngược thời gian thực). | Đã tích hợp đồng bộ tại `/ve-cua-toi` và `/me`, có animation chuyển sang màn hình hoàn tiền thành công. |
| **Tab Thanh toán Thẻ Visa/Mastercard demo** | Trung bình (VietQR + Ví SportPay đã rất thực tế và đủ demo). | Giữ để đa dạng phương thức thanh toán khi trình diễn. |
| **Trợ lý AI (`DichVuTroLyAi`)** | Điểm cộng lớn khi bảo vệ (có Guardrails chống Prompt/SQL Injection). | **Giữ nguyên** (có chế độ FAQ/Fallback chạy tốt 100% kể cả khi không có API key). |

---

## 9. Bộ Câu Hỏi Phản Biện Thường Gặp Của Hội Đồng & Cách Trả Lời

1. **Hỏi: Tại sao không tách Ví điện tử thành `wallet-service` riêng?**  
   *Trả lời:* Để đảm bảo tính nguyên tử **ACID** trong cùng schema `payment_db` giữa Giao dịch thanh toán (`payment_transactions`), Hoàn tiền (`refunds`) và Số dư ví (`wallets`), tránh bẫy Distributed Monolith và giao dịch phân tán 2PC phức tạp khi mạng lỗi.
2. **Hỏi: Nếu 2 người bấm đặt cùng 1 sân, cùng 1 giờ tại cùng 1 mili-giây thì sao?**  
   *Trả lời:* Bảng `active_slot_locks` có khóa `UNIQUE(court_id, booking_date, slot_time)` ở mức Database. Chỉ 1 transaction insert thành công, người thứ 2 lập tức nhận `409 SLOT_UNAVAILABLE` (đã viết test đa luồng chứng minh trong `KiemThuChongDatTrung.java`).
3. **Hỏi: JWT stateless thì làm sao khóa tài khoản là đăng xuất được ngay?**  
   *Trả lời:* Nhúng `tokenVersion` vào JWT và đồng bộ cache lên **Redis 7** (`user:token_version:{id}`). Khi Admin khóa user, `tokenVersion` bị đánh dấu `-1` trên Redis → `api-gateway` từ chối ngay ở request kế tiếp.
4. **Hỏi: Nếu RabbitMQ sập thì thông báo có bị mất hoặc crash luồng đặt sân không?**  
   *Trả lời:* Không. `DichVuGoiThongBaoNoiBo` bắt lỗi broker và tự động **fallback sang gọi REST nội bộ** tới `notification-service`, đồng thời mọi thông báo đều có `event_id` duy nhất để đảm bảo **Idempotency** (không bao giờ gửi trùng).
5. **Hỏi: Khách đưa ảnh chụp QR giả hoặc sửa mã Token để check-in sân người khác thì sao?**  
   *Trả lời:* Mã QR được ký bằng **HMAC-SHA256** (`CheckinSecurityUtil`) có gắn `bookingId`, `customerId` và thời gian hết hạn. Sửa 1 ký tự sẽ sai chữ ký (`INVALID_SIGNATURE`), và nhân viên trực cơ sở nào chỉ quét được vé đúng cơ sở đó.
