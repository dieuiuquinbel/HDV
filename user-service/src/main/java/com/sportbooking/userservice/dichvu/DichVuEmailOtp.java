/**
 * File: DichVuEmailOtp.java
 * Muc dich: Xu ly gui email ma OTP xac minh tai khoan va dat lai mat khau tu dong cho he thong ESportKing.
 * Chuc nang: Su dung JavaMailSender voi mau email HTML chuyen nghiep ESportKing, tu dong fallback khi chua cau hinh SMTP.
 */
package com.sportbooking.userservice.dichvu;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuEmailOtp {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public boolean daCauHinhSmtp() {
        return mailSender != null && mailFrom != null && !mailFrom.isBlank();
    }

    public boolean guiMaOtp(String toEmail, String hoTen, String otpCode) {
        if (!daCauHinhSmtp()) {
            log.info("[CHUA CAU HINH SMTP - CHE DO TEST] Ma OTP cua {} ({}) la: {}", hoTen, toEmail, otpCode);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom, "ESportKing Sports Hub");
            helper.setTo(toEmail);
            helper.setSubject("[ESportKing] Mã Xác Thực Tài Khoản: " + otpCode);

            String tenNguoiNhan = (hoTen != null && !hoTen.isBlank()) ? hoTen : "Quý khách";

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html lang='vi'><head><meta charset='utf-8' /></head>");
            html.append("<body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;'>");
            html.append("<div style='padding: 30px 10px; text-align: center;'>");
            html.append("<div style='max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>");
            html.append("<div style='background: linear-gradient(135deg, #ff385c 0%, #e00b41 100%); padding: 28px; text-align: center;'>");
            html.append("<h1 style='color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;'>ESportKing</h1>");
            html.append("<p style='color: #ffe0e7; margin: 4px 0 0 0; font-size: 13px;'>Hệ Thống Thể Thao Đa Năng Chuẩn Thi Đấu Hà Nội</p>");
            html.append("</div>");
            html.append("<div style='padding: 32px 24px; text-align: center;'>");
            html.append("<h2 style='color: #0f172a; margin: 0 0 10px 0; font-size: 20px;'>Xác Minh Tài Khoản</h2>");
            html.append("<p style='color: #475569; font-size: 14px; line-height: 1.5;'>Xin chào <strong>").append(tenNguoiNhan).append("</strong>,<br/>Vui lòng sử dụng mã OTP dưới đây để hoàn tất kích hoạt tài khoản ESportKing:</p>");
            html.append("<div style='background: #fff1f4; border: 2px dashed #ff385c; border-radius: 12px; padding: 16px; margin: 18px auto; max-width: 260px; text-align: center;'>");
            html.append("<span style='font-size: 34px; font-weight: 900; color: #ff385c; letter-spacing: 6px;'>").append(otpCode).append("</span>");
            html.append("</div>");
            html.append("<p style='color: #d97706; font-size: 12px; font-weight: bold;'>Mã có hiệu lực trong vòng 5 phút.</p>");
            html.append("<p style='color: #94a3b8; font-size: 11px; margin-top: 20px;'>Chuỗi 3 cơ sở ESportKing: Cơ Sở 1 (Cầu Giấy) • Cơ Sở 2 (Đống Đa) • Cơ Sở 3 (Long Biên)</p>");
            html.append("</div>");
            html.append("</div></div></body></html>");

            helper.setText(html.toString(), true);
            mailSender.send(message);
            log.info("[EMAIL OTP] Da gui thanh cong ma OTP toi: {}", toEmail);
            return true;
        } catch (Exception ex) {
            log.warn("[EMAIL OTP] Khong the gui email toi {}: {}", toEmail, ex.getMessage());
            return false;
        }
    }
}
