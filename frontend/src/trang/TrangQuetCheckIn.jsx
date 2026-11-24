/**
 * File: TrangQuetCheckIn.jsx
 * Muc dich: Tram truc ban, quet ma QR Check-in va dieu phoi dich vu tai san cua he thong ESportKing.
 * Chuc nang:
 * 1. Chon tram truc ban: Co So 1 (Cau Giay), Co So 2 (Dong Da), Co So 3 (Long Bien).
 * 2. Quet ma QR Check-in tu dong doi chieu: Phat hien lech co so (Venue Mismatch), canh bao khach di nham va mo Google Maps chi duong sang dung co so.
 * 3. Bang dieu phoi dich vu tai san (In-Court Service Dispatcher): Nhan vien tiep nhan yeu cau goi nuoc, goi nguoi nhat bong Tennis voi dong ho do thoi gian dap ung (SLA).
 */
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import jsQR from 'jsqr';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Navigation, 
  ExternalLink, 
  Coffee, 
  Check, 
  Timer, 
  BellRing, 
  Upload, 
  Camera, 
  CameraOff, 
  Search, 
  FileImage, 
  CheckCircle, 
  Flag, 
  UserCheck, 
  RefreshCw,
  Lock
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';

const DANH_SACH_CO_SO = [
  { id: 1, name: 'Cơ Sở 1 (Cầu Giấy)', address: 'Số 18 Duy Tân, Dịch Vọng Hậu, Cầu Giấy', mapUrl: 'https://maps.google.com/?q=21.031300,105.783500' },
  { id: 2, name: 'Cơ Sở 2 (Đống Đa)', address: 'Số 102 Trường Chinh, Phương Mai, Đống Đa', mapUrl: 'https://maps.google.com/?q=21.002800,105.839200' },
  { id: 3, name: 'Cơ Sở 3 (Hà Đông)', address: 'Số 27 Đường Quang Trung, Hà Đông', mapUrl: 'https://maps.google.com/?q=20.972100,105.774500' },
];

// Phat am thanh chuong quet check-in / co don tiep te moi
function phatChuongBaoQuay() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch {}
}

