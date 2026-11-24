/**
 * File: DichVuKiemTraToken.java
 * Muc dich: Xu ly xac minh chu ky JWT va kiem tra thu hoi token (token revocation) tai API Gateway.
 * Chuc nang: Uu tien doc cache tokenVersion tu Redis (phan tan, toc do < 1ms); tu dong fallback sang local cache & user-service khi cache-miss hoac Redis offline.
 */
package com.sportbooking.apigateway.dichvu;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
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

    public static final String REDIS_KEY_PREFIX = "user:token_version:";
    private static final Duration ACTIVE_CACHE_TTL = Duration.ofMinutes(5);
    private static final Duration LOCKED_CACHE_TTL = Duration.ofSeconds(30);

    private final SecretKey key;
    private final WebClient webClient;
    private final String internalApiKey;
    private final ReactiveStringRedisTemplate redisTemplate;
    private final Map<Long, ThongTinPhien> boDemPhienLocal = new ConcurrentHashMap<>();

    public DichVuKiemTraToken(
            @Value("${jwt.secret}") String secret,
            @Value("${gateway.user-service-url:http://localhost:8081}") String userServiceUrl,
            @Value("${internal.api-key:sport-internal-secret-key-2026-very-secure}") String internalApiKey,
            @Autowired(required = false) ReactiveStringRedisTemplate redisTemplate) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.webClient = WebClient.builder().baseUrl(userServiceUrl).build();
        this.internalApiKey = internalApiKey;
        this.redisTemplate = redisTemplate;
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

        // 1. Uu tien doc cache phan tan tu Redis (non-blocking)
        if (redisTemplate != null) {
            String redisKey = REDIS_KEY_PREFIX + userId;
            return redisTemplate.opsForValue().get(redisKey)
                    .timeout(Duration.ofMillis(500))
                    .map(cachedVal -> {
                        int cachedVersion = Integer.parseInt(cachedVal);
                        if (cachedVersion < 0) {
                            return false;
                        }
                        return tokenVersionTrongJwt >= cachedVersion;
                    })
                    .switchIfEmpty(Mono.defer(() -> truyVanUserServiceVaLuuCache(userId, tokenVersionTrongJwt, true)))
                    .onErrorResume(ex -> {
                        log.debug("[Redis] Khong the doc cache cho userId={} ({}), chuyen sang fallback local/user-service", userId, ex.getMessage());
                        return kiemTraFallbackLocalHoacUserService(userId, tokenVersionTrongJwt);
                    });
        }

        // 2. Fallback khi khong cau hinh Redis
        return kiemTraFallbackLocalHoacUserService(userId, tokenVersionTrongJwt);
    }

    private Mono<Boolean> kiemTraFallbackLocalHoacUserService(Long userId, Integer tokenVersionTrongJwt) {
        ThongTinPhien phien = boDemPhienLocal.get(userId);
        if (phien != null && Instant.now().isBefore(phien.hetHanLuc)) {
            return Mono.just(tokenVersionTrongJwt >= phien.tokenVersion);
        }
        return truyVanUserServiceVaLuuCache(userId, tokenVersionTrongJwt, false);
    }

    private Mono<Boolean> truyVanUserServiceVaLuuCache(Long userId, Integer tokenVersionTrongJwt, boolean ghiVaoRedis) {
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
                            log.warn("Tai khoan userId={} dang bi khoa hoac khong hop le", userId);
                            boDemPhienLocal.put(userId, new ThongTinPhien(Integer.MAX_VALUE, Instant.now().plusSeconds(30)));
                            luuRedisKhongChan(userId, -1, LOCKED_CACHE_TTL, ghiVaoRedis);
                            return false;
                        }

                        boDemPhienLocal.put(userId, new ThongTinPhien(dbVersion, Instant.now().plusSeconds(60)));
                        luuRedisKhongChan(userId, dbVersion, ACTIVE_CACHE_TTL, ghiVaoRedis);
                        return tokenVersionTrongJwt >= dbVersion;
                    }
                    return false;
                })
                .onErrorResume(ex -> {
                    log.error("Khong the truy van token-version tu user-service cho userId={}: {}. Tu choi de bao ve an toan he thong (fail-closed)", userId, ex.getMessage());
                    return Mono.just(false);
                });
    }

    private void luuRedisKhongChan(Long userId, int version, Duration ttl, boolean ghiVaoRedis) {
        if (!ghiVaoRedis || redisTemplate == null) {
            return;
        }
        String redisKey = REDIS_KEY_PREFIX + userId;
        redisTemplate.opsForValue()
                .set(redisKey, String.valueOf(version), ttl)
                .timeout(Duration.ofMillis(500))
                .subscribe(
                        ok -> log.debug("[Redis] Da luu cache {} = {} (TTL={}s)", redisKey, version, ttl.toSeconds()),
                        err -> log.debug("[Redis] Bo qua ghi cache {}: {}", redisKey, err.getMessage())
                );
    }

    public void capNhatPhienMoi(Long userId, int phienMoi) {
        boDemPhienLocal.put(userId, new ThongTinPhien(phienMoi, Instant.now().plusSeconds(60)));
        luuRedisKhongChan(userId, phienMoi, ACTIVE_CACHE_TTL, true);
    }

    private record ThongTinPhien(int tokenVersion, Instant hetHanLuc) {}
}
