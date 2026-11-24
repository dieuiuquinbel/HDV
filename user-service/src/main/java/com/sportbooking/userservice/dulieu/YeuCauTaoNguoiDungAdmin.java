package com.sportbooking.userservice.dulieu;

import com.sportbooking.userservice.thucthe.VaiTro;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class YeuCauTaoNguoiDungAdmin {
    @NotBlank(message = "Email là bắt buộc")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Họ tên là bắt buộc")
    private String fullName;

    private String phone;

    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;

    private VaiTro role = VaiTro.CUSTOMER;
}
