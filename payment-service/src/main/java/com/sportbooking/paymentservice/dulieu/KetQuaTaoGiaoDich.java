/**
 * File: KetQuaTaoGiaoDich.java
 * Muc dich: Wrapper chua thong tin giao dich va co cho biet transaction moi hay da ton tai tu truoc.
 * Chuc nang: Giup Controller tra 201 Created cho don moi hoac 200 OK cho don da ton tai (Idempotent).
 */
package com.sportbooking.paymentservice.dulieu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KetQuaTaoGiaoDich {
    private TraVeGiaoDichThanhToan giaoDich;
    private boolean isMoiTao;
}
