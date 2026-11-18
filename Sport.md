# ESportKing — nghiệp vụ hiện tại

Cập nhật đối chiếu mã: **17/11/2026**. Đây là nguồn mô tả nghiệp vụ hiện tại; API/ERD xem [thiết kế](docs/design-review-erd-api-contract.md), việc còn lại xem [Program](Program.md). Đặc tả Mức 1–3 cũ được giữ trong [lịch sử](docs/archive/lich-su-tai-lieu-truoc-2026-11-13.md).

## 1. Mục tiêu và phạm vi

Web tìm và đặt sân thể thao, thanh toán mô phỏng, quản lý sân và đơn đặt. Yêu cầu học phần được ghi trong đặc tả gốc: tối thiểu 3–4 dịch vụ nghiệp vụ độc lập, API Gateway, JWT/phân quyền, Swagger và Docker Compose.

Bản hiện tại gồm 6 microservices backend: User, Court, Booking, Payment, Notification và Gateway; mỗi service nghiệp vụ sở hữu schema riêng. Review-service và chức năng đánh giá đã được loại bỏ hoàn toàn để tinh giản kiến trúc theo quyết định thiết kế. Giữ giao diện hiện tại, ưu tiên hoàn thiện logic phía sau các màn hình.

## 2. Vai trò

| Vai trò | Phạm vi trong mã hiện tại |
|---|---|
| CUSTOMER | Đăng ký/OTP, đăng nhập, tạo/xem/hủy đơn của mình, thanh toán mô phỏng; xác minh QR đơn của mình |
| OWNER | Quản lý venue/court thuộc sở hữu; kiểm tra quyền sở hữu khi xem đơn hoặc xác minh check-in |
| STAFF | Có role và tài khoản mẫu; backend cho phép xác minh check-in, chưa có quan hệ STAFF–venue bền vững |
| ADMIN | Quản lý tài khoản, trạng thái sân và xem đơn/thống kê toàn hệ thống |

Bảng mô tả không chứng minh mọi thao tác giao diện đã được kiểm thử. Đăng ký công khai tạo CUSTOMER; seeder hiện chưa tạo OWNER.

## 3. Sân và lịch thuê

- Hệ thống chuẩn hóa 3 cơ sở tại Hà Nội: CS1 (Cầu Giấy - 18 Duy Tân), CS2 (Đống Đa - 102 Trường Chinh), CS3 (Hà Đông - 27 Quang Trung).
- Mỗi cơ sở gồm 10 sân thể thao vật lý thực tế thuộc 4 môn trọng tâm (Bóng Đá: 3 sân 5/7/11, Cầu Lông: 2 sân PVC/Yonex, Bóng Rổ: 2 sân 5v5/3x3, Tennis: 3 sân Hard/Clay/Grass), tổng cộng 30 sân định danh độc lập (`BD-CS1-01` -> `TN-CS3-03`) với hình ảnh cục bộ sắc nét 100% đúng môn.
- Môn Cầu Lông và Tennis hỗ trợ 2 hình thức thi đấu: Đơn (1v1) và Đôi (2v2) diễn ra trên cùng một sân vật lý, dùng chung lịch để chống đặt trùng tuyệt đối.
- Venue là cụm sân/địa điểm; Court là sân con được đặt. Court Service sở hữu môn thể thao, catalog loại sân, tiện ích, giá và giờ hoạt động.
- Booking Service sở hữu lịch khả dụng và giữ chỗ. Không lấy tình trạng trống từ dữ liệu mẫu frontend làm căn cứ xác nhận đặt sân.
- Venue/court bị ẩn hoặc ngừng bán ngăn đơn mới; không tự xóa lịch sử đơn đã tồn tại. Các thao tác Owner phải kiểm tra sở hữu; Owner không tự duyệt venue đang chờ duyệt hoặc bị đình chỉ.

## 4. Đặt sân, thời lượng và giá

1. Khách chọn court, ngày, giờ bắt đầu và thời lượng; backend kiểm tra trạng thái sân, giờ hoạt động và thời điểm bắt đầu cách hiện tại ít nhất 15 phút theo `Asia/Ho_Chi_Minh`.
2. `durationMinutes` được ưu tiên nếu có giá trị dương; nếu thiếu dùng `slotCount * 60`, thiếu cả hai dùng 60 phút. DTO giới hạn duration 30–720 phút; service kiểm tra tiếp min/max của sân và bội số 30 phút.
3. Giờ bắt đầu theo lưới 30 phút, giây/nano bằng 0. Mỗi block 30 phút tạo slot, dòng giá và khóa. Đơn phải kết thúc trong cùng ngày; mã đã có kiểm tra ngày kết thúc.
4. Giá mỗi block là nửa giá theo giờ theo quy tắc giá, làm tròn hai chữ số. Voucher được xét sau tổng tiền thuê sân.
5. Unique key `(court_id, booking_date, slot_start)` trên khóa bảo vệ việc đặt gối nhau. Booking, slot và khóa được tạo trong transaction; giữ cơ chế này khi tối ưu.
6. Booking mới ở `PENDING_PAYMENT`, giữ chỗ 10 phút. Hết hạn chuyển `EXPIRED`, giải phóng khóa; thanh toán hợp lệ chuyển `CONFIRMED`. Khi khách check-in tại sân, đơn chuyển `CHECKED_IN`, ghi nhận `checkedInAt` và giữ nguyên khóa slot để chống đặt trùng trong lúc khách chơi. Khi trả sân (hoặc scheduler quét hết giờ), đơn chuyển `COMPLETED` và giải phóng khóa slot.
7. Endpoint `POST /bookings/preview` cung cấp báo giá thời gian thực chính xác 100% với đơn thực tế: dùng chung validation thời lượng (bội số 30p, min/max, giờ mở/đóng), giờ vàng và hàm tính voucher `tinhTienGiamVoucher` (hỗ trợ cả phần trăm lẫn số tiền cố định như `THETHAO50`). Snapshot chi tiết được lưu sang trang thanh toán.

