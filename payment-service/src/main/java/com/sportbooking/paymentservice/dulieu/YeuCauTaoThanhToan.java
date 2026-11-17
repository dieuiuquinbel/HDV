/**
 * File: YeuCauTaoThanhToan.java
 * Muc dich: DTO tiep nhan yeu cau khoi tao giao dich thanh toan POST /payments.
 * Chuc nang: Chi nhan duy nhat bookingId, khong nhan amount tu client de tranh gian lan tien bac.
 */
package com.sportbooking.paymentservice.dulieu;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauTaoThanhToan {
    @NotNull(message = "bookingId la bat buoc")
    private Long bookingId;
}
