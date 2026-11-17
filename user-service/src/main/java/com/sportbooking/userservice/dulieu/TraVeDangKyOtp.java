/**
 * File: TraVeDangKyOtp.java
 * Muc dich: DTO phan hoi sau khi nguoi dung dang ky tai khoan thanh cong.
 * Chuc nang: Tra ve thong tin nguoi dung cung ma OTP tu dong de xac minh tai khoan.
 */
package com.sportbooking.userservice.dulieu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraVeDangKyOtp {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private String otpCode;
    private String message;
}
