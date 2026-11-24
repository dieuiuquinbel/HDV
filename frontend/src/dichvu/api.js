/**
 * File: api.js
 * Muc dich: Xu ly goi API toi API Gateway (http://localhost:8080/api/v1).
 * Chuc nang: Cau hinh withCredentials: true de tu dong gui cookie HttpOnly access_token; tu dong chen header X-CSRF-Token tu cookie XSRF-TOKEN.
 */
import axios from 'axios';

const GATEWAY_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: GATEWAY_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ham lay gia tri cookie bang ten
function layGiaTriCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Request Interceptor: Tu dong lay cookie XSRF-TOKEN va gan vao header X-CSRF-Token
api.interceptors.request.use(async (config) => {
  // Neu chua co cookie XSRF-TOKEN tren trinh duyet, chu dong lay truoc khi gui request thay doi
  let csrfToken = layGiaTriCookie('XSRF-TOKEN');
    if (!csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    try {
      const res = await axios.get(`${GATEWAY_BASE_URL}/auth/csrf`, { withCredentials: true });
      csrfToken = res.data?.token || layGiaTriCookie('XSRF-TOKEN');
    } catch (e) {
      console.warn('Khong the lay CSRF token truoc:', e);
    }
  }

  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiDichVu = {
  // 1. Xac thuc & Tai khoan
  layCsrf: () => api.get('/auth/csrf'),
  dangKy: (data) => api.post('/auth/register', data),
  xacMinhOtp: (data) => api.post('/auth/verify-otp', data),
  guiLaiOtp: (email) => api.post('/auth/resend-otp', { email }),
  dangNhap: (data) => api.post('/auth/login', data),
  dangXuat: () => api.post('/auth/logout'),
  layThongTinToi: () => api.get('/users/me'),
  layDanhSachNguoiDung: (params) => api.get('/users', { params }),
  capNhatTrangThaiUser: (id, status) => api.patch(`/users/${id}/status`, { status }),
  taoNguoiDungAdmin: (data) => api.post('/users', data),
  capNhatNguoiDungAdmin: (id, data) => api.put(`/users/${id}`, data),
  xoaNguoiDungAdmin: (id) => api.delete(`/users/${id}`),

  // 2. Cum san & San con
  layDanhSachCumSan: (params) => api.get('/venues', { params }),
  layChiTietCumSan: (id) => api.get(`/venues/${id}`),
  layCumSanCuaToi: () => api.get('/venues/my-venues'),
  taoCumSan: (data) => api.post('/venues', data),
  capNhatCumSan: (id, data) => api.put(`/venues/${id}`, data),
  doiTrangThaiCumSan: (id, status) => api.patch(`/venues/${id}/status`, { status }),
  taoSanCon: (venueId, data) => api.post(`/venues/${venueId}/courts`, data),
  capNhatSanCon: (id, data) => api.put(`/courts/${id}`, data),
  doiTrangThaiSanCon: (id, status) => api.patch(`/courts/${id}/status`, { status }),
  capNhatKhungGio: (id, data) => api.put(`/courts/${id}/operating-hours`, data),
  capNhatQuyTacGia: (id, data) => api.put(`/courts/${id}/price-rules`, data),

  // 3. Dat san & Kha dung
  layKhungGioKhaDung: (courtId, date) => api.get('/availability', { params: { courtId, date } }),
  layDanhSachUuDai: () => api.get('/vouchers/available'),
  taoDonDat: (data, idempotencyKey) => api.post('/bookings', data, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
  }),
  tinhBaoGiaSan: (data) => api.post('/bookings/preview', data),
  layDonDatCuaToi: (params) => api.get('/bookings/me', { params }),
  layChiTietDonDat: (id) => api.get(`/bookings/${id}`),
  huyDonDat: (id) => api.post(`/bookings/${id}/cancel`),
  checkinDonDat: (data) => {
    const payload = typeof data === 'string' ? { token: data } : data;
    return api.post('/bookings/checkin', payload);
  },
  traSanDonDat: (id) => api.post(`/bookings/${id}/complete`),
  layDanhSachDonTheoTram: (params) => api.get('/bookings/station', { params }),
  layDonDatAdmin: (params) => api.get('/admin/bookings', { params }),
  layThongKeDonDat: (params) => api.get('/admin/statistics/bookings', { params }),

  // 4. Thanh toan
  taoThanhToan: (bookingId) => api.post('/payments', { bookingId }),
  layVietQR: (paymentId) => api.get(`/payments/${paymentId}/vietqr`),
  moPhongThanhCong: (id) => api.post(`/payments/${id}/simulate-success`),
  moPhongThatBai: (id) => api.post(`/payments/${id}/simulate-failure`),
  thuLaiThanhToan: (id) => api.post(`/payments/${id}/retry`),
  layThanhToanTheoBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  layThanhToanAdmin: (params) => api.get('/admin/payments', { params }),
  layThongKeDoanhThu: (params) => api.get('/admin/statistics/revenue', { params }),

  // 4.1. Vi dien tu SportPay
  layThongTinVi: () => api.get('/payments/wallet'),
  rutTienVi: (data) => api.post('/payments/wallet/withdraw', data),
  napTienVi: (data) => api.post('/payments/wallet/topup', data),
  thanhToanBangVi: (bookingId) => api.post('/payments/wallet/pay', { bookingId }),

  // 5. Thong bao (Notification Service)
  layThongBaoCuaToi: (params) => api.get('/notifications/me', { params }),
  demThongBaoChuaDoc: () => api.get('/notifications/me/unread-count'),
  danhDauDaDocThongBao: (id) => api.patch(`/notifications/${id}/read`),
  danhDauTatCaDaDocThongBao: () => api.patch('/notifications/read-all'),
};

export default api;
