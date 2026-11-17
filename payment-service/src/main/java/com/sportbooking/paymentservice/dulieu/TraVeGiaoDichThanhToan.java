/**
 * File: TraVeGiaoDichThanhToan.java
 * Muc dich: DTO tra ve thong tin giao dich thanh toan cho client va admin.
 * Chuc nang: Cung cap ma giao dich, ma don dat, so tien, trang thai, so lan thu va thoi diem tao.
 */
package com.sportbooking.paymentservice.dulieu;

import com.sportbooking.paymentservice.thucthe.GiaoDichThanhToan;
import com.sportbooking.paymentservice.thucthe.TrangThaiThanhToan;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TraVeGiaoDichThanhToan {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String currency;
    private String method;
    private TrangThaiThanhToan status;
    private String transactionCode;
    private Integer attemptCount;
    private String currentAttemptReference;
    private Instant createdAt;

    public static TraVeGiaoDichThanhToan tuThucThe(GiaoDichThanhToan tx) {
        return TraVeGiaoDichThanhToan.builder()
                .id(tx.getId())
                .bookingId(tx.getBookingId())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .method(tx.getMethod())
                .status(tx.getStatus())
                .transactionCode(tx.getTransactionCode())
                .attemptCount(tx.getAttemptCount())
                .currentAttemptReference(tx.getCurrentAttemptReference())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
