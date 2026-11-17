/**
 * File: MaOtp.java
 * Muc dich: Thuc the luu tru ma xac thuc OTP tu dong cho tai khoan nguoi dung.
 * Chuc nang: Luu email, ma 6 chu so (otp_code), thoi gian het han (expires_at) va trang thai da xac minh (verified).
 */
package com.sportbooking.userservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "otps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.verified == null) {
            this.verified = false;
        }
    }
}
