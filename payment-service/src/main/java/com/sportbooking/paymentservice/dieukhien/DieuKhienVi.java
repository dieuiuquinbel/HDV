package com.sportbooking.paymentservice.dieukhien;

import com.sportbooking.paymentservice.dichvu.DichVuVi;
import com.sportbooking.paymentservice.dulieu.*;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments/wallet")
@RequiredArgsConstructor
public class DieuKhienVi {

    private final DichVuVi dichVuVi;

    @GetMapping
    public ResponseEntity<TraVeThongTinVi> layThongTinVi(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để xem thông tin ví");
        }

        return ResponseEntity.ok(dichVuVi.layChiTietVi(userId));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TraVeGiaoDichVi> rutTien(
            @Valid @RequestBody YeuCauRutTien yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để rút tiền");
        }

        return ResponseEntity.ok(dichVuVi.rutTien(userId, yeuCau));
    }

    @PostMapping("/topup")
    public ResponseEntity<TraVeGiaoDichVi> napTien(
            @Valid @RequestBody YeuCauNapTienVi yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để nạp tiền");
        }

        return ResponseEntity.ok(dichVuVi.napTien(userId, yeuCau.getAmount(), yeuCau.getMethod()));
    }

    @PostMapping("/pay")
    public ResponseEntity<TraVeGiaoDichThanhToan> thanhToanDon(
            @Valid @RequestBody YeuCauThanhToanVi yeuCau,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để thanh toán bằng ví");
        }

        return ResponseEntity.ok(dichVuVi.thanhToanBangVi(userId, yeuCau.getBookingId()));
    }
}
