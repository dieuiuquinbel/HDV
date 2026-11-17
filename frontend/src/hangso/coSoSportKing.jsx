/**
 * File: coSoSportKing.js
 * Muc dich: Dinh nghia thong tin 3 co so the thao ESportKing Ha Noi va cac bien the loai san con.
 */
import React from 'react';
import { Flame, Zap, Trophy } from 'lucide-react';

export const THONG_TIN_CO_SO = {
  1: {
    ten: 'CƠ SỞ 1 • CẦU GIẤY',
    tenDayDu: 'Trung Tâm Thể Thao eSportKing - Cơ Sở 1 (Cầu Giấy)',
    diaChi: 'Số 18 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    hotline: '0981.234.567',
    badgeClass: 'bg-gradient-to-r from-rose-600 to-red-500 text-white',
    icon: <Flame className="w-3.5 h-3.5 fill-white text-white" />
  },
  2: {
    ten: 'CƠ SỞ 2 • ĐỐNG ĐA',
    tenDayDu: 'Trung Tâm Thể Thao eSportKing - Cơ Sở 2 (Đống Đa)',
    diaChi: 'Số 102 Trường Chinh, Phường Phương Mai, Quận Đống Đa, Hà Nội',
    hotline: '0982.345.678',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    icon: <Zap className="w-3.5 h-3.5 fill-white text-white" />
  },
  3: {
    ten: 'CƠ SỞ 3 • HÀ ĐÔNG - LONG BIÊN',
    tenDayDu: 'Trung Tâm Thể Thao eSportKing - Cơ Sở 3 (Hà Đông / Long Biên)',
    diaChi: 'Số 27 Đường Cổ Linh, Phường Long Biên & Quang Trung, Hà Đông, Hà Nội',
    hotline: '0983.456.789',
    badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    icon: <Trophy className="w-3.5 h-3.5 text-white" />
  }
};

