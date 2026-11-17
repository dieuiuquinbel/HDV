/**
 * File: XuLyLoiHeThong.java
 * Muc dich: Bo bat ngoai le tap trung toan cuc cho booking-service.
 * Chuc nang: Bat ngoai le LoiNghiepVu va DataIntegrityViolationException de luon tra ve 409 SLOT_UNAVAILABLE khi trung khoa database.
 */
package com.sportbooking.bookingservice.ngoaile;

import com.sportbooking.bookingservice.dulieu.TraVeLoiChuan;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class XuLyLoiHeThong {

    @ExceptionHandler(LoiNghiepVu.class)
    public ResponseEntity<TraVeLoiChuan> xuLyLoiNghiepVu(LoiNghiepVu ex, HttpServletRequest request) {
        TraVeLoiChuan loi = TraVeLoiChuan.builder()
                .timestamp(Instant.now())
                .status(ex.getStatus().value())
                .code(ex.getCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(loi, ex.getStatus());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<TraVeLoiChuan> xuLyLoiTrungKhoa(DataIntegrityViolationException ex, HttpServletRequest request) {
        // Xu ly dac thu khi vi pham Unique Constraint tren active_slot_locks
        TraVeLoiChuan loi = TraVeLoiChuan.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.CONFLICT.value())
                .code("SLOT_UNAVAILABLE")
                .message("Một hoặc nhiều khung giờ đã bị người khác đặt trước.")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(loi, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<TraVeLoiChuan> xuLyLoiDuLieu(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        TraVeLoiChuan loi = TraVeLoiChuan.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("VALIDATION_ERROR")
                .message(msg)
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(loi, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<TraVeLoiChuan> xuLyLoiChung(Exception ex, HttpServletRequest request) {
        TraVeLoiChuan loi = TraVeLoiChuan.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .code("INTERNAL_SERVER_ERROR")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(loi, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
