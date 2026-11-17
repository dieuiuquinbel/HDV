/**
 * File: KhungGioDat.java
 * Muc dich: Thuc the anh xa bang booking_slots luu cac slot 60 phut lien tiep cua mot don dat.
 * Chuc nang: Luu booking_id, gio bat dau (slot_start) va gio ket thuc (slot_end = slot_start + 60 phut).
 */
package com.sportbooking.bookingservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "booking_slots", uniqueConstraints = {
        @UniqueConstraint(name = "uk_booking_slot_start", columnNames = {"booking_id", "slot_start"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhungGioDat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "slot_start", nullable = false)
    private LocalTime slotStart;

    @Column(name = "slot_end", nullable = false)
    private LocalTime slotEnd;
}
