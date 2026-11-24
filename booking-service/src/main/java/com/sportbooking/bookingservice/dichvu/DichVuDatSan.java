/**
 * File: DichVuDatSan.java
 * Muc dich: Xu ly toan bo nghiep vu tao don dat, khoa slot, chong dat trung, huy don va xac nhan thanh toan.
 * Chuc nang: Giao dich transaction tao DonDatSan + KhoaKhungGio; ho tro Idempotency-Key; giai phong khoa slot khi huy.
 */
package com.sportbooking.bookingservice.dichvu;

import com.sportbooking.bookingservice.dulieu.*;
import com.sportbooking.bookingservice.khodulieu.*;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import com.sportbooking.bookingservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuDatSan {

    private final KhoDonDatSan khoDonDatSan;
    private final KhoKhungGioDat khoKhungGioDat;
    private final KhoDongGiaDat khoDongGiaDat;
    private final KhoKhoaKhungGio khoKhoaKhungGio;
    private final KhoTranhTrungYeuCau khoTranhTrungYeuCau;
    private final KhoMaUuDai khoMaUuDai;
    private final DichVuGoiSanNoiBo dichVuGoiSanNoiBo;
    private final DichVuGoiThanhToanNoiBo dichVuGoiThanhToanNoiBo;
    private final DichVuGoiThongBaoNoiBo dichVuGoiThongBaoNoiBo;
    private final DichVuKhaDung dichVuKhaDung;
    private final TransactionTemplate transactionTemplate;

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    @Transactional
    public TraVeDonDatSan taoDonDat(Long customerId, YeuCauDatSan yeuCau, String idempotencyKey) {
        String payloadHash = tinhHashPayload(yeuCau);

        // 1. Kiem tra Idempotency Key neu co
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<TranhTrungYeuCau> trungLap = khoTranhTrungYeuCau.findByCustomerIdAndIdempotencyKey(customerId, idempotencyKey.trim());
            if (trungLap.isPresent()) {
                TranhTrungYeuCau idemp = trungLap.get();
                if (!idemp.getRequestHash().equals(payloadHash)) {
                    throw new LoiNghiepVu(HttpStatus.CONFLICT, "IDEMPOTENCY_KEY_REUSED", "Khóa Idempotency đã được sử dụng cho một yêu cầu khác.");
                }
                // Tra lai booking cu
                return layChiTietDonDat(idemp.getBookingId(), customerId, "CUSTOMER");
            }
        }

        // 2. Kiem tra thoi gian dat phai truoc gio bat dau it nhat 15 phut
        LocalDateTime slotStartDt = LocalDateTime.of(yeuCau.getBookingDate(), yeuCau.getStartSlot());
        Instant slotStartInstant = slotStartDt.atZone(ZONE_VN).toInstant();
        if (slotStartInstant.isBefore(Instant.now().plus(Duration.ofMinutes(15)))) {
            throw new LoiNghiepVu(HttpStatus.UNPROCESSABLE_ENTITY, "BOOKING_TIME_INVALID", "Thời gian đặt sân phải trước giờ bắt đầu thi đấu ít nhất 15 phút.");
        }

        // 3. Lay cau hinh san tu Court Service
        TraVeCauHinhSanNoiBo config = dichVuGoiSanNoiBo.layCauHinhSan(yeuCau.getCourtId(), yeuCau.getBookingDate());
        if (!"ACTIVE".equals(config.getCourtStatus()) || !"ACTIVE".equals(config.getVenueStatus())) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "COURT_NOT_AVAILABLE", "Sân hoặc cụm sân hiện đang tạm ngưng hoạt động.");
        }

        // 4. Kiem tra thoi luong va gio hoat dong
        int durationMinutes = (yeuCau.getDurationMinutes() != null && yeuCau.getDurationMinutes() > 0)
                ? yeuCau.getDurationMinutes()
                : (yeuCau.getSlotCount() != null ? yeuCau.getSlotCount() * 60 : 60);

        LocalTime startSlot = yeuCau.getStartSlot();
        kiemTraThoiLuongVaGioHoatDong(config, yeuCau.getBookingDate(), startSlot, durationMinutes);

        LocalTime endSlot = startSlot.plusMinutes(durationMinutes);
        int numBlocks = durationMinutes / 30;

        // 5. Kiem tra truoc xem co block 30 phut nao da bi khoa trong DB chua (lazy check)
        for (int i = 0; i < numBlocks; i++) {
            LocalTime s = startSlot.plusMinutes(i * 30L);
            if (khoKhoaKhungGio.existsByCourtIdAndBookingDateAndSlotStart(yeuCau.getCourtId(), yeuCau.getBookingDate(), s)) {
                throw new LoiNghiepVu(HttpStatus.CONFLICT, "SLOT_UNAVAILABLE", "Khung giờ " + s + " đã có người khác đặt trước.");
            }
        }

        // 6. Tinh tong tien va chuan bi du lieu block 30 phut
        BigDecimal tongTien = BigDecimal.ZERO;
        List<DongGiaDat> priceLines = new ArrayList<>();
        List<KhungGioDat> slots = new ArrayList<>();
        List<TraVeDonDatSan.KhungGioChiTiet> slotDetails = new ArrayList<>();

        for (int i = 0; i < numBlocks; i++) {
            LocalTime sStart = startSlot.plusMinutes(i * 30L);
            LocalTime sEnd = sStart.plusMinutes(30L);
            BigDecimal hourlyPrice = dichVuKhaDung.tinhGiaSlot(config, sStart);
            BigDecimal blockPrice = hourlyPrice.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
            tongTien = tongTien.add(blockPrice);

            priceLines.add(DongGiaDat.builder()
                    .slotStart(sStart)
                    .unitPrice(blockPrice)
                    .quantity(1)
                    .lineAmount(blockPrice)
                    .currency("VND")
                    .build());

            slots.add(KhungGioDat.builder()
                    .slotStart(sStart)
                    .slotEnd(sEnd)
                    .build());

            slotDetails.add(TraVeDonDatSan.KhungGioChiTiet.builder()
                    .start(sStart)
                    .end(sEnd)
                    .unitPrice(blockPrice)
                    .build());
        }

        // 6. Cong tien dich vu kem theo (Addon Services) neu co
        BigDecimal tienDichVu = (yeuCau.getAddonAmount() != null && yeuCau.getAddonAmount().compareTo(BigDecimal.ZERO) > 0)
                ? yeuCau.getAddonAmount()
                : BigDecimal.ZERO;
        tongTien = tongTien.add(tienDichVu);

        // 6.1. Xu ly ma uu dai giam gia (Voucher) neu co bang ham dung chung
        BigDecimal giamGia = BigDecimal.ZERO;
        if (yeuCau.getVoucherCode() != null && !yeuCau.getVoucherCode().trim().isEmpty()) {
            Optional<MaUuDai> voucherOpt = khoMaUuDai.findByCodeIgnoreCaseAndActiveTrue(yeuCau.getVoucherCode().trim());
            if (voucherOpt.isPresent()) {
                giamGia = tinhTienGiamVoucher(voucherOpt.get(), tongTien);
                tongTien = tongTien.subtract(giamGia).max(BigDecimal.ZERO);
            }
        }

        // 7. Luu DonDatSan (Hold 10 phut cho thanh toan)
        Instant expiredAt = Instant.now().plus(Duration.ofMinutes(10));
        DonDatSan booking = DonDatSan.builder()
                .customerId(customerId)
                .courtId(yeuCau.getCourtId())
                .bookingDate(yeuCau.getBookingDate())
                .startSlot(yeuCau.getStartSlot())
                .endSlot(endSlot)
                .totalAmount(tongTien)
                .currency("VND")
                .status(TrangThaiDonDat.PENDING_PAYMENT)
                .expiredAt(expiredAt)
                .build();

        booking = khoDonDatSan.save(booking);
        Long bookingId = booking.getId();

        // 8. Luu cac slot va dong gia
        for (KhungGioDat s : slots) {
            s.setBookingId(bookingId);
            khoKhungGioDat.save(s);
        }
        for (DongGiaDat p : priceLines) {
            p.setBookingId(bookingId);
            khoDongGiaDat.save(p);
        }

        // 9. Tao ActiveSlotLock cho tung block 30 phut (KHOA SLOT)
        for (int i = 0; i < numBlocks; i++) {
            LocalTime sStart = startSlot.plusMinutes(i * 30L);
            KhoaKhungGio lock = KhoaKhungGio.builder()
                    .bookingId(bookingId)
                    .courtId(yeuCau.getCourtId())
                    .bookingDate(yeuCau.getBookingDate())
                    .slotStart(sStart)
                    .build();
            khoKhoaKhungGio.save(lock);
        }

        // 10. Luu Idempotency Key neu co
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            TranhTrungYeuCau idemp = TranhTrungYeuCau.builder()
                    .customerId(customerId)
                    .idempotencyKey(idempotencyKey.trim())
                    .requestHash(payloadHash)
                    .bookingId(bookingId)
                    .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                    .build();
            khoTranhTrungYeuCau.save(idemp);
        }

        // 11. Gui thong bao dat san thanh cong (dang cho thanh toan)
        dichVuGoiThongBaoNoiBo.guiThongBao(customerId,
                "Tạo đơn đặt sân #" + bookingId + " thành công",
                "Đơn đặt sân ngày " + yeuCau.getBookingDate() + " từ " + startSlot + " đến " + endSlot + " (" + durationMinutes + " phút) đang chờ thanh toán trong 10 phút.",
                "BOOKING_CREATED",
                bookingId);

        return TraVeDonDatSan.tuThucThe(booking, slotDetails, config.getCourtName(), config.getVenueId(), config.getVenueName());
    }

    @Transactional(readOnly = true)
    public TraVeDonDatSan layChiTietDonDat(Long bookingId, Long userId, String userRole) {
        DonDatSan booking = khoDonDatSan.findById(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy thông tin đơn đặt sân."));

        if (!"ADMIN".equals(userRole) && !booking.getCustomerId().equals(userId)) {
            if ("OWNER".equals(userRole)) {
                TraVeCauHinhSanNoiBo config = dichVuGoiSanNoiBo.layCauHinhSan(booking.getCourtId(), booking.getBookingDate());
                if (config.getOwnerId() == null || !config.getOwnerId().equals(userId)) {
                    throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem thông tin đơn đặt sân này.");
                }
            } else {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem thông tin đơn đặt sân này.");
            }
        }

        List<TraVeDonDatSan.KhungGioChiTiet> slots = khoKhungGioDat.findByBookingId(bookingId).stream()
                .map(s -> TraVeDonDatSan.KhungGioChiTiet.builder().start(s.getSlotStart()).end(s.getSlotEnd()).build())
                .collect(Collectors.toList());

        String courtName = null;
        Long venueId = null;
        String venueName = null;
        try {
            var cfg = dichVuGoiSanNoiBo.layCauHinhSan(booking.getCourtId(), booking.getBookingDate());
            if (cfg != null) {
                courtName = cfg.getCourtName();
                venueId = cfg.getVenueId();
                venueName = cfg.getVenueName();
            }
        } catch (Exception ignored) {}

        return TraVeDonDatSan.tuThucThe(booking, slots, courtName, venueId, venueName);
    }

    @Transactional(readOnly = true)
    public TraVeDonDatSan xacMinhCheckIn(Long bookingId, Long customerId, Long requesterId, String requesterRole) {
        DonDatSan booking = khoDonDatSan.findById(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy thông tin đơn đặt sân."));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "Mã check-in không trùng khớp với khách hàng của đơn đặt.");
        }

        if (booking.getStatus() != TrangThaiDonDat.CONFIRMED) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_CHECKIN_READY", "Chỉ đơn đặt sân đã hoàn tất thanh toán mới đủ điều kiện check-in.");
        }

        // Kiem tra thoi gian check-in tai san: chi cho phep vao dung ngay choi va trong khung gio hop le
        // Neu la ADMIN hoac STAFF truc ban tai san, cho phep check-in linh hoat de phuc vu le tan ho tro khach & demo he thong
        boolean isStaffOrAdmin = "ADMIN".equals(requesterRole) || "STAFF".equals(requesterRole);
        LocalDate homNay = LocalDate.now(ZONE_VN);
        if (!isStaffOrAdmin) {
            if (booking.getBookingDate().isAfter(homNay)) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "CHECKIN_TOO_EARLY", "Chưa đến ngày đặt sân thi đấu (Ngày đặt: " + booking.getBookingDate() + ").");
            }
            if (booking.getBookingDate().isBefore(homNay)) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "CHECKIN_EXPIRED", "Đơn đặt sân đã quá ngày sử dụng (Ngày đặt: " + booking.getBookingDate() + ").");
            }

            LocalTime gioHienTai = LocalTime.now(ZONE_VN);
            if (gioHienTai.isBefore(booking.getStartSlot().minusMinutes(60))) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "CHECKIN_TOO_EARLY", "Chỉ được check-in trước giờ bắt đầu tối đa 60 phút (Giờ bắt đầu: " + booking.getStartSlot() + ").");
            }
            if (gioHienTai.isAfter(booking.getEndSlot())) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "CHECKIN_EXPIRED", "Khung giờ đặt sân đã kết thúc lúc " + booking.getEndSlot() + ". Vui lòng liên hệ quầy tiếp tân.");
            }
        }

        if ("ADMIN".equals(requesterRole) || "STAFF".equals(requesterRole)) {
            // Admin va Staff he thong co quyen xac minh check-in tai quay
        } else if ("OWNER".equals(requesterRole)) {
            TraVeCauHinhSanNoiBo config = dichVuGoiSanNoiBo.layCauHinhSan(booking.getCourtId(), booking.getBookingDate());
            if (config.getOwnerId() == null || !config.getOwnerId().equals(requesterId)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu của cụm sân này.");
            }
        } else if ("CUSTOMER".equals(requesterRole)) {
            if (!requesterId.equals(customerId)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xác minh mã check-in của đơn đặt này.");
            }
        } else {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Vai trò người dùng không hợp lệ để thực hiện check-in.");
        }

        List<TraVeDonDatSan.KhungGioChiTiet> slots = khoKhungGioDat.findByBookingId(bookingId).stream()
                .map(s -> TraVeDonDatSan.KhungGioChiTiet.builder().start(s.getSlotStart()).end(s.getSlotEnd()).build())
                .collect(Collectors.toList());

        String courtName = null;
        Long venueId = null;
        String venueName = null;
        try {
            var cfg = dichVuGoiSanNoiBo.layCauHinhSan(booking.getCourtId(), booking.getBookingDate());
            if (cfg != null) {
                courtName = cfg.getCourtName();
                venueId = cfg.getVenueId();
                venueName = cfg.getVenueName();
            }
        } catch (Exception ignored) {}

        return TraVeDonDatSan.tuThucThe(booking, slots, courtName, venueId, venueName);
    }

    @Transactional(readOnly = true)
    public Page<TraVeDonDatSan> layDonDatCuaKhach(Long customerId, Pageable pageable) {
        return khoDonDatSan.findByCustomerId(customerId, pageable)
                .map(b -> {
                    List<TraVeDonDatSan.KhungGioChiTiet> slots = khoKhungGioDat.findByBookingId(b.getId()).stream()
                            .map(s -> TraVeDonDatSan.KhungGioChiTiet.builder().start(s.getSlotStart()).end(s.getSlotEnd()).build())
                            .collect(Collectors.toList());
                    String courtName = null;
                    Long venueId = null;
                    String venueName = null;
                    try {
                        var cfg = dichVuGoiSanNoiBo.layCauHinhSan(b.getCourtId(), b.getBookingDate());
                        if (cfg != null) {
                            courtName = cfg.getCourtName();
                            venueId = cfg.getVenueId();
                            venueName = cfg.getVenueName();
                        }
                    } catch (Exception ignored) {}
                    return TraVeDonDatSan.tuThucThe(b, slots, courtName, venueId, venueName);
                });
    }

    @Transactional
    public TraVeDonDatSan huyDonDat(Long bookingId, Long userId, String userRole) {
        DonDatSan booking = khoDonDatSan.findById(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy thông tin đơn đặt sân."));

        if (!"ADMIN".equals(userRole) && !booking.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền hủy đơn đặt sân này.");
        }

        if (booking.getStatus() != TrangThaiDonDat.PENDING_PAYMENT && booking.getStatus() != TrangThaiDonDat.CONFIRMED) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_CANCELLABLE", "Đơn đặt sân không ở trạng thái có thể hủy.");
        }

        // Neu da CONFIRMED, kiem tra gio choi da bat dau chua
        if (booking.getStatus() == TrangThaiDonDat.CONFIRMED) {
            LocalDateTime startDt = LocalDateTime.of(booking.getBookingDate(), booking.getStartSlot());
            if (startDt.atZone(ZONE_VN).toInstant().isBefore(Instant.now())) {
                throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_ALREADY_STARTED", "Giờ thi đấu đã bắt đầu, không thể thực hiện hủy sân.");
            }
        }

        boolean wasPending = (booking.getStatus() == TrangThaiDonDat.PENDING_PAYMENT);
        boolean wasConfirmed = (booking.getStatus() == TrangThaiDonDat.CONFIRMED);

        if (wasConfirmed) {
            LocalDateTime startDt = LocalDateTime.of(booking.getBookingDate(), booking.getStartSlot());
            Instant startInstant = startDt.atZone(ZONE_VN).toInstant();
            Instant now = Instant.now();

            if (!now.isBefore(startInstant)) {
                throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_ALREADY_STARTED", "Giờ thi đấu đã bắt đầu, không thể thực hiện hủy sân.");
            }

            // Quy chuẩn thực tế (Time-window Policy):
            // - Trước >= 24 giờ: Hoàn 100%
            // - Từ 12 giờ đến 24 giờ: Hoàn 50%
            // - Dưới 12 giờ hoặc đã qua giờ bắt đầu (No-show): Hoàn 0%
            long minutesUntilStart = Duration.between(now, startInstant).toMinutes();
            boolean hoan100 = minutesUntilStart >= 24 * 60;
            boolean hoan50 = !hoan100 && minutesUntilStart >= 12 * 60;

            if (hoan100 || hoan50) {
                BigDecimal tiLeHoan = hoan100 ? BigDecimal.ONE : new BigDecimal("0.50");
                BigDecimal soTienHoan = booking.getTotalAmount().multiply(tiLeHoan).setScale(0, java.math.RoundingMode.HALF_UP);
                String moTaTiLe = hoan100 ? "100%" : "50%";
                String lyDoHoan = hoan100 ? "Hủy đơn trước >= 24 giờ (hoàn 100%)" : "Hủy đơn từ 12-24 giờ (hoàn 50%)";

                booking.setStatus(TrangThaiDonDat.REFUND_PENDING);
                booking = khoDonDatSan.save(booking);

                // Goi sang payment service thuc hien refund vao Vi ESportKing
                boolean hoanTienOk = dichVuGoiThanhToanNoiBo.yeuCauHoanTien(bookingId, soTienHoan, lyDoHoan);
                if (hoanTienOk) {
                    booking.setStatus(TrangThaiDonDat.CANCELLED_REFUNDED);
                    String thongBaoMsg = String.format("Đơn đặt sân #%d đã được hủy thành công. Số tiền hoàn %s (%,d đ) đã được cộng thẳng vào Ví ESportKing của bạn.",
                            bookingId, moTaTiLe, soTienHoan.longValue());
                    dichVuGoiThongBaoNoiBo.guiThongBao(booking.getCustomerId(),
                            "Hủy đơn đặt sân #" + bookingId + " & Hoàn tiền (" + moTaTiLe + ")",
                            thongBaoMsg,
                            "BOOKING_REFUNDED",
                            bookingId);
                } else {
                    // Payment that bai -> giu o REFUND_PENDING de he thong doi soat/reconcile xu ly tiep
                    log.error("Goi hoan tien payment that bai cho bookingId={}, giu REFUND_PENDING", bookingId);
                }
            } else {
                // Duoi 12 gio: Hoan 0% (Huy sat gio - phi giu cho 100%)
                booking.setStatus(TrangThaiDonDat.CANCELLED);
                String thongBaoMsg = String.format("Đơn đặt sân #%d đã được hủy thành công. Do thời gian hủy dưới 12 giờ trước giờ thi đấu, đơn không đủ điều kiện hoàn tiền theo quy định.",
                        bookingId);
                dichVuGoiThongBaoNoiBo.guiThongBao(booking.getCustomerId(),
                        "Hủy đơn đặt sân #" + bookingId + " (Không hoàn tiền)",
                        thongBaoMsg,
                        "BOOKING_CANCELLED",
                        bookingId);
            }
        } else {
            booking.setStatus(TrangThaiDonDat.CANCELLED);
        }

        booking = khoDonDatSan.save(booking);

        // Giai phong khoa khung gio ngay lap tuc
        khoKhoaKhungGio.deleteByBookingId(bookingId);

        // Neu dang pending payment, thong bao Payment Service danh dau REJECTED_EXPIRED
        if (wasPending) {
            dichVuGoiThanhToanNoiBo.tuChoiThanhToan(bookingId, "CANCELLED");
        }

        return layChiTietDonDat(bookingId, userId, userRole);
    }

    @Transactional(readOnly = true)
    public TraVeThanhToanNoiBo layThongTinThanhToanNoiBo(Long bookingId) {
        DonDatSan booking = khoDonDatSan.findById(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt sân."));

        return TraVeThanhToanNoiBo.builder()
                .bookingId(booking.getId())
                .customerId(booking.getCustomerId())
                .courtId(booking.getCourtId())
                .status(booking.getStatus().name())
                .expiredAt(booking.getExpiredAt())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .build();
    }

    public void xacNhanThanhToanNoiBo(Long bookingId, YeuCauXacNhanThanhToan yeuCau) {
        DonDatSan booking = khoDonDatSan.findById(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt sân."));

        // Idempotent: Neu da CONFIRMED roi thi tra thanh cong luon
        if (booking.getStatus() == TrangThaiDonDat.CONFIRMED) {
            log.info("Don dat {} da duoc xac nhan truoc do (idempotent callback)", bookingId);
            return;
        }

        if (booking.getStatus() != TrangThaiDonDat.PENDING_PAYMENT) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_PAYABLE", "Đơn đặt không ở trạng thái có thể thanh toán (trạng thái: " + booking.getStatus() + ").");
        }

        if (booking.getExpiredAt().isBefore(Instant.now())) {
            // Qua han: ghi nhan EXPIRED va xoa lock trong transaction rieng de khong bi rollback
            transactionTemplate.execute(status -> {
                DonDatSan b = khoDonDatSan.findById(bookingId).orElse(null);
                if (b != null && b.getStatus() == TrangThaiDonDat.PENDING_PAYMENT) {
                    b.setStatus(TrangThaiDonDat.EXPIRED);
                    khoDonDatSan.save(b);
                    khoKhoaKhungGio.deleteByBookingId(bookingId);
                }
                return null;
            });
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_PAYABLE", "Don dat da qua thoi gian thanh toan");
        }

        // Xac nhan thanh cong trong transaction co dieu kien trang thai
        Boolean capNhatOk = transactionTemplate.execute(status -> {
            DonDatSan b = khoDonDatSan.findById(bookingId).orElse(null);
            if (b != null && b.getStatus() == TrangThaiDonDat.PENDING_PAYMENT) {
                b.setStatus(TrangThaiDonDat.CONFIRMED);
                khoDonDatSan.save(b);
                return true;
            }
            return false;
        });

        if (Boolean.TRUE.equals(capNhatOk)) {
            log.info("Xac nhan thanh toan thanh cong cho don dat {} voi paymentId {}", bookingId, yeuCau.getPaymentId());
            // Gui thong bao da xac nhan thanh toan sau khi da commit thanh cong vao DB
            dichVuGoiThongBaoNoiBo.guiThongBao(booking.getCustomerId(),
                    "Thanh toán thành công đơn đặt #" + bookingId,
                    "Đơn đặt sân ngày " + booking.getBookingDate() + " từ " + booking.getStartSlot() + " đến " + booking.getEndSlot() + " đã được xác nhận thanh toán thành công.",
                    "PAYMENT_SUCCESS",
                    bookingId);
        } else {
            log.warn("Don dat {} khong con o trang thai PENDING_PAYMENT, bo qua xac nhan", bookingId);
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_PAYABLE", "Đơn đặt sân không còn ở trạng thái chờ thanh toán.");
        }
    }

    @Transactional(readOnly = true)
    public List<TraVeMaUuDai> layDanhSachUuDai() {
        return khoMaUuDai.findAllByActiveTrue().stream()
                .map(TraVeMaUuDai::tuThucThe)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.sportbooking.bookingservice.dulieu.TraVeBaoGiaDatSan tinhBaoGiaTruoc(YeuCauDatSan yeuCau) {
        if (yeuCau.getCourtId() == null || yeuCau.getBookingDate() == null || yeuCau.getStartSlot() == null) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_PREVIEW_REQUEST", "Thiếu thông tin sân, ngày hoặc giờ bắt đầu.");
        }

        TraVeCauHinhSanNoiBo config = dichVuGoiSanNoiBo.layCauHinhSan(yeuCau.getCourtId(), yeuCau.getBookingDate());

        int durationMinutes = (yeuCau.getDurationMinutes() != null && yeuCau.getDurationMinutes() > 0)
                ? yeuCau.getDurationMinutes()
                : (yeuCau.getSlotCount() != null ? yeuCau.getSlotCount() * 60 : 60);

        LocalTime startSlot = yeuCau.getStartSlot();
        kiemTraThoiLuongVaGioHoatDong(config, yeuCau.getBookingDate(), startSlot, durationMinutes);

        int numBlocks = durationMinutes / 30;

        BigDecimal tongTien = BigDecimal.ZERO;
        List<TraVeDonDatSan.KhungGioChiTiet> slotDetails = new ArrayList<>();

        for (int i = 0; i < numBlocks; i++) {
            LocalTime sStart = startSlot.plusMinutes(i * 30L);
            LocalTime sEnd = sStart.plusMinutes(30L);
            BigDecimal hourlyPrice = dichVuKhaDung.tinhGiaSlot(config, sStart);
            BigDecimal blockPrice = hourlyPrice.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
            tongTien = tongTien.add(blockPrice);

            slotDetails.add(TraVeDonDatSan.KhungGioChiTiet.builder()
                    .start(sStart)
                    .end(sEnd)
                    .unitPrice(blockPrice)
                    .build());
        }

        BigDecimal tienDichVu = (yeuCau.getAddonAmount() != null && yeuCau.getAddonAmount().compareTo(BigDecimal.ZERO) > 0)
                ? yeuCau.getAddonAmount()
                : BigDecimal.ZERO;

        BigDecimal giamGia = BigDecimal.ZERO;
        if (yeuCau.getVoucherCode() != null && !yeuCau.getVoucherCode().trim().isEmpty()) {
            Optional<MaUuDai> voucherOpt = khoMaUuDai.findByCodeIgnoreCaseAndActiveTrue(yeuCau.getVoucherCode().trim());
            if (voucherOpt.isPresent()) {
                giamGia = tinhTienGiamVoucher(voucherOpt.get(), tongTien.add(tienDichVu));
            }
        }

        BigDecimal finalPrice = tongTien.add(tienDichVu).subtract(giamGia).max(BigDecimal.ZERO);
        LocalTime endSlot = startSlot.plusMinutes(durationMinutes);

        return com.sportbooking.bookingservice.dulieu.TraVeBaoGiaDatSan.builder()
                .courtId(yeuCau.getCourtId())
                .courtName(config.getCourtName())
                .venueId(config.getVenueId())
                .venueName(config.getVenueName())
                .bookingDate(yeuCau.getBookingDate())
                .startSlot(startSlot)
                .endSlot(endSlot)
                .durationMinutes(durationMinutes)
                .basePrice(config.getBasePrice())
                .totalCourtPrice(tongTien)
                .addonAmount(tienDichVu)
                .addonSummary(yeuCau.getAddonSummary())
                .voucherCode(yeuCau.getVoucherCode())
                .discountAmount(giamGia)
                .finalAmount(finalPrice)
                .currency("VND")
                .openTime(config.getOpenTime())
                .closeTime(config.getCloseTime())
                .slots(slotDetails)
                .build();
    }

    public BigDecimal tinhTienGiamVoucher(MaUuDai v, BigDecimal tongTien) {
        if (v == null || tongTien == null || tongTien.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (v.getMinOrderAmount() != null && tongTien.compareTo(v.getMinOrderAmount()) < 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal giamGia = BigDecimal.ZERO;
        if (v.getDiscountPercent() != null && v.getDiscountPercent() > 0) {
            BigDecimal phanTram = BigDecimal.valueOf(v.getDiscountPercent()).divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
            giamGia = tongTien.multiply(phanTram).setScale(0, java.math.RoundingMode.HALF_UP);
            if (v.getMaxDiscount() != null && v.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0 && giamGia.compareTo(v.getMaxDiscount()) > 0) {
                giamGia = v.getMaxDiscount();
            }
        } else if (v.getDiscountAmount() != null && v.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            giamGia = v.getDiscountAmount().min(tongTien);
        }
        return giamGia.min(tongTien);
    }

    public void kiemTraThoiLuongVaGioHoatDong(TraVeCauHinhSanNoiBo config, LocalDate bookingDate, LocalTime startSlot, int durationMinutes) {
        if (startSlot == null || startSlot.getMinute() % 30 != 0 || startSlot.getSecond() != 0 || startSlot.getNano() != 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_START_TIME", "Giờ bắt đầu thuê sân phải theo mốc 30 phút (ví dụ: hh:00 hoặc hh:30).");
        }

        if (durationMinutes % 30 != 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_DURATION", "Thời lượng thuê sân phải là bội số của 30 phút.");
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
            throw new LoiNghiepVu(HttpStatus.UNPROCESSABLE_ENTITY, "BOOKING_TIME_INVALID", "Khung giờ đặt sân không được kéo dài sang ngày hôm sau.");
        }
        LocalTime endSlot = endDateTime.toLocalTime();

        if (startSlot.isBefore(open) || endSlot.isAfter(close)) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "OUT_OF_OPERATING_HOURS", "Khung giờ thuê vượt quá thời gian mở cửa hoạt động của sân.");
        }
    }

    private String tinhHashPayload(YeuCauDatSan req) {
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
