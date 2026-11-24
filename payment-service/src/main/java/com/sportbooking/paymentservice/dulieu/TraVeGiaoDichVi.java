package com.sportbooking.paymentservice.dulieu;

import com.sportbooking.paymentservice.thucthe.GiaoDichVi;
import com.sportbooking.paymentservice.thucthe.LoaiGiaoDichVi;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TraVeGiaoDichVi {
    private Long id;
    private Long walletId;
    private Long userId;
    private LoaiGiaoDichVi type;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String description;
    private String referenceId;
    private Instant createdAt;

    public static TraVeGiaoDichVi tuThucThe(GiaoDichVi g) {
        return TraVeGiaoDichVi.builder()
                .id(g.getId())
                .walletId(g.getWalletId())
                .userId(g.getUserId())
                .type(g.getType())
                .amount(g.getAmount())
                .balanceBefore(g.getBalanceBefore())
                .balanceAfter(g.getBalanceAfter())
                .description(g.getDescription())
                .referenceId(g.getReferenceId())
                .createdAt(g.getCreatedAt())
                .build();
    }
}
