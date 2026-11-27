/**
 * File: ModalGoiDichVuSan.jsx
 * Muc dich: Popup goi do an, nuoc uong va dich vu tai san gom 2 tab ro rang (Do an & Nuoc uong / Dich vu san).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bandage,
  CircleDot,
  Clock,
  Cross,
  CupSoda,
  Droplets,
  Loader2,
  Minus,
  Package,
  Plus,
  Sandwich,
  Shirt,
  ShoppingBag,
  Snowflake,
  Trash2,
  UtensilsCrossed,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import { MENU_DICH_VU_TAI_SAN } from '../hangso/danhMucDichVu';
import { hienToast } from '../tienich/thongBao';

const ICON_MAP = {
  water: { Icon: Droplets, style: 'bg-sky-50 text-sky-600 border-sky-100' },
  soda: { Icon: CupSoda, style: 'bg-rose-50 text-rose-600 border-rose-100' },
  energy: { Icon: Zap, style: 'bg-amber-50 text-amber-600 border-amber-100' },
  food: { Icon: UtensilsCrossed, style: 'bg-orange-50 text-orange-600 border-orange-100' },
  snack: { Icon: Package, style: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  sandwich: { Icon: Sandwich, style: 'bg-orange-50 text-orange-600 border-orange-100' },
  towel: { Icon: Snowflake, style: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  tape: { Icon: Bandage, style: 'bg-slate-100 text-slate-600 border-slate-200' },
  shirt: { Icon: Shirt, style: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  ball: { Icon: CircleDot, style: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  racket: { Icon: Wrench, style: 'bg-violet-50 text-violet-600 border-violet-100' },
  package: { Icon: Package, style: 'bg-slate-100 text-slate-700 border-slate-200' },
  medical: { Icon: Cross, style: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
};

export default function ModalGoiDichVuSan({ don, user, onDong, onGuiThanhCong }) {
  const [tab, setTab] = useState('DO_AN'); // 'DO_AN' | 'DICH_VU'
  const [soLuongChon, setSoLuongChon] = useState({});
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => {
    if (don) {
      setTab('DO_AN');
      setSoLuongChon({});
      setDangGui(false);
    }
  }, [don?.id]);

  // Khoa cuon nen & dong bang ESC
  useEffect(() => {
    if (!don) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !dangGui) onDong();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [don, dangGui, onDong]);

  const danhSachTheoTab = useMemo(
    () => MENU_DICH_VU_TAI_SAN.filter((m) => m.nhom === tab),
    [tab]
  );

  const thongKeChon = useMemo(() => {
    let soMonDoAn = 0;
    let soMonDichVu = 0;
    let tongSoLuong = 0;
    let tongTien = 0;
    const danhSachMon = [];

    for (const [id, sl] of Object.entries(soLuongChon)) {
      if (!sl || sl <= 0) continue;
      const item = MENU_DICH_VU_TAI_SAN.find((m) => m.id === id);
      if (!item) continue;
      if (item.nhom === 'DO_AN') soMonDoAn += sl;
      else soMonDichVu += sl;
      tongSoLuong += sl;
      tongTien += item.gia * sl;
      danhSachMon.push({ ...item, soLuong: sl });
    }

    return { soMonDoAn, soMonDichVu, tongSoLuong, tongTien, danhSachMon };
  }, [soLuongChon]);

  const thayDoiSoLuong = (monId, delta) => {
    setSoLuongChon((prev) => {
      const next = Math.max(0, (prev[monId] || 0) + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[monId];
        return copy;
      }
      return { ...prev, [monId]: next };
    });
  };

  const xuLyGuiYeuCau = async () => {
    if (!don || dangGui) return;
    if (thongKeChon.danhSachMon.length === 0) {
      hienToast('Vui lòng chọn ít nhất 1 món hoặc dịch vụ.', 'warning');
      return;
    }

    const itemsStr = thongKeChon.danhSachMon
      .map((m) => `${m.soLuong} ${m.ten}`)
      .join(' + ');

    setDangGui(true);
    try {
      const res = await apiDichVu.taoYeuCauDichVuTaiSan(don.id, {
        items: itemsStr,
        totalAmount: thongKeChon.tongTien,
        customerName: user?.fullName || 'Khách Hàng',
        venueId: don.venueId || 1
      });
      if (onGuiThanhCong && res.data) {
        onGuiThanhCong(res.data);
      }
      hienToast('Đã gửi đơn tới quầy. Nhân viên đang chuẩn bị mang ra sân cho bạn.', 'success');
      onDong();
    } catch (e) {
      hienToast(
        e.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng đảm bảo bạn đã Check-in vào sân.',
        'error'
      );
    } finally {
      setDangGui(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const tenSanHienThi = don?.courtName || `Sân #${don?.courtId}`;

  return createPortal(
    <AnimatePresence>
      {don && (
        <motion.div
          key="backdrop-goi-dich-vu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !dangGui) onDong();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Gọi đồ và dịch vụ tại sân"
        >
          <motion.div
            key="panel-goi-dich-vu"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[88vh]"
          >
            {/* Header gon sach */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Gọi đồ & Dịch vụ tại sân
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>Giao tận <strong className="text-slate-800">{tenSanHienThi}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      Khoảng 5 phút
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => !dangGui && onDong()}
                  disabled={dangGui}
                  aria-label="Đóng"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 2 Tab phan loai ro rang */}
              <div className="grid grid-cols-2 gap-2 p-1 mt-4 rounded-2xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => setTab('DO_AN')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    tab === 'DO_AN'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-brand-600" />
                  <span>Đồ ăn & Nước uống</span>
                  {thongKeChon.soMonDoAn > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-black leading-none">
                      {thongKeChon.soMonDoAn}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTab('DICH_VU')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    tab === 'DICH_VU'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-slate-700" />
                  <span>Dịch vụ sân</span>
                  {thongKeChon.soMonDichVu > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black leading-none">
                      {thongKeChon.soMonDichVu}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Danh sach mon theo luoi 2 cot */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {danhSachTheoTab.map((mon) => {
                  const sl = soLuongChon[mon.id] || 0;
                  const iconCfg = ICON_MAP[mon.iconKey] || ICON_MAP.package;
                  const IconComp = iconCfg.Icon;

                  return (
                    <div
                      key={mon.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        sl > 0
                          ? 'bg-brand-50/40 border-brand-300 ring-1 ring-brand-500/15'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconCfg.style}`}>
                          <IconComp className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                            {mon.ten}
                          </h4>
                          <p className="text-[11px] font-semibold mt-0.5">
                            {mon.mienPhi ? (
                              <span className="text-emerald-600 font-black">Miễn phí</span>
                            ) : (
                              <span className="text-slate-500">
                                <strong className="text-slate-800">{mon.gia.toLocaleString('vi-VN')} đ</strong> / {mon.donVi}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Bo tang giam so luong */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sl > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => thayDoiSoLuong(mon.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                              aria-label={`Giảm ${mon.ten}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-black text-slate-900 tabular-nums">
                              {sl}
                            </span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => thayDoiSoLuong(mon.id, 1)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition active:scale-95 cursor-pointer ${
                            sl > 0
                              ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                          aria-label={`Thêm ${mon.ten}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer co dinh: tom tat & nut dat */}
            <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500">
                    {thongKeChon.tongSoLuong > 0
                      ? `Đã chọn ${thongKeChon.tongSoLuong} món`
                      : 'Chưa chọn món nào'}
                  </span>
                  <span className="text-base font-black text-slate-900 tabular-nums">
                    {thongKeChon.tongTien.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {thongKeChon.tongSoLuong > 0 && (
                  <button
                    type="button"
                    onClick={() => setSoLuongChon({})}
                    disabled={dangGui}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa chọn</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onDong}
                  disabled={dangGui}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={xuLyGuiYeuCau}
                  disabled={dangGui || thongKeChon.tongSoLuong === 0}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-black shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {dangGui ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {thongKeChon.tongTien > 0
                          ? `Đặt ngay • ${thongKeChon.tongTien.toLocaleString('vi-VN')} đ`
                          : 'Gửi yêu cầu'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
