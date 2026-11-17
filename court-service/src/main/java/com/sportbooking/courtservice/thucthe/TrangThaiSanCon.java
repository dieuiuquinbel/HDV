/**
 * File: TrangThaiSanCon.java
 * Muc dich: Dinh nghia trang thai hoat dong cua tung san con (Court).
 * Chuc nang: ACTIVE (san mo ban binh thuong), INACTIVE (chu san/admin tam tat), MAINTENANCE (bao tri).
 */
package com.sportbooking.courtservice.thucthe;

public enum TrangThaiSanCon {
    ACTIVE,
    INACTIVE,
    MAINTENANCE,
    HIDDEN // Giu lai cho tuong thich du lieu cu (map giong INACTIVE)
}
