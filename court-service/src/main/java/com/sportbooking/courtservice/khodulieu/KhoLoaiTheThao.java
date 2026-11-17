/**
 * File: KhoLoaiTheThao.java
 * Muc dich: Giao dien truy xuat co so du lieu cho loai the thao (SportType).
 * Chuc nang: Tim kiem loai the thao theo ma (code vi du: BADMINTON, FOOTBALL...).
 */
package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.LoaiTheThao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoLoaiTheThao extends JpaRepository<LoaiTheThao, Long> {
    Optional<LoaiTheThao> findByCode(String code);
}
