/**
 * File: KhoDanhGiaSan.java
 * Muc dich: Giao dien truy xuat co so du lieu cho thuc the DanhGiaSan (Spring Data JPA).
 * Chuc nang: Lay danh sach review theo court_id, tinh diem trung binh (averageRating) va tong so luot danh gia.
 */
package com.sportbooking.reviewservice.khodulieu;

import com.sportbooking.reviewservice.thucthe.DanhGiaSan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoDanhGiaSan extends JpaRepository<DanhGiaSan, Long> {
    Optional<DanhGiaSan> findByBookingId(Long bookingId);
    Page<DanhGiaSan> findByCourtIdAndStatusOrderByCreatedAtDesc(Long courtId, String status, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM DanhGiaSan r WHERE r.courtId = :courtId AND r.status = 'PUBLISHED'")
    Double tinhDiemTrungBinh(@Param("courtId") Long courtId);

    long countByCourtIdAndStatus(Long courtId, String status);
}
