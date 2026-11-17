/**
 * File: KhoTranhTrungYeuCau.java
 * Muc dich: Giao dien truy xuat co so du lieu cho bang chong duplicate request (BookingIdempotency).
 * Chuc nang: Tim kiem ban ghi theo customerId va idempotencyKey de tra lai don dat cu neu request bi lap lai.
 */
package com.sportbooking.bookingservice.khodulieu;

import com.sportbooking.bookingservice.thucthe.TranhTrungYeuCau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoTranhTrungYeuCau extends JpaRepository<TranhTrungYeuCau, Long> {
    Optional<TranhTrungYeuCau> findByCustomerIdAndIdempotencyKey(Long customerId, String idempotencyKey);
}
