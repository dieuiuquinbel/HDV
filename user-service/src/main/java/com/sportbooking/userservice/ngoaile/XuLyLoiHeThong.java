/**
 * File: XuLyLoiHeThong.java
 * Muc dich: Bo bat ngoai le tap trung toan cuc (@RestControllerAdvice) cho dich vu user-service.
 * Chuc nang: Chuyen doi moi ngoai le thanh cau truc TraVeLoiChuan dong nhat theo chuan JSON cua he thong.
 */
package com.sportbooking.userservice.ngoaile;

import com.sportbooking.userservice.dulieu.TraVeLoiChuan;
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
        String thongBao = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        TraVeLoiChuan loi = TraVeLoiChuan.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("VALIDATION_ERROR")
                .message(thongBao)
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
