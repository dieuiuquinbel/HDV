/**
 * File: DieuKhienYeuCauDichVu.java
 * Muc dich: REST API quan ly yeu cau goi nuoc / dung cu phuc vu tai san (dong bo da trinh duyet qua MySQL & RabbitMQ).
 */
package com.sportbooking.bookingservice.dieukhien;

import com.sportbooking.bookingservice.dichvu.DichVuGoiSanNoiBo;
import com.sportbooking.bookingservice.dichvu.DichVuGoiThongBaoNoiBo;
import com.sportbooking.bookingservice.khodulieu.KhoDonDatSan;
import com.sportbooking.bookingservice.khodulieu.KhoYeuCauDichVuTaiSan;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import com.sportbooking.bookingservice.thucthe.DonDatSan;
import com.sportbooking.bookingservice.thucthe.TrangThaiDonDat;
import com.sportbooking.bookingservice.thucthe.YeuCauDichVuTaiSan;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Slf4j
public class DieuKhienYeuCauDichVu {

    private final KhoYeuCauDichVuTaiSan khoYeuCauDichVu;
    private final KhoDonDatSan khoDonDatSan;
    private final DichVuGoiSanNoiBo dichVuGoiSanNoiBo;
    private final DichVuGoiThongBaoNoiBo dichVuGoiThongBaoNoiBo;

    @PostMapping("/{bookingId}/service-requests")
    public ResponseEntity<YeuCauDichVuTaiSan> taoYeuCauDichVu(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để gọi dịch vụ tại sân.");
        }

        DonDatSan booking = khoDonDatSan.findById(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt sân."));

        if (!"ADMIN".equals(userRole) && !booking.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ đơn đặt sân này.");
        }

        if (booking.getStatus() != TrangThaiDonDat.CHECKED_IN) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_CHECKED_IN",
                    "Chỉ có thể gọi dịch vụ phục vụ tại sân sau khi đã quét QR Check-in nhận sân.");
        }

        String items = body.get("items") != null ? String.valueOf(body.get("items")).trim() : "";
        if (items.isEmpty()) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_ITEMS", "Vui lòng chọn ít nhất 1 sản phẩm hoặc dịch vụ.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        if (body.get("totalAmount") != null) {
            try {
                totalAmount = new BigDecimal(String.valueOf(body.get("totalAmount")));
            } catch (Exception ignored) {}
        }

        String customerName = body.get("customerName") != null && !String.valueOf(body.get("customerName")).isBlank()
                ? String.valueOf(body.get("customerName")).trim()
                : ("Khách hàng #" + userId);

        Long venueId = 1L;
        String courtName = "Sân #" + booking.getCourtId();
        try {
            var config = dichVuGoiSanNoiBo.layCauHinhSan(booking.getCourtId(), booking.getBookingDate());
            if (config != null) {
                if (config.getVenueId() != null) venueId = config.getVenueId();
                if (config.getCourtName() != null && !config.getCourtName().isBlank()) courtName = config.getCourtName();
            }
        } catch (Exception ex) {
            if (body.get("venueId") != null) {
                try { venueId = Long.parseLong(String.valueOf(body.get("venueId"))); } catch (Exception ignored) {}
            }
        }

        YeuCauDichVuTaiSan req = YeuCauDichVuTaiSan.builder()
                .bookingId(bookingId)
                .venueId(venueId)
                .courtId(booking.getCourtId())
                .courtName(courtName)
                .customerId(userId)
                .customerName(customerName)
                .items(items)
                .totalAmount(totalAmount)
                .status("PENDING")
                .build();

        req = khoYeuCauDichVu.save(req);

        // Ban thong bao cho Nhan vien truc quay co so tuong ung (CS1->userId 2, CS2->3, CS3->4) va Admin (userId 1)
        Long staffUserId = (venueId >= 1 && venueId <= 3) ? (venueId + 1) : 2L;
        String tenCoSo = tenCoSoTheoId(venueId);
        String tieuDe = "[" + tenCoSo + "] Yêu cầu phục vụ tại " + courtName;
        String noiDung = "[" + tenCoSo + "] " + customerName + " (Vé #" + bookingId + ") vừa gọi: " + items;
        dichVuGoiThongBaoNoiBo.guiThongBao(staffUserId, tieuDe, noiDung, "SERVICE_REQUEST", req.getId());
        dichVuGoiThongBaoNoiBo.guiThongBao(1L, tieuDe, noiDung, "SERVICE_REQUEST", req.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(req);
    }

    private String tenCoSoTheoId(Long venueId) {
        if (venueId == null) return "Cơ Sở 1 - Cầu Giấy";
        if (venueId == 1L) return "Cơ Sở 1 - Cầu Giấy";
        if (venueId == 2L) return "Cơ Sở 2 - Đống Đa";
        if (venueId == 3L) return "Cơ Sở 3 - Hà Đông";
        return "Cơ Sở #" + venueId;
    }

    @GetMapping("/service-requests")
    public ResponseEntity<List<YeuCauDichVuTaiSan>> layDanhSachYeuCau(
            @RequestParam(required = false) Long venueId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole) && !"STAFF".equals(userRole) && !"OWNER".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ nhân viên hoặc quản trị viên mới có quyền xem yêu cầu phục vụ.");
        }

        List<YeuCauDichVuTaiSan> list = venueId != null
                ? khoYeuCauDichVu.findByVenueIdOrderByCreatedAtDesc(venueId)
                : khoYeuCauDichVu.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/service-requests/me")
    public ResponseEntity<List<YeuCauDichVuTaiSan>> layYeuCauCuaToi(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập.");
        }
        return ResponseEntity.ok(khoYeuCauDichVu.findByCustomerIdOrderByCreatedAtDesc(userId));
    }

    @PatchMapping("/service-requests/{id}/status")
    public ResponseEntity<YeuCauDichVuTaiSan> capNhatTrangThaiYeuCau(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole) && !"STAFF".equals(userRole) && !"OWNER".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ nhân viên hoặc quản trị viên mới có quyền xử lý yêu cầu phục vụ.");
        }

        YeuCauDichVuTaiSan req = khoYeuCauDichVu.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "SERVICE_REQUEST_NOT_FOUND", "Không tìm thấy yêu cầu phục vụ."));

        String nextStatus = body.getOrDefault("status", "DELIVERED").trim().toUpperCase();
        req.setStatus(nextStatus);
        req = khoYeuCauDichVu.save(req);

        if ("DELIVERED".equals(nextStatus)) {
            dichVuGoiThongBaoNoiBo.guiThongBao(
                    req.getCustomerId(),
                    "Đã giao dịch vụ tại " + req.getCourtName(),
                    "Nhân viên đã giao: " + req.getItems() + " đến tận sân cho bạn.",
                    "SERVICE_DELIVERED",
                    req.getId()
            );
        }

        return ResponseEntity.ok(req);
    }
}
