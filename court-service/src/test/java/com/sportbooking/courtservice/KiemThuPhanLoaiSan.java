/**
 * File: KiemThuPhanLoaiSan.java
 * Muc dich: Test kiem thu tu dong he thong danh muc loai hinh san 3 cap va bo loc dong trong court-service.
 */
package com.sportbooking.courtservice;

import com.sportbooking.courtservice.dichvu.DichVuCumSan;
import com.sportbooking.courtservice.dichvu.DichVuSanCon;
import com.sportbooking.courtservice.dulieu.TraVeCauHinhDatSan;
import com.sportbooking.courtservice.dulieu.TraVeCumSan;
import com.sportbooking.courtservice.dulieu.TraVeLoaiHinhSanCatalog;
import com.sportbooking.courtservice.khodulieu.KhoLoaiTheThao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class KiemThuPhanLoaiSan {

    @Autowired
    private DichVuCumSan dichVuCumSan;

    @Autowired
    private DichVuSanCon dichVuSanCon;

    @Autowired
    private KhoLoaiTheThao khoLoaiTheThao;

    @Test
    @DisplayName("Kiem tra he thong da ho tro du ca 6 mon the thao")
    void testHoTroDu6MonTheThao() {
        var allSports = khoLoaiTheThao.findAll();
        assertTrue(allSports.size() >= 6, "Phai co it nhat 6 mon the thao");
        assertTrue(allSports.stream().anyMatch(s -> "FOOTBALL".equals(s.getCode())));
        assertTrue(allSports.stream().anyMatch(s -> "BADMINTON".equals(s.getCode())));
        assertTrue(allSports.stream().anyMatch(s -> "PICKLEBALL".equals(s.getCode())));
        assertTrue(allSports.stream().anyMatch(s -> "TENNIS".equals(s.getCode())));
        assertTrue(allSports.stream().anyMatch(s -> "BASKETBALL".equals(s.getCode())));
        assertTrue(allSports.stream().anyMatch(s -> "VOLLEYBALL".equals(s.getCode())));
    }

    @Test
    @DisplayName("Kiem tra danh muc loai hinh san theo mon the thao")
    void testDanhMucLoaiHinhSan() {
        var footballSport = khoLoaiTheThao.findByCode("FOOTBALL").orElseThrow();
        List<TraVeLoaiHinhSanCatalog> catalog = dichVuSanCon.layDanhMucLoaiHinhSan(footballSport.getId());
        assertFalse(catalog.isEmpty());
        assertTrue(catalog.stream().anyMatch(c -> "5_A_SIDE".equals(c.getConfigType())));
        assertTrue(catalog.stream().anyMatch(c -> "ARTIFICIAL_TURF".equals(c.getSurface())));
    }

    @Test
    @DisplayName("Kiem tra bo loc cum san dong theo mon va mat san")
    void testBoLocDongCumSan() {
        Page<TraVeCumSan> res = dichVuCumSan.layDanhSachCumSan(
                "FOOTBALL", null, "5_A_SIDE", "ARTIFICIAL_TURF", null, null, PageRequest.of(0, 10));
        assertNotNull(res);
        assertFalse(res.isEmpty(), "Phai tim thay san bong da 5 nguoi co nhan tao");

        TraVeCumSan venue = res.getContent().get(0);
        assertNotNull(venue.getAmenities(), "Cum san phai tra ve danh sach tien ich");
        assertNotNull(venue.getMinPrice(), "Cum san phai tinh gia khoi diem thap nhat");
    }

    @Test
    @DisplayName("Kiem tra hop dong cau hinh dat san chua cac cot thoi luong 30/60/120p")
    void testCauHinhThoiLuongDatSan() {
        TraVeCauHinhDatSan config = dichVuSanCon.layCauHinhDatSan(1L, LocalDate.now());
        assertNotNull(config);
        assertEquals(30, config.getSlotStepMinutes(), "Slot step phai la 30 phut");
        assertEquals(60, config.getMinDurationMinutes(), "Thoi luong toi thieu phai la 60 phut");
        assertTrue(config.getMaxDurationMinutes() >= 120, "Thoi luong toi da phai >= 120 phut");
    }
}
