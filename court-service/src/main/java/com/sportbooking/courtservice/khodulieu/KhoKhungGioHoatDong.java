/**
 * File: KhoKhungGioHoatDong.java
 * Muc dich: Giao dien truy xuat co so du lieu cho khung gio mo/dong cua cua san (OperatingHour).
 * Chuc nang: Lay danh sach gio theo san (courtId) va tim gio theo thu trong tuan (dayOfWeek).
 */
package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.KhungGioHoatDong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhoKhungGioHoatDong extends JpaRepository<KhungGioHoatDong, Long> {
    List<KhungGioHoatDong> findByCourtId(Long courtId);
    Optional<KhungGioHoatDong> findByCourtIdAndDayOfWeek(Long courtId, Integer dayOfWeek);
    void deleteByCourtId(Long courtId);
}
