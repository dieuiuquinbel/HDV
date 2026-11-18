/**
 * File: DichVuVietQR.java
 * Muc dich: Tien ich sinh va quet ma QR chuyen khoan VietQR Ngan hang Techcombank bang ZXing.
 * Chuc nang: Tao QuickLink, tao chuoi chuan EMVCo kem CRC16, render ma QR Base64, va giai ma QR tu anh upload.
 */
package com.sportbooking.paymentservice.vietqr;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.sportbooking.paymentservice.khodulieu.KhoGiaoDichThanhToan;
import com.sportbooking.paymentservice.ngoaile.LoiNghiepVu;
import com.sportbooking.paymentservice.thucthe.GiaoDichThanhToan;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuVietQR {

    private final CauHinhNganHangTechcombank cauHinhTechcombank;
    private final KhoGiaoDichThanhToan khoGiaoDichThanhToan;
    private final com.sportbooking.paymentservice.dichvu.DichVuGoiDatSanNoiBo dichVuGoiDatSanNoiBo;

    /**
     * Tao thong tin VietQR day du cho don thanh toan
     */
    public TraVeVietQR taoVietQRChoGiaoDich(Long paymentId, Long userId, String userRole) {
        if (userId == null) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập để xem thông tin VietQR.");
        }
        GiaoDichThanhToan giaoDich = khoGiaoDichThanhToan.findById(paymentId)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán."));

        if (!"ADMIN".equals(userRole)) {
            Long ownerId = giaoDich.getCustomerId();
            if (ownerId == null || ownerId <= 0) {
                try {
                    var bk = dichVuGoiDatSanNoiBo.layThongTinThanhToan(giaoDich.getBookingId());
                    if (bk != null && bk.getCustomerId() != null && bk.getCustomerId() > 0) {
                        ownerId = bk.getCustomerId();
                        giaoDich.setCustomerId(ownerId);
                        khoGiaoDichThanhToan.save(giaoDich);
                    }
                } catch (Exception ex) {
                    log.warn("Khong the khoi phuc customerId cho VietQR tu booking #{}: {}", giaoDich.getBookingId(), ex.getMessage());
                }
            }
            if (ownerId == null || ownerId <= 0 || !ownerId.equals(userId)) {
                throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem giao dịch thanh toán này.");
            }
        }

        String bankBin = cauHinhTechcombank.getBankBin();
        String accountNumber = cauHinhTechcombank.getAccountNumber();
        String accountName = cauHinhTechcombank.getAccountName();
        BigDecimal amount = giaoDich.getAmount();

        // Noi dung chuyen khoan chuan: DAT SAN {transactionCode}
        String transferContent = "SPORT " + giaoDich.getTransactionCode();

        // 1. Tao URL QuickLink VietQR
        String encodedContent = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);
        String encodedName = URLEncoder.encode(accountName, StandardCharsets.UTF_8);
        String quickLinkUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankBin, accountNumber, amount.toBigInteger().toString(), encodedContent, encodedName
        );

        // 2. Tao chuoi chuan EMVCo Napas VietQR
        String emvcoPayload = taoChuoiEmvcoVietQr(bankBin, accountNumber, amount, transferContent);

        // 3. Render anh QR code Base64 bang thu vien ZXing
        String qrCodeBase64 = taoAnhQrBase64(emvcoPayload, 300, 300);

        return TraVeVietQR.builder()
                .paymentId(giaoDich.getId())
                .bookingId(giaoDich.getBookingId())
                .transactionCode(giaoDich.getTransactionCode())
                .amount(amount)
                .currency(giaoDich.getCurrency())
                .bankBin(bankBin)
                .bankCode(cauHinhTechcombank.getBankCode())
                .bankName(cauHinhTechcombank.getBankName())
                .accountNumber(accountNumber)
                .accountName(accountName)
                .transferContent(transferContent)
                .quickLinkUrl(quickLinkUrl)
                .emvcoPayload(emvcoPayload)
                .qrCodeBase64(qrCodeBase64)
                .build();
    }

    /**
     * Quet va giai ma QR chuyen khoan tu Stream anh / byte array
     */
    public Map<String, Object> quetMaQrTuDuLieuAnh(InputStream inputStream) {
        try {
            BufferedImage bufferedImage = ImageIO.read(inputStream);
            if (bufferedImage == null) {
                throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_IMAGE", "Không thể đọc dữ liệu hình ảnh.");
            }

            LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
            Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
            hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
            hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");

            Result result = new MultiFormatReader().decode(bitmap, hints);
            String rawText = result.getText();

            return phanTichNoiDungQr(rawText);
        } catch (NotFoundException e) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "QR_NOT_FOUND", "Không tìm thấy mã QR hợp lệ trong hình ảnh.");
        } catch (LoiNghiepVu ln) {
            throw ln;
        } catch (Exception e) {
            log.error("Loi khi quet ma QR: {}", e.getMessage());
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "QR_SCAN_ERROR", "Lỗi trong quá trình quét mã QR: " + e.getMessage());
        }
    }

    /**
     * Quet va giai ma tu chuoi Base64 anh hoac text ma QR
     */
    public Map<String, Object> quetMaQrTuBase64(String base64HoacRawText) {
        if (base64HoacRawText == null || base64HoacRawText.trim().isEmpty()) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "EMPTY_INPUT", "Dữ liệu mã QR không được để trống.");
        }

        String input = base64HoacRawText.trim();

        // Neu la chuoi EMVCo hoac URL VietQR truc tiep
        if (input.startsWith("000201") || input.contains("vietqr.io") || input.contains("SPORT")) {
            return phanTichNoiDungQr(input);
        }

        // Xu ly tien to base64 neu co (data:image/png;base64,...)
        if (input.contains(",")) {
            input = input.substring(input.indexOf(",") + 1);
        }

        try {
            byte[] imageBytes = Base64.getDecoder().decode(input);
            return quetMaQrTuDuLieuAnh(new ByteArrayInputStream(imageBytes));
        } catch (IllegalArgumentException e) {
            // Khong phai base64 hop le, thu phan tich truc tiep nhu text
            return phanTichNoiDungQr(input);
        }
    }

    /**
     * Phan tich noi dung chuoi QR de lay thong tin tai khoan, so tien, noi dung chuyen khoan
     */
    public Map<String, Object> phanTichNoiDungQr(String qrText) {
        Map<String, Object> ketQua = new LinkedHashMap<>();
        ketQua.put("rawPayload", qrText);

        boolean isTechcombank = qrText.contains(cauHinhTechcombank.getAccountNumber())
                || qrText.contains(cauHinhTechcombank.getBankBin())
                || qrText.contains(cauHinhTechcombank.getBankCode());

        ketQua.put("isTechcombankAccount", isTechcombank);
        ketQua.put("expectedBank", cauHinhTechcombank.getBankName());
        ketQua.put("expectedAccount", cauHinhTechcombank.getAccountNumber());
        ketQua.put("expectedAccountName", cauHinhTechcombank.getAccountName());

        // Kiem tra xem co chua ma don SPORT khong
        if (qrText.contains("SPORT")) {
            int idx = qrText.indexOf("SPORT");
            String sub = qrText.substring(idx).trim();
            // Tach lay ma giao dich
            String[] tokens = sub.split("[\\s#]+");
            if (tokens.length >= 2) {
                ketQua.put("detectedTransactionCode", tokens[1].replaceAll("[^a-zA-Z0-9_-]", ""));
            }
        }

        return ketQua;
    }

    /**
     * Tao chuoi du lieu EMVCo VietQR theo tieu chuan Napas
     */
    public String taoChuoiEmvcoVietQr(String bankBin, String accountNumber, BigDecimal amount, String content) {
        StringBuilder sb = new StringBuilder();

        // 00: Payload Format Indicator
        sb.append(dinhDangTlv("00", "01"));
        // 01: Point of Initiation Method (12: Dynamic QR voi so tien cu the)
        sb.append(dinhDangTlv("01", "12"));

        // 38: Merchant Account Information (Napas)
        StringBuilder sub38 = new StringBuilder();
        sub38.append(dinhDangTlv("00", "A000000727")); // GUID Napas

        // Sub 01: Beneficiary info (Napas BIN + Account Number)
        StringBuilder sub01 = new StringBuilder();
        sub01.append(dinhDangTlv("00", bankBin));
        sub01.append(dinhDangTlv("01", accountNumber));
        sub38.append(dinhDangTlv("01", sub01.toString()));

        // Service Code: QRIBFTTA (Chuyen nhanh qua tai khoan)
        sub38.append(dinhDangTlv("02", "QRIBFTTA"));
        sb.append(dinhDangTlv("38", sub38.toString()));

        // 53: Transaction Currency (704 = VND)
        sb.append(dinhDangTlv("53", "704"));

        // 54: Transaction Amount
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            sb.append(dinhDangTlv("54", amount.toBigInteger().toString()));
        }

        // 58: Country Code
        sb.append(dinhDangTlv("58", "VN"));

        // 62: Additional Data Field (Noi dung chuyen khoan)
        if (content != null && !content.isEmpty()) {
            StringBuilder sub62 = new StringBuilder();
            sub62.append(dinhDangTlv("08", content));
            sb.append(dinhDangTlv("62", sub62.toString()));
        }

        // 63: CRC Checksum
        sb.append("6304");
        String crc = tinhCrc16Ccitt(sb.toString());
        sb.append(crc);

        return sb.toString();
    }

    /**
     * Render ma QR thanh chuoi Base64 PNG
     */
    public String taoAnhQrBase64(String content, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            byte[] bytes = baos.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            log.error("Loi khi tao anh QR Base64: {}", e.getMessage());
            return "";
        }
    }

    private String dinhDangTlv(String tag, String value) {
        int length = value.getBytes(StandardCharsets.UTF_8).length;
        return String.format("%s%02d%s", tag, length, value);
    }

    private String tinhCrc16Ccitt(String data) {
        int crc = 0xFFFF;
        int polynomial = 0x1021;
        byte[] bytes = data.getBytes(StandardCharsets.UTF_8);

        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i)) & 1) == 1;
                boolean c15 = ((crc >> 15) & 1) == 1;
                crc <<= 1;
                if (c15 ^ bit) {
                    crc ^= polynomial;
                }
            }
        }
        crc &= 0xFFFF;
        return String.format("%04X", crc);
    }
}
