/**
 * File: thoiGianSan.js
 * Muc dich: Tien ich khung gio dat san va kiem tra gio qua khu dung chung.
 */
export const DANH_SACH_KHUNG_GIO = [
  { value: '06:00:00', label: '06:00 (Sáng sớm - Thể dục)' },
  { value: '07:00:00', label: '07:00 (Buổi sáng)' },
  { value: '08:00:00', label: '08:00 (Buổi sáng)' },
  { value: '09:00:00', label: '09:00 (Buổi sáng)' },
  { value: '10:00:00', label: '10:00 (Buổi trưa)' },
  { value: '14:00:00', label: '14:00 (Đầu giờ chiều)' },
  { value: '15:00:00', label: '15:00 (Buổi chiều)' },
  { value: '16:00:00', label: '16:00 (Chiều mát)' },
  { value: '17:00:00', label: '17:00 (Chiều muộn 🔥)' },
  { value: '18:00:00', label: '18:00 (Tối vàng 🔥 Hot nhất)' },
  { value: '19:00:00', label: '19:00 (Tối vàng 🔥 Hot nhất)' },
  { value: '20:00:00', label: '20:00 (Buổi tối)' },
  { value: '21:00:00', label: '21:00 (Đêm muộn)' }
];

export function layNgayTheoOffset(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const nam = d.getFullYear();
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return `${nam}-${thang}-${ngay}`;
}

export function kiemTraGioQuaKhu(dateStr, timeStr) {
  const homNay = layNgayTheoOffset(0);
  if (dateStr !== homNay) return false;
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  return slotDate.getTime() - now.getTime() < 15 * 60 * 1000;
}
