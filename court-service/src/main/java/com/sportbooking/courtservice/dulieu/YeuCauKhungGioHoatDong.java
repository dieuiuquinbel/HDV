/**
 * File: YeuCauKhungGioHoatDong.java
 * Muc dich: DTO tiep nhan danh sach gio mo/dong cua cua san theo thu trong tuan.
 * Chuc nang: Validate dayOfWeek (1-7), openTime va closeTime (dung gio dau gio).
 */
package com.sportbooking.courtservice.dulieu;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class YeuCauKhungGioHoatDong {
    @NotNull(message = "Thu trong tuan la bat buoc")
    @Min(1)
    @Max(7)
    private Integer dayOfWeek; // 1: Sunday, 2: Monday, ..., 7: Saturday

    @NotNull(message = "Gio mo cua la bat buoc")
    private LocalTime openTime;

    @NotNull(message = "Gio dong cua la bat buoc")
    private LocalTime closeTime;
}
