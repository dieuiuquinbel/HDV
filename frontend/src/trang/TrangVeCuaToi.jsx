/**
 * File: TrangVeCuaToi.jsx
 * Muc dich: Trang chuyen biet quan ly va trinh dien ve san the thao / ma QR check-in cua khach hang.
 * Chuc nang:
 *  - Hien thi danh sach ve san rieng biet, thoang dang, khong bi bo hep trong profile.
 *  - Hien thi ma QR check-in truc quan, chuoi token bao mat, so tien thanh toan va thoi gian thanh toan.
 *  - Phan biet ve "Cho vao san (Chua quet)" voi cham do thong bao, ve "Da nhan san" va ve "Da huy".
 *  - Ho tro phong to QR toan man hinh (One-click Fullscreen QR Modal) de de dang trinh cho nhan vien quet.
 *  - Ho tro huy don & hoan tien tu dong.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Ticket,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  Maximize2,
  X,
  Copy,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BellRing,
  Plus,
  Minus,
  Coffee,
  ShoppingBag,
  Check
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import { MENU_DICH_VU_TAI_SAN } from '../hangso/danhMucDichVu';

export default function TrangVeCuaToi({ user }) {
  const [danhSachDon, setDanhSachDon] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [tabLoc, setTabLoc] = useState('ALL'); // 'ALL' | 'READY' | 'COMPLETED' | 'CANCELLED'
  
  // State luu anh QR Data URL theo donId: { [bookingId]: dataUrl }
  const [banDoQr, setBanDoQr] = useState({});
  // Modal phong to QR
  const [vePhongTo, setVePhongTo] = useState(null);
  const [daCopyToken, setDaCopyToken] = useState(false);

  // Modal Order Dich Vu tai san
  const [modalOrderDon, setModalOrderDon] = useState(null);
  const [soLuongChon, setSoLuongChon] = useState({});
  const [thongBaoOrder, setThongBaoOrder] = useState('');
  const [danhSachYeuCauDichVu, setDanhSachYeuCauDichVu] = useState(() => {
    try {
      const saved = localStorage.getItem('esportking_service_requests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Dong bo danh sach yeu cau dich vu voi cac tab / nhan vien truc ban
  useEffect(() => {
    const dongBo = () => {
      try {
        const saved = localStorage.getItem('esportking_service_requests');
        if (saved) setDanhSachYeuCauDichVu(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('cap_nhat_dich_vu', dongBo);
    window.addEventListener('storage', dongBo);
    return () => {
      window.removeEventListener('cap_nhat_dich_vu', dongBo);
      window.removeEventListener('storage', dongBo);
    };
  }, []);

  const moModalOrder = (don) => {
    setModalOrderDon(don);
    setSoLuongChon({});
    setThongBaoOrder('');
  };

  const thayDoiSoLuong = (monId, delta) => {
    setSoLuongChon(prev => {
      const cur = prev[monId] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[monId];
        return copy;
      }
      return { ...prev, [monId]: next };
    });
  };

  const guiYeuCauDichVu = () => {
    if (!modalOrderDon) return;
    const danhSachMon = Object.entries(soLuongChon)
      .map(([id, sl]) => {
        const item = MENU_DICH_VU_TAI_SAN.find(m => m.id === id);
        return item ? { ...item, soLuong: sl } : null;
      })
      .filter(Boolean);

    if (danhSachMon.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dịch vụ hoặc đồ uống để gửi yêu cầu.');
      return;
    }

    const itemsStr = danhSachMon.map(m => `${m.soLuong} ${m.ten}`).join(' + ');
    const tongTien = danhSachMon.reduce((sum, m) => sum + (m.gia * m.soLuong), 0);

    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      venueId: modalOrderDon.venueId || 1,
      courtName: `Sân Con #${modalOrderDon.courtId}`,
      customerName: user?.fullName || 'Khách Hàng',
      items: itemsStr,
      totalAmount: tongTien,
      requestTime: 'Vừa xong',
      status: 'PENDING',
      secondsElapsed: 0,
      bookingId: modalOrderDon.id
    };

    try {
      const raw = localStorage.getItem('esportking_service_requests');
      const cur = raw ? JSON.parse(raw) : [];
      const updated = [newReq, ...cur];
      localStorage.setItem('esportking_service_requests', JSON.stringify(updated));
      setDanhSachYeuCauDichVu(updated);
      window.dispatchEvent(new Event('cap_nhat_dich_vu'));
      setThongBaoOrder('Yêu cầu đã gửi thành công! Bàn trực ban đang chuẩn bị mang ra sân cho bạn (Cam kết < 5 phút).');
      setTimeout(() => {
        setModalOrderDon(null);
        setThongBaoOrder('');
      }, 2500);
    } catch (e) {
      console.error('Lỗi gửi dịch vụ:', e);
    }
  };

  // Tai du lieu don dat san (ngam = true se khong hien spinner to gay giat lag)
  const taiDanhSachVe = async (ngam = false) => {
    if (!user) return;
    try {
      if (!ngam) setDangTai(true);
      const res = await apiDichVu.layDonDatCuaToi({ page: 0, size: 50 });
      const ds = res.data?.content || [];
      
      // Kiem tra neu co ve vua duoc check-in (chuyen sang COMPLETED) thi phat chuong Ting
      setDanhSachDon(prev => {
        const truocDoCoConfirmed = prev.some(d => d.status === 'CONFIRMED');
        const gioDayCoCompleted = ds.some(d => d.status === 'COMPLETED');
        if (truocDoCoConfirmed && gioDayCoCompleted && prev.length > 0) {
          try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const now = ctx.currentTime;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(1046.5, now);
              gain.gain.setValueAtTime(0.3, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc.stop(now + 0.8);
            }
          } catch {}
        }
        return ds;
      });

      // Sinh ma QR cho tat ca cac ve CONFIRMED va COMPLETED
      const qrMap = {};
      for (const don of ds) {
        if (don.checkinToken) {
          try {
            const url = await QRCode.toDataURL(don.checkinToken, {
              width: 300,
              margin: 1,
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            });
            qrMap[don.id] = url;
          } catch (e) {
            console.error('Loi tao QR cho don #' + don.id, e);
          }
        }
      }
      setBanDoQr(qrMap);
    } catch (err) {
      console.error('Loi tai danh sach ve:', err);
    } finally {
      if (!ngam) setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSachVe();
  }, [user]);

  // Tu dong polling 3s mot lan de dong bo realtime khi khach dang cho vao san
  useEffect(() => {
    const coVeChoCheckin = danhSachDon.some(d => d.status === 'CONFIRMED');
    if (!coVeChoCheckin) return;

    const timer = setInterval(() => {
      taiDanhSachVe(true);
    }, 3000);

    return () => clearInterval(timer);
  }, [danhSachDon]);

  // Lang nghe su kien cap nhat tu tab nhan vien truc ban
  useEffect(() => {
    const onSync = () => taiDanhSachVe(true);
    window.addEventListener('cap_nhat_ve', onSync);
    window.addEventListener('storage', onSync);
    window.addEventListener('focus', onSync);
    return () => {
      window.removeEventListener('cap_nhat_ve', onSync);
      window.removeEventListener('storage', onSync);
      window.removeEventListener('focus', onSync);
    };
  }, []);

  // Xu ly huy don & hoan tien
  const xuLyHuyDon = async (bookingId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy vé #${bookingId}? Hệ thống sẽ tự động hoàn tiền 100% vào tài khoản của bạn.`)) return;
    try {
      await apiDichVu.huyDonDat(bookingId);
      alert('Đã hủy vé thành công! Tiền đang được chuyển hoàn.');
      taiDanhSachVe();
      // Phat su kien cap nhat badge
      window.dispatchEvent(new Event('cap_nhat_ve'));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy vé');
    }
  };

  // Copy token
  const handleCopy = (text) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setDaCopyToken(true);
      setTimeout(() => setDaCopyToken(false), 2000);
    } catch {}
  };

  // Tinh toan thong ke
  const tongVe = danhSachDon.length;
  // Ve cho quet = CONFIRMED (da thanh toan, chua duoc nhan vien quet)
  const veChoVaoSan = danhSachDon.filter(d => d.status === 'CONFIRMED');
  const soVeChoVaoSan = veChoVaoSan.length;
  const veDaXong = danhSachDon.filter(d => d.status === 'COMPLETED').length;

  // Loc danh sach theo tab
  const danhSachHienThi = danhSachDon.filter(don => {
    if (tabLoc === 'READY') return don.status === 'CONFIRMED';
    if (tabLoc === 'COMPLETED') return don.status === 'COMPLETED';
    if (tabLoc === 'CANCELLED') return don.status === 'CANCELLED' || don.status === 'CANCELLED_REFUNDED';
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 text-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 max-w-md w-full shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Ticket className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Vui Lòng Đăng Nhập</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Bạn cần đăng nhập để xem danh sách vé thi đấu, mã QR nhận sân và quản lý lịch đặt sân của mình.
          </p>
          <div className="pt-2">
            <Link
              to="/login?mode=login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
            >
              Đăng nhập tài khoản
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* COMPACT MODERN HEADER (TINH GỌN, TIẾT KIỆM KHÔNG GIAN) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Đặt Sân Của Tôi
              </h1>
              {soVeChoVaoSan > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {soVeChoVaoSan} vé chờ check-in
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {tongVe} đơn đặt
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Trình diện mã QR tại quầy trực ban cơ sở để nhận sân thi đấu ngay lập tức.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={taiDanhSachVe}
              disabled={dangTai}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer"
              title="Làm mới danh sách vé"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dangTai ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
            <Link
              to="/tim-san"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-brand-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Đặt thêm sân</span>
            </Link>
          </div>
        </div>

        {/* THANH TAB LỌC TÍCH HỢP SỐ LIỆU */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setTabLoc('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              tabLoc === 'ALL'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              tabLoc === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tongVe}
            </span>
          </button>

          <button
            onClick={() => setTabLoc('READY')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              tabLoc === 'READY'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Chờ vào sân</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              soVeChoVaoSan > 0
                ? 'bg-rose-500 text-white animate-pulse'
                : (tabLoc === 'READY' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
            }`}>
              {soVeChoVaoSan}
            </span>
          </button>

          <button
            onClick={() => setTabLoc('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              tabLoc === 'COMPLETED'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Đã nhận sân</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              tabLoc === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {veDaXong}
            </span>
          </button>

          <button
            onClick={() => setTabLoc('CANCELLED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              tabLoc === 'CANCELLED'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Đã hủy</span>
          </button>
        </div>

        {/* DANH SACH THE VE (MATCH TICKET CARDS) */}
        {dangTai ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-bold">Đang tải danh sách vé thể thao của bạn...</p>
          </div>
        ) : danhSachHienThi.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800">Không có vé nào trong mục này</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bạn chưa có vé thi đấu nào phù hợp với bộ lọc hiện tại. Hãy chọn sân và đặt chỗ ngay để sẵn sàng ra sân!
            </p>
            <Link
              to="/tim-san"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition"
            >
              Khám phá danh sách sân thi đấu
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {danhSachHienThi.map((don) => {
              const laChuaQuet = don.status === 'CONFIRMED';
              const laDangSuDung = don.status === 'CHECKED_IN';
              const laDaHoanTat = don.status === 'COMPLETED';
              const laChoThanhToan = don.status === 'PENDING_PAYMENT';
              const laDaHuy = don.status === 'CANCELLED' || don.status === 'CANCELLED_REFUNDED';
              const qrUrl = banDoQr[don.id];

              return (
                <div
                  key={don.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    laChuaQuet
                      ? 'border-brand-300 ring-2 ring-brand-500/10 hover:shadow-md'
                      : laDangSuDung
                        ? 'border-blue-300 ring-2 ring-blue-500/10 hover:shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                    {/* COT TRAI (8/12): THONG TIN CHI TIET SAN & GIAO DICH */}
                    <div className="lg:col-span-8 p-6 sm:p-7 space-y-5 text-left">
                      {/* Top row: Badge trang thai & Ma ve */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">
                            Mã vé: <span className="text-brand-600">#{don.id}</span>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs font-bold text-slate-500">
                            Loại: Sân thi đấu tiêu chuẩn
                          </span>
                        </div>

                        {/* Status Badge */}
                        {laChuaQuet && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            🔴 SẴN SÀNG CHECK-IN (CHƯA QUÉT)
                          </span>
                        )}
                        {laDangSuDung && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                            🔵 ĐANG NHẬN SÂN (CHECKED-IN)
                          </span>
                        )}
                        {laDaHoanTat && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ĐÃ HOÀN TẤT CA
                          </span>
                        )}
                        {laChoThanhToan && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            CHỜ THANH TOÁN
                          </span>
                        )}
                        {laDaHuy && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black">
                            ĐÃ HỦY & HOÀN TIỀN
                          </span>
                        )}
                      </div>

                      {/* Ten Co So & Dia Diem */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            {don.courtName ? `${don.courtName} • ` : `Sân Con #${don.courtId} • `}
                            {don.venueName || 'Hệ Thống eSportKing'}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Cơ sở đạt chuẩn thi đấu FIFA/BWF, có mái vòm che mưa nắng & đèn chiếu sáng 500 Lux.
                          </p>
                        </div>
                      </div>

                      {/* Thong tin thoi gian & so tien */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-brand-600" />
                            Ngày & Giờ Thi Đấu:
                          </div>
                          <p className="text-xs font-black text-slate-800">
                            {don.bookingDate} • <span className="text-brand-600">{don.startSlot} - {don.endSlot}</span>
                          </p>
                        </div>

                        <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            Số Tiền Đã Thanh Toán:
                          </div>
                          <p className="text-xs font-black text-emerald-600">
                            {Number(don.totalAmount).toLocaleString('vi-VN')} {don.currency || 'VND'}
                          </p>
                        </div>
                      </div>

                      {/* THANH TIẾN TRÌNH VÒNG ĐỜI THUÊ SÂN (ORDER TIMELINE) */}
                      <div className="pt-2 pb-1 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                            Quy trình đơn đặt sân:
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Tự động đồng bộ theo thời gian thực
                          </span>
                        </div>
                        <div className="relative flex items-center justify-between">
                          {/* Đường line kết nối các bước */}
                          <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-200 -z-0" />
                          <div
                            className={`absolute left-6 top-3 h-0.5 bg-emerald-500 transition-all duration-500 -z-0 ${
                              laDaNhanSan ? 'w-[calc(100%-48px)]' : (!laChoThanhToan && !laDaHuy ? 'w-[calc(66%-32px)]' : 'w-0')
                            }`}
                          />

                          {/* Bước 1: Giữ chỗ */}
                          <div className="flex flex-col items-center relative z-10">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 text-[11px] font-bold shadow-sm">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700">1. Giữ Chỗ</span>
                          </div>

                          {/* Bước 2: Thanh toán */}
                          <div className="flex flex-col items-center relative z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] font-bold shadow-sm ${
                              !laChoThanhToan && !laDaHuy ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {!laChoThanhToan && !laDaHuy ? <Check className="w-3.5 h-3.5" /> : '2'}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              !laChoThanhToan && !laDaHuy ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              2. Thanh Toán
                            </span>
                          </div>

                          {/* Bước 3: Check-in */}
                          <div className="flex flex-col items-center relative z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] font-bold shadow-sm ${
                              laDaNhanSan ? 'bg-emerald-500 text-white' : (laChuaQuet ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse' : 'bg-slate-200 text-slate-500')
                            }`}>
                              {laDaNhanSan ? <Check className="w-3.5 h-3.5" /> : '3'}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              laDaNhanSan ? 'text-emerald-700' : (laChuaQuet ? 'text-brand-600 font-black' : 'text-slate-400')
                            }`}>
                              3. Check-in Sân
                            </span>
                          </div>

                          {/* Bước 4: Trả sân & Hoàn tất */}
                          <div className="flex flex-col items-center relative z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] font-bold shadow-sm ${
                              laDaNhanSan ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {laDaNhanSan ? <Check className="w-3.5 h-3.5" /> : '4'}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              laDaNhanSan ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              4. Hoàn Tất Ca
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DANH SÁCH YÊU CẦU DỊCH VỤ TẠI SÂN CỦA VÉ NÀY (LIVE STATUS) */}
                      {(() => {
                        const yeuCauDichVuDon = danhSachYeuCauDichVu.filter(y => y.bookingId === don.id);
                        if (yeuCauDichVuDon.length === 0) return null;
                        return (
                          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-black text-amber-900">
                              <span className="flex items-center gap-1.5">
                                <BellRing className="w-4 h-4 text-amber-600" />
                                Dịch vụ tại sân đang yêu cầu:
                              </span>
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                SLA &lt; 5 phút
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {yeuCauDichVuDon.map(yc => (
                                <div key={yc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                                  <span className="font-bold text-slate-800">{yc.items}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black w-fit ${
                                    yc.status === 'PENDING' ? 'bg-rose-100 text-rose-700 animate-pulse' :
                                    yc.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {yc.status === 'PENDING' ? '⏳ Bàn trực ban đang chuẩn bị' :
                                     yc.status === 'IN_PROGRESS' ? '🏃 Đang mang ra sân' :
                                     '✅ Đã bàn giao tận sân'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Thoi gian thanh toan / tao don */}
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>
                          Thời gian thanh toán/tạo vé:{' '}
                          <span className="font-bold text-slate-700">
                            {don.createdAt ? new Date(don.createdAt).toLocaleString('vi-VN') : 'Hôm nay'}
                          </span>
                        </span>

                        {/* Nut Hanh Dong */}
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          {/* Nút Gọi Dịch Vụ Tại Sân cho vé sẵn sàng hoặc đã nhận sân */}
                          {(laChuaQuet || laDaNhanSan) && (
                            <button
                              type="button"
                              onClick={() => moModalOrder(don)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>Gọi Dịch Vụ Tại Sân</span>
                            </button>
                          )}
                          {laChoThanhToan && (
                            <Link
                              to={`/thanh-toan/${don.id}`}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow transition"
                            >
                              Thanh toán ngay
                            </Link>
                          )}
                          {laChuaQuet && (
                            <button
                              onClick={() => xuLyHuyDon(don.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200"
                            >
                              Hủy & Hoàn tiền
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* COT PHAI (4/12): KHỐI MÃ QR CHECK-IN TRỰC TIẾP */}
                    <div className="lg:col-span-4 p-6 sm:p-7 bg-[#fcfcfd] flex flex-col items-center justify-center text-center space-y-3.5">
                      {qrUrl ? (
                        <>
                          <div className="relative group cursor-pointer" onClick={() => setVePhongTo(don)}>
                            <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-sm transition transform group-hover:scale-105">
                              <img
                                src={qrUrl}
                                alt={`Mã QR đơn #${don.id}`}
                                className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                              />
                            </div>
                            <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">
                              <Maximize2 className="w-5 h-5 mr-1" />
                              Phóng to QR
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                              Mã Token Check-in
                            </span>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                              <span>{don.checkinToken ? `${don.checkinToken.substring(0, 16)}...` : 'N/A'}</span>
                              <button
                                onClick={() => handleCopy(don.checkinToken)}
                                title="Sao chép token"
                                className="hover:text-brand-600 transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => setVePhongTo(don)}
                            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow transition flex items-center justify-center gap-1.5"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            Phóng to đưa nhân viên quét
                          </button>
                        </>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                          <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                          Vé chưa tạo mã QR
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL PHÓNG TO MÃ QR TOÀN MÀN HÌNH */}
      {vePhongTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Nut dong */}
            <button
              onClick={() => setVePhongTo(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-black mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mã QR Check-in Nhận Sân
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Vé Sân #{vePhongTo.id}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Đưa trực tiếp mã này cho nhân viên trạm trực ban quét nhận sân.
              </p>
            </div>

            {/* QR Image Big */}
            <div className="p-4 bg-white rounded-3xl border-2 border-slate-900 shadow-inner inline-block">
              <img
                src={banDoQr[vePhongTo.id]}
                alt="QR Toàn Màn Hình"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>

            {/* Chi tiet gio thi dau */}
            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600 font-bold">
              <div>Khung giờ: <span className="text-slate-900 font-black">{vePhongTo.bookingDate} ({vePhongTo.startSlot} - {vePhongTo.endSlot})</span></div>
              <div>Số tiền: <span className="text-emerald-600 font-black">{Number(vePhongTo.totalAmount).toLocaleString('vi-VN')} {vePhongTo.currency}</span></div>
            </div>

            {/* Copy token */}
            <button
              onClick={() => handleCopy(vePhongTo.checkinToken)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              {daCopyToken ? 'Đã sao chép mã Token!' : 'Sao chép chuỗi mã Token'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL GỌI DỊCH VỤ TẠI SÂN (LIVE DISPATCHER SLA < 5 PHÚT) */}
      {modalOrderDon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left space-y-5 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Nút đóng */}
            <button
              onClick={() => setModalOrderDon(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black mb-2">
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                Dịch Vụ Tiếp Tế Tận Sân • Cam Kết Dưới 5 Phút
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Gọi Nước & Dịch Vụ Tại Sân
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Đơn hàng sẽ được nhân viên trạm trực ban tiếp nhận và mang ra trực tiếp tại <strong className="text-slate-800">Sân Con #{modalOrderDon.courtId}</strong>.
              </p>
            </div>

            {thongBaoOrder && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{thongBaoOrder}</span>
              </div>
            )}

            {/* Danh sách Menu Dịch vụ */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {MENU_DICH_VU_TAI_SAN.map((mon) => {
                const sl = soLuongChon[mon.id] || 0;
                return (
                  <div
                    key={mon.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      sl > 0 ? 'bg-amber-50/40 border-amber-300' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-lg shadow-2xs">
                        {mon.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{mon.ten}</h4>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                          {mon.mienPhi ? (
                            <span className="text-emerald-600 font-black">Miễn phí sơ cứu</span>
                          ) : (
                            `${mon.gia.toLocaleString('vi-VN')} đ / ${mon.donVi}`
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Bộ tăng giảm số lượng */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => thayDoiSoLuong(mon.id, -1)}
                        disabled={sl === 0}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black transition ${
                          sl > 0 ? 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 shadow-2xs' : 'bg-slate-200/60 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-slate-900">{sl}</span>
                      <button
                        type="button"
                        onClick={() => thayDoiSoLuong(mon.id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white flex items-center justify-center font-black transition shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chi tiết tổng tiền & nút gửi */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Tổng chi phí dịch vụ thêm:</span>
                <span className="text-base font-black text-amber-600">
                  {Object.entries(soLuongChon).reduce((sum, [id, sl]) => {
                    const item = MENU_DICH_VU_TAI_SAN.find(m => m.id === id);
                    return sum + (item ? item.gia * sl : 0);
                  }, 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOrderDon(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={guiYeuCauDichVu}
                  className="flex-[2] py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Gửi Yêu Cầu Tới Bàn Trực Ban
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
