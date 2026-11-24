/**
 * File: DieuKhienNoiBoThanhToan.java
 * Muc dich: Controller tiep nhan cac yeu cau noi bo tu Booking Service.
 * Chuc nang: Danh dau giao dich PENDING sang REJECTED_EXPIRED khi booking bi CANCELLED hoac EXPIRED.
 */
package com.sportbooking.paymentservice.dieukhien;

import com.sportbooking.paymentservice.dichvu.DichVuThanhToan;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/v1/payments")
@RequiredArgsConstructor
public class DieuKhienNoiBoThanhToan {

    private final DichVuThanhToan dichVuThanhToan;

    @Value("${internal.api-key}")
    private String khoaNoiBo;

    @PostMapping("/booking/{bookingId}/reject-pending")
    public ResponseEntity<Void> tuChoiThanhToan(
            @PathVariable Long bookingId,
            @RequestParam(defaultValue = "EXPIRED") String reason,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Truy cap noi bo bi tu choi");
        }

        dichVuThanhToan.tuChoiThanhToanNoiBo(bookingId, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/booking/{bookingId}/refund")
    public ResponseEntity<Void> hoanTien(
            @PathVariable Long bookingId,
            @RequestParam(required = false) java.math.BigDecimal amount,
            @RequestParam(defaultValue = "Huy don hop le") String reason,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Truy cap noi bo bi tu choi");
        }

        dichVuThanhToan.hoanTienNoiBo(bookingId, amount, reason);
        return ResponseEntity.ok().build();
    }
}
