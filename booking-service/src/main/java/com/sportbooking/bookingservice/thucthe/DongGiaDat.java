/**
 * File: DongGiaDat.java
 * Muc dich: Thuc the anh xa bang booking_price_lines luu chi tiet gia snapshot bat bien cho tung slot dat.
 * Chuc nang: Luu don gia (unit_price), so luong gio (quantity=1) va thanh tien cho tung khung gio 60 phut.
 */
package com.sportbooking.bookingservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "booking_price_lines", uniqueConstraints = {
        @UniqueConstraint(name = "uk_price_line_slot", columnNames = {"booking_id", "slot_start"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DongGiaDat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "slot_start", nullable = false)
    private LocalTime slotStart;

    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "line_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal lineAmount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";
}
