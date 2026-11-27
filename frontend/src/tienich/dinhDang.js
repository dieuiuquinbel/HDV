/**
 * File: dinhDang.js
 * Muc dich: Cac ham tien ich dung chung (DRY): format tien VND, sinh ma QR Data URL va phat am bao Web Audio API.
 */
import QRCode from 'qrcode';

export function dinhDangTien(soTien, donVi = 'đ') {
  const num = Number(soTien || 0);
  return `${num.toLocaleString('vi-VN')} ${donVi}`;
}

export async function taoAnhQr(noiDung, width = 300, margin = 1) {
  if (!noiDung) return '';
  return QRCode.toDataURL(noiDung, {
    width,
    margin,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}

export function phatChuongThongBao(tanSo = 1046.5, thoiLuong = 0.8) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(tanSo, now);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + thoiLuong);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + thoiLuong);
  } catch {}
}
