package com.sportbooking.paymentservice.dulieu;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauThanhToanVi {

    @NotNull(message = "Mã đơn đặt sân không được để trống")
    private Long bookingId;
}
