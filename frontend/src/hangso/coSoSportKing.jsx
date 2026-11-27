/**
 * File: coSoSportKing.jsx
 * Mục đích: Định nghĩa thông tin 3 cơ sở chuẩn và 10 phân loại sân thực tế của hệ thống eSportKing tại Hà Nội.
 */
import React from 'react';
import { Flame, Zap, Trophy } from 'lucide-react';

export const THONG_TIN_CO_SO = {
  1: {
    id: 1,
    ten: 'CƠ SỞ 1 • CẦU GIẤY',
    tenDayDu: 'Trung Tâm Thể Thao eSportKing - Cơ Sở 1 (Cầu Giấy)',
    diaChi: 'Số 18 Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=18+Duy+Tan,+Dich+Vong+Hau,+Cau+Giay,+Ha+Noi',
    hotline: '0981.234.567',
    badgeClass: 'bg-gradient-to-r from-rose-600 to-red-500 text-white',
    icon: <Flame className="w-3.5 h-3.5 fill-white text-white" />
  },
  2: {
    id: 2,
    ten: 'CƠ SỞ 2 • ĐỐNG ĐA',
    tenDayDu: 'Trung Tâm Thể Thao eSportKing - Cơ Sở 2 (Đống Đa)',
    diaChi: 'Số 102 Phố Trường Chinh, Phường Phương Mai, Quận Đống Đa, Hà Nội',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=102+Truong+Chinh,+Phuong+Mai,+Dong+Da,+Ha+Noi',
    hotline: '0982.345.678',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    icon: <Zap className="w-3.5 h-3.5 fill-white text-white" />
  },
  3: {
    id: 3,
    ten: 'CƠ SỞ 3 • HÀ ĐÔNG',
    tenDayDu: 'Trung Tâm Thể Thao eSportKing - Cơ Sở 3 (Hà Đông)',
    diaChi: 'Số 27 Đường Quang Trung, Phường Quang Trung, Quận Hà Đông, Hà Nội',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=27+Quang+Trung,+Ha+Dong,+Ha+Noi',
    hotline: '0983.456.789',
    badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    icon: <Trophy className="w-3.5 h-3.5 text-white" />
  }
};

export function layThongTinGoogleMapsCoSo(venueId, venueName = '') {
  const numId = Number(venueId);
  if (THONG_TIN_CO_SO[numId]) {
    return {
      diaChi: THONG_TIN_CO_SO[numId].diaChi,
      mapsUrl: THONG_TIN_CO_SO[numId].mapsUrl
    };
  }
  const lower = String(venueName || '').toLowerCase();
  if (lower.includes('đống đa') || lower.includes('dong da') || lower.includes('cơ sở 2') || lower.includes('cs2')) {
    return { diaChi: THONG_TIN_CO_SO[2].diaChi, mapsUrl: THONG_TIN_CO_SO[2].mapsUrl };
  }
  if (lower.includes('hà đông') || lower.includes('ha dong') || lower.includes('cơ sở 3') || lower.includes('cs3')) {
    return { diaChi: THONG_TIN_CO_SO[3].diaChi, mapsUrl: THONG_TIN_CO_SO[3].mapsUrl };
  }
  return { diaChi: THONG_TIN_CO_SO[1].diaChi, mapsUrl: THONG_TIN_CO_SO[1].mapsUrl };
}

