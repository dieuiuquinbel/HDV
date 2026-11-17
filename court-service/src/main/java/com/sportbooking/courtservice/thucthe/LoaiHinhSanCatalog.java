/**
 * File: LoaiHinhSanCatalog.java
 * Muc dich: Thuc the anh xa bang court_type_catalog luu danh muc chuan loai hinh san toan he thong.
 * Chuc nang: Chua thong tin mon the thao, cau hinh (don/doi/5 nguoi...), mat san (PVC/co/go...), moi truong va kich thuoc.
 */
package com.sportbooking.courtservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "court_type_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiHinhSanCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sport_type_id", nullable = false)
    private Long sportTypeId;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "config_type", nullable = false, length = 50)
    private String configType;

    @Column(nullable = false, length = 50)
    private String surface;

    @Column(nullable = false, length = 30)
    private String environment;

    @Column(name = "default_capacity", nullable = false)
    @Builder.Default
    private Integer defaultCapacity = 4;

    @Column(length = 50)
    private String dimensions;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
