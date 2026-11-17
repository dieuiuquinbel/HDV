/**
 * File: TraVeSanCon.java
 * Muc dich: DTO tra ve thong tin cua tung san con cu the.
 * Chuc nang: Kem thong tin danh muc (loai san, mat san, cau hinh), thoi luong (30/60/120p), gia va trang thai.
 */
package com.sportbooking.courtservice.dulieu;

import com.sportbooking.courtservice.thucthe.LoaiHinhSanCatalog;
import com.sportbooking.courtservice.thucthe.SanCon;
import com.sportbooking.courtservice.thucthe.TrangThaiSanCon;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TraVeSanCon {
    private Long id;
    private Long venueId;
    private Long sportTypeId;
    private String sportTypeName;
    private Long courtTypeId;
    private String courtTypeName;
    private String configType;
    private String surface;
    private String environment;
    private String dimensions;
    private String name;
    private Integer capacity;
    private BigDecimal basePrice;
    private Integer slotStepMinutes;
    private Integer minDurationMinutes;
    private Integer maxDurationMinutes;
    private String currency;
    private TrangThaiSanCon status;
    private Instant createdAt;

    public static TraVeSanCon tuThucThe(SanCon court, String sportTypeName) {
        return tuThucThe(court, sportTypeName, null);
    }

    public static TraVeSanCon tuThucThe(SanCon court, String sportTypeName, LoaiHinhSanCatalog catalog) {
        return TraVeSanCon.builder()
                .id(court.getId())
                .venueId(court.getVenueId())
                .sportTypeId(court.getSportTypeId())
                .sportTypeName(sportTypeName)
                .courtTypeId(court.getCourtTypeId())
                .courtTypeName(catalog != null ? catalog.getName() : null)
                .configType(catalog != null ? catalog.getConfigType() : null)
                .surface(catalog != null ? catalog.getSurface() : null)
                .environment(catalog != null ? catalog.getEnvironment() : null)
                .dimensions(catalog != null ? catalog.getDimensions() : null)
                .name(court.getName())
                .capacity(court.getCapacity())
                .basePrice(court.getBasePrice())
                .slotStepMinutes(court.getSlotStepMinutes())
                .minDurationMinutes(court.getMinDurationMinutes())
                .maxDurationMinutes(court.getMaxDurationMinutes())
                .currency(court.getCurrency())
                .status(court.getStatus())
                .createdAt(court.getCreatedAt())
                .build();
    }
}
