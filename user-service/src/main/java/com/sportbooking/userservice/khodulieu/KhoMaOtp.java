/**
 * File: KhoMaOtp.java
 * Muc dich: Interface repository truy van du lieu ma xac thuc OTP tu database.
 * Chuc nang: Tim OTP moi nhat theo email, tim OTP hop le chua het han.
 */
package com.sportbooking.userservice.khodulieu;

import com.sportbooking.userservice.thucthe.MaOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoMaOtp extends JpaRepository<MaOtp, Long> {
    Optional<MaOtp> findTopByEmailOrderByIdDesc(String email);
    Optional<MaOtp> findTopByEmailAndOtpCodeAndVerifiedFalseOrderByIdDesc(String email, String otpCode);

    @Modifying
    @Query("UPDATE MaOtp o SET o.verified = true WHERE o.email = :email AND o.verified = false")
    void invalidateOldOtps(@Param("email") String email);
}
