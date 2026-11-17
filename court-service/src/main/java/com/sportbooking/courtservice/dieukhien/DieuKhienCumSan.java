/**
 * File: DieuKhienCumSan.java
 * Muc dich: Controller xu ly cac API lien quan den cum san (Venue).
 * Chuc nang: Khach tim kiem/xem chi tiet cum san; Chu san tao/sua/an cum san cua minh.
 */
package com.sportbooking.courtservice.dieukhien;

import com.sportbooking.courtservice.dichvu.DichVuCumSan;
import com.sportbooking.courtservice.dulieu.TraVeCumSan;
import com.sportbooking.courtservice.dulieu.YeuCauCapNhatCumSan;
import com.sportbooking.courtservice.dulieu.YeuCauDoiTrangThaiSan;
import com.sportbooking.courtservice.dulieu.YeuCauTaoCumSan;
import com.sportbooking.courtservice.ngoaile.LoiNghiepVu;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class DieuKhienCumSan {

    private final DichVuCumSan dichVuCumSan;
    private final com.sportbooking.courtservice.dichvu.DichVuSanCon dichVuSanCon;
    private final com.sportbooking.courtservice.khodulieu.KhoTienIch khoTienIch;

    @GetMapping
    public ResponseEntity<Page<TraVeCumSan>> layDanhSach(
            @RequestParam(required = false) String sportType,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String configType,
            @RequestParam(required = false) String surface,
            @RequestParam(required = false) java.math.BigDecimal priceMin,
            @RequestParam(required = false) java.math.BigDecimal priceMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Sort sapXep = Sort.by(sort.length > 1 && sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sort[0]);
        Pageable phanTrang = PageRequest.of(page, Math.min(size, 100), sapXep);

        return ResponseEntity.ok(dichVuCumSan.layDanhSachCumSan(
                sportType, district, configType, surface, priceMin, priceMax, phanTrang));
    }

    @GetMapping("/court-types")
    public ResponseEntity<List<com.sportbooking.courtservice.dulieu.TraVeLoaiHinhSanCatalog>> layDanhMucLoaiHinhSan(
            @RequestParam(required = false) Long sportTypeId) {
        return ResponseEntity.ok(dichVuSanCon.layDanhMucLoaiHinhSan(sportTypeId));
    }

    @GetMapping("/amenities")
    public ResponseEntity<List<com.sportbooking.courtservice.dulieu.TraVeTienIch>> layTatCaTienIch() {
        return ResponseEntity.ok(khoTienIch.findAll().stream()
                .map(com.sportbooking.courtservice.dulieu.TraVeTienIch::tuThucThe)
                .collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TraVeCumSan> layChiTiet(@PathVariable Long id) {
        return ResponseEntity.ok(dichVuCumSan.layChiTietCumSan(id));
    }

    @GetMapping("/my-venues")
    public ResponseEntity<List<TraVeCumSan>> layCumSanCuaToi(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ chủ sân hoặc quản trị viên mới có quyền xem.");
        }
        return ResponseEntity.ok(dichVuCumSan.layCumSanCuaChu(userId));
    }

    @PostMapping
    public ResponseEntity<TraVeCumSan> taoMoi(
            @Valid @RequestBody YeuCauTaoCumSan yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ chủ sân hoặc quản trị viên mới có quyền tạo cụm sân.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(dichVuCumSan.taoCumSan(userId, yeuCau));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TraVeCumSan> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody YeuCauCapNhatCumSan yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null || (!"OWNER".equals(userRole) && !"ADMIN".equals(userRole))) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền cập nhật cụm sân này.");
        }
        return ResponseEntity.ok(dichVuCumSan.capNhatCumSan(userId, userRole, id, yeuCau));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TraVeCumSan> doiTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody YeuCauDoiTrangThaiSan yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để thực hiện thao tác.");
        }
        return ResponseEntity.ok(dichVuCumSan.doiTrangThaiCumSan(userId, userRole, id, yeuCau.getStatus()));
    }
}
