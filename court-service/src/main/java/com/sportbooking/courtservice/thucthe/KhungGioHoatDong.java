/**
 * File: KhungGioHoatDong.java
 * Muc dich: Thuc the anh xa bang operating_hours quy dinh gio mo/dong cua san theo ngay trong tuan.
 * Chuc nang: Luu court_id, thu trong tuan (day_of_week tu 1-7, 1=Chu Nhat / 2=Thu 2...), open_time va close_time.
 */
package com.sportbooking.courtservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "operating_hours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhungGioHoatDong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "court_id", nullable = false)
    private Long courtId;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1: Sunday, 2: Monday, ..., 7: Saturday

    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;
}
