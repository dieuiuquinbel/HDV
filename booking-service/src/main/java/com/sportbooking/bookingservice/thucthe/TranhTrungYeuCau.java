/**
 * File: TranhTrungYeuCau.java
 * Muc dich: Thuc the anh xa bang booking_idempotency dam bao tinh Idempotent cho API tao booking POST /bookings.
 * Chuc nang: Ngan chan nguoi dung nhan dat san 2 lan hoac retry mang gay tao don trung; luu Idempotency-Key va hash payload.
 */
package com.sportbooking.bookingservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "booking_idempotency")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranhTrungYeuCau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "idempotency_key", nullable = false)
    private String idempotencyKey;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
