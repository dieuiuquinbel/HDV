/**
 * File: TraVeVietQR.java
 * Muc dich: DTO phan hoi chua thong tin chuyen khoan va ma QR VietQR (Techcombank).
 */
package com.sportbooking.paymentservice.vietqr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraVeVietQR {
    private Long paymentId;
    private Long bookingId;
    private String transactionCode;
    private BigDecimal amount;
    private String currency;

    // Thong tin ngan hang Techcombank
    private String bankBin;
    private String bankCode;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private String transferContent;

    // Du lieu QR code
    private String quickLinkUrl;
    private String emvcoPayload;
    private String qrCodeBase64;
}
