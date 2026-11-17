/**
 * File: LoiNghiepVu.java
 * Muc dich: Ngoai le runtime tuy bien de quang loi nghiep vu kem HTTP status va error code.
 * Chuc nang: Giup controller va service nem loi chuan (vi du: 401 INVALID_CREDENTIALS, 409 EMAIL_ALREADY_EXISTS).
 */
package com.sportbooking.userservice.ngoaile;

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
