/**
 * File: MaUuDai.java
 * Muc dich: Thuc the luu tru thong tin ma uu dai, khuyen mai (Voucher).
 * Chuc nang: Chua ma code (vd: CHAOBANMOI, THETHAO50), % giam gia hoac so tien co dinh, giam toi da, ap dung toi thieu.
 */
package com.sportbooking.bookingservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaUuDai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "discount_percent", nullable = false)
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(name = "discount_amount", nullable = false)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "max_discount", nullable = false)
    @Builder.Default
    private BigDecimal maxDiscount = BigDecimal.ZERO;

    @Column(name = "min_order_amount", nullable = false)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.active == null) this.active = true;
        if (this.discountPercent == null) this.discountPercent = 0;
        if (this.discountAmount == null) this.discountAmount = BigDecimal.ZERO;
        if (this.maxDiscount == null) this.maxDiscount = BigDecimal.ZERO;
        if (this.minOrderAmount == null) this.minOrderAmount = BigDecimal.ZERO;
    }
}
