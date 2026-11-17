/**
 * File: YeuCauDoiTrangThai.java
 * Muc dich: DTO cap nhat trang thai nguoi dung (ACTIVE hoac LOCKED) danh cho quan tri vien Admin.
 * Chuc nang: Validate trang thai moi khong duoc phep rong.
 */
package com.sportbooking.userservice.dulieu;

import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauDoiTrangThai {
    @NotNull(message = "Trang thai khong duoc de trong")
    private TrangThaiNguoiDung status;
}
