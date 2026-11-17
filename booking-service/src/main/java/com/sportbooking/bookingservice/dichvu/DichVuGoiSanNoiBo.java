/**
 * File: DichVuGoiSanNoiBo.java
 * Muc dich: Xu ly goi REST API noi bo sang Court Service bang RestClient.
 * Chuc nang: Lay cau hinh dat san cua mot san con vao mot ngay cu the, dinh kem header X-Internal-Api-Key.
 */
package com.sportbooking.bookingservice.dichvu;

import com.sportbooking.bookingservice.dulieu.TraVeCauHinhSanNoiBo;
import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;

@Service
@Slf4j
public class DichVuGoiSanNoiBo {

    private final RestClient restClient;
    private final String internalApiKey;

    public DichVuGoiSanNoiBo(
            @Value("${court-service.url}") String courtServiceUrl,
            @Value("${internal.api-key}") String internalApiKey) {
        this.restClient = RestClient.builder().baseUrl(courtServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public TraVeCauHinhSanNoiBo layCauHinhSan(Long courtId, LocalDate date) {
        try {
            return restClient.get()
                    .uri("/internal/v1/courts/{courtId}/booking-configuration?date={date}", courtId, date)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("X-Caller-Service", "booking-service")
                    .retrieve()
                    .body(TraVeCauHinhSanNoiBo.class);
        } catch (Exception ex) {
            log.error("Loi khi goi Court Service cho courtId={}: {}", courtId, ex.getMessage());
            throw new LoiNghiepVu(HttpStatus.BAD_GATEWAY, "COURT_SERVICE_UNAVAILABLE", "Không thể kết nối tới dịch vụ quản lý sân thi đấu.");
        }
    }
}
