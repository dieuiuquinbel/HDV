/**
 * File: ThanhDieuHuong.jsx
 * Muc dich: Thanh dieu huong tren cung (Top Navbar) he thong the thao ESportKing.
 * Chuc nang: Menu Trang chu, Tim san, Quet Check-in; Ho tro phan quyen ADMIN, STAFF, CUSTOMER; Dropdown Avatar va Chuong thong bao thoi gian thuc.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Search, 
  QrCode, 
  User, 
  Bell, 
  BellRing,
  Coins, 
  LogOut, 
  Shield, 
  Building2, 
  Menu, 
  X,
  Ticket,
  ChevronDown,
  Sparkles,
  Gift,
  CheckCheck,
  Clock,
  ArrowRight,
  CreditCard,
  Wallet
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import ModalViDienTu from './ModalViDienTu';

// Danh sach thong bao chuan thuong hieu ESportKing Ha Noi
const THONG_BAO_MAU = [
  {
    id: 1,
    type: 'PROMO',
    tag: 'Khuyến mãi',
    title: 'Sale giờ vàng tại ESportKing! 🤩',
    desc: 'Voucher CHAOBANMOI giảm 20% đang chờ bạn chốt đơn đặt sân cầu lông & bóng đá tối nay tại 3 cơ sở Hà Nội!',
    time: 'Hôm nay, 14:06',
    unread: true,
    badgeColor: 'bg-rose-500',
    icon: '🎁'
  },
  {
    id: 2,
    type: 'PROMO',
    tag: 'Khuyến mãi',
    title: 'Ưu đãi đặt sân Tennis & Pickleball 🎉',
    desc: 'Tặng nước giải khát miễn phí và giảm 30.000đ cho đơn đặt sân tại Cơ Sở 2 (Đống Đa) & Cơ Sở 3 (Long Biên).',
    time: 'Hôm qua, 09:30',
    unread: true,
    badgeColor: 'bg-amber-500',
    icon: '🔥'
  },
  {
    id: 3,
    type: 'BOOKING',
    tag: 'Đơn đặt sân',
    title: 'Đặt sân thành công! Mã đơn #EK2026 🏟️',
    desc: 'Sân Cầu Lông A1 tại Cơ Sở 1 (Cầu Giấy - Số 18 Duy Tân) đã giữ chỗ cho bạn từ 18:00 - 20:00 hôm nay. Chúc bạn thi đấu thăng hoa!',
    time: '02-11-2026',
    unread: true,
    badgeColor: 'bg-emerald-500',
    icon: '✅'
  },
  {
    id: 4,
    type: 'REMINDER',
    tag: 'Nhắc nhở',
    title: 'Nhắc lịch thi đấu sắp diễn ra ⏰',
    desc: 'Còn 2 tiếng nữa là đến giờ thi đấu tại Sân Bóng Đá B1 - Cơ Sở 2 (Đống Đa). Đừng quên quét mã QR check-in tại quầy nhé!',
    time: '01-11-2026',
    unread: false,
    badgeColor: 'bg-blue-500',
    icon: '⚽'
  }
];

export default function ThanhDieuHuong({ user, onDangXuat }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [soThongBaoChuaDoc, setSoThongBaoChuaDoc] = useState(0);
  const [soVeChuaQuet, setSoVeChuaQuet] = useState(0);
  const [soYeuCauDangCho, setSoYeuCauDangCho] = useState(0);
  const [tabThongBao, setTabThongBao] = useState('ALL');
  const [menuMoRong, setMenuMoRong] = useState(false);
  const [hienPopupThongBao, setHienPopupThongBao] = useState(false);
  const [danhSachThongBao, setDanhSachThongBao] = useState(user ? [] : THONG_BAO_MAU);
  const [hienDropdownAvatar, setHienDropdownAvatar] = useState(false);
  const [hienModalVi, setHienModalVi] = useState(false);
  const [soDuVi, setSoDuVi] = useState(0);

  const dropdownAvatarRef = useRef(null);
  const dropdownThongBaoRef = useRef(null);

  // Tải thông tin số dư Ví SportPay (chỉ dành cho Khách hàng)
  const taiSoDuVi = async () => {
    if (!user || user.role !== 'CUSTOMER') return;
    try {
      const res = await apiDichVu.layThongTinVi();
      if (res.data?.balance !== undefined) {
        setSoDuVi(Number(res.data.balance));
      }
    } catch (e) {
      // Vi chua khoi tao hoac offline
    }
  };

  // Tải số lượng yêu cầu phục vụ đang chờ (chỉ dành cho Nhân viên trực quầy)
  const taiSoYeuCauDangCho = async () => {
    if (!user || user.role !== 'STAFF') {
      setSoYeuCauDangCho(0);
      return;
    }
    try {
      let venueId = Number(localStorage.getItem('esportking_active_station') || 1);
      if (user.email?.includes('cs1')) venueId = 1;
      else if (user.email?.includes('cs2')) venueId = 2;
      else if (user.email?.includes('cs3')) venueId = 3;
      const res = await apiDichVu.layDanhSachYeuCauDichVu({ venueId });
      if (Array.isArray(res?.data)) {
        setSoYeuCauDangCho(res.data.filter(r => r.status === 'PENDING').length);
      }
    } catch (e) {
      // Bo qua neu tam mat ket noi
    }
  };

  // Tải thông báo thực tế từ Notification Service
  const taiThongBao = async () => {
    if (!user) return;
    try {
      const [resList, resCount] = await Promise.allSettled([
        apiDichVu.layThongBaoCuaToi({ page: 0, size: 20 }),
        apiDichVu.demThongBaoChuaDoc()
      ]);

      if (resList.status === 'fulfilled' && resList.value.data?.content) {
        const rawList = resList.value.data.content;
        const mapped = rawList.map(n => {
          const loai = n.type || 'BOOKING';
          let tag = 'Thông báo';
          let badgeColor = 'bg-brand-500';
          let icon = '📢';

          if (loai === 'WITHDRAW_SUCCESS') {
            tag = 'Rút tiền';
            badgeColor = 'bg-indigo-500';
            icon = '💸';
          } else if (loai === 'WALLET_TOPUP') {
            tag = 'Nạp ví';
            badgeColor = 'bg-emerald-500';
            icon = '💰';
          } else if (loai === 'BOOKING_REFUNDED') {
            tag = 'Hoàn tiền';
            badgeColor = 'bg-amber-500';
            icon = '🔄';
          } else if (loai === 'PAYMENT_SUCCESS') {
            tag = 'Thanh toán';
            badgeColor = 'bg-emerald-500';
            icon = '✅';
          } else if (loai.startsWith('BOOKING')) {
            tag = 'Đặt sân';
            badgeColor = 'bg-blue-500';
            icon = '🏟️';
          } else if (loai === 'PROMO') {
            tag = 'Khuyến mãi';
            badgeColor = 'bg-rose-500';
            icon = '🎁';
          }

          const daDoc = n.isRead !== undefined ? Boolean(n.isRead) : Boolean(n.read);

          return {
            id: n.id,
            type: loai,
            tag: tag,
            title: n.title,
            desc: n.message || n.content,
            time: n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Vừa xong',
            unread: !daDoc,
            badgeColor: badgeColor,
            icon: icon
          };
        });
        setDanhSachThongBao(mapped);
      }

      if (resCount.status === 'fulfilled' && resCount.value.data) {
        const c = resCount.value.data.count || resCount.value.data.unreadCount || 0;
        setSoThongBaoChuaDoc(Number(c));
      }
    } catch (e) {
      console.warn('Lỗi khi tải thông báo:', e);
    }
  };

  // Kiem tra so luong ve chua duoc nhan vien quet check-in de hien thi cham do
  const taiSoVeChuaQuet = async () => {
    if (!user || user.role === 'STAFF' || user.role === 'ADMIN') return;
    try {
      const res = await apiDichVu.layDonDatCuaToi({ page: 0, size: 50 });
      const ds = res.data?.content || [];
      const countChuaQuet = ds.filter(d => d.status === 'CONFIRMED').length;
      setSoVeChuaQuet(countChuaQuet);
    } catch (e) {
      console.warn('Khong the lay danh sach ve de tinh cham do:', e);
    }
  };

  useEffect(() => {
    taiThongBao();
    taiSoVeChuaQuet();
    taiSoDuVi();
    taiSoYeuCauDangCho();

    // Lắng nghe sự kiện cập nhật thông báo & vé & ví & yêu cầu phục vụ
    const handleCapNhat = () => {
      taiThongBao();
      taiSoVeChuaQuet();
      taiSoDuVi();
      taiSoYeuCauDangCho();
    };
    const handleCapNhatSoYeuCau = (event) => {
      if (typeof event?.detail === 'number') {
        setSoYeuCauDangCho(event.detail);
      } else {
        taiSoYeuCauDangCho();
      }
    };
    window.addEventListener('cap_nhat_thong_bao', handleCapNhat);
    window.addEventListener('cap_nhat_ve', handleCapNhat);
    window.addEventListener('cap_nhat_so_du_vi', handleCapNhat);
    window.addEventListener('cap_nhat_so_yeu_cau', handleCapNhatSoYeuCau);
    return () => {
      window.removeEventListener('cap_nhat_thong_bao', handleCapNhat);
      window.removeEventListener('cap_nhat_ve', handleCapNhat);
      window.removeEventListener('cap_nhat_so_du_vi', handleCapNhat);
      window.removeEventListener('cap_nhat_so_yeu_cau', handleCapNhatSoYeuCau);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownAvatarRef.current && !dropdownAvatarRef.current.contains(event.target)) {
        setHienDropdownAvatar(false);
      }
      if (dropdownThongBaoRef.current && !dropdownThongBaoRef.current.contains(event.target)) {
        setHienPopupThongBao(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const docTatCaThongBao = async () => {
    try {
      await apiDichVu.danhDauTatCaDaDocThongBao();
    } catch (err) {
      console.warn('Loi khi danh dau doc tat ca:', err);
    }
    setDanhSachThongBao(prev => prev.map(t => ({ ...t, unread: false })));
    setSoThongBaoChuaDoc(0);
  };

  const docThongBao = async (item) => {
    if (item.unread) {
      try {
        await apiDichVu.danhDauDaDocThongBao(item.id);
        setDanhSachThongBao(prev => prev.map(t => t.id === item.id ? { ...t, unread: false } : t));
        setSoThongBaoChuaDoc(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Loi khi doc thong bao:', err);
      }
    }
  };

  const danhSachLoc = danhSachThongBao.filter(t => {
    if (tabThongBao === 'ALL') return true;
    if (tabThongBao === 'PROMO') return t.type === 'PROMO';
    if (tabThongBao === 'BOOKING') {
      return t.type.startsWith('BOOKING') || t.type.startsWith('PAYMENT') || t.type.startsWith('CHECKIN');
    }
    return true;
  });

  // TÁI CẤU TRÚC DANH SÁCH TAB THEO VAI TRÒ
  const navItems = [];
  if (!user) {
    // 1. Khi CHƯA ĐĂNG NHẬP (Gọn gàng, tập trung đúng nhu cầu: Trang chủ & Tìm sân)
    navItems.push(
      { to: '/', label: 'Trang chủ', icon: Trophy },
      { to: '/tim-san', label: 'Tìm sân (3 Cơ sở)', icon: Search }
    );
  } else if (user.role === 'STAFF') {
    // 2. Nhân viên trực quầy (2 tab thống nhất trên Header: Check-in & Lịch Sân + Yêu Cầu Phục Vụ)
    navItems.push(
      { to: '/checkin?tab=checkin', label: 'Check-in & Lịch Sân', icon: QrCode },
      {
        to: '/checkin?tab=requests',
        label: 'Yêu Cầu Phục Vụ',
        icon: BellRing,
        badgeDot: soYeuCauDangCho > 0,
        count: soYeuCauDangCho,
        showCount: true
      }
    );
  } else if (user.role === 'ADMIN') {
    // 3. Quản trị viên Admin (Đúng 2 tab: Trạm Check-In & Quản trị Admin)
    navItems.push(
      { to: '/checkin', label: 'Trạm Check-In', icon: QrCode },
      { to: '/admin', label: 'Quản trị Admin', icon: Shield }
    );
  } else {
    // 5. KHÁCH HÀNG THÀNH VIÊN (CHÍNH XÁC 4 TAB DUY NHẤT: Trang chủ, Tìm sân, Thanh toán, Đặt sân của tôi)
    navItems.push(
      { to: '/', label: 'Trang chủ', icon: Trophy },
      { to: '/tim-san', label: 'Tìm sân', icon: Search },
      { to: '/thanh-toan', label: 'Thanh toán', icon: CreditCard },
      { 
        to: '/ve-cua-toi', 
        label: 'Đặt sân của tôi', 
        icon: Ticket,
        badgeDot: soVeChuaQuet > 0,
        count: soVeChuaQuet
      }
    );
  }

  const laDuongDanHienTai = (path) => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'checkin';
    if (path === '/checkin?tab=checkin') {
      return location.pathname === '/checkin' && currentTab !== 'requests';
    }
    if (path === '/checkin?tab=requests') {
      return location.pathname === '/checkin' && currentTab === 'requests';
    }
    if (path === '/' && location.pathname === '/') return true;
    if (path.startsWith('/tim-san') && (location.pathname === '/tim-san' || location.pathname === '/tim-kiem')) {
      return true;
    }
    if (path.startsWith('/thanh-toan') && location.pathname.startsWith('/thanh-toan')) {
      return true;
    }
    if (path.startsWith('/ve-cua-toi') && (location.pathname.startsWith('/ve-cua-toi') || location.pathname.startsWith('/dat-ve-cua-toi'))) {
      return true;
    }
    if (path.startsWith('/me') && location.pathname === '/me') {
      return true;
    }
    if (path === '/checkin' && location.pathname === '/checkin') return true;
    if (path === '/admin' && location.pathname.startsWith('/admin')) return true;
    return false;
  };

  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand ESportKing */}
          <Link to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'STAFF' ? '/checkin' : '/'} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
              <span className="font-black text-lg tracking-wider">EK</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">ESport<span className="text-brand-600">King</span></span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-100">HÀ NỘI</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Hệ thống 3 cơ sở thể thao chuẩn thi đấu</p>
            </div>
          </Link>

          {/* Menu Tabs giua */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 shadow-inner">
            {navItems.map((item) => {
              const active = laDuongDanHienTai(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-bold scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.showCount && item.count > 0 ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      active ? 'bg-white text-rose-600' : 'bg-rose-600 text-white animate-pulse'
                    }`}>
                      {item.count}
                    </span>
                  ) : item.badgeDot && (
                    <span className="relative flex h-2.5 w-2.5 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Tien ich ben phai */}
          <div className="flex items-center gap-3">
            
            {/* Vi Dien Tu SportPay (chi hien thi cho Khach Hang) */}
            {user && user.role === 'CUSTOMER' && (
              <button
                onClick={() => setHienModalVi(true)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-900 transition cursor-pointer shadow-sm group"
                title="Ví SportPay - Bấm để Nạp/Rút tiền"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] text-amber-700/80 font-bold leading-none">Ví SportPay</span>
                  <span className="text-xs font-black text-amber-900 leading-tight">{soDuVi.toLocaleString('vi-VN')} đ</span>
                </div>
              </button>
            )}

            {/* Chuong Thong Bao */}
            <div className="relative" ref={dropdownThongBaoRef}>
              <button
                onClick={() => setHienPopupThongBao(!hienPopupThongBao)}
                className="w-10 h-10 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative flex items-center justify-center transition cursor-pointer"
                title="Thông báo"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {soThongBaoChuaDoc > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 z-10 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black leading-none rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                    {soThongBaoChuaDoc > 99 ? '99+' : soThongBaoChuaDoc}
                  </span>
                )}
              </button>

              {/* Popover Thong Bao */}
              {hienPopupThongBao && (
                <div className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-0 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                  
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Thông Báo Mới Nhất</h4>
                      <p className="text-[11px] text-slate-400 font-medium">Cập nhật ưu đãi và trạng thái đặt sân</p>
                    </div>
                    {soThongBaoChuaDoc > 0 && (
                      <button 
                        onClick={docTatCaThongBao}
                        className="text-xs text-brand-600 hover:text-brand-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Đọc Tất Cả</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white overflow-x-auto text-xs font-bold no-scrollbar">
                    <button
                      onClick={() => setTabThongBao('ALL')}
                      className={`px-3 py-1.5 rounded-full transition shrink-0 flex items-center gap-1.5 ${
                        tabThongBao === 'ALL'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span>Tất cả</span>
                      {soThongBaoChuaDoc > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                          {soThongBaoChuaDoc}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setTabThongBao('PROMO')}
                      className={`px-3 py-1.5 rounded-full transition shrink-0 flex items-center gap-1 ${
                        tabThongBao === 'PROMO' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5 text-rose-500" />
                      <span>Ưu đãi</span>
                    </button>
                    <button
                      onClick={() => setTabThongBao('BOOKING')}
                      className={`px-3 py-1.5 rounded-full transition shrink-0 flex items-center gap-1 ${
                        tabThongBao === 'BOOKING' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Lịch đặt sân</span>
                    </button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                    {danhSachLoc.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                        <p>Không có thông báo nào trong mục này</p>
                      </div>
                    ) : (
                      danhSachLoc.map((tb) => (
                        <div 
                          key={tb.id} 
                          onClick={() => docThongBao(tb)}
                          className={`p-4 flex gap-3.5 hover:bg-slate-50/80 transition cursor-pointer ${
                            tb.unread ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-2xl ${tb.badgeColor} text-white flex items-center justify-center shrink-0 text-base shadow-sm`}>
                            {tb.icon}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{tb.title}</h5>
                              {tb.unread && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{tb.desc}</p>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">{tb.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
                    <Link
                      to="/tim-san"
                      onClick={() => setHienPopupThongBao(false)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1"
                    >
                      <span>Khám phá 3 cơ sở ESportKing Hà Nội</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              )}
            </div>

            {/* Khi da dang nhap */}
            {user ? (
              <div className="relative" ref={dropdownAvatarRef}>
                <button
                  onClick={() => setHienDropdownAvatar(!hienDropdownAvatar)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-slate-50 hover:bg-slate-100/90 rounded-full cursor-pointer transition border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.fullName ? user.fullName.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:block text-left max-w-[120px]">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate">{user.fullName || 'Người dùng'}</p>
                    <p className="text-[10px] font-semibold text-brand-600 leading-none">
                      {user.role === 'ADMIN' ? '👑 Chủ Hệ Thống' : user.role === 'STAFF' ? '⚡ Nhân Viên Trực Ban' : 'Thành Viên'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${hienDropdownAvatar ? 'rotate-180 text-brand-600' : ''}`} />
                </button>

                {hienDropdownAvatar && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-b from-brand-50/50 to-transparent rounded-t-2xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {user.fullName ? user.fullName.charAt(0) : 'U'}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.fullName || 'Người dùng'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email || ''}</p>
                        {user.role === 'CUSTOMER' && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                              <Coins className="w-2.5 h-2.5 text-amber-500" /> 250 xu tích lũy
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="py-1.5 divide-y divide-slate-50 text-sm">
                      <div className="py-1">
                        <Link
                          to="/me?tab=profile"
                          onClick={() => setHienDropdownAvatar(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Tài khoản của tôi</span>
                        </Link>

                        {user.role === 'CUSTOMER' && (
                          <>
                            <Link
                              to="/ve-cua-toi"
                              onClick={() => setHienDropdownAvatar(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition font-medium"
                            >
                              <Ticket className="w-4 h-4 text-slate-400" />
                              <span>Đặt sân & Lịch của tôi</span>
                              {soVeChuaQuet > 0 && (
                                <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                                  {soVeChuaQuet}
                                </span>
                              )}
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setHienDropdownAvatar(false);
                                setHienModalVi(true);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition font-medium text-left cursor-pointer"
                            >
                              <Wallet className="w-4 h-4 text-amber-500" />
                              <span>Ví SportPay & Rút tiền NH</span>
                              <span className="ml-auto text-xs font-black text-amber-600">{soDuVi.toLocaleString('vi-VN')} đ</span>
                            </button>

                            <Link
                              to="/me?tab=vouchers"
                              onClick={() => setHienDropdownAvatar(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition font-medium"
                            >
                              <Ticket className="w-4 h-4 text-slate-400" />
                              <span>Ví Voucher & Ưu đãi</span>
                            </Link>
                          </>
                        )}

                        {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                          <Link
                            to="/checkin?tab=checkin"
                            onClick={() => setHienDropdownAvatar(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-brand-600 hover:bg-brand-50 transition font-bold"
                          >
                            <QrCode className="w-4 h-4 text-brand-600" />
                            <span>Trạm Trực Ban & Quét QR</span>
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setHienDropdownAvatar(false);
                            onDangXuat();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition font-medium text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login?mode=login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Nut Mobile Menu */}
            <button
              onClick={() => setMenuMoRong(!menuMoRong)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {menuMoRong ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuMoRong && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const active = laDuongDanHienTai(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuMoRong(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition ${
                  active ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badgeDot && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Vi Dien Tu SportPay (chi danh cho Khach Hang) */}
      {user && user.role === 'CUSTOMER' && (
        <ModalViDienTu 
          hienThi={hienModalVi} 
          onDong={() => setHienModalVi(false)} 
          user={user} 
          onSoDuThayDoi={setSoDuVi} 
        />
      )}
    </header>
  );
}
