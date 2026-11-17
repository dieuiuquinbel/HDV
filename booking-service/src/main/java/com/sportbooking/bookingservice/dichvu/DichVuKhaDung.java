/**
 * File: DichVuKhaDung.java
 * Muc dich: Xu ly tinh toan tinh trang kha dung (Availability) cua cac khung gio 60 phut cho mot san con theo ngay.
 * Chuc nang: Goi Court Service lay gio mo cua/gia, doi chieu voi ActiveSlotLock, loai bo cac slot qua khu (< hien tai + 15 phut).
 */
package com.sportbooking.bookingservice.dichvu;

import com.sportbooking.bookingservice.dulieu.TraVeCauHinhSanNoiBo;
import com.sportbooking.bookingservice.dulieu.TraVeKhungGioTrong;
import com.sportbooking.bookingservice.khodulieu.KhoKhoaKhungGio;
import com.sportbooking.bookingservice.thucthe.KhoaKhungGio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DichVuKhaDung {

    private final DichVuGoiSanNoiBo dichVuGoiSanNoiBo;
    private final KhoKhoaKhungGio khoKhoaKhungGio;

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    public List<TraVeKhungGioTrong> tinhKhungGioKhaDung(Long courtId, LocalDate date) {
        return tinhKhungGioKhaDung(courtId, date, null);
    }

    public List<TraVeKhungGioTrong> tinhKhungGioKhaDung(Long courtId, LocalDate date, Integer durationMinutes) {
        TraVeCauHinhSanNoiBo config = dichVuGoiSanNoiBo.layCauHinhSan(courtId, date);

        if (!"ACTIVE".equals(config.getCourtStatus()) || !"ACTIVE".equals(config.getVenueStatus())) {
            return Collections.emptyList();
        }

        LocalTime open = config.getOpenTime();
        LocalTime close = config.getCloseTime();

        Set<LocalTime> lockedSlots = khoKhoaKhungGio.findByCourtIdAndBookingDate(courtId, date).stream()
                .map(KhoaKhungGio::getSlotStart)
                .collect(Collectors.toSet());

        Instant nowPlus15m = Instant.now().plus(Duration.ofMinutes(15));

        int duration = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : 60;
        int stepMinutes = (config.getSlotStepMinutes() != null && config.getSlotStepMinutes() > 0)
                ? config.getSlotStepMinutes() : 30;

        List<TraVeKhungGioTrong> danhSach = new ArrayList<>();
        LocalTime current = open;

        while (current.plusMinutes(duration).compareTo(close) <= 0 && !current.plusMinutes(duration).isBefore(current)) {
            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(duration);

            boolean isAvailable = true;
            String reason = "AVAILABLE";
            BigDecimal totalPrice = BigDecimal.ZERO;

            // Kiem tra tung block 30 phut trong khoang [slotStart, slotEnd)
            int blocks = duration / 30;
            for (int b = 0; b < blocks; b++) {
                LocalTime bStart = slotStart.plusMinutes(b * 30L);
                LocalDateTime bDateTime = LocalDateTime.of(date, bStart);
                Instant bInstant = bDateTime.atZone(ZONE_VN).toInstant();

                BigDecimal hourlyPrice = tinhGiaSlot(config, bStart);
                BigDecimal blockPrice = hourlyPrice.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
                totalPrice = totalPrice.add(blockPrice);

                if (bInstant.isBefore(nowPlus15m)) {
                    isAvailable = false;
                    reason = "PAST";
                } else if (lockedSlots.contains(bStart)) {
                    isAvailable = false;
                    reason = "LOCKED";
                }
            }

            danhSach.add(TraVeKhungGioTrong.builder()
                    .slotStart(slotStart)
                    .slotEnd(slotEnd)
                    .price(totalPrice)
                    .available(isAvailable)
                    .reason(reason)
                    .build());

            current = current.plusMinutes(stepMinutes);
        }

        return danhSach;
    }

    public BigDecimal tinhGiaSlot(TraVeCauHinhSanNoiBo config, LocalTime slotStart) {
        if (config.getPriceRules() != null) {
            for (TraVeCauHinhSanNoiBo.QuyTacGiaDonGian rule : config.getPriceRules()) {
                // Kiem tra slot nam trong khoang rule.getStartTime() den rule.getEndTime()
                if (!slotStart.isBefore(rule.getStartTime()) && slotStart.isBefore(rule.getEndTime())) {
                    return rule.getUnitPrice();
                }
            }
        }
        return config.getBasePrice();
    }
}
