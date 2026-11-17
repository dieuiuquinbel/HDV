/**
 * File: DieuKhienMonTheThao.java
 * Muc dich: Cung cap API lay danh sach cac mon the thao (Sports) va danh muc loai hinh san (Court Types).
 * Chuc nang: Tra ve danh sach 6 mon chinh (Badminton, Football, Pickleball, Tennis, Basketball, Volleyball) phuc vu UI bo loc.
 */
package com.sportbooking.courtservice.dieukhien;

import com.sportbooking.courtservice.dulieu.TraVeLoaiHinhSanCatalog;
import com.sportbooking.courtservice.khodulieu.KhoLoaiHinhSanCatalog;
import com.sportbooking.courtservice.khodulieu.KhoLoaiTheThao;
import com.sportbooking.courtservice.thucthe.LoaiTheThao;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sports")
@RequiredArgsConstructor
public class DieuKhienMonTheThao {

    private final KhoLoaiTheThao khoLoaiTheThao;
    private final KhoLoaiHinhSanCatalog khoLoaiHinhSanCatalog;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> layDanhSachMonTheThao() {
        List<LoaiTheThao> list = khoLoaiTheThao.findAll();
        List<Map<String, Object>> res = list.stream().map(s -> {
            long typeCount = khoLoaiHinhSanCatalog.findBySportTypeId(s.getId()).size();
            return Map.of(
                    "id", (Object) s.getId(),
                    "code", s.getCode(),
                    "name", s.getName(),
                    "courtTypeCount", typeCount
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{sportCode}/court-types")
    public ResponseEntity<List<TraVeLoaiHinhSanCatalog>> layLoaiHinhTheoMon(@PathVariable String sportCode) {
        LoaiTheThao st = khoLoaiTheThao.findByCode(sportCode.trim().toUpperCase()).orElse(null);
        if (st == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(khoLoaiHinhSanCatalog.findBySportTypeId(st.getId()).stream()
                .map(TraVeLoaiHinhSanCatalog::tuThucThe)
                .collect(Collectors.toList()));
    }
}
