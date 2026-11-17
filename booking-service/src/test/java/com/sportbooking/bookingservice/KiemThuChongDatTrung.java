/**
 * File: KiemThuChongDatTrung.java
 * Muc dich: Kiem thu tu dong (Automated Unit/Integration Test) ve tinh nang chong dat trung slot va Idempotency.
 * Chuc nang: Kiem tra khong the tao 2 don dat cung mot khung gio (nem 409 SLOT_UNAVAILABLE) va test xu ly dong thoi.
 */
package com.sportbooking.bookingservice;

import com.sportbooking.bookingservice.dichvu.DichVuDatSan;
import com.sportbooking.bookingservice.dichvu.DichVuGoiSanNoiBo;
import com.sportbooking.bookingservice.dichvu.DichVuGoiThongBaoNoiBo;
import com.sportbooking.bookingservice.dichvu.DichVuGoiThanhToanNoiBo;
import com.sportbooking.bookingservice.dichvu.DichVuKhaDung;
import com.sportbooking.bookingservice.dulieu.TraVeCauHinhSanNoiBo;
import com.sportbooking.bookingservice.dulieu.TraVeDonDatSan;
import com.sportbooking.bookingservice.dulieu.YeuCauDatSan;
import com.sportbooking.bookingservice.khodulieu.KhoKhoaKhungGio;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest
public class KiemThuChongDatTrung {

    @Autowired
    private DichVuDatSan dichVuDatSan;

    @Autowired
    private KhoKhoaKhungGio khoKhoaKhungGio;

    @Autowired
    private com.sportbooking.bookingservice.khodulieu.KhoDonDatSan khoDonDatSan;

    @Autowired
    private com.sportbooking.bookingservice.khodulieu.KhoKhungGioDat khoKhungGioDat;

    @Autowired
    private com.sportbooking.bookingservice.khodulieu.KhoDongGiaDat khoDongGiaDat;

    @Autowired
    private com.sportbooking.bookingservice.khodulieu.KhoTranhTrungYeuCau khoTranhTrungYeuCau;

    @MockBean
    private DichVuGoiSanNoiBo dichVuGoiSanNoiBo;

    @MockBean
    private DichVuGoiThongBaoNoiBo dichVuGoiThongBaoNoiBo;

    @MockBean
    private DichVuGoiThanhToanNoiBo dichVuGoiThanhToanNoiBo;

    private final LocalDate ngayThu = LocalDate.now().plusDays(2); // Dat truoc 2 ngay de luon hop le ve thoi gian

    @BeforeEach
    void setupMock() {
        // Don sach cac bang de moi lan test doc lap hoan toan
        khoKhoaKhungGio.deleteAll();
        khoTranhTrungYeuCau.deleteAll();
        khoKhungGioDat.deleteAll();
        khoDongGiaDat.deleteAll();
        khoDonDatSan.deleteAll();

        // Mock cau hinh san con tu Court Service
        TraVeCauHinhSanNoiBo mockConfig = new TraVeCauHinhSanNoiBo();
        mockConfig.setCourtId(1L);
        mockConfig.setCourtName("San Cau Long VIP 1");
        mockConfig.setCourtStatus("ACTIVE");
        mockConfig.setVenueId(1L);
        mockConfig.setVenueStatus("ACTIVE");
        mockConfig.setBasePrice(new BigDecimal("100000.00"));
        mockConfig.setCurrency("VND");
        mockConfig.setOpenTime(LocalTime.of(6, 0));
        mockConfig.setCloseTime(LocalTime.of(22, 0));
        mockConfig.setPriceRules(Collections.emptyList());

        when(dichVuGoiSanNoiBo.layCauHinhSan(eq(1L), any(LocalDate.class))).thenReturn(mockConfig);
    }

