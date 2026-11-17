/**
 * File: TraVeLoiChuan.java
 * Muc dich: DTO dinh dang phan hoi loi thong nhat theo chuan du an cho toan bo he thong.
 * Chuc nang: Gom timestamp, HTTP status, ma loi (code), thong bao (message) va duong dan (path).
 */
package com.sportbooking.userservice.dulieu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraVeLoiChuan {
    private Instant timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
}
