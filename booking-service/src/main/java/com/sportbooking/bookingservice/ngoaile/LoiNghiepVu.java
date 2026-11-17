/**
 * File: LoiNghiepVu.java
 * Muc dich: Ngoai le runtime quang loi nghiep vu cho booking-service kem status code va error code chuan.
 * Chuc nang: Nem cac loi nhu SLOT_UNAVAILABLE (409), IDEMPOTENCY_KEY_REUSED (409), BOOKING_NOT_CANCELLABLE.
 */
package com.sportbooking.bookingservice.ngoaile;

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
