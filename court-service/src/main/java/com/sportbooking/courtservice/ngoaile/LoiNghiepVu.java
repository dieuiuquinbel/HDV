/**
 * File: LoiNghiepVu.java
 * Muc dich: Ngoai le runtime quang loi nghiep vu cho court-service kem status code.
 * Chuc nang: Thong bao loi nhu khong tim thay san, khong co quyen chu san, gio khong hop le.
 */
package com.sportbooking.courtservice.ngoaile;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class LoiNghiepVu extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public LoiNghiepVu(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
