/**
 * File: TacVuKiemTraHetHan.java
 * Muc dich: Tac vu chay ngam dinh ky (@Scheduled) tu dong xu ly het han va hoan tat don dat san.
 * Chuc nang: Chuyen don PENDING_PAYMENT qua 10 phut sang EXPIRED va giai phong lock; chuyen CONFIRMED da qua gio choi sang COMPLETED.
 */
package com.sportbooking.bookingservice.dichvu;

import com.sportbooking.bookingservice.khodulieu.KhoDonDatSan;
import com.sportbooking.bookingservice.khodulieu.KhoKhoaKhungGio;
import com.sportbooking.bookingservice.thucthe.DonDatSan;
import com.sportbooking.bookingservice.thucthe.TrangThaiDonDat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TacVuKiemTraHetHan {

    private final KhoDonDatSan khoDonDatSan;
    private final KhoKhoaKhungGio khoKhoaKhungGio;
    private final DichVuGoiThanhToanNoiBo dichVuGoiThanhToanNoiBo;

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    @Scheduled(fixedDelay = 15000) // Chay moi 15 giay
    @Transactional
    public void xuLyDonHetHanVaHoanTat() {
        Instant now = Instant.now();

        // 1. Quet cac don PENDING_PAYMENT da qua expiredAt (10 phut)
        List<DonDatSan> expiredList = khoDonDatSan.findByStatusAndExpiredAtLessThan(TrangThaiDonDat.PENDING_PAYMENT, now);
        for (DonDatSan booking : expiredList) {
            log.info("Don dat {} da het han thanh toan. Chuyen sang EXPIRED va giai phong lock.", booking.getId());
            booking.setStatus(TrangThaiDonDat.EXPIRED);
            khoDonDatSan.save(booking);
            khoKhoaKhungGio.deleteByBookingId(booking.getId());
            dichVuGoiThanhToanNoiBo.tuChoiThanhToan(booking.getId(), "EXPIRED");
        }

        // 2. Quet cac don CONFIRMED hoac CHECKED_IN ma gio choi da ket thuc -> chuyen sang COMPLETED
        LocalDate today = LocalDate.now(ZONE_VN);
        List<DonDatSan> activeList = new java.util.ArrayList<>();
        activeList.addAll(khoDonDatSan.findByStatusAndBookingDateLessThanEqual(TrangThaiDonDat.CONFIRMED, today));
        activeList.addAll(khoDonDatSan.findByStatusAndBookingDateLessThanEqual(TrangThaiDonDat.CHECKED_IN, today));
        for (DonDatSan booking : activeList) {
            LocalDateTime endDt = LocalDateTime.of(booking.getBookingDate(), booking.getEndSlot());
            if (endDt.atZone(ZONE_VN).toInstant().isBefore(now)) {
                log.info("Don dat {} da ket thuc gio choi. Chuyen sang COMPLETED va giai phong khoa slot.", booking.getId());
                booking.setStatus(TrangThaiDonDat.COMPLETED);
                khoDonDatSan.save(booking);
                khoKhoaKhungGio.deleteByBookingId(booking.getId());
            }
        }
    }
}
