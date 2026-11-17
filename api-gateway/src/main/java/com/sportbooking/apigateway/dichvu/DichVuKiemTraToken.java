/**
 * File: DichVuKiemTraToken.java
 * Muc dich: Xu ly xac minh chu ky JWT va kiem tra thu hoi token (token revocation) tai Gateway.
 * Chuc nang: Doc token tu cookie, trich xuat userId/email/role/tokenVersion va truy van user-service khi cache-miss.
 */
package com.sportbooking.apigateway.dichvu;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class DichVuKiemTraToken {

    private final SecretKey key;
    private final WebClient webClient;
    private final String internalApiKey;
    private final Map<Long, ThongTinPhien> boDemPhien = new ConcurrentHashMap<>();

    public DichVuKiemTraToken(
            @Value("${jwt.secret}") String secret,
            @Value("${gateway.user-service-url:http://localhost:8081}") String userServiceUrl,
            @Value("${internal.api-key:sport-internal-secret-key-2026-very-secure}") String internalApiKey) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.webClient = WebClient.builder().baseUrl(userServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public Claims giaiMaToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception ex) {
            log.warn("Token JWT khong hop le hoac da het han: {}", ex.getMessage());
            return null;
        }
    }

    public Mono<Boolean> phienHopLe(Long userId, Integer tokenVersionTrongJwt) {
        if (userId == null || tokenVersionTrongJwt == null) {
            return Mono.just(false);
        }

        ThongTinPhien phien = boDemPhien.get(userId);
        if (phien != null && Instant.now().isBefore(phien.hetHanLuc)) {
            return Mono.just(tokenVersionTrongJwt >= phien.tokenVersion);
        }

        // Cache miss: Truy van truc tiep user-service de xac thuc tokenVersion va trang thai tai khoan bang non-blocking WebClient
        return webClient.get()
                .uri("/internal/v1/users/{id}/token-version", userId)
                .header("X-Internal-Api-Key", internalApiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(2))
                .map(res -> {
                    if (res != null && res.get("tokenVersion") != null) {
                        int dbVersion = ((Number) res.get("tokenVersion")).intValue();
                        if (dbVersion < 0) {
                            // Tai khoan bi khoa (LOCKED) hoac khong ton tai
                            log.warn("Tai khoan userId={} dang bi khoa hoac khong hop le", userId);
                            boDemPhien.put(userId, new ThongTinPhien(Integer.MAX_VALUE, Instant.now().plusSeconds(30)));
                            return false;
                        }

                        boDemPhien.put(userId, new ThongTinPhien(dbVersion, Instant.now().plusSeconds(60)));
                        return tokenVersionTrongJwt >= dbVersion;
                    }
                    return false;
                })
                .onErrorResume(ex -> {
                    log.error("Khong the truy van token-version tu user-service cho userId={}: {}. Tu choi de bao ve an toan he thong (fail-closed)", userId, ex.getMessage());
                    return Mono.just(false);
                });
    }

    public void capNhatPhienMoi(Long userId, int phienMoi) {
        boDemPhien.put(userId, new ThongTinPhien(phienMoi, Instant.now().plusSeconds(60)));
    }

    private record ThongTinPhien(int tokenVersion, Instant hetHanLuc) {}
}
