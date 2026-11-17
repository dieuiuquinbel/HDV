/**
 * File: UngDungThongBao.java
 * Muc dich: Diem khoi chay chinh (main) cho dich vu thong bao (notification-service - Muc 3).
 * Chuc nang: Khoi dong Spring Boot, thiet lap gio UTC va cung cap API thong bao in-app / email cho nguoi dung.
 */
package com.sportbooking.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class UngDungThongBao {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(UngDungThongBao.class, args);
    }
}
