package com.sportbooking.courtservice.dulieu;

import com.sportbooking.courtservice.thucthe.TienIch;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TraVeTienIch {
    private Long id;
    private String code;
    private String name;
    private String icon;

    public static TraVeTienIch tuThucThe(TienIch a) {
        if (a == null) return null;
        return TraVeTienIch.builder()
                .id(a.getId())
                .code(a.getCode())
                .name(a.getName())
                .icon(a.getIcon())
                .build();
    }
}
