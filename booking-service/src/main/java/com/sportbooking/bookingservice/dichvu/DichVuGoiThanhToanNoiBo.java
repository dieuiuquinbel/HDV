/**
 * File: DichVuGoiThanhToanNoiBo.java
 * Muc dich: Xu ly goi REST API noi bo sang Payment Service.
 * Chuc nang: Thong bao huy giao dich dang cho thanh toan khi don dat bi CANCELLED hoac EXPIRED.
 */
package com.sportbooking.bookingservice.dichvu;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class DichVuGoiThanhToanNoiBo {

    private final RestClient restClient;
    private final String internalApiKey;

    public DichVuGoiThanhToanNoiBo(
            @Value("${payment-service.url}") String paymentServiceUrl,
            @Value("${internal.api-key}") String internalApiKey) {
        this.restClient = RestClient.builder().baseUrl(paymentServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public void tuChoiThanhToan(Long bookingId, String lyDo) {
        try {
            restClient.post()
                    .uri("/internal/v1/payments/booking/{bookingId}/reject-pending?reason={reason}", bookingId, lyDo)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("X-Caller-Service", "booking-service")
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Khong the thong bao reject sang Payment Service cho bookingId={}: {}", bookingId, ex.getMessage());
        }
    }

    public boolean yeuCauHoanTien(Long bookingId, String lyDo) {
        try {
            restClient.post()
                    .uri("/internal/v1/payments/booking/{bookingId}/refund?reason={reason}", bookingId, lyDo)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("X-Caller-Service", "booking-service")
                    .retrieve()
                    .toBodilessEntity();
            log.info("Da gui yeu cau hoan tien thanh cong cho bookingId={}", bookingId);
            return true;
        } catch (Exception ex) {
            log.error("Khong the yeu cau hoan tien sang Payment Service cho bookingId={}: {}", bookingId, ex.getMessage());
            return false;
        }
    }
}
