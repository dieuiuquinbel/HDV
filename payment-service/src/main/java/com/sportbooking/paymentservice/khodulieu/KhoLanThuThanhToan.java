/**
 * File: KhoLanThuThanhToan.java
 * Muc dich: Giao dien truy xuat co so du lieu cho lich su thu thanh toan (PaymentAttempt).
 * Chuc nang: Tim theo attemptReference va lay danh sach tat ca cac lan thu cua paymentId.
 */
package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.LanThuThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoLanThuThanhToan extends JpaRepository<LanThuThanhToan, Long> {
    Optional<LanThuThanhToan> findByAttemptReference(String attemptReference);
}
