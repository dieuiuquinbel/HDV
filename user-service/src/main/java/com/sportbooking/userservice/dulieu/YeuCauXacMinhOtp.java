/**
 * File: YeuCauXacMinhOtp.java
 * Muc dich: DTO truyen du lieu yeu cau xac minh ma OTP.
 * Chuc nang: Chua email nguoi dung va ma OTP 6 chu so can xac minh de kich hoat tai khoan.
 */
package com.sportbooking.userservice.dulieu;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YeuCauXacMinhOtp {

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong dung dinh dang")
    private String email;

    @NotBlank(message = "Ma OTP khong duoc de trong")
    @Size(min = 6, max = 6, message = "Ma OTP phai co dung 6 chu so")
    private String otpCode;
}
