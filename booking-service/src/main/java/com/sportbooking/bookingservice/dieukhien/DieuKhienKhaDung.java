/**
 * File: DieuKhienKhaDung.java
 * Muc dich: Controller cung cap API xem lich trong va tinh trang kha dung (Availability) cua san.
 * Chuc nang: GET /availability?courtId=&date= tra ve toan bo khung gio 60 phut, trang thai trong/khoa/qua khu va gia theo gio.
 */
package com.sportbooking.bookingservice.dieukhien;

import com.sportbooking.bookingservice.dichvu.DichVuKhaDung;
import com.sportbooking.bookingservice.dulieu.TraVeKhungGioTrong;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class DieuKhienKhaDung {

    private final DichVuKhaDung dichVuKhaDung;

    @GetMapping
    public ResponseEntity<List<TraVeKhungGioTrong>> layKhungGioKhaDung(
            @RequestParam Long courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Integer durationMinutes) {
        return ResponseEntity.ok(dichVuKhaDung.tinhKhungGioKhaDung(courtId, date, durationMinutes));
    }
}
