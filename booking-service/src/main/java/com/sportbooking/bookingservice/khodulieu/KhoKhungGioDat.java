/**
 * File: KhoKhungGioDat.java
 * Muc dich: Giao dien truy xuat co so du lieu cho cac khung gio dat (BookingSlot).
 * Chuc nang: Lay danh sach cac gio da dat cua mot ma don dat san (bookingId).
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.KhungGioDat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoKhungGioDat extends JpaRepository<KhungGioDat, Long> {
    List<KhungGioDat> findByBookingId(Long bookingId);
}
