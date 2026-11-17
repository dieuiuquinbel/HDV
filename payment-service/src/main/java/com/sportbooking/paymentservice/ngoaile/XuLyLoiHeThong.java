/**
 * File: XuLyLoiHeThong.java
 * Muc dich: Bo xu ly ngoai le tap trung toan cuc cho payment-service.
 * Chuc nang: Dong nhat dinh dang TraVeLoiChuan tra ve client khi co loi say ra.
 */
package com.sportbooking.paymentservice.ngoaile;

import com.sportbooking.paymentservice.dulieu.TraVeLoiChuan;
import jakarta.servlet.http.HttpServletRequest;
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

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<TraVeLoiChuan> xuLyLoiTrungLap(org.springframework.dao.DataIntegrityViolationException ex, HttpServletRequest request) {
        TraVeLoiChuan loi = TraVeLoiChuan.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.CONFLICT.value())
                .code("DUPLICATE_TRANSACTION")
                .message("Giao dịch thanh toán cho đơn đặt này đã tồn tại.")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(loi, HttpStatus.CONFLICT);
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
