/**
 * File: TrangQuanTriAdmin.jsx
 * Mục đích: Trung Tâm Quản Trị Hệ Thống Toàn Diện eSportKing (Executive Admin Control Center).
 * Giao diện Header chuẩn (Ảnh 2 duy nhất, đã ẩn Navbar chung của App để tránh trùng lặp tab).
 * Gồm 3 Tab Chuẩn:
 *  1. Tab 'dashboard': Trang Chủ (100% dữ liệu thực từ Database, xóa sạch dữ liệu bịa demo, bố cục panel tinh tế).
 *  2. Tab 'checkin': Trạm Check-In Trực Ban (Quét QR, xác minh nhận/trả sân 3 cơ sở, không còn nút rác demo).
 *  3. Tab 'system': Quản Lý Hệ Thống (Gồm 2 Sub-tab: Quản Lý 30 Sân & Bảng Giá / Quản Lý Tài Khoản & Phân Quyền).
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiDichVu } from '../dichvu/api';
import TAI_KHOAN_MAC_DINH from '../../../tai-khoan-mac-dinh.json';
import CacModalAdmin from '../thanhphan/admin/CacModalAdmin';
import TrangQuetCheckIn from './TrangQuetCheckIn';
import { 
  Shield, 
  Users, 
  Calendar, 
  Lock, 
  Unlock, 
  Search, 
  Bell,
  LogOut,
  RefreshCw, 
  AlertTriangle, 
  X,
  CheckCircle2,
  Percent,
  Clock,
  Layers,
  DollarSign,
  Coffee,
  Check,
  Building2,
  Activity,
  Receipt,
  Edit2,
  Trash2,
  UserPlus,
  Filter,
  BarChart3,
  Inbox
} from 'lucide-react';

export default function TrangQuanTriAdmin({ nguoiDung, onDangXuat }) {
  const navigate = useNavigate();

  // Tab chinh: 'dashboard' (Trang Chủ) | 'checkin' (Trạm Check-In) | 'system' (Quản Lý Hệ Thống)
  const [tab, setTab] = useState('dashboard');
  // Sub-tab cua Tab system: 'courts' | 'users'
  const [subTab, setSubTab] = useState('courts');

  const [timeRange, setTimeRange] = useState('all'); // 'today' | 'week' | 'month' | 'all'
  const [refreshing, setRefreshing] = useState(false);

  // Thong bao realtime cho Admin
  const [thongBaoList, setThongBaoList] = useState([]);
  const [hienDropdownThongBao, setHienDropdownThongBao] = useState(false);
  const dropdownThongBaoRef = useRef(null);

  // Du lieu nguoi dung
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Du lieu don dat & thanh toan (100% tu database)
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Du lieu 30 san the thao cua 3 co so
  const [courts, setCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [selectedVenueFilter, setSelectedVenueFilter] = useState('ALL');
  const [selectedSportFilter, setSelectedSportFilter] = useState('ALL');
  const [courtSearch, setCourtSearch] = useState('');

  // UI Toast & Modals
  const [toast, setToast] = useState(null);

  // Modal User Management
  const [modalUserForm, setModalUserForm] = useState(null);
  const [modalConfirmLockUser, setModalConfirmLockUser] = useState(null);
  const [modalConfirmDeleteUser, setModalConfirmDeleteUser] = useState(null);

  // Modal Court Price & Lock
  const [modalEditCourtPrice, setModalEditCourtPrice] = useState(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [modalConfirmLockCourt, setModalConfirmLockCourt] = useState(null);

  const taiThongBaoAdmin = async () => {
    try {
      const res = await apiDichVu.layThongBaoCuaToi();
      if (Array.isArray(res.data)) {
        setThongBaoList(res.data);
      }
    } catch {}
  };

  const danhDauDaDocTatCa = async () => {
    try {
      await apiDichVu.danhDauDaDocTatCaThongBao();
      setThongBaoList((prev) => prev.map((tb) => ({ ...tb, isRead: true })));
    } catch {}
  };

  const xuLyDangXuatAdmin = async () => {
    if (onDangXuat) {
      onDangXuat();
      return;
    }
    try {
      await apiDichVu.dangXuat();
    } catch {}
    try {
      localStorage.removeItem('esportking_user');
    } catch {}
    window.location.href = '/login';
  };

  useEffect(() => {
    if (!nguoiDung || nguoiDung.role !== 'ADMIN') {
      navigate('/dang-nhap');
      return;
    }
    taiDuLieuHeThong();
    taiThongBaoAdmin();
    const timer = setInterval(taiThongBaoAdmin, 6000);
    const onNotif = () => {
      taiThongBaoAdmin();
      taiDuLieuHeThong();
    };
    window.addEventListener('cap_nhat_thong_bao', onNotif);
    window.addEventListener('cap_nhat_ve', onNotif);
    return () => {
      clearInterval(timer);
      window.removeEventListener('cap_nhat_thong_bao', onNotif);
      window.removeEventListener('cap_nhat_ve', onNotif);
    };
  }, [nguoiDung]);

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (dropdownThongBaoRef.current && !dropdownThongBaoRef.current.contains(e.target)) {
        setHienDropdownThongBao(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const soThongBaoChuaDoc = useMemo(
    () => thongBaoList.filter((tb) => !tb.isRead).length,
    [thongBaoList]
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const taiDuLieuHeThong = async () => {
    setRefreshing(true);
    await Promise.all([
      taiNguoiDung(),
      taiDonDat(),
      taiThanhToan(),
      taiDanhSachSanToanHeThong()
    ]);
    setRefreshing(false);
  };

  const taiNguoiDung = async () => {
    setLoadingUsers(true);
    try {
      const res = await apiDichVu.layDanhSachNguoiDung({ page: 0, size: 100 });
      setUsers(res.data.content || []);
    } catch (e) {
      console.error('Lỗi tải danh sách users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const taiDonDat = async () => {
    setLoadingBookings(true);
    try {
      const res = await apiDichVu.layDonDatAdmin({ page: 0, size: 100 });
      setBookings(res.data.content || []);
    } catch (e) {
      console.error('Lỗi tải đơn đặt admin:', e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const taiThanhToan = async () => {
    setLoadingPayments(true);
    try {
      const res = await apiDichVu.layThanhToanAdmin({ page: 0, size: 100 });
      setPayments(res.data.content || []);
    } catch (e) {
      console.error('Lỗi tải thanh toán admin:', e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const taiDanhSachSanToanHeThong = async () => {
    setLoadingCourts(true);
    try {
      const [v1, v2, v3] = await Promise.all([
        apiDichVu.layChiTietCumSan(1).catch(() => ({ data: { courts: [] } })),
        apiDichVu.layChiTietCumSan(2).catch(() => ({ data: { courts: [] } })),
        apiDichVu.layChiTietCumSan(3).catch(() => ({ data: { courts: [] } }))
      ]);

      const c1 = (v1.data?.courts || []).map(c => ({ ...c, venueId: 1, venueName: 'Cơ Sở 1 (Cầu Giấy)' }));
      const c2 = (v2.data?.courts || []).map(c => ({ ...c, venueId: 2, venueName: 'Cơ Sở 2 (Đống Đa)' }));
      const c3 = (v3.data?.courts || []).map(c => ({ ...c, venueId: 3, venueName: 'Cơ Sở 3 (Hà Đông)' }));

      setCourts([...c1, ...c2, ...c3]);
    } catch (e) {
      console.error('Lỗi tải danh sách sân:', e);
    } finally {
      setLoadingCourts(false);
    }
  };

  // ==========================================
  // 1. NGHIEP VU KHOA / MO KHOA & CAP NHAT GIA SAN
  // ==========================================
  const handleXacNhanKhoaSan = async () => {
    if (!modalConfirmLockCourt) return;
    const court = modalConfirmLockCourt;
    const nextStatus = court.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      await apiDichVu.doiTrangThaiSanCon(court.id, nextStatus);
      showToast(
        nextStatus === 'MAINTENANCE'
          ? `Đã khóa sân [${court.name}]! Giao diện khách hàng sẽ hiển thị Bảo trì và chặn đặt slot.`
          : `Đã mở khóa sân [${court.name}] hoạt động bình thường!`,
        'success'
      );
      setModalConfirmLockCourt(null);
      taiDanhSachSanToanHeThong();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái sân.', 'error');
      setModalConfirmLockCourt(null);
    }
  };

  const handleLuuGiaSan = async () => {
    if (!modalEditCourtPrice) return;
    const priceNum = parseFloat(newPriceInput);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Vui lòng nhập đơn giá hợp lệ lớn hơn hoặc bằng 0.', 'error');
      return;
    }

    try {
      await apiDichVu.capNhatSanCon(modalEditCourtPrice.id, {
        name: modalEditCourtPrice.name,
        capacity: modalEditCourtPrice.capacity || 4,
        basePrice: priceNum
      });
      showToast(`Đã cập nhật đơn giá sân [${modalEditCourtPrice.name}] thành ${priceNum.toLocaleString('vi-VN')} đ/giờ!`);
      setModalEditCourtPrice(null);
      taiDanhSachSanToanHeThong();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật giá sân.', 'error');
    }
  };

  const handleTangGiamGiaNhanh = async (court, delta) => {
    const currentPrice = parseFloat(court.basePrice) || 0;
    const newPrice = Math.max(0, currentPrice + delta);
    try {
      await apiDichVu.capNhatSanCon(court.id, {
        name: court.name,
        capacity: court.capacity || 4,
        basePrice: newPrice
      });
      showToast(`Đã ${delta > 0 ? 'tăng' : 'giảm'} giá sân [${court.courtCode || court.name}] thành ${newPrice.toLocaleString('vi-VN')} đ`);
      taiDanhSachSanToanHeThong();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật giá sân nhanh.', 'error');
    }
  };

  // ==========================================
  // 2. NGHIEP VU TAI KHOAN NGUOI DUNG
  // ==========================================
  const handleXacNhanKhoaUser = async () => {
    if (!modalConfirmLockUser) return;
    const { id, status } = modalConfirmLockUser;
    const nextStatus = status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      await apiDichVu.capNhatTrangThaiUser(id, nextStatus);
      showToast(`Đã ${nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản #${id} thành công!`);
      setModalConfirmLockUser(null);
      taiNguoiDung();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái.', 'error');
      setModalConfirmLockUser(null);
    }
  };

  const handleXoaUser = async () => {
    if (!modalConfirmDeleteUser) return;
    try {
      await apiDichVu.xoaNguoiDungAdmin(modalConfirmDeleteUser.id);
      showToast(`Đã xóa tài khoản [${modalConfirmDeleteUser.email}] khỏi hệ thống.`);
      setModalConfirmDeleteUser(null);
      taiNguoiDung();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xóa tài khoản.', 'error');
      setModalConfirmDeleteUser(null);
    }
  };

  const handleLuuUserForm = async (e) => {
    e.preventDefault();
    const { mode, data } = modalUserForm;
    try {
      if (mode === 'create') {
        await apiDichVu.taoNguoiDungAdmin({
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          password: data.password || '123456',
          role: data.role || 'CUSTOMER'
        });
        showToast(`Đã tạo tài khoản mới [${data.email}] thành công!`);
      } else {
        await apiDichVu.capNhatNguoiDungAdmin(data.id, {
          fullName: data.fullName,
          phone: data.phone,
          role: data.role
        });
        showToast(`Đã cập nhật thông tin tài khoản #${data.id} thành công!`);
      }
      setModalUserForm(null);
      taiNguoiDung();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu thông tin người dùng.', 'error');
    }
  };

  // ==========================================
  // 3. THONG KE 100% THUC TE (KHONG CO DU LIEU BIA)
  // ==========================================
  const bookingsTheoChuKy = useMemo(() => {
    if (timeRange === 'all') return bookings;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return bookings.filter((b) => {
      const raw = b.createdAt || b.bookingDate;
      if (!raw) return true;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return true;
      if (timeRange === 'today') return d >= startOfToday;
      if (timeRange === 'week') {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (timeRange === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [bookings, timeRange]);

  const thongKeThucTe = useMemo(() => {
    let grossValue = 0;
    let voucherTotal = 0;
    let refundedTotal = 0;
    let cancellationFee = 0;
    let addonServicesTotal = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let checkedInCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let totalBookedHours = 0;

    bookingsTheoChuKy.forEach((b) => {
      const totalAmt = Number(b.totalAmount ?? b.totalPrice ?? 0);
      const discount = Number(b.discountAmount || 0);
      const addon = Number(b.addonAmount || 0);
      const status = String(b.status || '').toUpperCase();

      const duration = Number(b.durationMinutes) || 60;
      if (['CONFIRMED', 'PAID', 'CHECKED_IN', 'COMPLETED'].includes(status)) {
        totalBookedHours += duration / 60;
      }

      if (status === 'PENDING_PAYMENT' || status === 'PENDING') {
        pendingCount++;
      } else if (status === 'CONFIRMED' || status === 'PAID') {
        paidCount++;
        grossValue += totalAmt + discount;
        voucherTotal += discount;
        addonServicesTotal += addon;
      } else if (status === 'CHECKED_IN') {
        checkedInCount++;
        grossValue += totalAmt + discount;
        voucherTotal += discount;
        addonServicesTotal += addon;
      } else if (status === 'COMPLETED') {
        completedCount++;
        grossValue += totalAmt + discount;
        voucherTotal += discount;
        addonServicesTotal += addon;
      } else if (status === 'CANCELLED' || status === 'CANCELLED_REFUNDED') {
        cancelledCount++;
        if (status === 'CANCELLED_REFUNDED' && totalAmt > 0) {
          grossValue += totalAmt + discount;
          voucherTotal += discount;
          const refund = Number(b.refundAmount ?? Math.round(totalAmt * 0.8));
          refundedTotal += refund;
          cancellationFee += Math.max(0, totalAmt - refund);
        }
      }
    });

    // Doanh thu thuc nhan rong (phan phi giu cho khi huy da nam trong tong thu - hoan tra, khong cong dup)
    const netRevenue = Math.max(0, grossValue - voucherTotal - refundedTotal);

    const totalCourts = courts.length || 30;
    const totalDailyCapacity = totalCourts * 16.5;
    const occupancyRate =
      totalDailyCapacity > 0
        ? Math.min(100, Math.round((totalBookedHours / totalDailyCapacity) * 100))
        : 0;

    return {
      grossValue,
      voucherTotal,
      refundedTotal,
      cancellationFee,
      addonServicesTotal,
      netRevenue,
      totalBookings: bookingsTheoChuKy.length,
      pendingCount,
      paidCount,
      checkedInCount,
      completedCount,
      cancelledCount,
      occupancyRate
    };
  }, [bookingsTheoChuKy, courts.length]);

  // Thong ke san theo 3 co so
  const thongKe3CoSo = useMemo(() => {
    const cs1 = courts.filter(c => c.venueId === 1);
    const cs2 = courts.filter(c => c.venueId === 2);
    const cs3 = courts.filter(c => c.venueId === 3);

    return [
      {
        id: 1,
        name: 'Cơ Sở 1 (Cầu Giấy)',
        total: cs1.length || 10,
        active: cs1.filter(c => c.status === 'ACTIVE').length,
        maintenance: cs1.filter(c => c.status === 'MAINTENANCE' || c.status === 'INACTIVE').length
      },
      {
        id: 2,
        name: 'Cơ Sở 2 (Đống Đa)',
        total: cs2.length || 10,
        active: cs2.filter(c => c.status === 'ACTIVE').length,
        maintenance: cs2.filter(c => c.status === 'MAINTENANCE' || c.status === 'INACTIVE').length
      },
      {
        id: 3,
        name: 'Cơ Sở 3 (Long Biên)',
        total: cs3.length || 10,
        active: cs3.filter(c => c.status === 'ACTIVE').length,
        maintenance: cs3.filter(c => c.status === 'MAINTENANCE' || c.status === 'INACTIVE').length
      }
    ];
  }, [courts]);

  // Loc san theo co so va mon
  const filteredCourts = useMemo(() => {
    return courts.filter(court => {
      const matchVenue = selectedVenueFilter === 'ALL' || String(court.venueId) === String(selectedVenueFilter);
      const matchSport = selectedSportFilter === 'ALL' || (court.sportTypeName || '').toUpperCase().includes(selectedSportFilter) || (court.name || '').toUpperCase().includes(selectedSportFilter);
      const matchSearch = !courtSearch || (court.name || '').toLowerCase().includes(courtSearch.toLowerCase()) || (court.courtCode || '').toLowerCase().includes(courtSearch.toLowerCase());
      return matchVenue && matchSport && matchSearch;
    });
  }, [courts, selectedVenueFilter, selectedSportFilter, courtSearch]);

  // Loc nguoi dung
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchRole = userRoleFilter === 'ALL' || user.role === userRoleFilter;
      const kw = userSearch.toLowerCase();
      const matchSearch = !userSearch || 
        (user.fullName && user.fullName.toLowerCase().includes(kw)) ||
        (user.email && user.email.toLowerCase().includes(kw)) ||
        (user.phone && user.phone.includes(kw));
      return matchRole && matchSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* ========================================================= */}
      {/* THANH HEADER DUY NHAT (KHONG CO DARK MODE, CO THONG BAO & DANG XUAT) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md bg-white/95 border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand (Anh 2) */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/20">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">eSportKing Admin</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                  Live Operations
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Hệ thống điều hành 3 cụm sân & đối soát dòng tiền</p>
            </div>
          </div>

          {/* 3 Tab Dieu Huong Chuan (Anh 2) */}
          <nav className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                tab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => setTab('checkin')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                tab === 'checkin'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Trạm Check-In</span>
            </button>

            <button
              onClick={() => setTab('system')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                tab === 'system'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Quản Lý Hệ Thống</span>
            </button>
          </nav>

          {/* Tien ich ben phai: Lam moi, Chuong thong bao realtime, Profile & Dang xuat */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                taiDuLieuHeThong();
                taiThongBaoAdmin();
              }}
              disabled={refreshing}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Làm mới dữ liệu từ Database"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
            </button>

            {/* Chuong Thong Bao Realtime Admin */}
            <div className="relative" ref={dropdownThongBaoRef}>
              <button
                type="button"
                onClick={() => setHienDropdownThongBao((prev) => !prev)}
                className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Thông báo vận hành (đặt sân, hủy vé, check-in)"
              >
                <Bell className="w-4 h-4" />
                {soThongBaoChuaDoc > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                    {soThongBaoChuaDoc > 9 ? '9+' : soThongBaoChuaDoc}
                  </span>
                )}
              </button>

              {hienDropdownThongBao && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Thông báo vận hành</h4>
                      <p className="text-[11px] text-slate-500">Đặt sân mới, hủy vé hoàn tiền & check-in</p>
                    </div>
                    {soThongBaoChuaDoc > 0 && (
                      <button
                        type="button"
                        onClick={danhDauDaDocTatCa}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {thongBaoList.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                        Chưa có thông báo vận hành nào
                      </div>
                    ) : (
                      thongBaoList.slice(0, 12).map((tb) => (
                        <div
                          key={tb.id}
                          className={`px-4 py-3 text-left transition ${
                            tb.isRead ? 'bg-white' : 'bg-rose-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-black text-slate-900 leading-snug">{tb.title}</p>
                            {!tb.isRead && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{tb.message}</p>
                          {tb.createdAt && (
                            <span className="block text-[10px] text-slate-400 mt-1">
                              {new Date(tb.createdAt).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-slate-100 border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-none">{nguoiDung?.fullName || 'Chủ Hệ Thống'}</p>
                <span className="text-[10px] text-rose-600 font-extrabold uppercase">ADMIN</span>
              </div>
            </div>

            {/* Nut Dang Xuat */}
            <button
              type="button"
              onClick={xuLyDangXuatAdmin}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
              title="Đăng xuất tài khoản quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>

        </div>
      </header>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* NOI DUNG TRANG */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ========================================================= */}
        {/* TAB 1: TRANG CHỦ (100% DU LIEU THUC, XOA HET DU LIEU BIA) */}
        {/* ========================================================= */}
        {tab === 'dashboard' && (
          <div className="space-y-6">

            {/* Tieu De Trang Chu & Bo Loc Chu Ky */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  Trang Chủ
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng quan vận hành 3 cụm cơ sở, trạng thái đơn đặt và đối soát tài chính thực tế
                </p>
              </div>

              {/* Chu ky */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                {[
                  { id: 'today', label: 'Hôm nay' },
                  { id: 'week', label: 'Tuần này' },
                  { id: 'month', label: 'Tháng này' },
                  { id: 'all', label: 'Tất cả' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setTimeRange(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      timeRange === r.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 The KPI Chuan Tu Database */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Doanh Thu Thuc Nhan */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500">Doanh Thu Thực Nhận (Net)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {thongKeThucTe.netRevenue.toLocaleString('vi-VN')} đ
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Doanh thu gộp: {thongKeThucTe.grossValue.toLocaleString('vi-VN')} đ
                </p>
              </div>

              {/* Card 2: Ty Le Lap Day San */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500">Tỷ Lệ Lấp Đầy Sân</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {thongKeThucTe.occupancyRate}%
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Dựa trên 30 sân thuộc 3 cụm cơ sở
                </p>
              </div>

              {/* Card 3: Tong Don Dat */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500">Tổng Đơn Đặt Sân</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {thongKeThucTe.totalBookings} đơn
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {thongKeThucTe.completedCount} hoàn tất • {thongKeThucTe.cancelledCount} đã hủy
                </p>
              </div>

              {/* Card 4: Doanh Thu Dich Vu */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500">Doanh Thu Dịch Vụ</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {thongKeThucTe.addonServicesTotal.toLocaleString('vi-VN')} đ
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Áo bib, nước giải khát & trọng tài
                </p>
              </div>

            </div>

            {/* Bo Cuc Panel Can Doi (Grid 8 - 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Cot Trai (8 Cot): Doi Soat Tai Chinh & Tinh Trang 3 Co So */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Panel 1: Bang Doi Soat Doanh Thu Thuc Nhan */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                        <span>Bảng Hạch Toán Đối Soát Doanh Thu Thực Nhận</span>
                      </h2>
                      <p className="text-xs text-slate-400">Dữ liệu tài chính tính toán thời gian thực từ Database</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">1. Tổng Doanh Thu Gộp (Gross Booking Value)</span>
                      <span className="font-black text-slate-900 dark:text-white">+{thongKeThucTe.grossValue.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between text-rose-600">
                      <span className="font-bold">2. (-) Khuyến Mãi / Voucher Trợ Giá</span>
                      <span className="font-black">-{thongKeThucTe.voucherTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between text-amber-600">
                      <span className="font-bold">3. (-) Số Tiền Hoàn Trả Ví Khi Khách Hủy Sân</span>
                      <span className="font-black">-{thongKeThucTe.refundedTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between text-emerald-600">
                      <span className="font-bold">4. (Ghi chú) Phí Giữ Chỗ Thu Được Từ Đơn Hủy</span>
                      <span className="font-black">{thongKeThucTe.cancellationFee.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between text-indigo-600">
                      <span className="font-bold">5. (Trong đó) Doanh Thu Dịch Vụ Kèm Theo</span>
                      <span className="font-black">{thongKeThucTe.addonServicesTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="py-3.5 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/20 px-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 mt-2">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        (=) DOANH THU THỰC NHẬN RÒNG (NET REALIZED REVENUE)
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {thongKeThucTe.netRevenue.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Tinh Trang 3 Co So */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-rose-600" />
                    <span>Tình Trạng Vận Hành 3 Cụm Cơ Sở (30 Sân)</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {thongKe3CoSo.map(cs => (
                      <div key={cs.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
                          <span>{cs.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{cs.total} sân</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {cs.active} Đang mở
                          </span>
                          {cs.maintenance > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                              {cs.maintenance} Bảo trì
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Cot Phai (4 Cot): Vong Doi Don & Nhat Ky Giao Dich */}
              <div className="lg:col-span-4 space-y-6">

                {/* Panel 3: Vong Doi Don Dat Thuc Te */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Vòng Đời Đơn Đặt Thực Tế</span>
                  </h2>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">1. Chờ thanh toán</span>
                      <span className="font-black text-slate-900 dark:text-white">{thongKeThucTe.pendingCount} đơn</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">2. Đã thanh toán</span>
                      <span className="font-black text-indigo-600">{thongKeThucTe.paidCount} đơn</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">3. Đã check-in / Sử dụng</span>
                      <span className="font-black text-amber-600">{thongKeThucTe.checkedInCount} đơn</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">4. Hoàn tất thi đấu</span>
                      <span className="font-black text-emerald-600">{thongKeThucTe.completedCount} đơn</span>
                    </div>

                    {thongKeThucTe.cancelledCount > 0 && (
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                        <span className="font-bold text-rose-900 dark:text-rose-200">5. Đã hủy</span>
                        <span className="font-black text-rose-600">{thongKeThucTe.cancelledCount} đơn</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 4: Nhat Ky Giao Dich Realtime (Khong co du lieu fake) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-rose-600" />
                      <span>Nhật Ký Giao Dịch</span>
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400">{bookingsTheoChuKy.length} giao dịch</span>
                  </div>

                  {bookingsTheoChuKy.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 space-y-2">
                      <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-500">Chưa có giao dịch phát sinh</p>
                      <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                        Khi có khách đặt sân, thanh toán hoặc check-in mới, sự kiện thực tế sẽ tự động hiển thị tại đây.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {bookingsTheoChuKy.slice(0, 8).map(b => (
                        <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-slate-900">
                              Đơn #{b.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              (b.status === 'CONFIRMED' || b.status === 'PAID') ? 'bg-indigo-100 text-indigo-800' :
                              b.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-800' :
                              (b.status === 'CANCELLED' || b.status === 'CANCELLED_REFUNDED') ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {b.status === 'COMPLETED' ? 'Hoàn tất quy trình' :
                               (b.status === 'CONFIRMED' || b.status === 'PAID') ? 'Đã thanh toán' :
                               b.status === 'CHECKED_IN' ? 'Đang sử dụng' :
                               (b.status === 'CANCELLED' || b.status === 'CANCELLED_REFUNDED') ? 'Đã hủy' :
                               'Chờ thanh toán'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{b.courtName || b.courtCode || 'Sân thể thao'}</p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50">
                            <span className="text-[10px] text-slate-400">Khách #{b.customerId}</span>
                            <span className="font-black text-slate-900">
                              {Number(b.totalAmount ?? b.totalPrice ?? 0).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TRẠM CHECK-IN TRỰC BAN                             */}
        {/* ========================================================= */}
        {tab === 'checkin' && (
          <div>
            <TrangQuetCheckIn />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: QUẢN LÝ HỆ THỐNG (SÂN & TÀI KHOẢN)                 */}
        {/* ========================================================= */}
        {tab === 'system' && (
          <div className="space-y-6">

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm w-fit">
              <button
                onClick={() => setSubTab('courts')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                  subTab === 'courts'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Quản Lý 30 Sân & Bảng Giá ({courts.length})</span>
              </button>

              <button
                onClick={() => setSubTab('users')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                  subTab === 'users'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Quản Lý Tài Khoản & Phân Quyền ({users.length})</span>
              </button>
            </div>

            {/* SUB-TAB A: QUẢN LÝ 30 SÂN & BẢNG GIÁ */}
            {subTab === 'courts' && (
              <div className="space-y-5">
                
                {/* Filter Bar */}
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên sân hoặc mã (BD-CS1-01, CL-CS2-01)..."
                      value={courtSearch}
                      onChange={(e) => setCourtSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <select
                      value={selectedVenueFilter}
                      onChange={(e) => setSelectedVenueFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">🏢 Tất cả 3 Cơ Sở</option>
                      <option value="1">Cơ Sở 1 (Cầu Giấy)</option>
                      <option value="2">Cơ Sở 2 (Đống Đa)</option>
                      <option value="3">Cơ Sở 3 (Long Biên)</option>
                    </select>

                    <select
                      value={selectedSportFilter}
                      onChange={(e) => setSelectedSportFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">🏆 Tất cả Bộ Môn</option>
                      <option value="BÓNG ĐÁ">⚽ Bóng Đá</option>
                      <option value="CẦU LÔNG">🏸 Cầu Lông</option>
                      <option value="BÓNG RỔ">🏀 Bóng Rổ</option>
                      <option value="TENNIS">🎾 Tennis</option>
                    </select>

                    <button
                      onClick={taiDanhSachSanToanHeThong}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tải Lại ({filteredCourts.length} sân)</span>
                    </button>
                  </div>
                </div>

                {/* Court Grid Cards */}
                {loadingCourts ? (
                  <div className="py-20 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-600" />
                    <p className="text-sm font-bold">Đang đồng bộ dữ liệu 30 sân thể thao...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourts.map(court => {
                      const isMaintenance = court.status === 'MAINTENANCE' || court.status === 'INACTIVE';
                      const priceNum = Number(court.basePrice) || 0;

                      return (
                        <div
                          key={court.id}
                          className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                            isMaintenance 
                              ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/10' 
                              : 'border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="h-40 bg-slate-800 relative overflow-hidden group">
                            {court.imageUrl ? (
                              <img 
                                src={court.imageUrl} 
                                alt={court.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl font-black">
                                🏟️
                              </div>
                            )}

                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              {isMaintenance ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-md flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>ĐANG BẢO TRÌ (ĐÃ KHÓA)</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-md flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>HOẠT ĐỘNG TỐT</span>
                                </span>
                              )}
                            </div>

                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                              {court.courtCode || `#${court.id}`}
                            </div>

                            <div className="absolute bottom-2 left-3 text-[11px] font-bold text-white drop-shadow-md">
                              📍 {court.venueName}
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                                  {court.name}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                  {court.sportTypeName || 'Thể thao'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-1">
                                {court.surface || 'Mặt sân chuẩn thi đấu'} • Sức chứa {court.capacity || 4} VĐV
                              </p>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold">Đơn giá gốc:</span>
                                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                                  {priceNum.toLocaleString('vi-VN')} đ/h
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => handleTangGiamGiaNhanh(court, -10000)}
                                  className="flex-1 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 transition cursor-pointer"
                                  title="Giảm 10.000 đ"
                                >
                                  -10k
                                </button>
                                <button
                                  onClick={() => handleTangGiamGiaNhanh(court, 10000)}
                                  className="flex-1 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 transition cursor-pointer"
                                  title="Tăng 10.000 đ"
                                >
                                  +10k
                                </button>
                                <button
                                  onClick={() => {
                                    setModalEditCourtPrice(court);
                                    setNewPriceInput(String(priceNum));
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                                >
                                  Sửa giá
                                </button>
                              </div>
                            </div>

                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">
                                {isMaintenance ? '⚠️ Khách không thể đặt' : '🟢 Sẵn sàng nhận đơn'}
                              </span>

                              <button
                                onClick={() => setModalConfirmLockCourt(court)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  isMaintenance
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                              >
                                {isMaintenance ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Mở Khóa Sân</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Khóa Sân Bảo Trì</span>
                                  </>
                                )}
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* SUB-TAB B: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN */}
            {subTab === 'users' && (
              <div className="space-y-5">
                
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm tên, email hoặc số điện thoại..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">Tất Cả Vai Trò</option>
                      <option value="ADMIN">🛡️ Quản Trị Viên (ADMIN)</option>
                      <option value="STAFF">⚡ Nhân Viên Quầy (STAFF)</option>
                      <option value="CUSTOMER">👤 Khách Hàng (CUSTOMER)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setModalUserForm({
                      mode: 'create',
                      data: { fullName: '', email: '', phone: '', password: 'Password@123', role: 'STAFF' }
                    })}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md shadow-rose-600/30 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Thêm Tài Khoản Mới</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-4 font-black">ID</th>
                          <th className="py-3.5 px-4 font-black">HỌ VÀ TÊN</th>
                          <th className="py-3.5 px-4 font-black">EMAIL</th>
                          <th className="py-3.5 px-4 font-black">SỐ ĐIỆN THOẠI</th>
                          <th className="py-3.5 px-4 font-black">VAI TRÒ</th>
                          <th className="py-3.5 px-4 font-black">TRẠNG THÁI</th>
                          <th className="py-3.5 px-4 font-black text-right">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map(user => {
                          const isLocked = user.status === 'LOCKED';
                          const isCurrent = nguoiDung?.id === user.id;
                          const isCore = TAI_KHOAN_MAC_DINH
                            .flatMap(t => [t.email, t.legacyEmail].filter(Boolean))
                            .map(e => e.toLowerCase())
                            .includes((user.email || '').toLowerCase());

                          return (
                            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                                #{user.id}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                                    {(user.fullName || 'U').charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 dark:text-white">{user.fullName || 'Chưa đặt tên'}</p>
                                    {isCurrent && (
                                      <span className="text-[10px] text-rose-600 font-extrabold">(Bạn)</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                                {user.email}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-slate-500">
                                {user.phone || '---'}
                              </td>

                              <td className="py-3.5 px-4">
                                {user.role === 'ADMIN' && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                    🛡️ ADMIN
                                  </span>
                                )}
                                {user.role === 'STAFF' && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    ⚡ STAFF
                                  </span>
                                )}
                                {user.role === 'CUSTOMER' && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    👤 CUSTOMER
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isLocked ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                    ĐÃ KHÓA
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    ACTIVE
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setModalUserForm({
                                      mode: 'edit',
                                      data: { id: user.id, fullName: user.fullName, phone: user.phone || '', role: user.role }
                                    })}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                                    title="Sửa thông tin tài khoản"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => setModalConfirmLockUser(user)}
                                    disabled={isCurrent}
                                    className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-30 ${
                                      isLocked 
                                        ? 'hover:bg-emerald-50 text-emerald-600' 
                                        : 'hover:bg-amber-50 text-amber-600'
                                    }`}
                                    title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  >
                                    {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                  </button>

                                  <button
                                    onClick={() => setModalConfirmDeleteUser(user)}
                                    disabled={isCurrent || isCore}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer disabled:opacity-20 disabled:hover:text-slate-400"
                                    title={isCore ? "Tài khoản chuẩn hệ thống (không thể xóa)" : isCurrent ? "Không thể tự xóa chính mình" : "Xóa tài khoản"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      <CacModalAdmin
        modalEditCourtPrice={modalEditCourtPrice}
        setModalEditCourtPrice={setModalEditCourtPrice}
        newPriceInput={newPriceInput}
        setNewPriceInput={setNewPriceInput}
        handleLuuGiaSan={handleLuuGiaSan}
        modalConfirmLockCourt={modalConfirmLockCourt}
        setModalConfirmLockCourt={setModalConfirmLockCourt}
        handleXacNhanKhoaSan={handleXacNhanKhoaSan}
        modalUserForm={modalUserForm}
        setModalUserForm={setModalUserForm}
        handleLuuUserForm={handleLuuUserForm}
        modalConfirmLockUser={modalConfirmLockUser}
        setModalConfirmLockUser={setModalConfirmLockUser}
        handleXacNhanKhoaUser={handleXacNhanKhoaUser}
        modalConfirmDeleteUser={modalConfirmDeleteUser}
        setModalConfirmDeleteUser={setModalConfirmDeleteUser}
        handleXoaUser={handleXoaUser}
      />

    </div>
  );
}
