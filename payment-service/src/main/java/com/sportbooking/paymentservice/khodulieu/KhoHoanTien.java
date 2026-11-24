/**
 * File: KhoHoanTien.java
 * Muc dich: Repository truy van va luu tru du lieu hoan tien vao database.
 * Chuc nang: Kiem tra hoan tien theo bookingId hoac paymentId.
 */
package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.HoanTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface KhoHoanTien extends JpaRepository<HoanTien, Long> {
    Optional<HoanTien> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(SUM(h.amount), 0) FROM HoanTien h WHERE h.createdAt BETWEEN :from AND :to")
    BigDecimal tinhTongTienHoanThucTe(@Param("from") Instant from, @Param("to") Instant to);
}
