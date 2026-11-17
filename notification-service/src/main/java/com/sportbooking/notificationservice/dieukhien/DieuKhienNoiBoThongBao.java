/**
 * File: DieuKhienNoiBoThongBao.java
 * Muc dich: Controller tiep nhan cac yeu cau noi bo tu Booking Service va Payment Service de phat sinh thong bao.
 * Chuc nang: POST /internal/v1/notifications, yeu cau header X-Internal-Api-Key de xac thuc.
 */
package com.sportbooking.notificationservice.dieukhien;

import com.sportbooking.notificationservice.dichvu.DichVuThongBao;
import com.sportbooking.notificationservice.dulieu.TraVeThongBao;
import com.sportbooking.notificationservice.dulieu.YeuCauTaoThongBao;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/v1/notifications")
@RequiredArgsConstructor
public class DieuKhienNoiBoThongBao {

    private final DichVuThongBao dichVuThongBao;

    @Value("${internal.api-key}")
    private String khoaNoiBo;

    @PostMapping
    public ResponseEntity<TraVeThongBao> taoThongBao(
            @Valid @RequestBody YeuCauTaoThongBao yeuCau,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(dichVuThongBao.taoThongBao(yeuCau));
    }
}
