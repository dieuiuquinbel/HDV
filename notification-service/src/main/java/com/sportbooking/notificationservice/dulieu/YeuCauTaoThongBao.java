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

    // Thong tin bo sung de gui Email HTML dep (QR check-in, dia chi, link Google Maps)
    private String checkinToken;
    private String venueName;
    private String venueAddress;
    private String googleMapsUrl;
    private String courtName;
    private String bookingTime;
}
