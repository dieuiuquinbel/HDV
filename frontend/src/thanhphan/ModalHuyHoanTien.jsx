/**
 * File: ModalHuyHoanTien.jsx
 * Muc dich: Popup xac nhan huy ve & tinh toan hoan tien theo thoi gian thuc, kem animation muot ma (Framer Motion).
 * Chuc nang:
 *  - Render bang React Portal ra document.body de luon can giua man hinh.
 *  - Tinh thoi gian con lai tu thoi diem hien tai den gio bat dau thi dau (cap nhat moi giay).
 *  - Hien thi 3 moc chinh sach hoan tien (100% / 80% / 50%) va lam noi bat moc dang ap dung.
 *  - Hien thi bang tinh minh bach: Tong da thanh toan, Ti le hoan, Phi huy, So tien thuc nhan ve Vi SportPay.
 *  - Chuyen sang man hinh thanh cong co animation + bo dem so tien khi huy ve thanh cong.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MapPin,
  ShieldAlert,
  Sparkles,
  Wallet,
  X,
  ArrowRight
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

// Tinh toan chinh sach hoan tien dua tren thoi diem hien tai va gio thi dau
function tinhThongTinHoanTien(don, nowMs) {
  const tongTien = Number(don?.totalAmount || 0);
  const macDinh = {
    hopLe: true,
    quaGio: false,
    diffMs: null,
    diffHours: null,
    chuoiThoiGianConLai: 'Chưa xác định',
    tiLePhanTram: 100,
    soTienHoan: tongTien,
    phiHuy: 0,
    mocId: 'HIGH',
    nhanChinhSach: 'Trước từ 12 giờ trở lên'
  };

  if (!don?.bookingDate || !don?.startSlot) {
    return macDinh;
  }

  try {
    const [gio, phut] = don.startSlot.split(':').map(Number);
    const [nam, thang, ngay] = don.bookingDate.split('-').map(Number);
    const gioBatDau = new Date(nam, thang - 1, ngay, gio, phut, 0);
    const diffMs = gioBatDau.getTime() - nowMs;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs <= 0) {
      return {
        hopLe: false,
        quaGio: true,
        diffMs: 0,
        diffHours: 0,
        chuoiThoiGianConLai: 'Đã đến / quá giờ thi đấu',
        tiLePhanTram: 0,
        soTienHoan: 0,
        phiHuy: tongTien,
        mocId: 'EXPIRED',
        nhanChinhSach: 'Đã bắt đầu giờ thi đấu (không hỗ trợ hủy)'
      };
    }

    const tongPhut = Math.floor(diffMs / (1000 * 60));
    const soNgay = Math.floor(tongPhut / (60 * 24));
    const soGio = Math.floor((tongPhut % (60 * 24)) / 60);
    const soPhut = tongPhut % 60;
    const soGiay = Math.floor((diffMs / 1000) % 60);

    let chuoiThoiGianConLai = '';
    if (soNgay > 0) {
      chuoiThoiGianConLai = `${soNgay} ngày ${soGio} giờ ${soPhut} phút`;
    } else if (soGio > 0) {
      chuoiThoiGianConLai = `${soGio} giờ ${soPhut} phút ${soGiay} giây`;
    } else {
      chuoiThoiGianConLai = `${soPhut} phút ${soGiay} giây`;
    }

    if (diffHours >= 12) {
      return {
        hopLe: true,
        quaGio: false,
        diffMs,
        diffHours,
        chuoiThoiGianConLai,
        tiLePhanTram: 100,
        soTienHoan: tongTien,
        phiHuy: 0,
        mocId: 'HIGH',
        nhanChinhSach: 'Hủy trước >= 12 giờ: Hoàn 100%'
      };
    }

    if (diffHours >= 5) {
      const soTienHoan = Math.round(tongTien * 0.8);
      return {
        hopLe: true,
        quaGio: false,
        diffMs,
        diffHours,
        chuoiThoiGianConLai,
        tiLePhanTram: 80,
        soTienHoan,
        phiHuy: tongTien - soTienHoan,
        mocId: 'MEDIUM',
        nhanChinhSach: 'Hủy trước từ 5 đến dưới 12 giờ: Hoàn 80%'
      };
    }

    const soTienHoan = Math.round(tongTien * 0.5);
    return {
      hopLe: true,
      quaGio: false,
      diffMs,
      diffHours,
      chuoiThoiGianConLai,
      tiLePhanTram: 50,
      soTienHoan,
      phiHuy: tongTien - soTienHoan,
      mocId: 'LOW',
      nhanChinhSach: 'Hủy dưới 5 giờ trước giờ chơi: Hoàn 50%'
    };
  } catch {
    return macDinh;
  }
}

// Component dem so tien tang dan muot ma o man hinh thanh cong
function DemSoTien({ giaTri }) {
  const [hienThi, setHienThi] = useState(0);

  useEffect(() => {
    let frameId;
    const batDau = performance.now();
    const thoiLuong = 650;

    const buoc = (now) => {
      const tienDo = Math.min(1, (now - batDau) / thoiLuong);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - tienDo, 3);
      setHienThi(Math.round(giaTri * eased));
      if (tienDo < 1) {
        frameId = requestAnimationFrame(buoc);
      }
    };

    frameId = requestAnimationFrame(buoc);
    return () => cancelAnimationFrame(frameId);
  }, [giaTri]);

  return <>{hienThi.toLocaleString('vi-VN')} đ</>;
}

const CAC_MOC_CHINH_SACH = [
  { id: 'HIGH', nhan: 'Trước >= 12 giờ', tiLe: '100%' },
  { id: 'MEDIUM', nhan: '5 - dưới 12 giờ', tiLe: '80%' },
  { id: 'LOW', nhan: 'Dưới 5 giờ', tiLe: '50%' }
];

const HAT_PHAO_HOA = [
  { x: -64, y: -42, delay: 0.05, color: 'bg-emerald-400' },
  { x: 68, y: -38, delay: 0.08, color: 'bg-amber-400' },
  { x: -54, y: 36, delay: 0.12, color: 'bg-teal-400' },
  { x: 58, y: 34, delay: 0.1, color: 'bg-brand-400' },
  { x: 0, y: -62, delay: 0.06, color: 'bg-emerald-500' },
  { x: -78, y: -4, delay: 0.14, color: 'bg-sky-400' },
  { x: 78, y: 2, delay: 0.11, color: 'bg-emerald-300' }
];

export default function ModalHuyHoanTien({ don, onDong, onHuyThanhCong }) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [buoc, setBuoc] = useState('CONFIRM'); // 'CONFIRM' | 'SUCCESS'
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState('');
  const [ketQua, setKetQua] = useState(null);

  // Reset trang thai moi khi mo modal cho 1 don moi
  useEffect(() => {
    if (don) {
      setNowMs(Date.now());
      setBuoc('CONFIRM');
      setDangXuLy(false);
      setLoi('');
      setKetQua(null);
    }
  }, [don?.id]);

  // Cap nhat thoi gian con lai theo tung giay khi dang o buoc xac nhan
  useEffect(() => {
    if (!don || buoc !== 'CONFIRM') return;
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [don, buoc]);

  // Khoa cuon nen & ho tro phim ESC
  useEffect(() => {
    if (!don) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !dangXuLy) {
        onDong();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [don, dangXuLy, onDong]);

  const thongTinHoan = useMemo(() => tinhThongTinHoanTien(don, nowMs), [don, nowMs]);

  const xuLyXacNhanHuy = async () => {
    if (!don || !thongTinHoan.hopLe || dangXuLy) return;
    setDangXuLy(true);
    setLoi('');

    try {
      const res = await apiDichVu.huyDonDat(don.id);
      const donMoi = res.data;

      setKetQua({
        bookingId: don.id,
        status: donMoi?.status || 'CANCELLED_REFUNDED',
        soTienHoan: thongTinHoan.soTienHoan,
        tiLePhanTram: thongTinHoan.tiLePhanTram,
        tongTienGoc: Number(don.totalAmount || 0),
        thoiDiemHuy: new Date().toLocaleString('vi-VN')
      });
      setBuoc('SUCCESS');

      window.dispatchEvent(new Event('cap_nhat_ve'));
      window.dispatchEvent(new Event('cap_nhat_so_du_vi'));
      window.dispatchEvent(new Event('cap_nhat_thong_bao'));

      if (onHuyThanhCong) {
        onHuyThanhCong(donMoi);
      }
    } catch (err) {
      setLoi(err.response?.data?.message || 'Không thể hủy đơn đặt sân lúc này. Vui lòng thử lại.');
    } finally {
      setDangXuLy(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {don && (
        <motion.div
          key="backdrop-huy-hoan-tien"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/75 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !dangXuLy) {
              onDong();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận hủy vé và hoàn tiền"
        >
          <motion.div
            key="panel-huy-hoan-tien"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-200/80 overflow-hidden my-auto"
          >
            <AnimatePresence mode="wait">
              {buoc === 'CONFIRM' ? (
                <motion.div
                  key="step-confirm"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* Header canh bao */}
                  <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-rose-600 via-rose-600 to-brand-700 text-white relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => !dangXuLy && onDong()}
                      disabled={dangXuLy}
                      aria-label="Đóng cửa sổ"
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3.5 pr-10">
                      <motion.div
                        initial={{ rotate: -12, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-lg"
                      >
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-1">
                          Xác nhận hủy vé #{don.id}
                        </span>
                        <h3 className="text-lg font-black leading-snug">
                          Quý khách xác nhận hủy đặt sân?
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Noi dung chi tiet & tinh toan hoan tien */}
                  <div className="p-6 space-y-4">
                    {/* Tom tat ve */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-black text-slate-800 leading-snug">
                          {don.courtName ? `${don.courtName} • ` : `Sân Con #${don.courtId} • `}
                          {don.venueName || 'Hệ Thống ESportKing'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          {don.bookingDate} • <strong className="text-brand-600">{don.startSlot} - {don.endSlot}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Dong ho tinh thoi gian tu thoi diem hien tai */}
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        thongTinHoan.quaGio
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            thongTinHoan.quaGio ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold opacity-75">
                            Tính từ thời điểm hiện tại đến giờ thi đấu
                          </span>
                          <span className="text-sm font-black tabular-nums">
                            {thongTinHoan.quaGio ? thongTinHoan.chuoiThoiGianConLai : `Còn ${thongTinHoan.chuoiThoiGianConLai}`}
                          </span>
                        </div>
                      </div>
                      {!thongTinHoan.quaGio && (
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-xs font-black text-amber-800 shrink-0 shadow-2xs">
                          Hoàn {thongTinHoan.tiLePhanTram}%
                        </span>
                      )}
                    </div>

                    {/* 3 moc chinh sach hoan tien */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>Chính sách hoàn tiền ESportKing áp dụng lúc này:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {CAC_MOC_CHINH_SACH.map((moc) => {
                          const dangApDung = thongTinHoan.mocId === moc.id;
                          return (
                            <div
                              key={moc.id}
                              className={`p-2.5 rounded-xl border text-center transition-all ${
                                dangApDung
                                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                                  : 'bg-slate-50/60 border-slate-200/70 opacity-60'
                              }`}
                            >
                              <div
                                className={`text-sm font-black ${
                                  dangApDung ? 'text-emerald-700' : 'text-slate-700'
                                }`}
                              >
                                {moc.tiLe}
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 mt-0.5 leading-tight">
                                {moc.nhan}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bang tinh chi tiet so tien hoan */}
                    {thongTinHoan.quaGio ? (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <span>
                          Giờ thi đấu đã bắt đầu nên hệ thống không thể hủy vé và hoàn tiền tự động. Vui lòng liên hệ quầy trực ban nếu cần hỗ trợ.
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border border-emerald-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold">Số tiền đã thanh toán</span>
                          <span className="font-bold text-slate-800">
                            {Number(don.totalAmount || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        {thongTinHoan.phiHuy > 0 && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="font-semibold">
                              Phí hủy sát giờ ({100 - thongTinHoan.tiLePhanTram}%)
                            </span>
                            <span className="font-bold text-rose-600">
                              -{thongTinHoan.phiHuy.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between">
                          <span className="font-black text-slate-800 flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            Tiền hoàn về Ví SportPay ({thongTinHoan.tiLePhanTram}%)
                          </span>
                          <span className="text-lg font-black text-emerald-600">
                            +{thongTinHoan.soTienHoan.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Thong bao loi neu API that bai */}
                    {loi && (
                      <motion.div
                        initial={{ opacity: 0, x: 0 }}
                        animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                        transition={{ duration: 0.35 }}
                        className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{loi}</span>
                      </motion.div>
                    )}

                    {/* Cum nut hanh dong */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={onDong}
                        disabled={dangXuLy}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer disabled:opacity-50"
                      >
                        Không, giữ lại vé
                      </button>
                      <button
                        type="button"
                        onClick={xuLyXacNhanHuy}
                        disabled={dangXuLy || !thongTinHoan.hopLe}
                        className="flex-[1.3] py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-brand-600 hover:from-rose-700 hover:to-brand-700 active:scale-[0.98] text-white text-xs font-black shadow-lg shadow-rose-600/25 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {dangXuLy ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang xử lý hủy & hoàn tiền...</span>
                          </>
                        ) : (
                          <>
                            <span>Xác nhận hủy vé</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* BUOC 2: MAN HINH THONG BAO HOAN TIEN THANH CONG */
                <motion.div
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="p-6 sm:p-8 text-center space-y-5 relative overflow-hidden"
                >
                  {/* Icon thanh cong + hieu ung song lan toa & hat phao hoa */}
                  <div className="relative flex items-center justify-center py-3">
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0.7 }}
                      animate={{ scale: 1.75, opacity: 0 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute w-20 h-20 rounded-full bg-emerald-400/30 pointer-events-none"
                    />
                    {HAT_PHAO_HOA.map((hat, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{ x: hat.x, y: hat.y, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.75, delay: hat.delay, ease: 'easeOut' }}
                        className={`absolute w-2 h-2 rounded-full ${hat.color} pointer-events-none`}
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0, rotate: -25 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                      className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/35 ring-8 ring-emerald-50"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1.5"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black">
                      <Sparkles className="w-3.5 h-3.5" />
                      Hoàn tiền tự động thành công
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      Đã Hủy Vé #{ketQua?.bookingId}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                      {ketQua?.status === 'CANCELLED_REFUNDED' ? (
                        <>
                          Số tiền hoàn sẽ được chuyển trực tiếp vào tài khoản{' '}
                          <strong className="text-slate-900">Ví SportPay</strong> của quý khách ngay lập tức.
                        </>
                      ) : (
                        <>
                          Đơn đặt sân đã được hủy thành công. Hệ thống đang cập nhật trạng thái hoàn tiền cho tài khoản của quý khách.
                        </>
                      )}
                    </p>
                  </motion.div>

                  {/* Khoi so tien hoan noi bat voi hieu ung dem so */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/80 space-y-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Số tiền được hoàn ({ketQua?.tiLePhanTram}%)
                      </span>
                      <div className="text-3xl font-black text-emerald-600 tracking-tight mt-0.5 tabular-nums">
                        +<DemSoTien giaTri={ketQua?.soTienHoan || 0} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-emerald-200/70 space-y-1.5 text-xs text-left">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Tài khoản thụ hưởng:</span>
                        <span className="font-black text-slate-800 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-amber-500" />
                          Ví Điện Tử SportPay
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Thời gian xử lý:</span>
                        <span className="font-bold text-emerald-700">Tức thì (24/7)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Thời điểm xác nhận:</span>
                        <span className="font-semibold text-slate-700">{ketQua?.thoiDiemHuy}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    type="button"
                    onClick={onDong}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-black shadow-lg transition cursor-pointer"
                  >
                    Đã hiểu & Quay lại danh sách vé
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
