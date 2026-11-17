/**
 * File: KhoQuyTacGia.java
 * Muc dich: Giao dien truy xuat co so du lieu cho bang quy tac gia (PriceRule).
 * Chuc nang: Lay danh sach gia dac biet theo san va theo trang thai ACTIVE.
 */
package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.QuyTacGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoQuyTacGia extends JpaRepository<QuyTacGia, Long> {
    List<QuyTacGia> findByCourtIdAndStatusOrderByPriorityDesc(Long courtId, String status);
    List<QuyTacGia> findByCourtId(Long courtId);
    void deleteByCourtId(Long courtId);
}
