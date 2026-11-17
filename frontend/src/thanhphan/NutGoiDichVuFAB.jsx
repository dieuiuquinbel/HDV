/**
 * File: NutGoiDichVuFAB.jsx
 * Muc dich: Nut noi Floating Action Button (FAB) co dinh goc phai man hinh cho phep goi tiep te do an & nuoc uong moi luc moi noi.
 * Chuc nang:
 *  - Luon hien dien o goc phai duoi (fixed bottom-6 right-6) voi animation chuong rung & huy hieu gio hang.
 *  - Mo Smart Vending Kiosk (May ban hang the thao tu dong) 4 danh muc phong phu: Do Uong, Do An, Dung Cu, Y Te.
 *  - Tu dong lay thong tin san dang thi dau cua khach de nhan vien mang tan san.
 *  - Chuyen huong sang tab Thanh Toan de quet VietQR / The Visa.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BellRing,
  X,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Coffee,
  HeartPulse,
  Flame,
  CheckCircle2,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import { DANH_MUC_KIOSK } from '../hangso/danhMucDichVu';

export default function NutGoiDichVuFAB({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [moKiosk, setMoKiosk] = useState(false);
  const [tabHienTai, setTabHienTai] = useState('DRINK'); // 'DRINK' | 'FOOD' | 'GEAR' | 'MEDIC'
  const [gioHang, setGioHang] = useState({});
  const [sanNhanHang, setSanNhanHang] = useState('');
  const [danhSachSanCuaToi, setDanhSachSanCuaToi] = useState([]);

  const [sanDangChoi, setSanDangChoi] = useState(null);

  // Tai thong tin san dang thi dau cua khach:
  // Chi hien thi nut khi khach da CHECK-IN nhan san thanh cong trong ngay hom nay
  useEffect(() => {
    if (!user) {
      setSanDangChoi(null);
      setDanhSachSanCuaToi([]);
      return;
    }

    const homNay = new Date().toISOString().slice(0, 10);
    apiDichVu.layDonDatCuaToi({ page: 0, size: 20 })
      .then(res => {
        const ds = res.data?.content || [];
        // Loc cac don da check-in (COMPLETED hoac CONFIRMED trong ngay hom nay)
        const sanHopLe = ds.filter(d => {
          const laHomNay = d.bookingDate === homNay;
          const daCheckIn = d.status === 'COMPLETED' || d.status === 'CONFIRMED';
          return laHomNay && daCheckIn;
        });

        if (sanHopLe.length > 0) {
          const activeDon = sanHopLe[0];
          setSanDangChoi(activeDon);
          setDanhSachSanCuaToi(sanHopLe);
          setSanNhanHang(`Sân Con #${activeDon.courtId} • Cơ Sở ${activeDon.venueId || 1}`);
        } else {
          setSanDangChoi(null);
          setDanhSachSanCuaToi([]);
          setSanNhanHang('');
        }
      })
      .catch(() => {
        setSanDangChoi(null);
        setDanhSachSanCuaToi([]);
        setSanNhanHang('');
      });
  }, [user, moKiosk]);

  // Tong so mon trong gio
  const tongSoLuong = Object.values(gioHang).reduce((sum, n) => sum + n, 0);

  // Tong tien
  const tongTien = Object.entries(gioHang).reduce((sum, [id, sl]) => {
    const item = DANH_MUC_KIOSK.find(m => m.id === id);
    return sum + (item ? item.gia * sl : 0);
  }, 0);

  const thayDoiSoLuong = (id, delta) => {
    setGioHang(prev => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  // Tien hanh thanh toan don hang Kiosk
  const tienHanhThanhToan = () => {
    if (tongSoLuong === 0) {
      alert('Vui lòng chọn ít nhất 1 món đồ ăn hoặc nước uống.');
      return;
    }

    const danhSachChiTiet = Object.entries(gioHang).map(([id, sl]) => {
      const item = DANH_MUC_KIOSK.find(m => m.id === id);
      return { ...item, soLuong: sl };
    });

    const donKiosk = {
      type: 'KIOSK_ORDER',
      orderId: `KS-${Date.now().toString().slice(-6)}`,
      items: danhSachChiTiet,
      itemSummary: danhSachChiTiet.map(m => `${m.soLuong}x ${m.ten}`).join(', '),
      totalAmount: tongTien,
      deliveryLocation: sanNhanHang,
      customerName: user?.fullName || 'Khách Hàng',
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('esportking_pending_kiosk_order', JSON.stringify(donKiosk));
    } catch {}

    setMoKiosk(false);
    navigate('/thanh-toan?type=kiosk');
  };

  // Chỉ hiển thị nút FAB khi khách đã đăng nhập và đã check-in nhận sân tại cơ sở
  if (!user || !sanDangChoi) {
    return null;
  }

  // Ẩn nút FAB ở trang đăng nhập / đăng ký
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const danhSachLoc = DANH_MUC_KIOSK.filter(m => m.danhMuc === tabHienTai);

  return (
    <>
      {/* NUT NOI FLOATING ACTION BUTTON (FAB) GÓC PHẢI DƯỚI */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMoKiosk(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-full font-black text-xs shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <BellRing className="w-5 h-5 animate-bounce" />
            {tongSoLuong > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-rose-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                {tongSoLuong}
              </span>
            )}
          </div>
          <span className="hidden sm:inline-block tracking-wide">
            Gọi Tiếp Tế Sân #{sanDangChoi.courtId}
          </span>
          <span className="sm:hidden tracking-wide">
            Sân #{sanDangChoi.courtId}
          </span>
        </button>
      </div>

      {/* MODAL SMART VENDING KIOSK (MÁY BÁN HÀNG TỰ ĐỘNG) */}
      {moKiosk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-left space-y-5 relative animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[92vh] flex flex-col">
            
            {/* Header Kiosk */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Smart Vending Kiosk • Tiếp Tế Tận Sân SLA &lt; 5 Phút
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Máy Bán Đồ Ăn & Nước Uống Tự Động
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Chọn đồ ăn, nước điện giải hoặc dụng cụ, nhân viên sẽ giao trực tiếp ra sân cho bạn.
                </p>
              </div>

              <button
                onClick={() => setMoKiosk(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chon dia diem giao hang */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Giao tới vị trí:</span>
              </div>
              <input
                type="text"
                value={sanNhanHang}
                onChange={(e) => setSanNhanHang(e.target.value)}
                placeholder="VD: Sân Bóng 5-A1, CS1 Cầu Giấy"
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 flex-1 sm:max-w-xs"
              />
            </div>

            {/* 4 Tab danh muc Kiosk */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 overflow-x-auto shrink-0">
              <button
                onClick={() => setTabHienTai('DRINK')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  tabHienTai === 'DRINK' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>⚡ Nước Điện Giải</span>
              </button>
              <button
                onClick={() => setTabHienTai('FOOD')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  tabHienTai === 'FOOD' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🥪 Đồ Ăn Năng Lượng</span>
              </button>
              <button
                onClick={() => setTabHienTai('GEAR')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  tabHienTai === 'GEAR' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🎽 Dụng Cụ Thi Đấu</span>
              </button>
              <button
                onClick={() => setTabHienTai('MEDIC')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  tabHienTai === 'MEDIC' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🩹 Y Tế Sơ Cứu (0đ)</span>
              </button>
            </div>

            {/* Danh sach mat hang theo luoi Kiosk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 min-h-[220px]">
              {danhSachLoc.map((mon) => {
                const sl = gioHang[mon.id] || 0;
                return (
                  <div
                    key={mon.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      sl > 0
                        ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                        {mon.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 truncate">{mon.ten}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-amber-600">
                            {mon.mienPhi ? 'Miễn phí' : `${mon.gia.toLocaleString('vi-VN')} đ`}
                          </span>
                          <span className="text-[10px] text-slate-400">/{mon.donVi}</span>
                          {mon.tag && (
                            <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 text-[9px] font-bold">
                              {mon.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nut Tang / Giam */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => thayDoiSoLuong(mon.id, -1)}
                        disabled={sl === 0}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black transition cursor-pointer ${
                          sl > 0
                            ? 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-slate-900">{sl}</span>
                      <button
                        type="button"
                        onClick={() => thayDoiSoLuong(mon.id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white flex items-center justify-center font-black transition shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Tong Tien & Nut Chuyen Sang Thanh Toan */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="w-full sm:w-auto text-left">
                <span className="text-xs text-slate-500 font-bold block">
                  Đã chọn: <strong className="text-slate-900">{tongSoLuong} món</strong>
                </span>
                <span className="text-xl font-black text-amber-600 tracking-tight">
                  {tongTien.toLocaleString('vi-VN')} VND
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMoKiosk(false)}
                  className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={tienHanhThanhToan}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tiến Hành Thanh Toán</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
