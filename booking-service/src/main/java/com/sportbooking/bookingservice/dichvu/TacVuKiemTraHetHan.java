/**
 * File: TacVuKiemTraHetHan.java
 * Muc dich: Tac vu chay ngam dinh ky (@Scheduled) tu dong xu ly het han va hoan tat don dat san.
 * Chuc nang: Chuyen don PENDING_PAYMENT qua 10 phut sang EXPIRED va giai phong lock; chuyen CONFIRMED da qua gio choi sang COMPLETED.
 */
package com.sportbooking.bookingservice.dichvu;

import com.sportbooking.bookingservice.baomat.CheckinSecurityUtil;
import com.sportbooking.bookingservice.dulieu.TraVeCauHinhSanNoiBo;
import com.sportbooking.bookingservice.khodulieu.KhoDonDatSan;
import com.sportbooking.bookingservice.khodulieu.KhoKhoaKhungGio;
import com.sportbooking.bookingservice.thucthe.DonDatSan;
import com.sportbooking.bookingservice.thucthe.TrangThaiDonDat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class TacVuKiemTraHetHan {

    private final KhoDonDatSan khoDonDatSan;
    private final KhoKhoaKhungGio khoKhoaKhungGio;
    private final DichVuGoiThanhToanNoiBo dichVuGoiThanhToanNoiBo;
    private final DichVuGoiThongBaoNoiBo dichVuGoiThongBaoNoiBo;
    private final DichVuGoiSanNoiBo dichVuGoiSanNoiBo;

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private final Set<Long> daNhacLich5h = ConcurrentHashMap.newKeySet();

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

        // 2. Quet cac don CONFIRMED hoac CHECKED_IN ma gio choi da ket thuc -> chuyen sang COMPLETED & gui thong bao
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
                daNhacLich5h.remove(booking.getId());
                try {
                    dichVuGoiThongBaoNoiBo.guiThongBao(
                            booking.getCustomerId(),
                            "Hoàn tất ca thi đấu đơn đặt #" + booking.getId(),
                            "Ca thi đấu ngày " + booking.getBookingDate() + " (" + booking.getStartSlot() + " - " + booking.getEndSlot() + ") của bạn đã hoàn tất. Cảm ơn bạn đã sử dụng dịch vụ tại ESportKing!",
                            "BOOKING_COMPLETED",
                            booking.getId());
                } catch (Exception ex) {
                    log.warn("Khong the gui thong bao hoan tat cho bookingId={}: {}", booking.getId(), ex.getMessage());
                }
            }
        }

        // 3. Quet cac don CONFIRMED sap toi gio choi trong vong 5 tieng -> gui thong bao + Email nhac lich
        List<DonDatSan> upcomingConfirmed = khoDonDatSan.findByStatusAndBookingDateLessThanEqual(
                TrangThaiDonDat.CONFIRMED, today.plusDays(1));
        for (DonDatSan booking : upcomingConfirmed) {
            if (daNhacLich5h.contains(booking.getId())) continue;

            LocalDateTime startDt = LocalDateTime.of(booking.getBookingDate(), booking.getStartSlot());
            Instant startInstant = startDt.atZone(ZONE_VN).toInstant();
            long minutesUntilStart = Duration.between(now, startInstant).toMinutes();

            if (minutesUntilStart > 0 && minutesUntilStart <= 300) {
                guiNhacLichTruoc5Tieng(booking, minutesUntilStart);
                daNhacLich5h.add(booking.getId());
            }
        }
    }

    private void guiNhacLichTruoc5Tieng(DonDatSan booking, long minutesUntilStart) {
        try {
            TraVeCauHinhSanNoiBo config = null;
            try {
                config = dichVuGoiSanNoiBo.layCauHinhSan(booking.getCourtId(), booking.getBookingDate());
            } catch (Exception ignored) {}

            Long venueId = (config != null && config.getVenueId() != null) ? config.getVenueId() : 1L;
            String tenCoSo = com.sportbooking.bookingservice.cauhinh.ThongTinCoSoUtil.tenCoSo(venueId);
            String diaChi = com.sportbooking.bookingservice.cauhinh.ThongTinCoSoUtil.diaChiCoSo(venueId);
            String mapsUrl = com.sportbooking.bookingservice.cauhinh.ThongTinCoSoUtil.googleMapsUrl(venueId);
            String tenSan = (config != null && config.getCourtName() != null) ? config.getCourtName() : ("Sân #" + booking.getCourtId());
            String khungGio = booking.getBookingDate() + " • " + booking.getStartSlot() + " - " + booking.getEndSlot();
            String checkinToken = CheckinSecurityUtil.taoMaCheckin(booking.getId(), booking.getCustomerId(), booking.getBookingDate());

            long gioConLai = Math.max(1, (minutesUntilStart + 59) / 60);
            String title = "Nhắc lịch thi đấu đơn #" + booking.getId() + " (còn ~" + gioConLai + " giờ)";
            String msg = "Bạn có lịch thi đấu tại " + tenSan + " (" + tenCoSo + ") vào " + khungGio
                    + ". Vui lòng đến sớm 10 phút và xuất trình mã QR Check-in tại quầy trực ban.";

            dichVuGoiThongBaoNoiBo.guiThongBaoKemEmail(
                    booking.getCustomerId(),
                    title,
                    msg,
                    "BOOKING_REMINDER_5H",
                    booking.getId(),
                    checkinToken,
                    tenSan,
                    khungGio,
                    tenCoSo,
                    diaChi,
                    mapsUrl);
            log.info("[REMINDER 5H] Da gui nhac lich cho don #{} (con {} phut)", booking.getId(), minutesUntilStart);
        } catch (Exception ex) {
            log.warn("[REMINDER 5H] Loi gui nhac lich cho don #{}: {}", booking.getId(), ex.getMessage());
        }
    }
}
