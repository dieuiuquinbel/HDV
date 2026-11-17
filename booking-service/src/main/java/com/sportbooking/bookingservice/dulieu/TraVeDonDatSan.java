/**
 * File: TraVeDonDatSan.java
 * Muc dich: DTO tra ve thong tin chi tiet don dat san cho client.
 * Chuc nang: Bao gom ma don, tong tien snapshot, han thanh toan expiredAt, danh sach cac slot dat va dong gia.
 */
package com.sportbooking.bookingservice.dulieu;

import com.sportbooking.bookingservice.thucthe.DonDatSan;
import com.sportbooking.bookingservice.thucthe.TrangThaiDonDat;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class TraVeDonDatSan {
    private Long id;
    private Long customerId;
    private Long courtId;
    private LocalDate bookingDate;
    private LocalTime startSlot;
    private LocalTime endSlot;
    private BigDecimal totalAmount;
    private String currency;
    private TrangThaiDonDat status;
    private Instant expiredAt;
    private Instant createdAt;
    private String checkinToken;
    private List<KhungGioChiTiet> slots;

    @Data
    @Builder
    public static class KhungGioChiTiet {
        private LocalTime start;
        private LocalTime end;
        private BigDecimal unitPrice;
    }

    public static TraVeDonDatSan tuThucThe(DonDatSan booking, List<KhungGioChiTiet> slots) {
        String token = com.sportbooking.bookingservice.baomat.CheckinSecurityUtil.taoMaCheckin(
                booking.getId(), booking.getCustomerId(), booking.getBookingDate());
        return TraVeDonDatSan.builder()
                .id(booking.getId())
                .customerId(booking.getCustomerId())
                .courtId(booking.getCourtId())
                .bookingDate(booking.getBookingDate())
                .startSlot(booking.getStartSlot())
                .endSlot(booking.getEndSlot())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .status(booking.getStatus())
                .expiredAt(booking.getExpiredAt())
                .createdAt(booking.getCreatedAt())
                .checkinToken(token)
                .slots(slots)
                .build();
    }
}
