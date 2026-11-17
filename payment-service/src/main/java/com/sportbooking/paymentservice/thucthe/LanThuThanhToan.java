/**
 * File: LanThuThanhToan.java
 * Muc dich: Thuc the anh xa bang payment_attempts luu nhat ky audit bat bien cho tung lan thu thanh toan.
 * Chuc nang: Luu attempt_no, attempt_reference (UUID), provider_transaction_code, trang thai va raw_callback_summary.
 */
package com.sportbooking.paymentservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "payment_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanThuThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo;

    @Column(name = "attempt_reference", nullable = false, unique = true)
    private String attemptReference;

    @Column(name = "provider_transaction_code")
    private String providerTransactionCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrangThaiThanhToan status;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "raw_callback_summary", columnDefinition = "TEXT")
    private String rawCallbackSummary;

    @PrePersist
    protected void onCreate() {
        if (this.requestedAt == null) {
            this.requestedAt = Instant.now();
        }
    }
}
