/**
 * File: DanhGiaSan.java
 * Muc dich: Thuc the anh xa bang reviews de luu danh gia va cham diem sao (rating) cua khach hang.
 * Chuc nang: Co UNIQUE(booking_id) dam bao 1 don hoan tat chi duoc danh gia 1 lan; rating tu 1 den 5 sao.
 */
package com.sportbooking.reviewservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaSan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "court_id", nullable = false)
    private Long courtId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(nullable = false)
    private Integer rating; // 1 -> 5 sao

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PUBLISHED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = "PUBLISHED";
        }
    }
}
