/**
 * File: KhoDonDatSan.java
 * Muc dich: Giao dien truy xuat co so du lieu cho don dat san (Booking).
 * Chuc nang: Tim theo khach hang, tim theo court va ngay, tim theo trang thai, lay thong ke so luong booking.
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.DonDatSan;
import com.sportbooking.bookingservice.thucthe.TrangThaiDonDat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface KhoDonDatSan extends JpaRepository<DonDatSan, Long> {
    Page<DonDatSan> findByCustomerId(Long customerId, Pageable pageable);
    List<DonDatSan> findByBookingDate(LocalDate bookingDate);
    List<DonDatSan> findByBookingDateGreaterThanEqualOrderByBookingDateAscStartSlotAsc(LocalDate bookingDate);
    List<DonDatSan> findByStatusAndExpiredAtLessThan(TrangThaiDonDat status, Instant now);
    List<DonDatSan> findByStatusAndBookingDateLessThanEqual(TrangThaiDonDat status, LocalDate date);

    @Query("SELECT b.status, COUNT(b) FROM DonDatSan b WHERE b.bookingDate BETWEEN :from AND :to GROUP BY b.status")
    List<Object[]> thongKeTheoTrangThai(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
