/**
 * File: App.jsx
 * Muc dich: Thanh phan goc cua ung dung React quan ly Route va phien dang nhap toan cuc.
 * Chuc nang: Khoi tao CSRF cookie, kiem tra phien dang nhap va dieu huong cac trang theo phong cach DieuBel/SportBooking.
 */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiDichVu } from './dichvu/api';

import ThanhDieuHuong from './thanhphan/ThanhDieuHuong';
import ToastThongBao from './thanhphan/ToastThongBao';

const TrangChu = lazy(() => import('./trang/TrangChu'));
const TrangTimSan = lazy(() => import('./trang/TrangTimSan'));
const TrangChiTietSan = lazy(() => import('./trang/TrangChiTietSan'));
const TrangThanhToan = lazy(() => import('./trang/TrangThanhToan'));
const TrangVeCuaToi = lazy(() => import('./trang/TrangVeCuaToi'));
const TrangDangNhapDangKy = lazy(() => import('./trang/TrangDangNhapDangKy'));
const TrangHoSoCaNhan = lazy(() => import('./trang/TrangHoSoCaNhan'));
const TrangQuetCheckIn = lazy(() => import('./trang/TrangQuetCheckIn'));
const TrangQuanTriAdmin = lazy(() => import('./trang/TrangQuanTriAdmin'));
const NutGoiDichVuFAB = lazy(() => import('./thanhphan/NutGoiDichVuFAB'));

function ManHinhDangTai() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-semibold text-xs">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <span>Đang tải trang...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [nguoiDung, setNguoiDung] = useState(() => {
    try {
      const saved = localStorage.getItem('esportking_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [dangKhoiDong, setDangKhoiDong] = useState(() => {
    return !localStorage.getItem('esportking_user');
  });

  const capNhatNguoiDung = (user) => {
    setNguoiDung(user);
    try {
      if (user) {
        localStorage.setItem('esportking_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('esportking_user');
      }
    } catch {}
  };

  useEffect(() => {
    const khoiTaoPhien = async () => {
      try {
        await apiDichVu.layCsrf();
        const res = await apiDichVu.layThongTinToi();
        if (res.data) {
          capNhatNguoiDung(res.data);
        }
      } catch (e) {
        // Nếu token hết hạn hoặc không hợp lệ (401/403), xóa sạch phiên đăng nhập đã lưu trong localStorage
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          console.warn('Phiên đăng nhập đã hết hạn, tự động đăng xuất:', e);
          capNhatNguoiDung(null);
        } else {
          console.warn('Lỗi mạng hoặc dịch vụ khi xác thực phiên, giữ phiên tạm thời:', e);
        }
      } finally {
        setDangKhoiDong(false);
      }
    };
    khoiTaoPhien();
  }, []);

  const xuLyDangXuat = async () => {
    try {
      await apiDichVu.dangXuat();
    } catch (e) {
      console.error(e);
    }
    capNhatNguoiDung(null);
    window.location.href = '/';
  };

  if (dangKhoiDong) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf7f5] text-slate-500 font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span>Đang kết nối hệ thống ESportKing...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#fbf7f5] text-[#241f21]">
        <ThanhDieuHuong user={nguoiDung} onDangXuat={xuLyDangXuat} />
        <ToastThongBao />

        <main className="flex-1">
          <Suspense fallback={<ManHinhDangTai />}>
            <Routes>
            {/* Trang chu & Tim san */}
            <Route path="/" element={<TrangChu user={nguoiDung} />} />
            <Route path="/tim-san" element={<TrangTimSan user={nguoiDung} />} />
            <Route path="/tim-kiem" element={<TrangTimSan user={nguoiDung} />} />
            <Route path="/courts" element={<TrangTimSan user={nguoiDung} />} />

            {/* Chi tiet san dau */}
            <Route path="/venue/:id" element={<TrangChiTietSan user={nguoiDung} />} />
            <Route path="/san/:id" element={<TrangChiTietSan user={nguoiDung} />} />

            {/* Thanh toan */}
            <Route path="/thanh-toan" element={<TrangThanhToan user={nguoiDung} />} />
            <Route path="/thanh-toan/:bookingId" element={<TrangThanhToan user={nguoiDung} />} />

            {/* Dat san cua toi va lich dat rieng biet */}
            <Route path="/ve-cua-toi" element={<TrangVeCuaToi user={nguoiDung} />} />
            <Route path="/dat-san-cua-toi" element={<Navigate to="/ve-cua-toi" replace />} />
            <Route path="/dat-ve-cua-toi" element={<Navigate to="/ve-cua-toi" replace />} />
            <Route path="/don-dat-cua-toi" element={<Navigate to="/ve-cua-toi" replace />} />
            <Route path="/lich-dat" element={<Navigate to="/ve-cua-toi" replace />} />

            {/* Xac thuc (Dang nhap / Dang ky) */}
            <Route path="/login" element={<TrangDangNhapDangKy onDangNhapThanhCong={capNhatNguoiDung} />} />
            <Route path="/register" element={<TrangDangNhapDangKy onDangNhapThanhCong={capNhatNguoiDung} />} />
            <Route path="/dang-nhap" element={<TrangDangNhapDangKy onDangNhapThanhCong={capNhatNguoiDung} />} />
            <Route path="/dang-ky" element={<TrangDangNhapDangKy onDangNhapThanhCong={capNhatNguoiDung} />} />

            {/* Dashboard ca nhan (/me - Tab "Toi") */}
            <Route path="/me" element={<TrangHoSoCaNhan user={nguoiDung} onDangXuat={xuLyDangXuat} />} />

            {/* Quet ma QR Check-in (chi STAFF / ADMIN) */}
            <Route
              path="/checkin"
              element={
                ['STAFF', 'ADMIN'].includes(nguoiDung?.role)
                  ? <TrangQuetCheckIn user={nguoiDung} />
                  : <Navigate to="/" replace />
              }
            />

            {/* Quan tri Admin (chuyen huong /owner, /quan-ly-san -> /admin) */}
            <Route
              path="/admin"
              element={
                nguoiDung?.role === 'ADMIN'
                  ? <TrangQuanTriAdmin nguoiDung={nguoiDung} onDangXuat={xuLyDangXuat} />
                  : <Navigate to="/" replace />
              }
            />
            <Route path="/quan-tri-admin" element={<Navigate to="/admin" replace />} />
            <Route path="/owner" element={<Navigate to="/admin" replace />} />
            <Route path="/quan-ly-san" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </main>
        {/* Nut noi Kiosk tiep te do an & nuoc uong FAB (chi hien thi cho khach hang) */}
        {(!nguoiDung || nguoiDung.role === 'CUSTOMER') && (
          <Suspense fallback={null}>
            <NutGoiDichVuFAB user={nguoiDung} />
          </Suspense>
        )}
      </div>
    </BrowserRouter>
  );
}
