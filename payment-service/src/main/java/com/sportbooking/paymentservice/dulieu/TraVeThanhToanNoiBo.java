/**
 * File: TraVeThanhToanNoiBo.java
 * Muc dich: DTO phan hoi tu endpoint /internal/v1/bookings/{id}/payable-summary cua Booking Service.
 * Chuc nang: Lay so tien snapshot bat bien, customerId va trang thai hop le de thanh toan.
 */
package com.sportbooking.paymentservice.dulieu;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class TraVeThanhToanNoiBo {
    private Long bookingId;
    private Long customerId;
    private String status;
    private Instant expiredAt;
    private BigDecimal totalAmount;
    private String currency;
}
