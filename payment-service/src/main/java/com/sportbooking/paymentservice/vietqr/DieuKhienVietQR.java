/**
 * File: DieuKhienVietQR.java
 * Muc dich: Controller tiep nhan yeu cau tao va quet ma QR chuyen khoan Techcombank (VietQR).
 * Chuc nang: GET /payments/{id}/vietqr, POST /payments/vietqr/scan (ho tro multipart file hoac JSON base64).
 */
package com.sportbooking.paymentservice.vietqr;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "VietQR Techcombank", description = "API sinh va quet ma QR chuyen khoan Ngan hang Techcombank")
public class DieuKhienVietQR {

    private final DichVuVietQR dichVuVietQR;

    @Operation(summary = "Lay thong tin va ma QR chuyen khoan Techcombank cho giao dich")
    @GetMapping("/{id}/vietqr")
    public ResponseEntity<TraVeVietQR> layThongTinVietQR(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        return ResponseEntity.ok(dichVuVietQR.taoVietQRChoGiaoDich(id, userId, userRole));
    }

    @Operation(summary = "Quet va giai ma QR chuyen khoan tu chuoi Base64 hoac text")
    @PostMapping("/vietqr/scan")
    public ResponseEntity<Map<String, Object>> quetMaQrTuJson(@RequestBody Map<String, String> yeuCau) {
        String data = yeuCau.get("data");
        return ResponseEntity.ok(dichVuVietQR.quetMaQrTuBase64(data));
    }

    @Operation(summary = "Quet va giai ma QR chuyen khoan tu file anh upload")
    @PostMapping(value = "/vietqr/scan-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> quetMaQrTuFile(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(dichVuVietQR.quetMaQrTuDuLieuAnh(file.getInputStream()));
    }
}
