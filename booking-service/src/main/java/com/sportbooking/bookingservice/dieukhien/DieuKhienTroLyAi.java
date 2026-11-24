/**
 * File: DieuKhienTroLyAi.java
 * Muc dich: REST API cho Chatbot Tro Ly AI ESportKing (/bookings/assistant/chat).
 */
package com.sportbooking.bookingservice.dieukhien;

import com.sportbooking.bookingservice.dichvu.DichVuTroLyAi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings/assistant")
@RequiredArgsConstructor
public class DieuKhienTroLyAi {

    private final DichVuTroLyAi dichVuTroLyAi;

    @SuppressWarnings("unchecked")
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> troChuyenVoiTroLy(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        String message = body.get("message") != null ? String.valueOf(body.get("message")) : "";
        List<Map<String, String>> history = body.get("history") instanceof List<?> list
                ? (List<Map<String, String>>) list
                : List.of();
        String contextInfo = body.get("context") != null ? String.valueOf(body.get("context")) : "";
        if (userId != null && contextInfo.isBlank()) {
            contextInfo = "Người dùng đã đăng nhập (userId=" + userId + ", role=" + (userRole != null ? userRole : "CUSTOMER") + ").";
        }

        Map<String, Object> result = dichVuTroLyAi.traLoiKhachHang(message, history, contextInfo);
        return ResponseEntity.ok(result);
    }
}
