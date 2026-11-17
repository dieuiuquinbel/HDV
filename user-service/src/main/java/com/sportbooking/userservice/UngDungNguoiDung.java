/**
 * File: UngDungNguoiDung.java
 * Muc dich: Diem khoi chay chinh (main) cho dich vu quan ly nguoi dung (user-service).
 * Chuc nang: Khoi dong Spring Boot, thiet lap mui gio he thong UTC va nap cac bean.
 */
package com.sportbooking.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class UngDungNguoiDung {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(UngDungNguoiDung.class, args);
    }
}
