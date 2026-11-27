/**
 * File: CacModalAdmin.jsx
 * Muc dich: Gom 5 modal thao tac cua trang Quan tri Admin (sua gia san, khoa san, them/sua user, khoa user, xoa user).
 */
import React from 'react';
import { AlertTriangle, Lock, Trash2, X } from 'lucide-react';

export default function CacModalAdmin({
  modalEditCourtPrice,
  setModalEditCourtPrice,
  newPriceInput,
  setNewPriceInput,
  handleLuuGiaSan,
  modalConfirmLockCourt,
  setModalConfirmLockCourt,
  handleXacNhanKhoaSan,
  modalUserForm,
  setModalUserForm,
  handleLuuUserForm,
  modalConfirmLockUser,
  setModalConfirmLockUser,
  handleXacNhanKhoaUser,
  modalConfirmDeleteUser,
  setModalConfirmDeleteUser,
  handleXoaUser
}) {
  return (
    <>
      {/* Modal Chinh Sua Gia San */}
      {modalEditCourtPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
              Chỉnh Sửa Giá Thuê Sân
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sân: <strong className="text-slate-800 dark:text-slate-200">{modalEditCourtPrice.name}</strong> ({modalEditCourtPrice.courtCode})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Đơn giá mới (VNĐ / giờ):
                </label>
                <input
                  type="number"
                  step="10000"
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditCourtPrice(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleLuuGiaSan}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 transition cursor-pointer"
                >
                  Lưu Giá Mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xac Nhan Khoa / Mo Khoa San */}
      {modalConfirmLockCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              {modalConfirmLockCourt.status === 'ACTIVE' ? 'Xác Nhận Khóa Sân?' : 'Mở Khóa Hoạt Động Sân?'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {modalConfirmLockCourt.status === 'ACTIVE'
                ? `Khóa sân [${modalConfirmLockCourt.name}] sẽ chuyển trạng thái sang Bảo trì. Phía giao diện khách hàng sẽ hiển thị nhãn bảo trì và chặn đặt slot.`
                : `Sân [${modalConfirmLockCourt.name}] sẽ mở lại cho khách hàng đặt slot bình thường.`
              }
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalConfirmLockCourt(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleXacNhanKhoaSan}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Them / Sua Nguoi Dung */}
      {modalUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {modalUserForm.mode === 'create' ? 'Tạo Tài Khoản Mới' : 'Cập Nhật Thông Tin Tài Khoản'}
              </h3>
              <button
                onClick={() => setModalUserForm(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLuuUserForm} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={modalUserForm.data.fullName || ''}
                  onChange={(e) => setModalUserForm({
                    ...modalUserForm,
                    data: { ...modalUserForm.data, fullName: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {modalUserForm.mode === 'create' && (
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Email / Tên đăng nhập *</label>
                  <input
                    type="text"
                    required
                    value={modalUserForm.data.email || ''}
                    onChange={(e) => setModalUserForm({
                      ...modalUserForm,
                      data: { ...modalUserForm.data, email: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={modalUserForm.data.phone || ''}
                  onChange={(e) => setModalUserForm({
                    ...modalUserForm,
                    data: { ...modalUserForm.data, phone: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {modalUserForm.mode === 'create' && (
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Mật khẩu khởi tạo</label>
                  <input
                    type="password"
                    placeholder="Mặc định: 123456"
                    value={modalUserForm.data.password || ''}
                    onChange={(e) => setModalUserForm({
                      ...modalUserForm,
                      data: { ...modalUserForm.data, password: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Phân quyền vai trò</label>
                <select
                  value={modalUserForm.data.role || 'CUSTOMER'}
                  onChange={(e) => setModalUserForm({
                    ...modalUserForm,
                    data: { ...modalUserForm.data, role: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="CUSTOMER">👤 CUSTOMER (Khách Hàng Đặt Sân)</option>
                  <option value="STAFF">⚡ STAFF (Nhân Viên Trực Ban Quầy)</option>
                  <option value="ADMIN">🛡️ ADMIN (Quản Trị Viên Hệ Thống)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalUserForm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/30 transition cursor-pointer"
                >
                  {modalUserForm.mode === 'create' ? 'Tạo Tài Khoản' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xac Nhan Khoa / Mo Khoa User */}
      {modalConfirmLockUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              {modalConfirmLockUser.status === 'ACTIVE' ? 'Khóa Tài Khoản Này?' : 'Mở Khóa Tài Khoản?'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Tài khoản: <strong>{modalConfirmLockUser.email}</strong>
              <br />
              {modalConfirmLockUser.status === 'ACTIVE'
                ? 'Người dùng này sẽ không thể đăng nhập và mọi phiên làm việc hiện tại sẽ bị hủy ngay.'
                : 'Người dùng sẽ có thể đăng nhập lại bình thường.'
              }
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalConfirmLockUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleXacNhanKhoaUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xac Nhan Xoa User */}
      {modalConfirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Xóa Vĩnh Viễn Tài Khoản?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{modalConfirmDeleteUser.email}</strong>? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalConfirmDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleXoaUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
