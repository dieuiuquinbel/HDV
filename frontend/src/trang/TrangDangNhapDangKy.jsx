/**
 * File: TrangDangNhapDangKy.jsx
 * Muc dich: Trang dang nhap va dang ky phong cach DieuBel/Airbnb voi card noi sang trong.
 * Chuc nang: Chuyen doi muot ma giua Dang nhap va Dang ky, nut an/hien mat khau, modal OTP xac minh tu dong va thanh 1-Click Demo Login.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  X,
  Clock,
  Mail
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import TAI_KHOAN_MAC_DINH from '../../../tai-khoan-mac-dinh.json';
import { hienToast } from '../tienich/thongBao';

export default function TrangDangNhapDangKy({ onDangNhapThanhCong }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const redirectTarget = searchParams.get('redirect');

  const dieuHuongSauDangNhap = (user) => {
    if (redirectTarget) {
      navigate(redirectTarget);
      return;
    }
    if (user?.role === 'STAFF') {
      navigate('/checkin');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/tim-san');
    }
  };
  
  // State form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State OTP Modal (6 o so, cooldown 10s, gioi han 3 lan xu ly tai backend)
  const RESEND_COOLDOWN_SECONDS = 10;
  const [hienModalOtp, setHienModalOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [demNguocGuiLai, setDemNguocGuiLai] = useState(0);
  const [dangGuiLaiOtp, setDangGuiLaiOtp] = useState(false);
  const [loiOtp, setLoiOtp] = useState('');
  const [thongBaoOtp, setThongBaoOtp] = useState('');
  const otpInputRefs = useRef([]);

  // Status & Errors
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState('');
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

  useEffect(() => {
    if (!hienModalOtp || demNguocGuiLai <= 0) return;
    const timer = setInterval(() => {
      setDemNguocGuiLai((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hienModalOtp, demNguocGuiLai]);

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'register') setMode('register');
    else if (m === 'login') setMode('login');
    setLoi('');
    setThongBaoThanhCong('');
  }, [searchParams]);

  const doiCheDo = (cheDoMoi) => {
    setMode(cheDoMoi);
    setSearchParams({ mode: cheDoMoi });
    setLoi('');
    setThongBaoThanhCong('');
  };

  // Xu ly Dang nhap
  const xuLyDangNhap = async (e) => {
    if (e) e.preventDefault();
    setLoi('');
    setDangXuLy(true);
    try {
      const res = await apiDichVu.dangNhap({ email, password });
      const user = res.data;
      try {
        localStorage.setItem('esportking_user', JSON.stringify(user));
      } catch {}
      if (onDangNhapThanhCong) onDangNhapThanhCong(user);
      dieuHuongSauDangNhap(user);
    } catch (err) {
      setLoi(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setDangXuLy(false);
    }
  };

  // Xu ly Dang ky
  const xuLyDangKy = async (e) => {
    if (e) e.preventDefault();
    setLoi('');
    if (password !== confirmPassword) {
      setLoi('Mật khẩu xác nhận không khớp!');
      return;
    }
    setDangXuLy(true);
    try {
      const res = await apiDichVu.dangKy({ email, password, fullName, phone });
      setEmailOtp(email);
      setOtpCode('');
      setLoiOtp('');
      setThongBaoOtp('');
      setDemNguocGuiLai(RESEND_COOLDOWN_SECONDS);
      if (res.data?.otpCode) {
        setDevOtpHint(res.data.otpCode);
        setOtpCode(res.data.otpCode); // Tu dong dien giup demo de dang
      } else {
        setDevOtpHint('');
      }
      setHienModalOtp(true);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 120);
    } catch (err) {
      if (!err.response) {
        setLoi('Không thể kết nối máy chủ Backend (cổng 8080). Vui lòng kiểm tra các service đã khởi động chưa.');
      } else {
        setLoi(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.');
      }
    } finally {
      setDangXuLy(false);
    }
  };

  // Xu ly nhap 6 o OTP rieng biet
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const digits = otpCode.padEnd(6, ' ').split('').slice(0, 6);
    digits[index] = digit || ' ';
    const nextCode = digits.join('').replace(/\s+$/, '');
    setOtpCode(nextCode.replace(/\s/g, ''));
    setLoiOtp('');
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    setOtpCode(pasted);
    setLoiOtp('');
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  // Xu ly gui lai ma OTP (cach nhau 10s, gioi han toi da 3 lan xu ly tai backend)
  const xuLyGuiLaiOtp = async () => {
    if (dangGuiLaiOtp || demNguocGuiLai > 0) return;
    setLoiOtp('');
    setThongBaoOtp('');
    setDangGuiLaiOtp(true);
    try {
      const res = await apiDichVu.guiLaiOtp(emailOtp);
      setDemNguocGuiLai(RESEND_COOLDOWN_SECONDS);
      setOtpCode('');
      if (res.data?.otpCode) {
        setDevOtpHint(res.data.otpCode);
        setOtpCode(res.data.otpCode);
      }
      setThongBaoOtp('Đã gửi lại mã OTP mới. Vui lòng kiểm tra hộp thư của bạn!');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setLoiOtp(err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setDangGuiLaiOtp(false);
    }
  };

  // Xu ly xac minh OTP
  const xuLyXacMinhOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setLoiOtp('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }
    setLoiOtp('');
    setThongBaoOtp('');
    setDangXuLy(true);
    try {
      await apiDichVu.xacMinhOtp({ email: emailOtp, otpCode: cleanOtp });
      setHienModalOtp(false);
      setThongBaoThanhCong('Xác minh tài khoản thành công! Bạn có thể đăng nhập ngay.');
      doiCheDo('login');
    } catch (err) {
      setLoiOtp(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setDangXuLy(false);
    }
  };

  // 1-Click Demo Login
  const demoDangNhapNhanh = (emailDemo, passDemo) => {
    setEmail(emailDemo);
    setPassword(passDemo);
    setLoi('');
    setDangXuLy(true);
    apiDichVu.dangNhap({ email: emailDemo, password: passDemo })
      .then(res => {
        try {
          localStorage.setItem('esportking_user', JSON.stringify(res.data));
        } catch {}
        if (onDangNhapThanhCong) onDangNhapThanhCong(res.data);
        dieuHuongSauDangNhap(res.data);
      })
      .catch(err => {
        setLoi(err.response?.data?.message || 'Đăng nhập demo thất bại.');
      })
      .finally(() => setDangXuLy(false));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#fffaf8] via-[#fbf7f5] to-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Chuẩn DieuBel */}
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-[26px] p-8 sm:p-10 shadow-2xl border border-slate-100 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-black text-slate-900 tracking-tight">ESport<span className="text-brand-600">King</span></span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {mode === 'login' ? 'Đăng nhập ESportKing' : 'Đăng ký tài khoản'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {mode === 'login' ? 'Hệ thống 3 cơ sở thể thao chuẩn thi đấu tại Hà Nội.' : 'Tạo tài khoản để đặt sân thể thao nhanh chóng.'}
          </p>
        </div>

        {/* Thong bao loi & thanh cong */}
        {loi && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{loi}</span>
          </div>
        )}

        {thongBaoThanhCong && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            <span>{thongBaoThanhCong}</span>
          </div>
        )}

        {/* FORM DANG NHAP */}
        {mode === 'login' ? (
          <form onSubmit={xuLyDangNhap} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email hoặc Tên đăng nhập</label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin, staff1 hoặc email@example.com"
                  required
                  className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => {
                    const ds = TAI_KHOAN_MAC_DINH.map((t) => `${t.email}/${t.password}`).join(' • ');
                    hienToast(`Tài khoản mặc định: ${ds}`, 'info', 6000);
                  }}
                  className="text-xs text-brand-600 hover:underline font-semibold"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black text-sm shadow-lg shadow-brand-500/25 transition-all transform active:scale-98 disabled:opacity-50 mt-2"
            >
              {dangXuLy ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>

            <div className="text-center pt-3 text-xs text-slate-500 font-semibold">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => doiCheDo('register')}
                className="text-brand-600 font-bold hover:underline"
              >
                Đăng ký
              </button>
            </div>
          </form>
        ) : (
          /* FORM DANG KY */
          <form onSubmit={xuLyDangKy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  className="w-full px-4 py-3 pr-11 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="w-full px-4 py-3 pr-11 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black text-sm shadow-lg shadow-brand-500/25 transition-all transform active:scale-98 disabled:opacity-50 mt-2"
            >
              {dangXuLy ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-tight">
              Chúng tôi sẽ gửi mã xác thực đến email của bạn.
            </p>

            <div className="text-center pt-2 text-xs text-slate-500 font-semibold">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => doiCheDo('login')}
                className="text-brand-600 font-bold hover:underline"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        )}

        {/* 1-CLICK DEMO LOGIN SELECTOR DANG BAR (Doc dong tu tai-khoan-mac-dinh.json) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">
            ⚡ 1-Click Đăng Nhập Nhanh (Demo ESportKing Hà Nội)
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {TAI_KHOAN_MAC_DINH.filter((t) => t.role !== 'STAFF').map((tk) => (
              <button
                key={tk.key || tk.email}
                onClick={() => demoDangNhapNhanh(tk.email, tk.password)}
                className={`px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center transition group cursor-pointer ${
                  tk.role === 'ADMIN'
                    ? 'hover:bg-rose-50 hover:border-rose-300'
                    : 'hover:bg-brand-50 hover:border-brand-300'
                }`}
              >
                <span className={`block text-xs font-bold text-slate-800 ${
                  tk.role === 'ADMIN' ? 'group-hover:text-rose-600' : 'group-hover:text-brand-600'
                }`}>
                  {tk.label}
                </span>
                <span className="text-[10px] text-slate-400">{tk.email} / {tk.password}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {TAI_KHOAN_MAC_DINH.filter((t) => t.role === 'STAFF').map((tk) => (
              <button
                key={tk.key || tk.email}
                onClick={() => demoDangNhapNhanh(tk.email, tk.password)}
                className="px-1.5 py-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-center transition group cursor-pointer"
              >
                <span className="block text-[11px] font-bold text-slate-800 group-hover:text-amber-600">
                  {tk.label}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {tk.subLabel || tk.email}
                </span>
              </button>
            ))}
          </div>
        </div>

      </Motion.div>

      {/* MODAL XAC MINH OTP CHUYEN NGHIEP */}
      {hienModalOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Header Gradient */}
            <div className="relative bg-gradient-to-br from-brand-600 via-rose-500 to-pink-600 px-6 pt-7 pb-6 text-center text-white">
              <button
                type="button"
                onClick={() => setHienModalOtp(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-black tracking-tight">Xác Minh Tài Khoản</h3>
              <p className="text-xs text-rose-100 mt-1 font-medium">
                Nhập mã bảo mật 6 chữ số vừa gửi đến hộp thư của bạn
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-bold text-white max-w-full">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{emailOtp}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-7">
              {devOtpHint && (
                <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-700 font-bold text-center">
                  Mã OTP chế độ test: <span className="text-base tracking-widest text-brand-600">{devOtpHint}</span>
                </div>
              )}

              {loiOtp && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loiOtp}</span>
                </div>
              )}

              {thongBaoOtp && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{thongBaoOtp}</span>
                </div>
              )}

              <form onSubmit={xuLyXacMinhOtp} className="space-y-5">
                {/* 6 o nhap OTP tach biet */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                    Mã xác thực 6 chữ số (hiệu lực 5 phút)
                  </label>
                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const val = otpCode[idx] || '';
                      return (
                        <input
                          key={idx}
                          ref={(el) => { otpInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={val}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`h-12 sm:h-14 w-full text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all ${
                            val
                              ? 'border-brand-500 bg-brand-50/40 text-slate-900 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Khu vuc Gui lai ma OTP (10s cooldown, gioi han 3 lan xu ly ngam o backend) */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chưa nhận được mã?</span>
                  </div>

                  <button
                    type="button"
                    onClick={xuLyGuiLaiOtp}
                    disabled={dangGuiLaiOtp || demNguocGuiLai > 0}
                    className={`inline-flex items-center gap-1.5 font-extrabold transition ${
                      dangGuiLaiOtp || demNguocGuiLai > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-brand-600 hover:text-brand-700 cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dangGuiLaiOtp ? 'animate-spin' : ''}`} />
                    {dangGuiLaiOtp
                      ? 'Đang gửi...'
                      : demNguocGuiLai > 0
                        ? `Gửi lại (${demNguocGuiLai}s)`
                        : 'Gửi lại mã'}
                  </button>
                </div>

                {/* Nut Xac nhan & Huy */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setHienModalOtp(false)}
                    className="sm:col-span-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={dangXuLy || otpCode.length < 6}
                    className="sm:col-span-2 py-3.5 px-5 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-600/25 transition cursor-pointer"
                  >
                    {dangXuLy ? 'Đang xác minh...' : 'Kích hoạt tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
