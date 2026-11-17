/**
 * File: KiemThuThanhToan.java
 * Muc dich: Kiem thu tu dong (Unit/Integration Test) ve nghiep vu thanh toan gia lap va tinh Idempotent.
 * Chuc nang: Kiem tra mot booking chi co duy nhat 1 payment transaction, thu lai (retry) tang attemptCount.
 */
package com.sportbooking.paymentservice;

import com.sportbooking.paymentservice.dichvu.DichVuGoiDatSanNoiBo;
import com.sportbooking.paymentservice.dichvu.DichVuThanhToan;
import com.sportbooking.paymentservice.dulieu.TraVeGiaoDichThanhToan;
import com.sportbooking.paymentservice.dulieu.TraVeThanhToanNoiBo;
import com.sportbooking.paymentservice.dulieu.YeuCauTaoThanhToan;
import com.sportbooking.paymentservice.thucthe.TrangThaiThanhToan;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
public class KiemThuThanhToan {

    @Autowired
    private DichVuThanhToan dichVuThanhToan;

    @MockBean
    private DichVuGoiDatSanNoiBo dichVuGoiDatSanNoiBo;

    private final Long testBookingId = 9999L + System.currentTimeMillis() % 10000;

    @BeforeEach
    void setupMock() {
        TraVeThanhToanNoiBo mockSummary = new TraVeThanhToanNoiBo();
        mockSummary.setBookingId(testBookingId);
        mockSummary.setCustomerId(500L);
        mockSummary.setStatus("PENDING_PAYMENT");
        mockSummary.setExpiredAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        mockSummary.setTotalAmount(new BigDecimal("200000.00"));
        mockSummary.setCurrency("VND");

        when(dichVuGoiDatSanNoiBo.layThongTinThanhToan(eq(testBookingId))).thenReturn(mockSummary);
        when(dichVuGoiDatSanNoiBo.xacNhanThanhToan(eq(testBookingId), anyLong(), anyString(), any(Instant.class))).thenReturn(true);
    }

    @Test
    @DisplayName("Khoi tao thanh toan Idempotent: Goi 2 lan cung bookingId tra ve dung 1 transaction duy nhat")
    void testTaoThanhToanIdempotent() {
        YeuCauTaoThanhToan req = new YeuCauTaoThanhToan();
        req.setBookingId(testBookingId);

        var res1 = dichVuThanhToan.taoGiaoDich(500L, req);
        var res2 = dichVuThanhToan.taoGiaoDich(500L, req);
        TraVeGiaoDichThanhToan tx1 = res1.getGiaoDich();
        TraVeGiaoDichThanhToan tx2 = res2.getGiaoDich();

        assertTrue(res1.isMoiTao());
        assertFalse(res2.isMoiTao());
        assertNotNull(tx1);
        assertNotNull(tx2);
        assertEquals(tx1.getId(), tx2.getId());
        assertEquals(tx1.getTransactionCode(), tx2.getTransactionCode());
        assertEquals(TrangThaiThanhToan.PENDING, tx1.getStatus());
    }

    @Test
    @DisplayName("Mo phong that bai va thu lai (Retry) tang so lan attemptCount")
    void testThatBaiVaThuLai() {
        Long bookingIdMoi = testBookingId + 1;
        TraVeThanhToanNoiBo mockSummary = new TraVeThanhToanNoiBo();
        mockSummary.setBookingId(bookingIdMoi);
        mockSummary.setCustomerId(500L);
        mockSummary.setStatus("PENDING_PAYMENT");
        mockSummary.setExpiredAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        mockSummary.setTotalAmount(new BigDecimal("150000.00"));
        mockSummary.setCurrency("VND");

        when(dichVuGoiDatSanNoiBo.layThongTinThanhToan(eq(bookingIdMoi))).thenReturn(mockSummary);

        YeuCauTaoThanhToan req = new YeuCauTaoThanhToan();
        req.setBookingId(bookingIdMoi);

        // 1. Tao giao dich
        TraVeGiaoDichThanhToan tx = dichVuThanhToan.taoGiaoDich(500L, req).getGiaoDich();
        assertEquals(1, tx.getAttemptCount());

        // 2. Mo phong that bai
        TraVeGiaoDichThanhToan txFailed = dichVuThanhToan.moPhongThatBai(tx.getId(), 500L);
        assertEquals(TrangThaiThanhToan.FAILED, txFailed.getStatus());

        // 3. Thu lai (Retry)
        TraVeGiaoDichThanhToan txRetry = dichVuThanhToan.thuLaiThanhToan(tx.getId(), 500L);
        assertEquals(TrangThaiThanhToan.PENDING, txRetry.getStatus());
        assertEquals(2, txRetry.getAttemptCount());
        assertNotEquals(tx.getCurrentAttemptReference(), txRetry.getCurrentAttemptReference());
    }
}