export const BIEN_THE_SAN_CON = {
  FOOTBALL: {
    '5': [
      { id: 101, name: 'Sân 5-A1 (Cỏ Nhân Tạo Tiêu Chuẩn)', surface: 'Cỏ nhân tạo 5cm ngoài trời', price: 200000, tag: 'TIẾT KIỆM', icon: '🌱', desc: 'Mặt cỏ sợi đúc mềm, hạt cao su đàn hồi êm chân, phù hợp giao lưu phong trào' },
      { id: 102, name: 'Sân 5-A2 (Có Mái Vòm Che Mưa Nắng)', surface: 'Mái vòm khung thép 12m', price: 260000, tag: 'HOT NHẤT 🔥', icon: '🏛️', desc: 'Mái vòm cách nhiệt cao ráo, thi đấu bất chấp mưa bão hay nắng gắt' },
      { id: 103, name: 'Sân 5-A3 (Cỏ FIFA Pro Kim Cương)', surface: 'Cỏ sợi gân kim cương', price: 290000, tag: 'CAO CẤP ⭐', icon: '💎', desc: 'Chuẩn FIFA Quality Pro, chống trượt lật sơ cổ chân, bóng lăn êm ái' },
      { id: 104, name: 'Sân 5-A4 (Sân Futsal Nền Đệm Silicon PU)', surface: 'Nền đệm Silicon giảm chấn', price: 220000, tag: 'FUTSAL', icon: '👟', desc: 'Sân phẳng lì độ nảy chuẩn, bảo vệ khớp gối, bóng lăn tốc độ cao' }
    ],
    '7': [
      { id: 201, name: 'Sân 7-B1 (Cỏ Nhân Tạo Tiêu Chuẩn)', surface: 'Cỏ nhân tạo 7 người ngoài trời', price: 350000, tag: 'PHỔ BIẾN', icon: '🌱', desc: 'Kích thước tiêu chuẩn 30m x 50m, thoát nước ngầm cực tốt khi mưa' },
      { id: 202, name: 'Sân 7-B2 (Có Mái Vòm Che Toàn Phần)', surface: 'Mái vòm che phủ 100%', price: 450000, tag: 'KHUYÊN DÙNG 🌟', icon: '🏛️', desc: 'Khung vòm thép hiện đại, thoáng gió 4 phía, không bao giờ lo hoãn trận vì thời tiết' },
      { id: 203, name: 'Sân 7-B3 (Cỏ FIFA Pro Khán Đài VIP)', surface: 'Cỏ FIFA Pro sợi kim cương', price: 490000, tag: 'ĐẲNG CẤP', icon: '💎', desc: 'Sân trung tâm có khán đài có mái, ghế đệm cabin HLV và camera AI quay bàn thắng' },
      { id: 204, name: 'Sân 7-B4 (Sân Đệm Silicon Đa Năng)', surface: 'Mặt nền Silicon PU chống trầy', price: 330000, tag: 'ĐA NĂNG', icon: '👟', desc: 'Thi đấu tốc độ cao, vạch vôi sắc nét, hệ thống đèn chiếu sáng cao cấp' }
    ],
    '11': [
      { id: 301, name: 'Sân 11-C1 (Cỏ Tự Nhiên Chuẩn Quốc Gia)', surface: 'Cỏ tự nhiên Bermuda mịn màng', price: 650000, tag: 'QUỐC GIA', icon: '🌾', desc: 'Kích thước 68m x 105m, cỏ tự nhiên cắt tỉa định kỳ, mặt sân phẳng chuẩn thi đấu' },
      { id: 302, name: 'Sân 11-C2 (Cỏ FIFA Pro Khán Đài 500 Chỗ)', surface: 'Cỏ nhân tạo FIFA Quality Pro', price: 750000, tag: 'TRUNG TÂM 🔥', icon: '🏟️', desc: 'Khán đài 500 chỗ ngồi có mái, 8 cột đèn cao áp 1000 Lux, cabin HLV 2 đội' },
      { id: 303, name: 'Sân 11-C3 (Sân Có Mái Vòm Khung Thép Lớn)', surface: 'Vòm thép khổng lồ cách nhiệt', price: 850000, tag: 'VIP ĐẶC BIỆT', icon: '🏛️', desc: 'Tổ hợp sân 11 có mái che quy mô hiếm có tại Hà Nội, thi đấu giải đấu bất chấp thời tiết' }
    ]
  },
  BADMINTON: {
    default: [
      { id: 401, name: 'Sân Cầu Lông A1 (Thảm PVC BWF Tiêu Chuẩn)', surface: 'Thảm PVC vân cát 4.5mm', price: 100000, tag: 'TIÊU CHUẨN', icon: '🏸', desc: 'Đạt chuẩn Liên đoàn Cầu lông Thế giới BWF, chống trơn trượt' },
      { id: 402, name: 'Sân Cầu Lông A2 (Thảm Yonex Thi Đấu Đỉnh Cao)', surface: 'Thảm Yonex Super Series', price: 125000, tag: 'THI ĐẤU 🌟', icon: '🥇', desc: 'Độ đàn hồi cực êm bảo vệ khớp gối, đèn chiếu viền không gây chói mắt khi ngửa mặt' },
      { id: 403, name: 'Sân Cầu Lông A3 (Sàn Gỗ Tự Nhiên Giảm Chấn)', surface: 'Sàn gỗ phong Bắc Mỹ', price: 135000, tag: 'SÀN GỖ VIP', icon: '🪵', desc: 'Hệ thống đệm cao su giảm chấn tối đa, chống sốc tuyệt hảo cho vận động viên' },
      { id: 404, name: 'Sân Cầu Lông A4 (Phòng VIP Điều Hòa Kín Gió)', surface: 'Thảm Yonex + Điều hòa', price: 160000, tag: 'VIP ĐIỀU HÒA', icon: '❄️', desc: 'Không gian kín gió 100%, đường cầu bay chuẩn xác, điều hòa mát rượi dễ chịu' }
    ]
  },
  TENNIS: {
    default: [
      { id: 501, name: 'Sân Tennis D1 (Mặt Cứng Decoturf US Open)', surface: 'Sơn Decoturf 9 lớp chuẩn Mỹ', price: 190000, tag: 'US OPEN', icon: '🎾', desc: 'Độ nảy bóng chuẩn xác, tốc độ trung bình nhanh, lưới thi đấu chuyên nghiệp' },
      { id: 502, name: 'Sân Tennis D2 (Sân Đất Nện Roland Garros)', surface: 'Đất nện đỏ nhập khẩu', price: 240000, tag: 'ĐẤT NỆN 🔥', icon: '🧱', desc: 'Mặt sân trượt êm chân, độ nảy bóng chậm giúp đánh bền bỉ và bảo vệ khớp cổ chân' },
      { id: 503, name: 'Sân Tennis D3 (Có Mái Che Mưa Nắng Toàn Phần)', surface: 'Mái vòm thép + Decoturf', price: 280000, tag: 'MÁI CHE 🌟', icon: '🏛️', desc: 'Không lo thời tiết, quạt công nghiệp mát rượi, ánh sáng LED chống bóng đổ' },
      { id: 504, name: 'Sân Tennis D4 (Sân Trung Tâm Khán Đài & Đèn 1000 Lux)', surface: 'Decoturf + Khán đài', price: 320000, tag: 'TRUNG TÂM', icon: '🏆', desc: 'Sân trung tâm tổ chức giải đấu, có ghế trọng tài cao và dàn đèn pha cao áp' }
    ]
  },
  BASKETBALL: {
    default: [
      { id: 601, name: 'Sân Bóng Rổ E1 (Nửa Sân 3x3 Streetball Ngoài Trời)', surface: 'Bề mặt sơn Acrylic chống trượt', price: 150000, tag: 'STREETBALL', icon: '🏀', desc: 'Nửa sân tiêu chuẩn 3x3, bảng kính cường lực đàn hồi, loa phát nhạc sôi động' },
      { id: 602, name: 'Sân Bóng Rổ E2 (Toàn Sân 5x5 Đệm Silicon PU)', surface: 'Đệm Silicon PU 8mm giảm chấn', price: 280000, tag: '5X5 TIÊU CHUẨN', icon: '👟', desc: 'Toàn sân 28m x 15m, trụ rổ thủy lực di động chuẩn FIBA, độ bám giày cực cao' },
      { id: 603, name: 'Sân Bóng Rổ E3 (Sàn Gỗ Trong Nhà Chuẩn FIBA)', surface: 'Sàn gỗ Maple chuyên nghiệp', price: 380000, tag: 'FIBA VIP 🌟', icon: '🪵', desc: 'Sàn gỗ bóng loáng chuẩn giải nhà nghề VBA, điều hòa mát mẻ, bảng điểm điện tử' },
      { id: 604, name: 'Sân Bóng Rổ E4 (Sân VIP Bảng Điểm Điện Tử 24s)', surface: 'Sàn gỗ + Đồng hồ 24 giây', price: 420000, tag: 'ĐẤU GIẢI', icon: '⏱️', desc: 'Bộ đồ nghề tính điểm và đếm ngược 24s bài bản, có phòng thay đồ và tắm nóng lạnh' }
    ]
  }
};

