/**
 * File: QuyTacGia.java
 * Muc dich: Thuc the anh xa bang price_rules de ghi de gia co ban theo khung gio va khoang ngay.
 * Chuc nang: Luu court_id, ngay bat dau/ket thuc, gio bat dau/ket thuc, don gia gio, do uu tien (priority).
 */
package com.sportbooking.courtservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "price_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuyTacGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "court_id", nullable = false)
    private Long courtId;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 1;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