export default function TrangQuetCheckIn({ user }) {
  // Tram truc hien tai (Luu trong localStorage hoac mac dinh theo tai khoan nhan vien)
  const [stationVenueId, setStationVenueId] = useState(() => {
    return Number(localStorage.getItem('esportking_active_station') || 1);
  });

  // Tu dong chon tram truc ban theo tai khoan nhan vien CS1, CS2, CS3
  useEffect(() => {
    if (user?.email) {
      if (user.email.includes('cs1')) {
        setStationVenueId(1);
        localStorage.setItem('esportking_active_station', '1');
      } else if (user.email.includes('cs2')) {
        setStationVenueId(2);
        localStorage.setItem('esportking_active_station', '2');
      } else if (user.email.includes('cs3')) {
        setStationVenueId(3);
        localStorage.setItem('esportking_active_station', '3');
      }
    }
  }, [user]);

  const [tokenInput, setTokenInput] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [ketQua, setKetQua] = useState(null);
  const [loi, setLoi] = useState('');
  const [phuongThucQuet, setPhuongThucQuet] = useState('upload'); // 'upload' | 'camera' | 'manual'
  const [cameraActive, setCameraActive] = useState(false);
  const [danhSachDonHomNay, setDanhSachDonHomNay] = useState([]);
  const [timKiemDon, setTimKiemDon] = useState('');
  const [dangTaiDon, setDangTaiDon] = useState(false);
  const [traSanMsg, setTraSanMsg] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const tabTram = searchParams.get('tab') === 'requests' ? 'YEU_CAU' : 'CHECKIN';
  const chuyenTab = (tab) => {
    setSearchParams({ tab: tab === 'YEU_CAU' ? 'requests' : 'checkin' }, { replace: true });
  };
  const laNhanVienCoSo = user?.role === 'STAFF';
  const [boLocNgay, setBoLocNgay] = useState('UPCOMING'); // 'UPCOMING' | 'TODAY' | 'TOMORROW'

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const prevPendingCountRef = useRef(0);

  // Danh sach yeu cau dich vu tai san lay truc tiep tu Backend API (dong bo da trinh duyet)
  const [danhSachDichVu, setDanhSachDichVu] = useState([]);

  useEffect(() => {
    localStorage.setItem('esportking_active_station', stationVenueId.toString());
  }, [stationVenueId]);

  const taiYeuCauDichVu = async () => {
    try {
      const res = await apiDichVu.layDanhSachYeuCauDichVu({ venueId: stationVenueId });
      if (Array.isArray(res?.data)) {
        const pendingCount = res.data.filter(r => r.status === 'PENDING').length;
        if (pendingCount > prevPendingCountRef.current) {
          phatChuongBaoQuay();
        }
        prevPendingCountRef.current = pendingCount;
        setDanhSachDichVu(res.data);
        window.dispatchEvent(new CustomEvent('cap_nhat_so_yeu_cau', { detail: pendingCount }));
      }
    } catch (e) {
      console.warn('Khong the tai yeu cau dich vu:', e);
    }
  };

  const coSoHienTai = DANH_SACH_CO_SO.find(c => c.id === stationVenueId) || DANH_SACH_CO_SO[0];

  // Tai danh sach don dat tai tram (ho tro Sap toi / Hom nay / Ngay mai)
  const taiDanhSachDonHomNay = async (ngam = false) => {
    if (!ngam) setDangTaiDon(true);
    try {
      const res = await apiDichVu.layDanhSachDonTheoTram({ venueId: stationVenueId, range: boLocNgay });
      if (res?.data && Array.isArray(res.data)) {
        setDanhSachDonHomNay(res.data);
      }
    } catch (e) {
      console.warn('Khong the lay danh sach don theo tram:', e);
    } finally {
      if (!ngam) setDangTaiDon(false);
    }
  };

  // Dong bo tu dong ca Lich Dat San & Yeu Cau Phuc Vu moi 5 giay
  useEffect(() => {
    taiDanhSachDonHomNay(false);
    taiYeuCauDichVu();
    const polling = setInterval(() => {
      taiDanhSachDonHomNay(true);
      taiYeuCauDichVu();
    }, 5000);
    return () => clearInterval(polling);
  }, [stationVenueId, boLocNgay]);

  // Xu ly tai anh QR tu file (Upload hoac Keo tha)
  const xuLyTaiAnhQR = (file) => {
    if (!file) return;
    setDangXuLy(true);
    setLoi('');
    setKetQua(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            xuLyQuetMa(code.data);
          } else {
            setLoi('Không tìm thấy mã QR nào trong bức ảnh này. Vui lòng chọn ảnh chụp rõ nét hơn!');
            setDangXuLy(false);
          }
        } catch (errDecode) {
          setLoi('Lỗi khi phân tích ảnh QR: ' + errDecode.message);
          setDangXuLy(false);
        }
      };
      img.onerror = () => {
        setLoi('Không thể nạp tệp ảnh này. Vui lòng thử lại!');
        setDangXuLy(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Bat camera quet truc tiep
  const batCamera = async () => {
    setLoi('');
    setKetQua(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickCamera);
      }
    } catch (err) {
      setLoi('Không thể mở Camera (chưa cấp quyền hoặc không có thiết bị). Hãy dùng tính năng Tải ảnh QR!');
      setCameraActive(false);
    }
  };

  const tatCamera = () => {
    setCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const tickCamera = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (streamRef.current) requestAnimationFrame(tickCamera);
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code && code.data) {
      tatCamera();
      xuLyQuetMa(code.data);
    } else if (streamRef.current) {
      requestAnimationFrame(tickCamera);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const xuLyQuetMa = async (token, bookingId) => {
    const ma = token || tokenInput;
    if (!ma && !bookingId) {
      setLoi('Vui lòng tải ảnh QR, quét camera hoặc chọn đơn từ danh sách');
      return;
    }

    setDangXuLy(true);
    setLoi('');
    setKetQua(null);

    try {
      const payload = {
        stationVenueId: stationVenueId.toString()
      };
      if (bookingId) {
        payload.bookingId = bookingId.toString();
      } else {
        payload.token = ma.trim();
      }

      const res = await apiDichVu.checkinDonDat(payload);
      setKetQua(res.data);
      phatChuongBaoQuay();
      taiDanhSachDonHomNay();
      try {
        localStorage.setItem('esportking_last_checkin', Date.now().toString());
        window.dispatchEvent(new Event('cap_nhat_ve'));
      } catch {}
    } catch (err) {
      setLoi(err.response?.data?.message || 'Không thể xác minh mã QR này. Mã không hợp lệ hoặc đã hết hạn.');
    } finally {
      setDangXuLy(false);
    }
  };

  // Nhan vien xac nhan tra san & hoan tat ca thi dau
  const xuLyTraSan = async (bookingId) => {
    try {
      await apiDichVu.traSanDonDat(bookingId);
      phatChuongBaoQuay();
      setTraSanMsg(`Đã xác nhận trả sân thành công cho đơn #${bookingId}!`);
      setTimeout(() => setTraSanMsg(''), 4500);
      taiDanhSachDonHomNay();
      try {
        localStorage.setItem('esportking_last_checkout', Date.now().toString());
        window.dispatchEvent(new Event('cap_nhat_ve'));
      } catch {}
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trả sân');
    }
  };

  // Nhan vien tiep nhan yeu cau dich vu (goi Backend API)
  const tiepNhanDichVu = async (reqId) => {
    try {
      await apiDichVu.capNhatTrangThaiYeuCauDichVu(reqId, 'PREPARING');
      taiYeuCauDichVu();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái yêu cầu.');
    }
  };

  // Nhan vien hoan tat giao do tai san (goi Backend API)
  const hoanTatDichVu = async (reqId) => {
    try {
      await apiDichVu.capNhatTrangThaiYeuCauDichVu(reqId, 'DELIVERED');
      taiYeuCauDichVu();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái hoàn tất.');
    }
  };

  // Loc cac yeu cau dich vu thuoc co so dang truc
  const yeuCauThuocCoSo = danhSachDichVu;
  const soYeuCauDangCho = yeuCauThuocCoSo.filter(d => d.status === 'PENDING' || d.status === 'PREPARING').length;

  return (
    <div className="min-h-screen bg-[#fbf7f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 1. THANH CHON TRAM TRUC BAN CUA NHAN VIEN / ADMIN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Trạm Trực Ban ESportKing</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">ĐANG TRỰC CA</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vị trí: <strong className="text-slate-800">{coSoHienTai.name}</strong> • {coSoHienTai.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {laNhanVienCoSo ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Phụ trách cố định: {coSoHienTai.name}</span>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Đổi cơ sở trực:</span>
                <select
                  value={stationVenueId}
                  onChange={(e) => {
                    setStationVenueId(Number(e.target.value));
                    setKetQua(null);
                    setLoi('');
                  }}
                  className="w-full md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-500 outline-none transition cursor-pointer shadow-inner"
                >
                  {DANH_SACH_CO_SO.map(cs => (
                    <option key={cs.id} value={cs.id}>
                      🏢 {cs.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* THANH CHUYEN 2 TAB CHI HIEN THI CHO ADMIN/OWNER (STAFF DA CO SAN 2 TAB TREN HEADER) */}
        {!laNhanVienCoSo && (
          <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => chuyenTab('CHECKIN')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                tabTram === 'CHECKIN'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Check-in & Lịch Sân</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                tabTram === 'CHECKIN' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {danhSachDonHomNay.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                chuyenTab('YEU_CAU');
                taiYeuCauDichVu();
              }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                tabTram === 'YEU_CAU'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Yêu Cầu Phục Vụ Tại Sân</span>
              {soYeuCauDangCho > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  {soYeuCauDangCho} mới
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  tabTram === 'YEU_CAU' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  0
                </span>
              )}
            </button>
          </div>
        )}

        {/* ================= TAB 1: CHECK-IN QR & LỊCH ĐẶT SÂN ================= */}
        {tabTram === 'CHECKIN' && (
          <div className="space-y-6">
        {/* 2. KHU VUC QUET MA QR CHECK-IN THONG MINH */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-slate-100 text-center">
          
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <QrCode className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trạm Xác Minh QR & Check-in Nhận Sân</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1 max-w-md mx-auto">
            Quét mã QR từ điện thoại hoặc tải ảnh vé của khách. Hệ thống tự động giải mã, kiểm tra đối chiếu cơ sở và ngăn ngừa đi nhầm sân.
          </p>

          {/* Tabs chọn phương thức quét */}
          <div className="flex justify-center gap-2 mt-5 mb-6">
            <button
              type="button"
              onClick={() => {
                setPhuongThucQuet('upload');
                tatCamera();
                setLoi('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                phuongThucQuet === 'upload'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh Mã QR (Khuyên dùng)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhuongThucQuet('camera');
                batCamera();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                phuongThucQuet === 'camera'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Mở Camera Quét Trực Tiếp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhuongThucQuet('manual');
                tatCamera();
                setLoi('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                phuongThucQuet === 'manual'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Nhập Mã Token</span>
            </button>
          </div>

          {/* NỘI DUNG TAB 1: TẢI ẢNH QR LÊN */}
          {phuongThucQuet === 'upload' && (
            <div className="max-w-lg mx-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => xuLyTaiAnhQR(e.target.files?.[0])}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    xuLyTaiAnhQR(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/30 rounded-2xl p-8 cursor-pointer transition text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-100 group-hover:bg-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3 transition">
                  <FileImage className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Kéo thả ảnh QR vào đây hoặc <span className="text-brand-600 underline">chọn tệp từ máy</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hỗ trợ PNG, JPG, JPEG (Ảnh chụp màn hình vé hoặc mã QR trên điện thoại khách)
                </p>
                {dangXuLy && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-brand-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang quét và giải mã QR...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NỘI DUNG TAB 2: QUÉT BẰNG CAMERA */}
          {phuongThucQuet === 'camera' && (
            <div className="max-w-md mx-auto">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner border border-slate-800">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {/* Khung ngắm quét QR */}
                <div className="absolute inset-0 border-2 border-emerald-400/70 m-8 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce" />
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={cameraActive ? tatCamera : batCamera}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {cameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                  <span>{cameraActive ? 'Tắt Camera' : 'Mở Lại Camera'}</span>
                </button>
              </div>
            </div>
          )}

          {/* NỘI DUNG TAB 3: NHẬP MÃ THỦ CÔNG */}
          {phuongThucQuet === 'manual' && (
            <div className="max-w-lg mx-auto space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Nhập mã token QR hoặc dán chuỗi token"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={() => xuLyQuetMa()}
                disabled={dangXuLy}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                {dangXuLy ? 'Đang kiểm tra đối chiếu...' : 'Xác Minh Nhận Sân Ngay'}
              </button>
            </div>
          )}

          {/* THONG BAO LOI TOKEN KHONG DUNG DINH DANG */}
          {loi && (
            <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-bold text-left max-w-lg mx-auto">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{loi}</span>
            </div>
          )}

          {/* TH1: CANH BAO LECH CO SO (VENUE MISMATCH) - THEO DUNG LUA CHON 1 TRONG FLOWCHART */}
          {ketQua && ketQua.mismatch && (
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 bg-gradient-to-br from-amber-50 via-rose-50/50 to-amber-50 border-2 border-rose-500 rounded-[24px] text-left max-w-xl mx-auto shadow-xl"
            >
              <div className="flex items-center gap-2.5 text-rose-700 font-black text-base mb-3">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 animate-bounce" />
                <span>⚠️ BẬT CẢNH BÁO: KHÁCH ĐI NHẦM CƠ SỞ!</span>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-rose-200 space-y-2 text-xs text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <span className="text-slate-500 font-medium">Trạm nhân viên đang trực:</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    🏢 {coSoHienTai.name}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <span className="text-slate-500 font-medium">Cơ sở khách thực tế đã đặt:</span>
                  <span className="font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                    📍 {DANH_SACH_CO_SO.find(c => c.id === ketQua.bookingVenueId)?.name || `Cơ Sở #${ketQua.bookingVenueId}`}
                  </span>
                </div>
                <p>
                  • <strong>Địa chỉ đúng:</strong> {DANH_SACH_CO_SO.find(c => c.id === ketQua.bookingVenueId)?.address || 'Hà Nội'}
                </p>
                <p>
                  • <strong>Khung giờ đã đặt:</strong> <span className="font-bold text-brand-600">{ketQua.booking?.startSlot} - {ketQua.booking?.endSlot}</span> (Ngày {ketQua.booking?.bookingDate})
                </p>
                <p className="text-emerald-700 font-bold">
                  ✓ Trạng thái: Giữ nguyên lịch đặt & bảo lưu khung giờ tại đúng cơ sở.
                </p>
              </div>

              <div className="mt-4 p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900">
                <p className="font-bold mb-1">🎯 LỰA CHỌN 1: HƯỚNG DẪN ĐI ĐÚNG ĐỊA CHỈ (~15 PHÚT)</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Nhân viên giải thích khách đang ở nhầm cơ sở. Bấm nút dưới đây để mở chỉ đường Google Maps dẫn khách sang cơ sở đã đặt.
                </p>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={DANH_SACH_CO_SO.find(c => c.id === ketQua.bookingVenueId)?.mapUrl || 'https://maps.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Mở Google Maps Dẫn Đường (~15 phút)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Motion.div>
          )}

          {/* TH2: CHECK-IN DUNG CO SO THANH CONG */}
          {ketQua && ketQua.success && ketQua.booking && (
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 bg-emerald-50/90 border-2 border-emerald-500 rounded-[24px] text-left max-w-xl mx-auto shadow-xl"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-black text-base mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>CHECK-IN THÀNH CÔNG: BÀN GIAO SÂN & PHÁT CHÌA KHÓA</span>
              </div>

              <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 space-y-2 text-xs text-slate-700 font-medium">
                <p>• <strong>Cơ sở xác nhận:</strong> <span className="font-bold text-emerald-800">{coSoHienTai.name}</span></p>
                <p>• <strong>Mã đơn đặt:</strong> #{ketQua.booking.id}</p>
                <p>• <strong>Sân nhận bàn giao:</strong> <span className="font-black text-slate-900 text-sm">{ketQua.courtName || `Sân #${ketQua.booking.courtId}`}</span></p>
                <p>• <strong>Khung giờ thi đấu:</strong> <span className="font-bold text-brand-600">{ketQua.booking.startSlot} - {ketQua.booking.endSlot}</span></p>
                <p>• <strong>Tổng tiền:</strong> {Number(ketQua.booking.totalAmount).toLocaleString('vi-VN')} VND (Đã thanh toán đủ)</p>
                <p>• <strong>Thời gian Check-in:</strong> {new Date(ketQua.checkInTime).toLocaleTimeString('vi-VN')}</p>
              </div>

              <div className="mt-3 p-3 bg-emerald-100/60 rounded-xl text-center">
                <span className="text-xs text-emerald-800 font-black">
                  🔑 Đã cấp quyền vào sân: Nhân viên giao chìa khóa tủ đồ & bật hệ thống đèn sân {ketQua.courtName || ''}.
                </span>
              </div>
            </Motion.div>
          )}

        </div>

        {/* 3. DANH SÁCH KHÁCH ĐẶT SÂN HÔM NAY - CHECK-IN 1 CHẠM & QUẢN LÝ TRẢ SÂN */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  Quản Lý Nhận & Trả Sân
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                    {danhSachDonHomNay.length} LƯỢT ĐẶT
                  </span>
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[
                    { code: 'UPCOMING', label: 'Sắp tới (Hôm nay & tới)' },
                    { code: 'TODAY', label: 'Chỉ hôm nay' },
                    { code: 'TOMORROW', label: 'Ngày mai' }
                  ].map(f => (
                    <button
                      key={f.code}
                      type="button"
                      onClick={() => setBoLocNgay(f.code)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        boLocNgay === f.code
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={timKiemDon}
                  onChange={(e) => setTimKiemDon(e.target.value)}
                  placeholder="Tìm mã đơn, tên sân..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-brand-500 outline-none w-44 transition"
                />
              </div>
              <button
                type="button"
                onClick={taiDanhSachDonHomNay}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dangTaiDon ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {traSanMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{traSanMsg}</span>
            </div>
          )}

          {/* Bảng danh sách đơn đặt hôm nay */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Mã Đơn / Khách</th>
                  <th className="py-2.5 px-3">Sân Thi Đấu</th>
                  <th className="py-2.5 px-3">Khung Giờ</th>
                  <th className="py-2.5 px-3">Tiền Thuê</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác Quầy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {danhSachDonHomNay
                  .filter(d => {
                    if (!timKiemDon) return true;
                    const q = timKiemDon.toLowerCase();
                    return (
                      d.id?.toString().includes(q) ||
                      d.courtName?.toLowerCase().includes(q) ||
                      d.status?.toLowerCase().includes(q)
                    );
                  })
                  .map((don) => {
                    const isCompleted = don.status === 'COMPLETED';
                    const isCheckedIn = don.status === 'CHECKED_IN';
                    const isConfirmed = don.status === 'CONFIRMED';
                    const isPending = don.status === 'PENDING_PAYMENT';

                    return (
                      <tr key={don.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <span className="font-mono text-brand-600 font-bold">#{don.id}</span>
                          <span className="block text-[11px] text-slate-400">Khách #{don.customerId}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800">{don.courtName || `Sân #${don.courtId}`}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                          <span className="block font-bold text-slate-800">{don.bookingDate}</span>
                          <span>{don.startSlot?.substring(0, 5)} - {don.endSlot?.substring(0, 5)}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                          {Number(don.totalAmount).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-3">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                              <CheckCircle className="w-3 h-3 text-slate-500" /> Đã Trả Sân
                            </span>
                          ) : isCheckedIn ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" /> Đang Sử Dụng
                            </span>
                          ) : isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Đã Thanh Toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                              Chờ Thanh Toán
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {isCheckedIn && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => xuLyTraSan(don.id)}
                                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shadow-brand-500/20"
                                title="Khách trả sân, hoàn tất ca thi đấu"
                              >
                                <Flag className="w-3 h-3" />
                                <span>Trả Sân (Hoàn Tất)</span>
                              </button>
                            </div>
                          )}
                          {isConfirmed && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => xuLyQuetMa(null, don.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Check-in (1 Chạm)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => xuLyTraSan(don.id)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Bàn giao xong, trả sân trực tiếp"
                              >
                                <Flag className="w-3 h-3" />
                                <span>Trả Sân</span>
                              </button>
                            </div>
                          )}
                          {isCompleted && (
                            <span className="text-slate-400 font-semibold text-[11px] italic">
                              Đã hoàn tất ca
                            </span>
                          )}
                          {isPending && (
                            <span className="text-amber-600 text-[11px] font-bold">
                              Chờ khách chuyển khoản
                            </span>
                          )}
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

        {/* ================= TAB 2: YÊU CẦU PHỤC VỤ TẠI SÂN (LIVE DISPATCHER) ================= */}
        {tabTram === 'YEU_CAU' && (
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-200/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  Yêu Cầu Phục Vụ Tại Sân (Đồng bộ thời gian thực)
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tiếp nhận các yêu cầu gọi nước / dụng cụ từ khách đã Check-in tại <strong className="text-slate-800">{coSoHienTai.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Timer className="w-4 h-4 text-brand-600" />
                <span>Cam kết SLA: &lt; 5 phút</span>
              </div>
              <button
                type="button"
                onClick={taiYeuCauDichVu}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                title="Làm mới yêu cầu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Danh sach yeu cau */}
          {yeuCauThuocCoSo.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Coffee className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Hiện tại không có yêu cầu dịch vụ nào đang chờ tại {coSoHienTai.name}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {yeuCauThuocCoSo.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-left ${
                    item.status === 'PENDING'
                      ? 'bg-rose-50/40 border-rose-200 shadow-sm'
                      : item.status === 'PREPARING'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-slate-900 text-white">
                        {item.courtName}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {item.customerName} (Vé #{item.bookingId})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                      </span>
                      
                      {item.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                          Chờ tiếp nhận
                        </span>
                      )}
                      {item.status === 'PREPARING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                          Đang mang ra sân
                        </span>
                      )}
                      {item.status === 'DELIVERED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                          Đã giao tận sân
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pt-0.5">
                      <Coffee className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{item.items}</span>
                    </p>
                    {Number(item.totalAmount || 0) > 0 && (
                      <p className="text-xs font-black text-amber-700">
                        Thu tại sân: {Number(item.totalAmount).toLocaleString('vi-VN')} đ
                      </p>
                    )}
                  </div>

                  {/* Nut thao tac cua nhan vien truc */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => tiepNhanDichVu(item.id)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        Tiếp Nhận Yêu Cầu
                      </button>
                    )}
                    {item.status === 'PREPARING' && (
                      <button
                        type="button"
                        onClick={() => hoanTatDichVu(item.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Bàn Giao Tận Sân</span>
                      </button>
                    )}
                    {item.status === 'DELIVERED' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đã hoàn tất
                      </span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
        )}

      </div>
    </div>
  );
}
