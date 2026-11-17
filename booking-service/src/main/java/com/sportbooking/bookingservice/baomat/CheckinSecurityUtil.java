/**
 * File: CheckinSecurityUtil.java
 * Muc dich: Tien ich ky va xac thuc ma QR Check-in an toan bang HMAC-SHA256 chong gia mao va IDOR.
 */
package com.sportbooking.bookingservice.baomat;

import com.sportbooking.bookingservice.ngoaile.LoiNghiepVu;
import org.springframework.http.HttpStatus;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

public class CheckinSecurityUtil {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String DEFAULT_SECRET = "sport-internal-secret-key-2026-very-secure";

    public static String taoMaCheckin(Long bookingId, Long customerId, LocalDate bookingDate) {
        if (bookingId == null || customerId == null) {
            return "SPORT-CHECKIN-INVALID";
        }
        // Thoi gian het han la 23:59:59 cua ngay dat san + 24h
        long expiryEpoch = (bookingDate != null)
                ? bookingDate.plusDays(1).atTime(23, 59, 59).toEpochSecond(ZoneOffset.UTC)
                : Instant.now().plusSeconds(86400 * 2).getEpochSecond();

        String payload = bookingId + ":" + customerId + ":" + expiryEpoch;
        String signature = tinhHmac(payload, DEFAULT_SECRET);

        return "SPORT-CHECKIN." + bookingId + "." + customerId + "." + expiryEpoch + "." + signature;
    }

    public static ThongTinCheckin xacThucMaCheckin(String token) {
        if (token == null || token.isBlank()) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "Mã QR check-in không được để trống.");
        }

        // Dinh dang HMAC: SPORT-CHECKIN.{id}.{customerId}.{expiry}.{sig}
        if (token.startsWith("SPORT-CHECKIN.")) {
                String[] parts = token.split("\\.");
                // parts: ["SPORT-CHECKIN", "{id}", "{customerId}", "{expiry}", "{sig}"]
                if (parts.length >= 5) {
                    Long bookingId = Long.parseLong(parts[1]);
                    Long customerId = Long.parseLong(parts[2]);
                    long expiry = Long.parseLong(parts[3]);
                    String clientSig = parts[4];

                    if (Instant.now().getEpochSecond() > expiry) {
                        throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Mã QR check-in đã hết hạn sử dụng.");
                    }

                    String payload = bookingId + ":" + customerId + ":" + expiry;
                    String expectedSig = tinhHmac(payload, DEFAULT_SECRET);

                    if (!expectedSig.equalsIgnoreCase(clientSig)) {
                        throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_SIGNATURE", "Chữ ký mã QR không hợp lệ hoặc đã bị chỉnh sửa.");
                    }

                    return new ThongTinCheckin(bookingId, customerId);
                }
        }

        throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_TOKEN_FORMAT", "Định dạng mã QR check-in không hợp lệ.");
    }

    private static String tinhHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] hmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(hmac.length, 12); i++) { // Lay 24 ky tu hex
                sb.append(String.format("%02x", hmac[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            return "sig" + data.hashCode();
        }
    }

    public record ThongTinCheckin(Long bookingId, Long customerId) {}
}
