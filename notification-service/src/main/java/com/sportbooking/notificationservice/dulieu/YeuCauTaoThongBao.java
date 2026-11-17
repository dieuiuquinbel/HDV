/**
 * File: YeuCauTaoThongBao.java
 * Muc dich: DTO tiep nhan yeu cau tao thong bao noi bo tu Booking Service, Payment Service hoac User Service.
 * Chuc nang: Nhan userId, tieu de, message va loai event de luu vao DB va gui toi nguoi dung.
 */
package com.sportbooking.notificationservice.dulieu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauTaoThongBao {
    @NotNull(message = "userId la bat buoc")
    private Long userId;

    @NotBlank(message = "Tieu de la bat buoc")
    private String title;

    @NotBlank(message = "Noi dung la bat buoc")
    private String message;

    @NotBlank(message = "Loai thong bao la bat buoc")
    private String type;

    private String eventId;
}
