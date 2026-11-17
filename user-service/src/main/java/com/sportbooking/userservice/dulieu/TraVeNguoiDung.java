/**
 * File: TraVeNguoiDung.java
 * Muc dich: DTO tra ve thong tin nguoi dung (khong chua mat khau) cho client.
 * Chuc nang: Chuyen doi tu thuc the NguoiDung sang DTO an toan, ho tro hien thi profile va quan ly.
 */
package com.sportbooking.userservice.dulieu;

import com.sportbooking.userservice.thucthe.NguoiDung;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TraVeNguoiDung {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private VaiTro role;
    private TrangThaiNguoiDung status;
    private Integer tokenVersion;
    private Instant createdAt;

    public static TraVeNguoiDung tuThucThe(NguoiDung nguoiDung) {
        return TraVeNguoiDung.builder()
                .id(nguoiDung.getId())
                .email(nguoiDung.getEmail())
                .fullName(nguoiDung.getFullName())
                .phone(nguoiDung.getPhone())
                .role(nguoiDung.getRole())
                .status(nguoiDung.getStatus())
                .tokenVersion(nguoiDung.getTokenVersion())
                .createdAt(nguoiDung.getCreatedAt())
                .build();
    }
}
