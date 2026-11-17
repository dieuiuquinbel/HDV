/**
 * File: KhoDongGiaDat.java
 * Muc dich: Giao dien truy xuat co so du lieu cho dong chi tiet gia (BookingPriceLine).
 * Chuc nang: Lay danh sach cac dong gia da chot bat bien cua don dat san.
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.DongGiaDat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoDongGiaDat extends JpaRepository<DongGiaDat, Long> {
    List<DongGiaDat> findByBookingId(Long bookingId);
}
