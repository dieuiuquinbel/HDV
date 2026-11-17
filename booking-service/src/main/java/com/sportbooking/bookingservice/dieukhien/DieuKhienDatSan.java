/**
 * File: DieuKhienDatSan.java
 * Muc dich: Controller tiep nhan cac yeu cau dat san, xem lich su, huy don dat va quet ma QR check-in.
 * Chuc nang: POST /bookings, GET /bookings/me, GET /bookings/{id}, POST /bookings/{id}/cancel, POST /bookings/checkin.
 */
package com.sportbooking.bookingservice.dieukhien;

import com.sportbooking.bookingservice.dichvu.DichVuDatSan;
import com.sportbooking.bookingservice.dichvu.DichVuGoiSanNoiBo;
import com.sportbooking.bookingservice.dulieu.TraVeDonDatSan;
import com.sportbooking.bookingservice.dulieu.TraVeMaUuDai;
import com.sportbooking.bookingservice.dulieu.YeuCauDatSan;
import com.sportbooking.bookingservice.khodulieu.KhoDonDatSan;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.sportbooking.bookingservice.khodulieu.KhoKhoaKhungGio;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class DieuKhienDatSan {

    private final DichVuDatSan dichVuDatSan;
    private final KhoDonDatSan khoDonDatSan;
    private final KhoKhoaKhungGio khoKhoaKhungGio;
    private final DichVuGoiSanNoiBo dichVuGoiSanNoiBo;
    private final com.sportbooking.bookingservice.dichvu.DichVuGoiThongBaoNoiBo dichVuGoiThongBaoNoiBo;

    @GetMapping("/vouchers/available")
    public ResponseEntity<List<TraVeMaUuDai>> layDanhSachUuDai() {
        return ResponseEntity.ok(dichVuDatSan.layDanhSachUuDai());
    }

    @PostMapping("/bookings")
    public ResponseEntity<TraVeDonDatSan> taoDonDat(
            @Valid @RequestBody YeuCauDatSan yeuCau,
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập tài khoản để thực hiện đặt sân.");
        }

        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "IDEMPOTENCY_KEY_REQUIRED", "Tiêu đề Idempotency-Key là bắt buộc để đảm bảo an toàn giao dịch.");
        }

        TraVeDonDatSan ketQua = dichVuDatSan.taoDonDat(userId, yeuCau, idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED).body(ketQua);
    }

    @GetMapping("/bookings/me")
    public ResponseEntity<Page<TraVeDonDatSan>> layDonDatCuaToi(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để xem danh sách vé của bạn.");
        }

        Pageable phanTrang = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TraVeDonDatSan> ketQua = dichVuDatSan.layDonDatCuaKhach(userId, phanTrang);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<TraVeDonDatSan> layChiTietDonDat(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để xem chi tiết đơn đặt sân.");
        }

        TraVeDonDatSan ketQua = dichVuDatSan.layChiTietDonDat(id, userId, userRole);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<TraVeDonDatSan> huyDonDat(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để thực hiện hủy đơn.");
        }

        TraVeDonDatSan ketQua = dichVuDatSan.huyDonDat(id, userId, userRole);
        return ResponseEntity.ok(ketQua);
    }

    @Transactional
    @PostMapping("/bookings/checkin")
    public ResponseEntity<Map<String, Object>> quetMaCheckIn(
            @RequestBody Map<String, String> yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || userRole == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để thực hiện quét check-in.");
        }

        Long targetBookingId;
        Long targetCustomerId;

        if (yeuCau.containsKey("token") && yeuCau.get("token") != null && !yeuCau.get("token").isBlank()) {
            var thongTin = com.sportbooking.bookingservice.baomat.CheckinSecurityUtil.xacThucMaCheckin(yeuCau.get("token").trim());
            targetBookingId = thongTin.bookingId();
            targetCustomerId = thongTin.customerId();
        } else if (yeuCau.containsKey("bookingId") && yeuCau.get("bookingId") != null && !yeuCau.get("bookingId").isBlank()) {
            targetBookingId = Long.parseLong(yeuCau.get("bookingId").trim());
            var bOpt = khoDonDatSan.findById(targetBookingId)
                    .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy thông tin đơn đặt sân trong hệ thống."));
            targetCustomerId = bOpt.getCustomerId();
        } else {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Vui lòng cung cấp mã QR check-in hoặc mã đơn đặt sân.");
        }

        TraVeDonDatSan donDat = dichVuDatSan.xacMinhCheckIn(targetBookingId, targetCustomerId, userId, userRole);
        
        // Kiem tra lech co so (Venue Mismatch) neu nhan vien co truyen stationVenueId
        Long stationVenueId = null;
        if (yeuCau.containsKey("stationVenueId") && yeuCau.get("stationVenueId") != null && !yeuCau.get("stationVenueId").isBlank()) {
            try {
                stationVenueId = Long.parseLong(yeuCau.get("stationVenueId"));
            } catch (Exception ignored) {}
        }

        Long bookingVenueId = null;
        String courtName = null;
        try {
            var config = dichVuGoiSanNoiBo.layCauHinhSan(donDat.getCourtId(), donDat.getBookingDate());
            if (config != null) {
                bookingVenueId = config.getVenueId();
                courtName = config.getCourtName();
            }
        } catch (Exception ignored) {}

        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("booking", donDat);
        ketQua.put("checkInTime", java.time.Instant.now().toString());
        ketQua.put("bookingVenueId", bookingVenueId);
        ketQua.put("courtName", courtName);

        if (stationVenueId != null && bookingVenueId != null && !stationVenueId.equals(bookingVenueId)) {
            ketQua.put("success", false);
            ketQua.put("mismatch", true);
            ketQua.put("message", "CẢNH BÁO: Khách hàng đi nhầm cơ sở! Vé đặt tại cơ sở khác với trạm đang trực.");
            ketQua.put("stationVenueId", stationVenueId);
            return ResponseEntity.ok(ketQua);
        }

        // Khi nhan vien hoac Admin quet check-in thanh cong, cap nhat trang thai don sang COMPLETED (Da nhan san thi dau)
        if ("ADMIN".equals(userRole) || "STAFF".equals(userRole) || "OWNER".equals(userRole)) {
            khoDonDatSan.findById(targetBookingId).ifPresent(b -> {
                b.setStatus(com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.COMPLETED);
                khoDonDatSan.save(b);
                // Giai phong khoa slot lock ngay khi khach check-in thanh cong
                khoKhoaKhungGio.deleteByBookingId(b.getId());
                try {
                    dichVuGoiThongBaoNoiBo.guiThongBao(b.getCustomerId(),
                            "Check-in nhận sân thành công đơn đặt #" + b.getId(),
                            "Bạn đã hoàn tất thủ tục check-in tại quầy trực ban và nhận sân thi đấu.",
                            "CHECKIN_SUCCESS",
                            b.getId());
                } catch (Exception ex) {
                    log.warn("Khong the gui thong bao checkin: {}", ex.getMessage());
                }
            });
        }

        ketQua.put("success", true);
        ketQua.put("mismatch", false);
        ketQua.put("message", "Xác minh mã QR nhận sân thành công! Khách hàng đã nhận sân thi đấu.");

        return ResponseEntity.ok(ketQua);
    }

    @Transactional
    @PostMapping("/bookings/{id}/complete")
    public ResponseEntity<Map<String, Object>> xacNhanTraSan(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || userRole == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để xác nhận trả sân.");
        }

        com.sportbooking.bookingservice.thucthe.DonDatSan don = khoDonDatSan.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy thông tin đơn đặt sân trong hệ thống."));

        don.setStatus(com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.COMPLETED);
        khoDonDatSan.save(don);
        // Giai phong khoa slot lock khi hoan tat ca thi dau
        khoKhoaKhungGio.deleteByBookingId(don.getId());

        try {
            dichVuGoiThongBaoNoiBo.guiThongBao(don.getCustomerId(),
                    "Hoàn tất ca thi đấu đơn đặt #" + don.getId(),
                    "Ca thi đấu của bạn đã hoàn tất thành công. Cảm ơn bạn đã lựa chọn sử dụng dịch vụ của eSportKing!",
                    "BOOKING_COMPLETED",
                    don.getId());
        } catch (Exception ex) {
            log.warn("Khong the gui thong bao tra san: {}", ex.getMessage());
        }

        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("success", true);
        ketQua.put("message", "Xác nhận trả sân và hoàn tất ca thi đấu thành công!");
        ketQua.put("bookingId", id);
        ketQua.put("status", "COMPLETED");
        ketQua.put("completedAt", java.time.Instant.now().toString());
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/bookings/station")
    public ResponseEntity<List<Map<String, Object>>> layDanhSachDonTheoTram(
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date != null ? date : LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        List<com.sportbooking.bookingservice.thucthe.DonDatSan> list = khoDonDatSan.findByBookingDate(targetDate);
        if (list == null || list.isEmpty()) {
            list = khoDonDatSan.findAll(Sort.by(Sort.Direction.DESC, "id")).stream().limit(15).toList();
        }

        List<Map<String, Object>> res = new java.util.ArrayList<>();
        for (var b : list) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", b.getId());
            item.put("customerId", b.getCustomerId());
            item.put("courtId", b.getCourtId());
            item.put("bookingDate", b.getBookingDate().toString());
            item.put("startSlot", b.getStartSlot().toString());
            item.put("endSlot", b.getEndSlot().toString());
            item.put("totalAmount", b.getTotalAmount());
            item.put("status", b.getStatus().name());
            try {
                var config = dichVuGoiSanNoiBo.layCauHinhSan(b.getCourtId(), b.getBookingDate());
                if (config != null) {
                    item.put("courtName", config.getCourtName());
                    item.put("venueId", config.getVenueId());
                }
            } catch (Exception ignored) {}
            res.add(item);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/admin/bookings")
    public ResponseEntity<Page<TraVeDonDatSan>> layToanBoDonDatAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ quản trị viên hệ thống mới có quyền xem toàn bộ đơn đặt.");
        }

        Pageable phanTrang = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(khoDonDatSan.findAll(phanTrang).map(b -> dichVuDatSan.layChiTietDonDat(b.getId(), b.getCustomerId(), "ADMIN")));
    }

    @GetMapping("/admin/statistics/bookings")
    public ResponseEntity<Map<String, Object>> thongKeDonDat(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ quản trị viên hệ thống mới có quyền xem dữ liệu thống kê.");
        }

        LocalDate ngayBatDau = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate ngayKetThuc = to != null ? to : LocalDate.now();

        List<Object[]> rows = khoDonDatSan.thongKeTheoTrangThai(ngayBatDau, ngayKetThuc);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("from", ngayBatDau);
        ketQua.put("to", ngayKetThuc);

        Map<String, Long> thongKe = new HashMap<>();
        for (Object[] r : rows) {
            thongKe.put(r[0].toString(), (Long) r[1]);
        }
        ketQua.put("counts", thongKe);

        return ResponseEntity.ok(ketQua);
    }
}
