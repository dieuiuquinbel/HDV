/**
 * File: KhoGiaoDichThanhToan.java
 * Muc dich: Giao dien truy xuat co so du lieu cho giao dich thanh toan (PaymentTransaction).
 * Chuc nang: Tim theo bookingId, tim theo transactionCode, loc theo trang thai va tinh tong doanh thu.
 */
package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.GiaoDichThanhToan;
import com.sportbooking.paymentservice.thucthe.TrangThaiThanhToan;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface KhoGiaoDichThanhToan extends JpaRepository<GiaoDichThanhToan, Long> {
    Optional<GiaoDichThanhToan> findByBookingId(Long bookingId);
    Optional<GiaoDichThanhToan> findByTransactionCode(String transactionCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM GiaoDichThanhToan p WHERE p.id = :id")
    Optional<GiaoDichThanhToan> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM GiaoDichThanhToan p WHERE p.status = 'SUCCESS' AND p.createdAt BETWEEN :from AND :to")
    BigDecimal tinhTongDoanhThuNet(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM GiaoDichThanhToan p WHERE p.status IN ('SUCCESS', 'REFUNDED') AND p.createdAt BETWEEN :from AND :to")
    BigDecimal tinhTongDoanhThuGross(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM GiaoDichThanhToan p WHERE p.status = 'REFUNDED' AND p.createdAt BETWEEN :from AND :to")
    BigDecimal tinhTongHoanTien(@Param("from") Instant from, @Param("to") Instant to);
}
