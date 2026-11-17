# Công việc còn lại và kế hoạch kiểm chứng

Cập nhật: **13/11/2026**. Nghiệp vụ hiện tại nằm ở [Sport](Sport.md), kỹ thuật/API ở [thiết kế](docs/design-review-erd-api-contract.md). Kế hoạch theo giai đoạn và báo cáo lỗi cũ được giữ tại [lịch sử](docs/archive/lich-su-tai-lieu-truoc-2026-11-13.md).

## 1. Phạm vi đã thống nhất

- Giữ giao diện hiện tại; ưu tiên sửa logic, dữ liệu và độ ổn định của những luồng đã có.
- Đợt cập nhật này chỉ sửa Markdown, chưa sửa Java/JS/CSS/SQL/YAML/script và chưa quyết định bỏ service hay màn hình.
- Tách hai trạng thái: **đã có thay đổi trong mã** và **đã kiểm chứng hành vi**. Không đánh dấu hoàn tất chỉ vì compile/build thành công.
- Không lặp danh sách tính năng/API hoặc lịch sử sửa lỗi tại đây; bảng dưới là việc còn phải làm.

## 2. Ưu tiên sửa và điều kiện hoàn thành

| Ưu tiên | Việc cần làm | Bằng chứng để đóng việc |
|---|---|---|
| P0 | Cách ly datasource kiểm thử; loại nguy cơ test xóa DB phát triển | Test dùng DB riêng/Testcontainers, có guard cấu hình; DB phát triển không đổi sau chạy test |
| P1 | Thống nhất nguồn danh mục, ID sân, giá và khả dụng giữa frontend và API; giữ bố cục giao diện | Tạo/sửa/ẩn sân phản ánh đúng khi tìm/đặt; không tạo đơn giả khi lỗi API; không dùng giá client quyết định số tiền |
| P1 | Dùng chung validation thời lượng/ngày/giờ cho availability và tạo đơn | Cùng min/max/step; kiểm tra 60/90/120 phút, ngày nghỉ, qua ngày và mốc hiện tại +15 phút |
| P1 | Bảo toàn state và khóa khi callback, hủy, hết hạn chạy đồng thời | Test cạnh tranh chứng minh không xác nhận đơn đã hủy/hết hạn, không mất khóa đơn còn hiệu lực, không đổi trạng thái ngược |
| P1 | Hoàn tiền có điều kiện và chống trùng; khép kín REFUND_PENDING/đối soát callback | Chỉ hoàn giao dịch hợp lệ; hai request tạo tối đa một refund; timeout có bước phục hồi; số tiền/trạng thái nhất quán |
| P1 | Rà ranh giới Gateway–service và internal API | Header giả, gọi thẳng service, token bị khóa/hết hạn, CSRF và quyền truy cập đều có kiểm tra âm tính |
| P1 | Kiểm chứng migration và Docker | Khởi động DB sạch và nâng cấp DB cũ; đối chiếu Flyway history Review V2; các service gọi đúng DNS container |
| P2 | Voucher trả rõ lỗi và lưu snapshot khoản giảm | Mã sai/hết hạn/không đủ điều kiện có thông báo; tổng tiền đơn và Payment khớp, giữ được lịch sử giá |
| P2 | Check-in ghi nhận bền vững và phân quyền cơ sở | Kiểm tra token/ngày/giờ/quyền; quét lặp có kết quả xác định; nhân viên không tự đổi cơ sở để vượt quyền |
| P2 | Notification không gây mất tính nhất quán đơn | Chỉ phát theo kết quả commit; lỗi dịch vụ không treo request vô hạn; chọn rõ cơ chế retry phù hợp quy mô |
| P2 | Thống kê và các màn hình dùng đúng dữ liệu | Bộ lọc thời gian thay số liệu thật; phân trang không làm thiếu kết quả tìm kiếm; xác định rõ phần còn mô phỏng |
| P3 | Tối ưu sau khi luồng đúng | Tải sân con/tiện ích theo lô, tải trang theo route; so sánh số query, bundle và độ trễ trước/sau |

