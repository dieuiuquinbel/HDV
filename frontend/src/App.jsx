/**
 * File: App.jsx
 * Muc dich: Thanh phan goc cua ung dung React quan ly Route va phien dang nhap toan cuc.
 * Chuc nang: Khoi tao CSRF cookie, kiem tra phien dang nhap va dieu huong cac trang theo phong cach DieuBel/SportBooking.
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiDichVu } from './dichvu/api';

import ThanhDieuHuong from './thanhphan/ThanhDieuHuong';
import TrangChu from './trang/TrangChu';
import TrangTimSan from './trang/TrangTimSan';
import TrangChiTietSan from './trang/TrangChiTietSan';
import TrangThanhToan from './trang/TrangThanhToan';
import TrangVeCuaToi from './trang/TrangVeCuaToi';
import TrangDangNhapDangKy from './trang/TrangDangNhapDangKy';
import TrangHoSoCaNhan from './trang/TrangHoSoCaNhan';
import TrangQuetCheckIn from './trang/TrangQuetCheckIn';
import TrangQuanLySanChu from './trang/TrangQuanLySanChu';
import TrangQuanTriAdmin from './trang/TrangQuanTriAdmin';
import NutGoiDichVuFAB from './thanhphan/NutGoiDichVuFAB';

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

        <main className="flex-1">
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

            {/* Quet ma QR Check-in (chi STAFF / ADMIN / OWNER) */}
            <Route
              path="/checkin"
              element={
                ['STAFF', 'ADMIN', 'OWNER'].includes(nguoiDung?.role)
                  ? <TrangQuetCheckIn user={nguoiDung} />
                  : <Navigate to="/" replace />
              }
            />

            {/* Quan tri Admin & Chu san */}
            <Route
              path="/admin"
              element={
                nguoiDung?.role === 'ADMIN'
                  ? <TrangQuanTriAdmin nguoiDung={nguoiDung} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/quan-tri-admin"
              element={
                nguoiDung?.role === 'ADMIN'
                  ? <TrangQuanTriAdmin nguoiDung={nguoiDung} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/owner"
              element={
                ['OWNER', 'ADMIN'].includes(nguoiDung?.role)
                  ? <TrangQuanLySanChu nguoiDung={nguoiDung} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/quan-ly-san"
              element={
                ['OWNER', 'ADMIN'].includes(nguoiDung?.role)
                  ? <TrangQuanLySanChu nguoiDung={nguoiDung} />
                  : <Navigate to="/" replace />
              }
            />
          </Routes>
        </main>
        {/* Nut noi Kiosk tiep te do an & nuoc uong FAB (chi hien thi cho khach hang) */}
        {(!nguoiDung || nguoiDung.role === 'CUSTOMER') && <NutGoiDichVuFAB user={nguoiDung} />}
      </div>
    </BrowserRouter>
  );
}
