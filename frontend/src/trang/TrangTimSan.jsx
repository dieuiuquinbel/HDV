/**
 * File: TrangTimSan.jsx
 * Mục đích: Trang tìm kiếm và đặt sân thể thao hệ thống eSportKing tại Hà Nội.
 * Chuẩn hóa 30 SÂN THỂ THAO VẬT LÝ THỰC TẾ (10 sân / cơ sở x 3 cơ sở):
 * 1. 4 môn thể thao: Bóng Đá, Cầu Lông, Bóng Rổ, Tennis.
 * 2. 3 cơ sở chuẩn: CS1 Cầu Giấy, CS2 Đống Đa, CS3 Hà Đông (Số 27 Quang Trung).
 * 3. 100% hình ảnh cục bộ chuẩn xác theo môn (không dính ảnh gym/tennis lạc môn).
 * 4. Bộ lọc đa tầng: Môn thể thao -> Cơ sở -> Loại sân & Hình thức thi đấu (1v1, 2v2).
 */
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Users, 
  Sparkles,
  Flame,
  Zap,
  Trophy,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

// 4 MÔN THỂ THAO TRỌNG TÂM
const DANH_SACH_MON_THE_THAO = [
  { code: '', label: 'Tất cả môn', icon: '🏆', desc: 'Hệ thống 3 cơ sở' },
  { code: 'FOOTBALL', label: 'Bóng Đá', icon: '⚽', desc: 'Sân 5, 7 & 11 người' },
  { code: 'BADMINTON', label: 'Cầu Lông', icon: '🏸', desc: 'Thảm PVC & Yonex Pro' },
  { code: 'BASKETBALL', label: 'Bóng Rổ', icon: '🏀', desc: 'Sàn gỗ FIBA & 3x3' },
  { code: 'TENNIS', label: 'Tennis', icon: '🎾', desc: 'Decoturf, Clay & Cỏ' },
];

// THÔNG TIN 3 CƠ SỞ CHUẨN HÓA ESPORTKING TẠI HÀ NỘI
const THONG_TIN_CO_SO = {
  1: {
    id: 1,
    ten: 'CƠ SỞ 1 • CẦU GIẤY',
    tenDayDu: 'eSportKing Complex Cầu Giấy',
    diaChi: 'Số 18 Phố Duy Tân, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
    diaChiNgan: '18 Duy Tân, Cầu Giấy',
    badgeClass: 'bg-gradient-to-r from-rose-600 to-red-500 text-white',
    icon: <Flame className="w-3.5 h-3.5 fill-white text-white" />
  },
  2: {
    id: 2,
    ten: 'CƠ SỞ 2 • ĐỐNG ĐA',
    tenDayDu: 'eSportKing Arena Đống Đa',
    diaChi: 'Số 102 Phố Trường Chinh, P. Phương Mai, Q. Đống Đa, Hà Nội',
    diaChiNgan: '102 Trường Chinh, Đống Đa',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    icon: <Zap className="w-3.5 h-3.5 fill-white text-white" />
  },
  3: {
    id: 3,
    ten: 'CƠ SỞ 3 • HÀ ĐÔNG',
    tenDayDu: 'eSportKing Sport Center Hà Đông',
    diaChi: 'Số 27 Đường Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    diaChiNgan: '27 Quang Trung, Hà Đông',
    badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    icon: <Trophy className="w-3.5 h-3.5 text-white" />
  }
};

