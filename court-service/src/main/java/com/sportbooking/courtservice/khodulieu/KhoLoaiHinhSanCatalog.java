package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.LoaiHinhSanCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhoLoaiHinhSanCatalog extends JpaRepository<LoaiHinhSanCatalog, Long> {
    List<LoaiHinhSanCatalog> findBySportTypeId(Long sportTypeId);
    Optional<LoaiHinhSanCatalog> findByCode(String code);
}