export const BIEN_THE_SAN_CON = {
  FOOTBALL: {
    '5': [
      { id: 101, code: '5_TURF', name: 'Sân 5 Người (Cỏ Nhân Tạo Tiêu Chuẩn)', surface: 'Cỏ nhân tạo 5cm có mái vòm', price: 200000, tag: 'TIÊU CHUẨN', icon: '🌱', desc: 'Mặt cỏ sợi đúc mềm, đàn hồi êm chân, có mái vòm che nắng mưa', image: '/images/courts/football/football_5_cs1.jpg' },
      { id: 102, code: '5_PRO', name: 'Sân 5 Người (Cỏ FIFA Pro Chống Trượt)', surface: 'Cỏ sợi kim cương FIFA Pro', price: 220000, tag: 'HOT NHẤT 🔥', icon: '💎', desc: 'Chuẩn FIFA Pro, chống lật sơ cổ chân, đèn LED 500 Lux', image: '/images/courts/football/football_5_cs2.jpg' }
    ],
    '7': [
      { id: 201, code: '7_TURF', name: 'Sân 7 Người (Cỏ FIFA Pro Tiêu Chuẩn)', surface: 'Cỏ FIFA Pro sợi kim cương', price: 350000, tag: 'PHỔ BIẾN ⭐', icon: '🌱', desc: 'Kích thước 30m x 50m, thoát nước ngầm cực tốt, cabin ban huấn luyện', image: '/images/courts/football/football_7_cs1.jpg' },
      { id: 202, code: '7_ROOF', name: 'Sân 7 Người (Mái Vòm Che Toàn Phần)', surface: 'Mái vòm thép che phủ 100%', price: 400000, tag: 'MÁI CHE 🏛️', icon: '🏛️', desc: 'Mái vòm cao 14m thoáng gió, thi đấu bất chấp thời tiết mưa nắng', image: '/images/courts/football/football_7_cs3.jpg' }
    ],
    '11': [
      { id: 301, code: '11_GRASS', name: 'Sân 11 Người (Cỏ Tự Nhiên Chuẩn FIFA)', surface: 'Cỏ tự nhiên Bermuda mịn màng', price: 650000, tag: 'CHUẨN QUỐC TẾ', icon: '🌾', desc: 'Kích thước 68m x 105m, cỏ tự nhiên cắt tỉa định kỳ, dàn đèn 1000 Lux', image: '/images/courts/football/football_11_cs1.jpg' }
    ]
  },
  BADMINTON: {
    default: [
      { id: 401, code: 'BADMINTON_PVC', name: 'Sân Cầu Lông (Thảm PVC BWF Standard)', surface: 'Thảm PVC vân cát chống trượt 4.5mm', price: 100000, tag: 'TIÊU CHUẨN', icon: '🏸', desc: 'Chuẩn Liên đoàn BWF, quạt hút thông gió, hỗ trợ đánh Đơn 1v1 & Đôi 2v2', image: '/images/courts/badminton/badminton_pvc_cs1.jpg', formats: ['Đơn (1v1)', 'Đôi (2v2)'] },
      { id: 402, code: 'BADMINTON_PRO', name: 'Sân Cầu Lông (Thảm Yonex Pro Cao Cấp)', surface: 'Thảm Yonex Super Series giảm chấn', price: 120000, tag: 'THI ĐẤU PRO 🌟', icon: '🥇', desc: 'Đàn hồi cực êm bảo vệ khớp gối, đèn viền không chói mắt, hỗ trợ Đơn & Đôi', image: '/images/courts/badminton/badminton_pro_cs1.jpg', formats: ['Đơn (1v1)', 'Đôi (2v2)'] }
    ]
  },
  BASKETBALL: {
    default: [
      { id: 601, code: 'BASKETBALL_5X5_WOOD', name: 'Sân Bóng Rổ (Toàn Sân 5v5 Sàn Gỗ FIBA)', surface: 'Sàn gỗ Maple Canada trong nhà', price: 300000, tag: 'FIBA TRONG NHÀ 🌟', icon: '🪵', desc: 'Sàn gỗ chuẩn giải VBA, điều hòa làm mát, bảng rổ kính lực và đồng hồ 24s', image: '/images/courts/basketball/basketball_5x5_cs1.jpg', formats: ['5v5 Toàn sân'] },
      { id: 602, code: 'BASKETBALL_3X3', name: 'Sân Bóng Rổ (Nửa Sân 3x3 Streetball)', surface: 'Mặt sơn Silicon PU ngoài trời', price: 150000, tag: 'STREETBALL', icon: '🏀', desc: 'Nửa sân tiêu chuẩn 3x3, bảng kính cường lực đàn hồi, tự do ném rổ', image: '/images/courts/basketball/basketball_3x3_cs1.jpg', formats: ['3x3 Đối kháng'] }
    ]
  },
  TENNIS: {
    default: [
      { id: 501, code: 'TENNIS_HARD_COURT', name: 'Sân Tennis Mặt Sân Cứng (Decoturf US Open)', surface: 'Sơn Acrylic Decoturf 8 lớp', price: 200000, tag: 'SÂN CỨNG US OPEN', icon: '🎾', desc: 'Độ nảy bóng cực chuẩn, đèn LED 800 Lux đêm, hỗ trợ Đơn 1v1 & Đôi 2v2', image: '/images/courts/tennis/tennis_hard_cs1.jpg', formats: ['Đơn (1v1)', 'Đôi (2v2)'] },
      { id: 502, code: 'TENNIS_CLAY', name: 'Sân Tennis Mặt Đất Nện (Roland Garros)', surface: 'Đất nện đỏ nhập khẩu', price: 220000, tag: 'ĐẤT NỆN ROLAND GARROS 🔥', icon: '🧱', desc: 'Mặt sân trượt êm chân, bóng nảy chậm bảo vệ khớp chân, hỗ trợ Đơn & Đôi', image: '/images/courts/tennis/tennis_clay_cs1.jpg', formats: ['Đơn (1v1)', 'Đôi (2v2)'] },
      { id: 503, code: 'TENNIS_GRASS', name: 'Sân Tennis Mặt Sân Cỏ (Wimbledon)', surface: 'Cỏ tự nhiên chuyên dụng', price: 240000, tag: 'SÂN CỎ WIMBLEDON ⭐', icon: '🌱', desc: 'Đẳng cấp quý tộc, đường bóng trượt nhanh phản xạ sắc bén, hỗ trợ Đơn & Đôi', image: '/images/courts/tennis/tennis_grass_cs1.jpg', formats: ['Đơn (1v1)', 'Đôi (2v2)'] }
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
