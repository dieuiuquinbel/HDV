/**
 * File: TrangQuanTriAdmin.jsx
 * Muc dich: Trung Tam Dieu Hanh & Quan Tri He Thong ESportKing (Next-Gen Mission Control - Huong 3).
 * Dac diem:
 *  - Giao dien Bento Grid chuyen nghiep voi che do Cyber Dark Mode va Light Mode.
 *  - 4 The KPI thong minh: Doanh thu, Luot dat, Ty le lap day gio vang va Toc do phan hoi SLA.
 *  - Interactive Court Digital Twin: So do mat bang san 2.5D thoi gian thuc theo tung co so.
 *  - Bieu do doanh thu SVG tuong tac cao cap voi bo loc thoi gian.
 *  - Live Dispatch Radar: Hang doi SLA dem lui thoi gian thuc, canh bao mau theo cap do.
 *  - Bang du lieu User & Don dat tich hop tim kiem tuc thi (Instant Filter) va Modal xac nhan em ai.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiDichVu } from '../dichvu/api';
import { 
  Shield, 
  Users, 
  Calendar, 
  DollarSign, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Coffee, 
  CheckCircle2, 
  Timer, 
  Building2, 
  Sparkles,
  Check,
  Search,
  Filter,
  ArrowUpRight,
  Sun,
  Moon,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  AlertTriangle,
  Flame,
  Award,
  Zap,
  Phone,
  Mail,
  X
} from 'lucide-react';

const DANH_SACH_CO_SO_TEN = {
  1: 'Cơ Sở 1 (Cầu Giấy)',
  2: 'Cơ Sở 2 (Đống Đa)',
  3: 'Cơ Sở 3 (Long Biên)'
};

// Du lieu gia lap mat bang san thoi gian thuc cho 3 co so
const INITIAL_COURT_MATRIX = {
  1: [
    { id: 101, code: 'CL-01', name: 'Sân Cầu Lông A1', sport: 'BADMINTON', status: 'PLAYING', customer: 'Nguyễn Văn An', time: '18:00 - 20:00', price: '120.000 đ/h', hasSla: false },
    { id: 102, code: 'CL-02', name: 'Sân Cầu Lông A2', sport: 'BADMINTON', status: 'SLA_ALERT', customer: 'Trần Đình Trọng', time: '18:30 - 20:30', price: '120.000 đ/h', hasSla: true, slaNote: '2 Chai Revive + Khăn lạnh' },
    { id: 103, code: 'CL-03', name: 'Sân Cầu Lông A3', sport: 'BADMINTON', status: 'AVAILABLE', customer: null, time: 'Trống ngay bây giờ', price: '120.000 đ/h', hasSla: false },
    { id: 104, code: 'FB-01', name: 'Sân Bóng Đá 7 B1', sport: 'FOOTBALL', status: 'PLAYING', customer: 'FC Anh Em Cầu Giấy', time: '19:00 - 20:30', price: '450.000 đ/h', hasSla: false },
    { id: 105, code: 'TN-01', name: 'Sân Tennis T1', sport: 'TENNIS', status: 'MAINTENANCE', customer: null, time: 'Đang bảo dưỡng mặt sân', price: '250.000 đ/h', hasSla: false },
    { id: 106, code: 'TN-02', name: 'Sân Tennis T2', sport: 'TENNIS', status: 'AVAILABLE', customer: null, time: 'Trống ngay bây giờ', price: '250.000 đ/h', hasSla: false },
  ],
  2: [
    { id: 201, code: 'CL-21', name: 'Sân Cầu Lông Đống Đa 1', sport: 'BADMINTON', status: 'PLAYING', customer: 'Hoàng Kim Long', time: '18:00 - 19:30', price: '130.000 đ/h', hasSla: false },
    { id: 202, code: 'TN-21', name: 'Sân Tennis VIP D1', sport: 'TENNIS', status: 'SLA_ALERT', customer: 'Lê Thanh Tùng', time: '17:30 - 19:30', price: '280.000 đ/h', hasSla: true, slaNote: 'Yêu cầu Người nhặt bóng' },
    { id: 203, code: 'FB-21', name: 'Sân Bóng Đá Mini', sport: 'FOOTBALL', status: 'AVAILABLE', customer: null, time: 'Trống ngay bây giờ', price: '400.000 đ/h', hasSla: false },
  ],
  3: [
    { id: 301, code: 'FB-31', name: 'Sân Bóng Đá 11 Long Biên', sport: 'FOOTBALL', status: 'PLAYING', customer: 'Giải Doanh Nghiệp', time: '18:00 - 21:00', price: '800.000 đ/h', hasSla: false },
    { id: 302, code: 'CL-31', name: 'Sân Cầu Lông LB 1', sport: 'BADMINTON', status: 'AVAILABLE', customer: null, time: 'Trống ngay bây giờ', price: '110.000 đ/h', hasSla: false },
  ]
};

export default function TrangQuanTriAdmin({ nguoiDung }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('mission_control'); // 'mission_control' | 'nguoidung' | 'dondat' | 'dichvu'
  const [isDark, setIsDark] = useState(false);

  // Du lieu nguoi dung & don dat
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Thong ke doanh thu
  const [statsRevenue, setStatsRevenue] = useState(null);
  const [statsBookings, setStatsBookings] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 'today' | '7d' | '30d'

  // Digital Twin Court Matrix
  const [selectedVenue, setSelectedVenue] = useState(1);
  const [courtMatrix, setCourtMatrix] = useState(INITIAL_COURT_MATRIX);
  const [selectedCourtModal, setSelectedCourtModal] = useState(null);

  // SLA Tracking & Live Dispatch
  const [locCoSoDichVu, setLocCoSoDichVu] = useState(0);
  const [actionSuccessToast, setActionSuccessToast] = useState(null);
  const [confirmLockModal, setConfirmLockModal] = useState(null);

  const [dichVuList, setDichVuList] = useState(() => {
    try {
      const saved = localStorage.getItem('esportking_service_requests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'REQ-101',
        venueId: 1,
        courtName: 'Sân Cầu Lông A2',
        customerName: 'Trần Đình Trọng',
        items: '2 Chai Nước Điện Giải Revive + 1 Khăn Lạnh',
        requestTime: 'Vừa xong',
        status: 'PENDING',
        secondsElapsed: 145
      },
      {
        id: 'REQ-102',
        venueId: 2,
        courtName: 'Sân Tennis VIP D1',
        customerName: 'Lê Thanh Tùng',
        items: 'Yêu cầu 1 Người Nhặt Bóng Tennis (Ball-Boy)',
        requestTime: '1 phút trước',
        status: 'IN_PROGRESS',
        secondsElapsed: 210
      },
      {
        id: 'REQ-103',
        venueId: 3,
        courtName: 'Sân Bóng Đá 11 Long Biên',
        customerName: 'Giải Doanh Nghiệp',
        items: 'Thuê 2 bộ áo bib phân đội + 1 quả bóng FIFA',
        requestTime: '12 phút trước',
        status: 'COMPLETED',
        secondsElapsed: 180
      }
    ];
  });

  // Ticking effect for SLA timers (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setDichVuList(prev => 
        prev.map(item => {
          if (item.status === 'COMPLETED') return item;
          return { ...item, secondsElapsed: item.secondsElapsed + 1 };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nguoiDung || nguoiDung.role !== 'ADMIN') {
      navigate('/dang-nhap');
      return;
    }
    taiNguoiDung();
    taiDonDat();
    taiThongKe();
  }, [nguoiDung]);

  const taiNguoiDung = async () => {
    setLoadingUsers(true);
    try {
      const res = await apiDichVu.layDanhSachNguoiDung({ page: 0, size: 50 });
      setUsers(res.data.content || []);
    } catch (e) {
      console.error('Loi tai danh sach user:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const taiDonDat = async () => {
    setLoadingBookings(true);
    try {
      const res = await apiDichVu.layDonDatAdmin({ page: 0, size: 50 });
      setBookings(res.data.content || []);
    } catch (e) {
      console.error('Loi tai don dat admin:', e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const taiThongKe = async () => {
    try {
      const resR = await apiDichVu.layThongKeDoanhThu();
      setStatsRevenue(resR.data);
      const resB = await apiDichVu.layThongKeDonDat();
      setStatsBookings(resB.data);
    } catch (e) {
      console.error('Loi tai thong ke:', e);
    }
  };

  const showToast = (message) => {
    setActionSuccessToast(message);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  const handleXacNhanKhoaUser = async () => {
    if (!confirmLockModal) return;
    const { userId, currentStatus } = confirmLockModal;
    const nextStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      await apiDichVu.capNhatTrangThaiUser(userId, nextStatus);
      showToast(`Đã ${nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản #${userId} thành công!`);
      setConfirmLockModal(null);
      taiNguoiDung();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
      setConfirmLockModal(null);
    }
  };

  const handleHoanTatSla = (reqId) => {
    setDichVuList(prev => {
      const updated = prev.map(r => r.id === reqId ? { ...r, status: 'COMPLETED' } : r);
      localStorage.setItem('esportking_service_requests', JSON.stringify(updated));
      return updated;
    });
    showToast(`Đã hoàn tất yêu cầu dịch vụ ${reqId}! Khách hàng rất hài lòng.`);
  };

  // Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearch)) ||
        String(u.id).includes(userSearch);
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = 
        String(b.id).includes(bookingSearch) ||
        String(b.customerId).includes(bookingSearch) ||
        String(b.courtId).includes(bookingSearch);
      const matchStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  const danhSachDichVuLoc = locCoSoDichVu === 0 
    ? dichVuList 
    : dichVuList.filter(d => d.venueId === locCoSoDichVu);

  // Format seconds to mm:ss
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Current courts for selected venue
  const currentCourts = courtMatrix[selectedVenue] || [];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#080c14] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* ACTION TOAST */}
      {actionSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-2xl shadow-emerald-600/30 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="text-sm font-bold">{actionSuccessToast}</span>
        </div>
      )}

      {/* CONFIRM MODAL (NO MORE WINDOW.CONFIRM) */}
      {confirmLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Xác nhận thay đổi quyền</h3>
                <p className="text-xs text-slate-400">Tài khoản #{confirmLockModal.userId} ({confirmLockModal.userName})</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Bạn có chắc chắn muốn <strong>{confirmLockModal.currentStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA'}</strong> tài khoản này? Người dùng sẽ {confirmLockModal.currentStatus === 'ACTIVE' ? 'không thể đặt sân hoặc đăng nhập' : 'được cấp lại quyền truy cập ngay lập tức'}.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmLockModal(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleXacNhanKhoaUser}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURT DETAIL QUICK MODAL */}
      {selectedCourtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-velocity-600 text-white">{selectedCourtModal.code}</span>
                <h3 className="text-lg font-extrabold">{selectedCourtModal.name}</h3>
              </div>
              <button onClick={() => setSelectedCourtModal(null)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="py-5 space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="text-slate-500">Trạng thái hiện tại:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  selectedCourtModal.status === 'PLAYING' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  selectedCourtModal.status === 'SLA_ALERT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
                  selectedCourtModal.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {selectedCourtModal.status === 'PLAYING' ? '🟢 Đang thi đấu' :
                   selectedCourtModal.status === 'SLA_ALERT' ? '🚨 Yêu cầu hỗ trợ khẩn' :
                   selectedCourtModal.status === 'MAINTENANCE' ? '🟡 Đang bảo trì' : '⚪ Sân trống'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-400">Khách hàng</div>
                  <div className="font-bold mt-1">{selectedCourtModal.customer || 'Chưa có người đặt'}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-400">Khung giờ</div>
                  <div className="font-bold mt-1 text-velocity-500">{selectedCourtModal.time}</div>
                </div>
              </div>

              {selectedCourtModal.hasSla && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500">
                  <div className="text-xs font-bold uppercase tracking-wider">Yêu cầu phục vụ tại sân:</div>
                  <div className="font-semibold mt-1">{selectedCourtModal.slaNote}</div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setSelectedCourtModal(null)}
                className="w-full py-2.5 text-sm font-bold rounded-xl bg-velocity-600 hover:bg-velocity-700 text-white shadow-lg shadow-velocity-600/30"
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${isDark ? 'bg-[#080c14]/90 border-slate-800/80' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-velocity-700 to-rose-500 text-white shadow-lg shadow-velocity-600/25">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">ESportKing - Trung Tâm Quản Trị Hệ Thống</h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-black rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30 uppercase tracking-widest">
                  Trực Tuyến
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Điều phối 3 cơ sở tiêu chuẩn thi đấu Hà Nội • Cầu Giấy • Đống Đa • Long Biên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Facility Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 text-xs font-bold">
              {[1, 2, 3].map(id => (
                <button
                  key={id}
                  onClick={() => setSelectedVenue(id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedVenue === id ? 'bg-velocity-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  CS{id}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button 
              onClick={() => { taiNguoiDung(); taiDonDat(); taiThongKe(); showToast('Đã làm mới dữ liệu thời gian thực!'); }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all active:rotate-180"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={17} />
            </button>

            {/* Dark / Light Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
              title="Chuyển chế độ sáng/tối"
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('mission_control')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              tab === 'mission_control' 
                ? 'border-velocity-600 text-velocity-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame size={16} />
            <span>Tổng Quan & Thống Kê</span>
          </button>

          <button
            onClick={() => setTab('nguoidung')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              tab === 'nguoidung' 
                ? 'border-velocity-600 text-velocity-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users size={16} />
            <span>Quản Lý Tài Khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setTab('dondat')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              tab === 'dondat' 
                ? 'border-velocity-600 text-velocity-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={16} />
            <span>Tất Cả Đơn Đặt ({bookings.length})</span>
          </button>

          <button
            onClick={() => setTab('dichvu')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              tab === 'dichvu' 
                ? 'border-velocity-600 text-velocity-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coffee size={16} />
            <span>Điều Phối Dịch Vụ SLA ({dichVuList.filter(d => d.status !== 'COMPLETED').length})</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* TAB 1: MISSION CONTROL & ADVANCED CLAUDE-DASHBOARD */}
        {tab === 'mission_control' && (
          <div className="space-y-6">
            
            {/* 4 BENTO KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Doanh Thu */}
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>TỔNG DOANH THU HỆ THỐNG</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {statsRevenue?.totalRevenue ? Number(statsRevenue.totalRevenue).toLocaleString('vi-VN') : '0'} đ
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="flex items-center font-bold text-emerald-500">
                    <ArrowUpRight size={14} /> +18.4%
                  </span>
                  <span className="text-slate-400">so với chu kỳ trước</span>
                </div>
              </div>

              {/* Card 2: Luot Dat San */}
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>TỔNG LƯỢT ĐẶT SÂN</span>
                  <div className="p-1.5 rounded-lg bg-velocity-500/10 text-velocity-500">
                    <Calendar size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {bookings.length} <span className="text-sm font-semibold text-slate-400">lượt</span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="px-2 py-0.5 rounded-md font-extrabold bg-emerald-500/10 text-emerald-500 text-[11px]">
                    {bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'SUCCESS').length} Thành công
                  </span>
                  <span className="text-slate-400">trên 3 cơ sở</span>
                </div>
              </div>

              {/* Card 3: Ty le lap day gio vang */}
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>TỶ LỆ LẤP ĐẦY GIỜ VÀNG (17H - 22H)</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Zap size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  89.4%
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full" style={{ width: '89.4%' }} />
                  </div>
                </div>
              </div>

              {/* Card 4: SLA Phuc Vu */}
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'}`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>TỐC ĐỘ PHẢN HỒI DỊCH VỤ (SLA)</span>
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                    <Timer size={16} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  3m 12s
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="font-bold text-emerald-500">🟢 98.5% đạt chuẩn</span>
                  <span className="text-slate-400">cam kết &lt; 5 phút</span>
                </div>
              </div>

            </div>

            {/* SƠ ĐỒ MẶT BẰNG SÂN THEO THỜI GIAN THỰC */}
            <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold tracking-tight">
                      Sơ Đồ Mặt Bằng Sân Theo Thời Gian Thực
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-black rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      TRỰC TIẾP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Đang theo dõi: <strong>{DANH_SACH_CO_SO_TEN[selectedVenue]}</strong> • Click vào sân để xem chi tiết khách hoặc tiếp nhận dịch vụ
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đang thi đấu</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Cần tiếp tế dịch vụ</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Sân trống</span>
                </div>
              </div>

              {/* SÂN GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCourts.map(court => (
                  <div
                    key={court.id}
                    onClick={() => setSelectedCourtModal(court)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
                      court.status === 'SLA_ALERT' 
                        ? 'border-rose-500 bg-rose-500/5 shadow-rose-500/10 shadow-lg' 
                        : court.status === 'PLAYING'
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : isDark ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{court.code}</span>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-velocity-500 transition-colors">
                          {court.name}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[11px] font-black rounded-full ${
                        court.status === 'PLAYING' ? 'bg-emerald-500/20 text-emerald-400' :
                        court.status === 'SLA_ALERT' ? 'bg-rose-500 text-white animate-pulse' :
                        court.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {court.status === 'PLAYING' ? 'Đang chơi' :
                         court.status === 'SLA_ALERT' ? '🚨 CẦN DỊCH VỤ' :
                         court.status === 'MAINTENANCE' ? 'Bảo trì' : 'Trống'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-slate-400" />
                        <span>{court.time}</span>
                      </div>
                      {court.customer && (
                        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                          <Users size={13} className="text-slate-400" />
                          <span>{court.customer}</span>
                        </div>
                      )}
                    </div>

                    {court.hasSla && (
                      <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-500 flex items-center justify-between">
                        <span>{court.slaNote}</span>
                        <ChevronRight size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CHARTS SECTION (AREA & BREAKDOWN) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* SVG AREA CHART: DOANH THU 7 NGAY */}
              <div className={`lg:col-span-2 p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Xu Hướng Doanh Thu Theo Ngày (Revenue Trend)
                    </h3>
                    <p className="text-xs text-slate-400">Doanh thu giao dịch thanh toán thành công theo chu kỳ</p>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                    <button 
                      onClick={() => setTimeRange('7d')} 
                      className={`px-3 py-1 rounded-lg ${timeRange === '7d' ? 'bg-velocity-600 text-white' : 'text-slate-500'}`}
                    >
                      7 Ngày
                    </button>
                    <button 
                      onClick={() => setTimeRange('30d')} 
                      className={`px-3 py-1 rounded-lg ${timeRange === '30d' ? 'bg-velocity-600 text-white' : 'text-slate-500'}`}
                    >
                      30 Ngày
                    </button>
                  </div>
                </div>

                {/* SVG Area Chart Graphic */}
                <div className="relative w-full h-56 pt-4">
                  <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="600" y2="50" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeDasharray="4 4" />
                    
                    {/* Area fill */}
                    <path
                      d="M 20,160 Q 110,130 190,110 T 360,70 T 480,45 T 580,25 L 580,180 L 20,180 Z"
                      fill="url(#velocityGrad)"
                    />
                    {/* Line path */}
                    <path
                      d="M 20,160 Q 110,130 190,110 T 360,70 T 480,45 T 580,25"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3.5"
                    />
                    {/* Interactive dots */}
                    {[
                      { x: 20, y: 160, label: 'T2', val: '12tr' },
                      { x: 110, y: 130, label: 'T3', val: '15tr' },
                      { x: 190, y: 110, label: 'T4', val: '19tr' },
                      { x: 280, y: 95, label: 'T5', val: '22tr' },
                      { x: 360, y: 70, label: 'T6', val: '28tr' },
                      { x: 480, y: 45, label: 'T7', val: '38tr' },
                      { x: 580, y: 25, label: 'CN', val: '45tr' },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" className="cursor-pointer hover:r-7 transition-all" />
                        <text x={pt.x} y="195" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="bold">{pt.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* MÔN THỂ THAO & CƠ CẤU DOANH THU */}
              <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                  Tỷ Trọng Môn Thể Thao
                </h3>
                <p className="text-xs text-slate-400 mb-5">Đóng góp doanh thu từ 3 bộ môn thi đấu</p>

                <div className="space-y-4 text-xs font-bold">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                      <span>🏸 Cầu Lông (Badminton)</span>
                      <span className="text-velocity-500 font-extrabold">48% (69.7 triệu)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-velocity-600 h-full rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                      <span>⚽ Bóng Đá Sân Cỏ Nhân Tạo</span>
                      <span className="text-emerald-500 font-extrabold">34% (49.4 triệu)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '34%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                      <span>🎾 Quần Vợt (Tennis VIP)</span>
                      <span className="text-sky-500 font-extrabold">18% (26.1 triệu)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex justify-between items-center">
                    <span>Cơ sở doanh số cao nhất:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-black">CS1 Cầu Giấy (52%)</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: QUẢN LÝ TÀI KHOẢN (SEARCH + INSTANT FILTER + NO WINDOW.CONFIRM) */}
        {tab === 'nguoidung' && (
          <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Danh Sách Tài Khoản Hệ Thống
                </h2>
                <p className="text-xs text-slate-400">Tìm kiếm theo tên, email, vai trò hoặc số điện thoại</p>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm tài khoản (Ctrl+K)..."
                    className={`pl-10 pr-4 py-2 rounded-xl text-xs font-semibold border outline-none transition-all w-60 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500'
                    }`}
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="ALL">Tất Cả Vai Trò</option>
                  <option value="ADMIN">👑 Quản Trị Viên (Admin)</option>
                  <option value="STAFF">⚡ Nhân Viên (Staff)</option>
                  <option value="OWNER">🏟️ Chủ Sân (Owner)</option>
                  <option value="CUSTOMER">👤 Khách Hàng</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'bg-slate-800/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  <tr>
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Họ và Tên</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Số Điện Thoại</th>
                    <th className="px-4 py-3.5">Vai Trò (Role)</th>
                    <th className="px-4 py-3.5">Trạng Thái</th>
                    <th className="px-4 py-3.5">Phiên (Token)</th>
                    <th className="px-4 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        Không tìm thấy tài khoản nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3.5 font-black text-slate-400">#{u.id}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{u.fullName}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{u.phone || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase ${
                            u.role === 'ADMIN' ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20' :
                            u.role === 'STAFF' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20' :
                            u.role === 'OWNER' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' :
                            'bg-slate-500/15 text-slate-400'
                          }`}>
                            {u.role === 'ADMIN' ? '👑 ADMIN' : u.role === 'STAFF' ? '⚡ STAFF' : u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            u.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">v{u.tokenVersion}</td>
                        <td className="px-4 py-3.5 text-right">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => setConfirmLockModal({ userId: u.id, userName: u.fullName, currentStatus: u.status })}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                u.status === 'ACTIVE'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? <Lock size={12} /> : <Unlock size={12} />}
                              <span>{u.status === 'ACTIVE' ? 'Khóa' : 'Mở'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ ĐƠN ĐẶT (ADVANCED DATA TABLE) */}
        {tab === 'dondat' && (
          <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Danh Sách Đơn Đặt Sân Toàn Hệ Thống
                </h2>
                <p className="text-xs text-slate-400">Lọc theo mã đơn, mã khách hàng hoặc mã sân thi đấu</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Tìm đơn đặt..."
                    className={`pl-10 pr-4 py-2 rounded-xl text-xs font-semibold border outline-none w-56 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                  <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                  <option value="PENDING">PENDING (Chờ duyệt)</option>
                  <option value="CANCELLED">CANCELLED (Đã hủy)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'bg-slate-800/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  <tr>
                    <th className="px-4 py-3.5">Mã Đơn</th>
                    <th className="px-4 py-3.5">Khách Hàng</th>
                    <th className="px-4 py-3.5">Mã Sân</th>
                    <th className="px-4 py-3.5">Ngày Đặt</th>
                    <th className="px-4 py-3.5">Khung Giờ</th>
                    <th className="px-4 py-3.5">Tổng Tiền</th>
                    <th className="px-4 py-3.5">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Không có đơn đặt nào phù hợp tiêu chí tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3.5 font-extrabold text-velocity-600">#{b.id}</td>
                        <td className="px-4 py-3.5 font-bold">User #{b.customerId}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">Sân #{b.courtId}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{b.bookingDate}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {b.startSlot?.substring(0, 5)} - {b.endSlot?.substring(0, 5)}
                        </td>
                        <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">
                          {Number(b.totalAmount).toLocaleString('vi-VN')} {b.currency}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : b.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GIÁM SÁT DỊCH VỤ TIẾP TẾ TẬN SÂN */}
        {tab === 'dichvu' && (
          <div className="space-y-6">
            
            {/* 3 SLA STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl border-l-4 border-l-rose-500 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-bold text-slate-400 uppercase">CAM KẾT THỜI GIAN (SLA)</div>
                <div className="text-2xl font-black text-rose-500 mt-1">&lt; 5 Phút</div>
                <p className="text-xs text-slate-500 mt-1">Tiếp nhận & bàn giao nước/bóng/khăn tận sân</p>
              </div>

              <div className={`p-5 rounded-2xl border-l-4 border-l-emerald-500 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-bold text-slate-400 uppercase">TỶ LỆ ĐÁP ỨNG THÀNH CÔNG</div>
                <div className="text-2xl font-black text-emerald-500 mt-1">98.5%</div>
                <p className="text-xs text-slate-500 mt-1">Khách đánh giá 5 sao sau khi hoàn tất</p>
              </div>

              <div className={`p-5 rounded-2xl border-l-4 border-l-sky-500 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-bold text-slate-400 uppercase">TỔNG YÊU CẦU TRONG CA</div>
                <div className="text-2xl font-black text-sky-500 mt-1">{dichVuList.length} lượt</div>
                <p className="text-xs text-slate-500 mt-1">Nước giải khát, thuê đồ, người nhặt bóng</p>
              </div>
            </div>

            {/* LIVE STREAM DISPATCH LIST */}
            <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Hàng Đợi Điều Phối Tiếp Tế Tận Sân
                  </h3>
                  <p className="text-xs text-slate-400">Đồng hồ đếm thời gian thực tự động cảnh báo đổi màu theo thời gian đáp ứng</p>
                </div>

                <select
                  value={locCoSoDichVu}
                  onChange={(e) => setLocCoSoDichVu(Number(e.target.value))}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value={0}>🏢 Toàn bộ 3 Cơ Sở</option>
                  <option value={1}>Cơ Sở 1 (Cầu Giấy)</option>
                  <option value={2}>Cơ Sở 2 (Đống Đa)</option>
                  <option value={3}>Cơ Sở 3 (Long Biên)</option>
                </select>
              </div>

              <div className="space-y-3">
                {danhSachDichVuLoc.map(req => {
                  const isWarning = req.secondsElapsed > 180 && req.status !== 'COMPLETED';
                  const isDanger = req.secondsElapsed > 300 && req.status !== 'COMPLETED';

                  return (
                    <div 
                      key={req.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                        isDanger 
                          ? 'border-rose-500 bg-rose-500/10' 
                          : isWarning
                          ? 'border-amber-500 bg-amber-500/10'
                          : isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xs text-slate-400">#{req.id}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{req.courtName}</span>
                            <span className="text-xs text-slate-400">({DANH_SACH_CO_SO_TEN[req.venueId]})</span>
                          </div>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                            {req.customerName}: <strong className="text-velocity-600">{req.items}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Live Timer */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                          isDanger ? 'bg-rose-500 text-white animate-pulse' :
                          isWarning ? 'bg-amber-500 text-white' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          <Timer size={14} />
                          <span>{formatTimer(req.secondsElapsed)}</span>
                        </div>

                        {/* Status / Action */}
                        {req.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleHoanTatSla(req.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                          >
                            Bàn giao xong ✓
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            ✓ Đã giao xong
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
