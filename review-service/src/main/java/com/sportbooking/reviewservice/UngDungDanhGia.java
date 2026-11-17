/**
 * File: UngDungDanhGia.java
 * Muc dich: Diem khoi chay chinh (main) cho dich vu danh gia san (review-service - Muc 3).
 * Chuc nang: Khoi dong Spring Boot, thiet lap gio UTC va cung cap API danh gia sau khi don dat dat trang thai COMPLETED.
 */
package com.sportbooking.reviewservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class UngDungDanhGia {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(UngDungDanhGia.class, args);
    }
}
