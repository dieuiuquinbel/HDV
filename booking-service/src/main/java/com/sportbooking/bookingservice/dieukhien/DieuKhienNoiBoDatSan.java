/**
 * File: DieuKhienNoiBoDatSan.java
 * Muc dich: Controller tiep nhan cac yeu cau noi bo tu Payment Service.
 * Chuc nang: Tra ve thong tin so tien payable-summary va xac nhan ket qua thanh toan payment-confirmation.
 */
package com.sportbooking.bookingservice.dieukhien;

import com.sportbooking.bookingservice.dichvu.DichVuDatSan;
import com.sportbooking.bookingservice.dulieu.TraVeThanhToanNoiBo;
import com.sportbooking.bookingservice.dulieu.YeuCauXacNhanThanhToan;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/v1/bookings")
@RequiredArgsConstructor
public class DieuKhienNoiBoDatSan {

    private final DichVuDatSan dichVuDatSan;

    @Value("${internal.api-key}")
    private String khoaNoiBo;

    @GetMapping("/{id}/payable-summary")
    public ResponseEntity<TraVeThanhToanNoiBo> layThongTinThanhToan(
            @PathVariable Long id,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Truy cập dịch vụ nội bộ bị từ chối.");
        }

        return ResponseEntity.ok(dichVuDatSan.layThongTinThanhToanNoiBo(id));
    }

    @PostMapping("/{id}/payment-confirmation")
    public ResponseEntity<Void> xacNhanThanhToan(
            @PathVariable Long id,
            @Valid @RequestBody YeuCauXacNhanThanhToan yeuCau,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Truy cập dịch vụ nội bộ bị từ chối.");
        }

        dichVuDatSan.xacNhanThanhToanNoiBo(id, yeuCau);
        return ResponseEntity.ok().build();
    }
}
