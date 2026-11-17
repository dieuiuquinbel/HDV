/**
 * File: DichVuDanhGia.java
 * Muc dich: Xu ly nghiep vu danh gia san the thao sau khi hoan tat luot choi (Mức 3).
 * Chuc nang: Kiem tra don dat da COMPLETED, 1 don chi danh gia 1 lan (idempotent/unique), tinh diem rating trung binh.
 */
package com.sportbooking.reviewservice.dichvu;

import com.sportbooking.reviewservice.dulieu.TraVeDanhGia;
import com.sportbooking.reviewservice.dulieu.TraVeTongQuanRating;
import com.sportbooking.reviewservice.dulieu.YeuCauTaoDanhGia;
import com.sportbooking.reviewservice.khodulieu.KhoDanhGiaSan;
import com.sportbooking.reviewservice.thucthe.DanhGiaSan;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DichVuDanhGia {

    private final KhoDanhGiaSan khoDanhGiaSan;

    @Value("${booking-service.url}")
    private String bookingServiceUrl;

    @Value("${internal.api-key}")
    private String internalApiKey;

    @Transactional
    public TraVeDanhGia taoDanhGia(Long userId, String userEmail, YeuCauTaoDanhGia yeuCau) {
        // 1. Kiem tra xem don dat da duoc danh gia chua
        if (khoDanhGiaSan.findByBookingId(yeuCau.getBookingId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Don dat nay da duoc danh gia truoc do");
        }

        // 2. Kiem tra don dat co COMPLETED, dung chu so huu va dung courtId qua Booking Service (Fail-Closed)
        try {
            RestClient client = RestClient.builder().baseUrl(bookingServiceUrl).build();
            Map res = client.get()
                    .uri("/internal/v1/bookings/{id}/payable-summary", yeuCau.getBookingId())
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(Map.class);

            if (res == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin đơn đặt sân từ hệ thống.");
            }

            Long customerId = Long.valueOf(res.get("customerId").toString());
            String status = res.get("status") != null ? res.get("status").toString() : "";

            if (!customerId.equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải chủ đơn đặt sân này.");
            }

            // Kiem tra san duoc review co trung voi san da dat khong
            if (res.get("courtId") != null) {
                Long bookingCourtId = Long.valueOf(res.get("courtId").toString());
                if (!bookingCourtId.equals(yeuCau.getCourtId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sân được đánh giá không khớp với đơn đặt sân của bạn.");
                }
            }

            // Chi danh gia sau khi don dat da hoan tat gio choi (COMPLETED)
            if (!"COMPLETED".equals(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể đánh giá sau khi đã hoàn tất giờ chơi.");
            }
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound nfe) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đặt sân tương ứng.");
        } catch (Exception ex) {
            log.error("Loi ket noi sang Booking Service de xac minh don dat #{}: {}", yeuCau.getBookingId(), ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dịch vụ đặt sân tạm thời không khả dụng để xác minh đánh giá. Vui lòng thử lại sau.");
        }

        DanhGiaSan review = DanhGiaSan.builder()
                .bookingId(yeuCau.getBookingId())
                .courtId(yeuCau.getCourtId())
                .customerId(userId)
                .customerName(userEmail != null ? userEmail.split("@")[0] : "Khách Hàng")
                .rating(yeuCau.getRating())
                .comment(yeuCau.getComment() != null ? yeuCau.getComment().trim() : "")
                .status("PUBLISHED")
                .build();

        review = khoDanhGiaSan.save(review);
        return TraVeDanhGia.tuThucThe(review);
    }

    @Transactional(readOnly = true)
    public Page<TraVeDanhGia> layDanhGiaTheoSan(Long courtId, Pageable pageable) {
        return khoDanhGiaSan.findByCourtIdAndStatusOrderByCreatedAtDesc(courtId, "PUBLISHED", pageable)
                .map(TraVeDanhGia::tuThucThe);
    }

    @Transactional(readOnly = true)
    public TraVeTongQuanRating layTongQuanRating(Long courtId) {
        Double avg = khoDanhGiaSan.tinhDiemTrungBinh(courtId);
        long count = khoDanhGiaSan.countByCourtIdAndStatus(courtId, "PUBLISHED");

        return TraVeTongQuanRating.builder()
                .courtId(courtId)
                .averageRating((count > 0 && avg != null) ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .totalReviews(count)
                .build();
    }
}
