/**
 * File: TienIch.java
 * Muc dich: Thuc the anh xa bang amenities luu danh muc tien ich cua cum san.
 * Chuc nang: Den chieu sang, bai do xe, phong thay do, can tin, wifi, cho thue vot/ao.
 */
package com.sportbooking.courtservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "amenities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TienIch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String icon;
}
