/**
 * File: SanCon.java
 * Muc dich: Thuc the anh xa bang courts dai dien cho tung san con cu the khach thue.
 * Chuc nang: Luu id cum san, id loai the thao, ten san (San 1, San 2...), suc chua, gia goc va trang thai.
 */
package com.sportbooking.courtservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "courts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanCon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "sport_type_id", nullable = false)
    private Long sportTypeId;

    @Column(name = "court_type_id", nullable = false)
    private Long courtTypeId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 4;

    @Column(name = "base_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal basePrice;

    @Column(name = "slot_step_minutes", nullable = false)
    @Builder.Default
    private Integer slotStepMinutes = 30;

    @Column(name = "min_duration_minutes", nullable = false)
    @Builder.Default
    private Integer minDurationMinutes = 60;

    @Column(name = "max_duration_minutes", nullable = false)
    @Builder.Default
    private Integer maxDurationMinutes = 720;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrangThaiSanCon status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = TrangThaiSanCon.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
