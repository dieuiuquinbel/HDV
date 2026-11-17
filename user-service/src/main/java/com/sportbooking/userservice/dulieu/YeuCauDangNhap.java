/**
 * File: YeuCauDangNhap.java
 * Muc dich: DTO tiep nhan du lieu email va mat khau khi nguoi dung dang nhap.
 * Chuc nang: Validate email hop le va mat khau khong duoc de trong.
 */
package com.sportbooking.userservice.dulieu;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YeuCauDangNhap {
    @NotBlank(message = "Email la bat buoc")
    @Email(message = "Email khong hop le")
    private String email;

    @NotBlank(message = "Mat khau la bat buoc")
    private String password;
}