    @Test
    @DisplayName("Kiem tra: Dat lan 1 thanh cong, dat lan 2 cung slot phai bi chan 409 SLOT_UNAVAILABLE")
    void testChanDatTrungSlot() {
        YeuCauDatSan req1 = new YeuCauDatSan();
        req1.setCourtId(1L);
        req1.setBookingDate(ngayThu);
        req1.setStartSlot(LocalTime.of(9, 0));
        req1.setSlotCount(1);

        // Lan 1: Dat thanh cong
        TraVeDonDatSan don1 = dichVuDatSan.taoDonDat(100L, req1, "KEY-1");
        assertNotNull(don1);
        assertEquals(LocalTime.of(9, 0), don1.getStartSlot());

        // Lan 2: Khach khac dat cung courtId, ngayThu, 09:00 -> Bat buoc nem loi 409
        YeuCauDatSan req2 = new YeuCauDatSan();
        req2.setCourtId(1L);
        req2.setBookingDate(ngayThu);
        req2.setStartSlot(LocalTime.of(9, 0));
        req2.setSlotCount(1);

        LoiNghiepVu ex = assertThrows(LoiNghiepVu.class, () -> {
            dichVuDatSan.taoDonDat(101L, req2, "KEY-2");
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("SLOT_UNAVAILABLE", ex.getCode());
    }

    @Test
    @DisplayName("Kiem tra: Idempotency Key - Goi lai cung key va payload phai tra ve cung don dat")
    void testIdempotencyKeyLapLai() {
        String key = "IDEMP-" + System.currentTimeMillis();
        YeuCauDatSan req = new YeuCauDatSan();
        req.setCourtId(1L);
        req.setBookingDate(ngayThu);
        req.setStartSlot(LocalTime.of(14, 0));
        req.setSlotCount(1);

        TraVeDonDatSan don1 = dichVuDatSan.taoDonDat(200L, req, key);
        TraVeDonDatSan don2 = dichVuDatSan.taoDonDat(200L, req, key);

        assertEquals(don1.getId(), don2.getId());
        assertEquals(don1.getTotalAmount(), don2.getTotalAmount());
    }

    @Test
    @DisplayName("Kiem tra dong thoi (Concurrent): 2 luong cung dat 1 slot chi co dung 1 luong thang")
    void testDatDongThoi() throws InterruptedException {
        int soLuongYeuCau = 2;
        ExecutorService executor = Executors.newFixedThreadPool(soLuongYeuCau);
        CountDownLatch latch = new CountDownLatch(1);

        AtomicInteger thanhCong = new AtomicInteger(0);
        AtomicInteger biTuChoi = new AtomicInteger(0);

        LocalTime slotThu = LocalTime.of(16, 0);

        for (int i = 0; i < soLuongYeuCau; i++) {
            final long customerId = 300L + i;
            final String idempKey = "CONCURRENT-" + i + "-" + System.currentTimeMillis();
            executor.submit(() -> {
                try {
                    latch.await();
                    YeuCauDatSan req = new YeuCauDatSan();
                    req.setCourtId(1L);
                    req.setBookingDate(ngayThu);
                    req.setStartSlot(slotThu);
                    req.setSlotCount(1);

                    dichVuDatSan.taoDonDat(customerId, req, idempKey);
                    thanhCong.incrementAndGet();
                } catch (Exception e) {
                    biTuChoi.incrementAndGet();
                }
            });
        }

        latch.countDown(); // Kich hoat dong thoi
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        assertEquals(1, thanhCong.get(), "Chi dung 1 request duoc phep tao dat san thanh cong");
        assertEquals(1, biTuChoi.get(), "Request con lai phai bi tu choi do trung slot");
    }

    @Test
    @DisplayName("Kiem tra: Dat san 90 phut tao 3 lock 30p, chan don bi chong 30p nhung cho phep don lien ke")
    void testDatSan90PhutVaKhoaBlock30Phut() {
        // Khach A dat 90 phut: 08:00 -> 09:30 (tao 3 lock: 08:00, 08:30, 09:00)
        YeuCauDatSan reqA = new YeuCauDatSan();
        reqA.setCourtId(1L);
        reqA.setBookingDate(ngayThu);
        reqA.setStartSlot(LocalTime.of(8, 0));
        reqA.setDurationMinutes(90);

        TraVeDonDatSan donA = dichVuDatSan.taoDonDat(501L, reqA, "KEY-90M-A");
        assertNotNull(donA);
        assertEquals(LocalTime.of(8, 0), donA.getStartSlot());
        assertEquals(LocalTime.of(9, 30), donA.getEndSlot());
        assertEquals(3, donA.getSlots().size());

        // Kiem tra so luong lock trong database
        assertEquals(3, khoKhoaKhungGio.findByCourtIdAndBookingDate(1L, ngayThu).size());

        // Khach B dat 60 phut: 09:00 -> 10:00 (chong block 09:00) -> Bi chan 409
        YeuCauDatSan reqB = new YeuCauDatSan();
        reqB.setCourtId(1L);
        reqB.setBookingDate(ngayThu);
        reqB.setStartSlot(LocalTime.of(9, 0));
        reqB.setDurationMinutes(60);

        LoiNghiepVu exB = assertThrows(LoiNghiepVu.class, () -> {
            dichVuDatSan.taoDonDat(502L, reqB, "KEY-90M-B");
        });
        assertEquals(HttpStatus.CONFLICT, exB.getStatus());
        assertEquals("SLOT_UNAVAILABLE", exB.getCode());

        // Khach C dat 60 phut: 09:30 -> 10:30 (slot_end cua A la exclusive, 09:30 hoan toan trong) -> Thanh cong!
        YeuCauDatSan reqC = new YeuCauDatSan();
        reqC.setCourtId(1L);
        reqC.setBookingDate(ngayThu);
        reqC.setStartSlot(LocalTime.of(9, 30));
        reqC.setDurationMinutes(60);

        TraVeDonDatSan donC = dichVuDatSan.taoDonDat(503L, reqC, "KEY-90M-C");
        assertNotNull(donC);
        assertEquals(LocalTime.of(9, 30), donC.getStartSlot());
        assertEquals(LocalTime.of(10, 30), donC.getEndSlot());
    }
}
