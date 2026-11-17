/**
 * File: TrangHoSoCaNhan.jsx
 * Muc dich: Trang Dashboard ca nhan (/me) chia 2 cot da Tab kieu DieuBel/Airbnb.
 * Chuc nang: Thong tin ca nhan, the hang thanh vien & diem thuong, kho voucher, quan ly don dat san kem ma QR check-in thuc te va lich su hoan tien.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  User, 
  Trophy, 
  CalendarDays, 
  Ticket, 
  Coins, 
  CreditCard, 
  Star, 
  LogOut, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Shield,
  Building2,
  X,
  Heart
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

const MUC_THANH_BEN = [
  { id: 'profile', label: 'Tổng quan' },
  { id: 'bookings', label: 'Đặt chỗ của tôi' },
  { id: 'favorites', label: 'Sân yêu thích' },
  { id: 'wallet', label: 'Kho voucher', coChamDo: true },
  { id: 'membership', label: 'Hạng thành viên' },
  { id: 'refunds', label: 'Hoàn tiền' },
  { id: 'reviews', label: 'Đánh giá' },
];

export default function TrangHoSoCaNhan({ user, onDangXuat }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'profile';
  const [tabHienTai, setTabHienTai] = useState(tabParam);

  // Thong tin ca nhan form
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [daLuu, setDaLuu] = useState(false);

  // Du lieu don dat san
  const [danhSachDon, setDanhSachDon] = useState([]);
  const [danhSachVoucher, setDanhSachVoucher] = useState([]);
  const [sanYeuThichList, setSanYeuThichList] = useState([]);
  const [dangTai, setDangTai] = useState(false);

  // QR Modal
  const [donChonQr, setDonChonQr] = useState(null);
  const [anhQrDataUrl, setAnhQrDataUrl] = useState('');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setTabHienTai(t);
  }, [searchParams]);

  const chuyenTab = (id) => {
    setTabHienTai(id);
    setSearchParams({ tab: id });
  };

  useEffect(() => {
    if (user) {
      // Lay don dat san cua toi
      apiDichVu.layDonDatCuaToi({ page: 0, size: 20 })
        .then(res => setDanhSachDon(res.data?.content || []))
        .catch(console.error);

      // Lay danh sach voucher kha dung
      apiDichVu.layDanhSachUuDai()
        .then(res => setDanhSachVoucher(res.data || []))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (tabHienTai === 'favorites') {
      try {
        const favIds = JSON.parse(localStorage.getItem('sportbooking_favorites') || '[]');
        if (favIds.length > 0) {
          apiDichVu.layDanhSachCumSan().then(res => {
            const all = res.data?.content || [];
            setSanYeuThichList(all.filter(s => favIds.includes(s.id) || favIds.includes(String(s.id))));
          }).catch(console.error);
        } else {
          setSanYeuThichList([]);
        }
      } catch {
        setSanYeuThichList([]);
      }
    }
  }, [tabHienTai]);

  // Tao ma QR khi bam xem
  const moModalQr = async (don) => {
    setDonChonQr(don);
    const token = don.checkinToken;
    if (!token) {
      setAnhQrDataUrl('');
      return;
    }
    try {
      const url = await QRCode.toDataURL(token, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setAnhQrDataUrl(url);
    } catch (err) {
      console.error('Loi tao QR:', err);
    }
  };

  // Huy don dat san
  const xuLyHuyDon = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này không? Tiền sẽ được hoàn lại tự động.')) return;
    try {
      await apiDichVu.huyDonDat(bookingId);
      alert('Đã hủy đơn đặt sân thành công!');
      // Tai lai danh sach
      const res = await apiDichVu.layDonDatCuaToi({ page: 0, size: 20 });
      setDanhSachDon(res.data?.content || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn đặt');
    }
  };

  const copyMaVoucher = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã ưu đãi: ${code}`);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Trophy className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Vui lòng đăng nhập để xem hồ sơ cá nhân</h2>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-full shadow hover:bg-brand-700"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7f5] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP GREETING HEADER CHUAN DIEUBEL */}
        <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md flex-shrink-0">
              {user.fullName ? user.fullName.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Xin chào, {user.fullName || 'Vận động viên'} 🏅
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Hạng Cơ bản • <span className="text-amber-600 font-bold">250 điểm thành tích</span> • 0 điểm tiêu dùng
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {user.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow hover:bg-slate-800 transition">
                👑 Quản trị hệ thống
              </button>
            )}
            {user.role === 'OWNER' && (
              <button onClick={() => navigate('/owner')} className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-full shadow hover:bg-brand-700 transition">
                🏟️ Quản lý cụm sân
              </button>
            )}
          </div>
        </div>

        {/* 2-COLUMN DASHBOARD LAYOUT CHUAN DIEUBEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* COT TRAI: THANH BEN (SIDEBAR) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* The Hang Thanh Vien */}
            <div className="bg-white rounded-[22px] p-5 border border-slate-200/80 shadow-sm text-left">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Hạng Thành Viên</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900">Cơ bản 🥉</span>
                <span className="text-xs font-bold text-slate-400">250 xu</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-amber-500 h-2 rounded-full w-[45%]" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2">Còn 150 điểm nữa để lên hạng Bạc 🥈</p>
            </div>

            {/* Menu cac Tab chuc nang */}
            <div className="bg-white rounded-[22px] p-3 border border-slate-200/80 shadow-sm space-y-1">
              {MUC_THANH_BEN.map((item) => {
                const active = tabHienTai === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => chuyenTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-left transition-all ${
                      active
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.coChamDo && !active && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nut Dang Xuat */}
            <button
              onClick={onDangXuat}
              className="w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-[20px] text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>

          </div>

          {/* COT PHAI: NOI DUNG CHINH CAC TAB */}
          <div className="lg:col-span-3">
            
            {/* TAB 1: TONG QUAN & THONG TIN CA NHAN */}
            {tabHienTai === 'profile' && (
              <div className="space-y-6">
                
                {/* Form Thong Tin Ca Nhan */}
                <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Thông Tin Cá Nhân</h3>
                      <p className="text-xs text-slate-400 font-semibold">Cập nhật tên hiển thị và liên hệ của bạn.</p>
                    </div>
                    <button
                      onClick={() => setDaLuu(true)}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
                    >
                      Lưu thay đổi
                    </button>
                  </div>

                  {daLuu && (
                    <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Đã lưu thông tin thành công!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên hiển thị</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                      <input
                        type="text"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Trạng thái xác thực email</label>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Đã xác minh (Tài khoản chính thức)
                    </div>
                  </div>
                </div>

                {/* 2 The Thong Ke Nhanh Chuan DieuBel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm text-left">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Đặt chỗ</span>
                    <p className="text-3xl font-black text-slate-900 mt-2">{danhSachDon.length}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Theo dõi các sân đã đặt</p>
                  </div>

                  <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm text-left">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Kho Voucher</span>
                    <p className="text-3xl font-black text-brand-600 mt-2">{danhSachVoucher.length}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Mã ưu đãi khả dụng</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: KHO VOUCHER */}
            {tabHienTai === 'wallet' && (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900">Kho Voucher Của Bạn</h3>
                  <p className="text-xs text-slate-400 font-semibold">Sử dụng các mã giảm giá dưới đây khi thanh toán đặt sân.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {danhSachVoucher.map((v) => (
                    <div key={v.code} className="p-5 border-2 border-dashed border-brand-200 rounded-2xl bg-gradient-to-tr from-rose-50/50 to-white flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-brand-600 text-white text-xs font-black rounded-lg tracking-wider">
                            {v.code}
                          </span>
                          <span className="text-xs font-black text-rose-600">
                            Giảm {v.discountPercent}%
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-3">{v.description}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1">Đơn tối thiểu: 100.000đ</p>
                      </div>

                      <button
                        onClick={() => copyMaVoucher(v.code)}
                        className="mt-4 w-full py-2 bg-white hover:bg-brand-50 border border-brand-300 text-brand-600 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Sao chép mã
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DAT CHO CUA TOI */}
            {tabHienTai === 'bookings' && (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Lịch Đặt Chỗ Của Tôi</h3>
                    <p className="text-xs text-slate-400 font-semibold">Theo dõi vé đặt sân, mã QR nhận sân và quản lý hủy vé.</p>
                  </div>
                  <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition">
                    + Đặt thêm sân
                  </button>
                </div>

                {danhSachDon.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    Bạn chưa có đơn đặt sân nào. Hãy khám phá và đặt sân ngay!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {danhSachDon.map((don) => (
                      <div key={don.id} className="p-5 border border-slate-200 rounded-2xl hover:border-brand-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">Đơn đặt #{don.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              don.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                              don.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {don.status}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-600 mt-1">
                            📅 Ngày chơi: <span className="text-slate-900">{don.bookingDate}</span> ({don.startSlot} - {don.endSlot})
                          </p>
                          <p className="text-xs font-black text-brand-600 mt-1">
                            Tổng tiền: {Number(don.totalAmount).toLocaleString('vi-VN')} {don.currency}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {/* Nut xem ma QR Check-in */}
                          <button
                            onClick={() => moModalQr(don)}
                            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            Mã QR Nhận Sân
                          </button>

                          {/* Nut huy don neu con han */}
                          {don.status === 'CONFIRMED' && (
                            <button
                              onClick={() => xuLyHuyDon(don.id)}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition"
                            >
                              Hủy & Hoàn tiền
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SAN YEU THICH */}
            {tabHienTai === 'favorites' && (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Cụm Sân Yêu Thích Của Bạn</h3>
                    <p className="text-xs text-slate-400 font-semibold">Các sân thể thao bạn đã bấm lưu để theo dõi và đặt lại nhanh.</p>
                  </div>
                  <button onClick={() => navigate('/tim-san')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition">
                    + Khám phá thêm sân
                  </button>
                </div>

                {sanYeuThichList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl">
                    Bạn chưa lưu cụm sân nào vào danh sách yêu thích. Hãy bấm vào biểu tượng ❤️ tại danh sách sân để lưu nhé!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sanYeuThichList.map((san) => (
                      <div key={san.id} className="p-5 border border-slate-200 rounded-2xl hover:border-brand-500/50 transition flex flex-col justify-between bg-slate-50/40">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900 text-sm line-clamp-1">{san.name}</span>
                            <span className="text-sm text-rose-500">❤️</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">📍 {san.address}, {san.district}</p>
                          <p className="text-xs text-slate-400 line-clamp-2">{san.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <button
                            onClick={() => navigate(`/venue/${san.id}`)}
                            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                          >
                            Xem giờ & Đặt sân ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HOAN TIEN */}
            {tabHienTai === 'refunds' && (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900">Lịch Sử Hoàn Tiền</h3>
                  <p className="text-xs text-slate-400 font-semibold">Chính sách hoàn tiền tự động 100% khi hủy trước giờ thi đấu.</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-800 mb-1">Chính sách hoàn tiền ESportKing:</p>
                  <p>• Hủy trước 6 tiếng: Hoàn 100% giá trị đơn đặt vào tài khoản gốc.</p>
                  <p>• Tiền hoàn sẽ được xử lý trong vòng 1-3 ngày làm việc thông qua cổng thanh toán.</p>
                </div>
              </div>
            )}

            {/* TAB 5: HANG THANH VIEN */}
            {tabHienTai === 'membership' && (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Đặc Quyền Thành Viên</h3>
                  <p className="text-xs text-slate-400 font-semibold">Tích lũy điểm khi đặt sân để thăng hạng và nhận voucher độc quyền.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
                    <span className="text-base font-black text-slate-800 block">🥉 Hạng Cơ Bản</span>
                    <span className="text-xs text-slate-500 font-semibold mt-1 block">0 - 199 điểm</span>
                    <p className="text-xs text-slate-600 mt-2">• Tích 1 điểm mỗi 10.000đ</p>
                  </div>
                  <div className="p-4 border-2 border-brand-200 rounded-2xl bg-rose-50/40">
                    <span className="text-base font-black text-brand-600 block">🥈 Hạng Bạc</span>
                    <span className="text-xs text-slate-500 font-semibold mt-1 block">200 - 499 điểm</span>
                    <p className="text-xs text-slate-600 mt-2">• Giảm thêm 5% mọi đơn</p>
                  </div>
                  <div className="p-4 border border-amber-300 rounded-2xl bg-amber-50/50">
                    <span className="text-base font-black text-amber-700 block">🥇 Hạng Vàng</span>
                    <span className="text-xs text-slate-500 font-semibold mt-1 block">500+ điểm</span>
                    <p className="text-xs text-slate-600 mt-2">• Ưu tiên giữ giờ cao điểm</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: DANH GIA */}
            {tabHienTai === 'reviews' && (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-200/80 shadow-sm text-left">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900">Đánh Giá Của Bạn</h3>
                  <p className="text-xs text-slate-400 font-semibold">Nhận xét giúp các vận động viên khác lựa chọn sân đấu tốt hơn.</p>
                </div>
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  Chưa có đánh giá nào. Sau khi hoàn tất trận đấu, bạn có thể vào đánh giá cụm sân.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL MA QR CHECK-IN NHO GỌN */}
      {donChonQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[28px] p-7 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setDonChonQr(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Mã QR Nhận Sân</h3>
            <p className="text-xs text-slate-500 mt-1">
              Đơn đặt <strong className="text-slate-900">#{donChonQr.id}</strong> • {donChonQr.bookingDate}
            </p>

            {/* Anh QR Code render thuc te */}
            <div className="my-5 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl inline-block shadow-inner">
              {anhQrDataUrl ? (
                <img src={anhQrDataUrl} alt="Mã QR Check-in" className="w-56 h-56 mx-auto rounded-lg" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">Đang tạo mã QR...</div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Xuất trình mã này cho chủ sân hoặc nhân viên lễ tân quét tại sân để nhận chỗ thi đấu.
            </p>

            <button
              onClick={() => setDonChonQr(null)}
              className="mt-5 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              Đã hiểu, đóng lại
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
