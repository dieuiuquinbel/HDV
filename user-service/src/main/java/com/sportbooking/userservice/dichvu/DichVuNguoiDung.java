/**
 * File: DichVuNguoiDung.java
 * Muc dich: Xu ly toan bo nghiep vu nguoi dung (dang ky, dang nhap, dang xuat, doi trang thai).
 * Chuc nang: Ma hoa mat khau bang BCrypt, thiet lap cookie HttpOnly access_token, cap CSRF token, phan trang va khoa tai khoan.
 */
package com.sportbooking.userservice.dichvu;

import com.sportbooking.userservice.dulieu.TraVeDangKyOtp;
import com.sportbooking.userservice.dulieu.TraVeNguoiDung;
import com.sportbooking.userservice.dulieu.YeuCauDangKy;
import com.sportbooking.userservice.dulieu.YeuCauDangNhap;
import com.sportbooking.userservice.dulieu.YeuCauXacMinhOtp;
import com.sportbooking.userservice.dulieu.YeuCauTaoNguoiDungAdmin;
import com.sportbooking.userservice.dulieu.YeuCauCapNhatNguoiDungAdmin;
import com.sportbooking.userservice.ngoaile.LoiNghiepVu;
import com.sportbooking.userservice.khodulieu.KhoNguoiDung;
import com.sportbooking.userservice.khodulieu.KhoMaOtp;
import com.sportbooking.userservice.thucthe.MaOtp;
import com.sportbooking.userservice.thucthe.NguoiDung;
import com.sportbooking.userservice.thucthe.TrangThaiNguoiDung;
import com.sportbooking.userservice.thucthe.VaiTro;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuNguoiDung {

    private final KhoNguoiDung khoNguoiDung;
    private final KhoMaOtp khoMaOtp;
    private final PasswordEncoder passwordEncoder;
    private final DichVuJwt dichVuJwt;
    private final DichVuEmailOtp dichVuEmailOtp;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final String REDIS_TOKEN_VERSION_PREFIX = "user:token_version:";

    @Value("${app.otp.expose-in-response:false}")
    private boolean exposeOtpInResponse;

    private static final int OTP_RESEND_COOLDOWN_SECONDS = 10;
    private static final int MAX_OTP_RESEND_ATTEMPTS = 3;

    private final Map<String, Integer> failedAttemptsByEmail = new ConcurrentHashMap<>();
    private final Map<String, Integer> resendCountByEmail = new ConcurrentHashMap<>();

    @Transactional
    public TraVeDangKyOtp dangKy(YeuCauDangKy yeuCau) {
        if (khoNguoiDung.existsByEmail(yeuCau.getEmail())) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email này đã được sử dụng trên hệ thống.");
        }

        NguoiDung user = NguoiDung.builder()
                .email(yeuCau.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(yeuCau.getPassword()))
                .fullName(yeuCau.getFullName().trim())
                .phone(yeuCau.getPhone() != null ? yeuCau.getPhone().trim() : null)
                .role(VaiTro.CUSTOMER) // Mac dinh luon tao CUSTOMER cho cong khai
                .status(TrangThaiNguoiDung.PENDING_VERIFICATION) // Cho xac minh OTP moi thanh ACTIVE
                .tokenVersion(0)
                .build();

        user = khoNguoiDung.save(user);

        // Vo hieu hoa cac ma OTP cu chua xac minh cua email nay (neu co)
        khoMaOtp.invalidateOldOtps(user.getEmail());

        // Sinh ma OTP ngau nhien bang SecureRandom (an toan mat ma)
        java.security.SecureRandom secureRandom = new java.security.SecureRandom();
        String maOtpMoi = String.format("%06d", secureRandom.nextInt(1000000));
        MaOtp otpEntity = MaOtp.builder()
                .email(user.getEmail())
                .otpCode(maOtpMoi)
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .verified(false)
                .build();
        khoMaOtp.save(otpEntity);

        // Gui ma OTP bat dong bo (@Async) de API phan hoi tuc thi (<100ms), khong phai cho SMTP 3-4s
        dichVuEmailOtp.guiMaOtpAsync(user.getEmail(), user.getFullName(), maOtpMoi);
        String traVeOtp = exposeOtpInResponse ? maOtpMoi : null;

        String message = dichVuEmailOtp.daCauHinhSmtp()
                ? "Đăng ký thành công! Mã xác minh OTP đang được gửi tới email của bạn."
                : "Đăng ký thành công! Vui lòng xác minh mã OTP để kích hoạt tài khoản.";

        return TraVeDangKyOtp.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .otpCode(traVeOtp)
                .message(message)
                .build();
    }

    @Transactional
    public TraVeNguoiDung xacMinhOtp(YeuCauXacMinhOtp yeuCau) {
        String email = yeuCau.getEmail().trim().toLowerCase();
        NguoiDung user = khoNguoiDung.findByEmail(email)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy tài khoản với email này."));

        if (user.getStatus() != TrangThaiNguoiDung.PENDING_VERIFICATION) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "ACCOUNT_NOT_PENDING", "Tài khoản hiện không ở trạng thái chờ xác minh OTP.");
        }

        int failed = failedAttemptsByEmail.getOrDefault(email, 0);
        if (failed >= 5) {
            khoMaOtp.invalidateOldOtps(email);
            throw new LoiNghiepVu(HttpStatus.TOO_MANY_REQUESTS, "MAX_OTP_ATTEMPTS_EXCEEDED",
                    "Bạn đã thử sai quá 5 lần. Mã OTP này đã bị vô hiệu hóa, vui lòng yêu cầu mã mới.");
        }

        Optional<MaOtp> otpOpt = khoMaOtp.findTopByEmailAndOtpCodeAndVerifiedFalseOrderByIdDesc(email, yeuCau.getOtpCode());
        if (otpOpt.isEmpty()) {
            int newFailed = failed + 1;
            failedAttemptsByEmail.put(email, newFailed);
            int remaining = Math.max(0, 5 - newFailed);
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "INVALID_OTP",
                    "Mã OTP không chính xác (còn lại " + remaining + " lần thử).");
        }

        MaOtp otp = otpOpt.get();
        if (otp.getExpiresAt().isBefore(Instant.now())) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "OTP_EXPIRED", "Mã OTP đã hết hạn (quá 5 phút).");
        }

        failedAttemptsByEmail.remove(email);
        resendCountByEmail.remove(email);
        otp.setVerified(true);
        khoMaOtp.save(otp);

        user.setStatus(TrangThaiNguoiDung.ACTIVE);
        user = khoNguoiDung.save(user);

        return TraVeNguoiDung.tuThucThe(user);
    }

    @Transactional
    public TraVeDangKyOtp guiLaiOtp(String emailRaw) {
        String email = emailRaw.trim().toLowerCase();
        NguoiDung user = khoNguoiDung.findByEmail(email)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy tài khoản người dùng."));

        if (user.getStatus() != TrangThaiNguoiDung.PENDING_VERIFICATION) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "ACCOUNT_NOT_PENDING", "Tài khoản hiện không ở trạng thái chờ gửi lại OTP.");
        }

        // Chong tan cong spam OTP: toi da 3 lan gui lai
        int daGuiLai = resendCountByEmail.getOrDefault(email, 0);
        if (daGuiLai >= MAX_OTP_RESEND_ATTEMPTS) {
            throw new LoiNghiepVu(HttpStatus.TOO_MANY_REQUESTS, "OTP_RESEND_LIMIT_EXCEEDED",
                    "Bạn đã vượt quá giới hạn gửi lại tối đa " + MAX_OTP_RESEND_ATTEMPTS + " lần. Vui lòng kiểm tra hộp thư (kể cả mục Spam) hoặc thử lại sau.");
        }

        // Kiem tra cooldown: toi thieu 10 giay giua 2 lan yeu cau OTP
        Optional<MaOtp> otpGanNhat = khoMaOtp.findTopByEmailOrderByIdDesc(email);
        if (otpGanNhat.isPresent()) {
            Instant createdAt = otpGanNhat.get().getCreatedAt();
            if (createdAt != null && Instant.now().isBefore(createdAt.plusSeconds(OTP_RESEND_COOLDOWN_SECONDS))) {
                long remainingSeconds = Duration.between(Instant.now(), createdAt.plusSeconds(OTP_RESEND_COOLDOWN_SECONDS)).getSeconds();
                throw new LoiNghiepVu(HttpStatus.TOO_MANY_REQUESTS, "OTP_COOLDOWN",
                        "Vui lòng đợi " + Math.max(1, remainingSeconds) + " giây trước khi yêu cầu mã OTP mới.");
            }
        }

        // Vo hieu hoa cac ma OTP cu chua xac minh va tang bo dem gui lai
        khoMaOtp.invalidateOldOtps(email);
        failedAttemptsByEmail.remove(email);
        resendCountByEmail.put(email, daGuiLai + 1);

        java.security.SecureRandom secureRandom = new java.security.SecureRandom();
        String maOtpMoi = String.format("%06d", secureRandom.nextInt(1000000));
        MaOtp otpEntity = MaOtp.builder()
                .email(user.getEmail())
                .otpCode(maOtpMoi)
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .verified(false)
                .build();
        khoMaOtp.save(otpEntity);

        // Gui ma OTP bat dong bo (@Async) de nut Gui lai phan hoi ngay lap tuc
        dichVuEmailOtp.guiMaOtpAsync(user.getEmail(), user.getFullName(), maOtpMoi);
        String traVeOtp = exposeOtpInResponse ? maOtpMoi : null;

        String message = dichVuEmailOtp.daCauHinhSmtp()
                ? "Mã OTP mới đang được gửi vào hòm thư email của bạn."
                : "Mã OTP mới đã được tạo thành công (hiệu lực 5 phút).";

        return TraVeDangKyOtp.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .otpCode(traVeOtp)
                .message(message)
                .build();
    }

    @Transactional(readOnly = true)
    public TraVeNguoiDung dangNhap(YeuCauDangNhap yeuCau, HttpServletResponse phanHoi) {
        NguoiDung user = khoNguoiDung.findByEmail(yeuCau.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác."));

        if (!passwordEncoder.matches(yeuCau.getPassword(), user.getPasswordHash())) {
            throw new LoiNghiepVu(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác.");
        }

        if (user.getStatus() == TrangThaiNguoiDung.PENDING_VERIFICATION) {
            throw new LoiNghiepVu(HttpStatus.FORBIDDEN, "ACCOUNT_NOT_VERIFIED", "Tài khoản chưa được kích hoạt qua mã xác minh OTP.");
        }

        if (user.getStatus() == TrangThaiNguoiDung.LOCKED) {
            throw new LoiNghiepVu(HttpStatus.LOCKED, "USER_LOCKED", "Tài khoản đã bị tạm khóa bởi quản trị viên.");
        }

        String token = dichVuJwt.taoToken(user);

        // Cookie HttpOnly access_token cho JWT (7 ngay duy tri dang nhap)
        Cookie jwtCookie = new Cookie("access_token", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(7 * 24 * 60 * 60);
        phanHoi.addCookie(jwtCookie);

        // Cookie XSRF-TOKEN cho double submit csrf (7 ngay)
        String csrfToken = UUID.randomUUID().toString();
        Cookie csrfCookie = new Cookie("XSRF-TOKEN", csrfToken);
        csrfCookie.setHttpOnly(false);
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(7 * 24 * 60 * 60);
        phanHoi.addCookie(csrfCookie);

        return TraVeNguoiDung.tuThucThe(user);
    }

    public void dangXuat(HttpServletResponse phanHoi) {
        Cookie jwtCookie = new Cookie("access_token", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        phanHoi.addCookie(jwtCookie);

        Cookie csrfCookie = new Cookie("XSRF-TOKEN", "");
        csrfCookie.setHttpOnly(false);
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(0);
        phanHoi.addCookie(csrfCookie);
    }

    @Transactional(readOnly = true)
    public TraVeNguoiDung layThongTinBanThan(Long id) {
        NguoiDung user = khoNguoiDung.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy thông tin người dùng."));
        return TraVeNguoiDung.tuThucThe(user);
    }

    @Transactional(readOnly = true)
    public Page<TraVeNguoiDung> layDanhSachNguoiDung(VaiTro role, TrangThaiNguoiDung status, Pageable pageable) {
        Page<NguoiDung> trangDuLieu;
        if (role != null && status != null) {
            trangDuLieu = khoNguoiDung.findByRoleAndStatus(role, status, pageable);
        } else if (role != null) {
            trangDuLieu = khoNguoiDung.findByRole(role, pageable);
        } else if (status != null) {
            trangDuLieu = khoNguoiDung.findByStatus(status, pageable);
        } else {
            trangDuLieu = khoNguoiDung.findAll(pageable);
        }
        return trangDuLieu.map(TraVeNguoiDung::tuThucThe);
    }

    @Transactional
    public TraVeNguoiDung capNhatTrangThai(Long id, TrangThaiNguoiDung statusMoi) {
        NguoiDung user = khoNguoiDung.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy thông tin người dùng."));

        user.setStatus(statusMoi);
        user.setTokenVersion(user.getTokenVersion() + 1); // Tang phien de huy token cu
        user = khoNguoiDung.save(user);

        int cacheVal = (statusMoi == TrangThaiNguoiDung.ACTIVE) ? user.getTokenVersion() : -1;
        dongBoCacheTokenVersionRedis(user.getId(), cacheVal);

        return TraVeNguoiDung.tuThucThe(user);
    }

    @Transactional
    public TraVeNguoiDung taoNguoiDungAdmin(YeuCauTaoNguoiDungAdmin yeuCau) {
        if (khoNguoiDung.existsByEmail(yeuCau.getEmail().trim().toLowerCase())) {
            throw new LoiNghiepVu(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email này đã được sử dụng trên hệ thống.");
        }
        String passwordRaw = (yeuCau.getPassword() != null && !yeuCau.getPassword().isBlank()) 
                ? yeuCau.getPassword().trim() 
                : "123456";

        NguoiDung user = NguoiDung.builder()
                .email(yeuCau.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(passwordRaw))
                .fullName(yeuCau.getFullName().trim())
                .phone(yeuCau.getPhone() != null ? yeuCau.getPhone().trim() : null)
                .role(yeuCau.getRole() != null ? yeuCau.getRole() : VaiTro.CUSTOMER)
                .status(TrangThaiNguoiDung.ACTIVE)
                .tokenVersion(0)
                .build();

        user = khoNguoiDung.save(user);
        return TraVeNguoiDung.tuThucThe(user);
    }

    @Transactional
    public TraVeNguoiDung capNhatNguoiDungAdmin(Long id, YeuCauCapNhatNguoiDungAdmin yeuCau) {
        NguoiDung user = khoNguoiDung.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy thông tin người dùng."));

        if (yeuCau.getFullName() != null && !yeuCau.getFullName().isBlank()) {
            user.setFullName(yeuCau.getFullName().trim());
        }
        if (yeuCau.getPhone() != null) {
            user.setPhone(yeuCau.getPhone().trim());
        }
        boolean doiQuyen = false;
        if (yeuCau.getRole() != null) {
            user.setRole(yeuCau.getRole());
            user.setTokenVersion(user.getTokenVersion() + 1); // Thay doi quyen thi lam moi phien
            doiQuyen = true;
        }
        user = khoNguoiDung.save(user);
        if (doiQuyen) {
            int cacheVal = (user.getStatus() == TrangThaiNguoiDung.ACTIVE) ? user.getTokenVersion() : -1;
            dongBoCacheTokenVersionRedis(user.getId(), cacheVal);
        }
        return TraVeNguoiDung.tuThucThe(user);
    }

    @Transactional
    public void xoaNguoiDung(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "CANNOT_DELETE_SELF", "Bạn không thể xóa tài khoản của chính mình.");
        }
        NguoiDung user = khoNguoiDung.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy thông tin người dùng."));

        java.util.List<String> coreEmails = java.util.List.of(
                "admin@esportking.vn",
                "staff_cs1@esportking.vn",
                "staff_cs2@esportking.vn",
                "staff_cs3@esportking.vn",
                "customer@esportking.vn"
        );
        if (coreEmails.contains(user.getEmail().toLowerCase())) {
            throw new LoiNghiepVu(HttpStatus.BAD_REQUEST, "CORE_ACCOUNT_PROTECTED", "Đây là tài khoản chuẩn của hệ thống, không được phép xóa. Bạn có thể sử dụng chức năng Khóa tài khoản.");
        }

        khoNguoiDung.delete(user);
        dongBoCacheTokenVersionRedis(id, -1);
    }

    private void dongBoCacheTokenVersionRedis(Long userId, int versionValue) {
        if (redisTemplate == null || userId == null) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(
                    REDIS_TOKEN_VERSION_PREFIX + userId,
                    String.valueOf(versionValue),
                    java.time.Duration.ofMinutes(5)
            );
            log.info("[Redis] Da dong bo cache {}{} = {}", REDIS_TOKEN_VERSION_PREFIX, userId, versionValue);
        } catch (Exception ex) {
            log.debug("[Redis] Khong the dong bo cache cho userId={} ({}), bo qua.", userId, ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Integer layTokenVersion(Long id) {
        return khoNguoiDung.findById(id)
                .filter(u -> u.getStatus() == TrangThaiNguoiDung.ACTIVE)
                .map(NguoiDung::getTokenVersion)
                .orElse(-1);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> layThongTinLienHe(Long id) {
        NguoiDung user = khoNguoiDung.findById(id)
                .orElseThrow(() -> new LoiNghiepVu(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng."));
        return Map.of(
                "userId", user.getId(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "fullName", user.getFullName() != null ? user.getFullName() : "Quý khách"
        );
    }
}
