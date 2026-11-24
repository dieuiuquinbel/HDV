package com.sportbooking.paymentservice.dulieu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YeuCauNapTienVi {

    @NotNull(message = "Số tiền nạp không được để trống")
    @DecimalMin(value = "10000", message = "Số tiền nạp tối thiểu là 10.000 VNĐ")
    private BigDecimal amount;

    private String method; // VIETQR, VISA, DEMO
}
