/**
 * File: TraVeThongBao.java
 * Muc dich: DTO tra ve thong tin thong bao cho phia client hien thi tren chuong thong bao.
 * Chuc nang: Dong goi id, tieu de, noi dung, loai su kien, trang thai da doc va thoi gian tao.
 */
package com.sportbooking.notificationservice.dulieu;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sportbooking.notificationservice.thucthe.ThongBao;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TraVeThongBao {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;

    @JsonProperty("isRead")
    private Boolean isRead;

    @JsonProperty("read")
    public Boolean getRead() {
        return this.isRead;
    }

    private Instant createdAt;

    public static TraVeThongBao tuThucThe(ThongBao t) {
        return TraVeThongBao.builder()
                .id(t.getId())
                .userId(t.getUserId())
                .title(t.getTitle())
                .message(t.getMessage())
                .type(t.getType())
                .isRead(t.getIsRead())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
