/**
 * File: YeuCauTaoSanCon.java
 * Muc dich: DTO tiep nhan yeu cau tao moi mot san con trong cum san.
 * Chuc nang: Validate ten san, loai the thao, loai hinh san catalog, gia gio co ban va thoi luong.
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YeuCauTaoSanCon {
    @NotNull(message = "Loai the thao la bat buoc")
    private Long sportTypeId;

    private Long courtTypeId;

    @NotBlank(message = "Ten san con la bat buoc")
    private String name;

    private Integer capacity = 4;

    @NotNull(message = "Gia co ban la bat buoc")
    @DecimalMin(value = "0.0", inclusive = true, message = "Gia san phai lon hon hoac bang 0")
    private BigDecimal basePrice;

    private Integer slotStepMinutes = 30;
    private Integer minDurationMinutes = 60;
    private Integer maxDurationMinutes = 120;
}
