/**
 * File: TraVeCauHinhDatSan.java
 * Muc dich: DTO hop dong noi bo giua Court Service va Booking Service.
 * Chuc nang: Cung cap day du trang thai san, trang thai cum san, gio mo/dong cua va cac quy tac gia ap dung theo ngay.
 */
package com.sportbooking.courtservice.dulieu;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class TraVeCauHinhDatSan {
    private Long courtId;
    private String courtName;
    private String courtStatus;
    private Long venueId;
    private String venueName;
    private Long ownerId;
    private String venueStatus;
    private BigDecimal basePrice;
    private String currency;
    private Integer slotStepMinutes;
    private Integer minDurationMinutes;
    private Integer maxDurationMinutes;
    private LocalTime openTime;
    private LocalTime closeTime;
    private List<QuyTacGiaDonGian> priceRules;

    @Data
    @Builder
    public static class QuyTacGiaDonGian {
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal unitPrice;
        private Integer priority;
    }
}
