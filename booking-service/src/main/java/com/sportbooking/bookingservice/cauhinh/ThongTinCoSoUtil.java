package com.sportbooking.bookingservice.cauhinh;

public final class ThongTinCoSoUtil {

    private ThongTinCoSoUtil() {}

    public static String tenCoSo(Long venueId) {
        if (venueId == null || venueId == 1L) return "Cơ Sở 1 - Cầu Giấy";
        if (venueId == 2L) return "Cơ Sở 2 - Đống Đa";
        if (venueId == 3L) return "Cơ Sở 3 - Hà Đông";
        return "Cơ Sở #" + venueId;
    }

    public static String diaChiCoSo(Long venueId) {
        if (venueId == null || venueId == 1L) return "Số 18 Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội";
        if (venueId == 2L) return "Số 102 Phố Trường Chinh, Phường Phương Mai, Quận Đống Đa, Hà Nội";
        if (venueId == 3L) return "Số 27 Đường Quang Trung, Phường Quang Trung, Quận Hà Đông, Hà Nội";
        return "Hà Nội, Việt Nam";
    }

    public static String googleMapsUrl(Long venueId) {
        if (venueId == null || venueId == 1L) return "https://www.google.com/maps/dir/?api=1&destination=18+Duy+Tan,+Dich+Vong+Hau,+Cau+Giay,+Ha+Noi";
        if (venueId == 2L) return "https://www.google.com/maps/dir/?api=1&destination=102+Truong+Chinh,+Phuong+Mai,+Dong+Da,+Ha+Noi";
        if (venueId == 3L) return "https://www.google.com/maps/dir/?api=1&destination=27+Quang+Trung,+Ha+Dong,+Ha+Noi";
        return "https://www.google.com/maps/search/?api=1&query=ESportKing+Ha+Noi";
    }
}
