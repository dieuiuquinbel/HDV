/**
 * File: TraVeMaUuDai.java
 * Muc dich: DTO tra ve danh sach ma uu dai khuyen mai cho khach hang.
 * Chuc nang: Tra ve thong tin ma code, mo ta, ty le giam gia %, so tien giam toi da.
 */
package com.sportbooking.bookingservice.dulieu;

import com.sportbooking.bookingservice.thucthe.MaUuDai;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TraVeMaUuDai {
    private Long id;
    private String code;
    private String description;
    private Integer discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;

    public static TraVeMaUuDai tuThucThe(MaUuDai voucher) {
        return TraVeMaUuDai.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountPercent(voucher.getDiscountPercent())
                .discountAmount(voucher.getDiscountAmount())
                .maxDiscount(voucher.getMaxDiscount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .build();
    }
}
