/**
 * File: KhoKhoaKhungGio.java
 * Muc dich: Giao dien truy xuat co so du lieu cho bang khoa slot (ActiveSlotLock).
 * Chuc nang: Kiem tra slot da bi khoa hay chua, tim khoa theo san va ngay, xoa toan bo khoa cua mot don dat.
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.KhoaKhungGio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface KhoKhoaKhungGio extends JpaRepository<KhoaKhungGio, Long> {
    List<KhoaKhungGio> findByCourtIdAndBookingDate(Long courtId, LocalDate bookingDate);
    boolean existsByCourtIdAndBookingDateAndSlotStart(Long courtId, LocalDate bookingDate, LocalTime slotStart);
    void deleteByBookingId(Long bookingId);
}
