/**
 * File: DieuKhienNoiBoSan.java
 * Muc dich: Controller tiep nhan cac yeu cau noi bo tu Booking Service de kiem tra gio hoat dong va gia.
 * Chuc nang: Tra ve TraVeCauHinhDatSan cho courtId va ngay cu the, yeu cau header X-Internal-Api-Key de xac thuc.
 */
package com.sportbooking.courtservice.dieukhien;

import com.sportbooking.courtservice.dichvu.DichVuSanCon;
import com.sportbooking.courtservice.dulieu.TraVeCauHinhDatSan;
import com.sportbooking.courtservice.ngoaile.LoiNghiepVu;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/internal/v1/courts")
@RequiredArgsConstructor
public class DieuKhienNoiBoSan {

    private final DichVuSanCon dichVuSanCon;

    @Value("${internal.api-key}")
    private String khoaNoiBo;

    @GetMapping("/{courtId}/booking-configuration")
    public ResponseEntity<TraVeCauHinhDatSan> layCauHinhDatSan(
            @PathVariable Long courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Truy cập dịch vụ nội bộ bị từ chối.");
        }

        return ResponseEntity.ok(dichVuSanCon.layCauHinhDatSan(courtId, date));
    }
}
