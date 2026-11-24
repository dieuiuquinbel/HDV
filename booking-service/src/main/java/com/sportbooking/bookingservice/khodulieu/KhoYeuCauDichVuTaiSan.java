/**
 * File: KhoYeuCauDichVuTaiSan.java
 * Muc dich: Repository truy van yeu cau phuc vu tai san theo co so (tram truc) va theo khach hang.
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.YeuCauDichVuTaiSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoYeuCauDichVuTaiSan extends JpaRepository<YeuCauDichVuTaiSan, Long> {
    List<YeuCauDichVuTaiSan> findByVenueIdOrderByCreatedAtDesc(Long venueId);
    List<YeuCauDichVuTaiSan> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<YeuCauDichVuTaiSan> findAllByOrderByCreatedAtDesc();
}
