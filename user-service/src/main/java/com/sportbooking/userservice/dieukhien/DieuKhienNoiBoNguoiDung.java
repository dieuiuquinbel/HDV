/**
 * File: DieuKhienNoiBoNguoiDung.java
 * Muc dich: Controller tiep nhan cac yeu cau noi bo tu API Gateway de kiem tra tinh hop le cua token.
 * Chuc nang: Tra ve tokenVersion hien tai cua nguoi dung, yeu cau header X-Internal-Api-Key de xac thuc.
 */
package com.sportbooking.userservice.dieukhien;

import com.sportbooking.userservice.dichvu.DichVuNguoiDung;
import com.sportbooking.userservice.ngoaile.LoiNghiepVu;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/internal/v1/users")
@RequiredArgsConstructor
public class DieuKhienNoiBoNguoiDung {

    private final DichVuNguoiDung dichVuNguoiDung;

    @Value("${internal.api-key}")
    private String khoaNoiBo;

    @GetMapping("/{id}/token-version")
    public ResponseEntity<Map<String, Object>> layTokenVersion(
            @PathVariable Long id,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String khoaGuiLen) {

        if (khoaGuiLen == null || !khoaGuiLen.equals(khoaNoiBo)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Truy cap noi bo bi tu choi");
        }

        Integer phienToken = dichVuNguoiDung.layTokenVersion(id);
        return ResponseEntity.ok(Map.of("userId", id, "tokenVersion", phienToken));
    }
}
