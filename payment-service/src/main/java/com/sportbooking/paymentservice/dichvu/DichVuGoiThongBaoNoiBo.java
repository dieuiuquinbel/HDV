package com.sportbooking.paymentservice.dichvu;

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

    public void guiThongBao(Long userId, String title, String content, String type, String referenceId) {
        try {
            String eventId = "EVT-WALLET-" + type + "-" + referenceId + "-" + System.currentTimeMillis();
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
                    .header("X-Caller-Service", "payment-service")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Da gui thong bao vi den userId={} voi tieu de: {} (eventId={})", userId, title, eventId);
        } catch (Exception ex) {
            log.warn("Loi khi gui thong bao sang Notification Service: {}", ex.getMessage());
        }
    }
}
