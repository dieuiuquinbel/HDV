package com.sportbooking.paymentservice.dulieu;

import com.sportbooking.paymentservice.thucthe.ThongTinVi;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class TraVeThongTinVi {
    private Long id;
    private Long userId;
    private BigDecimal balance;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<TraVeGiaoDichVi> recentTransactions;

    public static TraVeThongTinVi tuThucThe(ThongTinVi w, List<TraVeGiaoDichVi> recent) {
        return TraVeThongTinVi.builder()
                .id(w.getId())
                .userId(w.getUserId())
                .balance(w.getBalance())
                .status(w.getStatus())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .recentTransactions(recent)
                .build();
    }
}
