/**
 * File: LoaiTheThao.java
 * Muc dich: Thuc the anh xa bang sport_types de phan loai mon the thao.
 * Chuc nang: Luu ma the thao (BADMINTON, FOOTBALL, PICKLEBALL, TENNIS...) va ten tieng Viet.
 */
package com.sportbooking.courtservice.thucthe;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sport_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiTheThao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;
}
