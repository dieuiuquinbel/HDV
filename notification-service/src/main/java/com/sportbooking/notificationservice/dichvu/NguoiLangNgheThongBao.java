/**
 * File: NguoiLangNgheThongBao.java
 * Muc dich: Consumer RabbitMQ lang nghe su kien thong bao tu booking-service va payment-service (bat dong bo).
 * Chuc nang: Nhan message JSON, kiem tra chong trung bang eventId va luu thong bao vao notification_db.
 */
package com.sportbooking.notificationservice.dichvu;

import com.sportbooking.notificationservice.cauhinh.CauHinhRabbitMq;
import com.sportbooking.notificationservice.dulieu.YeuCauTaoThongBao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NguoiLangNgheThongBao {

    private final DichVuThongBao dichVuThongBao;

    @RabbitListener(queues = CauHinhRabbitMq.NOTIFICATION_QUEUE)
    public void xuLySuKienThongBao(YeuCauTaoThongBao yeuCau) {
        if (yeuCau == null || yeuCau.getUserId() == null || yeuCau.getTitle() == null || yeuCau.getMessage() == null) {
            log.warn("[RabbitMQ] Bo qua message thong bao khong hop le: {}", yeuCau);
            return;
        }
        if (yeuCau.getType() == null || yeuCau.getType().isBlank()) {
            yeuCau.setType("SYSTEM");
        }
        log.info("[RabbitMQ] Nhan su kien thong bao bat dong bo: type={}, userId={}, eventId={}",
                yeuCau.getType(), yeuCau.getUserId(), yeuCau.getEventId());
        dichVuThongBao.taoThongBao(yeuCau);
    }
}
