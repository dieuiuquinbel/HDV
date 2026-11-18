/**
 * File: TrangThaiDonDat.java
 * Muc dich: Dinh nghia cac trang thai cua don dat san trong he thong.
 * Chuc nang: PENDING_PAYMENT (cho thanh toan 10p), CONFIRMED (da thanh toan), EXPIRED (het han), CANCELLED (da huy), COMPLETED (da ket thuc gio choi).
 */
package com.sportbooking.bookingservice.thucthe;

public enum TrangThaiDonDat {
    PENDING_PAYMENT,
    CONFIRMED,
    CHECKED_IN,
    REFUND_PENDING,
    CANCELLED_REFUNDED,
    EXPIRED,
    CANCELLED,
    COMPLETED
}
