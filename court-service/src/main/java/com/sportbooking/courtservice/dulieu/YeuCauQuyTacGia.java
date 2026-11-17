/**
 * File: YeuCauQuyTacGia.java
 * Muc dich: DTO thiet lap quy tac gia (PriceRule) theo khung gio va khoang ngay.
 * Chuc nang: Validate thoi gian bat dau/ket thuc va don gia gio.
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class YeuCauQuyTacGia {
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    @NotNull(message = "Gio bat dau la bat buoc")
    private LocalTime startTime;

    @NotNull(message = "Gio ket thuc la bat buoc")
    private LocalTime endTime;

    @NotNull(message = "Don gia la bat buoc")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal unitPrice;

    private Integer priority = 1;
}
