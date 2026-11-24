/**
 * File: DichVuGoiThongBaoNoiBo.java
 * Muc dich: Ban su kien thong bao vi bat dong bo qua RabbitMQ den Notification Service (co fallback REST noi bo khi khong chay RabbitMQ).
 */
package com.sportbooking.paymentservice.dichvu;

import com.sportbooking.paymentservice.cauhinh.CauHinhRabbitMq;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@Slf4j
public class DichVuGoiThongBaoNoiBo {

    private final RestClient restClient;
    private final String internalApiKey;
    private final RabbitTemplate rabbitTemplate;

    public DichVuGoiThongBaoNoiBo(
            @Value("${notification-service.url:http://localhost:8085}") String notificationServiceUrl,
            @Value("${internal.api-key}") String internalApiKey,
            @Autowired(required = false) RabbitTemplate rabbitTemplate) {
        this.restClient = RestClient.builder().baseUrl(notificationServiceUrl).build();
        this.internalApiKey = internalApiKey;
        this.rabbitTemplate = rabbitTemplate;
    }

    public void guiThongBao(Long userId, String title, String content, String type, String referenceId) {
        String eventId = "EVT-WALLET-" + type + "-" + referenceId + "-" + System.currentTimeMillis();
        Map<String, Object> body = Map.of(
                "userId", userId,
                "title", title,
                "message", content,
                "type", type,
                "eventId", eventId
        );

        // 1. Uu tien gui bat dong bo qua RabbitMQ (Event-Driven)
        if (rabbitTemplate != null) {
            try {
                String routingKey = "notification." + (type != null ? type.toLowerCase() : "wallet");
                rabbitTemplate.convertAndSend(CauHinhRabbitMq.NOTIFICATION_EXCHANGE, routingKey, body);
                log.info("[RabbitMQ] Da ban su kien thong bao vi den userId={} (routingKey={}, eventId={})", userId, routingKey, eventId);
                return;
            } catch (Exception ex) {
                log.warn("[RabbitMQ] Khong ket noi duoc broker ({}), chuyen sang fallback REST noi bo...", ex.getMessage());
            }
        }

        // 2. Fallback REST noi bo neu moi truong local khong bat RabbitMQ
        try {
            restClient.post()
                    .uri("/internal/v1/notifications")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("X-Caller-Service", "payment-service")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("[REST Fallback] Da gui thong bao vi den userId={} voi tieu de: {} (eventId={})", userId, title, eventId);
        } catch (Exception ex) {
            log.warn("Loi khi gui thong bao sang Notification Service: {}", ex.getMessage());
        }
    }
}
