/**
 * File: KhoiTaoDuLieuSanMau.java
 * Muc dich: Nap du lieu chuan cho he thong the thao ESportKing tai Ha Noi.
 * Chuc nang: Tao 6 loai the thao, 3 co so ESportKing tai Cau Giay, Dong Da, Long Bien voi toa do GPS thuc te, day du san con va tien ich.
 */
package com.sportbooking.courtservice.cauhinh;

import com.sportbooking.courtservice.khodulieu.*;
import com.sportbooking.courtservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class KhoiTaoDuLieuSanMau implements CommandLineRunner {

    private final KhoLoaiTheThao khoLoaiTheThao;
    private final KhoLoaiHinhSanCatalog khoLoaiHinhSanCatalog;
    private final KhoCumSan khoCumSan;
    private final KhoSanCon khoSanCon;
    private final KhoKhungGioHoatDong khoKhungGioHoatDong;
    private final KhoQuyTacGia khoQuyTacGia;
    private final KhoTienIch khoTienIch;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        khoiTaoLoaiTheThao();
        khoiTao3CoSoESportKingHaNoi();
    }

    private void khoiTaoLoaiTheThao() {
        if (khoLoaiTheThao.count() == 0) {
            log.info("Khoi tao 6 bo mon the thao he thong ESportKing...");
            LoaiTheThao badminton = LoaiTheThao.builder().code("BADMINTON").name("Cầu Lông").build();
            LoaiTheThao football = LoaiTheThao.builder().code("FOOTBALL").name("Bóng Đá").build();
            LoaiTheThao pickleball = LoaiTheThao.builder().code("PICKLEBALL").name("Pickleball").build();
            LoaiTheThao tennis = LoaiTheThao.builder().code("TENNIS").name("Tennis").build();
            LoaiTheThao basketball = LoaiTheThao.builder().code("BASKETBALL").name("Bóng Rổ").build();
            LoaiTheThao volleyball = LoaiTheThao.builder().code("VOLLEYBALL").name("Bóng Chuyền").build();
            khoLoaiTheThao.saveAll(List.of(badminton, football, pickleball, tennis, basketball, volleyball));
        }
    }

    private void khoiTao3CoSoESportKingHaNoi() {
        boolean daDayDuSan = khoCumSan.count() >= 3 && khoSanCon.count() >= 25;

        if (!daDayDuSan) {
            log.info("Don dep du lieu cu va khoi tao he thong san phong phu cho 3 Co So ESportKing Ha Noi...");

            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
                jdbcTemplate.execute("TRUNCATE TABLE venue_amenities");
                jdbcTemplate.execute("TRUNCATE TABLE price_rules");
                jdbcTemplate.execute("TRUNCATE TABLE operating_hours");
                jdbcTemplate.execute("TRUNCATE TABLE courts");
                jdbcTemplate.execute("TRUNCATE TABLE venues");
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            } catch (Exception e) {
                log.warn("Loi khi truncate bang: {}", e.getMessage());
            }

            LoaiTheThao badminton = khoLoaiTheThao.findByCode("BADMINTON").orElse(null);
            LoaiTheThao football = khoLoaiTheThao.findByCode("FOOTBALL").orElse(null);
            LoaiTheThao pickleball = khoLoaiTheThao.findByCode("PICKLEBALL").orElse(null);
            LoaiTheThao tennis = khoLoaiTheThao.findByCode("TENNIS").orElse(null);
            LoaiTheThao basketball = khoLoaiTheThao.findByCode("BASKETBALL").orElse(null);

            // Co So 1: Cau Giay (OwnerId 1)
            CumSan cs1 = CumSan.builder()
                    .ownerId(1L)
                    .name("Trung Tâm Thể Thao ESportKing - Cơ Sở 1 (Cầu Giấy)")
                    .address("Số 18 Phố Duy Tân, Phường Dịch Vọng Hậu")
                    .district("Quận Cầu Giấy")
                    .latitude(new BigDecimal("21.031300"))
                    .longitude(new BigDecimal("105.783500"))
                    .description("Tổ hợp thể thao phức hợp đạt chuẩn thi đấu quốc gia tại Cầu Giấy. Sân cầu lông thảm PVC BWF, bóng đá cỏ nhân tạo FIFA, cụm tennis Decoturf và sân pickleball hiện đại.")
                    .status(TrangThaiCumSan.ACTIVE)
                    .build();
            cs1 = khoCumSan.save(cs1);

            // Co So 2: Dong Da
            CumSan cs2 = CumSan.builder()
                    .ownerId(1L)
                    .name("Trung Tâm Thể Thao ESportKing - Cơ Sở 2 (Đống Đa)")
                    .address("Số 102 Phố Trường Chinh, Phường Phương Mai")
                    .district("Quận Đống Đa")
                    .latitude(new BigDecimal("21.002800"))
                    .longitude(new BigDecimal("105.839200"))
                    .description("Cụm thể thao cao cấp trung tâm Đống Đa. Sân cầu lông sàn gỗ tự nhiên, cụm tennis Decoturf có dịch vụ nhặt bóng, pickleball máy lạnh và sân bóng rổ FIBA trong nhà.")
                    .status(TrangThaiCumSan.ACTIVE)
                    .build();
            cs2 = khoCumSan.save(cs2);

            // Co So 3: Long Bien
            CumSan cs3 = CumSan.builder()
                    .ownerId(1L)
                    .name("Trung Tâm Thể Thao ESportKing - Cơ Sở 3 (Long Biên)")
                    .address("Số 27 Đường Cổ Linh, Phường Long Biên")
                    .district("Quận Long Biên")
                    .latitude(new BigDecimal("21.034500"))
                    .longitude(new BigDecimal("105.892300"))
                    .description("Tổ hợp thể thao sinh thái rộng rãi tại Long Biên. Sân bóng đá 7 người cỏ FIFA Pro, sân pickleball có mái che chống mưa nắng, cụm sân tennis đèn pha cao áp và bóng rổ.")
                    .status(TrangThaiCumSan.ACTIVE)
                    .build();
            cs3 = khoCumSan.save(cs3);

            // 1. Tao san con cho Co So 1 (Cau Giay) - 11 san da dang
            if (badminton != null) {
                taoSanConMau(cs1.getId(), badminton.getId(), "BADMINTON_PVC", "Sân Cầu Lông A1 (Thảm PVC Thi Đấu)", 4, new BigDecimal("100000.00"));
                taoSanConMau(cs1.getId(), badminton.getId(), "BADMINTON_PVC", "Sân Cầu Lông A2 (Thảm PVC Cao Cấp)", 4, new BigDecimal("100000.00"));
                taoSanConMau(cs1.getId(), badminton.getId(), "BADMINTON_WOOD", "Sân Cầu Lông A3 (Sàn Gỗ Tự Nhiên)", 4, new BigDecimal("110000.00"));
            }
            if (football != null) {
                taoSanConMau(cs1.getId(), football.getId(), "FOOTBALL_5_TURF", "Sân Bóng Đá Mini B1 (Sân 5 Cỏ FIFA)", 10, new BigDecimal("250000.00"));
                taoSanConMau(cs1.getId(), football.getId(), "FOOTBALL_5_TURF", "Sân Bóng Đá Mini B2 (Sân 5 Cỏ FIFA)", 10, new BigDecimal("250000.00"));
                taoSanConMau(cs1.getId(), football.getId(), "FOOTBALL_FUTSAL", "Sân Futsal Trong Nhà B3 (Sàn Gỗ)", 10, new BigDecimal("280000.00"));
            }
            if (pickleball != null) {
                taoSanConMau(cs1.getId(), pickleball.getId(), "PICKLEBALL_ACRYLIC_OUTDOOR", "Sân Pickleball C1 (Tiêu Chuẩn Acrylic)", 4, new BigDecimal("120000.00"));
                taoSanConMau(cs1.getId(), pickleball.getId(), "PICKLEBALL_INDOOR", "Sân Pickleball C2 (Có Mái Che Hiện Đại)", 4, new BigDecimal("140000.00"));
            }
            if (tennis != null) {
                taoSanConMau(cs1.getId(), tennis.getId(), "TENNIS_HARD_COURT", "Sân Tennis D1 (Decoturf Trung Tâm)", 4, new BigDecimal("190000.00"));
                taoSanConMau(cs1.getId(), tennis.getId(), "TENNIS_HARD_COURT", "Sân Tennis D2 (Decoturf Đèn LED Đêm)", 4, new BigDecimal("210000.00"));
            }
            if (basketball != null) {
                taoSanConMau(cs1.getId(), basketball.getId(), "BASKETBALL_5X5_WOOD", "Sân Bóng Rổ E1 (Sàn Gỗ FIBA Trong Nhà)", 10, new BigDecimal("300000.00"));
            }

            // 2. Tao san con cho Co So 2 (Dong Da) - 11 san da dang
            if (badminton != null) {
                taoSanConMau(cs2.getId(), badminton.getId(), "BADMINTON_WOOD", "Sân Cầu Lông A1 (Sàn Gỗ Tự Nhiên)", 4, new BigDecimal("110000.00"));
                taoSanConMau(cs2.getId(), badminton.getId(), "BADMINTON_WOOD", "Sân Cầu Lông A2 (Sàn Gỗ Tự Nhiên)", 4, new BigDecimal("110000.00"));
                taoSanConMau(cs2.getId(), badminton.getId(), "BADMINTON_PVC", "Sân Cầu Lông A3 (Thảm PVC Đạt Chuẩn)", 4, new BigDecimal("105000.00"));
            }
            if (tennis != null) {
                taoSanConMau(cs2.getId(), tennis.getId(), "TENNIS_HARD_COURT", "Sân Tennis D1 (Decoturf Chuyên Nghiệp)", 4, new BigDecimal("180000.00"));
                taoSanConMau(cs2.getId(), tennis.getId(), "TENNIS_HARD_COURT", "Sân Tennis D2 (Decoturf Có Nhặt Bóng)", 4, new BigDecimal("200000.00"));
                taoSanConMau(cs2.getId(), tennis.getId(), "TENNIS_CLAY", "Sân Tennis D3 (Sân Đất Nện Đẳng Cấp)", 4, new BigDecimal("230000.00"));
            }
            if (pickleball != null) {
                taoSanConMau(cs2.getId(), pickleball.getId(), "PICKLEBALL_ACRYLIC_OUTDOOR", "Sân Pickleball C1 (Acrylic Thi Đấu)", 4, new BigDecimal("130000.00"));
                taoSanConMau(cs2.getId(), pickleball.getId(), "PICKLEBALL_INDOOR", "Sân Pickleball C2 (Trong Nhà Máy Lạnh)", 4, new BigDecimal("150000.00"));
            }
            if (football != null) {
                taoSanConMau(cs2.getId(), football.getId(), "FOOTBALL_5_TURF", "Sân Bóng Đá Mini B1 (Sân 5 Cỏ Nhân Tạo)", 10, new BigDecimal("260000.00"));
            }
            if (basketball != null) {
                taoSanConMau(cs2.getId(), basketball.getId(), "BASKETBALL_5X5_WOOD", "Sân Bóng Rổ E1 (Toàn Sân 5x5 Sàn Gỗ)", 10, new BigDecimal("320000.00"));
                taoSanConMau(cs2.getId(), basketball.getId(), "BASKETBALL_3X3", "Sân Bóng Rổ E2 (Nửa Sân 3x3 Ngoài Trời)", 6, new BigDecimal("160000.00"));
            }

            // 3. Tao san con cho Co So 3 (Long Bien) - 11 san da dang
            if (football != null) {
                taoSanConMau(cs3.getId(), football.getId(), "FOOTBALL_7_TURF", "Sân Bóng Đá B1 (Sân 7 Cỏ FIFA Pro)", 14, new BigDecimal("380000.00"));
                taoSanConMau(cs3.getId(), football.getId(), "FOOTBALL_7_TURF", "Sân Bóng Đá B2 (Sân 7 Cỏ FIFA Pro)", 14, new BigDecimal("380000.00"));
                taoSanConMau(cs3.getId(), football.getId(), "FOOTBALL_11_GRASS", "Sân Bóng Đá B3 (Sân 11 Cỏ Tự Nhiên)", 22, new BigDecimal("650000.00"));
                taoSanConMau(cs3.getId(), football.getId(), "FOOTBALL_5_TURF", "Sân Bóng Đá Mini B4 (Sân 5 Cỏ Nhân Tạo)", 10, new BigDecimal("240000.00"));
            }
            if (pickleball != null) {
                taoSanConMau(cs3.getId(), pickleball.getId(), "PICKLEBALL_INDOOR", "Sân Pickleball C1 (Có Mái Che Cao Cấp)", 4, new BigDecimal("140000.00"));
                taoSanConMau(cs3.getId(), pickleball.getId(), "PICKLEBALL_ACRYLIC_OUTDOOR", "Sân Pickleball C2 (Cụm Sân Thi Đấu Đôi)", 4, new BigDecimal("130000.00"));
            }
            if (tennis != null) {
                taoSanConMau(cs3.getId(), tennis.getId(), "TENNIS_HARD_COURT", "Sân Tennis D1 (Mặt Sân Cứng Đèn Pha)", 4, new BigDecimal("200000.00"));
                taoSanConMau(cs3.getId(), tennis.getId(), "TENNIS_HARD_COURT", "Sân Tennis D2 (Decoturf Chuẩn Quốc Tế)", 4, new BigDecimal("220000.00"));
            }
            if (badminton != null) {
                taoSanConMau(cs3.getId(), badminton.getId(), "BADMINTON_PVC", "Sân Cầu Lông A1 (Thảm PVC BWF)", 4, new BigDecimal("100000.00"));
                taoSanConMau(cs3.getId(), badminton.getId(), "BADMINTON_PVC", "Sân Cầu Lông A2 (Thảm PVC BWF)", 4, new BigDecimal("100000.00"));
            }
            if (basketball != null) {
                taoSanConMau(cs3.getId(), basketball.getId(), "BASKETBALL_5X5_WOOD", "Sân Bóng Rổ E1 (Sàn Gỗ Tiêu Chuẩn)", 10, new BigDecimal("290000.00"));
            }

            // Gan tat ca tien ich cho ca 3 co so
            try {
                jdbcTemplate.execute("INSERT IGNORE INTO venue_amenities (venue_id, amenity_id) " +
                        "SELECT v.id, a.id FROM venues v CROSS JOIN amenities a");
            } catch (Exception e) {
                log.warn("Gan tien ich: {}", e.getMessage());
            }

            log.info("Khoi tao thanh cong 3 Co So ESportKing Ha Noi kem san con va tien ich!");
        }
    }

    private void taoSanConMau(Long venueId, Long sportTypeId, String catalogCode, String name, int cap, BigDecimal basePrice) {
        Long courtTypeId = khoLoaiHinhSanCatalog.findByCode(catalogCode)
                .map(LoaiHinhSanCatalog::getId)
                .orElseGet(() -> khoLoaiHinhSanCatalog.findBySportTypeId(sportTypeId).stream()
                        .findFirst()
                        .map(LoaiHinhSanCatalog::getId)
                        .orElse(1L));

        SanCon court = SanCon.builder()
                .venueId(venueId)
                .sportTypeId(sportTypeId)
                .courtTypeId(courtTypeId)
                .name(name)
                .capacity(cap)
                .basePrice(basePrice)
                .slotStepMinutes(30)
                .minDurationMinutes(60)
                .maxDurationMinutes(120)
                .currency("VND")
                .status(TrangThaiSanCon.ACTIVE)
                .build();
        court = khoSanCon.save(court);

        // Gio mo cua tu 06:00 den 22:30 tat ca cac ngay
        for (int day = 1; day <= 7; day++) {
            KhungGioHoatDong gio = KhungGioHoatDong.builder()
                    .courtId(court.getId())
                    .dayOfWeek(day)
                    .openTime(LocalTime.of(6, 0))
                    .closeTime(LocalTime.of(22, 30))
                    .build();
            khoKhungGioHoatDong.save(gio);
        }

        // Quy tac gio cao diem (17:00 -> 21:00 tang gia 20%)
        BigDecimal giaCaoDiem = basePrice.multiply(new BigDecimal("1.20"));
        QuyTacGia rule = QuyTacGia.builder()
                .courtId(court.getId())
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(21, 0))
                .unitPrice(giaCaoDiem)
                .priority(10)
                .status("ACTIVE")
                .build();
        khoQuyTacGia.save(rule);
    }
}
