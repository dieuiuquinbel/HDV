/**
 * File: KhoDoiSoatThanhToan.java
 * Muc dich: Giao dien truy xuat co so du lieu cho bang doi soat thanh toan (PaymentReconciliation).
 * Chuc nang: Tim theo paymentId va tim cac ban ghi dang cho doi soat can retry.
 */
package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.DoiSoatThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface KhoDoiSoatThanhToan extends JpaRepository<DoiSoatThanhToan, Long> {
    Optional<DoiSoatThanhToan> findByPaymentId(Long paymentId);
    List<DoiSoatThanhToan> findByStatusAndNextRetryAtLessThan(String status, Instant now);
}
