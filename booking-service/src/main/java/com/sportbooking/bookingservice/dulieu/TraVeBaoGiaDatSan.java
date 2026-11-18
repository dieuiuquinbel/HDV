package com.sportbooking.bookingservice.dulieu;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class TraVeBaoGiaDatSan {
    private Long courtId;
    private String courtName;
    private Long venueId;
    private String venueName;
    private LocalDate bookingDate;
    private LocalTime startSlot;
    private LocalTime endSlot;
    private Integer durationMinutes;
    private BigDecimal basePrice;
    private BigDecimal totalCourtPrice;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String currency;
    private LocalTime openTime;
    private LocalTime closeTime;
    private List<TraVeDonDatSan.KhungGioChiTiet> slots;
}
