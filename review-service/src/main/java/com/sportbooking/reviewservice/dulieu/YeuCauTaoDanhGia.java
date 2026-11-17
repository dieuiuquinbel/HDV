/**
 * File: YeuCauTaoDanhGia.java
 * Muc dich: DTO tiep nhan yeu cau danh gia san tu khach hang POST /reviews.
 * Chuc nang: Nhan bookingId, courtId, so diem rating (1 den 5) va noi dung comment.
 */
package com.sportbooking.reviewservice.dulieu;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauTaoDanhGia {
    @NotNull(message = "bookingId la bat buoc")
    private Long bookingId;

    @NotNull(message = "courtId la bat buoc")
    private Long courtId;

    @NotNull(message = "Diem danh gia la bat buoc")
    @Min(value = 1, message = "Toi thieu 1 sao")
    @Max(value = 5, message = "Toi da 5 sao")
    private Integer rating;

    private String comment;
}
