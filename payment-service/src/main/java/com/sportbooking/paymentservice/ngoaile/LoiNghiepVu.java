/**
 * File: LoiNghiepVu.java
 * Muc dich: Ngoai le runtime quang loi nghiep vu cho payment-service kem HTTP status va error code.
 * Chuc nang: Nem cac loi nhu PAYMENT_ALREADY_EXISTS, PAYMENT_NOT_PENDING, PAYMENT_NOT_RETRYABLE.
 */
package com.sportbooking.paymentservice.ngoaile;

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
