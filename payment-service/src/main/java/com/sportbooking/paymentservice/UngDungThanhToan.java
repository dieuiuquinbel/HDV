/**
 * File: UngDungThanhToan.java
 * Muc dich: Diem khoi chay chinh (main) cho dich vu thanh toan gia lap (payment-service).
 * Chuc nang: Khoi dong Spring Boot, thiet lap gio UTC va nap cac bean.
 */
package com.sportbooking.paymentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class UngDungThanhToan {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(UngDungThanhToan.class, args);
    }
}
