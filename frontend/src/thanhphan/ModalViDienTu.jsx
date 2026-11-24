/**
 * File: ModalViDienTu.jsx
 * Muc dich: Modal quan ly Vi dien tu SportPay ESportKing: Nap tien tu Ngan hang (VietQR), Rut tien ve Ngan hang & Lich su bien dong.
 * Chuc nang: Render bang React Portal ra document.body de luon can giua man hinh (tranh bi kep boi backdrop-filter cua header), ho tro dong bang nut X / ESC / click nen toi.
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

const DANH_SACH_NGAN_HANG = [
  { code: 'MB', name: 'MB Bank (Quân Đội)', bin: '970422' },
  { code: 'TCB', name: 'Techcombank', bin: '970407' },
  { code: 'VCB', name: 'Vietcombank', bin: '970436' },
  { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
  { code: 'VPB', name: 'VPBank', bin: '970432' },
  { code: 'TPB', name: 'TPBank', bin: '970458' },
  { code: 'BIDV', name: 'BIDV', bin: '970418' },
  { code: 'CTG', name: 'VietinBank', bin: '970415' }
];

const TAI_KHOAN_NHAN_HE_THONG = {
  bankCode: 'TCB',
  bankName: 'Techcombank',
  accountNumber: '72271020058888',
  accountName: 'NGUYEN XUAN DIEU'
};

export default function ModalViDienTu({ hienThi, onDong, user, onSoDuThayDoi }) {
  const [tab, setTab] = useState('NAP_TIEN'); // NAP_TIEN, RUT_TIEN, LICH_SU
  const [viData, setViData] = useState(null);
  const [dangTai, setDangTai] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');
  const [daSaoChep, setDaSaoChep] = useState('');

  // Form nap tien tu Ngan hang -> Vi
  const [nganHangNap, setNganHangNap] = useState(DANH_SACH_NGAN_HANG[1]); // Techcombank mac dinh
  const [soTienNap, setSoTienNap] = useState('200000');
  const [ketQuaNap, setKetQuaNap] = useState(null);

  // Form rut tien tu Vi -> Ngan hang
  const [nganHangRut, setNganHangRut] = useState(DANH_SACH_NGAN_HANG[0]); // MB Bank mac dinh
  const [soTaiKhoan, setSoTaiKhoan] = useState('');
  const [tenChuTk, setTenChuTk] = useState((user?.fullName || 'NGUYEN VAN A').toUpperCase());
  const [soTienRut, setSoTienRut] = useState('');
  const [xacNhanTk, setXacNhanTk] = useState(false);
  const [ketQuaRut, setKetQuaRut] = useState(null);

  const taiThongTinVi = async () => {
    if (!user) return;
    setDangTai(true);
    setThongBaoLoi('');
    try {
      const res = await apiDichVu.layThongTinVi();
      if (res.data) {
        setViData(res.data);
        if (onSoDuThayDoi) {
          onSoDuThayDoi(Number(res.data.balance || 0));
        }
      }
    } catch (err) {
      console.warn('Loi khi tai thong tin vi:', err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    if (user?.fullName) {
      setTenChuTk(user.fullName.toUpperCase());
    }
  }, [user?.fullName]);

  useEffect(() => {
    if (hienThi && user) {
      taiThongTinVi();
      setKetQuaRut(null);
      setKetQuaNap(null);
      setThongBaoLoi('');
    }
  }, [hienThi, user]);

  // Khoa cuon nen & ho tro phim ESC de dong modal
  useEffect(() => {
    if (!hienThi) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onDong();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hienThi, onDong]);

  if (!hienThi) return null;

  const soDuHienTai = Number(viData?.balance || 0);
  const soTienNapNum = Number(soTienNap) || 0;
  const soTienQr = soTienNapNum >= 10000 ? soTienNapNum : 200000;
  const noiDungChuyenKhoan = `NAPVI_${user?.id || 'USER'}`;
  const vietQrNapUrl = `https://img.vietqr.io/image/${TAI_KHOAN_NHAN_HE_THONG.bankCode}-${TAI_KHOAN_NHAN_HE_THONG.accountNumber}-compact2.png?amount=${soTienQr}&addInfo=${encodeURIComponent(noiDungChuyenKhoan)}&accountName=${encodeURIComponent(TAI_KHOAN_NHAN_HE_THONG.accountName)}`;

  const saoChepText = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setDaSaoChep(key);
      setTimeout(() => setDaSaoChep(''), 1800);
    } catch {
      // Bo qua neu trinh duyet chan clipboard
    }
  };

  // Xu ly nap tien tu Ngan hang vao Vi
  const handleNapTien = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');
    const amount = Number(soTienNap);
    if (isNaN(amount) || amount < 10000) {
      setThongBaoLoi('Số tiền nạp tối thiểu là 10.000 VNĐ.');
      return;
    }

    setDangXuLy(true);
    try {
      const phuongThuc = `VietQR - ${nganHangNap.name}`;
      const res = await apiDichVu.napTienVi({ amount, method: phuongThuc });
      if (res.data) {
        setKetQuaNap({
          amount,
          method: phuongThuc,
          transferContent: noiDungChuyenKhoan,
          balanceAfter: res.data.balanceAfter
        });
        taiThongTinVi();
        window.dispatchEvent(new CustomEvent('cap_nhat_so_du_vi'));
        window.dispatchEvent(new CustomEvent('cap_nhat_thong_bao'));
      }
    } catch (err) {
      setThongBaoLoi(err.response?.data?.message || 'Nạp tiền thất bại. Vui lòng thử lại.');
    } finally {
      setDangXuLy(false);
    }
  };

  // Xu ly rut tien tu Vi ve Ngan hang
  const handleRutTien = async (e) => {
    e.preventDefault();
    setThongBaoLoi('');
    const amount = Number(soTienRut);

    if (isNaN(amount) || amount <= 2000) {
      setThongBaoLoi('Số tiền rút phải lớn hơn 2.000 VNĐ.');
      return;
    }

    if (amount > soDuHienTai) {
      setThongBaoLoi(`Số dư ví không đủ. Hiện bạn chỉ có ${soDuHienTai.toLocaleString('vi-VN')} đ.`);
      return;
    }

    if (!soTaiKhoan.trim()) {
      setThongBaoLoi('Vui lòng nhập số tài khoản thụ hưởng.');
      return;
    }

    if (!tenChuTk.trim()) {
      setThongBaoLoi('Vui lòng nhập tên chủ tài khoản.');
      return;
    }

    if (!xacNhanTk) {
      setThongBaoLoi('Vui lòng tích chọn xác nhận thông tin tài khoản chính xác.');
      return;
    }

    setDangXuLy(true);
    try {
      const payload = {
        bankCode: nganHangRut.code,
        bankName: nganHangRut.name,
        accountNumber: soTaiKhoan.trim(),
        accountName: tenChuTk.trim().toUpperCase(),
        amount,
        confirm: true
      };

      const res = await apiDichVu.rutTienVi(payload);
      if (res.data) {
        setKetQuaRut({
          amount,
          bankName: nganHangRut.name,
          accountNumber: soTaiKhoan.trim(),
          accountName: tenChuTk.trim().toUpperCase(),
          balanceAfter: res.data.balanceAfter
        });
        taiThongTinVi();
        window.dispatchEvent(new CustomEvent('cap_nhat_so_du_vi'));
        window.dispatchEvent(new CustomEvent('cap_nhat_thong_bao'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện rút tiền.';
      setThongBaoLoi(msg);
    } finally {
      setDangXuLy(false);
    }
  };

  // Mo phong nhan dien QR Ngan hang khi rut tien
  const moPhongQuetQr = () => {
    setNganHangRut(DANH_SACH_NGAN_HANG[0]); // MB Bank
    setSoTaiKhoan('0988776655');
    setTenChuTk(user?.fullName ? user.fullName.toUpperCase() : 'NGUYEN HOANG NAM');
    setXacNhanTk(true);
    setThongBaoLoi('');
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDong();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Ví Điện Tử SportPay"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white shrink-0 relative">
          <button
            type="button"
            onClick={onDong}
            aria-label="Đóng ví điện tử"
            title="Đóng (ESC)"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-rose-500 text-white flex items-center justify-center transition cursor-pointer shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pr-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black">Ví Điện Tử SportPay</h3>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    KHẢ DỤNG
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Nạp / Rút ngân hàng 24/7 & thanh toán đặt sân tức thì
                </p>
              </div>
            </div>

            {/* So du hien tai */}
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3 self-start sm:self-auto">
              <div>
                <span className="block text-[11px] text-slate-300 font-medium">Số dư khả dụng</span>
                <div className="text-xl sm:text-2xl font-black text-amber-300 leading-tight">
                  {dangTai ? (
                    <span className="text-sm text-slate-300 font-normal">Đang tải...</span>
                  ) : (
                    `${soDuHienTai.toLocaleString('vi-VN')} đ`
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={taiThongTinVi}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-slate-200 hover:text-white"
                title="Làm mới số dư"
              >
                <RefreshCw className={`w-4 h-4 ${dangTai ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3 Tabs chinh */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setTab('NAP_TIEN');
                setKetQuaNap(null);
                setThongBaoLoi('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'NAP_TIEN'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/85 hover:bg-white/20'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Nạp từ Ngân hàng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('RUT_TIEN');
                setKetQuaRut(null);
                setThongBaoLoi('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'RUT_TIEN'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/85 hover:bg-white/20'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Rút về Ngân hàng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('LICH_SU');
                setThongBaoLoi('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'LICH_SU'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/85 hover:bg-white/20'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Lịch sử ví</span>
            </button>
          </div>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto flex-1">
          {thongBaoLoi && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{thongBaoLoi}</span>
            </div>
          )}

          {/* TAB 1: NAP TIEN TU NGAN HANG -> VI */}
          {tab === 'NAP_TIEN' && (
            <div>
              {ketQuaNap ? (
                <div className="py-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Nạp Tiền Vào Ví Thành Công!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Hệ thống đã ghi nhận giao dịch chuyển khoản và cộng trực tiếp số dư vào Ví SportPay của bạn.
                  </p>

                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left max-w-md mx-auto space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Số tiền nạp:</span>
                      <span className="font-black text-emerald-600 text-sm">
                        +{ketQuaNap.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Nguồn ngân hàng:</span>
                      <span className="font-bold text-slate-800">{ketQuaNap.method}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Nội dung CK:</span>
                      <span className="font-mono font-bold text-slate-800">{ketQuaNap.transferContent}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500 font-medium">Số dư ví hiện tại:</span>
                      <span className="font-black text-amber-600 text-sm">
                        {Number(ketQuaNap.balanceAfter).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setKetQuaNap(null)}
                      className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-md"
                    >
                      Nạp thêm giao dịch khác
                    </button>
                    <button
                      type="button"
                      onClick={onDong}
                      className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Đóng ví
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNapTien} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Cot trai: Chon ngan hang nguon & nhap so tien */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        1. Chọn ngân hàng chuyển khoản của bạn
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {DANH_SACH_NGAN_HANG.map((nh) => (
                          <button
                            key={nh.code}
                            type="button"
                            onClick={() => setNganHangNap(nh)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              nganHangNap.code === nh.code
                                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <span className="text-xs font-black text-slate-800">{nh.code}</span>
                            <span className="text-[10px] text-slate-500 truncate">{nh.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-700">2. Nhập số tiền muốn nạp (VNĐ)</label>
                        <span className="text-[11px] text-slate-400">Tối thiểu: 10.000 đ</span>
                      </div>
                      <input
                        type="number"
                        min="10000"
                        step="1000"
                        value={soTienNap}
                        onChange={(e) => setSoTienNap(e.target.value)}
                        placeholder="Nhập số tiền cần nạp..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-black text-slate-900 focus:border-emerald-600 focus:outline-none"
                        required
                      />

                      <div className="grid grid-cols-3 gap-2 mt-2.5">
                        {['50000', '100000', '200000', '500000', '1000000', '2000000'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSoTienNap(val)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                              soTienNap === val
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {Number(val).toLocaleString('vi-VN')} đ
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={dangXuLy}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm transition cursor-pointer shadow-lg shadow-emerald-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {dangXuLy ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang xác nhận nạp tiền...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Xác nhận đã chuyển khoản & Nạp vào Ví</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cot phai: Ma VietQR dong + Thong tin tai khoan nhan */}
                  <div className="md:col-span-5 p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        Quét mã VietQR 24/7
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Tự động điền tiền
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-center">
                      <img
                        src={vietQrNapUrl}
                        alt="Mã VietQR nạp tiền Ví SportPay"
                        className="w-48 h-auto rounded-xl object-contain"
                      />
                    </div>

                    <div className="space-y-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200/70">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Ngân hàng:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          {TAI_KHOAN_NHAN_HE_THONG.bankName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Số tài khoản:</span>
                        <button
                          type="button"
                          onClick={() => saoChepText('stk', TAI_KHOAN_NHAN_HE_THONG.accountNumber)}
                          className="font-mono font-black text-slate-900 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          title="Sao chép số tài khoản"
                        >
                          <span>{TAI_KHOAN_NHAN_HE_THONG.accountNumber}</span>
                          {daSaoChep === 'stk' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Chủ tài khoản:</span>
                        <span className="font-bold text-slate-800">{TAI_KHOAN_NHAN_HE_THONG.accountName}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Nội dung CK:</span>
                        <button
                          type="button"
                          onClick={() => saoChepText('memo', noiDungChuyenKhoan)}
                          className="font-mono font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          <span>{noiDungChuyenKhoan}</span>
                          {daSaoChep === 'memo' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: RUT TIEN TU VI -> NGAN HANG */}
          {tab === 'RUT_TIEN' && (
            <div>
              {ketQuaRut ? (
                <div className="py-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Rút Tiền Thành Công!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Hệ thống đã giải ngân thành công số tiền về tài khoản ngân hàng của bạn.
                  </p>

                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left max-w-md mx-auto space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Số tiền rút:</span>
                      <span className="font-black text-rose-600 text-sm">
                        -{ketQuaRut.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Ngân hàng nhận:</span>
                      <span className="font-bold text-slate-800">{ketQuaRut.bankName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Số tài khoản:</span>
                      <span className="font-mono font-bold text-slate-800">{ketQuaRut.accountNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-800">{ketQuaRut.accountName}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500 font-medium">Số dư ví còn lại:</span>
                      <span className="font-black text-amber-600 text-sm">
                        {Number(ketQuaRut.balanceAfter).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setKetQuaRut(null);
                        setSoTienRut('');
                      }}
                      className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-md"
                    >
                      Thực hiện giao dịch khác
                    </button>
                    <button
                      type="button"
                      onClick={onDong}
                      className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Đóng ví
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRutTien} className="space-y-4">
                  {/* Nut Quet QR Demo */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-950">Điền nhanh từ mã QR Ngân Hàng</p>
                        <p className="text-[11px] text-blue-700">Tự động nhận diện STK & Ngân hàng thụ hưởng</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={moPhongQuetQr}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm shrink-0"
                    >
                      Điền Demo
                    </button>
                  </div>

                  {/* Chon Ngan hang */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      1. Chọn Ngân hàng nhận tiền
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DANH_SACH_NGAN_HANG.map((nh) => (
                        <button
                          key={nh.code}
                          type="button"
                          onClick={() => setNganHangRut(nh)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            nganHangRut.code === nh.code
                              ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span className="text-xs font-black text-slate-800">{nh.code}</span>
                          <span className="text-[10px] text-slate-500 truncate">{nh.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* So tai khoan & Ten chu tai khoan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        2. Số tài khoản thụ hưởng
                      </label>
                      <input
                        type="text"
                        value={soTaiKhoan}
                        onChange={(e) => setSoTaiKhoan(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="VD: 0988776655"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:border-brand-600 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        3. Tên chủ tài khoản
                      </label>
                      <input
                        type="text"
                        value={tenChuTk}
                        onChange={(e) => setTenChuTk(e.target.value.toUpperCase())}
                        placeholder="VD: NGUYEN VAN A"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold uppercase focus:border-brand-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* So tien rut */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">4. Số tiền muốn rút (VNĐ)</label>
                      <span className="text-[11px] text-slate-400">
                        Tối thiểu: &gt; 2.000 đ • Tối đa: {soDuHienTai.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="2001"
                        max={soDuHienTai}
                        value={soTienRut}
                        onChange={(e) => setSoTienRut(e.target.value)}
                        placeholder="Nhập số tiền..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-black text-slate-900 focus:border-brand-600 focus:outline-none pr-24"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSoTienRut(String(soDuHienTai))}
                        className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black transition cursor-pointer"
                      >
                        Rút hết
                      </button>
                    </div>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[50000, 100000, 200000, 500000, 1000000].map((tien) => (
                        <button
                          key={tien}
                          type="button"
                          onClick={() => setSoTienRut(String(Math.min(tien, soDuHienTai)))}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          {tien.toLocaleString('vi-VN')} đ
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkbox xac nhan */}
                  <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={xacNhanTk}
                      onChange={(e) => setXacNhanTk(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Tôi xác nhận thông tin số tài khoản và ngân hàng nhận tiền là chính xác. Hệ thống sẽ giải ngân trực tiếp vào số tài khoản này.
                    </span>
                  </label>

                  {/* Nut Submit */}
                  <button
                    type="submit"
                    disabled={dangXuLy || soDuHienTai <= 2000}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-sm transition cursor-pointer shadow-lg shadow-rose-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {dangXuLy ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý rút tiền...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Xác nhận Rút tiền về Ngân hàng</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: LICH SU VI */}
          {tab === 'LICH_SU' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Biến động số dư gần nhất
                </h4>
                <button
                  type="button"
                  onClick={taiThongTinVi}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dangTai ? 'animate-spin' : ''}`} />
                  Cập nhật
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {!viData?.recentTransactions || viData.recentTransactions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Chưa có giao dịch nào được ghi nhận.
                  </div>
                ) : (
                  viData.recentTransactions.map((tx) => {
                    const isCong = tx.type === 'TOP_UP' || tx.type === 'REFUND';
                    return (
                      <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCong ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                            }`}
                          >
                            {isCong ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{tx.description}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {new Date(tx.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-black text-sm ${isCong ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCong ? '+' : '-'}{Number(tx.amount).toLocaleString('vi-VN')} đ
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Dư: {Number(tx.balanceAfter).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