P1 về race và phân quyền là hạng mục cần kiểm chứng/sửa theo kết quả test; không khẳng định mọi lịch xen kẽ đã được tái hiện trong lượt rà soát tĩnh.

## 3. Những sửa đổi đã có mã, cần test hồi quy

Không đưa các mục này lại vào danh sách “chưa code”:

- Gateway kiểm tra phiên theo luồng reactive, đã bỏ `.block()` ở đường kiểm tra này.
- Booking/Payment tách một số nhánh transaction để lưu trạng thái hết hạn/từ chối trước khi báo lỗi; thông báo xác nhận thanh toán chuyển ra sau commit. Chưa kết luận mọi nhánh đã an toàn.
- OTP đã chặn kích hoạt lại LOCKED, che mã khỏi HTTP mặc định, giới hạn lần thử và gửi lại, vô hiệu OTP cũ.
- OWNER bị chặn tự mở venue chưa được duyệt/bị đình chỉ; App đã truyền đúng prop Admin/Owner/check-in.
- Booking có chặn qua ngày; QR bỏ đường token demo không chữ ký, yêu cầu CONFIRMED và thêm kiểm tra ngày/giờ.
- VietQR kiểm tra quyền đọc và frontend đã gọi API backend; Review chỉ cho COMPLETED; Notification có route đọc/đếm chưa đọc.
- Migration Notification event_id, chuẩn hóa Review status và URL Docker đã được chỉnh trong mã.

Nguồn đối chiếu: các lớp service/controller/config và migration hiện tại; ghi nhận sửa ngày 10/11 được lưu trong lịch sử. Những sửa đổi này chưa được nghiệm thu đầy đủ bằng integration test/Docker trong đợt tài liệu này.

## 4. Trình tự kiểm chứng

1. Tạo môi trường test độc lập và fixture có CUSTOMER/OWNER/STAFF/ADMIN; không dùng booking_db phát triển.
2. Chạy migration trên DB sạch; kiểm tra đường nâng cấp và checksum trên bản sao DB cũ.
3. Kiểm tra đăng ký → OTP → đăng nhập → tìm sân → availability → đặt → thanh toán mô phỏng → lịch sử; assert response, trạng thái DB, giá và khóa slot.
4. Chạy test cạnh tranh đặt cùng slot, idempotency, callback–cancel–expiry, refund trùng; assert đúng lỗi nghiệp vụ, không coi mọi exception là kết quả đúng.
5. Kiểm tra quyền chéo tài khoản/cơ sở, token/check-in lặp, lỗi mạng liên service và phục hồi callback/refund.
6. Chạy UI đầu-cuối trên giao diện hiện tại, sau đó chạy cùng kịch bản bằng Docker Compose.
7. Đo query/bundle/độ trễ rồi tối ưu, chạy lại các test liên quan.

## 5. Bằng chứng và trạng thái nghiệm thu

- Đợt **13/11/2026**: đối chiếu tĩnh mã/tài liệu và chỉnh Markdown; chưa chạy build/test/DB/Docker, chưa thay đổi logic.
- Kết quả compile/build và probe ngày **10/11/2026** là bằng chứng lịch sử; một số lỗi probe đã có thay đổi mã sau đó. Không dùng probe cũ để tuyên bố lỗi vẫn tồn tại hoặc đã hết.
- Chưa có bộ acceptance test mới đủ để công bố tỷ lệ hoàn thành hoặc nghiệm thu toàn hệ thống.
- Khi đóng việc, ghi ngày, phiên bản mã, môi trường, lệnh/kịch bản, kết quả và giới hạn kiểm chứng. Không chép lại toàn bộ lịch sử vào các tài liệu nghiệp vụ.

## 6. Hạng mục chưa quyết định

Ba màn hình cũ không được App import, gộp/bỏ Notification/Review, cắt khối SLA và giao diện mô phỏng là các đề xuất từ rà soát; **chưa được duyệt triển khai**. Giữ giao diện hiện tại theo yêu cầu. Không tự mở rộng sang cổng thanh toán thật, broker, upload hoặc chức năng mới trong đợt sửa logic.
