/**
 * File: CauHinhDinhTuyen.java
 * Muc dich: Dinh tuyen (Routing) cac request tu cong API Gateway sang cac microservice tuong ung va cau hinh CORS.
 * Chuc nang: Strip prefix /api/v1 va chuyen toi user-service, court-service, booking-service, payment-service; ho tro credentials.
 */
package com.sportbooking.apigateway.cauhinh;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CauHinhDinhTuyen {

    @Value("${gateway.user-service-url}")
    private String userServiceUrl;

    @Value("${gateway.court-service-url}")
    private String courtServiceUrl;

    @Value("${gateway.booking-service-url}")
    private String bookingServiceUrl;

    @Value("${gateway.payment-service-url}")
    private String paymentServiceUrl;

    @Value("${gateway.notification-service-url}")
    private String notificationServiceUrl;

    @Value("${gateway.review-service-url}")
    private String reviewServiceUrl;

    @Value("${gateway.frontend-url}")
    private String frontendUrl;

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // 1. User Service
                .route("user-auth-route", r -> r
                        .path("/api/v1/auth/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(userServiceUrl))
                .route("user-profile-route", r -> r
                        .path("/api/v1/users/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(userServiceUrl))

                // 2. Court Service
                .route("court-sports-route", r -> r
                        .path("/api/v1/sports/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(courtServiceUrl))
                .route("court-venues-route", r -> r
                        .path("/api/v1/venues/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(courtServiceUrl))
                .route("court-courts-route", r -> r
                        .path("/api/v1/courts/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(courtServiceUrl))

                // 3. Booking Service
                .route("booking-availability-route", r -> r
                        .path("/api/v1/availability/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(bookingServiceUrl))
                .route("booking-vouchers-route", r -> r
                        .path("/api/v1/vouchers/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(bookingServiceUrl))
                .route("booking-main-route", r -> r
                        .path("/api/v1/bookings/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(bookingServiceUrl))
                .route("booking-admin-route", r -> r
                        .path("/api/v1/admin/bookings/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(bookingServiceUrl))
                .route("booking-admin-stats-route", r -> r
                        .path("/api/v1/admin/statistics/bookings/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(bookingServiceUrl))

                // 4. Payment Service
                .route("payment-main-route", r -> r
                        .path("/api/v1/payments/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(paymentServiceUrl))
                .route("payment-admin-route", r -> r
                        .path("/api/v1/admin/payments/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(paymentServiceUrl))
                .route("payment-admin-stats-route", r -> r
                        .path("/api/v1/admin/statistics/revenue/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(paymentServiceUrl))

                // 5. Notification Service
                .route("notification-main-route", r -> r
                        .path("/api/v1/notifications/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(notificationServiceUrl))

                // 6. Review Service
                .route("review-main-route", r -> r
                        .path("/api/v1/reviews/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(reviewServiceUrl))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://localhost:[*]",
            "http://127.0.0.1:[*]",
            frontendUrl
        ));
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "X-CSRF-Token", "Idempotency-Key", "Cookie"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setExposedHeaders(Arrays.asList("Set-Cookie", "X-CSRF-Token"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
