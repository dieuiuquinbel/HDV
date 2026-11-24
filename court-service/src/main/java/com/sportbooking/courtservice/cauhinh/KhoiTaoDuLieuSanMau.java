/**
 * File: KhoiTaoDuLieuSanMau.java
 * Muc dich: Nap du lieu chuan cho he thong the thao ESportKing tai Ha Noi.
 * Chuc nang: Tao 4 mon the thao chinh (Bong da, Cau long, Bong ro, Tennis), 3 co so ESportKing tai Cau Giay, Dong Da, Ha Dong,
 *            chuan hoa dung 30 san the thao vat ly thuc te (10 san / co so) kem court_code va hinh anh cuc bo.
 */
package com.sportbooking.courtservice.cauhinh;

import com.sportbooking.courtservice.khodulieu.*;
import com.sportbooking.courtservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class KhoiTaoDuLieuSanMau implements CommandLineRunner {

    private final KhoLoaiTheThao khoLoaiTheThao;
    private final KhoLoaiHinhSanCatalog khoLoaiHinhSanCatalog;
    private final KhoCumSan khoCumSan;
    private final KhoSanCon khoSanCon;
    private final KhoKhungGioHoatDong khoKhungGioHoatDong;
    private final KhoQuyTacGia khoQuyTacGia;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        khoiTaoLoaiTheThao();
        khoiTaoLoaiHinhSanCatalog();
        khoiTaoVaDongBo3CoSoHaNoi();
    }

    private void khoiTaoLoaiTheThao() {
        if (khoLoaiTheThao.count() == 0) {
            log.info("Khoi tao cac bo mon the thao he thong ESportKing...");
            LoaiTheThao football = LoaiTheThao.builder().code("FOOTBALL").name("Bóng Đá").build();
            LoaiTheThao badminton = LoaiTheThao.builder().code("BADMINTON").name("Cầu Lông").build();
            LoaiTheThao tennis = LoaiTheThao.builder().code("TENNIS").name("Tennis").build();
            LoaiTheThao basketball = LoaiTheThao.builder().code("BASKETBALL").name("Bóng Rổ").build();
            LoaiTheThao pickleball = LoaiTheThao.builder().code("PICKLEBALL").name("Pickleball").build();
            LoaiTheThao volleyball = LoaiTheThao.builder().code("VOLLEYBALL").name("Bóng Chuyền").build();
            khoLoaiTheThao.saveAll(List.of(football, badminton, tennis, basketball, pickleball, volleyball));
        }
    }

    private void khoiTaoLoaiHinhSanCatalog() {
        LoaiTheThao football = khoLoaiTheThao.findByCode("FOOTBALL").orElse(null);
        LoaiTheThao badminton = khoLoaiTheThao.findByCode("BADMINTON").orElse(null);
        LoaiTheThao tennis = khoLoaiTheThao.findByCode("TENNIS").orElse(null);
        LoaiTheThao basketball = khoLoaiTheThao.findByCode("BASKETBALL").orElse(null);

        // Dam bao co du cac catalog loai hinh san chuan
        if (football != null && khoLoaiHinhSanCatalog.findByCode("FOOTBALL_5_TURF").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(football.getId()).code("FOOTBALL_5_TURF").name("Sân Bóng Đá Mini 5 Người Cỏ Nhân Tạo").configType("5_A_SIDE").surface("ARTIFICIAL_TURF").environment("OUTDOOR").defaultCapacity(10).dimensions("20m x 40m").build());
        }
        if (football != null && khoLoaiHinhSanCatalog.findByCode("FOOTBALL_7_TURF").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(football.getId()).code("FOOTBALL_7_TURF").name("Sân Bóng Đá 7 Người Cỏ Nhân Tạo").configType("7_A_SIDE").surface("ARTIFICIAL_TURF").environment("OUTDOOR").defaultCapacity(14).dimensions("30m x 50m").build());
        }
        if (football != null && khoLoaiHinhSanCatalog.findByCode("FOOTBALL_11_GRASS").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(football.getId()).code("FOOTBALL_11_GRASS").name("Sân Bóng Đá 11 Người Cỏ Tự Nhiên").configType("11_A_SIDE").surface("NATURAL_GRASS").environment("OUTDOOR").defaultCapacity(22).dimensions("68m x 105m").build());
        }

        if (badminton != null && khoLoaiHinhSanCatalog.findByCode("BADMINTON_PVC").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(badminton.getId()).code("BADMINTON_PVC").name("Sân Cầu Lông Thảm PVC Thi Đấu").configType("DOUBLES").surface("PVC_VINYL").environment("INDOOR").defaultCapacity(4).dimensions("13.4m x 6.1m").build());
        }
        if (badminton != null && khoLoaiHinhSanCatalog.findByCode("BADMINTON_PRO").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(badminton.getId()).code("BADMINTON_PRO").name("Sân Cầu Lông Thảm Yonex Pro Cao Cấp").configType("DOUBLES").surface("PVC_VINYL").environment("INDOOR").defaultCapacity(4).dimensions("13.4m x 6.1m").build());
        }

        if (basketball != null && khoLoaiHinhSanCatalog.findByCode("BASKETBALL_5X5_WOOD").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(basketball.getId()).code("BASKETBALL_5X5_WOOD").name("Sân Bóng Rổ Toàn Sân Sàn Gỗ FIBA").configType("5X5").surface("WOOD").environment("INDOOR").defaultCapacity(10).dimensions("28m x 15m").build());
        }
        if (basketball != null && khoLoaiHinhSanCatalog.findByCode("BASKETBALL_3X3").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(basketball.getId()).code("BASKETBALL_3X3").name("Sân Bóng Rổ Nửa Sân 3x3 Streetball").configType("3X3").surface("HARD_ACRYLIC").environment("OUTDOOR").defaultCapacity(6).dimensions("15m x 11m").build());
        }

        if (tennis != null && khoLoaiHinhSanCatalog.findByCode("TENNIS_HARD_COURT").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(tennis.getId()).code("TENNIS_HARD_COURT").name("Sân Tennis Mặt Sân Cứng Decoturf").configType("DOUBLES").surface("HARD_ACRYLIC").environment("OUTDOOR").defaultCapacity(4).dimensions("23.77m x 10.97m").build());
        }
        if (tennis != null && khoLoaiHinhSanCatalog.findByCode("TENNIS_CLAY").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(tennis.getId()).code("TENNIS_CLAY").name("Sân Tennis Đất Nện Tiêu Chuẩn").configType("DOUBLES").surface("CLAY").environment("OUTDOOR").defaultCapacity(4).dimensions("23.77m x 10.97m").build());
        }
        if (tennis != null && khoLoaiHinhSanCatalog.findByCode("TENNIS_GRASS").isEmpty()) {
            khoLoaiHinhSanCatalog.save(LoaiHinhSanCatalog.builder().sportTypeId(tennis.getId()).code("TENNIS_GRASS").name("Sân Tennis Mặt Sân Cỏ Wimbledon").configType("DOUBLES").surface("NATURAL_GRASS").environment("OUTDOOR").defaultCapacity(4).dimensions("23.77m x 10.97m").build());
        }
    }

    private void khoiTaoVaDongBo3CoSoHaNoi() {
        log.info("Bat dau kiem tra va chuan hoa 3 Co So Ha Noi va 30 san the thao vat ly ESportKing...");

        LoaiTheThao football = khoLoaiTheThao.findByCode("FOOTBALL").orElse(null);
        LoaiTheThao badminton = khoLoaiTheThao.findByCode("BADMINTON").orElse(null);
        LoaiTheThao basketball = khoLoaiTheThao.findByCode("BASKETBALL").orElse(null);
        LoaiTheThao tennis = khoLoaiTheThao.findByCode("TENNIS").orElse(null);

        // 1. Tao / Cap nhat 3 Co So
        CumSan cs1 = taoHoacCapNhatCumSan(1L, "Trung Tâm Thể Thao ESportKing - Cơ Sở 1 (Cầu Giấy)",
                "Số 18 Phố Duy Tân, Phường Dịch Vọng Hậu", "Quận Cầu Giấy",
                new BigDecimal("21.031300"), new BigDecimal("105.783500"),
                "Tổ hợp thể thao phức hợp đạt chuẩn thi đấu quốc gia tại Cầu Giấy. Đầy đủ sân bóng đá cỏ nhân tạo, cầu lông thảm PVC BWF, bóng rổ FIBA và tennis Decoturf.");

        CumSan cs2 = taoHoacCapNhatCumSan(2L, "Trung Tâm Thể Thao ESportKing - Cơ Sở 2 (Đống Đa)",
                "Số 102 Phố Trường Chinh, Phường Phương Mai", "Quận Đống Đa",
                new BigDecimal("21.002800"), new BigDecimal("105.839200"),
                "Cụm thể thao cao cấp trung tâm Đống Đa với sàn gỗ tự nhiên, thảm Yonex Pro, tennis đất nện tiêu chuẩn Roland Garros và bóng đá cỏ FIFA.");

        CumSan cs3 = taoHoacCapNhatCumSan(3L, "Trung Tâm Thể Thao ESportKing - Cơ Sở 3 (Hà Đông)",
                "Số 27 Đường Quang Trung, Phường Quang Trung", "Quận Hà Đông",
                new BigDecimal("20.972100"), new BigDecimal("105.774500"),
                "Khu liên hợp thể thao sinh thái rộng rãi tại Hà Đông. Sân cỏ tự nhiên 11 người, cụm sân tennis mặt cỏ Wimbledon, bãi đỗ xe ô tô 200 chỗ.");

        // 2. Chuan hoa 10 san vat ly cho Co So 1 (Cau Giay)
        taoHoacCapNhatSanCon(cs1.getId(), football, "FOOTBALL_5_TURF", "BD-CS1-01", "Sân Bóng Đá Mini 5 Người Số 1", 10, new BigDecimal("200000.00"), "/images/courts/football/football_5_cs1.jpg");
        taoHoacCapNhatSanCon(cs1.getId(), football, "FOOTBALL_7_TURF", "BD-CS1-02", "Sân Bóng Đá 7 Người Cỏ FIFA Pro", 14, new BigDecimal("350000.00"), "/images/courts/football/football_7_cs1.jpg");
        taoHoacCapNhatSanCon(cs1.getId(), football, "FOOTBALL_11_GRASS", "BD-CS1-03", "Sân Bóng Đá 11 Người Chuẩn Thi Đấu", 22, new BigDecimal("650000.00"), "/images/courts/football/football_11_cs1.jpg");

        taoHoacCapNhatSanCon(cs1.getId(), badminton, "BADMINTON_PVC", "CL-CS1-01", "Sân Cầu Lông Thảm PVC Standard", 4, new BigDecimal("100000.00"), "/images/courts/badminton/badminton_pvc_cs1.jpg");
        taoHoacCapNhatSanCon(cs1.getId(), badminton, "BADMINTON_PRO", "CL-CS1-02", "Sân Cầu Lông Thảm Yonex Pro", 4, new BigDecimal("120000.00"), "/images/courts/badminton/badminton_pro_cs1.jpg");

        taoHoacCapNhatSanCon(cs1.getId(), basketball, "BASKETBALL_5X5_WOOD", "BR-CS1-01", "Sân Bóng Rổ Tiêu Chuẩn 5v5 Sàn Gỗ", 10, new BigDecimal("300000.00"), "/images/courts/basketball/basketball_5x5_cs1.jpg");
        taoHoacCapNhatSanCon(cs1.getId(), basketball, "BASKETBALL_3X3", "BR-CS1-02", "Sân Bóng Rổ Nửa Sân 3x3 Ngoài Trời", 6, new BigDecimal("150000.00"), "/images/courts/basketball/basketball_3x3_cs1.jpg");

        taoHoacCapNhatSanCon(cs1.getId(), tennis, "TENNIS_HARD_COURT", "TN-CS1-01", "Sân Tennis Sân Cứng Decoturf", 4, new BigDecimal("200000.00"), "/images/courts/tennis/tennis_hard_cs1.jpg");
        taoHoacCapNhatSanCon(cs1.getId(), tennis, "TENNIS_CLAY", "TN-CS1-02", "Sân Tennis Đất Nện Tiêu Chuẩn", 4, new BigDecimal("220000.00"), "/images/courts/tennis/tennis_clay_cs1.jpg");
        taoHoacCapNhatSanCon(cs1.getId(), tennis, "TENNIS_GRASS", "TN-CS1-03", "Sân Tennis Mặt Sân Cỏ Wimbledon", 4, new BigDecimal("240000.00"), "/images/courts/tennis/tennis_grass_cs1.jpg");

        // 3. Chuan hoa 10 san vat ly cho Co So 2 (Dong Da)
        taoHoacCapNhatSanCon(cs2.getId(), football, "FOOTBALL_5_TURF", "BD-CS2-01", "Sân Bóng Đá Mini 5 Người Cỏ FIFA", 10, new BigDecimal("220000.00"), "/images/courts/football/football_5_cs2.jpg");
        taoHoacCapNhatSanCon(cs2.getId(), football, "FOOTBALL_7_TURF", "BD-CS2-02", "Sân Bóng Đá 7 Người Khán Đài Mini", 14, new BigDecimal("360000.00"), "/images/courts/football/football_7_cs2.jpg");
        taoHoacCapNhatSanCon(cs2.getId(), football, "FOOTBALL_11_GRASS", "BD-CS2-03", "Sân Bóng Đá 11 Người Đèn LED Đêm", 22, new BigDecimal("700000.00"), "/images/courts/football/football_11_cs2.jpg");

        taoHoacCapNhatSanCon(cs2.getId(), badminton, "BADMINTON_PVC", "CL-CS2-01", "Sân Cầu Lông Thảm PVC Đống Đa", 4, new BigDecimal("105000.00"), "/images/courts/badminton/badminton_pvc_cs2.jpg");
        taoHoacCapNhatSanCon(cs2.getId(), badminton, "BADMINTON_PRO", "CL-CS2-02", "Sân Cầu Lông Thảm Yonex Thi Đấu", 4, new BigDecimal("125000.00"), "/images/courts/badminton/badminton_pro_cs2.jpg");

        taoHoacCapNhatSanCon(cs2.getId(), basketball, "BASKETBALL_5X5_WOOD", "BR-CS2-01", "Sân Bóng Rổ 5v5 Sàn Gỗ Tự Nhiên", 10, new BigDecimal("320000.00"), "/images/courts/basketball/basketball_5x5_cs2.jpg");
        taoHoacCapNhatSanCon(cs2.getId(), basketball, "BASKETBALL_3X3", "BR-CS2-02", "Sân Bóng Rổ Nửa Sân 3x3 Streetball", 6, new BigDecimal("160000.00"), "/images/courts/basketball/basketball_3x3_cs2.jpg");

        taoHoacCapNhatSanCon(cs2.getId(), tennis, "TENNIS_HARD_COURT", "TN-CS2-01", "Sân Tennis Sân Cứng Chuyên Nghiệp", 4, new BigDecimal("190000.00"), "/images/courts/tennis/tennis_hard_cs2.jpg");
        taoHoacCapNhatSanCon(cs2.getId(), tennis, "TENNIS_CLAY", "TN-CS2-02", "Sân Tennis Đất Nện Roland Garros", 4, new BigDecimal("230000.00"), "/images/courts/tennis/tennis_clay_cs2.jpg");
        taoHoacCapNhatSanCon(cs2.getId(), tennis, "TENNIS_GRASS", "TN-CS2-03", "Sân Tennis Mặt Sân Cỏ Thi Đấu", 4, new BigDecimal("250000.00"), "/images/courts/tennis/tennis_grass_cs2.jpg");

        // 4. Chuan hoa 10 san vat ly cho Co So 3 (Ha Dong)
        taoHoacCapNhatSanCon(cs3.getId(), football, "FOOTBALL_5_TURF", "BD-CS3-01", "Sân Bóng Đá Mini 5 Người Hà Đông", 10, new BigDecimal("190000.00"), "/images/courts/football/football_5_cs3.jpg");
        taoHoacCapNhatSanCon(cs3.getId(), football, "FOOTBALL_7_TURF", "BD-CS3-02", "Sân Bóng Đá 7 Người Mái Vòm Che", 14, new BigDecimal("330000.00"), "/images/courts/football/football_7_cs3.jpg");
        taoHoacCapNhatSanCon(cs3.getId(), football, "FOOTBALL_11_GRASS", "BD-CS3-03", "Sân Bóng Đá 11 Người Cỏ Tự Nhiên", 22, new BigDecimal("600000.00"), "/images/courts/football/football_11_cs3.jpg");

        taoHoacCapNhatSanCon(cs3.getId(), badminton, "BADMINTON_PVC", "CL-CS3-01", "Sân Cầu Lông Thảm PVC Hà Đông", 4, new BigDecimal("95000.00"), "/images/courts/badminton/badminton_pvc_cs3.jpg");
        taoHoacCapNhatSanCon(cs3.getId(), badminton, "BADMINTON_PRO", "CL-CS3-02", "Sân Cầu Lông Thảm Yonex Trần Cao", 4, new BigDecimal("115000.00"), "/images/courts/badminton/badminton_pro_cs3.jpg");

        taoHoacCapNhatSanCon(cs3.getId(), basketball, "BASKETBALL_5X5_WOOD", "BR-CS3-01", "Sân Bóng Rổ Tiêu Chuẩn Hà Đông", 10, new BigDecimal("290000.00"), "/images/courts/basketball/basketball_5x5_cs3.jpg");
        taoHoacCapNhatSanCon(cs3.getId(), basketball, "BASKETBALL_3X3", "BR-CS3-02", "Sân Bóng Rổ 3x3 Tập Ném Rổ", 6, new BigDecimal("140000.00"), "/images/courts/basketball/basketball_3x3_cs3.jpg");

        taoHoacCapNhatSanCon(cs3.getId(), tennis, "TENNIS_HARD_COURT", "TN-CS3-01", "Sân Tennis Mặt Sân Cứng Mái Che", 4, new BigDecimal("190000.00"), "/images/courts/tennis/tennis_hard_cs3.jpg");
        taoHoacCapNhatSanCon(cs3.getId(), tennis, "TENNIS_CLAY", "TN-CS3-02", "Sân Tennis Đất Nện Hà Đông", 4, new BigDecimal("210000.00"), "/images/courts/tennis/tennis_clay_cs3.jpg");
        taoHoacCapNhatSanCon(cs3.getId(), tennis, "TENNIS_GRASS", "TN-CS3-03", "Sân Tennis Mặt Sân Cỏ Sinh Thái", 4, new BigDecimal("240000.00"), "/images/courts/tennis/tennis_grass_cs3.jpg");

        // Gan tien ich day du
        try {
            jdbcTemplate.execute("INSERT IGNORE INTO venue_amenities (venue_id, amenity_id) " +
                    "SELECT v.id, a.id FROM venues v CROSS JOIN amenities a");
        } catch (Exception e) {
            log.warn("Loi gan tien ich cho co so: {}", e.getMessage());
        }

        log.info("Hoan tat chuan hoa 3 Co So va 30 san the thao vat ly thuc te cho ESportKing Ha Noi!");
    }

    private CumSan taoHoacCapNhatCumSan(Long id, String name, String address, String district, BigDecimal lat, BigDecimal lng, String desc) {
        CumSan cs = khoCumSan.findById(id).orElseGet(() -> CumSan.builder().id(id).ownerId(1L).status(TrangThaiCumSan.ACTIVE).build());
        cs.setName(name);
        cs.setAddress(address);
        cs.setDistrict(district);
        cs.setLatitude(lat);
        cs.setLongitude(lng);
        cs.setDescription(desc);
        cs.setStatus(TrangThaiCumSan.ACTIVE);
        return khoCumSan.save(cs);
    }

    private void taoHoacCapNhatSanCon(Long venueId, LoaiTheThao sport, String catalogCode, String courtCode, String name, int cap, BigDecimal basePrice, String imageUrl) {
        if (sport == null) return;

        Long courtTypeId = khoLoaiHinhSanCatalog.findByCode(catalogCode)
                .map(LoaiHinhSanCatalog::getId)
                .orElseGet(() -> khoLoaiHinhSanCatalog.findBySportTypeId(sport.getId()).stream()
                        .findFirst()
                        .map(LoaiHinhSanCatalog::getId)
                        .orElse(1L));

        Optional<SanCon> existing = khoSanCon.findFirstByCourtCode(courtCode);
        if (existing.isEmpty()) {
            existing = khoSanCon.findByVenueIdAndName(venueId, name);
        }
        SanCon court = existing.orElseGet(() -> SanCon.builder()
                .venueId(venueId)
                .sportTypeId(sport.getId())
                .name(name)
                .build());

        court.setSportTypeId(sport.getId());
        court.setCourtTypeId(courtTypeId);
        court.setName(name);
        court.setCourtCode(courtCode);
        court.setImageUrl(imageUrl);
        court.setCapacity(cap);
        court.setBasePrice(basePrice);
        court.setSlotStepMinutes(30);
        court.setMinDurationMinutes(60);
        court.setMaxDurationMinutes(720);
        court.setCurrency("VND");
        court.setStatus(TrangThaiSanCon.ACTIVE);

        court = khoSanCon.save(court);

        // Dam bao co khung gio hoat dong 06:00 - 22:30
        for (int day = 1; day <= 7; day++) {
            if (khoKhungGioHoatDong.findByCourtIdAndDayOfWeek(court.getId(), day).isEmpty()) {
                KhungGioHoatDong gio = KhungGioHoatDong.builder()
                        .courtId(court.getId())
                        .dayOfWeek(day)
                        .openTime(LocalTime.of(6, 0))
                        .closeTime(LocalTime.of(22, 30))
                        .build();
                khoKhungGioHoatDong.save(gio);
            }
        }

        // Dam bao co quy tac gia cao diem 17:00 - 21:00 (+20%)
        if (khoQuyTacGia.findByCourtId(court.getId()).isEmpty()) {
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
}
