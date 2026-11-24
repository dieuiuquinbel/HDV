/**
 * File: YeuCauDatSan.java
 * Muc dich: DTO tiep nhan yeu cau dat san tu khach hang POST /bookings.
 * Chuc nang: Nhan courtId, ngay dat (bookingDate), gio bat dau (startSlot) va so luong slot lien tiep (slotCount).
 */
package com.sportbooking.bookingservice.dulieu;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class YeuCauDatSan {
    @NotNull(message = "San la bat buoc")
    private Long courtId;

    @NotNull(message = "Ngay dat la bat buoc")
    private LocalDate bookingDate;

    @NotNull(message = "Gio bat dau la bat buoc")
    private LocalTime startSlot;

    @Min(value = 1, message = "Toi thieu 1 slot (60 phut)")
    @Max(value = 12, message = "Toi da 12 slot lien tiep")
    private Integer slotCount;

    @Min(value = 30, message = "Toi thieu 30 phut")
    @Max(value = 720, message = "Toi da 720 phut")
    private Integer durationMinutes;

    private String voucherCode;

    private java.math.BigDecimal addonAmount;

    private String addonSummary;
}
