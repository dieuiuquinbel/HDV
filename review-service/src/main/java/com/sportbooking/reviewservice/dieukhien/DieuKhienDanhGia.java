/**
 * File: DieuKhienDanhGia.java
 * Muc dich: Controller tiep nhan cac yeu cau gui danh gia va xem danh gia san the thao.
 * Chuc nang: POST /reviews (gui danh gia), GET /courts/{courtId}/reviews (lay danh sach), GET /courts/{courtId}/rating-summary.
 */
package com.sportbooking.reviewservice.dieukhien;

import com.sportbooking.reviewservice.dichvu.DichVuDanhGia;
import com.sportbooking.reviewservice.dulieu.TraVeDanhGia;
import com.sportbooking.reviewservice.dulieu.TraVeTongQuanRating;
import com.sportbooking.reviewservice.dulieu.YeuCauTaoDanhGia;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class DieuKhienDanhGia {

    private final DichVuDanhGia dichVuDanhGia;

    @PostMapping("/reviews")
    public ResponseEntity<TraVeDanhGia> taoDanhGia(
            @Valid @RequestBody YeuCauTaoDanhGia yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(dichVuDanhGia.taoDanhGia(userId, userEmail, yeuCau));
    }

    @GetMapping({"/courts/{courtId}/reviews", "/court/{courtId}", "/reviews/court/{courtId}"})
    public ResponseEntity<Page<TraVeDanhGia>> layDanhGiaSan(
            @PathVariable Long courtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable phanTrang = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(dichVuDanhGia.layDanhGiaTheoSan(courtId, phanTrang));
    }

    @GetMapping({"/courts/{courtId}/rating-summary", "/court/{courtId}/summary", "/reviews/court/{courtId}/summary"})
    public ResponseEntity<TraVeTongQuanRating> layTongQuanRating(@PathVariable Long courtId) {
        return ResponseEntity.ok(dichVuDanhGia.layTongQuanRating(courtId));
    }
}
