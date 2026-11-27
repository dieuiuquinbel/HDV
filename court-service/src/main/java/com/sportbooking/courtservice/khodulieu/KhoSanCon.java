/**
 * File: KhoSanCon.java
 * Muc dich: Giao dien truy xuat du lieu cho tung san con (Court).
 * Chuc nang: Lay danh sach san theo cum san (venueId), kiem tra trung ten san va loc theo loai the thao.
 */
package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.SanCon;
import com.sportbooking.courtservice.thucthe.TrangThaiSanCon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhoSanCon extends JpaRepository<SanCon, Long> {
    List<SanCon> findByVenueId(Long venueId);
    List<SanCon> findByVenueIdAndStatus(Long venueId, TrangThaiSanCon status);
    boolean existsByVenueIdAndName(Long venueId, String name);
    Optional<SanCon> findByVenueIdAndName(Long venueId, String name);
    Optional<SanCon> findFirstByCourtCode(String courtCode);
}
