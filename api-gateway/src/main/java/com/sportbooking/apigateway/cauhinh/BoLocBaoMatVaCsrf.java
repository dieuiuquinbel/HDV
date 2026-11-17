/**
 * File: BoLocBaoMatVaCsrf.java
 * Muc dich: Bo loc toan cuc (GlobalFilter) tai API Gateway de kiem tra bao mat, chan duong dan noi bo va xac thuc CSRF.
 * Chuc nang: Chan moi truy cap vao /internal/**; kiem tra cookie XSRF-TOKEN vs header X-CSRF-Token; doc JWT tu cookie access_token va truyen header X-User-*.
 */
package com.sportbooking.apigateway.cauhinh;

import com.sportbooking.apigateway.dichvu.DichVuKiemTraToken;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class BoLocBaoMatVaCsrf implements GlobalFilter, Ordered {

    private final DichVuKiemTraToken dichVuKiemTraToken;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // 1. Chan tuyet doi cac request cong khai goi vao duong dan noi bo /internal/**
        if (path.contains("/internal/")) {
            log.warn("Phat hien yeu cau cong khai truy cap duong dan noi bo: {}", path);
            return phanHoiLoi(exchange, HttpStatus.FORBIDDEN, "FORBIDDEN", "Khong duoc phep truy cap duong dan noi bo");
        }

        // Xoa cac header gia mao tu ben ngoai (client khong the tu truyen X-User-Id / X-User-Role / X-Gateway-Token)
        ServerHttpRequest.Builder requestBuilder = request.mutate();
        requestBuilder.headers(httpHeaders -> {
            httpHeaders.remove("X-User-Id");
            httpHeaders.remove("X-User-Email");
            httpHeaders.remove("X-User-Role");
            httpHeaders.remove("X-Gateway-Token");
        });

        // 2. Kiem tra CSRF (Double Submit Cookie) cho cac yeu cau thay doi du lieu (POST, PUT, PATCH, DELETE)
        // Ngoai tru: dang ky (/api/v1/auth/register), dang nhap (/api/v1/auth/login), lay csrf (/api/v1/auth/csrf), resend-otp
        boolean isPublicAuth = path.startsWith("/api/v1/auth/login") 
                || path.startsWith("/api/v1/auth/register")
                || path.startsWith("/api/v1/auth/csrf")
                || path.startsWith("/api/v1/auth/verify-otp")
                || path.startsWith("/api/v1/auth/resend-otp");

        if (!isPublicAuth && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH || method == HttpMethod.DELETE)) {
            HttpCookie csrfCookie = request.getCookies().getFirst("XSRF-TOKEN");
            String csrfHeader = request.getHeaders().getFirst("X-CSRF-Token");

            // Bat buoc ca cookie va header phai ton tai va khop nhau
            if (csrfCookie == null || csrfHeader == null || !csrfCookie.getValue().equals(csrfHeader) || csrfHeader.trim().isEmpty()) {
                log.warn("Loi CSRF: Thieu hoac khong khop cookie XSRF-TOKEN va header X-CSRF-Token cho duong dan: {}", path);
                return phanHoiLoi(exchange, HttpStatus.FORBIDDEN, "CSRF_TOKEN_INVALID", "Yeu cau thieu hoac sai ma CSRF token hop le");
            }
        }

        // 3. Trich xuat JWT tu cookie access_token (khong dung localStorage theo yeu cau Mua 2)
        HttpCookie jwtCookie = request.getCookies().getFirst("access_token");

        if (jwtCookie != null && !jwtCookie.getValue().trim().isEmpty()) {
            Claims claims = dichVuKiemTraToken.giaiMaToken(jwtCookie.getValue());
            if (claims != null) {
                Long userId = null;
                Object userIdObj = claims.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj != null) {
                    try {
                        userId = Long.parseLong(userIdObj.toString());
                    } catch (Exception ignored) {}
                }

                String email = claims.get("email", String.class);
                String role = claims.get("role", String.class);

                Integer tokenVersion = 0;
                Object tvObj = claims.get("tokenVersion");
                if (tvObj instanceof Number) {
                    tokenVersion = ((Number) tvObj).intValue();
                } else if (tvObj != null) {
                    try {
                        tokenVersion = Integer.parseInt(tvObj.toString());
                    } catch (Exception ignored) {}
                }

                if (userId != null) {
                    final Long finalUserId = userId;
                    final String finalEmail = email;
                    final String finalRole = role;

                    // Kiem tra thu hoi phien (token revocation do khoa user) non-blocking
                    return dichVuKiemTraToken.phienHopLe(finalUserId, tokenVersion)
                            .flatMap(hopLe -> {
                                if (Boolean.TRUE.equals(hopLe)) {
                                    requestBuilder.header("X-User-Id", String.valueOf(finalUserId));
                                    if (finalEmail != null) requestBuilder.header("X-User-Email", finalEmail);
                                    if (finalRole != null) requestBuilder.header("X-User-Role", finalRole);
                                } else {
                                    log.warn("Token cua user {} da bi vo hieu hoa (LOCKED)", finalUserId);
                                }
                                requestBuilder.header("X-Gateway-Token", "sport-gateway-verified-token-2026");
                                return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
                            });
                }
            }
        }

        // Gan token bao ve phia Gateway de cac service noi bo xac nhan request thuc su den tu Gateway
        requestBuilder.header("X-Gateway-Token", "sport-gateway-verified-token-2026");

        return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
    }

    private Mono<Void> phanHoiLoi(ServerWebExchange exchange, HttpStatus status, String code, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"code\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                Instant.now().toString(), status.value(), code, message, exchange.getRequest().getURI().getPath()
        );

        DataBuffer buffer = response.bufferFactory().wrap(json.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // Do uu tien cao nhat
    }
}
