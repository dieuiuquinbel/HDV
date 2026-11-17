/**
 * File: KhoHoanTien.java
 * Muc dich: Repository truy van va luu tru du lieu hoan tien vao database.
 * Chuc nang: Kiem tra hoan tien theo bookingId hoac paymentId.
 */
package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.HoanTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoHoanTien extends JpaRepository<HoanTien, Long> {
    Optional<HoanTien> findByBookingId(Long bookingId);
}
