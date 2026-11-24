/**
 * File: DieuKhienSanCon.java
 * Muc dich: Controller xu ly cac API lien quan den san con (Court).
 * Chuc nang: Chu san them san vao cum san, sua gia, cau hinh gio mo cua va quy tac gia cao diem.
 */
package com.sportbooking.courtservice.dieukhien;

import com.sportbooking.courtservice.dichvu.DichVuSanCon;
import com.sportbooking.courtservice.dulieu.*;
import com.sportbooking.courtservice.ngoaile.LoiNghiepVu;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DieuKhienSanCon {

    private final DichVuSanCon dichVuSanCon;

    @PostMapping("/venues/{venueId}/courts")
    public ResponseEntity<TraVeSanCon> taoSanCon(
            @PathVariable Long venueId,
            @Valid @RequestBody YeuCauTaoSanCon yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ chủ sân hoặc quản trị viên mới có quyền tạo sân con.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(dichVuSanCon.taoSanCon(userId, venueId, yeuCau));
    }

    @PutMapping("/courts/{id}")
    public ResponseEntity<TraVeSanCon> capNhatSanCon(
            @PathVariable Long id,
            @Valid @RequestBody YeuCauCapNhatSanCon yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền cập nhật thông tin sân này.");
        }
        return ResponseEntity.ok(dichVuSanCon.capNhatSanCon(userId, userRole, id, yeuCau));
    }

    @PatchMapping("/courts/{id}/status")
    public ResponseEntity<TraVeSanCon> doiTrangThaiSanCon(
            @PathVariable Long id,
            @Valid @RequestBody YeuCauDoiTrangThaiSan yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thay đổi trạng thái sân này.");
        }
        return ResponseEntity.ok(dichVuSanCon.doiTrangThaiSanCon(userId, userRole, id, yeuCau.getStatus()));
    }

    @PutMapping("/courts/{id}/operating-hours")
    public ResponseEntity<Void> capNhatGioHoatDong(
            @PathVariable Long id,
            @Valid @RequestBody List<YeuCauKhungGioHoatDong> danhSachGio,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thiết lập khung giờ hoạt động cho sân này.");
        }
        dichVuSanCon.capNhatKhungGioHoatDong(userId, id, danhSachGio);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/courts/{id}/price-rules")
    public ResponseEntity<Void> capNhatQuyTacGia(
            @PathVariable Long id,
            @Valid @RequestBody List<YeuCauQuyTacGia> danhSachGia,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thiết lập bảng giá cho sân này.");
        }
        dichVuSanCon.capNhatQuyTacGia(userId, id, danhSachGia);
        return ResponseEntity.ok().build();
    }
}
