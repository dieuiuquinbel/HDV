/**
 * File: DichVuThanhToan.java
 * Muc dich: Xu ly nghiep vu tao giao dich thanh toan, mo phong thanh cong/that bai va thu lai (retry).
 * Chuc nang: Dam bao 1 booking chi co 1 payment; retry cap nhat conditional update tang attemptCount; ghi nhan audit LanThuThanhToan.
 */
package com.sportbooking.paymentservice.dichvu;

import com.sportbooking.paymentservice.dulieu.*;
import com.sportbooking.paymentservice.khodulieu.*;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import com.sportbooking.paymentservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuThanhToan {

    private final KhoGiaoDichThanhToan khoGiaoDichThanhToan;
    private final KhoLanThuThanhToan khoLanThuThanhToan;
    private final KhoDoiSoatThanhToan khoDoiSoatThanhToan;
    private final KhoHoanTien khoHoanTien;
    private final DichVuGoiDatSanNoiBo dichVuGoiDatSanNoiBo;
    private final TransactionTemplate transactionTemplate;

    @Transactional
    public KetQuaTaoGiaoDich taoGiaoDich(Long userId, YeuCauTaoThanhToan yeuCau) {
        Long bookingId = yeuCau.getBookingId();

        // 1. Kiem tra xem giao dich cho bookingId nay da ton tai chua (Idempotent theo bookingId)
        Optional<GiaoDichThanhToan> existing = khoGiaoDichThanhToan.findByBookingId(bookingId);
        if (existing.isPresent()) {
            GiaoDichThanhToan tx = existing.get();
            if (!tx.getCustomerId().equals(userId)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ giao dịch thanh toán này.");
            }
            return KetQuaTaoGiaoDich.builder()
                    .giaoDich(TraVeGiaoDichThanhToan.tuThucThe(tx))
                    .isMoiTao(false)
                    .build();
        }

        // 2. Goi Booking Service lay snapshot so tien totalAmount bat bien
        TraVeThanhToanNoiBo bookingInfo = dichVuGoiDatSanNoiBo.layThongTinThanhToan(bookingId);

        if (!bookingInfo.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ đơn đặt sân này.");
        }

        if (!"PENDING_PAYMENT".equals(bookingInfo.getStatus()) || bookingInfo.getExpiredAt().isBefore(Instant.now())) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_PAYABLE", "Đơn đặt không ở trạng thái có thể thanh toán.");
        }

        String transactionCode = "TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String attemptRef = UUID.randomUUID().toString();

        GiaoDichThanhToan tx = GiaoDichThanhToan.builder()
                .bookingId(bookingId)
                .customerId(userId)
                .amount(bookingInfo.getTotalAmount())
                .currency(bookingInfo.getCurrency() != null ? bookingInfo.getCurrency() : "VND")
                .method("SIMULATED")
                .status(TrangThaiThanhToan.PENDING)
                .transactionCode(transactionCode)
                .attemptCount(1)
                .currentAttemptReference(attemptRef)
                .build();

        tx = khoGiaoDichThanhToan.save(tx);

        LanThuThanhToan attempt = LanThuThanhToan.builder()
                .paymentId(tx.getId())
                .attemptNo(1)
                .attemptReference(attemptRef)
                .providerTransactionCode("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(TrangThaiThanhToan.PENDING)
                .requestedAt(Instant.now())
                .build();
        khoLanThuThanhToan.save(attempt);

        return KetQuaTaoGiaoDich.builder()
                .giaoDich(TraVeGiaoDichThanhToan.tuThucThe(tx))
                .isMoiTao(true)
                .build();
    }

    public TraVeGiaoDichThanhToan moPhongThanhCong(Long paymentId, Long userId) {
        GiaoDichThanhToan tx = transactionTemplate.execute(status -> {
            GiaoDichThanhToan lockedTx = khoGiaoDichThanhToan.findByIdWithLock(paymentId)
                    .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán."));

            if (!lockedTx.getCustomerId().equals(userId)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu giao dịch này.");
            }

            if (lockedTx.getStatus() == TrangThaiThanhToan.SUCCESS) {
                return lockedTx;
            }

            if (lockedTx.getStatus() != TrangThaiThanhToan.PENDING) {
                throw new LoiNghiepVu(HttpStatus.CONFLICT, "PAYMENT_NOT_PENDING", "Giao dịch không ở trạng thái chờ thanh toán.");
            }

            // Cap nhat attempt
            khoLanThuThanhToan.findByAttemptReference(lockedTx.getCurrentAttemptReference()).ifPresent(att -> {
                att.setStatus(TrangThaiThanhToan.SUCCESS);
                att.setCompletedAt(Instant.now());
                att.setRawCallbackSummary("Mo phong thanh toan thanh cong");
                khoLanThuThanhToan.save(att);
            });

            // Cap nhat transaction
            lockedTx.setStatus(TrangThaiThanhToan.SUCCESS);
            return khoGiaoDichThanhToan.save(lockedTx);
        });

        if (tx.getStatus() == TrangThaiThanhToan.SUCCESS && "CONFIRMED".equals(tx.getCallbackStatus())) {
            return TraVeGiaoDichThanhToan.tuThucThe(tx);
        }

        // Goi callback xac nhan sang Booking Service (thuc hien ngoai database transaction de tranh block DB lock)
        try {
            boolean success = dichVuGoiDatSanNoiBo.xacNhanThanhToan(tx.getBookingId(), tx.getId(), tx.getCurrentAttemptReference(), Instant.now());
            if (!success) {
                // Booking Service khong phan hoi sau 3 lan retry -> Tao ban ghi Doi Soat trong transaction doc lap
                transactionTemplate.execute(status -> {
                    GiaoDichThanhToan currentTx = khoGiaoDichThanhToan.findById(tx.getId()).orElse(tx);
                    currentTx.setCallbackStatus("RECONCILIATION_REQUIRED");
                    khoGiaoDichThanhToan.save(currentTx);

                    DoiSoatThanhToan ds = DoiSoatThanhToan.builder()
                            .paymentId(currentTx.getId())
                            .status("RECONCILIATION_REQUIRED")
                            .retryCount(3)
                            .lastError("Goi callback sang Booking Service qua thoi gian cho")
                            .build();
                    khoDoiSoatThanhToan.save(ds);
                    return null;
                });
            } else {
                transactionTemplate.execute(status -> {
                    GiaoDichThanhToan currentTx = khoGiaoDichThanhToan.findById(tx.getId()).orElse(tx);
                    currentTx.setCallbackStatus("CONFIRMED");
                    khoGiaoDichThanhToan.save(currentTx);
                    return null;
                });
            }
        } catch (LoiNghiepVu conflictEx) {
            // Booking da het han hoac bi huy -> Ghi nhan REJECTED_EXPIRED trong transaction rieng va commit, khong bi rollback
            transactionTemplate.execute(status -> {
                GiaoDichThanhToan currentTx = khoGiaoDichThanhToan.findById(tx.getId()).orElse(tx);
                currentTx.setStatus(TrangThaiThanhToan.REJECTED_EXPIRED);
                khoGiaoDichThanhToan.save(currentTx);

                khoLanThuThanhToan.findByAttemptReference(currentTx.getCurrentAttemptReference()).ifPresent(att -> {
                    att.setStatus(TrangThaiThanhToan.FAILED);
                    att.setCompletedAt(Instant.now());
                    att.setRawCallbackSummary("Don dat san da het han hoac bi huy: " + conflictEx.getMessage());
                    khoLanThuThanhToan.save(att);
                });
                return null;
            });
            throw conflictEx;
        }

        GiaoDichThanhToan finalTx = khoGiaoDichThanhToan.findById(tx.getId()).orElse(tx);
        return TraVeGiaoDichThanhToan.tuThucThe(finalTx);
    }

    @Transactional
    public TraVeGiaoDichThanhToan moPhongThatBai(Long paymentId, Long userId) {
        GiaoDichThanhToan tx = khoGiaoDichThanhToan.findByIdWithLock(paymentId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán."));

        if (!tx.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu giao dịch này.");
        }

        if (tx.getStatus() != TrangThaiThanhToan.PENDING) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "PAYMENT_NOT_PENDING", "Giao dịch không ở trạng thái chờ thanh toán.");
        }

        khoLanThuThanhToan.findByAttemptReference(tx.getCurrentAttemptReference()).ifPresent(att -> {
            att.setStatus(TrangThaiThanhToan.FAILED);
            att.setCompletedAt(Instant.now());
            att.setRawCallbackSummary("Mo phong thanh toan that bai boi nguoi dung");
            khoLanThuThanhToan.save(att);
        });

        tx.setStatus(TrangThaiThanhToan.FAILED);
        tx = khoGiaoDichThanhToan.save(tx);

        return TraVeGiaoDichThanhToan.tuThucThe(tx);
    }

    public TraVeGiaoDichThanhToan thuLaiThanhToan(Long paymentId, Long userId) {
        GiaoDichThanhToan tx = transactionTemplate.execute(status ->
                khoGiaoDichThanhToan.findByIdWithLock(paymentId)
                        .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán."))
        );

        if (!tx.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải chủ sở hữu giao dịch này.");
        }

        if (tx.getStatus() != TrangThaiThanhToan.FAILED) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "PAYMENT_NOT_RETRYABLE", "Chỉ có thể thử lại khi giao dịch ở trạng thái FAILED.");
        }

        // Kiem tra don dat con hop le khong (goi sang Booking ngoai transaction)
        TraVeThanhToanNoiBo bookingInfo = dichVuGoiDatSanNoiBo.layThongTinThanhToan(tx.getBookingId());
        if (!"PENDING_PAYMENT".equals(bookingInfo.getStatus()) || bookingInfo.getExpiredAt().isBefore(Instant.now())) {
            transactionTemplate.execute(status -> {
                khoGiaoDichThanhToan.findByIdWithLock(tx.getId()).ifPresent(currentTx -> {
                    // Chỉ chuyển sang REJECTED_EXPIRED nếu giao dịch vẫn đang ở trạng thái FAILED (tránh ghi đè nếu luồng khác đã thanh toán SUCCESS)
                    if (currentTx.getStatus() == TrangThaiThanhToan.FAILED) {
                        currentTx.setStatus(TrangThaiThanhToan.REJECTED_EXPIRED);
                        khoGiaoDichThanhToan.save(currentTx);
                    }
                });
                return null;
            });
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_PAYABLE", "Đơn đặt đã hết hạn, không thể thử lại.");
        }

        return transactionTemplate.execute(status -> {
            GiaoDichThanhToan currentTx = khoGiaoDichThanhToan.findByIdWithLock(paymentId)
                    .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán."));

            // Đảm bảo an toàn luồng (Concurrency Safety): Kiểm tra lại trạng thái FAILED ngay trong transaction có lock
            if (currentTx.getStatus() != TrangThaiThanhToan.FAILED) {
                throw new LoiNghiepVu(HttpStatus.CONFLICT, "PAYMENT_NOT_RETRYABLE", "Giao dịch không còn ở trạng thái FAILED, không thể thử lại.");
            }

            int nextAttemptNo = currentTx.getAttemptCount() + 1;
            String nextAttemptRef = UUID.randomUUID().toString();

            currentTx.setAttemptCount(nextAttemptNo);
            currentTx.setCurrentAttemptReference(nextAttemptRef);
            currentTx.setStatus(TrangThaiThanhToan.PENDING);
            currentTx = khoGiaoDichThanhToan.save(currentTx);

            LanThuThanhToan attempt = LanThuThanhToan.builder()
                    .paymentId(currentTx.getId())
                    .attemptNo(nextAttemptNo)
                    .attemptReference(nextAttemptRef)
                    .providerTransactionCode("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .status(TrangThaiThanhToan.PENDING)
                    .requestedAt(Instant.now())
                    .build();
            khoLanThuThanhToan.save(attempt);

            return TraVeGiaoDichThanhToan.tuThucThe(currentTx);
        });
    }

    @Transactional
    public void tuChoiThanhToanNoiBo(Long bookingId, String lyDo) {
        khoGiaoDichThanhToan.findByBookingId(bookingId).ifPresent(tx -> {
            if (tx.getStatus() == TrangThaiThanhToan.PENDING) {
                tx.setStatus(TrangThaiThanhToan.REJECTED_EXPIRED);
                khoGiaoDichThanhToan.save(tx);
                log.info("Danh dau giao dich {} la REJECTED_EXPIRED voi ly do: {}", tx.getId(), lyDo);
            }
        });
    }

    @Transactional
    public void hoanTienNoiBo(Long bookingId, String lyDo) {
        GiaoDichThanhToan tx = khoGiaoDichThanhToan.findByBookingId(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán để hoàn tiền."));

        if (tx.getStatus() == TrangThaiThanhToan.REFUNDED) {
            log.info("Giao dich {} da duoc hoan tien truoc do (idempotent)", tx.getId());
            return;
        }

        tx.setStatus(TrangThaiThanhToan.REFUNDED);
        khoGiaoDichThanhToan.save(tx);

        HoanTien refund = HoanTien.builder()
                .paymentId(tx.getId())
                .bookingId(bookingId)
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .reason(lyDo != null ? lyDo : "Huy don dat truoc 24 gio")
                .build();
        khoHoanTien.save(refund);
        log.info("Da thuc hien hoan tien {} {} cho bookingId {}", tx.getAmount(), tx.getCurrency(), bookingId);
    }

    @Transactional(readOnly = true)
    public TraVeGiaoDichThanhToan layTheoBookingId(Long bookingId, Long userId, String userRole) {
        GiaoDichThanhToan tx = khoGiaoDichThanhToan.findByBookingId(bookingId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Chưa có giao dịch cho đơn đặt sân này."));

        if (!"ADMIN".equals(userRole) && !tx.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem giao dịch thanh toán này.");
        }

        return TraVeGiaoDichThanhToan.tuThucThe(tx);
    }

    @Transactional(readOnly = true)
    public Page<TraVeGiaoDichThanhToan> layDanhSachAdmin(Pageable pageable) {
        return khoGiaoDichThanhToan.findAll(pageable).map(TraVeGiaoDichThanhToan::tuThucThe);
    }

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> tinhBaoCaoDoanhThu(Instant from, Instant to) {
        BigDecimal net = khoGiaoDichThanhToan.tinhTongDoanhThuNet(from, to);
        BigDecimal gross = khoGiaoDichThanhToan.tinhTongDoanhThuGross(from, to);
        BigDecimal refund = khoGiaoDichThanhToan.tinhTongHoanTien(from, to);
        return Map.of(
                "grossRevenue", gross,
                "refundedAmount", refund,
                "netRevenue", net,
                "totalRevenue", net
        );
    }
}
