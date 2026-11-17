/**
 * File: UngDungDatSan.java
 * Muc dich: Diem khoi chay chinh (main) cho dich vu dat san (booking-service).
 * Chuc nang: Khoi dong Spring Boot, bat tinh nang chay ngam dinh ky @EnableScheduling va thiet lap gio UTC.
 */
package com.sportbooking.bookingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class UngDungDatSan {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(UngDungDatSan.class, args);
    }
}
