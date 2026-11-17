/**
 * File: TraVeThanhToanNoiBo.java
 * Muc dich: DTO hop dong noi bo tra ve thong tin don dat cho Payment Service goi sang.
 * Chuc nang: Cung cap so tien totalAmount bat bien, trang thai don dat va han expiredAt de Payment kiem tra.
 */
package com.sportbooking.bookingservice.dulieu;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TraVeThanhToanNoiBo {
    private Long bookingId;
    private Long customerId;
    private Long courtId;
    private String status;
    private Instant expiredAt;
    private BigDecimal totalAmount;
    private String currency;
}
