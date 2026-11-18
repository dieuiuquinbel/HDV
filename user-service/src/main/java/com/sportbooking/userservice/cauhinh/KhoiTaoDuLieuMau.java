/**
 * File: KhoiTaoDuLieuMau.java
 * Muc dich: Nap du lieu 5 tai khoan mac dinh he thong the thao ESportKing Ha Noi.
 * Chuc nang: 1 Admin quan tri, 3 Nhan vien truc quay 3 co so (Cau Giay, Dong Da, Ha Dong), va 1 Khach hang mac dinh.
 */
package com.sportbooking.userservice.cauhinh;

import com.sportbooking.userservice.khodulieu.KhoNguoiDung;
import com.sportbooking.userservice.thucthe.NguoiDung;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KhoiTaoDuLieuMau implements CommandLineRunner {

    private final KhoNguoiDung khoNguoiDung;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        taoTaiKhoanNeuChuaCo("admin@esportking.vn", "Admin@123", "Chủ Hệ Thống ESportKing", "0900000001", VaiTro.ADMIN);
        taoTaiKhoanNeuChuaCo("staff_cs1@esportking.vn", "Staff@123", "Nhân Viên Quầy CS1 - Cầu Giấy", "0900000011", VaiTro.STAFF);
        taoTaiKhoanNeuChuaCo("staff_cs2@esportking.vn", "Staff@123", "Nhân Viên Quầy CS2 - Đống Đa", "0900000012", VaiTro.STAFF);
        taoTaiKhoanNeuChuaCo("staff_cs3@esportking.vn", "Staff@123", "Nhân Viên Quầy CS3 - Hà Đông", "0900000013", VaiTro.STAFF);
        taoTaiKhoanNeuChuaCo("customer@esportking.vn", "Customer@123", "Khách Hàng Nguyễn Văn A", "0900000003", VaiTro.CUSTOMER);
    }

    private void taoTaiKhoanNeuChuaCo(String email, String pass, String fullName, String phone, VaiTro role) {
        if (khoNguoiDung.findByEmail(email).isEmpty()) {
            NguoiDung user = NguoiDung.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(pass))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .status(TrangThaiNguoiDung.ACTIVE)
                    .tokenVersion(0)
                    .build();
            khoNguoiDung.save(user);
            log.info("Khoi tao tai khoan: {} ({})", email, role);
        }
    }
}
