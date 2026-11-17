/**
 * File: TraVeCumSan.java
 * Muc dich: DTO tra ve thong tin chi tiet ve mot cum san (Venue).
 * Chuc nang: Kem danh sach cac san con, danh sach tien ich (amenities), gia tu thap nhat va link Google Maps.
 */
package com.sportbooking.courtservice.dulieu;

import com.sportbooking.courtservice.thucthe.CumSan;
import com.sportbooking.courtservice.thucthe.TrangThaiCumSan;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class TraVeCumSan {
    private Long id;
    private Long ownerId;
    private String name;
    private String address;
    private String district;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
    private TrangThaiCumSan status;
    private String googleMapsUrl;
    private BigDecimal minPrice;
    private List<TraVeTienIch> amenities;
    private List<TraVeSanCon> courts;
    private Instant createdAt;

    public static TraVeCumSan tuThucThe(CumSan venue, List<TraVeSanCon> courts) {
        return tuThucThe(venue, courts, List.of());
    }

    public static TraVeCumSan tuThucThe(CumSan venue, List<TraVeSanCon> courts, List<TraVeTienIch> amenities) {
        String mapsUrl = null;
        if (venue.getLatitude() != null && venue.getLongitude() != null) {
            mapsUrl = "https://www.google.com/maps/dir/?api=1&destination="
                    + venue.getLatitude() + "," + venue.getLongitude();
        }

        BigDecimal minPrice = null;
        if (courts != null && !courts.isEmpty()) {
            minPrice = courts.stream()
                    .map(TraVeSanCon::getBasePrice)
                    .filter(p -> p != null)
                    .min(BigDecimal::compareTo)
                    .orElse(null);
        }

        return TraVeCumSan.builder()
                .id(venue.getId())
                .ownerId(venue.getOwnerId())
                .name(venue.getName())
                .address(venue.getAddress())
                .district(venue.getDistrict())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .description(venue.getDescription())
                .status(venue.getStatus())
                .googleMapsUrl(mapsUrl)
                .minPrice(minPrice)
                .amenities(amenities)
                .courts(courts)
                .createdAt(venue.getCreatedAt())
                .build();
    }
}
