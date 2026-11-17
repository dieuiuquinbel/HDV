/**
 * File: KhoNguoiDung.java
 * Muc dich: Giao dien truy xuat co so du lieu cho thuc the NguoiDung (Spring Data JPA).
 * Chuc nang: Cung cap cac ham tim kiem theo email, loc danh sach theo vai tro va trang thai.
 */
package com.sportbooking.userservice.khodulieu;

import com.sportbooking.userservice.thucthe.NguoiDung;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoNguoiDung extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<NguoiDung> findByRole(VaiTro role, Pageable pageable);
    Page<NguoiDung> findByStatus(TrangThaiNguoiDung status, Pageable pageable);
    Page<NguoiDung> findByRoleAndStatus(VaiTro role, TrangThaiNguoiDung status, Pageable pageable);
}
