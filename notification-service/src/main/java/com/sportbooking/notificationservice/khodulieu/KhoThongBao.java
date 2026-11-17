/**
 * File: KhoThongBao.java
 * Muc dich: Giao dien truy xuat co so du lieu cho thuc the ThongBao (Spring Data JPA).
 * Chuc nang: Lay danh sach thong bao cua user sap xep theo thoi gian moi nhat, dem so thong bao chua doc.
 */
package com.sportbooking.notificationservice.khodulieu;

import com.sportbooking.notificationservice.thucthe.ThongBao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhoThongBao extends JpaRepository<ThongBao, Long> {
    Page<ThongBao> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndIsReadFalse(Long userId);
    boolean existsByEventId(String eventId);
}