## 5. Thanh toán

- Payment chỉ nhận `bookingId`, lấy số tiền từ Booking; không tin số tiền client gửi. Một booking gắn một giao dịch với các lần thử thanh toán.
- Thanh toán thành công cần callback hợp lệ sang Booking. Đơn đã hết hạn/hủy không được xác nhận lại.
- Trạng thái payment có `PENDING`, `SUCCESS`, `FAILED`, `REJECTED_EXPIRED`, `REFUNDED`.
- VietQR lấy từ backend và có kiểm tra quyền đọc. Sinh QR, quét QR hoặc bấm “đã chuyển khoản” không phải bằng chứng ngân hàng đã thu tiền; luồng hiện tại vẫn mô phỏng.
- Có lưu bản ghi đối soát khi callback không hoàn tất; chưa có luồng worker/Admin xử lý hết các bản ghi chờ phục hồi.

## 6. Hủy và hoàn tiền mô phỏng

| Điều kiện | Kết quả trong mã |
|---|---|
| PENDING_PAYMENT, hủy hợp lệ | CANCELLED; giải phóng khóa; thông báo Payment từ chối giao dịch đang chờ |
| CONFIRMED, còn hơn 24 giờ trước giờ chơi | REFUND_PENDING; gọi hoàn 100%; thành công thành CANCELLED_REFUNDED |
| CONFIRMED, còn tối đa 24 giờ nhưng chưa bắt đầu | CANCELLED, không hoàn tiền |
| CONFIRMED, giờ bắt đầu đã qua | Từ chối hủy |
| Đơn trạng thái khác | Từ chối theo kiểm tra trạng thái |

Đúng mốc 24 giờ không thuộc nhánh hoàn tiền. Khi refund lỗi, mã giữ REFUND_PENDING và giải phóng khóa khi transaction Booking commit. Chưa có worker phục hồi tự động; cần kiểm chứng chống hoàn trùng và điều kiện Payment SUCCESS trước hoàn tiền. Không có tiền thật được thu/hoàn.

## 7. OTP, thông báo và check-in

| Chức năng | Hiện trạng đối chiếu mã | Giới hạn |
|---|---|---|
| OTP | Có xác minh, resend cooldown 60 giây, giới hạn 5 lần thử, vô hiệu OTP cũ; không mở lại LOCKED qua verify | SMTP cần cấu hình; HTTP mặc định che OTP; chưa cấu hình SMTP thì ghi OTP vào log thử |
| Notification | Có eventId, migration bổ sung, danh sách cá nhân/đếm chưa đọc/đánh dấu đọc | Email nghiệp vụ chỉ log; chưa có retry bền vững/outbox; cần kiểm tra ranh giới commit ở mọi nhánh |
| Check-in | Token có chữ ký; kiểm tra CONFIRMED, ngày chơi và khung giờ hợp lệ. Quét check-in chuyển sang `CHECKED_IN`, lưu `checked_in_at` và giữ slot lock. | Chỉ STAFF/OWNER/ADMIN có quyền xác nhận trả sân sang `COMPLETED`; phân công nhân viên theo cơ sở chưa có persistence |
| Admin | Có API thống kê và quản lý | Biểu đồ/sơ đồ sân/SLA có phần dữ liệu cố định, không được hiểu là số liệu vận hành thật |
| Dịch vụ tại sân/SLA | Giao diện và localStorage, nút FAB kích hoạt tự động theo múi giờ VN khi có đơn `CHECKED_IN` | Đơn hàng Kiosk thanh toán trực tiếp tại quầy hoặc VietQR |

## 8. Bảo mật và giới hạn phạm vi

Gateway đọc JWT từ cookie `access_token`, xác minh và kiểm tra phiên qua User; xóa các header danh tính do client gửi trước khi gắn danh tính nội bộ. CSRF dùng cookie `XSRF-TOKEN` và header `X-CSRF-Token` cho request thay đổi dữ liệu, nhưng mã hiện miễn các endpoint public auth. Không mô tả rằng mọi service đều tự xác minh JWT hoặc mọi POST đều đã kiểm tra CSRF: cần rà ranh giới tin cậy theo Program.

Duyệt booking thủ công, upload ảnh, tìm gần theo tọa độ, dashboard Owner đầy đủ, message broker/outbox và cổng thanh toán thật là phần chưa cam kết triển khai trong đợt tối ưu logic. Không thêm chúng chỉ để tăng số tính năng.
