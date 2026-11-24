package com.sportbooking.paymentservice.dichvu;

import com.sportbooking.paymentservice.dulieu.*;
import com.sportbooking.paymentservice.khodulieu.KhoGiaoDichThanhToan;
import com.sportbooking.paymentservice.khodulieu.KhoGiaoDichVi;
import com.sportbooking.paymentservice.khodulieu.KhoThongTinVi;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import com.sportbooking.paymentservice.thucthe.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuVi {

    private final KhoThongTinVi khoThongTinVi;
    private final KhoGiaoDichVi khoGiaoDichVi;
    private final KhoGiaoDichThanhToan khoGiaoDichThanhToan;
    private final DichVuGoiDatSanNoiBo dichVuGoiDatSanNoiBo;
    private final DichVuGoiThongBaoNoiBo dichVuGoiThongBaoNoiBo;

    // So du mac dinh khoi tao cho tai khoan trai nghiem
    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("1000000");

    @Transactional
    public ThongTinVi layHoacTaoVi(Long userId) {
        return khoThongTinVi.findByUserId(userId).orElseGet(() -> {
            int inserted = khoThongTinVi.insertIgnoreWallet(userId, INITIAL_BALANCE);
            ThongTinVi moi = khoThongTinVi.findByUserId(userId)
                    .orElseThrow(() -> new LoiNghiepVu(HttpStatus.INTERNAL_SERVER_ERROR, "WALLET_INIT_FAILED", "Không thể khởi tạo ví cho tài khoản."));
            if (inserted > 0) {
                // Ghi nhan giao dich qua tang khoi tao duy nhat 1 lan
                GiaoDichVi tx = GiaoDichVi.builder()
                        .walletId(moi.getId())
                        .userId(userId)
                        .type(LoaiGiaoDichVi.TOP_UP)
                        .amount(INITIAL_BALANCE)
                        .balanceBefore(BigDecimal.ZERO)
                        .balanceAfter(INITIAL_BALANCE)
                        .description("Tặng số dư trải nghiệm hệ thống SportPay ESportKing")
                        .referenceId("INIT-" + userId)
                        .build();
                khoGiaoDichVi.save(tx);
                log.info("Khoi tao vi moi cho userId={} voi so du khoi diem: {}", userId, INITIAL_BALANCE);
            }
            return moi;
        });
    }

    @Transactional
    public TraVeThongTinVi layChiTietVi(Long userId) {
        ThongTinVi vi = layHoacTaoVi(userId);
        List<TraVeGiaoDichVi> recent = khoGiaoDichVi.findTop10ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(TraVeGiaoDichVi::tuThucThe)
                .collect(Collectors.toList());
        return TraVeThongTinVi.tuThucThe(vi, recent);
    }

    @Transactional
    public TraVeGiaoDichVi rutTien(Long userId, YeuCauRutTien yeuCau) {
        if (yeuCau.getAmount() == null || yeuCau.getAmount().compareTo(new BigDecimal("2000")) <= 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_AMOUNT", "Số tiền rút phải lớn hơn 2.000 VNĐ.");
        }

        // Lock pessimistic de tranh race condition
        ThongTinVi vi = khoThongTinVi.findByUserIdWithLock(userId)
                .orElseGet(() -> layHoacTaoVi(userId));

        if (vi.getBalance().compareTo(yeuCau.getAmount()) < 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE",
                    String.format("Số dư ví không đủ để rút tiền. Hiện có: %,d đ, yêu cầu: %,d đ.",
                            vi.getBalance().longValue(), yeuCau.getAmount().longValue()));
        }

        BigDecimal before = vi.getBalance();
        BigDecimal after = before.subtract(yeuCau.getAmount());
        vi.setBalance(after);
        khoThongTinVi.save(vi);

        String moTa = String.format("Rút tiền về STK %s - %s (%s)",
                yeuCau.getAccountNumber().trim(),
                yeuCau.getBankName().trim(),
                yeuCau.getAccountName().trim().toUpperCase());

        GiaoDichVi tx = GiaoDichVi.builder()
                .walletId(vi.getId())
                .userId(userId)
                .type(LoaiGiaoDichVi.WITHDRAW)
                .amount(yeuCau.getAmount())
                .balanceBefore(before)
                .balanceAfter(after)
                .description(moTa)
                .referenceId("WD-" + System.currentTimeMillis())
                .build();
        tx = khoGiaoDichVi.save(tx);

        // Gui thong bao ve chuong in-app
        String tbTieuDe = "Rút tiền về ngân hàng thành công";
        String tbNoiDung = String.format("Đã chuyển thành công %,d đ vào tài khoản %s - %s (%s). Số dư ví còn lại: %,d đ.",
                yeuCau.getAmount().longValue(),
                yeuCau.getAccountNumber(),
                yeuCau.getBankName(),
                yeuCau.getAccountName(),
                after.longValue());
        dichVuGoiThongBaoNoiBo.guiThongBao(userId, tbTieuDe, tbNoiDung, "WITHDRAW_SUCCESS", String.valueOf(tx.getId()));

        return TraVeGiaoDichVi.tuThucThe(tx);
    }

    @Transactional
    public TraVeGiaoDichVi napTien(Long userId, BigDecimal soTien, String phuongThuc) {
        if (soTien == null || soTien.compareTo(new BigDecimal("10000")) < 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_AMOUNT", "Số tiền nạp tối thiểu là 10.000 VNĐ.");
        }

        ThongTinVi vi = khoThongTinVi.findByUserIdWithLock(userId)
                .orElseGet(() -> layHoacTaoVi(userId));

        BigDecimal before = vi.getBalance();
        BigDecimal after = before.add(soTien);
        vi.setBalance(after);
        khoThongTinVi.save(vi);

        String moTa = "Nạp tiền vào ví qua " + (phuongThuc != null ? phuongThuc : "Chuyển khoản");

        GiaoDichVi tx = GiaoDichVi.builder()
                .walletId(vi.getId())
                .userId(userId)
                .type(LoaiGiaoDichVi.TOP_UP)
                .amount(soTien)
                .balanceBefore(before)
                .balanceAfter(after)
                .description(moTa)
                .referenceId("TOP-" + System.currentTimeMillis())
                .build();
        tx = khoGiaoDichVi.save(tx);

        dichVuGoiThongBaoNoiBo.guiThongBao(userId,
                "Nạp tiền vào Ví ESportKing thành công",
                String.format("Bạn vừa nạp thành công %,d đ vào ví. Số dư hiện tại: %,d đ.", soTien.longValue(), after.longValue()),
                "WALLET_TOPUP",
                String.valueOf(tx.getId()));

        return TraVeGiaoDichVi.tuThucThe(tx);
    }

    @Transactional
    public void hoanTienVaoVi(Long userId, BigDecimal soTien, Long bookingId, String lyDo) {
        if (userId == null || soTien == null || soTien.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        ThongTinVi vi = khoThongTinVi.findByUserIdWithLock(userId)
                .orElseGet(() -> layHoacTaoVi(userId));

        BigDecimal before = vi.getBalance();
        BigDecimal after = before.add(soTien);
        vi.setBalance(after);
        khoThongTinVi.save(vi);

        GiaoDichVi tx = GiaoDichVi.builder()
                .walletId(vi.getId())
                .userId(userId)
                .type(LoaiGiaoDichVi.REFUND)
                .amount(soTien)
                .balanceBefore(before)
                .balanceAfter(after)
                .description(lyDo != null ? lyDo : ("Hoàn tiền đơn đặt #" + bookingId))
                .referenceId("REFUND-" + bookingId)
                .build();
        khoGiaoDichVi.save(tx);
        log.info("Da hoan tien {} vao vi cho userId={} theo bookingId={}", soTien, userId, bookingId);
    }

    @Transactional
    public TraVeGiaoDichThanhToan thanhToanBangVi(Long userId, Long bookingId) {
        // Lay thong tin thanh toan va kiem tra quyen so huu don (chong IDOR)
        GiaoDichThanhToan tx = khoGiaoDichThanhToan.findByBookingId(bookingId)
                .orElseGet(() -> {
                    TraVeThanhToanNoiBo summary = dichVuGoiDatSanNoiBo.layThongTinThanhToan(bookingId);
                    if (summary.getCustomerId() != null && !summary.getCustomerId().equals(userId)) {
                        throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thanh toán đơn đặt sân của người khác.");
                    }
                    String walletRef = "WALLET-" + bookingId + "-" + System.currentTimeMillis();
                    GiaoDichThanhToan moi = GiaoDichThanhToan.builder()
                            .bookingId(bookingId)
                            .customerId(userId)
                            .amount(summary.getTotalAmount())
                            .currency("VND")
                            .method("WALLET")
                            .status(TrangThaiThanhToan.PENDING)
                            .transactionCode("TX-" + walletRef)
                            .currentAttemptReference("ATT-" + walletRef)
                            .build();
                    return khoGiaoDichThanhToan.save(moi);
                });

        if (tx.getCustomerId() != null && !tx.getCustomerId().equals(userId)) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thanh toán đơn đặt sân của người khác.");
        }

        if (tx.getStatus() == TrangThaiThanhToan.SUCCESS) {
            return TraVeGiaoDichThanhToan.tuThucThe(tx);
        }

        // Lock vi cua user
        ThongTinVi vi = khoThongTinVi.findByUserIdWithLock(userId)
                .orElseGet(() -> layHoacTaoVi(userId));

        if (vi.getBalance().compareTo(tx.getAmount()) < 0) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE",
                    String.format("Số dư Ví ESportKing không đủ (Số dư: %,d đ, Cần thanh toán: %,d đ). Vui lòng nạp thêm tiền.",
                            vi.getBalance().longValue(), tx.getAmount().longValue()));
        }

        // Tru tien trong vi
        BigDecimal before = vi.getBalance();
        BigDecimal after = before.subtract(tx.getAmount());
        vi.setBalance(after);
        khoThongTinVi.save(vi);

        // Ghi log giao dich vi
        GiaoDichVi wTx = GiaoDichVi.builder()
                .walletId(vi.getId())
                .userId(userId)
                .type(LoaiGiaoDichVi.PAYMENT)
                .amount(tx.getAmount())
                .balanceBefore(before)
                .balanceAfter(after)
                .description("Thanh toán đơn đặt sân #" + bookingId + " bằng Số dư Ví ESportKing")
                .referenceId("PAY-BOOKING-" + bookingId)
                .build();
        khoGiaoDichVi.save(wTx);

        // Cap nhat giao dich thanh toan sang SUCCESS
        tx.setStatus(TrangThaiThanhToan.SUCCESS);
        tx.setMethod("WALLET");
        tx.setCustomerId(userId);
        tx = khoGiaoDichThanhToan.save(tx);

        // Goi xac nhan sang Booking Service (Booking Service se tu dong gui 1 thong bao PAYMENT_SUCCESS)
        dichVuGoiDatSanNoiBo.xacNhanThanhToan(bookingId, tx.getId(), "WALLET-" + tx.getId(), Instant.now());

        return TraVeGiaoDichThanhToan.tuThucThe(tx);
    }
}
