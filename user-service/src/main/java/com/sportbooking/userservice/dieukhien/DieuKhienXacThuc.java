/**
 * File: DieuKhienXacThuc.java
 * Muc dich: Controller tiep nhan cac yeu cau xac thuc (auth) cong khai.
 * Chuc nang: Dang ky tai khoan, dang nhap sinh cookie HttpOnly access_token, lay CSRF token va dang xuat.
 */
package com.sportbooking.userservice.dieukhien;

import com.sportbooking.userservice.dichvu.DichVuNguoiDung;
import com.sportbooking.userservice.dulieu.TraVeCsrf;
import com.sportbooking.userservice.dulieu.TraVeDangKyOtp;
import com.sportbooking.userservice.dulieu.TraVeNguoiDung;
import com.sportbooking.userservice.dulieu.YeuCauDangKy;
import com.sportbooking.userservice.dulieu.YeuCauDangNhap;
import com.sportbooking.userservice.dulieu.YeuCauXacMinhOtp;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class DieuKhienXacThuc {

    private final DichVuNguoiDung dichVuNguoiDung;

    @PostMapping("/register")
    public ResponseEntity<TraVeDangKyOtp> dangKy(@Valid @RequestBody YeuCauDangKy yeuCau) {
        TraVeDangKyOtp ketQua = dichVuNguoiDung.dangKy(yeuCau);
        return ResponseEntity.status(HttpStatus.CREATED).body(ketQua);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<TraVeNguoiDung> xacMinhOtp(@Valid @RequestBody YeuCauXacMinhOtp yeuCau) {
        TraVeNguoiDung ketQua = dichVuNguoiDung.xacMinhOtp(yeuCau);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<TraVeDangKyOtp> guiLaiOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        TraVeDangKyOtp ketQua = dichVuNguoiDung.guiLaiOtp(email);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping("/login")
    public ResponseEntity<TraVeNguoiDung> dangNhap(@Valid @RequestBody YeuCauDangNhap yeuCau, HttpServletResponse phanHoi) {
        TraVeNguoiDung ketQua = dichVuNguoiDung.dangNhap(yeuCau, phanHoi);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/csrf")
    public ResponseEntity<TraVeCsrf> layCsrfToken(HttpServletResponse phanHoi) {
        String token = UUID.randomUUID().toString();
        Cookie csrfCookie = new Cookie("XSRF-TOKEN", token);
        csrfCookie.setHttpOnly(false); // Cho phep JS doc de gui lai qua header X-CSRF-Token
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(30 * 60);
        phanHoi.addCookie(csrfCookie);

        return ResponseEntity.ok(new TraVeCsrf(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> dangXuat(HttpServletResponse phanHoi) {
        dichVuNguoiDung.dangXuat(phanHoi);
        return ResponseEntity.noContent().build();
    }
}
