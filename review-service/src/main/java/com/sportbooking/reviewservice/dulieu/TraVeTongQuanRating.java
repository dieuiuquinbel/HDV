/**
 * File: TraVeTongQuanRating.java
 * Muc dich: DTO tra ve thong tin diem trung binh va tong so luot danh gia cua mot san.
 * Chuc nang: Giup frontend hien thi rating sao tong the cho san con.
 */
package com.sportbooking.reviewservice.dulieu;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TraVeTongQuanRating {
    private Long courtId;
    private Double averageRating;
    private Long totalReviews;
}
