/**
 * File: DichVuGoiDatSanNoiBo.java
 * Muc dich: Xu ly goi REST API sang Booking Service bang RestClient kem co che Retry co gioi han.
 * Chuc nang: Lay so tien payable-summary va goi callback xac nhan thanh toan kem attemptReference theo quy tac idempotent.
 */
package com.sportbooking.paymentservice.dichvu;

import com.sportbooking.paymentservice.dulieu.TraVeThanhToanNoiBo;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;

@Service
@Slf4j
public class DichVuGoiDatSanNoiBo {

    private final RestClient restClient;
    private final String internalApiKey;

    public DichVuGoiDatSanNoiBo(
            @Value("${booking-service.url}") String bookingServiceUrl,
            @Value("${internal.api-key}") String internalApiKey) {
        this.restClient = RestClient.builder().baseUrl(bookingServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public TraVeThanhToanNoiBo layThongTinThanhToan(Long bookingId) {
        try {
            return restClient.get()
                    .uri("/internal/v1/bookings/{bookingId}/payable-summary", bookingId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("X-Caller-Service", "payment-service")
                    .retrieve()
                    .body(TraVeThanhToanNoiBo.class);
        } catch (HttpClientErrorException ex) {
            log.error("Loi Client khi goi Booking Service bookingId={}: {}", bookingId, ex.getStatusCode());
            throw new LoiNghiepVu(HttpStatus.valueOf(ex.getStatusCode().value()), "BOOKING_ERROR", "Đơn đặt sân không hợp lệ hoặc không tồn tại.");
        } catch (Exception ex) {
            log.error("Loi khi ket noi Booking Service: {}", ex.getMessage());
            throw new LoiNghiepVu(HttpStatus.BAD_GATEWAY, "BOOKING_SERVICE_UNAVAILABLE", "Không thể kết nối tới dịch vụ đặt sân.");
        }
    }

    public boolean xacNhanThanhToan(Long bookingId, Long paymentId, String attemptReference, Instant paidAt) {
        int[] delays = {1000, 5000, 30000}; // Retry 3 lan voi backoff 1s, 5s, 30s
        Map<String, Object> body = Map.of(
                "paymentId", paymentId,
                "attemptReference", attemptReference,
                "paidAt", paidAt
        );

        for (int i = 0; i < 3; i++) {
            try {
                restClient.post()
                        .uri("/internal/v1/bookings/{bookingId}/payment-confirmation", bookingId)
                        .header("X-Internal-Api-Key", internalApiKey)
                        .header("X-Caller-Service", "payment-service")
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();
                log.info("Xac nhan thanh toan thanh cong sang Booking Service cho bookingId={}", bookingId);
                return true;
            } catch (HttpClientErrorException.Conflict conflictEx) {
                // Booking tra 409 (da het han hoac bi huy) -> Khong retry nua
                log.warn("Booking Service tu choi xac nhan vi don dat da het han hoac bi huy: {}", conflictEx.getMessage());
                throw new LoiNghiepVu(HttpStatus.CONFLICT, "BOOKING_NOT_PAYABLE", "Don dat da het han hoac da bi huy");
            } catch (Exception ex) {
                log.warn("Lan thu {}/3 goi callback xac nhan sang Booking Service that bai: {}", i + 1, ex.getMessage());
                if (i < 2) {
                    try {
                        Thread.sleep(delays[i]);
                    } catch (InterruptedException ignored) {}
                }
            }
        }
        return false;
    }
}