// DANH SÁCH 30 SÂN THỂ THAO VẬT LÝ THỰC TẾ CỦA ESPORTKING
// (10 sân/cơ sở x 3 cơ sở = 30 sân thực)
const DANH_SACH_30_SAN_VAT_LY = [
  // ==================== CƠ SỞ 1: CẦU GIẤY (10 SÂN) ====================
  // 1. Bóng đá CS1 (3 sân)
  {
    idKey: 'BD-CS1-01',
    courtCode: 'BD-CS1-01',
    venueId: 1,
    sportCode: 'FOOTBALL',
    quyMoCode: '5',
    name: 'Sân Bóng Đá Mini 5 Người Số 1 • CS1',
    category: 'Sân 5 Người (5v5)',
    surface: 'Cỏ nhân tạo 5cm chống lật',
    capacity: '10 người',
    highlight: 'Có Mái Che • Cỏ Mịn Đàn Hồi',
    features: ['Mái vòm che nắng mưa', 'Hệ thống đèn LED 500 Lux', 'Phòng thay đồ nóng lạnh', 'Bóng thi đấu số 4'],
    basePrice: 200000,
    image: '/images/courts/football/football_5_cs1.jpg',
    formats: ['5v5 Đối kháng']
  },
  {
    idKey: 'BD-CS1-02',
    courtCode: 'BD-CS1-02',
    venueId: 1,
    sportCode: 'FOOTBALL',
    quyMoCode: '7',
    name: 'Sân Bóng Đá 7 Người Cỏ FIFA Pro • CS1',
    category: 'Sân 7 Người (7v7)',
    surface: 'Cỏ FIFA Pro sợi kim cương',
    capacity: '14 người',
    highlight: 'Khán Đài Có Mái • Cabin Dự Bị',
    features: ['Sợi cỏ kim cương đàn hồi', 'Cabin huấn luyện viên', 'Bảng điểm điện tử', 'Camera AI highlight'],
    basePrice: 350000,
    image: '/images/courts/football/football_7_cs1.jpg',
    formats: ['7v7 Đối kháng']
  },
  {
    idKey: 'BD-CS1-03',
    courtCode: 'BD-CS1-03',
    venueId: 1,
    sportCode: 'FOOTBALL',
    quyMoCode: '11',
    name: 'Sân Bóng Đá 11 Người Chuẩn Thi Đấu • CS1',
    category: 'Sân 11 Người (11v11)',
    surface: 'Cỏ tự nhiên cắt tỉa định kỳ',
    capacity: '22 người',
    highlight: 'Kích Thước 68m x 105m Chuẩn FIFA',
    features: ['Hệ thống thoát nước ngầm', '8 trụ đèn cao áp 1000 Lux', 'Phòng họp chiến thuật', 'Tổ trọng tài chuẩn'],
    basePrice: 650000,
    image: '/images/courts/football/football_11_cs1.jpg',
    formats: ['11v11 Toàn sân']
  },
  // 2. Cầu lông CS1 (2 sân - Hỗ trợ cả Đơn 1v1 & Đôi 2v2)
  {
    idKey: 'CL-CS1-01',
    courtCode: 'CL-CS1-01',
    venueId: 1,
    sportCode: 'BADMINTON',
    quyMoCode: 'pvc',
    name: 'Sân Cầu Lông Thảm PVC Standard • CS1',
    category: 'Thảm PVC Tiêu Chuẩn BWF',
    surface: 'Thảm PVC vân cát chống trượt BWF',
    capacity: '4 người',
    highlight: 'Hỗ Trợ Đánh Đơn 1v1 & Đánh Đôi 2v2',
    features: ['Thảm dày 5.0mm giảm chấn', 'Đèn LED chống chói mắt', 'Quạt hút thông gió', 'Ghế nghỉ trọng tài'],
    basePrice: 100000,
    image: '/images/courts/badminton/badminton_pvc_cs1.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'CL-CS1-02',
    courtCode: 'CL-CS1-02',
    venueId: 1,
    sportCode: 'BADMINTON',
    quyMoCode: 'pro',
    name: 'Sân Cầu Lông Thảm Yonex Pro • CS1',
    category: 'Thảm Yonex Pro Thi Đấu',
    surface: 'Thảm Yonex Super Series cao cấp',
    capacity: '4 người',
    highlight: 'Chuẩn Giải Đấu • Hỗ Trợ Đơn & Đôi',
    features: ['Độ đàn hồi bảo vệ khớp gối', 'Hệ thống đèn âm trần hiện đại', 'Dịch vụ căng cước vợt', 'Tủ đồ thông minh'],
    basePrice: 120000,
    image: '/images/courts/badminton/badminton_pro_cs1.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  // 3. Bóng rổ CS1 (2 sân)
  {
    idKey: 'BR-CS1-01',
    courtCode: 'BR-CS1-01',
    venueId: 1,
    sportCode: 'BASKETBALL',
    quyMoCode: '5x5',
    name: 'Sân Bóng Rổ Tiêu Chuẩn 5v5 Sàn Gỗ • CS1',
    category: 'Toàn Sân 5v5 Trong Nhà',
    surface: 'Sàn gỗ Maple phong Canada chuẩn FIBA',
    capacity: '10 người',
    highlight: 'Sàn Gỗ Chuyên Nghiệp • Điều Hòa',
    features: ['Trụ rổ thủy lực chuẩn Olympic', 'Đồng hồ đếm 24s điện tử', 'Điều hòa làm mát trung tâm', 'Bảng điểm LED'],
    basePrice: 300000,
    image: '/images/courts/basketball/basketball_5x5_cs1.jpg',
    formats: ['5v5 Toàn sân']
  },
  {
    idKey: 'BR-CS1-02',
    courtCode: 'BR-CS1-02',
    venueId: 1,
    sportCode: 'BASKETBALL',
    quyMoCode: '3x3',
    name: 'Sân Bóng Rổ Nửa Sân 3x3 Streetball • CS1',
    category: 'Nửa Sân 3x3 Ngoài Trời',
    surface: 'Mặt sân Silicon PU đàn hồi',
    capacity: '6 người',
    highlight: 'Chống Trơn Trượt • Ném Rổ Tự Do',
    features: ['Bảng rổ kính cường lực 12mm', 'Lưới thi đấu kim loại bền bỉ', 'Khu nghỉ ngơi quạt mát', 'Nước uống miễn phí'],
    basePrice: 150000,
    image: '/images/courts/basketball/basketball_3x3_cs1.jpg',
    formats: ['3x3 Đối kháng', 'Tập luyện cá nhân']
  },
  // 4. Tennis CS1 (3 sân - Hỗ trợ cả Đơn 1v1 & Đôi 2v2)
  {
    idKey: 'TN-CS1-01',
    courtCode: 'TN-CS1-01',
    venueId: 1,
    sportCode: 'TENNIS',
    quyMoCode: 'hard',
    name: 'Sân Tennis Mặt Sân Cứng Decoturf • CS1',
    category: 'Sân Cứng Hard Court',
    surface: 'Sơn Acrylic Decoturf 8 lớp',
    capacity: '4 người',
    highlight: 'Mặt Sân US Open • Đơn & Đôi',
    features: ['Độ nảy bóng cực chuẩn', 'Đèn pha LED 800 Lux đêm', 'Lưới căng chuẩn ITF', 'Dịch vụ nhặt bóng'],
    basePrice: 200000,
    image: '/images/courts/tennis/tennis_hard_cs1.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'TN-CS1-02',
    courtCode: 'TN-CS1-02',
    venueId: 1,
    sportCode: 'TENNIS',
    quyMoCode: 'clay',
    name: 'Sân Tennis Đất Nện Tiêu Chuẩn • CS1',
    category: 'Sân Đất Nện Clay Court',
    surface: 'Đất nện đỏ nghiền Roland Garros',
    capacity: '4 người',
    highlight: 'Trượt Mượt Mà • Êm Chân Giảm Chấn',
    features: ['Bảo dưỡng lu lèn hàng ngày', 'Chống mỏi khớp chân tuyệt đối', 'Ghế nghỉ trọng tài có mái', 'Vòi xịt rửa giày'],
    basePrice: 220000,
    image: '/images/courts/tennis/tennis_clay_cs1.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'TN-CS1-03',
    courtCode: 'TN-CS1-03',
    venueId: 1,
    sportCode: 'TENNIS',
    quyMoCode: 'grass',
    name: 'Sân Tennis Mặt Cỏ Wimbledon • CS1',
    category: 'Sân Cỏ Grass Court',
    surface: 'Cỏ tự nhiên bọc đệm Wimbledon',
    capacity: '4 người',
    highlight: 'Đẳng Cấp Quý Tộc • Đơn & Đôi',
    features: ['Bóng trượt nhanh tốc độ', 'Hương cỏ tự nhiên tươi mát', 'Phòng tắm nóng lạnh VIP', 'Khăn lạnh phục vụ'],
    basePrice: 240000,
    image: '/images/courts/tennis/tennis_grass_cs1.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },

  // ==================== CƠ SỞ 2: ĐỐNG ĐA (10 SÂN) ====================
  // 1. Bóng đá CS2 (3 sân)
  {
    idKey: 'BD-CS2-01',
    courtCode: 'BD-CS2-01',
    venueId: 2,
    sportCode: 'FOOTBALL',
    quyMoCode: '5',
    name: 'Sân Bóng Đá Mini 5 Người Cỏ FIFA • CS2',
    category: 'Sân 5 Người (5v5)',
    surface: 'Cỏ nhân tạo FIFA chuẩn Châu Âu',
    capacity: '10 người',
    highlight: 'Trung Tâm Đống Đa • Sân Đẹp',
    features: ['Cỏ êm ái hạt cao su đều', 'Khu chờ máy lạnh thoáng', 'Tắm nóng lạnh tiện nghi', 'Áo bib phân đội miễn phí'],
    basePrice: 220000,
    image: '/images/courts/football/football_5_cs2.jpg',
    formats: ['5v5 Đối kháng']
  },
  {
    idKey: 'BD-CS2-02',
    courtCode: 'BD-CS2-02',
    venueId: 2,
    sportCode: 'FOOTBALL',
    quyMoCode: '7',
    name: 'Sân Bóng Đá 7 Người Khán Đài Mini • CS2',
    category: 'Sân 7 Người (7v7)',
    surface: 'Cỏ nhân tạo chống ma sát cao',
    capacity: '14 người',
    highlight: 'Khán Đài Có Ghế Đệm • Đèn LED',
    features: ['Ghế ngồi khán giả thoải mái', 'Hệ thống đèn chống loá mắt', 'Tủ đồ bảo mật vân tay', 'Trọng tài theo yêu cầu'],
    basePrice: 360000,
    image: '/images/courts/football/football_7_cs2.jpg',
    formats: ['7v7 Đối kháng']
  },
  {
    idKey: 'BD-CS2-03',
    courtCode: 'BD-CS2-03',
    venueId: 2,
    sportCode: 'FOOTBALL',
    quyMoCode: '11',
    name: 'Sân Bóng Đá 11 Người Đèn LED Đêm • CS2',
    category: 'Sân 11 Người (11v11)',
    surface: 'Cỏ tự nhiên tiêu chuẩn quốc gia',
    capacity: '22 người',
    highlight: 'Chiếu Sáng Công Suất Lớn • Rộng Rãi',
    features: ['Khu vực tác nghiệp truyền hình', 'Phòng thay đồ có vòi tắm sen', 'Đường piste khởi động riêng', 'Căng tin thể thao'],
    basePrice: 700000,
    image: '/images/courts/football/football_11_cs2.jpg',
    formats: ['11v11 Toàn sân']
  },
  // 2. Cầu lông CS2 (2 sân)
  {
    idKey: 'CL-CS2-01',
    courtCode: 'CL-CS2-01',
    venueId: 2,
    sportCode: 'BADMINTON',
    quyMoCode: 'pvc',
    name: 'Sân Cầu Lông Thảm PVC Đống Đa • CS2',
    category: 'Thảm PVC Tiêu Chuẩn',
    surface: 'Thảm xanh lá tiêu chuẩn BWF',
    capacity: '4 người',
    highlight: 'Thảm Xanh Êm • Đơn & Đôi',
    features: ['Lưới căng chuẩn quốc tế', 'Khu nghỉ chân máy lạnh', 'Nước điện giải lạnh phục vụ', 'Tủ để giày riêng'],
    basePrice: 105000,
    image: '/images/courts/badminton/badminton_pvc_cs2.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'CL-CS2-02',
    courtCode: 'CL-CS2-02',
    venueId: 2,
    sportCode: 'BADMINTON',
    quyMoCode: 'pro',
    name: 'Sân Cầu Lông Thảm Yonex Thi Đấu • CS2',
    category: 'Thảm Yonex Cao Cấp',
    surface: 'Thảm đỏ chuyên nghiệp Yonex Pro',
    capacity: '4 người',
    highlight: 'Chống Trượt Tuyệt Đối • Đơn & Đôi',
    features: ['Thảm thi đấu giải chuyên nghiệp', 'Hệ thống gió kín không lệch cầu', 'Quầy phụ kiện cầu lông', 'Khăn lạnh free'],
    basePrice: 125000,
    image: '/images/courts/badminton/badminton_pro_cs2.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  // 3. Bóng rổ CS2 (2 sân)
  {
    idKey: 'BR-CS2-01',
    courtCode: 'BR-CS2-01',
    venueId: 2,
    sportCode: 'BASKETBALL',
    quyMoCode: '5x5',
    name: 'Sân Bóng Rổ 5v5 Sàn Gỗ Tự Nhiên • CS2',
    category: 'Toàn Sân 5v5 Sàn Gỗ',
    surface: 'Sàn gỗ tự nhiên nguyên khối cao cấp',
    capacity: '10 người',
    highlight: 'Giảm Chấn Cực Đại • Chuẩn FIBA',
    features: ['Trụ rổ đạt chuẩn Olympic', 'Hệ thống âm thanh cổ vũ', 'Trọng tài điều hành có kinh nghiệm', 'Tắm nóng lạnh'],
    basePrice: 320000,
    image: '/images/courts/basketball/basketball_5x5_cs2.jpg',
    formats: ['5v5 Toàn sân']
  },
  {
    idKey: 'BR-CS2-02',
    courtCode: 'BR-CS2-02',
    venueId: 2,
    sportCode: 'BASKETBALL',
    quyMoCode: '3x3',
    name: 'Sân Bóng Rổ Nửa Sân 3x3 Streetball • CS2',
    category: 'Nửa Sân 3x3 Ngoài Trời',
    surface: 'Sơn Silicon PU bám dính tốt',
    capacity: '6 người',
    highlight: 'Không Gian Đường Phố Trẻ Trung',
    features: ['Bảng rổ tiêu chuẩn thi đấu 3x3', 'Đèn pha chiếu sáng ban đêm', 'Bãi xe máy rộng rãi', 'Bóng Wilson chính hãng'],
    basePrice: 160000,
    image: '/images/courts/basketball/basketball_3x3_cs2.jpg',
    formats: ['3x3 Đối kháng']
  },
  // 4. Tennis CS2 (3 sân)
  {
    idKey: 'TN-CS2-01',
    courtCode: 'TN-CS2-01',
    venueId: 2,
    sportCode: 'TENNIS',
    quyMoCode: 'hard',
    name: 'Sân Tennis Sân Cứng Chuyên Nghiệp • CS2',
    category: 'Sân Cứng Hard Court',
    surface: 'Mặt sân Decoturf đạt chuẩn ATP Tour',
    capacity: '4 người',
    highlight: 'Tốc Độ Bóng Ổn Định • Đơn & Đôi',
    features: ['Không bị loá mắt khi đánh trưa', 'Đèn LED 1000 Lux thi đấu đêm', 'Nhặt bóng chuyên nghiệp', 'Phòng xông hơi khô'],
    basePrice: 190000,
    image: '/images/courts/tennis/tennis_hard_cs2.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'TN-CS2-02',
    courtCode: 'TN-CS2-02',
    venueId: 2,
    sportCode: 'TENNIS',
    quyMoCode: 'clay',
    name: 'Sân Tennis Đất Nện Roland Garros • CS2',
    category: 'Sân Đất Nện Clay Court',
    surface: 'Đất nện đỏ nhập khẩu trực tiếp',
    capacity: '4 người',
    highlight: 'Cảm Giác Trượt Cổ Điển • Đơn & Đôi',
    features: ['Tập luyện chuyên nghiệp bền bỉ', 'Nhân viên bảo dưỡng sau mỗi ca', 'Nước suối và khăn bông', 'Khu thư giãn VIP'],
    basePrice: 230000,
    image: '/images/courts/tennis/tennis_clay_cs2.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'TN-CS2-03',
    courtCode: 'TN-CS2-03',
    venueId: 2,
    sportCode: 'TENNIS',
    quyMoCode: 'grass',
    name: 'Sân Tennis Mặt Sân Cỏ Thi Đấu • CS2',
    category: 'Sân Cỏ Grass Court',
    surface: 'Mặt sân cỏ tự nhiên cao cấp',
    capacity: '4 người',
    highlight: 'Đường Bóng Độc Đáo • Đơn & Đôi',
    features: ['Bóng trượt thấp phản xạ nhanh', 'Không gian cây xanh thoáng mát', 'Phòng thay đồ cao cấp', 'Trà thảo mộc miễn phí'],
    basePrice: 250000,
    image: '/images/courts/tennis/tennis_grass_cs2.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },

  // ==================== CƠ SỞ 3: HÀ ĐÔNG (10 SÂN) ====================
  // 1. Bóng đá CS3 (3 sân)
  {
    idKey: 'BD-CS3-01',
    courtCode: 'BD-CS3-01',
    venueId: 3,
    sportCode: 'FOOTBALL',
    quyMoCode: '5',
    name: 'Sân Bóng Đá Mini 5 Người Hà Đông • CS3',
    category: 'Sân 5 Người (5v5)',
    surface: 'Cỏ nhân tạo sợi đúc mềm mại',
    capacity: '10 người',
    highlight: 'Bãi Xe Ô Tô Lớn • Không Khí Thoáng',
    features: ['Mặt cỏ êm chống xước da', 'Bãi đỗ xe ô tô 200 chỗ miễn phí', 'Camera AI highlight bàn thắng', 'Nước uống tự do'],
    basePrice: 190000,
    image: '/images/courts/football/football_5_cs3.jpg',
    formats: ['5v5 Đối kháng']
  },
  {
    idKey: 'BD-CS3-02',
    courtCode: 'BD-CS3-02',
    venueId: 3,
    sportCode: 'FOOTBALL',
    quyMoCode: '7',
    name: 'Sân Bóng Đá 7 Người Mái Vòm Che • CS3',
    category: 'Sân 7 Người (7v7)',
    surface: 'Cỏ nhân tạo FIFA chuẩn cao cấp',
    capacity: '14 người',
    highlight: 'Mái Vòm Khung Thép Che Toàn Phần',
    features: ['Thi đấu thoải mái không ngại mưa', 'Hệ thống quạt làm mát công nghiệp', 'Ghế đệm dự bị có mái che', 'Tủ y tế đầy đủ'],
    basePrice: 330000,
    image: '/images/courts/football/football_7_cs3.jpg',
    formats: ['7v7 Đối kháng']
  },
  {
    idKey: 'BD-CS3-03',
    courtCode: 'BD-CS3-03',
    venueId: 3,
    sportCode: 'FOOTBALL',
    quyMoCode: '11',
    name: 'Sân Bóng Đá 11 Người Cỏ Tự Nhiên • CS3',
    category: 'Sân 11 Người (11v11)',
    surface: 'Cỏ tự nhiên xanh mướt cắt tỉa',
    capacity: '22 người',
    highlight: 'Không Gian Rộng Rãi Sinh Thái',
    features: ['Hệ thống thoát nước mưa cực tốt', 'Khán đài bao quanh 1000 chỗ', 'Phòng họp đội bóng hiện đại', 'Tắm nóng lạnh sen cây'],
    basePrice: 600000,
    image: '/images/courts/football/football_11_cs3.jpg',
    formats: ['11v11 Toàn sân']
  },
  // 2. Cầu lông CS3 (2 sân)
  {
    idKey: 'CL-CS3-01',
    courtCode: 'CL-CS3-01',
    venueId: 3,
    sportCode: 'BADMINTON',
    quyMoCode: 'pvc',
    name: 'Sân Cầu Lông Thảm PVC Hà Đông • CS3',
    category: 'Thảm PVC Tiêu Chuẩn',
    surface: 'Thảm PVC vân cát chống lóa',
    capacity: '4 người',
    highlight: 'Trần Cao 9m Không Cản Cầu • Đơn & Đôi',
    features: ['Không gian rộng rãi cách âm tốt', 'Hệ thống thông gió tự nhiên mát mẻ', 'Đèn LED âm trần chống chói', 'Bãi xe rộng'],
    basePrice: 95000,
    image: '/images/courts/badminton/badminton_pvc_cs3.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'CL-CS3-02',
    courtCode: 'CL-CS3-02',
    venueId: 3,
    sportCode: 'BADMINTON',
    quyMoCode: 'pro',
    name: 'Sân Cầu Lông Thảm Yonex Trần Cao • CS3',
    category: 'Thảm Yonex Pro Cao Cấp',
    surface: 'Thảm Yonex Super Series',
    capacity: '4 người',
    highlight: 'Đạt Chuẩn Thi Đấu Mở Rộng • Đơn & Đôi',
    features: ['Thảm dày bảo vệ đầu gối và mắt cá', 'Lưới thi đấu Yonex chính hãng', 'Khu nghỉ ngơi quạt máy', 'Phòng thay đồ riêng'],
    basePrice: 115000,
    image: '/images/courts/badminton/badminton_pro_cs3.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  // 3. Bóng rổ CS3 (2 sân)
  {
    idKey: 'BR-CS3-01',
    courtCode: 'BR-CS3-01',
    venueId: 3,
    sportCode: 'BASKETBALL',
    quyMoCode: '5x5',
    name: 'Sân Bóng Rổ Tiêu Chuẩn Hà Đông • CS3',
    category: 'Toàn Sân 5v5 Sàn Gỗ',
    surface: 'Sàn gỗ phong tự nhiên tiêu chuẩn',
    capacity: '10 người',
    highlight: 'Nhà Thi Đấu Rộng Rãi Đạt Chuẩn',
    features: ['Bảng rổ kính cường lực cao cấp', 'Hệ thống chiếu sáng LED đa góc', 'Bãi đỗ xe ô tô miễn phí', 'Tủ đồ thông minh'],
    basePrice: 290000,
    image: '/images/courts/basketball/basketball_5x5_cs3.jpg',
    formats: ['5v5 Toàn sân']
  },
  {
    idKey: 'BR-CS3-02',
    courtCode: 'BR-CS3-02',
    venueId: 3,
    sportCode: 'BASKETBALL',
    quyMoCode: '3x3',
    name: 'Sân Bóng Rổ 3x3 Tập Ném Rổ • CS3',
    category: 'Nửa Sân 3x3 Ngoài Trời',
    surface: 'Mặt sân Silicon PU chống trơn trượt',
    capacity: '6 người',
    highlight: 'Có Mái Vòm Che Mát • Thân Thiện',
    features: ['Mái che thời tiết thoáng mát cả ngày', 'Trụ rổ tiêu chuẩn quốc tế', 'Bãi xe rộng rãi ngay cạnh sân', 'Nước mát'],
    basePrice: 140000,
    image: '/images/courts/basketball/basketball_3x3_cs3.jpg',
    formats: ['3x3 Đối kháng']
  },
  // 4. Tennis CS3 (3 sân)
  {
    idKey: 'TN-CS3-01',
    courtCode: 'TN-CS3-01',
    venueId: 3,
    sportCode: 'TENNIS',
    quyMoCode: 'hard',
    name: 'Sân Tennis Mặt Sân Cứng Mái Che • CS3',
    category: 'Sân Cứng Hard Court',
    surface: 'Mặt sơn Acrylic Decoturf có mái che',
    capacity: '4 người',
    highlight: 'Sân Có Mái Vòm Che • Đơn & Đôi',
    features: ['Không sợ trời mưa hay nắng gắt', 'Đèn LED cao áp 1000 Lux', 'Khu nghỉ ngơi quạt gió', 'Bãi xe ô tô miễn phí'],
    basePrice: 190000,
    image: '/images/courts/tennis/tennis_hard_cs3.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'TN-CS3-02',
    courtCode: 'TN-CS3-02',
    venueId: 3,
    sportCode: 'TENNIS',
    quyMoCode: 'clay',
    name: 'Sân Tennis Đất Nện Hà Đông • CS3',
    category: 'Sân Đất Nện Clay Court',
    surface: 'Mặt sân đất nện đỏ tiêu chuẩn Pháp',
    capacity: '4 người',
    highlight: 'Bảo Vệ Xương Khớp Tối Đa • Đơn & Đôi',
    features: ['Độ nảy bóng chậm dễ điều khiển', 'Cây xanh xung quanh mát mẻ', 'Vòi xịt nước rửa giày', 'Trọng tài theo yêu cầu'],
    basePrice: 210000,
    image: '/images/courts/tennis/tennis_clay_cs3.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  },
  {
    idKey: 'TN-CS3-03',
    courtCode: 'TN-CS3-03',
    venueId: 3,
    sportCode: 'TENNIS',
    quyMoCode: 'grass',
    name: 'Sân Tennis Mặt Sân Cỏ Sinh Thái • CS3',
    category: 'Sân Cỏ Grass Court',
    surface: 'Mặt cỏ tự nhiên sinh thái',
    capacity: '4 người',
    highlight: 'Không Gian Trong Lành • Đơn & Đôi',
    features: ['Cảm giác đánh bóng Wimbledon chân thực', 'Khu vực cafe thư giãn nhìn ra sân', 'Phòng tắm nóng lạnh', 'Khăn lạnh free'],
    basePrice: 240000,
    image: '/images/courts/tennis/tennis_grass_cs3.jpg',
    formats: ['Đơn (1v1)', 'Đôi (2v2)']
  }
];

export default function TrangTimSan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo tham số từ URL
  const monParam = searchParams.get('sport') || '';
  const monHopLe = ['FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS'].includes(monParam) ? monParam : (monParam === '' ? '' : 'FOOTBALL');
  const [monHienTai, setMonHienTai] = useState(monHopLe);

  const venueParam = searchParams.get('venue') || '';
  const [coSoHienTai, setCoSoHienTai] = useState(venueParam ? Number(venueParam) : 0); // 0 = Tất cả cơ sở

  const [loaiSanFilter, setLoaiSanFilter] = useState('');
  const [tuKhoa, setTuKhoa] = useState('');

  // Khi bấm chọn môn trên thanh tab
  const chonMonTheThao = (code) => {
    setMonHienTai(code);
    setLoaiSanFilter('');
    const params = new URLSearchParams(searchParams);
    if (code) {
      params.set('sport', code);
    } else {
      params.delete('sport');
    }
    setSearchParams(params);
  };

  // Khi bấm chọn cơ sở
  const chonCoSo = (venueId) => {
    setCoSoHienTai(venueId);
    const params = new URLSearchParams(searchParams);
    if (venueId > 0) {
      params.set('venue', venueId);
    } else {
      params.delete('venue');
    }
    setSearchParams(params);
  };

  // Danh sách các loại sân phụ thuộc môn đang chọn
  const optionsLoaiSan = useMemo(() => {
    if (monHienTai === 'FOOTBALL') {
      return [
        { code: '', label: 'Tất cả quy mô' },
        { code: '5', label: 'Sân 5 người (5v5)' },
        { code: '7', label: 'Sân 7 người (7v7)' },
        { code: '11', label: 'Sân 11 người (11v11)' },
      ];
    }
    if (monHienTai === 'BADMINTON') {
      return [
        { code: '', label: 'Tất cả loại thảm' },
        { code: 'pvc', label: 'Thảm PVC Tiêu Chuẩn' },
        { code: 'pro', label: 'Thảm Yonex Pro Cao Cấp' },
      ];
    }
    if (monHienTai === 'BASKETBALL') {
      return [
        { code: '', label: 'Tất cả loại sân' },
        { code: '5x5', label: 'Toàn Sân 5v5 Sàn Gỗ' },
        { code: '3x3', label: 'Nửa Sân 3x3 Streetball' },
      ];
    }
    if (monHienTai === 'TENNIS') {
      return [
        { code: '', label: 'Tất cả mặt sân' },
        { code: 'hard', label: 'Sân Cứng (Hard Court)' },
        { code: 'clay', label: 'Sân Đất Nện (Clay Court)' },
        { code: 'grass', label: 'Sân Cỏ (Grass Court)' },
      ];
    }
    return [];
  }, [monHienTai]);

  // Lọc danh sách 30 sân theo môn, cơ sở, loại sân và từ khóa
  const danhSachHienThi = useMemo(() => {
    return DANH_SACH_30_SAN_VAT_LY.filter(san => {
      // 1. Lọc theo Môn
      if (monHienTai && san.sportCode !== monHienTai) return false;

      // 2. Lọc theo Cơ Sở
      if (coSoHienTai > 0 && san.venueId !== coSoHienTai) return false;

      // 3. Lọc theo Loại sân / Quy mô
      if (loaiSanFilter && san.quyMoCode !== loaiSanFilter) return false;

      // 4. Lọc theo Từ khóa tìm kiếm
      if (tuKhoa.trim()) {
        const kw = tuKhoa.toLowerCase();
        const csInfo = THONG_TIN_CO_SO[san.venueId];
        const matchName = san.name.toLowerCase().includes(kw);
        const matchCode = san.courtCode.toLowerCase().includes(kw);
        const matchCategory = san.category.toLowerCase().includes(kw);
        const matchSurface = san.surface.toLowerCase().includes(kw);
        const matchVenue = csInfo ? csInfo.tenDayDu.toLowerCase().includes(kw) || csInfo.diaChi.toLowerCase().includes(kw) : false;
        if (!matchName && !matchCode && !matchCategory && !matchSurface && !matchVenue) {
          return false;
        }
      }

      return true;
    });
  }, [monHienTai, coSoHienTai, loaiSanFilter, tuKhoa]);

  // Điều hướng vào trang chi tiết sân với đúng venueId, sport, và courtCode
  const xemChiTietSan = (san) => {
    navigate(`/venue/${san.venueId}?sport=${san.sportCode}&courtCode=${san.courtCode}&size=${san.quyMoCode}`);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f5] pb-20">
      
      {/* 1. THANH HERO TÌM KIẾM & BỘ LỌC ĐA TẦNG */}
      <section className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Tiêu đề & Ô nhập tìm kiếm */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-500" />
                Hệ Thống 30 Sân Thể Thao Đạt Chuẩn Thi Đấu Tại 3 Cơ Sở Hà Nội
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Tìm Sân & Giữ Chỗ eSportKing Hà Nội
              </h1>
              <p className="text-xs text-slate-500">
                Cơ Sở 1 (Cầu Giấy) • Cơ Sở 2 (Đống Đa) • Cơ Sở 3 (Hà Đông)
              </p>
            </div>

            {/* Ô nhập tìm kiếm */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã sân (BD-CS1), tên sân, cơ sở..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition shadow-inner"
              />
              {tuKhoa && (
                <button
                  onClick={() => setTuKhoa('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* TẦNG 1: THANH TAB 4 MÔN CHÍNH */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DANH_SACH_MON_THE_THAO.map((mon) => {
              const active = monHienTai === mon.code;
              return (
                <button
                  key={mon.code}
                  onClick={() => chonMonTheThao(mon.code)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                    active
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/25 scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">{mon.icon}</span>
                  <div className="text-left">
                    <p className="leading-tight font-black">{mon.label}</p>
                    <p className={`text-[10px] font-normal ${active ? 'text-white/80' : 'text-slate-400'}`}>
                      {mon.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* TẦNG 2 & 3: LỌC CƠ SỞ & LỌC LOẠI SÂN */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Lọc Cơ Sở */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Cơ sở:
              </span>
              <button
                onClick={() => chonCoSo(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  coSoHienTai === 0
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả (3 CS)
              </button>
              <button
                onClick={() => chonCoSo(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  coSoHienTai === 1
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <Flame className="w-3 h-3" /> CS1 • Cầu Giấy
              </button>
              <button
                onClick={() => chonCoSo(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  coSoHienTai === 2
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Zap className="w-3 h-3" /> CS2 • Đống Đa
              </button>
              <button
                onClick={() => chonCoSo(3)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  coSoHienTai === 3
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Trophy className="w-3 h-3" /> CS3 • Hà Đông
              </button>
            </div>

            {/* Lọc Loại Sân / Quy Mô (nếu có) */}
            {optionsLoaiSan.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" /> Loại sân:
                </span>
                {optionsLoaiSan.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => setLoaiSanFilter(opt.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      loaiSanFilter === opt.code
                        ? 'bg-brand-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 2. KHU VỰC HIỂN THỊ DANH SÁCH SÂN VẬT LÝ THẬT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Header thông báo số lượng */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🏟️ Danh Sách Sân Thể Thao Thực Tế</span>
              <span className="text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full text-xs font-black">
                {danhSachHienThi.length} Sân Khả Dụng
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {coSoHienTai > 0 
                ? `Đang lọc theo ${THONG_TIN_CO_SO[coSoHienTai]?.tenDayDu}`
                : 'Mỗi thẻ là một sân vật lý thực tế độc lập, có mã định danh, bề mặt chuẩn và lịch đặt riêng'}
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            ✨ Đặt cọc linh hoạt • Giữ slot tức thì 100%
          </span>
        </div>

        {/* LƯỚI CARD SÂN THẬT */}
        {danhSachHienThi.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-10 shadow-sm">
            <div className="text-4xl mb-3">🏟️</div>
            <h3 className="text-base font-black text-slate-900">Không tìm thấy sân thể thao phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Vui lòng xóa bộ lọc hoặc chọn cơ sở khác để xem danh sách sân.
            </p>
            <button
              onClick={() => { setMonHienTai('FOOTBALL'); setCoSoHienTai(0); setLoaiSanFilter(''); setTuKhoa(''); }}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Xem tất cả 30 sân hệ thống
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhSachHienThi.map((san) => {
              const csInfo = THONG_TIN_CO_SO[san.venueId] || THONG_TIN_CO_SO[1];

              return (
                <div
                  key={san.idKey}
                  onClick={() => xemChiTietSan(san)}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-brand-500/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Ảnh đại diện sân cục bộ sắc nét 100% đúng môn */}
                  <div className="relative w-full h-52 overflow-hidden bg-slate-950">
                    <img
                      src={san.image}
                      alt={san.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                      loading="lazy"
                    />

                    {/* Badge Cơ sở chuẩn */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-md flex items-center gap-1 ${csInfo.badgeClass}`}>
                        {csInfo.icon} {csInfo.ten}
                      </span>
                    </div>

                    {/* Badge Mã Sân độc lập */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-md">
                        Mã: {san.courtCode}
                      </span>
                    </div>

                    {/* Overlay gradient dưới đáy ảnh */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Thông tin nhanh trên ảnh: Sức chứa & Trạng thái */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-10">
                      <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold border border-white/10">
                        <Users className="w-3.5 h-3.5 text-brand-300" /> {san.capacity}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> SẴN SÀNG
                      </span>
                    </div>
                  </div>

                  {/* Nội dung card */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Tiêu đề sân */}
                      <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {san.name}
                      </h3>

                      {/* Địa chỉ cơ sở */}
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {csInfo.diaChi}
                      </p>

                      {/* Mặt sân & Điểm nổi bật */}
                      <div className="mt-3 bg-amber-50/80 border border-amber-200/60 rounded-xl px-3 py-1.5">
                        <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          ⚡ {san.highlight}
                        </p>
                        <p className="text-[11px] text-amber-700/80 mt-0.5">
                          Bề mặt: {san.surface}
                        </p>
                      </div>

                      {/* Hình thức thi đấu (Đơn / Đôi) */}
                      {san.formats && san.formats.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thi đấu:</span>
                          {san.formats.map((fmt, i) => (
                            <span key={i} className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
                              ✓ {fmt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 4 Tiện ích nổi bật của sân */}
                      <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                        {san.features.map((fea, idx) => (
                          <div key={idx} className="flex items-center gap-1 line-clamp-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{fea}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chân card: Giá & Nút chọn sân */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                          Giá thuê từ
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-rose-600">
                            {san.basePrice.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-xs text-slate-400 font-medium">/giờ</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          xemChiTietSan(san);
                        }}
                        className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Đặt Sân Ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Banner thông tin 3 cơ sở & cam kết dịch vụ */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-black text-slate-900">
              Cam Kết Dịch Vụ eSportKing Tại 3 Cơ Sở Hà Nội
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5 mb-1.5 text-rose-700">
                <Flame className="w-4 h-4 text-rose-600" /> CS1 • Cầu Giấy
              </h4>
              <p className="text-slate-500 mb-2">Số 18 Duy Tân, Dịch Vọng Hậu, Cầu Giấy</p>
              <p className="text-[11px] leading-relaxed">
                Tổ hợp thể thao trung tâm Duy Tân với 10 sân đạt chuẩn: Bóng đá cỏ FIFA, Cầu lông thảm PVC BWF, Bóng rổ FIBA trong nhà và Tennis Decoturf.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5 mb-1.5 text-amber-700">
                <Zap className="w-4 h-4 text-amber-600" /> CS2 • Đống Đa
              </h4>
              <p className="text-slate-500 mb-2">Số 102 Trường Chinh, Phương Mai, Đống Đa</p>
              <p className="text-[11px] leading-relaxed">
                Cụm thể thao trung tâm Đống Đa: Sân tennis đất nện Roland Garros, sân bóng rổ sàn gỗ tự nhiên và sân cầu lông thảm đỏ Yonex chuyên nghiệp.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5 mb-1.5 text-blue-700">
                <Trophy className="w-4 h-4 text-blue-600" /> CS3 • Hà Đông
              </h4>
              <p className="text-slate-500 mb-2">Số 27 Đường Quang Trung, Quang Trung, Hà Đông</p>
              <p className="text-[11px] leading-relaxed">
                Tổ hợp thể thao sinh thái rộng rãi: Sân bóng đá 11 người cỏ tự nhiên, sân bóng đá 7 người có mái vòm che toàn phần và bãi đỗ xe ô tô 200 chỗ.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
