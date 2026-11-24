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
import java.util.Collections;
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

        // Khi nhan vien hoac Admin/Owner quet check-in thanh cong, cap nhat trang thai don sang CHECKED_IN
        // LUU Y QUAN TRONG: GIU NGUYEN KHOA SLOT (active_slot_locks) trong suot ca thi dau de chong dat trung
        if ("ADMIN".equals(userRole) || "STAFF".equals(userRole) || "OWNER".equals(userRole)) {
            khoDonDatSan.findById(targetBookingId).ifPresent(b -> {
                b.setStatus(com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.CHECKED_IN);
                b.setCheckedInAt(java.time.Instant.now());
                khoDonDatSan.save(b);
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

        if (!"ADMIN".equals(userRole) && !"STAFF".equals(userRole) && !"OWNER".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ nhân viên trực ban, chủ sân hoặc quản trị viên mới có quyền xác nhận trả sân.");
        }

        if ("OWNER".equals(userRole)) {
            try {
                var config = dichVuGoiSanNoiBo.layCauHinhSan(don.getCourtId(), don.getBookingDate());
                if (config == null || config.getOwnerId() == null || !userId.equals(config.getOwnerId())) {
                    throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền quản lý đơn đặt của cơ sở này.");
                }
            } catch (LoiNghiepVu ln) {
                throw ln;
            } catch (Exception ex) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Không thể xác minh quyền chủ sở hữu cho cơ sở này.");
            }
        }

        if (don.getStatus() == com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.COMPLETED) {
            Map<String, Object> ketQua = new HashMap<>();
            ketQua.put("success", true);
            ketQua.put("message", "Đơn đặt sân này đã hoàn tất trước đó.");
            ketQua.put("bookingId", id);
            ketQua.put("status", "COMPLETED");
            return ResponseEntity.ok(ketQua);
        }

        if (don.getStatus() != com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.CHECKED_IN &&
            don.getStatus() != com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.CONFIRMED) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Không thể xác nhận trả sân cho đơn ở trạng thái: " + don.getStatus());
        }

        don.setStatus(com.sportbooking.bookingservice.thucthe.TrangThaiDonDat.COMPLETED);
        khoDonDatSan.save(don);
        // Giai phong khoa slot lock khi da hoan tat ca thi dau / tra san
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "UPCOMING") String range,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole) && !"STAFF".equals(userRole) && !"OWNER".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ nhân viên trực ban hoặc quản trị viên mới có quyền xem danh sách đơn theo trạm.");
        }

        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        List<com.sportbooking.bookingservice.thucthe.DonDatSan> list;
        if (date != null) {
            list = khoDonDatSan.findByBookingDate(date);
        } else if ("TODAY".equalsIgnoreCase(range)) {
            list = khoDonDatSan.findByBookingDate(today);
        } else if ("TOMORROW".equalsIgnoreCase(range)) {
            list = khoDonDatSan.findByBookingDate(today.plusDays(1));
        } else {
            list = khoDonDatSan.findByBookingDateGreaterThanEqualOrderByBookingDateAscStartSlotAsc(today);
        }
        if (list == null) {
            list = Collections.emptyList();
        }

        List<Map<String, Object>> res = new java.util.ArrayList<>();
        for (var b : list) {
            Long bVenueId = null;
            Long bOwnerId = null;
            String bCourtName = null;
            try {
                var config = dichVuGoiSanNoiBo.layCauHinhSan(b.getCourtId(), b.getBookingDate());
                if (config != null) {
                    bCourtName = config.getCourtName();
                    bVenueId = config.getVenueId();
                    bOwnerId = config.getOwnerId();
                }
            } catch (Exception ignored) {}

            // Neu loc theo venueId cu the: LOAI BO cac don chua xac dinh duoc co so hoac khong khop
            if (venueId != null) {
                if (bVenueId == null || !venueId.equals(bVenueId)) {
                    continue;
                }
            }

            // Neu la OWNER: Chi duoc phep xem don thuoc co so do chinh minh so huu
            if ("OWNER".equals(userRole)) {
                if (bOwnerId == null || !bOwnerId.equals(userId)) {
                    continue;
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", b.getId());
            item.put("customerId", b.getCustomerId());
            item.put("courtId", b.getCourtId());
            item.put("bookingDate", b.getBookingDate().toString());
            item.put("startSlot", b.getStartSlot().toString());
            item.put("endSlot", b.getEndSlot().toString());
            item.put("totalAmount", b.getTotalAmount());
            item.put("status", b.getStatus().name());
            item.put("courtName", bCourtName);
            item.put("venueId", bVenueId);
            res.add(item);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/bookings/preview")
    public ResponseEntity<com.sportbooking.bookingservice.dulieu.TraVeBaoGiaDatSan> tinhBaoGia(
            @Valid @RequestBody YeuCauDatSan yeuCau) {
        return ResponseEntity.ok(dichVuDatSan.tinhBaoGiaTruoc(yeuCau));
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
