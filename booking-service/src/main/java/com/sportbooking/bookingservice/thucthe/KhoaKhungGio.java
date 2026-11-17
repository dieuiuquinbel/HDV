/**
 * File: KhoaKhungGio.java
 * Muc dich: Thuc the anh xa bang active_slot_locks voi UNIQUE(court_id, booking_date, slot_start) de chong dat trung.
 * Chuc nang: Chi giu cac slot dang o trang thai PENDING_PAYMENT hoac CONFIRMED; bi xoa ngay khi CANCELLED/EXPIRED/COMPLETED.
 */
package com.sportbooking.bookingservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "active_slot_locks", uniqueConstraints = {
        @UniqueConstraint(name = "uk_active_slot_lock", columnNames = {"court_id", "booking_date", "slot_start"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhoaKhungGio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "court_id", nullable = false)
    private Long courtId;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "slot_start", nullable = false)
    private LocalTime slotStart;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
