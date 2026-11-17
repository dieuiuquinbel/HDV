/**
 * File: DichVuCumSan.java
 * Muc dich: Xu ly nghiep vu quan ly cum san the thao (Venues), bo loc dong theo mon va tien ich.
 * Chuc nang: Lay danh sach cum san (ho tro loc mon, loai san, mat san, quan, gia), xem chi tiet, tao/sua cum san va doi trang thai.
 */
package com.sportbooking.courtservice.dichvu;

import com.sportbooking.courtservice.dulieu.*;
import com.sportbooking.courtservice.khodulieu.*;
import com.sportbooking.courtservice.ngoaile.LoiNghiepVu;
import com.sportbooking.courtservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DichVuCumSan {

    private final KhoCumSan khoCumSan;
    private final KhoSanCon khoSanCon;
    private final KhoLoaiTheThao khoLoaiTheThao;
    private final KhoLoaiHinhSanCatalog khoLoaiHinhSanCatalog;
    private final KhoTienIch khoTienIch;

    @Transactional(readOnly = true)
    public Page<TraVeCumSan> layDanhSachCumSan(
            String sportType,
            String district,
            String configType,
            String surface,
            BigDecimal priceMin,
            BigDecimal priceMax,
            Pageable pageable) {

        Long filterSportTypeId = null;
        if (sportType != null && !sportType.trim().isEmpty()) {
            filterSportTypeId = khoLoaiTheThao.findByCode(sportType.trim().toUpperCase())
                    .map(LoaiTheThao::getId)
                    .orElse(-1L);
        }

        String districtClean = (district != null && !district.trim().isEmpty()) ? district.trim() : null;
        String configTypeClean = (configType != null && !configType.trim().isEmpty()) ? configType.trim() : null;
        String surfaceClean = (surface != null && !surface.trim().isEmpty()) ? surface.trim() : null;

        boolean hasCourtLevelFilter = filterSportTypeId != null || configTypeClean != null || surfaceClean != null || priceMin != null || priceMax != null;

        Page<CumSan> venuesPage;
        if (hasCourtLevelFilter) {
            venuesPage = khoCumSan.timKiemCumSanDayDu(
                    TrangThaiCumSan.ACTIVE,
                    filterSportTypeId,
                    districtClean,
                    configTypeClean,
                    surfaceClean,
                    priceMin,
                    priceMax,
                    pageable);
        } else if (districtClean != null) {
            venuesPage = khoCumSan.findByStatusAndDistrictContainingIgnoreCase(TrangThaiCumSan.ACTIVE, districtClean, pageable);
        } else {
            venuesPage = khoCumSan.findByStatus(TrangThaiCumSan.ACTIVE, pageable);
        }

        Map<Long, String> sportTypeMap = khoLoaiTheThao.findAll().stream()
                .collect(Collectors.toMap(LoaiTheThao::getId, LoaiTheThao::getName));
        Map<Long, LoaiHinhSanCatalog> catalogMap = khoLoaiHinhSanCatalog.findAll().stream()
                .collect(Collectors.toMap(LoaiHinhSanCatalog::getId, c -> c));

        Long finalFilterSportTypeId = filterSportTypeId;
        List<TraVeCumSan> venueDtos = venuesPage.getContent().stream()
                .map(venue -> {
                    List<SanCon> courts = khoSanCon.findByVenueIdAndStatus(venue.getId(), TrangThaiSanCon.ACTIVE);
                    if (finalFilterSportTypeId != null) {
                        courts = courts.stream()
                                .filter(c -> c.getSportTypeId().equals(finalFilterSportTypeId))
                                .collect(Collectors.toList());
                    }

                    // Loc theo configType neu co
                    if (configTypeClean != null) {
                        courts = courts.stream().filter(c -> {
                            LoaiHinhSanCatalog cat = catalogMap.get(c.getCourtTypeId());
                            return cat != null && configTypeClean.equalsIgnoreCase(cat.getConfigType());
                        }).collect(Collectors.toList());
                    }

                    // Loc theo surface neu co
                    if (surfaceClean != null) {
                        courts = courts.stream().filter(c -> {
                            LoaiHinhSanCatalog cat = catalogMap.get(c.getCourtTypeId());
                            return cat != null && surfaceClean.equalsIgnoreCase(cat.getSurface());
                        }).collect(Collectors.toList());
                    }

                    // Loc theo khoang gia
                    if (priceMin != null) {
                        courts = courts.stream().filter(c -> c.getBasePrice().compareTo(priceMin) >= 0).collect(Collectors.toList());
                    }
                    if (priceMax != null) {
                        courts = courts.stream().filter(c -> c.getBasePrice().compareTo(priceMax) <= 0).collect(Collectors.toList());
                    }

                    List<TraVeSanCon> courtDtos = courts.stream()
                            .map(c -> TraVeSanCon.tuThucThe(
                                     c,
                                    sportTypeMap.getOrDefault(c.getSportTypeId(), ""),
                                    catalogMap.get(c.getCourtTypeId())))
                            .collect(Collectors.toList());

                    List<TraVeTienIch> amenities = khoTienIch.findByVenueId(venue.getId()).stream()
                            .map(TraVeTienIch::tuThucThe)
                            .collect(Collectors.toList());

                    return TraVeCumSan.tuThucThe(venue, courtDtos, amenities);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(venueDtos, pageable, venuesPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public TraVeCumSan layChiTietCumSan(Long id) {
        CumSan venue = khoCumSan.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        Map<Long, String> sportTypeMap = khoLoaiTheThao.findAll().stream()
                .collect(Collectors.toMap(LoaiTheThao::getId, LoaiTheThao::getName));
        Map<Long, LoaiHinhSanCatalog> catalogMap = khoLoaiHinhSanCatalog.findAll().stream()
                .collect(Collectors.toMap(LoaiHinhSanCatalog::getId, c -> c));

        List<TraVeSanCon> courtDtos = khoSanCon.findByVenueId(id).stream()
                .map(c -> TraVeSanCon.tuThucThe(
                        c,
                        sportTypeMap.getOrDefault(c.getSportTypeId(), ""),
                        catalogMap.get(c.getCourtTypeId())))
                .collect(Collectors.toList());

        List<TraVeTienIch> amenities = khoTienIch.findByVenueId(id).stream()
                .map(TraVeTienIch::tuThucThe)
                .collect(Collectors.toList());

        return TraVeCumSan.tuThucThe(venue, courtDtos, amenities);
    }

    @Transactional
    public TraVeCumSan taoCumSan(Long ownerId, YeuCauTaoCumSan yeuCau) {
        CumSan venue = CumSan.builder()
                .ownerId(ownerId)
                .name(yeuCau.getName().trim())
                .address(yeuCau.getAddress().trim())
                .district(yeuCau.getDistrict().trim())
                .latitude(yeuCau.getLatitude())
                .longitude(yeuCau.getLongitude())
                .description(yeuCau.getDescription())
                .status(TrangThaiCumSan.PENDING) // Mac dinh PENDING cho Admin phe duyet
                .build();

        venue = khoCumSan.save(venue);
        return TraVeCumSan.tuThucThe(venue, List.of(), List.of());
    }

    @Transactional
    public TraVeCumSan capNhatCumSan(Long userId, String userRole, Long id, YeuCauCapNhatCumSan yeuCau) {
        CumSan venue = khoCumSan.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        // Admin co toan quyen sua cum san cua bat ky chu san nao; Owner chi sua duoc cum san cua chinh minh
        if (!"ADMIN".equals(userRole) && !venue.getOwnerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu của cụm sân này.");
        }

        venue.setName(yeuCau.getName().trim());
        venue.setAddress(yeuCau.getAddress().trim());
        venue.setDistrict(yeuCau.getDistrict().trim());
        venue.setLatitude(yeuCau.getLatitude());
        venue.setLongitude(yeuCau.getLongitude());
        venue.setDescription(yeuCau.getDescription());

        venue = khoCumSan.save(venue);
        return layChiTietCumSan(venue.getId());
    }

    @Transactional
    public TraVeCumSan doiTrangThaiCumSan(Long userId, String userRole, Long id, String statusMoiStr) {
        CumSan venue = khoCumSan.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "VENUE_NOT_FOUND", "Không tìm thấy cụm sân thi đấu."));

        TrangThaiCumSan statusMoi;
        try {
            statusMoi = TrangThaiCumSan.valueOf(statusMoiStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Trạng thái không hợp lệ.");
        }

        if ("OWNER".equals(userRole)) {
            if (!venue.getOwnerId().equals(userId)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu cụm sân này.");
            }
            if ((venue.getStatus() != TrangThaiCumSan.ACTIVE && venue.getStatus() != TrangThaiCumSan.HIDDEN)
                    || (statusMoi != TrangThaiCumSan.ACTIVE && statusMoi != TrangThaiCumSan.HIDDEN)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chủ sân chỉ được chuyển ACTIVE và HIDDEN sau khi sân đã được duyệt.");
            }
        } else if (!"ADMIN".equals(userRole)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
        }

        venue.setStatus(statusMoi);
        venue = khoCumSan.save(venue);
        return layChiTietCumSan(venue.getId());
    }

    @Transactional(readOnly = true)
    public List<TraVeCumSan> layCumSanCuaChu(Long ownerId) {
        Map<Long, String> sportTypeMap = khoLoaiTheThao.findAll().stream()
                .collect(Collectors.toMap(LoaiTheThao::getId, LoaiTheThao::getName));
        Map<Long, LoaiHinhSanCatalog> catalogMap = khoLoaiHinhSanCatalog.findAll().stream()
                .collect(Collectors.toMap(LoaiHinhSanCatalog::getId, c -> c));

        return khoCumSan.findByOwnerId(ownerId).stream()
                .map(v -> {
                    List<TraVeSanCon> courts = khoSanCon.findByVenueId(v.getId()).stream()
                            .map(c -> TraVeSanCon.tuThucThe(
                                    c,
                                    sportTypeMap.getOrDefault(c.getSportTypeId(), ""),
                                    catalogMap.get(c.getCourtTypeId())))
                            .collect(Collectors.toList());
                    List<TraVeTienIch> amenities = khoTienIch.findByVenueId(v.getId()).stream()
                            .map(TraVeTienIch::tuThucThe)
                            .collect(Collectors.toList());
                    return TraVeCumSan.tuThucThe(v, courts, amenities);
                })
                .collect(Collectors.toList());
    }
}
