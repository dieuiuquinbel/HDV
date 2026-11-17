/**
 * File: YeuCauDoiTrangThaiSan.java
 * Muc dich: DTO cap nhat trang thai cum san hoac san con.
 * Chuc nang: Nhan chuoi trang thai (ACTIVE, HIDDEN, SUSPENDED) tu request body.
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YeuCauDoiTrangThaiSan {
    @NotBlank(message = "Trang thai khong duoc de trong")
    private String status;
}
