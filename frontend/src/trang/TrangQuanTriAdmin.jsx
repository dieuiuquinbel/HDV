/**
 * File: TrangQuanTriAdmin.jsx
 * Muc dich: Trung Tam Quan Tri He Thong ESportKing (Toi gian, sach se, nghiep vu thuc te).
 * Bao gom 2 Tab duy nhat:
 *  1. Quan Ly Tai Khoan He Thong (5 tai khoan chuan, ho tro khoa/mo khoa).
 *  2. Quan Ly Don Dat San (Du lieu thuc tu microservice booking-service).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiDichVu } from '../dichvu/api';
import { 
  Shield, 
  Users, 
  Calendar, 
  Lock, 
  Unlock, 
  Search, 
  Sun, 
  Moon, 
  RefreshCw, 
  AlertTriangle, 
  X,
  CheckCircle2
} from 'lucide-react';

export default function TrangQuanTriAdmin({ nguoiDung }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('nguoidung'); // 'nguoidung' | 'dondat'
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

  // UI state
  const [actionSuccessToast, setActionSuccessToast] = useState(null);
  const [confirmLockModal, setConfirmLockModal] = useState(null);

  useEffect(() => {
    if (!nguoiDung || nguoiDung.role !== 'ADMIN') {
      navigate('/dang-nhap');
      return;
    }
    taiNguoiDung();
    taiDonDat();
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

  // Loc danh sach nguoi dung
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

  // Loc danh sach don dat
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

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* TOAST THONG BAO */}
      {actionSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{actionSuccessToast}</span>
        </div>
      )}

      {/* MODAL XAC NHAN KHOA/MO KHOA USER */}
      {confirmLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold">Xác nhận cập nhật trạng thái</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn {confirmLockModal.currentStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản <strong className="text-slate-900 dark:text-white">"{confirmLockModal.userName}"</strong> (ID: #{confirmLockModal.userId}) không?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmLockModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleXacNhanKhoaUser}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-velocity-600 hover:bg-velocity-700 text-white shadow-lg shadow-velocity-600/25 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER QUAN TRI */}
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
                Quản lý vận hành tài khoản & đơn đặt 3 cơ sở: Cầu Giấy • Đống Đa • Hà Đông
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh */}
            <button 
              onClick={() => { taiNguoiDung(); taiDonDat(); showToast('Đã làm mới dữ liệu hệ thống!'); }}
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

        {/* 2 NAVIGATION TABS DUY NHAT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto no-scrollbar">
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
            <span>Quản Lý Đơn Đặt Sân ({bookings.length})</span>
          </button>
        </div>
      </header>

      {/* NOI DUNG CHINH */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: QUAN LY TAI KHOAN */}
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
                    placeholder="Tìm tài khoản..."
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
                  <option value="CUSTOMER">👤 Khách Hàng</option>
                </select>
              </div>
            </div>

            {/* TABLE USER */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'bg-slate-800/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  <tr>
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Họ và Tên</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Số Điện Thoại</th>
                    <th className="px-4 py-3.5">Vai Trò</th>
                    <th className="px-4 py-3.5">Trạng Thái</th>
                    <th className="px-4 py-3.5">Phiên (Token)</th>
                    <th className="px-4 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        Đang tải danh sách tài khoản...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
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
                            'bg-slate-500/15 text-slate-500'
                          }`}>
                            {u.role === 'ADMIN' ? '👑 ADMIN' : u.role === 'STAFF' ? '⚡ STAFF' : '👤 CUSTOMER'}
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

        {/* TAB 2: QUAN LY DON DAT SAN */}
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
                  {loadingBookings ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Đang tải danh sách đơn đặt sân...
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Chưa có đơn đặt sân nào trong hệ thống.
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
                          {Number(b.totalAmount).toLocaleString('vi-VN')} {b.currency || 'VND'}
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

      </main>

    </div>
  );
}
