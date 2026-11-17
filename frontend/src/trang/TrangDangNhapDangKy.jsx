/**
 * File: TrangDangNhapDangKy.jsx
 * Muc dich: Trang dang nhap va dang ky phong cach DieuBel/Airbnb voi card noi sang trong.
 * Chuc nang: Chuyen doi muot ma giua Dang nhap va Dang ky, nut an/hien mat khau, modal OTP xac minh tu dong va thanh 1-Click Demo Login.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

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

  // State OTP Modal
  const [hienModalOtp, setHienModalOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Status & Errors
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState('');
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

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
      if (res.data?.otpCode) {
        setDevOtpHint(res.data.otpCode);
        setOtpCode(res.data.otpCode); // Tu dong dien giup demo de dang
      }
      setHienModalOtp(true);
    } catch (err) {
      setLoi(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.');
    } finally {
      setDangXuLy(false);
    }
  };

  // Xu ly xac minh OTP
  const xuLyXacMinhOtp = async (e) => {
    if (e) e.preventDefault();
    setLoi('');
    setDangXuLy(true);
    try {
      await apiDichVu.xacMinhOtp({ email: emailOtp, otpCode });
      setHienModalOtp(false);
      setThongBaoThanhCong('Xác minh tài khoản thành công! Bạn có thể đăng nhập ngay.');
      doiCheDo('login');
    } catch (err) {
      setLoi(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                <button type="button" onClick={() => alert('Mật khẩu demo mặc định là: Customer@123 hoặc Admin@123')} className="text-xs text-brand-600 hover:underline font-semibold">
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

        {/* 1-CLICK DEMO LOGIN SELECTOR DANG BAR */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">
            ⚡ 1-Click Đăng Nhập Nhanh (Demo ESportKing Hà Nội)
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => demoDangNhapNhanh('customer@esportking.vn', 'Customer@123')}
              className="px-2 py-2.5 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl text-center transition group cursor-pointer"
            >
              <span className="block text-xs font-bold text-slate-800 group-hover:text-brand-600">🏃 Khách Hàng</span>
              <span className="text-[10px] text-slate-400">customer@esportking.vn</span>
            </button>

            <button
              onClick={() => demoDangNhapNhanh('admin@esportking.vn', 'Admin@123')}
              className="px-2 py-2.5 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-xl text-center transition group cursor-pointer"
            >
              <span className="block text-xs font-bold text-slate-800 group-hover:text-rose-600">👑 Chủ Chuỗi (Admin)</span>
              <span className="text-[10px] text-slate-400">admin@esportking.vn</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => demoDangNhapNhanh('staff_cs1@esportking.vn', 'Staff@123')}
              className="px-1.5 py-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-center transition group cursor-pointer"
            >
              <span className="block text-[11px] font-bold text-slate-800 group-hover:text-amber-600">🏢 Staff CS1</span>
              <span className="text-[9px] text-slate-400 block truncate">Cầu Giấy</span>
            </button>

            <button
              onClick={() => demoDangNhapNhanh('staff_cs2@esportking.vn', 'Staff@123')}
              className="px-1.5 py-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-center transition group cursor-pointer"
            >
              <span className="block text-[11px] font-bold text-slate-800 group-hover:text-amber-600">🏢 Staff CS2</span>
              <span className="text-[9px] text-slate-400 block truncate">Đống Đa</span>
            </button>

            <button
              onClick={() => demoDangNhapNhanh('staff_cs3@esportking.vn', 'Staff@123')}
              className="px-1.5 py-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-center transition group cursor-pointer"
            >
              <span className="block text-[11px] font-bold text-slate-800 group-hover:text-amber-600">🏢 Staff CS3</span>
              <span className="text-[9px] text-slate-400 block truncate">Long Biên</span>
            </button>
          </div>
        </div>

      </Motion.div>

      {/* MODAL OTP XAC MINH TU DONG */}
      {hienModalOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[26px] p-7 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Xác Minh Mã OTP</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Mã xác minh 6 chữ số đã được tạo cho email <strong className="text-slate-800">{emailOtp}</strong>
            </p>

            {devOtpHint && (
              <div className="my-4 p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-700 font-bold">
                Mã OTP tự động điền: <span className="text-base tracking-widest text-brand-600">{devOtpHint}</span>
              </div>
            )}

            <form onSubmit={xuLyXacMinhOtp} className="mt-4 space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Nhập 6 số OTP"
                required
                className="w-full text-center text-2xl font-black tracking-widest py-3 border-2 border-brand-500 rounded-2xl outline-none"
              />

              <button
                type="submit"
                disabled={dangXuLy}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black text-sm shadow-md transition"
              >
                {dangXuLy ? 'Đang xác minh...' : 'Kích hoạt tài khoản'}
              </button>

              <button
                type="button"
                onClick={() => setHienModalOtp(false)}
                className="w-full text-xs text-slate-400 hover:text-slate-600 font-semibold pt-1"
              >
                Hủy bỏ
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
