/**
 * File: YeuCauTaoCumSan.java
 * Muc dich: DTO tiep nhan yeu cau tao moi cum san tu chu san (Owner).
 * Chuc nang: Validate ten san, dia chi, quan/huyen va toa do.
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YeuCauTaoCumSan {
    @NotBlank(message = "Ten cum san la bat buoc")
    private String name;

    @NotBlank(message = "Dia chi la bat buoc")
    private String address;

    @NotBlank(message = "Quan/Huyen la bat buoc")
    private String district;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
}
