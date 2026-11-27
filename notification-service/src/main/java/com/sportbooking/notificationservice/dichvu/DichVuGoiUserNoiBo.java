package com.sportbooking.notificationservice.dichvu;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@Slf4j
public class DichVuGoiUserNoiBo {

    private final RestClient restClient;
    private final String internalApiKey;

    public DichVuGoiUserNoiBo(
            @Value("${user-service.url:http://localhost:8081}") String userServiceUrl,
            @Value("${internal.api-key}") String internalApiKey) {
        this.restClient = RestClient.builder().baseUrl(userServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public Map<String, Object> layThongTinLienHe(Long userId) {
        if (userId == null) return null;
        try {
            return restClient.get()
                    .uri("/internal/v1/users/{id}/contact", userId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception ex) {
            log.warn("[UserClient] Khong the lay email cho userId={}: {}", userId, ex.getMessage());
            return null;
        }
    }
}
