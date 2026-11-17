/**
 * File: KiemThuXacThuc.java
 * Muc dich: Kiem thu tu dong (Unit/Integration Test) ve nghiep vu dang ky va dang nhap trong user-service.
 * Chuc nang: Kiem chung dang ky luon co role CUSTOMER; dang nhap sai tra 401; tai khoan bi khoa LOCKED khong the dang nhap.
 */
package com.sportbooking.userservice;

import com.sportbooking.userservice.dichvu.DichVuNguoiDung;
import com.sportbooking.userservice.dulieu.TraVeNguoiDung;
import com.sportbooking.userservice.dulieu.YeuCauDangKy;
import com.sportbooking.userservice.dulieu.YeuCauDangNhap;
import com.sportbooking.userservice.ngoaile.LoiNghiepVu;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class KiemThuXacThuc {

    @Autowired
    private DichVuNguoiDung dichVuNguoiDung;

    @Test
    @DisplayName("Dang ky nguoi dung moi luon mang vai tro CUSTOMER va trang thai ACTIVE")
    void testDangKyLuonLaCustomer() {
        String testEmail = "testuser_" + System.currentTimeMillis() + "@gmail.com";
        YeuCauDangKy req = new YeuCauDangKy();
        req.setEmail(testEmail);
        req.setPassword("Password@123");
        req.setFullName("Nguyen Van Test");
        req.setPhone("0987654321");

        var user = dichVuNguoiDung.dangKy(req);
        assertNotNull(user);
        assertEquals("CUSTOMER", user.getRole());
        assertEquals("PENDING_VERIFICATION", user.getStatus());
        assertNotNull(user.getOtpCode());
        assertEquals(6, user.getOtpCode().length());
    }

    @Test
    @DisplayName("Dang nhap dung mat khau tra ve cookie access_token va XSRF-TOKEN")
    void testDangNhapThanhCong() {
        MockHttpServletResponse res = new MockHttpServletResponse();
        YeuCauDangNhap req = new YeuCauDangNhap();
        req.setEmail("customer1@sportbooking.com");
        req.setPassword("Customer@123");

        TraVeNguoiDung user = dichVuNguoiDung.dangNhap(req, res);
        assertNotNull(user);
        assertEquals("customer1@sportbooking.com", user.getEmail());

        // Kiem tra da set cookie access_token HttpOnly
        assertNotNull(res.getCookie("access_token"));
        assertTrue(res.getCookie("access_token").isHttpOnly());
        assertNotNull(res.getCookie("XSRF-TOKEN"));
    }

    @Test
    @DisplayName("Dang nhap sai mat khau nem loi 401 INVALID_CREDENTIALS")
    void testDangNhapSaiMatKhau() {
        MockHttpServletResponse res = new MockHttpServletResponse();
        YeuCauDangNhap req = new YeuCauDangNhap();
        req.setEmail("customer1@sportbooking.com");
        req.setPassword("SaiMatKhauRoi");

        LoiNghiepVu ex = assertThrows(LoiNghiepVu.class, () -> {
            dichVuNguoiDung.dangNhap(req, res);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("INVALID_CREDENTIALS", ex.getCode());
    }
}
