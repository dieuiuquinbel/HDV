/**
 * File: DichVuThongBao.java
 * Muc dich: Xu ly nghiep vu tao thong bao, danh dau da doc va phan trang thong bao cua nguoi dung.
 * Chuc nang: Luu thong bao vao co so du lieu, mo phong gui email thong bao va dem so luong chua doc.
 */
package com.sportbooking.notificationservice.dichvu;

import com.sportbooking.notificationservice.dulieu.TraVeThongBao;
import com.sportbooking.notificationservice.dulieu.YeuCauTaoThongBao;
import com.sportbooking.notificationservice.khodulieu.KhoThongBao;
import com.sportbooking.notificationservice.thucthe.ThongBao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuThongBao {

    private final KhoThongBao khoThongBao;

    @Transactional
    public TraVeThongBao taoThongBao(YeuCauTaoThongBao yeuCau) {
        if (yeuCau.getEventId() != null && !yeuCau.getEventId().trim().isEmpty()) {
            if (khoThongBao.existsByEventId(yeuCau.getEventId().trim())) {
                log.info("Thong bao voi eventId={} da ton tai (Idempotent), bo qua tao trung", yeuCau.getEventId());
                return null;
            }
        }

        ThongBao tb = ThongBao.builder()
                .userId(yeuCau.getUserId())
                .eventId(yeuCau.getEventId())
                .title(yeuCau.getTitle().trim())
                .message(yeuCau.getMessage().trim())
                .type(yeuCau.getType().trim().toUpperCase())
                .isRead(false)
                .build();

        tb = khoThongBao.save(tb);
        log.info("[EMAIL & IN-APP NOTIFICATION] Da gui toi userId={}: {} - {}", tb.getUserId(), tb.getTitle(), tb.getMessage());
        return TraVeThongBao.tuThucThe(tb);
    }

    @Transactional(readOnly = true)
    public Page<TraVeThongBao> layThongBaoCuaToi(Long userId, Pageable pageable) {
        return khoThongBao.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(TraVeThongBao::tuThucThe);
    }

    @Transactional
    public boolean danhDauDaDoc(Long notificationId, Long userId) {
        return khoThongBao.findById(notificationId).map(tb -> {
            if (tb.getUserId().equals(userId)) {
                tb.setIsRead(true);
                khoThongBao.save(tb);
                return true;
            }
            return false;
        }).orElse(false);
    }

    @Transactional(readOnly = true)
    public long demChuaDoc(Long userId) {
        return khoThongBao.countByUserIdAndIsReadFalse(userId);
    }
}
