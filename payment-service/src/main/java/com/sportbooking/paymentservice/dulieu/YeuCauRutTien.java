package com.sportbooking.paymentservice.dulieu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YeuCauRutTien {

    @NotBlank(message = "Mã ngân hàng không được để trống")
    private String bankCode;

    @NotBlank(message = "Tên ngân hàng không được để trống")
    private String bankName;

    @NotBlank(message = "Số tài khoản nhận tiền không được để trống")
    private String accountNumber;

    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    private String accountName;

    @NotNull(message = "Số tiền rút không được để trống")
    @DecimalMin(value = "2001", message = "Số tiền rút phải lớn hơn 2.000 VNĐ")
    private BigDecimal amount;

    private Boolean confirm;
}
