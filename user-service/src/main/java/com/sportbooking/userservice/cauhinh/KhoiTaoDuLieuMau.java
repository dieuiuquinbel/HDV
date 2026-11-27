/**
 * File: KhoiTaoDuLieuMau.java
 * Muc dich: Nap va dong bo danh sach tai khoan mac dinh he thong ESportKing tu file tai-khoan-mac-dinh.json o thu muc goc.
 * Chuc nang:
 *  - Doc file tai-khoan-mac-dinh.json (chi can sua file JSON nay va khoi dong lai user-service, khong can sua code Java).
 *  - Tu dong cap nhat email/mat khau neu tai khoan cu (legacyEmail) hoac tai khoan hien tai da ton tai trong DB.
 */
package com.sportbooking.userservice.cauhinh;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportbooking.userservice.khodulieu.KhoNguoiDung;
import com.sportbooking.userservice.thucthe.NguoiDung;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class KhoiTaoDuLieuMau implements CommandLineRunner {

    private final KhoNguoiDung khoNguoiDung;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Data
    public static class CauHinhTaiKhoan {
        private String email;
        private String legacyEmail;
        private String password;
        private String fullName;
        private String phone;
        private String role;
    }

    @Override
    public void run(String... args) {
        List<CauHinhTaiKhoan> danhSach = docDanhSachTaiKhoan();
        for (CauHinhTaiKhoan tk : danhSach) {
            dongBoTaiKhoan(tk);
        }
    }

    private List<CauHinhTaiKhoan> docDanhSachTaiKhoan() {
        List<Path> cacDuongDan = List.of(
                Paths.get("tai-khoan-mac-dinh.json"),
                Paths.get("..", "tai-khoan-mac-dinh.json")
        );

        for (Path duongDan : cacDuongDan) {
            if (Files.exists(duongDan)) {
                try {
                    List<CauHinhTaiKhoan> list = objectMapper.readValue(
                            duongDan.toFile(),
                            new TypeReference<List<CauHinhTaiKhoan>>() {}
                    );
                    log.info("Da nap {} tai khoan mac dinh tu {}", list.size(), duongDan.toAbsolutePath());
                    return list;
                } catch (Exception e) {
                    log.warn("Khong doc duoc file {}: {}", duongDan.toAbsolutePath(), e.getMessage());
                }
            }
        }

        // Fallback neu khong tim thay file tai-khoan-mac-dinh.json
        return List.of(
                taoCauHinh("admin", "admin@esportking.vn", "admin123", "Chủ Hệ Thống ESportKing", "0900000001", "ADMIN"),
                taoCauHinh("staff1", "staff_cs1@esportking.vn", "staff123", "Nhân Viên Quầy CS1 - Cầu Giấy", "0900000011", "STAFF"),
                taoCauHinh("staff2", "staff_cs2@esportking.vn", "staff123", "Nhân Viên Quầy CS2 - Đống Đa", "0900000012", "STAFF"),
                taoCauHinh("staff3", "staff_cs3@esportking.vn", "staff123", "Nhân Viên Quầy CS3 - Long Biên", "0900000013", "STAFF"),
                taoCauHinh("customer", "customer@esportking.vn", "customer123", "Khách Hàng Nguyễn Văn A", "0900000003", "CUSTOMER")
        );
    }

    private CauHinhTaiKhoan taoCauHinh(String email, String legacyEmail, String password, String fullName, String phone, String role) {
        CauHinhTaiKhoan tk = new CauHinhTaiKhoan();
        tk.setEmail(email);
        tk.setLegacyEmail(legacyEmail);
        tk.setPassword(password);
        tk.setFullName(fullName);
        tk.setPhone(phone);
        tk.setRole(role);
        return tk;
    }

    private void dongBoTaiKhoan(CauHinhTaiKhoan tk) {
        if (tk.getEmail() == null || tk.getEmail().isBlank() || tk.getPassword() == null || tk.getPassword().isBlank()) {
            return;
        }

        VaiTro role = VaiTro.valueOf(tk.getRole().trim().toUpperCase());
        Optional<NguoiDung> hienCo = khoNguoiDung.findByEmail(tk.getEmail().trim());
        if (hienCo.isEmpty() && tk.getLegacyEmail() != null && !tk.getLegacyEmail().isBlank()) {
            hienCo = khoNguoiDung.findByEmail(tk.getLegacyEmail().trim());
        }

        if (hienCo.isPresent()) {
            NguoiDung user = hienCo.get();
            user.setEmail(tk.getEmail().trim());
            user.setPasswordHash(passwordEncoder.encode(tk.getPassword()));
            if (tk.getFullName() != null && !tk.getFullName().isBlank()) {
                user.setFullName(tk.getFullName());
            }
            if (tk.getPhone() != null && !tk.getPhone().isBlank()) {
                user.setPhone(tk.getPhone());
            }
            user.setRole(role);
            user.setStatus(TrangThaiNguoiDung.ACTIVE);
            khoNguoiDung.save(user);
            log.info("Dong bo tai khoan mac dinh: {} ({})", user.getEmail(), role);
        } else {
            NguoiDung user = NguoiDung.builder()
                    .email(tk.getEmail().trim())
                    .passwordHash(passwordEncoder.encode(tk.getPassword()))
                    .fullName(tk.getFullName())
                    .phone(tk.getPhone())
                    .role(role)
                    .status(TrangThaiNguoiDung.ACTIVE)
                    .tokenVersion(0)
                    .build();
            khoNguoiDung.save(user);
            log.info("Khoi tao tai khoan mac dinh: {} ({})", user.getEmail(), role);
        }
    }
}
