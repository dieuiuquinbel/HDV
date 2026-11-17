/**
 * File: HoanTien.java
 * Muc dich: Thuc the luu thong tin hoan tien (Refund) cho don dat da thanh toan khi huy dung quy dinh.
 * Chuc nang: Luu payment_id, booking_id, so tien hoan, ly do hoan va thoi diem tao.
 */
package com.sportbooking.paymentservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoanTien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    @Column(length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.currency == null) this.currency = "VND";
    }
}
