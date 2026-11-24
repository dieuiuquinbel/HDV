package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.GiaoDichVi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoGiaoDichVi extends JpaRepository<GiaoDichVi, Long> {

    Page<GiaoDichVi> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<GiaoDichVi> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
