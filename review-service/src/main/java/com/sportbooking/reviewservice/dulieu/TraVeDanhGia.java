/**
 * File: TraVeDanhGia.java
 * Muc dich: DTO tra ve thong tin chi tiet mot bai danh gia san.
 * Chuc nang: Dong goi id, ten nguoi danh gia, so sao, binh luan va thoi diem tao.
 */
package com.sportbooking.reviewservice.dulieu;

import com.sportbooking.reviewservice.thucthe.DanhGiaSan;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TraVeDanhGia {
    private Long id;
    private Long bookingId;
    private Long courtId;
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private Instant createdAt;

    public static TraVeDanhGia tuThucThe(DanhGiaSan r) {
        return TraVeDanhGia.builder()
                .id(r.getId())
                .bookingId(r.getBookingId())
                .courtId(r.getCourtId())
                .customerId(r.getCustomerId())
                .customerName(r.getCustomerName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
