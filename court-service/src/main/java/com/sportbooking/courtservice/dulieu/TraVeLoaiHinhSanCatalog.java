package com.sportbooking.courtservice.dulieu;

import com.sportbooking.courtservice.thucthe.LoaiHinhSanCatalog;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TraVeLoaiHinhSanCatalog {
    private Long id;
    private Long sportTypeId;
    private String code;
    private String name;
    private String configType;
    private String surface;
    private String environment;
    private Integer defaultCapacity;
    private String dimensions;

    public static TraVeLoaiHinhSanCatalog tuThucThe(LoaiHinhSanCatalog ctc) {
        if (ctc == null) return null;
        return TraVeLoaiHinhSanCatalog.builder()
                .id(ctc.getId())
                .sportTypeId(ctc.getSportTypeId())
                .code(ctc.getCode())
                .name(ctc.getName())
                .configType(ctc.getConfigType())
                .surface(ctc.getSurface())
                .environment(ctc.getEnvironment())
                .defaultCapacity(ctc.getDefaultCapacity())
                .dimensions(ctc.getDimensions())
                .build();
    }
}