export const DAC_QUYEN_SAN = [
  { icon: '🏛️', title: 'Mái Vòm Che Toàn Phần', desc: 'Khung vòm thép cao cách nhiệt, thi đấu liên tục 365 ngày bất chấp nắng gắt hay mưa lớn.' },
  { icon: '💡', title: 'Hệ Thống Đèn LED 500 Lux', desc: 'Dàn đèn LED chuyên dụng chống chói mắt, góc rọi tối ưu cho tầm nhìn bóng sắc nét.' },
  { icon: '💺', title: 'Khu Đợi & Băng Ghế Dự Bị VIP', desc: 'Có mái che, ghế đệm êm ái, quạt gió làm mát công suất lớn phục vụ cầu thủ thay người.' },
  { icon: '🚿', title: 'Phòng Thay Đồ & Tắm Nóng Lạnh', desc: 'Miễn phí 100%, tủ locker cá nhân có khóa an toàn, nhà tắm nước nóng áp lực cao.' },
  { icon: '📹', title: 'Camera AI Tự Động Bắt Bàn Thắng', desc: 'Tự động bắt khoảnh khắc và cắt highlight siêu phẩm độ phân giải 4K gửi về máy.' },
  { icon: '🅿️', title: 'Bãi Đỗ Xe Rộng Rãi Có Bảo Vệ', desc: 'Chỗ đỗ ô tô và xe máy rộng rãi, bảo vệ trông coi 24/7 tuyệt đối an toàn.' }
];
