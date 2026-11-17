/**
 * File: TrangTimSan.jsx
 * Mục đích: Trang tìm kiếm sân thể thao hệ thống eSportKing tại Hà Nội.
 * Cải tiến chuẩn hóa UX:
 * 1. Rút gọn 4 môn thể thao chính: Bóng Đá, Cầu Lông, Tennis, Bóng Rổ.
 * 2. Phân cấp 9 THẺ CHUẨN cho từng môn (3 Cơ sở x 3 Phân loại quy mô/mặt sân).
 * 3. Chuyển tiếp ngữ cảnh mượt mà vào trang chi tiết sân (không bị lẫn lộn môn).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ArrowRight, 
  Zap, 
  Trophy, 
  Users, 
  Navigation,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

// 4 MÔN THỂ THAO TRỌNG TÂM DUY NHẤT
const DANH_SACH_MON_THE_THAO = [
  { code: '', label: 'Tất cả môn', icon: '🏆', desc: 'Hệ thống 3 cơ sở' },
  { code: 'FOOTBALL', label: 'Bóng Đá', icon: '⚽', desc: 'Sân 5, 7 & 11 người' },
  { code: 'BADMINTON', label: 'Cầu Lông', icon: '🏸', desc: 'Thảm PVC & Sàn Gỗ' },
  { code: 'TENNIS', label: 'Tennis', icon: '🎾', desc: 'Decoturf & Đất nện' },
  { code: 'BASKETBALL', label: 'Bóng Rổ', icon: '🏀', desc: 'Sàn gỗ FIBA & 3x3' },
];

// THÔNG TIN 3 CƠ SỞ CHUẨN HÓA CỦA ESPORTKING
const THONG_TIN_CO_SO = {
  1: {
    ten: 'CƠ SỞ 1 • CẦU GIẤY',
    tenDayDu: 'eSportKing Complex Cầu Giấy',
    diaChi: 'Số 18 Duy Tân, Dịch Vọng Hậu, Cầu Giấy',
    diaChiNgan: '18 Duy Tân, Cầu Giấy',
    badgeClass: 'bg-gradient-to-r from-rose-600 to-red-500 text-white',
    icon: <Flame className="w-3.5 h-3.5 fill-white text-white" />
  },
  2: {
    ten: 'CƠ SỞ 2 • ĐỐNG ĐA',
    tenDayDu: 'eSportKing Arena Đống Đa',
    diaChi: 'Số 102 Trường Chinh, Phương Mai, Đống Đa',
    diaChiNgan: '102 Trường Chinh, Đống Đa',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    icon: <Zap className="w-3.5 h-3.5 fill-white text-white" />
  },
  3: {
    ten: 'CƠ SỞ 3 • HÀ ĐÔNG - LONG BIÊN',
    tenDayDu: 'eSportKing Sport Center',
    diaChi: 'Số 27 Đường Cổ Linh & Quang Trung, Hà Đông',
    diaChiNgan: 'Hà Đông & Long Biên',
    badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    icon: <Trophy className="w-3.5 h-3.5 text-white" />
  }
};

// MA TRẬN 9 THẺ ĐẠI DIỆN CHUẨN XÁC THEO TỪNG BỘ MÔN (3 CƠ SỞ X 3 PHÂN LOẠI)
const MA_TRAN_9_THE_THEO_MON = {
  FOOTBALL: [
    // HÀNG 1: SÂN 5 NGƯỜI (3 CƠ SỞ)
    {
      idKey: 'fb-5-cs1',
      venueId: 1,
      sportCode: 'FOOTBALL',
      quyMoCode: '5',
      name: 'Sân Bóng Đá Mini 5 Người • CS1 (Cầu Giấy)',
      category: 'Sân 5 Người (5v5)',
      capacity: '10 người',
      highlight: 'Có Mái Che • Cỏ Mịn 5cm',
      features: ['Mái che thời tiết', 'Cỏ nhân tạo êm', 'Đèn LED 500 Lux', 'Phòng thay đồ'],
      basePrice: 200000,
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'fb-5-cs2',
      venueId: 2,
      sportCode: 'FOOTBALL',
      quyMoCode: '5',
      name: 'Sân Bóng Đá Mini 5 Người • CS2 (Đống Đa)',
      category: 'Sân 5 Người (5v5)',
      capacity: '10 người',
      highlight: 'Sân Thoáng Mát • Cỏ FIFA',
      features: ['Cỏ FIFA chuẩn', 'Khu chờ máy lạnh', 'Nước uống miễn phí', 'Tắm nóng lạnh'],
      basePrice: 220000,
      image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'fb-5-cs3',
      venueId: 3,
      sportCode: 'FOOTBALL',
      quyMoCode: '5',
      name: 'Sân Bóng Đá Mini 5 Người • CS3 (Hà Đông)',
      category: 'Sân 5 Người (5v5)',
      capacity: '10 người',
      highlight: 'Mái Vòm Cao • Bãi Xe Ô Tô',
      features: ['Mái vòm vòm cong', 'Bãi đỗ xe lớn', 'Camera AI highlight', 'Áo bib miễn phí'],
      basePrice: 190000,
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop'
    },

    // HÀNG 2: SÂN 7 NGƯỜI (3 CƠ SỞ)
    {
      idKey: 'fb-7-cs1',
      venueId: 1,
      sportCode: 'FOOTBALL',
      quyMoCode: '7',
      name: 'Sân Bóng Đá 7 Người • CS1 (Cầu Giấy)',
      category: 'Sân 7 Người (7v7)',
      capacity: '14 người',
      highlight: 'Cỏ FIFA Pro • Khán Đài VIP',
      features: ['Cỏ kim cương chống lật', 'Khán đài có mái', 'Hệ thống âm thanh', 'Khu đợi dự bị'],
      basePrice: 350000,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'fb-7-cs2',
      venueId: 2,
      sportCode: 'FOOTBALL',
      quyMoCode: '7',
      name: 'Sân Bóng Đá 7 Người • CS2 (Đống Đa)',
      category: 'Sân 7 Người (7v7)',
      capacity: '14 người',
      highlight: 'Mặt Cỏ Cao Cấp • Đèn LED Cao Áp',
      features: ['Đèn LED chuẩn thi đấu', 'Trọng tài túc trực', 'Khu kỹ thuật HLV', 'Phòng tắm nóng'],
      basePrice: 380000,
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'fb-7-cs3',
      venueId: 3,
      sportCode: 'FOOTBALL',
      quyMoCode: '7',
      name: 'Sân Bóng Đá 7 Người • CS3 (Hà Đông)',
      category: 'Sân 7 Người (7v7)',
      capacity: '14 người',
      highlight: 'Mái Vòm Che Toàn Phần',
      features: ['Mái vòm thi đấu mưa nắng', 'Sợi cỏ chống ma sát', 'Ghế đệm dự bị', 'Bãi xe rộng'],
      basePrice: 330000,
      image: 'https://images.unsplash.com/photo-1529900241451-b05c5830c80e?q=80&w=1000&auto=format&fit=crop'
    },

    // HÀNG 3: SÂN 11 NGƯỜI (3 CƠ SỞ)
    {
      idKey: 'fb-11-cs1',
      venueId: 1,
      sportCode: 'FOOTBALL',
      quyMoCode: '11',
      name: 'Sân Bóng Đá 11 Người • CS1 (Cầu Giấy)',
      category: 'Sân 11 Người (11v11)',
      capacity: '22 người',
      highlight: 'Sân Thi Đấu Chuẩn Quốc Gia',
      features: ['Kích thước 68m x 105m', 'Cabin huấn luyện viên', 'Phòng họp chiến thuật', 'Bảng điểm điện tử'],
      basePrice: 650000,
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'fb-11-cs2',
      venueId: 2,
      sportCode: 'FOOTBALL',
      quyMoCode: '11',
      name: 'Sân Bóng Đá 11 Người • CS2 (Đống Đa)',
      category: 'Sân 11 Người (11v11)',
      capacity: '22 người',
      highlight: 'Khán Đài 500 Chỗ • Đèn Pha LED',
      features: ['Hệ thống chiếu sáng 8 trụ', 'Khu báo chí tác nghiệp', 'Tổ trọng tài chuẩn', 'Phòng thay đồ VIP'],
      basePrice: 700000,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'fb-11-cs3',
      venueId: 3,
      sportCode: 'FOOTBALL',
      quyMoCode: '11',
      name: 'Sân Bóng Đá 11 Người • CS3 (Hà Đông)',
      category: 'Sân 11 Người (11v11)',
      capacity: '22 người',
      highlight: 'Mặt Sân Cỏ Tự Nhiên Mịn',
      features: ['Cỏ tự nhiên cắt tỉa định kỳ', 'Thoát nước ngầm hiện đại', 'Camera AI 4K', 'Tắm nóng lạnh'],
      basePrice: 600000,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop'
    }
  ],

  BADMINTON: [
    // 3 Cơ sở x 3 Phân loại (Thảm PVC, Thảm Yonex, Sàn Gỗ)
    {
      idKey: 'bm-pvc-cs1',
      venueId: 1,
      sportCode: 'BADMINTON',
      quyMoCode: 'pvc',
      name: 'Sân Cầu Lông Thảm PVC BWF • CS1 (Cầu Giấy)',
      category: 'Thảm PVC Tiêu Chuẩn',
      capacity: '4 người',
      highlight: 'Thảm Vân Cát Chống Trượt',
      features: ['Thảm dày 5mm chống chấn', 'Đèn viền không chói mắt', 'Quạt hút thông gió', 'Căng cước vợt'],
      basePrice: 100000,
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-pvc-cs2',
      venueId: 2,
      sportCode: 'BADMINTON',
      quyMoCode: 'pvc',
      name: 'Sân Cầu Lông Thảm PVC BWF • CS2 (Đống Đa)',
      category: 'Thảm PVC Tiêu Chuẩn',
      capacity: '4 người',
      highlight: 'Thảm Xanh Chuẩn Giải Đấu',
      features: ['Lưới căng chuẩn BWF', 'Khu nghỉ chân quạt mát', 'Nước điện giải lạnh', 'Tủ đồ an toàn'],
      basePrice: 105000,
      image: 'https://images.unsplash.com/photo-1611255892296-3c67bb309879?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-pvc-cs3',
      venueId: 3,
      sportCode: 'BADMINTON',
      quyMoCode: 'pvc',
      name: 'Sân Cầu Lông Thảm PVC BWF • CS3 (Hà Đông)',
      category: 'Thảm PVC Tiêu Chuẩn',
      capacity: '4 người',
      highlight: 'Trần Cao 9m Không Cản Cầu',
      features: ['Không gian rộng thoáng', 'Ánh sáng tự nhiên dịu', 'Bãi xe ô tô miễn phí', 'Tắm nóng lạnh'],
      basePrice: 95000,
      image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-yonex-cs1',
      venueId: 1,
      sportCode: 'BADMINTON',
      quyMoCode: 'yonex',
      name: 'Sân Cầu Lông Thảm Yonex Pro • CS1 (Cầu Giấy)',
      category: 'Thảm Yonex Thi Đấu',
      capacity: '4 người',
      highlight: 'Thảm Chính Hãng BWF Super Series',
      features: ['Độ đàn hồi bảo vệ khớp gối', 'Hệ thống đèn LED âm trần', 'Ghế nghỉ trọng tài', 'Máy căng vợt'],
      basePrice: 120000,
      image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-yonex-cs2',
      venueId: 2,
      sportCode: 'BADMINTON',
      quyMoCode: 'yonex',
      name: 'Sân Cầu Lông Thảm Yonex Pro • CS2 (Đống Đa)',
      category: 'Thảm Yonex Thi Đấu',
      capacity: '4 người',
      highlight: 'Thảm Đỏ Chuyên Nghiệp',
      features: ['Chống trượt tuyệt đối', 'Hệ thống thông gió kín', 'Quầy phụ kiện cầu lông', 'Khăn lạnh free'],
      basePrice: 125000,
      image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-yonex-cs3',
      venueId: 3,
      sportCode: 'BADMINTON',
      quyMoCode: 'yonex',
      name: 'Sân Cầu Lông Thảm Yonex Pro • CS3 (Hà Đông)',
      category: 'Thảm Yonex Thi Đấu',
      capacity: '4 người',
      highlight: 'Sân Kín Gió Tuyệt Đối',
      features: ['Không ảnh hưởng đường cầu', 'Đèn LED gom sáng', 'Khu vực khởi động', 'Tắm nóng lạnh'],
      basePrice: 115000,
      image: 'https://images.unsplash.com/photo-1521537634581-0dced2fedc29?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-wood-cs1',
      venueId: 1,
      sportCode: 'BADMINTON',
      quyMoCode: 'wood',
      name: 'Sân Cầu Lông Sàn Gỗ Chống Chấn • CS1 (Cầu Giấy)',
      category: 'Sàn Gỗ Tự Nhiên Trong Nhà',
      capacity: '4 người',
      highlight: 'Sàn Gỗ Phong Đệm Cao Su',
      features: ['Giảm chấn tối đa', 'Không trơn trượt', 'Phòng thay đồ riêng', 'Trọng tài sẵn có'],
      basePrice: 130000,
      image: 'https://images.unsplash.com/photo-1613918431703-aa6321c81729?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-wood-cs2',
      venueId: 2,
      sportCode: 'BADMINTON',
      quyMoCode: 'wood',
      name: 'Sân Cầu Lông Sàn Gỗ Chống Chấn • CS2 (Đống Đa)',
      category: 'Sàn Gỗ Tự Nhiên Trong Nhà',
      capacity: '4 người',
      highlight: 'Sàn Gỗ Maple Bắc Mỹ',
      features: ['Độ nảy chân cực êm', 'Điều hòa làm mát nhẹ', 'Bảng lật điểm số', 'Tắm nóng lạnh'],
      basePrice: 135000,
      image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bm-wood-cs3',
      venueId: 3,
      sportCode: 'BADMINTON',
      quyMoCode: 'wood',
      name: 'Sân Cầu Lông Sàn Gỗ Chống Chấn • CS3 (Hà Đông)',
      category: 'Sàn Gỗ Tự Nhiên Trong Nhà',
      capacity: '4 người',
      highlight: 'Không Gian Đẳng Cấp Thể Thao',
      features: ['Sàn gỗ bóng loáng', 'Khoảng cách biên rộng', 'Khu căn tin giải khát', 'Bãi đỗ ô tô'],
      basePrice: 125000,
      image: 'https://images.unsplash.com/photo-1613918431703-aa6321c81729?q=80&w=1000&auto=format&fit=crop'
    }
  ],

  TENNIS: [
    // 3 Cơ sở x 3 Phân loại (Sân Cứng Decoturf, Sân Đất Nện, Sân Có Mái Che)
    {
      idKey: 'tn-hard-cs1',
      venueId: 1,
      sportCode: 'TENNIS',
      quyMoCode: 'hard',
      name: 'Sân Tennis Mặt Cứng Decoturf • CS1 (Cầu Giấy)',
      category: 'Mặt Sân Cứng Decoturf US Open',
      capacity: '4 người',
      highlight: 'Sơn Decoturf 9 Lớp Nảy Chuẩn',
      features: ['Độ nảy bóng ổn định', 'Đèn cao áp 800 Lux', 'Ghế trọng tài chuẩn ITF', 'Có máy bắn bóng'],
      basePrice: 190000,
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-hard-cs2',
      venueId: 2,
      sportCode: 'TENNIS',
      quyMoCode: 'hard',
      name: 'Sân Tennis Mặt Cứng Decoturf • CS2 (Đống Đa)',
      category: 'Mặt Sân Cứng Decoturf US Open',
      capacity: '4 người',
      highlight: 'Sân Trung Tâm Có Khán Đài',
      features: ['Khán đài 100 chỗ', 'Khu nghỉ ngơi râm mát', 'Thuê vợt Wilson Pro', 'Nhân viên nhặt bóng'],
      basePrice: 210000,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-hard-cs3',
      venueId: 3,
      sportCode: 'TENNIS',
      quyMoCode: 'hard',
      name: 'Sân Tennis Mặt Cứng Decoturf • CS3 (Hà Đông)',
      category: 'Mặt Sân Cứng Decoturf US Open',
      capacity: '4 người',
      highlight: 'Mặt Sân Mới 100% Thoáng Đãng',
      features: ['Không gian yên tĩnh', 'Lưới thi đấu cao cấp', 'Bãi đỗ xe ô tô thoải mái', 'Tắm nóng lạnh'],
      basePrice: 180000,
      image: 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-clay-cs1',
      venueId: 1,
      sportCode: 'TENNIS',
      quyMoCode: 'clay',
      name: 'Sân Tennis Đất Nện Roland Garros • CS1 (Cầu Giấy)',
      category: 'Sân Đất Nện Đỏ Cao Cấp',
      capacity: '4 người',
      highlight: 'Trượt Thao Tác Chuẩn Xác',
      features: ['Bảo dưỡng lu phẳng liên tục', 'Độ nảy bóng chậm êm chân', 'Bảo vệ khớp tối đa', 'Khu xịt rửa giày'],
      basePrice: 230000,
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-clay-cs2',
      venueId: 2,
      sportCode: 'TENNIS',
      quyMoCode: 'clay',
      name: 'Sân Tennis Đất Nện Roland Garros • CS2 (Đống Đa)',
      category: 'Sân Đất Nện Đỏ Cao Cấp',
      capacity: '4 người',
      highlight: 'Đất Nện Nhập Khẩu Pháp',
      features: ['Bụi đất nện mịn màng', 'Đèn LED chiếu vạch rõ', 'Huấn luyện viên kèm cặp', 'Nước uống giải khát'],
      basePrice: 250000,
      image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-clay-cs3',
      venueId: 3,
      sportCode: 'TENNIS',
      quyMoCode: 'clay',
      name: 'Sân Tennis Đất Nện Roland Garros • CS3 (Hà Đông)',
      category: 'Sân Đất Nện Đỏ Cao Cấp',
      capacity: '4 người',
      highlight: 'Trải Nghiệm Thể Thao Đỉnh Cao',
      features: ['Hàng rào chắn gió xung quanh', 'Khu vệ sinh riêng', 'Bãi xe rộng', 'Tắm nóng lạnh'],
      basePrice: 220000,
      image: 'https://images.unsplash.com/photo-1545809074-59472b3f5eff?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-roof-cs1',
      venueId: 1,
      sportCode: 'TENNIS',
      quyMoCode: 'roof',
      name: 'Sân Tennis Có Mái Che Mưa Nắng • CS1 (Cầu Giấy)',
      category: 'Sân Có Mái Che Toàn Phần',
      capacity: '4 người',
      highlight: 'Mái Vòm Khung Thép Không Ngại Mưa',
      features: ['Thi đấu 365 ngày không gián đoạn', 'Quạt công nghiệp mát rượi', 'Đèn chiếu không bóng đổ', 'Ghế VIP'],
      basePrice: 260000,
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-roof-cs2',
      venueId: 2,
      sportCode: 'TENNIS',
      quyMoCode: 'roof',
      name: 'Sân Tennis Có Mái Che Mưa Nắng • CS2 (Đống Đa)',
      category: 'Sân Có Mái Che Toàn Phần',
      capacity: '4 người',
      highlight: 'Mái Vòm Cách Nhiệt Chống Nắng',
      features: ['Nhiệt độ sân luôn dịu mát', 'Máy bắn bóng tự động', 'Phòng thay đồ 5 sao', 'Khu vực giải lao'],
      basePrice: 280000,
      image: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'tn-roof-cs3',
      venueId: 3,
      sportCode: 'TENNIS',
      quyMoCode: 'roof',
      name: 'Sân Tennis Có Mái Che Mưa Nắng • CS3 (Hà Đông)',
      category: 'Sân Có Mái Che Toàn Phần',
      capacity: '4 người',
      highlight: 'Không Gian Thể Thao Đa Năng',
      features: ['Vòm cao 12 mét thoáng khí', 'Đèn LED công suất cao', 'Bãi xe ô tô miễn phí', 'Tắm nước nóng'],
      basePrice: 240000,
      image: 'https://images.unsplash.com/photo-1530915536483-a9d0a3311894?q=80&w=1000&auto=format&fit=crop'
    }
  ],

  BASKETBALL: [
    // 3 Cơ sở x 3 Phân loại (3x3 Ngoài Trời, 5x5 Silicon PU, Sàn Gỗ FIBA)
    {
      idKey: 'bb-3x3-cs1',
      venueId: 1,
      sportCode: 'BASKETBALL',
      quyMoCode: '3x3',
      name: 'Sân Bóng Rổ Nửa Sân 3x3 Streetball • CS1 (Cầu Giấy)',
      category: 'Sân 3x3 Nửa Sân',
      capacity: '6 người',
      highlight: 'Mặt Sân Sơn Chống Trượt',
      features: ['Trụ rổ lò xo đàn hồi', 'Vạch ném 3 điểm chuẩn', 'Loa Bluetooth phát nhạc', 'Nước uống mát'],
      basePrice: 150000,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-3x3-cs2',
      venueId: 2,
      sportCode: 'BASKETBALL',
      quyMoCode: '3x3',
      name: 'Sân Bóng Rổ Nửa Sân 3x3 Streetball • CS2 (Đống Đa)',
      category: 'Sân 3x3 Nửa Sân',
      capacity: '6 người',
      highlight: 'Đèn Chiếu Sáng Đêm',
      features: ['Chơi đêm thoải mái', 'Bóng thi đấu Molten', 'Bảng kính cường lực', 'Khu nghỉ mát'],
      basePrice: 160000,
      image: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-3x3-cs3',
      venueId: 3,
      sportCode: 'BASKETBALL',
      quyMoCode: '3x3',
      name: 'Sân Bóng Rổ Nửa Sân 3x3 Streetball • CS3 (Hà Đông)',
      category: 'Sân 3x3 Nửa Sân',
      capacity: '6 người',
      highlight: 'Không Gian Trẻ Trung Năng Động',
      features: ['Sân thoáng gió tự nhiên', 'Bãi xe máy & ô tô rộng', 'Áo bib chia đội', 'Tắm nóng lạnh'],
      basePrice: 140000,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-pu-cs1',
      venueId: 1,
      sportCode: 'BASKETBALL',
      quyMoCode: 'pu',
      name: 'Sân Bóng Rổ 5x5 Đệm Silicon PU • CS1 (Cầu Giấy)',
      category: 'Toàn Sân 5x5 Silicon PU',
      capacity: '10 người',
      highlight: 'Đệm PU 8mm Êm Chân Chống Chấn',
      features: ['Toàn sân 28m x 15m', 'Trụ rổ thủy lực di động', 'Bảng điểm bấm giờ', 'Ghế ban huấn luyện'],
      basePrice: 280000,
      image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-pu-cs2',
      venueId: 2,
      sportCode: 'BASKETBALL',
      quyMoCode: 'pu',
      name: 'Sân Bóng Rổ 5x5 Đệm Silicon PU • CS2 (Đống Đa)',
      category: 'Toàn Sân 5x5 Silicon PU',
      capacity: '10 người',
      highlight: 'Mặt Sân Silicon Chống Trầy Xước',
      features: ['Độ bám giày tuyệt hảo', 'Đèn LED chống chói mắt', 'Thùng nước điện giải', 'Phòng tắm nóng'],
      basePrice: 300000,
      image: 'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-pu-cs3',
      venueId: 3,
      sportCode: 'BASKETBALL',
      quyMoCode: 'pu',
      name: 'Sân Bóng Rổ 5x5 Đệm Silicon PU • CS3 (Hà Đông)',
      category: 'Toàn Sân 5x5 Silicon PU',
      capacity: '10 người',
      highlight: 'Sân Có Mái Che Khung Vòm',
      features: ['Mái che thời tiết thoáng mát', 'Trụ rổ tiêu chuẩn quốc tế', 'Bãi xe rộng rãi', 'Camera AI'],
      basePrice: 260000,
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-wood-cs1',
      venueId: 1,
      sportCode: 'BASKETBALL',
      quyMoCode: 'wood',
      name: 'Sân Bóng Rổ Sàn Gỗ Trong Nhà FIBA • CS1 (Cầu Giấy)',
      category: 'Sàn Gỗ Chuẩn FIBA Quốc Tế',
      capacity: '10 người',
      highlight: 'Sàn Gỗ Maple Đạt Chuẩn VBA',
      features: ['Bảng điểm điện tử đếm 24s', 'Khán đài 200 chỗ', 'Điều hòa không khí trung tâm', 'Phòng thay đồ VIP'],
      basePrice: 380000,
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-wood-cs2',
      venueId: 2,
      sportCode: 'BASKETBALL',
      quyMoCode: 'wood',
      name: 'Sân Bóng Rổ Sàn Gỗ Trong Nhà FIBA • CS2 (Đống Đa)',
      category: 'Sàn Gỗ Chuẩn FIBA Quốc Tế',
      capacity: '10 người',
      highlight: 'Sàn Gỗ Tự Nhiên Giảm Chấn Cực Đại',
      features: ['Trụ rổ đạt chuẩn Olympic', 'Hệ thống âm thanh thi đấu', 'Trọng tài điều hành', 'Tắm nóng lạnh'],
      basePrice: 400000,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop'
    },
    {
      idKey: 'bb-wood-cs3',
      venueId: 3,
      sportCode: 'BASKETBALL',
      quyMoCode: 'wood',
      name: 'Sân Bóng Rổ Sàn Gỗ Trong Nhà FIBA • CS3 (Hà Đông)',
      category: 'Sân Gỗ Chuẩn FIBA Quốc Tế',
      capacity: '10 người',
      highlight: 'Nhà Thi Đấu Thể Thao Hiện Đại',
      features: ['Không gian rộng rãi cách nhiệt', 'Bảng rổ kính cường lực 12mm', 'Bãi xe ô tô miễn phí', 'Tủ đồ riêng'],
      basePrice: 360000,
      image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=1000&auto=format&fit=crop'
    }
  ]
};

export default function TrangTimSan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo môn: Ưu tiên môn từ search param, nếu không có hoặc là môn cũ (pickleball, volleyball) thì mặc định là FOOTBALL
  const monParam = searchParams.get('sport') || '';
  const monHopLe = ['FOOTBALL', 'BADMINTON', 'TENNIS', 'BASKETBALL'].includes(monParam) ? monParam : (monParam === '' ? '' : 'FOOTBALL');
  const [monHienTai, setMonHienTai] = useState(monHopLe);
  const [tuKhoa, setTuKhoa] = useState('');
  const [dangTai, setDangTai] = useState(false);

  // Khi bấm chọn môn trên thanh điều hướng
  const chonMonTheThao = (code) => {
    setMonHienTai(code);
    const params = new URLSearchParams(searchParams);
    if (code) {
      params.set('sport', code);
    } else {
      params.delete('sport');
    }
    setSearchParams(params);
  };

  // Lọc danh sách 9 thẻ theo môn và từ khóa tìm kiếm
  const danhSach9TheHienThi = useMemo(() => {
    let sourceCards = [];
    if (monHienTai && MA_TRAN_9_THE_THEO_MON[monHienTai]) {
      // Đúng 9 thẻ của môn đó
      sourceCards = MA_TRAN_9_THE_THEO_MON[monHienTai];
    } else {
      // Khi chọn Tất Cả Môn: Lấy đại diện các thẻ nổi bật của 4 môn (mỗi môn 2-3 thẻ)
      sourceCards = [
        ...MA_TRAN_9_THE_THEO_MON.FOOTBALL.slice(0, 3), // Sân 5, 7, 11
        ...MA_TRAN_9_THE_THEO_MON.BADMINTON.slice(0, 2),
        ...MA_TRAN_9_THE_THEO_MON.TENNIS.slice(0, 2),
        ...MA_TRAN_9_THE_THEO_MON.BASKETBALL.slice(0, 2),
      ];
    }

    if (!tuKhoa.trim()) return sourceCards;

    const kw = tuKhoa.toLowerCase();
    return sourceCards.filter(c => 
      c.name.toLowerCase().includes(kw) ||
      c.category.toLowerCase().includes(kw) ||
      c.highlight.toLowerCase().includes(kw) ||
      THONG_TIN_CO_SO[c.venueId]?.tenDayDu.toLowerCase().includes(kw) ||
      THONG_TIN_CO_SO[c.venueId]?.diaChi.toLowerCase().includes(kw)
    );
  }, [monHienTai, tuKhoa]);

  // Điều hướng vào trang chi tiết sân với đúng context
  const xemChiTietTheSan = (card) => {
    // Navigate kèm theo venueId, sport, và quyMoCode
    navigate(`/venue/${card.venueId}?sport=${card.sportCode}&size=${card.quyMoCode}`);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f5] pb-20">
      
      {/* 1. THANH HERO TÌM KIẾM & BỘ LỌC 4 MÔN THỂ THAO CHÍNH */}
      <section className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Tiêu đề & Ô nhập tìm kiếm */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-500" />
                Hệ Thống Sân Thể Thao Đạt Chuẩn Thi Đấu Tại 3 Cơ Sở Hà Nội
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Tìm Sân & Giữ Chỗ eSportKing Hà Nội
              </h1>
              <p className="text-xs text-slate-500">
                Cơ Sở 1 (Cầu Giấy) • Cơ Sở 2 (Đống Đa) • Cơ Sở 3 (Hà Đông / Long Biên)
              </p>
            </div>

            {/* Ô nhập tìm kiếm */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên sân, quy mô 5-7-11, cơ sở..."
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

          {/* THANH TAB 4 MÔN CHÍNH (RÚT GỌN GỌN GÀNG, KHÔNG DÀN TRẢI) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

        </div>
      </section>

      {/* 2. KHU VỰC HIỂN THỊ MA TRẬN THẺ SÂN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Header thông báo số lượng */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🏟️ Danh Sách Phân Cấp Sân Thi Đấu</span>
              {monHienTai && (
                <span className="text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full text-xs font-black">
                  {DANH_SACH_MON_THE_THAO.find(m => m.code === monHienTai)?.label} ({danhSach9TheHienThi.length} Thẻ)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {monHienTai === 'FOOTBALL' 
                ? 'Được sắp xếp chuẩn hóa: 3 Quy mô (Sân 5, Sân 7, Sân 11) phân bổ trên 3 Cơ sở Hà Nội'
                : 'Mỗi thẻ tương ứng với cơ sở và phân cấp sân, bấm để xem chi tiết các loại mặt sân và dịch vụ'}
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            ✨ Có mái vòm che mưa nắng & hệ thống đèn LED 500 Lux
          </span>
        </div>

        {/* LƯỚI MA TRẬN 9 THẺ */}
        {danhSach9TheHienThi.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-10 shadow-sm">
            <div className="text-4xl mb-3">🏟️</div>
            <h3 className="text-base font-black text-slate-900">Không tìm thấy thẻ sân phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Vui lòng xóa từ khóa tìm kiếm hoặc chọn môn thể thao khác.
            </p>
            <button
              onClick={() => { setMonHienTai('FOOTBALL'); setTuKhoa(''); }}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Xem 9 thẻ chuẩn môn Bóng Đá
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhSach9TheHienThi.map((card) => {
              const csInfo = THONG_TIN_CO_SO[card.venueId] || THONG_TIN_CO_SO[1];

              return (
                <div
                  key={card.idKey}
                  onClick={() => xemChiTietTheSan(card)}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-brand-500/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Ảnh đại diện sân sắc nét */}
                  <div className="relative w-full h-52 overflow-hidden bg-slate-950">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                      loading="lazy"
                    />

                    {/* Badge Cơ sở chuẩn */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-md flex items-center gap-1 ${csInfo.badgeClass}`}>
                        {csInfo.icon} {csInfo.ten}
                      </span>
                    </div>

                    {/* Badge Quy mô sân */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-white shadow-sm">
                      {card.category}
                    </div>

                    {/* Sức chứa & Đánh giá */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                      <span className="text-slate-300">•</span>
                      <Users className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-600">{card.capacity}</span>
                    </div>

                    {/* Badge Điểm nhấn */}
                    <div className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      SẴN SÀNG
                    </div>
                  </div>

                  {/* Nội dung chi tiết của thẻ */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Tên thẻ sân */}
                      <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition line-clamp-1">
                        {card.name}
                      </h3>

                      {/* Địa chỉ cơ sở */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{csInfo.diaChi}</span>
                      </div>

                      {/* Điểm nhấn nổi bật */}
                      <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-bold">
                        ⚡ {card.highlight}
                      </div>

                      {/* Danh sách 4 tính năng / đặc quyền của thẻ */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                        {card.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Giá & Nút vào chi tiết */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Giá thuê từ:</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base font-black text-rose-600">
                            {card.basePrice.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">đ/giờ</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => xemChiTietTheSan(card)}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-md shadow-brand-500/20 flex items-center gap-1 transition"
                        >
                          <span>Chọn Loại Sân & Đặt</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
