/**
 * File: TrangThanhToan.jsx
 * Mục đích: Giao diện thanh toán hiện đại tách 2 bên (Split layout) theo chuẩn Stripe / ChatGPT Plus.
 * Cột trái: Chọn phương thức (VietQR hoặc Thẻ Visa/Mastercard demo) và nhập thông tin.
 * Cột phải: Card tóm tắt đơn đặt sân, chiết tính tiền, đếm ngược giữ slot và nút xác nhận thanh toán.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiDichVu } from '../dichvu/api';
import QRCode from 'qrcode';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Lock,
  Calendar,
  MapPin,
  Smartphone,
  Search,
  Ticket
} from 'lucide-react';

// Hàm phát âm thanh chuông "Ting! 🔔" bằng Web Audio API nguyên bản (Apple Pay / MoMo style)
function phatAmThanhTing() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Nốt C6 (1046.5Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Nốt E6 (1318.5Hz) ngân sau 0.06s tạo âm sắc chuông vang
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.06);
    gain2.gain.setValueAtTime(0.25, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn('Không thể phát âm thanh:', err);
  }
}

export default function TrangThanhToan({ user, nguoiDung }) {
  const nguoiDungHienTai = user || nguoiDung;
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const orderType = searchParams.get('type');
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [phuongThuc, setPhuongThuc] = useState('vietqr'); // 'vietqr' | 'card'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [vietQrInfo, setVietQrInfo] = useState(null);
  const [demNguocChuyenTrang, setDemNguocChuyenTrang] = useState(null);
  const [addonInfo, setAddonInfo] = useState(null);

  // State cho Form thẻ Visa / Mastercard demo
  const [cardInfo, setCardInfo] = useState({
    number: '4111 2222 3333 4444',
    exp: '12/28',
    cvc: '888',
    name: nguoiDungHienTai?.name || nguoiDungHienTai?.fullName || 'NGUYEN VAN SPORT'
  });
  const [saveCard, setSaveCard] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(String(text));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn('Không thể sao chép:', e);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`esportking_booking_addons_${bookingId}`) || localStorage.getItem('esportking_current_booking');
      if (saved) {
        setAddonInfo(JSON.parse(saved));
      }
    } catch {}
  }, [bookingId]);

  const taiDuLieu = async () => {
    try {
      setLoading(true);
      setMsg(null);

      // 0. Kiểm tra nếu là đơn hàng Kiosk Đồ ăn & Nước uống
      const hasPendingKiosk = localStorage.getItem('esportking_pending_kiosk_order');
      if (orderType === 'kiosk' || (!bookingId && hasPendingKiosk)) {
        let kioskOrder = null;
        try {
          if (hasPendingKiosk) kioskOrder = JSON.parse(hasPendingKiosk);
        } catch {}

        if (kioskOrder) {
          setBooking({
            id: kioskOrder.orderId,
            isKiosk: true,
            totalAmount: kioskOrder.totalAmount,
            currency: 'VND',
            status: 'PENDING_PAYMENT',
            deliveryLocation: kioskOrder.deliveryLocation,
            items: kioskOrder.items || [],
            itemSummary: kioskOrder.itemSummary,
            customerName: kioskOrder.customerName,
            createdAt: kioskOrder.createdAt,
            expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          });
          setPayment({
            id: 888888,
            transactionCode: 'TX-' + kioskOrder.orderId,
            status: 'PENDING',
            amount: kioskOrder.totalAmount
          });
          const qrPayload = `2|99|72271020058888|Nguyen Xuan Dieu|${kioskOrder.totalAmount}|0|0|${kioskOrder.orderId}`;
          QRCode.toDataURL(qrPayload, { width: 240, margin: 2 }, (err, url) => {
            if (!err) setQrDataUrl(url);
          });
          setLoading(false);
          return;
        }
      }

      let curBookingId = bookingId;

      // Nếu không có bookingId trên URL (truy cập /thanh-toan trực tiếp từ thanh điều hướng)
      if (!curBookingId) {
        if (nguoiDungHienTai) {
          try {
            const resMe = await apiDichVu.layDonDatCuaToi({ page: 0, size: 10 });
            const ds = resMe.data?.content || [];
            const donCho = ds.find(d => d.status === 'PENDING_PAYMENT');
            if (donCho) {
              curBookingId = donCho.id;
            }
          } catch (e) {
            console.warn('Không thể tìm đơn chờ thanh toán:', e);
          }
        }
      }

      // Nếu không có bất kỳ đơn nào cần thanh toán -> để trống
      if (!curBookingId) {
        setBooking(null);
        setPayment(null);
        setLoading(false);
        return;
      }

      // 1. Nếu curBookingId là số hợp lệ (ID database thực tế)
      if (!isNaN(Number(curBookingId))) {
        const resB = await apiDichVu.layChiTietDonDat(curBookingId);
        setBooking(resB.data);

        // Khởi tạo hoặc lấy giao dịch thanh toán
        let resP = null;
        try {
          resP = await apiDichVu.taoThanhToan(curBookingId);
        } catch (errP) {
          console.warn('Giao dịch đã tồn tại hoặc đang xử lý, lấy lại thông tin giao dịch:', errP);
          try {
            resP = await apiDichVu.layThanhToanTheoBooking(curBookingId);
          } catch (errGet) {
            console.warn('Không thể lấy lại giao dịch:', errGet);
          }
        }

        if (resP?.data) {
          setPayment(resP.data);

          // Lấy mã VietQR thực tế từ Payment Service backend
          try {
            const resQr = await apiDichVu.layVietQR(resP.data.id);
            setVietQrInfo(resQr.data);

            let qrUrl = null;
            if (resQr.data?.qrCodeBase64) {
              qrUrl = resQr.data.qrCodeBase64.startsWith('data:image')
                ? resQr.data.qrCodeBase64
                : `data:image/png;base64,${resQr.data.qrCodeBase64}`;
            }

            if (qrUrl) {
              setQrDataUrl(qrUrl);
            } else if (resQr.data?.emvcoPayload) {
              QRCode.toDataURL(resQr.data.emvcoPayload, { width: 300, margin: 2 }, (err, url) => {
                if (!err && url) setQrDataUrl(url);
              });
            } else {
              const stk = resQr.data?.accountNumber || '72271020058888';
              const amt = resB.data.totalAmount;
              const memo = resQr.data?.transferContent || `BOOKING_${curBookingId}`;
              setQrDataUrl(`https://img.vietqr.io/image/TCB-${stk}-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(memo)}&accountName=Nguyen%20Xuan%20Dieu`);
            }
          } catch (errQr) {
            console.warn('Khong the lay VietQR tu backend, dung fallback:', errQr);
            const stk = '72271020058888';
            const amt = resB.data.totalAmount;
            const memo = `BOOKING_${curBookingId}`;
            setQrDataUrl(`https://img.vietqr.io/image/TCB-${stk}-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(memo)}&accountName=Nguyen%20Xuan%20Dieu`);
          }
        } else {
          // Fallback giả lập payment nếu backend chưa tạo được
          setPayment({
            id: 999999,
            transactionCode: 'TX-' + curBookingId,
            status: 'PENDING',
            amount: resB.data.totalAmount
          });
          const stk = '72271020058888';
          const amt = resB.data.totalAmount;
          const memo = `BOOKING_${curBookingId}`;
          setQrDataUrl(`https://img.vietqr.io/image/TCB-${stk}-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(memo)}&accountName=Nguyen%20Xuan%20Dieu`);
        }
      } else {
        // 2. Fallback an toàn khi bookingId là mã chuỗi giả lập (ví dụ BK-579536)
        let savedBooking = null;
        try {
          const raw = localStorage.getItem('esportking_current_booking');
          if (raw) savedBooking = JSON.parse(raw);
        } catch {}

        if (savedBooking) {
          const mockTotal = savedBooking.finalPrice || savedBooking.totalCourtPrice || 250000;
          setBooking({
            id: curBookingId,
            courtId: savedBooking.courtId,
            courtName: savedBooking.courtName,
            venueName: savedBooking.venueName,
            bookingDate: savedBooking.bookingDate,
            startSlot: savedBooking.startTime,
            endSlot: savedBooking.endTime,
            totalAmount: mockTotal,
            currency: 'VND',
            status: 'PENDING_PAYMENT',
            expiredAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            isMock: true
          });
          setPayment({
            id: 999999,
            transactionCode: 'TX-' + curBookingId,
            status: 'PENDING',
            amount: mockTotal
          });
          const qrPayload = `2|99|72271020058888|Nguyen Xuan Dieu|${mockTotal}|0|0|${curBookingId}`;
          QRCode.toDataURL(qrPayload, { width: 240, margin: 2 }, (err, url) => {
            if (!err) setQrDataUrl(url);
          });
        } else {
          setBooking(null);
          setPayment(null);
        }
      }
    } catch (e) {
      console.error('Lỗi tải thông tin thanh toán:', e);
      const rawMsg = e.response?.data?.message || e.message || '';
      if (!rawMsg.includes('Duplicate') && !rawMsg.includes('constraint') && !rawMsg.includes('payment_transactions')) {
        setMsg(rawMsg || 'Không thể tải thông tin thanh toán.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, [bookingId]);

  // Đếm ngược 10 phút thời gian giữ slot
  useEffect(() => {
    if (!booking?.expiredAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(booking.expiredAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Đã hết hạn');
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  // Tự động phát âm thanh Ting! và chuyển hướng sang danh sách vé sau khi thanh toán thành công
  useEffect(() => {
    if (booking?.status === 'CONFIRMED') {
      phatAmThanhTing();
      try {
        window.dispatchEvent(new Event('cap_nhat_thong_bao'));
      } catch {}

      let giay = 3;
      setDemNguocChuyenTrang(giay);
      const timer = setInterval(() => {
        giay -= 1;
        setDemNguocChuyenTrang(giay);
        if (giay <= 0) {
          clearInterval(timer);
          navigate('/ve-cua-toi');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [booking?.status]);

  // Xử lý xác nhận thanh toán
  const handleXacNhanThanhToan = async () => {
    if (!payment) return;
    setProcessing(true);
    setMsg(null);
    try {
      if (booking?.isKiosk) {
        // Lưu đơn Kiosk vào esportking_service_requests để Live Dispatcher tại quầy trực ban xử lý
        const requestItem = {
          id: booking.id,
          type: 'KIOSK_ORDER',
          bookingId: booking.id,
          maVe: booking.id,
          tenSan: booking.deliveryLocation || 'Bàn trực ban trạm tiếp đón',
          tenCoSo: 'Cơ sở hiện tại',
          thoiGian: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          items: booking.items || [],
          tongTien: booking.totalAmount,
          trangThai: 'PENDING',
          nguoiGui: booking.customerName || 'Khách Hàng',
          thanhToan: 'DA_THANH_TOAN'
        };
        try {
          const currentRequests = JSON.parse(localStorage.getItem('esportking_service_requests') || '[]');
          localStorage.setItem('esportking_service_requests', JSON.stringify([requestItem, ...currentRequests]));
          localStorage.removeItem('esportking_pending_kiosk_order');
          window.dispatchEvent(new Event('cap_nhat_dich_vu'));
        } catch {}

        setPayment(prev => ({ ...prev, status: 'SUCCESS' }));
        setBooking(prev => ({ ...prev, status: 'CONFIRMED' }));
        return;
      }
      if (booking?.isMock) {
        setPayment(prev => ({ ...prev, status: 'SUCCESS' }));
        setBooking(prev => ({ ...prev, status: 'CONFIRMED' }));
        return;
      }
      const res = await apiDichVu.moPhongThanhCong(payment.id);
      setPayment(res.data);
      const resB = await apiDichVu.layChiTietDonDat(bookingId);
      setBooking(resB.data);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf7f5]">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-bold text-sm">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span>Đang nạp cổng thanh toán an toàn...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 text-center max-w-md w-full shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Không Có Đơn Cần Thanh Toán</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {msg || 'Hiện tại bạn không có đơn đặt sân nào đang chờ thanh toán. Hãy chọn sân thể thao và đặt giữ chỗ ngay!'}
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/tim-san"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Khám Phá Sân & Đặt Chỗ Ngay
            </Link>
            <Link
              to="/ve-cua-toi"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              Xem Đặt Sân Của Tôi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const isFailed = booking.status === 'CANCELLED' || payment?.status === 'FAILED';
  const isExpired = booking.status === 'EXPIRED' || timeLeft === 'Đã hết hạn';

  // Hiển thị tên sân, cơ sở và môn
  const tenSanHienThi = addonInfo?.courtName || booking.courtName || 'Sân thi đấu tiêu chuẩn';
  const tenCoSoHienThi = addonInfo?.venueName || 'Trung Tâm Thể Thao ESportKing';
  const tenMonHienThi = addonInfo?.sportName || 'Thể Thao';

  return (
    <div className="min-h-screen bg-[#fbf7f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Nút quay lại */}
        <div className="mb-6">
          <Link 
            to="/tim-san" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition py-1.5 px-3 rounded-xl hover:bg-slate-200/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại chọn sân khác</span>
          </Link>
        </div>

        {/* THÔNG BÁO KHI ĐÃ THANH TOÁN THÀNH CÔNG */}
        {isConfirmed ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <style>{`
              @keyframes drawCheck {
                0% { stroke-dashoffset: 48; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes circlePulse {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.06); }
                100% { transform: scale(1); opacity: 1; }
              }
              .animate-circle-pulse {
                animation: circlePulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
              .animate-draw-check {
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: drawCheck 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.25s;
              }
            `}</style>

            {/* Vòng tròn ngọc bích & nét vẽ tích xanh động */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-circle-pulse">
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" className="animate-draw-check" />
                </svg>
              </div>
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
              Xác nhận thanh toán thành công
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              {booking.isKiosk ? 'Đặt Đồ Ăn & Nước Uống Thành Công!' : 'Giữ Chỗ Thành Công!'}
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Mã đơn: <strong className="text-slate-800 font-mono">#{booking.id}</strong> • {booking.isKiosk ? 'Quầy tiếp tế đang chuẩn bị món và giao đến sân ngay.' : 'Vé sân điện tử kèm mã QR check-in đã sẵn sàng.'}
            </p>

            {/* Tóm tắt */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-md mx-auto text-xs text-slate-600 mb-6 space-y-2.5 text-left shadow-sm">
              {booking.isKiosk ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-400">Vị trí giao:</span>
                    <span className="font-bold text-slate-900">{booking.deliveryLocation || 'Bàn tiếp đón trực ban'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-400">Danh mục món:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[220px]">{booking.itemSummary}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-400">Sân thi đấu:</span>
                    <span className="font-bold text-slate-900">{tenSanHienThi}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-400">Thời gian:</span>
                    <span className="font-bold text-slate-900">{booking.bookingDate} • {booking.startSlot?.substring(0, 5)} - {booking.endSlot?.substring(0, 5)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-400">Cơ sở:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[220px]">{tenCoSoHienThi}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Số tiền đã trả:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {Number(booking.totalAmount).toLocaleString('vi-VN')} {booking.currency || 'VND'}
                </span>
              </div>
            </div>

            {demNguocChuyenTrang !== null && (
              <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Đang chuyển sang danh sách Vé & Lịch đặt trong {demNguocChuyenTrang} giây...</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/ve-cua-toi"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-500/25 transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Mở Mã QR Nhận Sân Ngay</span>
              </Link>
              <Link
                to="/tim-san"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition"
              >
                Đặt thêm sân khác
              </Link>
            </div>
          </div>
        ) : (
          /* BỐ CỤC 2 BÊN (SPLIT LAYOUT) CHUẨN STRIPE / CHATGPT PLUS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CỘT TRÁI: CHỌN PHƯƠNG THỨC THANH TOÁN (VIETQR HOẶC VISA) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
              
              <div className="mb-6 pb-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Phương Thức Thanh Toán
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Chọn phương thức thanh toán an toàn để hoàn tất giữ slot thi đấu
                  </p>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Tabs chọn: VietQR hoặc Thẻ Visa */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPhuongThuc('vietqr')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                    phuongThuc === 'vietqr'
                      ? 'border-brand-600 bg-brand-50/40 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    phuongThuc === 'vietqr' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-black text-sm">Chuyển khoản VietQR</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">App Ngân hàng & Ví MoMo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPhuongThuc('card')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                    phuongThuc === 'card'
                      ? 'border-brand-600 bg-brand-50/40 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    phuongThuc === 'card' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-black text-sm">Thẻ Quốc Tế (Visa)</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Visa, Mastercard, JCB</span>
                  </div>
                </button>
              </div>

              {/* NỘI DUNG TAB 1: VIETQR */}
              {phuongThuc === 'vietqr' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-5 border border-slate-200/70 text-center">
                    <p className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-brand-600" />
                      <span>Mở App Ngân hàng bất kỳ hoặc Ví MoMo để quét mã VietQR:</span>
                    </p>

                    {/* Khung ảnh QR Code */}
                    <div className="inline-block p-4 bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 mb-4">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="VietQR Techcombank" 
                          className="w-56 h-56 mx-auto object-contain rounded-xl" 
                          onError={(e) => {
                            const stk = vietQrInfo?.accountNumber || '72271020058888';
                            const amt = booking?.totalAmount || 0;
                            const memo = vietQrInfo?.transferContent || `BOOKING_${booking?.id || ''}`;
                            e.target.src = `https://img.vietqr.io/image/TCB-${stk}-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(memo)}&accountName=Nguyen%20Xuan%20Dieu`;
                          }}
                        />
                      ) : (
                        <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                          Đang tạo mã VietQR Techcombank...
                        </div>
                      )}
                    </div>

                    {/* Chi tiết tài khoản nhận tiền */}
                    <div className="text-xs text-slate-700 bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2.5 max-w-md mx-auto text-left shadow-sm">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500">Ngân hàng:</span>
                        <span className="font-bold text-slate-900">{vietQrInfo?.bankName || 'Techcombank'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900">{vietQrInfo?.accountNumber || '72271020058888'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(vietQrInfo?.accountNumber || '72271020058888', 'stk')}
                            className="p-1 text-slate-400 hover:text-brand-600 transition rounded"
                            title="Sao chép số tài khoản"
                          >
                            {copiedKey === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500">Chủ tài khoản:</span>
                        <span className="font-bold text-slate-900 uppercase">{vietQrInfo?.accountName || 'Nguyen Xuan Dieu'}</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                        <span className="text-slate-500">Số tiền:</span>
                        <span className="font-black text-brand-600 text-sm">
                          {Number(booking.totalAmount).toLocaleString('vi-VN')} {booking.currency || 'VND'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-500">Nội dung CK:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                            {vietQrInfo?.transferContent || `BOOKING_${booking.id}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(vietQrInfo?.transferContent || `BOOKING_${booking.id}`, 'nd')}
                            className="p-1 text-slate-400 hover:text-brand-600 transition rounded"
                            title="Sao chép nội dung chuyển khoản"
                          >
                            {copiedKey === 'nd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 italic">
                      💡 Mẹo: Hệ thống tự động xác nhận trong vòng vài giây sau khi chuyển khoản thành công.
                    </p>
                  </div>
                </div>
              )}

              {/* NỘI DUNG TAB 2: FORM THẺ VISA / MASTERCARD (CHUẨN CHATGPT PLUS / STRIPE) */}
              {phuongThuc === 'card' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">Thanh toán bằng Thẻ Quốc Tế (Chế độ Demo)</h4>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Hỗ trợ thẻ tín dụng / ghi nợ quốc tế Visa, Mastercard, JCB. Dữ liệu thẻ được giả lập an toàn phục vụ nghiệm thu đồ án.
                      </p>
                    </div>
                  </div>

                  {/* Form thẻ nhập liệu */}
                  <div className="space-y-3 pt-1">
                    {/* Số thẻ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Số thẻ (Card number)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardInfo.number}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
                            const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                            setCardInfo({ ...cardInfo, number: formatted });
                          }}
                          maxLength={19}
                          placeholder="4111 2222 3333 4444"
                          className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-mono text-slate-900"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                          <span className="px-1.5 py-0.5 bg-blue-900 text-white text-[10px] font-black rounded">VISA</span>
                          <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded">MC</span>
                          <span className="px-1.5 py-0.5 bg-slate-800 text-white text-[10px] font-black rounded">JCB</span>
                        </div>
                      </div>
                    </div>

                    {/* Hạn dùng & CVC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày hết hạn (MM/YY)</label>
                        <input
                          type="text"
                          value={cardInfo.exp}
                          onChange={(e) => setCardInfo({ ...cardInfo, exp: e.target.value })}
                          placeholder="12/28"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-mono text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã bảo mật (CVC / CVV)</label>
                        <div className="relative">
                          <input
                            type="password"
                            maxLength={4}
                            value={cardInfo.cvc}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                            placeholder="•••"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-mono text-slate-900"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Tên chủ thẻ */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên in trên thẻ (Cardholder name)</label>
                      <input
                        type="text"
                        value={cardInfo.name}
                        onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value.toUpperCase() })}
                        placeholder="NGUYEN VAN KHACH"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm uppercase text-slate-900"
                      />
                    </div>

                    {/* Checkbox lưu thẻ */}
                    <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span>Lưu thông tin thẻ an toàn cho các lần đặt sân tiếp theo</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Cam kết bảo mật tiêu chuẩn */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mã hóa bảo mật 256-bit SSL</span>
                </div>
                <span>Tuân thủ chuẩn bảo mật thanh toán PCI-DSS</span>
              </div>

            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN ĐẶT SÂN / KIOSK & NÚT XÁC NHẬN THANH TOÁN (STICKY) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
              
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
                
                {booking.isKiosk ? (
                  <>
                    {/* Header đơn Kiosk tiếp tế */}
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                          Tiếp Tế Tận Sân
                        </span>
                        <span className="text-xs text-slate-400">#{booking.id}</span>
                      </div>
                      <h2 className="text-lg font-black text-slate-900 line-clamp-1">
                        Hóa Đơn Tiếp Tế Đồ Ăn & Nước Uống
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Giao đến: <strong className="text-slate-800">{booking.deliveryLocation || 'Bàn tiếp đón trực ban'}</strong></span>
                      </p>
                    </div>

                    {/* Danh sách các món trong đơn Kiosk */}
                    <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4 mb-4">
                      <span className="text-slate-400 block font-semibold mb-1">Chi tiết các món đã chọn:</span>
                      <div className="space-y-2 pl-1">
                        {booking.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-800">
                              {it.icon || '⚡'} {it.soLuong}x {it.ten}
                            </span>
                            <span className="font-bold text-amber-600">
                              {it.gia === 0 ? 'Miễn phí' : `${Number(it.gia * it.soLuong).toLocaleString('vi-VN')} đ`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chiết tính tiền Kiosk */}
                    <div className="space-y-2 text-xs border-b border-slate-100 pb-4 mb-4">
                      <div className="flex justify-between text-slate-500">
                        <span>Phí giao tận sân (SLA &lt; 5p):</span>
                        <span className="font-bold text-emerald-600">Miễn phí 100%</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2">
                        <span className="text-sm font-black text-slate-900">Tổng thanh toán:</span>
                        <span className="text-2xl font-black text-amber-600">
                          {Number(booking.totalAmount).toLocaleString('vi-VN')} <span className="text-sm text-slate-400 font-normal">{booking.currency || 'VND'}</span>
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Header đơn đặt sân */}
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-wider">
                          {tenMonHienThi}
                        </span>
                        <span className="text-xs text-slate-400">#{booking.id}</span>
                      </div>
                      <h2 className="text-lg font-black text-slate-900 line-clamp-1">
                        {tenSanHienThi}
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{tenCoSoHienThi}</span>
                      </p>
                    </div>

                    {/* Thông tin lịch đặt chi tiết */}
                    <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Ngày thi đấu:
                        </span>
                        <strong className="text-slate-800 font-semibold">{booking.bookingDate}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Khung giờ thuê:
                        </span>
                        <strong className="text-slate-800 font-semibold">
                          {booking.startSlot?.substring(0, 5)} - {booking.endSlot?.substring(0, 5)}
                        </strong>
                      </div>

                      {addonInfo?.addons?.length > 0 && (
                        <div className="pt-2 border-t border-slate-100/80">
                          <span className="text-slate-400 block mb-1">Dịch vụ & tiện ích kèm:</span>
                          <div className="space-y-1 pl-1">
                            {addonInfo.addons.map((a, idx) => (
                              <div key={idx} className="flex justify-between text-[11px]">
                                <span>{a.icon} {a.name}</span>
                                <span className="font-semibold text-slate-700">+{Number(a.price).toLocaleString('vi-VN')} đ</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chiết tính tiền */}
                    <div className="space-y-2 text-xs border-b border-slate-100 pb-4 mb-4">
                      <div className="flex justify-between text-slate-500">
                        <span>Tiền thuê sân:</span>
                        <span className="font-semibold text-slate-800">
                          {Number(addonInfo?.totalCourtPrice || (Number(booking.totalAmount) + Number(addonInfo?.discountAmount || 0))).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      {addonInfo?.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Khuyến mãi Voucher:</span>
                          <span className="font-bold">
                            -{Number(addonInfo.discountAmount).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                        <span className="text-sm font-black text-slate-900">Tổng thanh toán chuyển khoản:</span>
                        <span className="text-2xl font-black text-brand-600">
                          {Number(booking.totalAmount).toLocaleString('vi-VN')} <span className="text-sm text-slate-400 font-normal">{booking.currency || 'VND'}</span>
                        </span>
                      </div>

                      {addonInfo?.addonsPrice > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-100 space-y-0.5">
                          <div className="flex justify-between text-amber-700">
                            <span>Dịch vụ gọi thêm:</span>
                            <span className="font-bold">+{Number(addonInfo.addonsPrice).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic">
                            💡 Thanh toán trực tiếp tại quầy tiếp tân khi nhận sân thi đấu.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Đồng hồ đếm ngược giữ slot */}
                {!isConfirmed && !isExpired && (
                  <div className="mb-5 flex items-center justify-between p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-900 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Thời gian giữ slot:</span>
                    </div>
                    <span className="font-mono font-black text-sm text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                      {timeLeft || '10:00'}
                    </span>
                  </div>
                )}

                {/* Cảnh báo khi hết hạn giữ chỗ */}
                {isExpired && !isConfirmed && (
                  <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Đã hết thời gian giữ slot (quá 10 phút)</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Khung giờ này đã được tự động mở lại cho các khách hàng khác. Vui lòng quay lại trang sân để chọn lại slot mới.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(booking.courtId ? `/venue/1?sport=FOOTBALL&size=5` : '/tim-san')}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>🔄 Chọn Lại Khung Giờ Khác</span>
                    </button>
                  </div>
                )}

                {/* NÚT XÁC NHẬN THANH TOÁN (CTA CHÍNH) */}
                <button
                  type="button"
                  onClick={handleXacNhanThanhToan}
                  disabled={processing || isExpired}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xử lý giao dịch...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{phuongThuc === 'vietqr' ? 'Tôi Đã Chuyển Khoản Xong' : 'Xác Nhận Thanh Toán Bằng Thẻ'}</span>
                    </>
                  )}
                </button>

                {msg && (
                  <p className="text-xs text-rose-600 mt-2 text-center font-medium">
                    {msg}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-400">
                    Cần hỗ trợ thanh toán? Hotline CSKH: <strong className="text-slate-600 font-bold">1900.8888</strong>
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
