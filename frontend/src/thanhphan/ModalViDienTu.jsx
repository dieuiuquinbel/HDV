/**
 * File: ModalViDienTu.jsx
 * Muc dich: Modal quan ly Vi dien tu SportPay ESportKing & Rut tien Demo ve Ngan hang.
 * Chuc nang: Xem so du, lich su bien dong, nap tien va rut tien demo ve tai khoan ngan hang voi day du validation.
 */
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  RefreshCw, 
  ShieldCheck,
  CreditCard,
  Sparkles,
  ChevronRight,
  Upload
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

const DANH_SACH_NGAN_HANG = [
  { code: 'MB', name: 'MB Bank (Quân Đội)', bin: '970422', color: 'from-blue-600 to-indigo-700' },
  { code: 'TCB', name: 'Techcombank', bin: '970407', color: 'from-red-600 to-rose-700' },
  { code: 'VCB', name: 'Vietcombank', bin: '970436', color: 'from-emerald-600 to-teal-700' },
  { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416', color: 'from-sky-500 to-blue-600' },
  { code: 'VPB', name: 'VPBank', bin: '970432', color: 'from-emerald-500 to-green-600' },
  { code: 'TPB', name: 'TPBank', bin: '970458', color: 'from-purple-600 to-pink-600' },
  { code: 'BIDV', name: 'BIDV', bin: '970418', color: 'from-teal-600 to-cyan-700' },
  { code: 'CTG', name: 'VietinBank', bin: '970415', color: 'from-blue-700 to-blue-900' }
];

export default function ModalViDienTu({ hienThi, onDong, user, onSoDuThayDoi }) {
  const [tab, setTab] = useState('RUT_TIEN'); // RUT_TIEN, NAP_TIEN, LICH_SU
  const [viData, setViData] = useState(null);
  const [dangTai, setDangTai] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  // Form rut tien
  const [nganHangChon, setNganHangChon] = useState(DANH_SACH_NGAN_HANG[0]);
  const [soTaiKhoan, setSoTaiKhoan] = useState('');
  const [tenChuTk, setTenChuTk] = useState(user?.fullName || 'NGUYEN VAN A');
  const [soTienRut, setSoTienRut] = useState('');
  const [xacNhanTk, setXacNhanTk] = useState(false);

  // Popup thanh cong
  const [ketQuaRut, setKetQuaRut] = useState(null);

  // Form nap tien
  const [soTienNap, setSoTienNap] = useState('200000');
  const [napThanhCong, setNapThanhCong] = useState(false);

  const taiThongTinVi = async () => {
    if (!user) return;
    setDangTai(true);
    setThongBaoLoi('');
    try {
      const res = await apiDichVu.layThongTinVi();
      if (res.data) {
        setViData(res.data);
        if (onSoDuThayDoi) {
          onSoDuThayDoi(res.data.balance);
        }
      }
    } catch (err) {
      console.warn('Loi khi tai thong tin vi:', err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    if (hienThi && user) {
      taiThongTinVi();
      setKetQuaRut(null);
      setNapThanhCong(false);
      setThongBaoLoi('');
    }
  }, [hienThi, user]);

  if (!hienThi) return null;

  const soDuHienTai = Number(viData?.balance || 0);

  // Xu ly rut tien
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

    if (!xacNhanTk) {
      setThongBaoLoi('Vui lòng tích chọn xác nhận thông tin tài khoản chính xác.');
      return;
    }

    setDangXuLy(true);
    try {
      const payload = {
        bankCode: nganHangChon.code,
        bankName: nganHangChon.name,
        accountNumber: soTaiKhoan.trim(),
        accountName: tenChuTk.trim().toUpperCase(),
        amount: amount,
        confirm: true
      };

      const res = await apiDichVu.rutTienVi(payload);
      if (res.data) {
        setKetQuaRut({
          amount: amount,
          bankName: nganHangChon.name,
          accountNumber: soTaiKhoan,
          accountName: tenChuTk.trim().toUpperCase(),
          balanceAfter: res.data.balanceAfter
        });
        taiThongTinVi();
        window.dispatchEvent(new CustomEvent('cap_nhat_thong_bao'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện rút tiền.';
      setThongBaoLoi(msg);
    } finally {
      setDangXuLy(false);
    }
  };

  // Xu ly nap tien demo
  const handleNapTien = async (e) => {
    e.preventDefault();
    const amount = Number(soTienNap);
    if (isNaN(amount) || amount < 10000) {
      setThongBaoLoi('Số tiền nạp tối thiểu là 10.000 VNĐ.');
      return;
    }

    setDangXuLy(true);
    try {
      await apiDichVu.napTienVi({ amount, method: 'DEMO_TOPUP' });
      setNapThanhCong(true);
      taiThongTinVi();
      window.dispatchEvent(new CustomEvent('cap_nhat_thong_bao'));
    } catch (err) {
      setThongBaoLoi(err.response?.data?.message || 'Nạp tiền thất bại.');
    } finally {
      setDangXuLy(false);
    }
  };

  // Mo phong nhan dien QR Ngan hang
  const moPhongQuetQr = () => {
    setNganHangChon(DANH_SACH_NGAN_HANG[0]); // MB Bank
    setSoTaiKhoan('0988776655');
    setTenChuTk(user?.fullName ? user.fullName.toUpperCase() : 'NGUYEN HOANG NAM');
    setXacNhanTk(true);
    alert('Đã nhận diện thành công mã QR ngân hàng: MB Bank - STK: 0988776655');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white relative">
          <button 
            onClick={onDong}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">Ví Điện Tử SportPay</h3>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  KHẢ DỤNG
                </span>
              </div>
              <p className="text-xs text-slate-300">Tài khoản thanh toán & hoàn tiền tức thì ESportKing</p>
            </div>
          </div>

          {/* Card so du */}
          <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 font-medium">Số dư khả dụng</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
                {dangTai ? (
                  <span className="text-base text-slate-400 font-normal">Đang tải...</span>
                ) : (
                  `${soDuHienTai.toLocaleString('vi-VN')} đ`
                )}
              </div>
            </div>
            <button
              onClick={taiThongTinVi}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-slate-300 hover:text-white"
              title="Làm mới số dư"
            >
              <RefreshCw className={`w-4 h-4 ${dangTai ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setTab('RUT_TIEN'); setKetQuaRut(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'RUT_TIEN' 
                  ? 'bg-white text-slate-900 shadow-md font-bold' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>Rút tiền về NH</span>
            </button>
            <button
              onClick={() => { setTab('NAP_TIEN'); setNapThanhCong(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'NAP_TIEN' 
                  ? 'bg-white text-slate-900 shadow-md font-bold' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              <span>Nạp thêm tiền</span>
            </button>
            <button
              onClick={() => setTab('LICH_SU')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'LICH_SU' 
                  ? 'bg-white text-slate-900 shadow-md font-bold' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Lịch sử ví</span>
            </button>
          </div>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto flex-1">
          {thongBaoLoi && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{thongBaoLoi}</span>
            </div>
          )}

          {/* TAB 1: RUT TIEN VE NGAN HANG */}
          {tab === 'RUT_TIEN' && (
            <div>
              {ketQuaRut ? (
                /* POPUP THANH CONG SIÊU CHÂN THỰC */
                <div className="py-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Rút Tiền Thành Công!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Hệ thống đã giải ngân thành công số tiền về tài khoản ngân hàng của bạn.
                  </p>

                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left max-w-sm mx-auto space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Số tiền rút:</span>
                      <span className="font-black text-emerald-600 text-sm">{ketQuaRut.amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Ngân hàng:</span>
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
                      <span className="font-black text-amber-600">{Number(ketQuaRut.balanceAfter).toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setKetQuaRut(null);
                      setSoTienRut('');
                    }}
                    className="mt-6 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-md"
                  >
                    Thực hiện giao dịch khác
                  </button>
                </div>
              ) : (
                /* FORM NHAP RUT TIEN */
                <form onSubmit={handleRutTien} className="space-y-4">
                  
                  {/* Nut Quet QR Demo */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-600 text-white">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-900">Quét mã QR Ngân Hàng</p>
                        <p className="text-[11px] text-blue-600">Tự động nhận diện STK & Tên ngân hàng</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={moPhongQuetQr}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      Quét Demo
                    </button>
                  </div>

                  {/* Chon Ngan hang */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Ngân hàng nhận tiền</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DANH_SACH_NGAN_HANG.map((nh) => (
                        <button
                          key={nh.code}
                          type="button"
                          onClick={() => setNganHangChon(nh)}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            nganHangChon.code === nh.code 
                              ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span className="text-[11px] font-black text-slate-800">{nh.code}</span>
                          <span className="text-[10px] text-slate-500 truncate">{nh.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* So tai khoan & Ten chu tai khoan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số tài khoản thụ hưởng</label>
                      <input
                        type="text"
                        value={soTaiKhoan}
                        onChange={(e) => setSoTaiKhoan(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="VD: 0988776655"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-brand-600 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={tenChuTk}
                        onChange={(e) => setTenChuTk(e.target.value.toUpperCase())}
                        placeholder="VD: NGUYEN VAN A"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:border-brand-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* So tien rut */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700">Số tiền muốn rút (VNĐ)</label>
                      <span className="text-[11px] text-slate-400">Tối thiểu: &gt; 2.000 đ</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="2001"
                        max={soDuHienTai}
                        value={soTienRut}
                        onChange={(e) => setSoTienRut(e.target.value)}
                        placeholder="Nhập số tiền..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 focus:border-brand-600 focus:outline-none pr-16"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSoTienRut(String(soDuHienTai))}
                        className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-black transition cursor-pointer"
                      >
                        Rút hết
                      </button>
                    </div>

                    {/* Cac muc chon nhanh */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                      {[50000, 100000, 200000, 500000].map((tien) => (
                        <button
                          key={tien}
                          type="button"
                          onClick={() => setSoTienRut(String(tien))}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition shrink-0 cursor-pointer"
                        >
                          {tien.toLocaleString('vi-VN')} đ
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkbox xac nhan V */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={xacNhanTk}
                      onChange={(e) => setXacNhanTk(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-tight">
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

          {/* TAB 2: NAP TIEN */}
          {tab === 'NAP_TIEN' && (
            <div className="space-y-4">
              {napThanhCong ? (
                <div className="py-6 text-center animate-in zoom-in-95 duration-150">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Nạp Tiền Thành Công!</h4>
                  <p className="text-xs text-slate-500 mt-1">Số dư ví của bạn đã được cập nhật thành công.</p>
                  <button
                    onClick={() => { setNapThanhCong(false); setTab('RUT_TIEN'); }}
                    className="mt-4 px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer"
                  >
                    Đến màn Rút tiền
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNapTien} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Chọn nhanh số tiền nạp để bổ sung số dư vào Ví ESportKing:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['50000', '100000', '200000', '500000', '1000000', '2000000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSoTienNap(val)}
                        className={`p-3 rounded-2xl border text-xs font-black transition cursor-pointer ${
                          soTienNap === val 
                            ? 'border-brand-600 bg-brand-50 text-brand-600 ring-2 ring-brand-500/20' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {Number(val).toLocaleString('vi-VN')} đ
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={dangXuLy}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm transition cursor-pointer shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    {dangXuLy ? 'Đang nạp...' : 'Xác nhận Nạp Tiền'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: LICH SU */}
          {tab === 'LICH_SU' && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Biến động số dư gần nhất
              </h4>
              <div className="divide-y divide-slate-100">
                {(!viData?.recentTransactions || viData.recentTransactions.length === 0) ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Chưa có giao dịch nào được ghi nhận.
                  </div>
                ) : (
                  viData.recentTransactions.map((tx) => {
                    const isCong = tx.type === 'TOP_UP' || tx.type === 'REFUND';
                    return (
                      <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isCong ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {isCong ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(tx.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-black ${isCong ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isCong ? '+' : '-'}{Number(tx.amount).toLocaleString('vi-VN')} đ
                          </span>
                          <p className="text-[10px] text-slate-400">
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
}
