/**
 * File: TraVeKhungGioTrong.java
 * Muc dich: DTO tra ve danh sach cac khung gio 60 phut trong ngay va trang thai kha dung (available/locked).
 * Chuc nang: Giup frontend hien thi lich san truc quan cho khach chon slot.
 */
package com.sportbooking.bookingservice.dulieu;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
public class TraVeKhungGioTrong {
    private LocalTime slotStart;
    private LocalTime slotEnd;
    private BigDecimal price;
    private boolean available;
    private String reason; // AVAILABLE, LOCKED, PAST, CLOSED
}
