/**
 * File: ThongBao.java
 * Muc dich: Thuc the anh xa bang notifications luu tru thong bao in-app gui cho nguoi dung.
 * Chuc nang: Luu user_id, tieu de (title), noi dung (message), loai (type) va trang thai da doc (is_read).
 */
package com.sportbooking.notificationservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_id", unique = true)
    private String eventId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false, length = 50)
    private String type; // BOOKING_CREATED, PAYMENT_SUCCESS, PAYMENT_FAILED, BOOKING_CONFIRMED, BOOKING_CANCELLED, REFUND_SUCCESS

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
    }
}
