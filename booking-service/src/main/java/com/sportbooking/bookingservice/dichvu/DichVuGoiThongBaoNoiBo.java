/**
 * File: DichVuGoiThongBaoNoiBo.java
 * Muc dich: Xu ly gui thong bao qua HTTP REST noi bo den Notification Service.
 * Chuc nang: Gui thong bao dat san, thong bao thanh toan thanh cong, thong bao hoan tien / huy don.
 */
package com.sportbooking.bookingservice.dichvu;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@Slf4j
public class DichVuGoiThongBaoNoiBo {

    private final RestClient restClient;
    private final String internalApiKey;

    public DichVuGoiThongBaoNoiBo(
            @Value("${notification-service.url:http://localhost:8085}") String notificationServiceUrl,
            @Value("${internal.api-key}") String internalApiKey) {
        this.restClient = RestClient.builder().baseUrl(notificationServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public void guiThongBao(Long userId, String title, String content, String type, Long referenceId) {
        try {
            String eventId = "EVT-" + type + "-" + referenceId + "-" + userId;
            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "title", title,
                    "message", content,
                    "type", type,
                    "eventId", eventId
            );

            restClient.post()
                    .uri("/internal/v1/notifications")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("X-Caller-Service", "booking-service")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Da gui thong bao den userId={} voi tieu de: {} (eventId={})", userId, title, eventId);
        } catch (Exception ex) {
            log.warn("Loi khi gui thong bao sang Notification Service: {}", ex.getMessage());
        }
    }
}
