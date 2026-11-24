package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.ThongTinVi;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface KhoThongTinVi extends JpaRepository<ThongTinVi, Long> {

    Optional<ThongTinVi> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM ThongTinVi w WHERE w.userId = :userId")
    Optional<ThongTinVi> findByUserIdWithLock(@Param("userId") Long userId);

    @Modifying
    @Query(value = "INSERT IGNORE INTO wallets (user_id, balance, status) VALUES (:userId, :balance, 'ACTIVE')", nativeQuery = true)
    int insertIgnoreWallet(@Param("userId") Long userId, @Param("balance") BigDecimal balance);
}
