/**
 * File: YeuCauCapNhatCumSan.java
 * Muc dich: DTO cap nhat thong tin cum san tu chu san (Owner).
 * Chuc nang: Cho phep sua ten, dia chi, quan/huyen, toa do va mo ta.
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YeuCauCapNhatCumSan {
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
