/**
 * File: UngDungCongApi.java
 * Muc dich: Diem khoi chay chinh (main) cho API Gateway (api-gateway).
 * Chuc nang: Khoi dong Spring Cloud Gateway WebFlux, dieu phoi toan bo luu luong request tu frontend vao cac microservice.
 */
package com.sportbooking.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class UngDungCongApi {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(UngDungCongApi.class, args);
    }
}
