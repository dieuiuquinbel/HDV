/**
 * File: YeuCauXacNhanThanhToan.java
 * Muc dich: DTO tiep nhan yeu cau callback tu Payment Service sau khi thanh toan thanh cong.
 * Chuc nang: Nhan paymentId, attemptReference va paidAt de chuyen don dat tu PENDING_PAYMENT sang CONFIRMED mot cach Idempotent.
 */
package com.sportbooking.bookingservice.dulieu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class YeuCauXacNhanThanhToan {
    @NotNull(message = "paymentId la bat buoc")
    private Long paymentId;

    @NotBlank(message = "attemptReference la bat buoc")
    private String attemptReference;

    @NotNull(message = "paidAt la bat buoc")
    private Instant paidAt;
}
