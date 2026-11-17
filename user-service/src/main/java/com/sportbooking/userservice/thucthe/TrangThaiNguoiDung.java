/**
 * File: TrangThaiNguoiDung.java
 * Muc dich: Dinh nghia trang thai hoat dong cua tai khoan nguoi dung.
 * Chuc nang: Gom ACTIVE (dang hoat dong) va LOCKED (tai khoan bi khoa boi Admin).
 */
package com.sportbooking.userservice.thucthe;

public enum TrangThaiNguoiDung {
    PENDING_VERIFICATION,
    ACTIVE,
    LOCKED
}
