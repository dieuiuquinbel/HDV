/**
 * File: DichVuSanCon.java
 * Muc dich: Xu ly nghiep vu cho tung san con (Court), danh muc loai hinh san catalog, gio mo cua va quy tac gia.
 * Chuc nang: Chu san tao/sua san con, gan loai hinh catalog, thoi luong (30/60/120p), cau hinh gio va gia.
 */
package com.sportbooking.courtservice.dichvu;

import com.sportbooking.courtservice.dulieu.*;
import com.sportbooking.courtservice.khodulieu.*;
import com.sportbooking.courtservice.ngoaile.LoiNghiepVu;
import com.sportbooking.courtservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DichVuSanCon {

    private final KhoSanCon khoSanCon;
    private final KhoCumSan khoCumSan;
    private final KhoLoaiTheThao khoLoaiTheThao;
    private final KhoLoaiHinhSanCatalog khoLoaiHinhSanCatalog;
    private final KhoKhungGioHoatDong khoKhungGioHoatDong;
    private final KhoQuyTacGia khoQuyTacGia;

    @Transactional(readOnly = true)
    public List<TraVeLoaiHinhSanCatalog> layDanhMucLoaiHinhSan(Long sportTypeId) {
        List<LoaiHinhSanCatalog> list = (sportTypeId != null)
                ? khoLoaiHinhSanCatalog.findBySportTypeId(sportTypeId)
                : khoLoaiHinhSanCatalog.findAll();
        return list.stream().map(TraVeLoaiHinhSanCatalog::tuThucThe).collect(Collectors.toList());
    }

    @Transactional
    public TraVeSanCon taoSanCon(Long ownerId, Long venueId, YeuCauTaoSanCon yeuCau) {
        CumSan venue = khoCumSan.findById(venueId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        if (!venue.getOwnerId().equals(ownerId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu của cụm sân này.");
        }

        if (khoSanCon.existsByVenueIdAndName(venueId, yeuCau.getName().trim())) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "COURT_NAME_EXISTS", "Tên sân con đã tồn tại trong cụm sân này.");
        }

        LoaiTheThao sportType = khoLoaiTheThao.findById(yeuCau.getSportTypeId())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "SPORT_TYPE_NOT_FOUND", "Không tìm thấy môn thể thao tương ứng."));

        // Xac dinh courtTypeId tu catalog
        Long catalogId = yeuCau.getCourtTypeId();
        if (catalogId == null) {
            catalogId = khoLoaiHinhSanCatalog.findBySportTypeId(sportType.getId())
                    .stream().findFirst().map(LoaiHinhSanCatalog::getId)
                    .orElse(1L);
        }

        LoaiHinhSanCatalog catalog = khoLoaiHinhSanCatalog.findById(catalogId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_TYPE_NOT_FOUND", "Không tìm thấy loại hình sân trong danh mục."));

        if (!catalog.getSportTypeId().equals(sportType.getId())) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_COURT_TYPE_FOR_SPORT", "Loại hình sân không thuộc môn thể thao đã chọn.");
        }

        int slotStep = yeuCau.getSlotStepMinutes() != null ? yeuCau.getSlotStepMinutes() : 30;
        int minDuration = yeuCau.getMinDurationMinutes() != null ? yeuCau.getMinDurationMinutes() : 60;
        int maxDuration = yeuCau.getMaxDurationMinutes() != null ? yeuCau.getMaxDurationMinutes() : 120;
        kiemTraThoiLuongSan(slotStep, minDuration, maxDuration);

        SanCon court = SanCon.builder()
                .venueId(venueId)
                .sportTypeId(sportType.getId())
                .courtTypeId(catalog.getId())
                .name(yeuCau.getName().trim())
                .capacity(yeuCau.getCapacity() != null ? yeuCau.getCapacity() : catalog.getDefaultCapacity())
                .basePrice(yeuCau.getBasePrice())
                .slotStepMinutes(slotStep)
                .minDurationMinutes(minDuration)
                .maxDurationMinutes(maxDuration)
                .currency("VND")
                .status(TrangThaiSanCon.ACTIVE)
                .build();

        court = khoSanCon.save(court);

        // Tao gio mo cua mac dinh tu thu 2 den chu nhat (06:00 -> 22:00)
        for (int day = 1; day <= 7; day++) {
            KhungGioHoatDong gio = KhungGioHoatDong.builder()
                    .courtId(court.getId())
                    .dayOfWeek(day)
                    .openTime(LocalTime.of(6, 0))
                    .closeTime(LocalTime.of(22, 0))
                    .build();
            khoKhungGioHoatDong.save(gio);
        }

        return TraVeSanCon.tuThucThe(court, sportType.getName(), catalog);
    }

    @Transactional
    public TraVeSanCon capNhatSanCon(Long ownerId, String userRole, Long id, YeuCauCapNhatSanCon yeuCau) {
        SanCon court = khoSanCon.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_NOT_FOUND", "Không tìm thấy sân thi đấu con."));

        CumSan venue = khoCumSan.findById(court.getVenueId())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        if (!"ADMIN".equals(userRole) && !venue.getOwnerId().equals(ownerId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu sân này.");
        }

        court.setName(yeuCau.getName().trim());
        if (yeuCau.getCapacity() != null) court.setCapacity(yeuCau.getCapacity());
        court.setBasePrice(yeuCau.getBasePrice());

        if (yeuCau.getCourtTypeId() != null) {
            LoaiHinhSanCatalog catalog = khoLoaiHinhSanCatalog.findById(yeuCau.getCourtTypeId())
                    .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_TYPE_NOT_FOUND", "Không tìm thấy loại hình sân trong danh mục."));
            if (!catalog.getSportTypeId().equals(court.getSportTypeId())) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_COURT_TYPE_FOR_SPORT", "Loại hình sân không thuộc môn thể thao của sân này.");
            }
            court.setCourtTypeId(catalog.getId());
        }

        int slotStep = yeuCau.getSlotStepMinutes() != null ? yeuCau.getSlotStepMinutes() : court.getSlotStepMinutes();
        int minDuration = yeuCau.getMinDurationMinutes() != null ? yeuCau.getMinDurationMinutes() : court.getMinDurationMinutes();
        int maxDuration = yeuCau.getMaxDurationMinutes() != null ? yeuCau.getMaxDurationMinutes() : court.getMaxDurationMinutes();
        kiemTraThoiLuongSan(slotStep, minDuration, maxDuration);

        court.setSlotStepMinutes(slotStep);
        court.setMinDurationMinutes(minDuration);
        court.setMaxDurationMinutes(maxDuration);

        court = khoSanCon.save(court);
        String sportTypeName = khoLoaiTheThao.findById(court.getSportTypeId()).map(LoaiTheThao::getName).orElse("");
        LoaiHinhSanCatalog catalog = khoLoaiHinhSanCatalog.findById(court.getCourtTypeId()).orElse(null);
        return TraVeSanCon.tuThucThe(court, sportTypeName, catalog);
    }

    @Transactional
    public TraVeSanCon doiTrangThaiSanCon(Long ownerId, String userRole, Long id, String statusMoiStr) {
        SanCon court = khoSanCon.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_NOT_FOUND", "Không tìm thấy sân thi đấu con."));

        CumSan venue = khoCumSan.findById(court.getVenueId())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        if (!"ADMIN".equals(userRole) && !venue.getOwnerId().equals(ownerId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu sân này.");
        }

        TrangThaiSanCon statusMoi;
        try {
            statusMoi = TrangThaiSanCon.valueOf(statusMoiStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Trạng thái không hợp lệ.");
        }

        court.setStatus(statusMoi);
        court = khoSanCon.save(court);
        String sportTypeName = khoLoaiTheThao.findById(court.getSportTypeId()).map(LoaiTheThao::getName).orElse("");
        LoaiHinhSanCatalog catalog = khoLoaiHinhSanCatalog.findById(court.getCourtTypeId()).orElse(null);
        return TraVeSanCon.tuThucThe(court, sportTypeName, catalog);
    }

    @Transactional
    public void capNhatKhungGioHoatDong(Long ownerId, Long courtId, List<YeuCauKhungGioHoatDong> danhSachGio) {
        SanCon court = khoSanCon.findById(courtId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_NOT_FOUND", "Không tìm thấy sân thi đấu con."));
        CumSan venue = khoCumSan.findById(court.getVenueId())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        if (!venue.getOwnerId().equals(ownerId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu sân này.");
        }

        khoKhungGioHoatDong.deleteByCourtId(courtId);
        for (YeuCauKhungGioHoatDong req : danhSachGio) {
            if (req.getOpenTime().isAfter(req.getCloseTime())) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_OPERATING_HOURS", "Giờ mở cửa phải trước giờ đóng cửa.");
            }
            KhungGioHoatDong gio = KhungGioHoatDong.builder()
                    .courtId(courtId)
                    .dayOfWeek(req.getDayOfWeek())
                    .openTime(req.getOpenTime())
                    .closeTime(req.getCloseTime())
                    .build();
            khoKhungGioHoatDong.save(gio);
        }
    }

    @Transactional
    public void capNhatQuyTacGia(Long ownerId, Long courtId, List<YeuCauQuyTacGia> danhSachGia) {
        SanCon court = khoSanCon.findById(courtId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_NOT_FOUND", "Không tìm thấy sân thi đấu con."));
        CumSan venue = khoCumSan.findById(court.getVenueId())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        if (!venue.getOwnerId().equals(ownerId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu sân này.");
        }

        khoQuyTacGia.deleteByCourtId(courtId);
        for (YeuCauQuyTacGia req : danhSachGia) {
            QuyTacGia rule = QuyTacGia.builder()
                    .courtId(courtId)
                    .effectiveFrom(req.getEffectiveFrom())
                    .effectiveTo(req.getEffectiveTo())
                    .startTime(req.getStartTime())
                    .endTime(req.getEndTime())
                    .unitPrice(req.getUnitPrice())
                    .priority(req.getPriority() != null ? req.getPriority() : 1)
                    .status("ACTIVE")
                    .build();
            khoQuyTacGia.save(rule);
        }
    }

    @Transactional(readOnly = true)
    public TraVeCauHinhDatSan layCauHinhDatSan(Long courtId, LocalDate ngayDat) {
        SanCon court = khoSanCon.findById(courtId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "COURT_NOT_FOUND", "Không tìm thấy sân thi đấu con."));

        CumSan venue = khoCumSan.findById(court.getVenueId())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        // Quy doi ngay sang thu trong tuan: 1=Sunday, 2=Monday, ..., 7=Saturday
        DayOfWeek dow = ngayDat.getDayOfWeek();
        int dayOfWeekInt = (dow.getValue() % 7) + 1;

        KhungGioHoatDong gio = khoKhungGioHoatDong.findByCourtIdAndDayOfWeek(courtId, dayOfWeekInt)
                .orElse(KhungGioHoatDong.builder()
                        .openTime(LocalTime.of(6, 0))
                        .closeTime(LocalTime.of(22, 0))
                        .build());

        List<QuyTacGia> priceRules = khoQuyTacGia.findByCourtIdAndStatusOrderByPriorityDesc(courtId, "ACTIVE");
        List<TraVeCauHinhDatSan.QuyTacGiaDonGian> matchingRules = priceRules.stream()
                .filter(r -> (r.getEffectiveFrom() == null || !ngayDat.isBefore(r.getEffectiveFrom())) &&
                             (r.getEffectiveTo() == null || !ngayDat.isAfter(r.getEffectiveTo())))
                .map(r -> TraVeCauHinhDatSan.QuyTacGiaDonGian.builder()
                        .startTime(r.getStartTime())
                        .endTime(r.getEndTime())
                        .unitPrice(r.getUnitPrice())
                        .priority(r.getPriority())
                        .build())
                .collect(Collectors.toList());

        return TraVeCauHinhDatSan.builder()
                .courtId(court.getId())
                .courtName(court.getName())
                .courtStatus(court.getStatus().name())
                .venueId(venue.getId())
                .venueName(venue.getName())
                .ownerId(venue.getOwnerId())
                .venueStatus(venue.getStatus().name())
                .basePrice(court.getBasePrice())
                .currency(court.getCurrency())
                .slotStepMinutes(court.getSlotStepMinutes())
                .minDurationMinutes(court.getMinDurationMinutes())
                .maxDurationMinutes(court.getMaxDurationMinutes())
                .openTime(gio.getOpenTime())
                .closeTime(gio.getCloseTime())
                .priceRules(matchingRules)
                .build();
    }

    private void kiemTraThoiLuongSan(Integer slotStep, Integer minDuration, Integer maxDuration) {
        if (slotStep == null || slotStep <= 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_SLOT_STEP", "Khoảng thời gian mỗi khung giờ (slotStepMinutes) phải lớn hơn 0.");
        }
        if (minDuration == null || minDuration <= 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_MIN_DURATION", "Thời lượng đặt tối thiểu (minDurationMinutes) phải lớn hơn 0.");
        }
        if (maxDuration == null || maxDuration <= 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_MAX_DURATION", "Thời lượng đặt tối đa (maxDurationMinutes) phải lớn hơn 0.");
        }
        if (minDuration > maxDuration) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_DURATION_RANGE", "Thời lượng đặt tối thiểu không được lớn hơn thời lượng đặt tối đa.");
        }
        if (minDuration % slotStep != 0 || maxDuration % slotStep != 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "DURATION_NOT_DIVISIBLE_BY_STEP", "Thời lượng tối thiểu và tối đa phải là bội số của slotStepMinutes.");
        }
    }
}
