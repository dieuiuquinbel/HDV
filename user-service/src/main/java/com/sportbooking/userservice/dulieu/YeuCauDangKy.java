/**
 * File: YeuCauDangKy.java
 * Muc dich: DTO tiep nhan du lieu gui len khi nguoi dung dang ky tai khoan moi.
 * Chuc nang: Kiem tra hop le email, mat khau, ho ten va so dien thoai.
 */
package com.sportbooking.userservice.dulieu;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class YeuCauDangKy {
    @NotBlank(message = "Email la bat buoc")
    @Email(message = "Email khong hop le")
    private String email;

    @NotBlank(message = "Mat khau la bat buoc")
    @Size(min = 6, message = "Mat khau toi thieu 6 ky tu")
    private String password;

    @NotBlank(message = "Ho va ten la bat buoc")
    private String fullName;

    private String phone;
}
