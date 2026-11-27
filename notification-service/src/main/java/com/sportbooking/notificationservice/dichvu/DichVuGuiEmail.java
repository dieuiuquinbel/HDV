package com.sportbooking.notificationservice.dichvu;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.sportbooking.notificationservice.dulieu.YeuCauTaoThongBao;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuGuiEmail {

    private static final Set<String> LOAI_GUI_EMAIL = Set.of(
            "PAYMENT_SUCCESS",
            "BOOKING_REMINDER_5H",
            "CHECKIN_SUCCESS",
            "BOOKING_COMPLETED",
            "BOOKING_REFUNDED",
            "BOOKING_CANCELLED"
    );

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final DichVuGoiUserNoiBo dichVuGoiUserNoiBo;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public boolean daCauHinhSmtp() {
        return mailSender != null && mailFrom != null && !mailFrom.isBlank();
    }

    @Async
    public void guiEmailThongBaoAsync(YeuCauTaoThongBao yeuCau) {
        if (yeuCau == null || yeuCau.getType() == null) return;
        String loai = yeuCau.getType().trim().toUpperCase();
        if (!LOAI_GUI_EMAIL.contains(loai)) {
            return;
        }

        Map<String, Object> lienHe = dichVuGoiUserNoiBo.layThongTinLienHe(yeuCau.getUserId());
        if (lienHe == null) {
            log.warn("[EMAIL] Bo qua gui email vi khong lay duoc thong tin lien he userId={}", yeuCau.getUserId());
            return;
        }
        String toEmail = String.valueOf(lienHe.getOrDefault("email", "")).trim();
        String hoTen = String.valueOf(lienHe.getOrDefault("fullName", "Quý khách")).trim();
        if (toEmail.isEmpty() || !toEmail.contains("@")) {
            return;
        }

        if (!daCauHinhSmtp()) {
            log.info("[EMAIL TEST MODE - CHUA CAU HINH SMTP] To: {} ({}) | Subject: [ESportKing] {} | QR: {}",
                    toEmail, hoTen, yeuCau.getTitle(), yeuCau.getCheckinToken() != null ? "CO_MA_QR" : "KHONG");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom, "ESportKing Sports Hub");
            helper.setTo(toEmail);
            helper.setSubject(taoTieuDeEmail(loai, yeuCau.getTitle()));

            byte[] qrPng = null;
            boolean coQr = yeuCau.getCheckinToken() != null && !yeuCau.getCheckinToken().isBlank()
                    && ("PAYMENT_SUCCESS".equals(loai) || "BOOKING_REMINDER_5H".equals(loai));
            if (coQr) {
                qrPng = taoAnhQrPng(yeuCau.getCheckinToken());
            }

            String html = taoNoiDungHtml(loai, hoTen, yeuCau, qrPng != null);
            helper.setText(html, true);

            if (qrPng != null) {
                helper.addInline("checkinQr", new ByteArrayResource(qrPng), "image/png");
            }

            mailSender.send(message);
            log.info("[EMAIL] Da gui thanh cong email ({}) toi {} (coQr={})", loai, toEmail, qrPng != null);
        } catch (Exception ex) {
            log.warn("[EMAIL] Loi gui email ({}) toi {}: {}", loai, toEmail, ex.getMessage());
        }
    }

    private String taoTieuDeEmail(String loai, String title) {
        return switch (loai) {
            case "PAYMENT_SUCCESS" -> "[ESportKing] Vé Điện Tử & Mã QR Check-in — " + title;
            case "BOOKING_REMINDER_5H" -> "[ESportKing] Nhắc Lịch Thi Đấu (Còn 5 Tiếng) — " + title;
            case "CHECKIN_SUCCESS" -> "[ESportKing] Xác Nhận Nhận Sân Thành Công — " + title;
            case "BOOKING_COMPLETED" -> "[ESportKing] Hoàn Tất Ca Thi Đấu & Cảm Ơn Quý Khách — " + title;
            case "BOOKING_REFUNDED" -> "[ESportKing] Xác Nhận Hủy Đơn & Hoàn Tiền Ví SportPay — " + title;
            default -> "[ESportKing] " + title;
        };
    }

    private byte[] taoAnhQrPng(String content) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.MARGIN, 2);

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, 260, 260, hints);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception ex) {
            log.warn("[EMAIL QR] Khong the tao anh QR PNG: {}", ex.getMessage());
            return null;
        }
    }

    private String taoNoiDungHtml(String loai, String hoTen, YeuCauTaoThongBao yc, boolean coAnhQr) {
        String badgeBg;
        String badgeText;
        String badgeLabel;
        String headerGradient;

        switch (loai) {
            case "PAYMENT_SUCCESS" -> {
                badgeBg = "#ecfdf5";
                badgeText = "#047857";
                badgeLabel = "✓ THANH TOÁN THÀNH CÔNG • VÉ SẴN SÀNG";
                headerGradient = "linear-gradient(135deg, #ff385c 0%, #e00b41 100%)";
            }
            case "BOOKING_REMINDER_5H" -> {
                badgeBg = "#fffbeb";
                badgeText = "#b45309";
                badgeLabel = "⏰ NHẮC LỊCH THI ĐẤU TRƯỚC 5 TIẾNG";
                headerGradient = "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)";
            }
            case "CHECKIN_SUCCESS" -> {
                badgeBg = "#eff6ff";
                badgeText = "#1d4ed8";
                badgeLabel = "🏟️ ĐÃ CHECK-IN NHẬN SÂN THÀNH CÔNG";
                headerGradient = "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)";
            }
            case "BOOKING_COMPLETED" -> {
                badgeBg = "#ecfdf5";
                badgeText = "#047857";
                badgeLabel = "🏆 HOÀN TẤT CA THI ĐẤU (CHECK-OUT)";
                headerGradient = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
            }
            default -> {
                badgeBg = "#fff1f2";
                badgeText = "#be123c";
                badgeLabel = "🔔 THÔNG BÁO HỆ THỐNG ESPORTKING";
                headerGradient = "linear-gradient(135deg, #ff385c 0%, #e00b41 100%)";
            }
        }

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html lang='vi'><head><meta charset='utf-8' /></head>");
        html.append("<body style='margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;'>");
        html.append("<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f1f5f9;padding:28px 12px;'>");
        html.append("<tr><td align='center'>");

        // Main Card
        html.append("<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:580px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 12px 32px rgba(15,23,42,0.08);'>");

        // Header Banner
        html.append("<tr><td style='background:").append(headerGradient).append(";padding:28px 24px;text-align:center;'>");
        html.append("<div style='display:inline-block;background:rgba(255,255,255,0.18);padding:6px 14px;border-radius:999px;color:#ffffff;font-size:11px;font-weight:800;letter-spacing:1px;margin-bottom:10px;'>ESPORTKING HÀ NỘI</div>");
        html.append("<h1 style='margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:0.5px;'>ESportKing Sports Hub</h1>");
        html.append("<p style='margin:6px 0 0 0;color:rgba(255,255,255,0.9);font-size:13px;'>Hệ Thống 3 Cơ Sở Thể Thao Chuẩn Thi Đấu Tại Hà Nội</p>");
        html.append("</td></tr>");

        // Body
        html.append("<tr><td style='padding:28px 28px 20px 28px;'>");
        html.append("<div style='text-align:center;margin-bottom:18px;'>");
        html.append("<span style='display:inline-block;background:").append(badgeBg).append(";color:").append(badgeText)
            .append(";font-size:11px;font-weight:800;padding:7px 14px;border-radius:999px;letter-spacing:0.5px;'>")
            .append(badgeLabel).append("</span>");
        html.append("</div>");

        html.append("<p style='margin:0 0 8px 0;font-size:15px;color:#334155;'>Xin chào <strong style='color:#0f172a;'>")
            .append(escapeHtml(hoTen)).append("</strong>,</p>");
        html.append("<h2 style='margin:0 0 12px 0;font-size:19px;font-weight:800;color:#0f172a;line-height:1.35;'>")
            .append(escapeHtml(yc.getTitle())).append("</h2>");
        html.append("<p style='margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.65;'>")
            .append(escapeHtml(yc.getMessage())).append("</p>");

        // Thong tin chi tiet lich san (neu co)
        if (yc.getCourtName() != null || yc.getBookingTime() != null || yc.getVenueName() != null) {
            html.append("<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:20px;'>");
            html.append("<tr><td style='padding:16px 18px;'>");
            html.append("<div style='font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;'>Thông Tin Lịch Đặt Sân</div>");
            if (yc.getCourtName() != null) {
                html.append("<div style='font-size:14px;color:#0f172a;margin-bottom:6px;'><strong>🏟️ Sân thi đấu:</strong> ")
                    .append(escapeHtml(yc.getCourtName())).append("</div>");
            }
            if (yc.getBookingTime() != null) {
                html.append("<div style='font-size:14px;color:#0f172a;margin-bottom:6px;'><strong>🗓️ Khung giờ:</strong> ")
                    .append(escapeHtml(yc.getBookingTime())).append("</div>");
            }
            if (yc.getVenueName() != null) {
                html.append("<div style='font-size:14px;color:#0f172a;margin-bottom:6px;'><strong>📍 Cơ sở:</strong> ")
                    .append(escapeHtml(yc.getVenueName())).append("</div>");
            }
            if (yc.getVenueAddress() != null) {
                html.append("<div style='font-size:13px;color:#475569;'><strong>Địa chỉ:</strong> ")
                    .append(escapeHtml(yc.getVenueAddress())).append("</div>");
            }
            html.append("</td></tr></table>");
        }

        // Khoi Ma QR Check-in (nhung inline CID)
        if (coAnhQr && yc.getCheckinToken() != null) {
            html.append("<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background:#fff1f2;border:2px dashed #fb7185;border-radius:18px;margin-bottom:20px;'>");
            html.append("<tr><td style='padding:20px;text-align:center;'>");
            html.append("<div style='font-size:12px;font-weight:800;color:#be123c;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;'>MÃ QR CHECK-IN NHẬN SÂN</div>");
            html.append("<p style='margin:0 0 14px 0;font-size:12px;color:#64748b;'>Xuất trình mã QR bên dưới cho nhân viên quầy trực ban khi đến sân</p>");
            html.append("<div style='display:inline-block;background:#ffffff;padding:12px;border-radius:16px;border:2px solid #0f172a;'>");
            html.append("<img src='cid:checkinQr' alt='Mã QR Check-in ESportKing' width='200' height='200' style='display:block;' />");
            html.append("</div>");
            html.append("<div style='margin-top:12px;font-size:11px;color:#64748b;'>Mã Token dự phòng:</div>");
            html.append("<div style='margin-top:4px;display:inline-block;background:#ffffff;border:1px solid #fecdd3;border-radius:10px;padding:8px 12px;font-family:Consolas,Monaco,monospace;font-size:12px;font-weight:700;color:#0f172a;word-break:break-all;'>")
                .append(escapeHtml(yc.getCheckinToken())).append("</div>");
            html.append("</td></tr></table>");
        }

        // Nut Chi duong Google Maps
        if (yc.getGoogleMapsUrl() != null && !yc.getGoogleMapsUrl().isBlank()) {
            html.append("<div style='text-align:center;margin:22px 0 8px 0;'>");
            html.append("<a href='").append(escapeHtml(yc.getGoogleMapsUrl()))
                .append("' target='_blank' style='display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:13px 26px;border-radius:14px;'>")
                .append("🗺️ Mở Google Maps Chỉ Đường Đến Sân</a>");
            html.append("</div>");
        }

        html.append("</td></tr>");

        // Footer
        html.append("<tr><td style='background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 24px;text-align:center;'>");
        html.append("<p style='margin:0 0 6px 0;font-size:12px;font-weight:700;color:#475569;'>Hệ thống 3 cơ sở ESportKing Hà Nội</p>");
        html.append("<p style='margin:0;font-size:11px;color:#94a3b8;line-height:1.6;'>")
            .append("CS1: 18 Duy Tân, Cầu Giấy • CS2: 102 Trường Chinh, Đống Đa • CS3: 27 Quang Trung, Hà Đông<br/>")
            .append("Hotline hỗ trợ: 0799.089.283 • Email tự động, vui lòng không trả lời trực tiếp.</p>");
        html.append("</td></tr>");

        html.append("</table></td></tr></table></body></html>");
        return html.toString();
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
