package com.sportbooking.paymentservice.khodulieu;

import com.sportbooking.paymentservice.thucthe.GiaoDichVi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoGiaoDichVi extends JpaRepository<GiaoDichVi, Long> {

    List<GiaoDichVi> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
