/**
 * File: KhoMaUuDai.java
 * Muc dich: Repository truy van danh sach ma uu dai khuyen mai tu database.
 * Chuc nang: Tim theo ma code con hieu luc hoac lay tat ca voucher dang kich hoat.
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.MaUuDai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhoMaUuDai extends JpaRepository<MaUuDai, Long> {
    Optional<MaUuDai> findByCodeIgnoreCaseAndActiveTrue(String code);
    List<MaUuDai> findAllByActiveTrue();
}
