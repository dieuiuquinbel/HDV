/**
 * File: TraVeLoiChuan.java
 * Muc dich: DTO thong nhat cau truc loi cua notification-service.
 * Chuc nang: Dong nhat timestamp, status, code, message, path.
 */
package com.sportbooking.notificationservice.dulieu;

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
