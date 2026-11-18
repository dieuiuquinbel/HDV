/**
 * File: TrangChu.jsx
 * Muc dich: Trang chu Dashboard the thao chuyen nghiep, tinh gon va giau tuong tac.
 * Chuc nang: 
 *  - Hero Banner Slideshow 4 anh the thao tu dong chuyen moi 5s kem dots navigation.
 *  - Modal Popup chao mung khach hang moi tang voucher 20% va nut X dong.
 *  - Kho Ma Giam Gia (Voucher Hub) voi hieu ung lun nhe, nut Luu Ma (do) -> Dung Ngay (xanh) chuyen den tim san.
 *  - Dashboard Widget ca nhan, Chon mon the thao nhanh, Cum san thinh hanh.
 *  - Footer Website day du: 3 huy hieu MXH (Facebook, TikTok, YouTube), Hotline 0799089283, Dia chi DH Kien Truc Ha Noi.
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Trophy, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock,
  QrCode,
  Flame,
  Award,
  Coins,
  Ticket,
  ChevronRight,
  ExternalLink,
  Gift,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Share2
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

// 4 Anh Hero Banner chat luong cao tu dong chuyen sau moi 5 giay
const SLIDES_HERO = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2000&auto=format&fit=crop',
    tag: 'NỀN TẢNG ĐẶT SÂN SỐ 1 VIỆT NAM',
    title: 'Đặt Sân Thể Thao',
    highlight: 'Nhanh Chóng & Giữ Chỗ Tức Thì',
    desc: 'Tìm và đặt lịch sân Cầu lông, Bóng đá, Pickleball và Tennis quanh khu vực của bạn chỉ trong 30 giây mà không lo trùng giờ.'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2000&auto=format&fit=crop',
    tag: 'CẦU LÔNG ĐẠT CHUẨN QUỐC TẾ',
    title: 'Trải Nghiệm Đỉnh Cao',
    highlight: 'Thảm BWF Êm Ái & Ánh Sáng Chống Chói',
    desc: 'Khung giờ vàng 18:00 - 21:00 mở đặt trước mỗi ngày. Áp ngay voucher giảm 20% khi đặt sân hôm nay!'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop',
    tag: 'BÓNG ĐÁ CỎ NHÂN TẠO FIFA',
    title: 'Bùng Nổ Đam Mê Sân Cỏ',
    highlight: 'Giao Lưu Kịch Tính Sân 5 & Sân 7 Người',
    desc: 'Hệ thống 3 cơ sở thể thao ESportKing trải khắp Hà Nội (Cầu Giấy, Đống Đa, Long Biên), kết nối các trận giao hữu cuối tuần dễ dàng.'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2000&auto=format&fit=crop',
    tag: 'ĐẲNG CẤP FIBA & VBA',
    title: 'Bóng Rổ & Quần Vợt',
    highlight: 'Sàn Gỗ Chuẩn Thi Đấu Chuyên Nghiệp',
    desc: 'Hệ thống sân bóng rổ và tennis hiện đại, trang bị mái che và sàn giảm chấn bảo vệ tối đa cho vận động viên.'
  }
];

const DANH_MUC_MON_THE_THAO = [
  { 
    code: 'FOOTBALL', 
    name: 'Bóng Đá', 
    icon: '⚽', 
    count: 'Sân 5, 7 & 11 người', 
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    highlight: 'Cỏ FIFA Pro & Mái Vòm' 
  },
  { 
    code: 'BADMINTON', 
    name: 'Cầu Lông', 
    icon: '🏸', 
    count: 'Thảm BWF & Sàn Gỗ', 
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
    highlight: 'Thảm PVC chuẩn BWF' 
  },
  { 
    code: 'TENNIS', 
    name: 'Tennis', 
    icon: '🎾', 
    count: 'Decoturf & Đất Nện', 
    img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800&auto=format&fit=crop',
    highlight: 'Mặt sân cứng cao cấp' 
  },
  { 
    code: 'BASKETBALL', 
    name: 'Bóng Rổ', 
    icon: '🏀', 
    count: '3x3 & Sàn Gỗ FIBA', 
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
    highlight: 'Sàn gỗ chuẩn Olympic' 
  },
];

// Danh sach voucher ap dung trong he thong
const DANH_SACH_VOUCHERS = [
  {
    code: 'CHAOBANMOI',
    title: 'Voucher Bạn Mới',
    discount: 'Giảm 20%',
    maxText: 'Tối đa 50.000đ',
    desc: 'Dành riêng cho thành viên mới trong lần đặt sân đầu tiên',
    expire: 'HSD: 30 ngày',
    tag: 'HOT NHẤT',
    badgeBg: 'bg-rose-500 text-white'
  },
  {
    code: 'THELUC2026',
    title: 'Khỏe Đẹp Mỗi Ngày',
    discount: 'Giảm 15%',
    maxText: 'Tối đa 40.000đ',
    desc: 'Áp dụng cho mọi khung giờ từ Thứ 2 đến Thứ 5 hàng tuần',
    expire: 'HSD: 31-12-2026',
    tag: 'NGÀY THƯỜNG',
    badgeBg: 'bg-amber-500 text-white'
  },
  {
    code: 'CUOITUANXU',
    title: 'Cuối Tuần Bùng Nổ',
    discount: 'Giảm 25.000đ',
    maxText: 'Đơn từ 150.000đ',
    desc: 'Áp dụng cho các trận cầu giao lưu Thứ 7 & Chủ Nhật',
    expire: 'HSD: Cuối tuần',
    tag: 'CUỐI TUẦN',
    badgeBg: 'bg-emerald-500 text-white'
  },
  {
    code: 'VIPSPORT',
    title: 'Khách Hàng Thân Thiết',
    discount: 'Giảm 30.000đ',
    maxText: 'Đơn từ 200.000đ',
    desc: 'Áp dụng khi thuê sân từ 2 tiếng trở lên tại mọi cụm sân',
    expire: 'HSD: 31-12-2026',
    tag: 'ĐƠN LỚN',
    badgeBg: 'bg-purple-500 text-white'
  },
  {
    code: 'PICKLE50',
    title: 'Đại Tiệc Vợt',
    discount: 'Giảm 10%',
    maxText: 'Tối đa 35.000đ',
    desc: 'Chuyên dụng cho các sân Cầu Lông & Pickleball có mái che',
    expire: 'HSD: 20-11-2026',
    tag: 'HOT TREND',
    badgeBg: 'bg-blue-500 text-white'
  },
  {
    code: 'TRIAN2026',
    title: 'Tri Ân Thể Thao',
    discount: 'Giảm 20.000đ',
    maxText: 'Đơn từ 100.000đ',
    desc: 'Mã tri ân khách hàng tích cực rèn luyện sức khỏe mỗi tuần',
    expire: 'HSD: 15-11-2026',
    tag: 'TRI ÂN',
    badgeBg: 'bg-pink-500 text-white'
  }
];

export default function TrangChu({ user }) {
  const navigate = useNavigate();
  const [cumSanNoiBat, setCumSanNoiBat] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // 1. Slideshow Hero Banner State (5s chuyen anh 1 lan)
  const [slideHienTai, setSlideHienTai] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideHienTai((prev) => (prev + 1) % SLIDES_HERO.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 2. Popup Chao Mung Thanh Vien Moi (Neu chua dang nhap va chua dong trong session)
  const [hienPopupChaoMung, setHienPopupChaoMung] = useState(false);

  useEffect(() => {
    const daDong = sessionStorage.getItem('sb_welcome_popup_closed');
    if (!user && !daDong) {
      const t = setTimeout(() => setHienPopupChaoMung(true), 1200);
      return () => clearTimeout(t);
    }
  }, [user]);

  const dongPopupChaoMung = () => {
    setHienPopupChaoMung(false);
    sessionStorage.setItem('sb_welcome_popup_closed', 'true');
  };

  // 3. Kho Voucher State (Luu vao localStorage, loai bo ma da su dung)
  const [savedVouchers, setSavedVouchers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sportbooking_saved_vouchers') || '["CHAOBANMOI"]');
    } catch {
      return ['CHAOBANMOI'];
    }
  });

  const [usedVouchers, setUsedVouchers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sportbooking_used_vouchers') || '[]');
    } catch {
      return [];
    }
  });

  const [hienTatCaVoucher, setHienTatCaVoucher] = useState(false);

  // Xu ly Luu ma voucher
  const handleLuuVoucher = (code) => {
    let updated;
    if (!savedVouchers.includes(code)) {
      updated = [...savedVouchers, code];
      setSavedVouchers(updated);
      localStorage.setItem('sportbooking_saved_vouchers', JSON.stringify(updated));
    }
  };

  // Xu ly Dung ngay -> Chuyen sang Tim san voi ma duoc ap
  const handleDungNgay = (code) => {
    navigate(`/tim-san?voucher=${code}`);
  };

  // Loc cac voucher chua bi dung het
  const danhSachVoucherHienThi = DANH_SACH_VOUCHERS.filter(
    (v) => !usedVouchers.includes(v.code)
  );

  const danhSachVoucherGioiHan = hienTatCaVoucher 
    ? danhSachVoucherHienThi 
    : danhSachVoucherHienThi.slice(0, 4);

  // Tai danh sach cum san noi bat
  useEffect(() => {
    const taiCumSan = async () => {
      try {
        setDangTai(true);
        const res = await apiDichVu.layDanhSachCumSan({ page: 0, size: 6 });
        setCumSanNoiBat(res.data?.content || []);
      } catch (err) {
        console.error('Lỗi lấy danh sách cụm sân:', err);
      } finally {
        setDangTai(false);
      }
    };
    taiCumSan();
  }, []);

  const currentSlide = SLIDES_HERO[slideHienTai];

  return (
    <div className="min-h-screen bg-[#fbf7f5]">
      
      {/* =========================================================================
          POPUP CHAO MUNG KHANH HANG MOI (Welcome Modal)
         ========================================================================= */}
      <AnimatePresence>
        {hienPopupChaoMung && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center overflow-hidden"
            >
              {/* Nut X dong Popup */}
              <button
                onClick={dongPopupChaoMung}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Đóng popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon qua tang noi bat */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-brand-500/30 animate-bounce">
                🎁
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 mb-2">
                Quà Tặng Thành Viên Mới
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                Chào Mừng Bạn Đến Với ESportKing!
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Đăng ký tài khoản ngay hôm nay để nhận ngay <strong className="text-rose-600 font-bold">Voucher giảm 20%</strong> cho lần đặt sân đầu tiên và <strong className="text-amber-600 font-bold">250 xu tích lũy</strong>!
              </p>

              {/* The Voucher mo ta */}
              <div className="bg-gradient-to-r from-rose-50 to-brand-50 border border-dashed border-brand-300 rounded-2xl p-3.5 mb-6 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mã ưu đãi độc quyền</span>
                  <p className="font-mono font-black text-base text-brand-600">CHAOBANMOI</p>
                  <p className="text-[11px] text-slate-500">Giảm 20% (Tối đa 50.000đ)</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm">
                  -20%
                </span>
              </div>

              {/* Cac nut hanh dong */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    dongPopupChaoMung();
                    navigate('/login?mode=register');
                  }}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Đăng Ký & Nhận Quà Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    dongPopupChaoMung();
                    navigate('/tim-san');
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Để sau, tôi muốn xem sân trước
                </button>
              </div>

            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          1. HERO BANNER SLIDESHOW (5s Tu Dong Chuyen Doi Anh)
         ========================================================================= */}
      <section className="relative min-h-[500px] lg:min-h-[540px] flex items-center justify-center overflow-hidden bg-slate-900">
        
        {/* Slideshow Background Images voi Animation Mo Dan */}
        {SLIDES_HERO.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              idx === slideHienTai ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img 
              src={slide.url} 
              alt={slide.title} 
              className="w-full h-full object-cover object-center filter brightness-[0.38]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-slate-950/40 to-black/60" />
          </div>
        ))}

        {/* Noi dung Banner chinh */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 pb-16">
          
          <Motion.div 
            key={`tag-${slideHienTai}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{currentSlide.tag}</span>
          </Motion.div>

          <Motion.h1 
            key={`title-${slideHienTai}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4"
          >
            {currentSlide.title} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-400 via-brand-500 to-amber-300 bg-clip-text text-transparent">
              {currentSlide.highlight}
            </span>
          </Motion.h1>

          <Motion.p 
            key={`desc-${slideHienTai}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
          >
            {currentSlide.desc}
          </Motion.p>

          {/* Nut hanh dong dan sang Tim San */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <Link
              to="/tim-san"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-full font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Search className="w-4 h-4" />
              <span>Khám Phá & Đặt Sân Ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={user ? "/ve-cua-toi" : "/tim-san"}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full font-bold text-sm border border-white/20 transition flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{user ? "Đặt sân & Mã QR của tôi" : "Xem Mã QR Nhận Sân"}</span>
            </Link>
          </div>

          {/* Dots Dieu Khien Chuyen Slide */}
          <div className="flex items-center justify-center gap-2">
            {SLIDES_HERO.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideHienTai(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === slideHienTai 
                    ? 'w-8 h-2 bg-brand-500 rounded-full' 
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80 rounded-full'
                }`}
                title={`Chuyển đến ảnh ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. DASHBOARD WIDGET CA NHAN (Khi nguoi dung da dang nhap)
         ========================================================================= */}
      {user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-lg shadow-slate-900/5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 text-left w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center text-lg font-black shadow-md shrink-0">
                {user.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wide">Chào mừng trở lại</p>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {user.fullName || 'Bạn yêu thể thao'}! Sẵn sàng cho buổi tập hôm nay chưa?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn đang có <strong className="text-amber-600 font-bold">250 xu tích lũy</strong> và các ưu đãi đặt sân đang mở.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
              <Link
                to="/ve-cua-toi"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>Xem lịch đặt sân của tôi</span>
              </Link>

              <Link
                to="/tim-san"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <span>Thuê sân mới</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          3. CHON NHANH THEO MON THE THAO (QUICK SPORT CATEGORIES)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chọn Môn Thể Thao Yêu Thích
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bấm vào môn bạn muốn chơi để xem ngay các cụm sân chuyên dụng
            </p>
          </div>
          <Link
            to="/tim-san"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả sân</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {DANH_MUC_MON_THE_THAO.map((mon) => (
            <div
              key={mon.code}
              onClick={() => navigate(`/tim-san?sport=${mon.code}`)}
              className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 active:translate-y-0.5 bg-slate-900"
            >
              <img 
                src={mon.img} 
                alt={mon.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold">
                {mon.count}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-2xl mb-1">{mon.icon}</div>
                <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-rose-300 transition-colors">
                  {mon.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {mon.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. KHO VOUCHER & MA GIAM GIA TRUC QUAN (Hieu ung lun nhe + Luu Ma -> Dung Ngay)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
                <Ticket className="w-3.5 h-3.5 text-rose-600" />
                <span>Kho Mã Giảm Giá Độc Quyền</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ưu Đãi Đặt Sân Cực Hời
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Lưu mã vào ví ngay để được tự động trừ tiền khi đặt lịch thuê sân thi đấu
              </p>
            </div>

            <button
              onClick={() => setHienTatCaVoucher(!hienTatCaVoucher)}
              className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{hienTatCaVoucher ? 'Thu gọn mã' : 'Xem thêm voucher'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Luoi cac the Voucher kieu ve khao sat voi hieu ung chuot lun nhe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {danhSachVoucherGioiHan.map((vc) => {
              const daLuu = savedVouchers.includes(vc.code);

              return (
                <div
                  key={vc.code}
                  className="relative bg-white rounded-2xl border-2 border-dashed border-rose-200 p-4 shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1.5 active:translate-y-0.5 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Badge tag tren cung */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vc.badgeBg}`}>
                      {vc.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{vc.expire}</span>
                  </div>

                  {/* Thong tin chiet khau */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-rose-600 tracking-tight">{vc.discount}</span>
                      <span className="text-[11px] font-bold text-slate-500">({vc.maxText})</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{vc.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{vc.desc}</p>
                  </div>

                  {/* Ma Code & Nut Luu Ma / Dung Ngay */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-left">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none">Mã:</span>
                      <span className="font-mono font-bold text-xs text-slate-800">{vc.code}</span>
                    </div>

                    {daLuu ? (
                      /* Nut Dung Ngay mau Xanh la */
                      <button
                        onClick={() => handleDungNgay(vc.code)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                        title="Mã đã được lưu, bấm để áp dụng ngay"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dùng Ngay</span>
                      </button>
                    ) : (
                      /* Nut Luu Ma mau Do */
                      <button
                        onClick={() => handleLuuVoucher(vc.code)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Lưu Mã</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. CUM SAN DUOC YEU THICH & DANH GIA CAO NHAT
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 mb-1">
              <Flame className="w-3 h-3 text-rose-500" />
              Điểm hẹn được nhiều vận động viên lựa chọn
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cụm Sân Thể Thao Thịnh Hành
            </h2>
          </div>
          <Link
            to="/tim-san"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            <span>Tìm thêm sân</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {dangTai ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cumSanNoiBat.map((san, idx) => {
              const courts = san.courts || [];
              const prices = courts.map(c => Number(c.basePrice || 80000));
              const giaMin = prices.length ? Math.min(...prices) : 80000;
              const anhCoSoMap = {
                1: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
                2: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop',
                3: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000&auto=format&fit=crop',
              };
              const anhUrl = anhCoSoMap[san.id] || DANH_MUC_MON_THE_THAO[idx % DANH_MUC_MON_THE_THAO.length].img;
              const tenBadge = san.id === 1 ? 'CƠ SỞ 1 • CẦU GIẤY' : san.id === 2 ? 'CƠ SỞ 2 • ĐỐNG ĐA' : 'CƠ SỞ 3 • LONG BIÊN';
              const mauBadge = san.id === 1 ? 'bg-rose-600' : san.id === 2 ? 'bg-amber-600' : 'bg-blue-600';

              return (
                <div
                  key={san.id}
                  onClick={() => navigate(`/venue/${san.id}`)}
                  className="group bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img 
                        src={anhUrl} 
                        alt={san.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold">
                          📍 {san.district || 'Hà Nội'}
                        </span>
                        <span className={`px-2.5 py-1 text-white rounded-full text-xs font-black shadow-md ${mauBadge}`}>
                          ⚡ {tenBadge}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-black text-slate-900 text-base group-hover:text-brand-600 transition line-clamp-1 mb-1">
                        {san.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1 mb-3">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{san.address}</span>
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>06:00 - 22:30 • Đang mở cửa</span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        🏸 {courts.length} sân đang hoạt động sẵn sàng
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Giá thuê từ</p>
                      <p className="text-base font-black text-brand-600">
                        {giaMin.toLocaleString('vi-VN')}đ<span className="text-xs text-slate-400 font-normal">/giờ</span>
                      </p>
                    </div>
                    <span className="px-3.5 py-2 rounded-xl bg-slate-100 group-hover:bg-brand-600 text-slate-700 group-hover:text-white font-bold text-xs transition flex items-center gap-1">
                      Đặt sân <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          6. VÌ SAO NÊN CHỌN ESPORTKING (Giá trị cốt lõi)
         ========================================================================= */}
      <section className="bg-white border-y border-slate-200/80 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trải Nghiệm Thể Thao Không Lo Trùng Lịch
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-normal">
              Chúng tôi giải quyết toàn bộ khó khăn khi tìm kiếm sân bóng, cầu lông và quản lý khung giờ thi đấu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 text-xl">
                ⚡
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1.5">Giữ chỗ tức thì</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khóa slot thời gian thực ngay khi chọn giờ, cam kết 100% không bao giờ bị trùng sân với người khác.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-xl">
                🎟️
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1.5">Kho Voucher Giảm Giá</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tự động áp mã giảm giá cao nhất, tiết kiệm từ 10% - 20% và tích xu sau mỗi buổi tập luyện.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
                📱
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1.5">Quét QR nhận sân 5 giây</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Không cần giấy tờ rườm rà, đến sân chỉ cần đưa mã QR trên điện thoại để quét check-in và vào sân ngay.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-xl">
                🛡️
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1.5">Hỗ trợ hủy linh hoạt</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chủ động đổi hoặc hủy lịch trước giờ chơi theo quy định minh bạch, hoàn tiền tự động nhanh chóng.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. FOOTER WEBSITE CHUYEN NGHIEP (MXH, Hotline 0799089283, DH Kien Truc Ha Noi)
         ========================================================================= */}
      <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            
            {/* Cot 1: Gioi thieu Thuong hieu & 3 Huy hieu MXH */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center text-white font-black text-base shadow-md">
                  SB
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight">Sport<span className="text-rose-400">Booking</span></span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-rose-300">PRO</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Nền tảng đặt sân thể thao trực tuyến hàng đầu, kết nối hàng nghìn vận động viên và các cụm sân chất lượng cao trên toàn quốc.
              </p>

              {/* 3 Huy hieu Mang xa hoi FB - TikTok - Youtube */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-300 mb-2.5">Kênh truyền thông & Mạng xã hội:</p>
                <div className="flex items-center gap-3">
                  
                  {/* Facebook */}
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                    title="Theo dõi Fanpage Facebook"
                  >
                    <span className="font-black text-sm">f</span>
                  </a>

                  {/* TikTok */}
                  <a 
                    href="https://tiktok.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-black text-slate-200 hover:text-rose-400 border border-slate-700 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                    title="Xem video trên TikTok"
                  >
                    <span className="font-black text-xs">TikTok</span>
                  </a>

                  {/* YouTube */}
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                    title="Đăng ký kênh YouTube"
                  >
                    <span className="font-black text-xs">▶ YT</span>
                  </a>

                </div>
              </div>
            </div>

            {/* Cot 2: Lien he truc tiep (Hotline, Dia chi DH Kien Truc Ha Noi) */}
            <div className="space-y-3 text-left">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Thông Tin Liên Hệ</h4>
              
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hotline hỗ trợ 24/7:</span>
                    <a href="tel:0799089283" className="font-bold text-white hover:text-rose-400 text-sm tracking-wide">
                      0799 089 283
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Trụ sở chính:</span>
                    <span className="font-medium text-slate-200 leading-relaxed">
                      Trường Đại Học Kiến Trúc Hà Nội, Km 10, Đường Nguyễn Trãi, Thanh Xuân, Hà Nội
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email hỗ trợ:</span>
                    <span className="font-medium text-slate-200">
                      support@esportking.vn
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cot 3: Lien ket nhanh */}
            <div className="space-y-3 text-left">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Khám Phá Sân Chơi</h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link to="/tim-san?sport=BADMINTON" className="hover:text-white transition flex items-center gap-1.5">
                    <span>🏸 Sân Cầu Lông Chuẩn BWF</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tim-san?sport=FOOTBALL" className="hover:text-white transition flex items-center gap-1.5">
                    <span>⚽ Sân Bóng Đá Cỏ FIFA 5-7-11 Người</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tim-san?sport=BASKETBALL" className="hover:text-white transition flex items-center gap-1.5">
                    <span>🏀 Sân Bóng Rổ Sàn Gỗ Chuẩn FIBA & 3x3</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tim-san?sport=TENNIS" className="hover:text-white transition flex items-center gap-1.5">
                    <span>🎾 Sân Tennis Sân Cứng Decoturf</span>
                  </Link>
                </li>
                <li>
                  <Link to="/ve-cua-toi" className="hover:text-white transition flex items-center gap-1.5">
                    <span>📱 Mã QR & Đặt Sân Của Tôi</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cot 4: Cam ket dich vu */}
            <div className="space-y-3 text-left">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Cam Kết Dịch Vụ</h4>
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2 text-xs text-slate-300">
                <p className="flex items-center gap-2 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Giữ Chỗ Thành Công</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hệ thống phân tán Microservices khóa slot thời gian thực, đảm bảo bạn luôn có sân thi đấu đúng hẹn.
                </p>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Giờ phục vụ:</span>
                  <span className="font-bold text-white">06:00 - 23:00 Hàng ngày</span>
                </div>
              </div>
            </div>

          </div>

          {/* Dong ban quyen cuoi trang */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 ESportKing Sports Complex. Đồ Án Phát Triển Phần Mềm Hướng Dịch Vụ - ĐH Kiến Trúc Hà Nội.</p>
            <p>Hệ thống 3 cơ sở thể thao chuẩn thi đấu tại Hà Nội (Cầu Giấy • Đống Đa • Long Biên).</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
