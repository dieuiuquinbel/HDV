/**
 * File: DoiSoatThanhToan.java
 * Muc dich: Thuc the anh xa bang payment_reconciliations luu cac giao dich can doi soat khi callback bi loi/timeout.
 * Chuc nang: Luu so lan retry, thoi diem retry tiep theo va thong tin loi de admin hoac job doi soat xu ly.
 */
package com.sportbooking.paymentservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "payment_reconciliations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoiSoatThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(nullable = false)
    private String status; // RECONCILIATION_REQUIRED, RESOLVED

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "next_retry_at")
    private Instant nextRetryAt;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
