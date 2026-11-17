/**
 * File: TrangThaiThanhToan.java
 * Muc dich: Dinh nghia trang thai cua giao dich thanh toan trong he thong.
 * Chuc nang: PENDING (cho thanh toan), SUCCESS (thanh cong), FAILED (that bai), REJECTED_EXPIRED (bi tu choi vi don dat da het han hoac huy).
 */
package com.sportbooking.paymentservice.thucthe;

public enum TrangThaiThanhToan {
    PENDING,
    SUCCESS,
    FAILED,
    REJECTED_EXPIRED,
    REFUNDED
}
