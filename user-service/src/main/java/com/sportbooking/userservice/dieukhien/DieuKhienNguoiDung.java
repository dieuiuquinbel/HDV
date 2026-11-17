/**
 * File: DieuKhienNguoiDung.java
 * Muc dich: Controller tiep nhan cac yeu cau ve thong tin nguoi dung va quan tri.
 * Chuc nang: Xem thong tin ban than (GET /users/me), Admin xem danh sach (GET /users) va Admin khoa tai khoan (PATCH /users/{id}/status).
 */
package com.sportbooking.userservice.dieukhien;

import com.sportbooking.userservice.dichvu.DichVuNguoiDung;
import com.sportbooking.userservice.dulieu.TraVeNguoiDung;
import com.sportbooking.userservice.dulieu.YeuCauDoiTrangThai;
import com.sportbooking.userservice.ngoaile.LoiNghiepVu;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class DieuKhienNguoiDung {

    private final DichVuNguoiDung dichVuNguoiDung;

    @GetMapping("/me")
    public ResponseEntity<TraVeNguoiDung> layThongTinBanThan(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yeu cau dang nhap");
        }
        return ResponseEntity.ok(dichVuNguoiDung.layThongTinBanThan(userId));
    }

    @GetMapping
    public ResponseEntity<Page<TraVeNguoiDung>> layDanhSachNguoiDung(
            @RequestParam(required = false) VaiTro role,
            @RequestParam(required = false) TrangThaiNguoiDung status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chi quan tri vien moi co quyen xem danh sach");
        }

        Sort sapXep = Sort.by(sort.length > 1 && sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sort[0]);
        Pageable phanTrang = PageRequest.of(page, Math.min(size, 100), sapXep);

        return ResponseEntity.ok(dichVuNguoiDung.layDanhSachNguoiDung(role, status, phanTrang));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TraVeNguoiDung> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody YeuCauDoiTrangThai yeuCau,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chi quan tri vien moi co quyen khoa/mo tai khoan");
        }

        return ResponseEntity.ok(dichVuNguoiDung.capNhatTrangThai(id, yeuCau.getStatus()));
    }
}
