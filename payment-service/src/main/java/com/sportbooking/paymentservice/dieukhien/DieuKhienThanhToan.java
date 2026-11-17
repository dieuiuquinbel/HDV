/**
 * File: DieuKhienThanhToan.java
 * Muc dich: Controller tiep nhan cac yeu cau khoi tao thanh toan, mo phong ket qua va xem thong ke doanh thu.
 * Chuc nang: POST /payments, POST /payments/{id}/simulate-success, POST /payments/{id}/simulate-failure, POST /payments/{id}/retry, GET /admin/statistics/revenue.
 */
package com.sportbooking.paymentservice.dieukhien;

import com.sportbooking.paymentservice.dichvu.DichVuThanhToan;
import com.sportbooking.paymentservice.dulieu.KetQuaTaoGiaoDich;
import com.sportbooking.paymentservice.dulieu.TraVeGiaoDichThanhToan;
import com.sportbooking.paymentservice.dulieu.YeuCauTaoThanhToan;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class DieuKhienThanhToan {

    private final DichVuThanhToan dichVuThanhToan;

    @PostMapping("/payments")
    public ResponseEntity<TraVeGiaoDichThanhToan> taoGiaoDich(
            @Valid @RequestBody YeuCauTaoThanhToan yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yeu cau dang nhap");
        }

        try {
            KetQuaTaoGiaoDich ketQua = dichVuThanhToan.taoGiaoDich(userId, yeuCau);
            if (ketQua.isMoiTao()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(ketQua.getGiaoDich());
            } else {
                return ResponseEntity.ok(ketQua.getGiaoDich());
            }
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Xử lý race condition khi 2 request POST /payments đến cùng lúc cho cùng bookingId
            TraVeGiaoDichThanhToan daTonTai = dichVuThanhToan.layTheoBookingId(yeuCau.getBookingId(), userId, "CUSTOMER");
            return ResponseEntity.ok(daTonTai);
        }
    }

    @PostMapping("/payments/{id}/simulate-success")
    public ResponseEntity<TraVeGiaoDichThanhToan> moPhongThanhCong(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yeu cau dang nhap");
        }

        return ResponseEntity.ok(dichVuThanhToan.moPhongThanhCong(id, userId));
    }

    @PostMapping("/payments/{id}/simulate-failure")
    public ResponseEntity<TraVeGiaoDichThanhToan> moPhongThatBai(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yeu cau dang nhap");
        }

        return ResponseEntity.ok(dichVuThanhToan.moPhongThatBai(id, userId));
    }

    @PostMapping("/payments/{id}/retry")
    public ResponseEntity<TraVeGiaoDichThanhToan> thuLai(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yeu cau dang nhap");
        }

        return ResponseEntity.ok(dichVuThanhToan.thuLaiThanhToan(id, userId));
    }

    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<TraVeGiaoDichThanhToan> layTheoBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yeu cau dang nhap");
        }

        return ResponseEntity.ok(dichVuThanhToan.layTheoBookingId(bookingId, userId, userRole));
    }

    @GetMapping("/admin/payments")
    public ResponseEntity<Page<TraVeGiaoDichThanhToan>> layDanhSachAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chi quan tri vien moi co quyen xem");
        }

        Pageable phanTrang = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(dichVuThanhToan.layDanhSachAdmin(phanTrang));
    }

    @GetMapping("/admin/statistics/revenue")
    public ResponseEntity<Map<String, Object>> tinhDoanhThu(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chi quan tri vien moi co quyen xem doanh thu");
        }

        ZoneId vnZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate f = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate t = to != null ? to : LocalDate.now();

        Instant fromInstant = f.atStartOfDay(vnZone).toInstant();
        Instant toInstant = t.plusDays(1).atStartOfDay(vnZone).toInstant();

        Map<String, BigDecimal> baoCao = dichVuThanhToan.tinhBaoCaoDoanhThu(fromInstant, toInstant);
        return ResponseEntity.ok(Map.of(
                "from", f,
                "to", t,
                "grossRevenue", baoCao.get("grossRevenue"),
                "refundedAmount", baoCao.get("refundedAmount"),
                "netRevenue", baoCao.get("netRevenue"),
                "totalRevenue", baoCao.get("totalRevenue"),
                "currency", "VND"
        ));
    }
}
