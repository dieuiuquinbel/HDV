/**
 * File: YeuCauCapNhatSanCon.java
 * Muc dich: DTO cap nhat thong tin mot san con (Court).
 * Chuc nang: Cho phep sua ten san, loai hinh catalog, suc chua, gia co ban va thoi luong.
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YeuCauCapNhatSanCon {
    private Long courtTypeId;

    @NotBlank(message = "Ten san con la bat buoc")
    private String name;

    private Integer capacity = 4;

    @NotNull(message = "Gia co ban la bat buoc")
    @DecimalMin(value = "0.0", inclusive = true, message = "Gia san phai lon hon hoac bang 0")
    private BigDecimal basePrice;

    private Integer slotStepMinutes;
    private Integer minDurationMinutes;
    private Integer maxDurationMinutes;
}
