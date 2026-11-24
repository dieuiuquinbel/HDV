/**
 * File: DieuKhienThongBao.java
 * Muc dich: Controller tiep nhan cac yeu cau xem va quan ly thong bao cua nguoi dung.
 * Chuc nang: GET /notifications/me (lay danh sach), PATCH /notifications/{id}/read (danh dau da doc), GET /notifications/unread-count.
 */
package com.sportbooking.notificationservice.dieukhien;

import com.sportbooking.notificationservice.dichvu.DichVuThongBao;
import com.sportbooking.notificationservice.dulieu.TraVeThongBao;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class DieuKhienThongBao {

    private final DichVuThongBao dichVuThongBao;

    @GetMapping("/me")
    public ResponseEntity<Page<TraVeThongBao>> layThongBaoCuaToi(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Pageable phanTrang = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(dichVuThongBao.layThongBaoCuaToi(userId, phanTrang));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> danhDauDaDoc(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean thanhCong = dichVuThongBao.danhDauDaDoc(id, userId);
        if (!thanhCong) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> danhDauTatCaDaDoc(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int soLuong = dichVuThongBao.danhDauTatCaDaDoc(userId);
        return ResponseEntity.ok(Map.of("success", true, "markedCount", (long) soLuong));
    }

    @GetMapping({"/unread-count", "/me/unread-count"})
    public ResponseEntity<Map<String, Long>> demChuaDoc(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long count = dichVuThongBao.demChuaDoc(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
