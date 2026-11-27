/**
 * File: DichVuTinhGiaVaKiemTraSan.java
 * Muc dich: Tach logic tinh giam gia voucher, kiem tra thoi luong/gio hoat dong va bam payload (SRP) khoi DichVuDatSan.
 */
package com.sportbooking.bookingservice.dichvu;

import com.sportbooking.bookingservice.dulieu.TraVeCauHinhSanNoiBo;
import com.sportbooking.bookingservice.dulieu.YeuCauDatSan;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import com.sportbooking.bookingservice.thucthe.MaUuDai;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DichVuTinhGiaVaKiemTraSan {

    public BigDecimal tinhTienGiamVoucher(MaUuDai v, BigDecimal tongTien) {
        if (v == null || tongTien == null || tongTien.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (v.getMinOrderAmount() != null && tongTien.compareTo(v.getMinOrderAmount()) < 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal giamGia = BigDecimal.ZERO;
        if (v.getDiscountPercent() != null && v.getDiscountPercent() > 0) {
            BigDecimal phanTram = BigDecimal.valueOf(v.getDiscountPercent())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            giamGia = tongTien.multiply(phanTram).setScale(0, RoundingMode.HALF_UP);
            if (v.getMaxDiscount() != null
                    && v.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0
                    && giamGia.compareTo(v.getMaxDiscount()) > 0) {
                giamGia = v.getMaxDiscount();
            }
        } else if (v.getDiscountAmount() != null && v.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            giamGia = v.getDiscountAmount().min(tongTien);
        }
        return giamGia.min(tongTien);
    }

    public void kiemTraThoiLuongVaGioHoatDong(
            TraVeCauHinhSanNoiBo config,
            LocalDate bookingDate,
            LocalTime startSlot,
            int durationMinutes) {
        if (startSlot == null || startSlot.getMinute() % 30 != 0 || startSlot.getSecond() != 0 || startSlot.getNano() != 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_START_TIME",
                    "Giờ bắt đầu thuê sân phải theo mốc 30 phút (ví dụ: hh:00 hoặc hh:30).");
        }

        if (durationMinutes % 30 != 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_DURATION",
                    "Thời lượng thuê sân phải là bội số của 30 phút.");
        }

        int minDuration = (config.getMinDurationMinutes() != null) ? config.getMinDurationMinutes() : 60;
        int maxDuration = (config.getMaxDurationMinutes() != null) ? config.getMaxDurationMinutes() : 720;
        if (durationMinutes < minDuration || durationMinutes > maxDuration) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "DURATION_OUT_OF_RANGE",
                    "Thời lượng thuê sân phải từ " + minDuration + " phút đến " + maxDuration + " phút.");
        }

        LocalTime open = config.getOpenTime();
        LocalTime close = config.getCloseTime();
        LocalDateTime endDateTime = LocalDateTime.of(bookingDate, startSlot).plusMinutes(durationMinutes);
        if (!endDateTime.toLocalDate().equals(bookingDate)) {
            throw new LoiNghiepVu(HttpStatus.UNPROCESSABLE_ENTITY, "BOOKING_TIME_INVALID",
                    "Khung giờ đặt sân không được kéo dài sang ngày hôm sau.");
        }
        LocalTime endSlot = endDateTime.toLocalTime();

        if (startSlot.isBefore(open) || endSlot.isAfter(close)) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "OUT_OF_OPERATING_HOURS",
                    "Khung giờ thuê vượt quá thời gian mở cửa hoạt động của sân.");
        }
    }

    public String tinhHashPayload(YeuCauDatSan req) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            int duration = (req.getDurationMinutes() != null && req.getDurationMinutes() > 0)
                    ? req.getDurationMinutes()
                    : (req.getSlotCount() != null ? req.getSlotCount() * 60 : 60);
            String voucher = req.getVoucherCode() != null ? req.getVoucherCode().trim().toUpperCase() : "";
            String data = req.getCourtId() + "_" + req.getBookingDate() + "_" + req.getStartSlot() + "_" + duration + "_" + voucher;
            byte[] encoded = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : encoded) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(req.hashCode());
        }
    }
}
