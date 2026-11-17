/**
 * File: GiaoDichThanhToan.java
 * Muc dich: Thuc the anh xa bang payment_transactions dai dien cho giao dich thanh toan cua don dat san.
 * Chuc nang: Co UNIQUE(booking_id) dam bao 1 booking chi co 1 payment; so tien duoc snapshot tu Booking Service; ho tro Idempotent.
 */
package com.sportbooking.paymentservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String method = "SIMULATED";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrangThaiThanhToan status;

    @Column(name = "transaction_code", nullable = false, unique = true)
    private String transactionCode;

    @Column(name = "callback_status")
    private String callbackStatus;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 1;

    @Column(name = "current_attempt_reference", nullable = false)
    private String currentAttemptReference;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = TrangThaiThanhToan.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
