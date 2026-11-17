/**
 * File: TraVeLoiChuan.java
 * Muc dich: DTO phan hoi loi chuan hoa thong nhat he thong.
 * Chuc nang: Chuan hoa ma loi, message, HTTP status va timestamp.
 */
package com.sportbooking.courtservice.dulieu;

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
