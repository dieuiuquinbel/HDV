/**
 * File: thongBao.js
 * Muc dich: Kênh phat Toast thong bao dung chung toan ung dung, thay the hoan toan window.alert().
 */
export const TOAST_EVENT = 'esportking_toast';

export function hienToast(noiDung, loai = 'info', thoiLuong = 3800) {
  if (!noiDung || typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        noiDung: String(noiDung),
        loai,
        thoiLuong
      }
    })
  );
}
