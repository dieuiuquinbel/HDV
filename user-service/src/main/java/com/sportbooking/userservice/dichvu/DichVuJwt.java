/**
 * File: DichVuJwt.java
 * Muc dich: Xu ly tao va kiem tra JSON Web Token (JWT) cho phien dang nhap cua nguoi dung.
 * Chuc nang: Ky token bang khoa HMAC-SHA256, dat cac claim: userId, email, role, tokenVersion; thoi han 30 phut.
 */
package com.sportbooking.userservice.dichvu;

import com.sportbooking.userservice.thucthe.NguoiDung;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class DichVuJwt {

    private final SecretKey key;
    private final long expirationMinutes;

    public DichVuJwt(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-minutes:30}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String taoToken(NguoiDung user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());
        claims.put("tokenVersion", user.getTokenVersion());

        Instant now = Instant.now();
        Instant expiry = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(user.getEmail())
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Claims docToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
