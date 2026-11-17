/**
 * File: KhoCumSan.java
 * Muc dich: Giao dien truy xuat du lieu cho cum san (Venue).
 * Chuc nang: Tim kiem theo chu san (ownerId), loc theo quan/huyen va trang thai hoat dong (ACTIVE/PENDING...).
 */
package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.CumSan;
import com.sportbooking.courtservice.thucthe.TrangThaiCumSan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface KhoCumSan extends JpaRepository<CumSan, Long> {
    List<CumSan> findByOwnerId(Long ownerId);
    Page<CumSan> findByStatus(TrangThaiCumSan status, Pageable pageable);
    Page<CumSan> findByStatusAndDistrictContainingIgnoreCase(TrangThaiCumSan status, String district, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("""
        SELECT DISTINCT v FROM CumSan v 
        JOIN SanCon c ON c.venueId = v.id 
        LEFT JOIN LoaiHinhSanCatalog cat ON cat.id = c.courtTypeId
        WHERE v.status = :status 
        AND c.status = 'ACTIVE' 
        AND (:sportTypeId IS NULL OR c.sportTypeId = :sportTypeId) 
        AND (:district IS NULL OR LOWER(v.district) LIKE LOWER(CONCAT('%', :district, '%')))
        AND (:configType IS NULL OR LOWER(cat.configType) = LOWER(:configType))
        AND (:surface IS NULL OR LOWER(cat.surface) = LOWER(:surface))
        AND (:priceMin IS NULL OR c.basePrice >= :priceMin)
        AND (:priceMax IS NULL OR c.basePrice <= :priceMax)
    """)
    Page<CumSan> timKiemCumSanDayDu(
            @org.springframework.data.repository.query.Param("status") TrangThaiCumSan status,
            @org.springframework.data.repository.query.Param("sportTypeId") Long sportTypeId,
            @org.springframework.data.repository.query.Param("district") String district,
            @org.springframework.data.repository.query.Param("configType") String configType,
            @org.springframework.data.repository.query.Param("surface") String surface,
            @org.springframework.data.repository.query.Param("priceMin") BigDecimal priceMin,
            @org.springframework.data.repository.query.Param("priceMax") BigDecimal priceMax,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("""
        SELECT DISTINCT v FROM CumSan v 
        JOIN SanCon c ON c.venueId = v.id 
        WHERE v.status = :status 
        AND c.status = 'ACTIVE' 
        AND c.sportTypeId = :sportTypeId 
        AND (:district IS NULL OR LOWER(v.district) LIKE LOWER(CONCAT('%', :district, '%')))
    """)
    Page<CumSan> timKiemTheoSportTypeVaDistrict(
            @org.springframework.data.repository.query.Param("status") TrangThaiCumSan status,
            @org.springframework.data.repository.query.Param("sportTypeId") Long sportTypeId,
            @org.springframework.data.repository.query.Param("district") String district,
            Pageable pageable);
}
