/**
 * File: TraVeCauHinhSanNoiBo.java
 * Muc dich: DTO phan hoi lay tu endpoint /internal/v1/courts/{id}/booking-configuration cua Court Service.
 * Chuc nang: Chuyen doi cau truc JSON cau hinh san con, gio mo/dong va quy tac gia vao booking-service.
 */
package com.sportbooking.bookingservice.dulieu;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
public class TraVeCauHinhSanNoiBo {
    private Long courtId;
    private String courtName;
    private String courtStatus;
    private Long venueId;
    private Long ownerId;
    private String venueStatus;
    private BigDecimal basePrice;
    private String currency;
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer slotStepMinutes;
    private Integer minDurationMinutes;
    private Integer maxDurationMinutes;
    private List<QuyTacGiaDonGian> priceRules;

    @Data
    public static class QuyTacGiaDonGian {
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal unitPrice;
        private Integer priority;
    }
}
