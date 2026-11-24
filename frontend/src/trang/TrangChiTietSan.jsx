/**
 * File: TrangChiTietSan.jsx
 * Mục đích: Trang chi tiết đặt sân theo đúng ngữ cảnh bộ môn và cơ sở đã chọn.
 * Cải tiến chuẩn hóa UX:
 * 1. LOẠI BỎ HOÀN TOÀN panel chọn các môn khác (giữ đúng context bộ môn đang xem).
 * 2. Cho phép chọn các loại sân con / mặt sân với các mức giá khác nhau (cỏ tiêu chuẩn, cỏ FIFA, có mái vòm, silicon...).
 * 3. Module giới thiệu đặc quyền & tính năng nổi bật của sân (Có mái vòm, khu đợi dự bị, đèn LED, tắm nóng lạnh, camera AI).
 * 4. Dịch vụ & tiện ích kèm theo theo đúng chuyên môn của từng bộ môn (Bóng đá, Cầu lông, Tennis, Bóng rổ).
 * 5. Bảng tính tiền realtime bên cạnh minh bạch, tự động cập nhật khi đổi loại sân hoặc chọn dịch vụ.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Trophy, 
  Phone, 
  Check, 
  Users, 
  AlertCircle, 
  Tag, 
  Flame, 
  Layers, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import { THONG_TIN_CO_SO, BIEN_THE_SAN_CON, DAC_QUYEN_SAN } from '../hangso/coSoSportKing';
import { DICH_VU_THEO_MON } from '../hangso/danhMucDichVu';

// Danh sach voucher mac dinh he thong ESportKing
const DANH_SACH_VOUCHERS_CHUYEN_SAN = [
  { code: 'CHAOBANMOI', discountPercent: 20, maxDiscount: 50000, minOrderAmount: 100000, desc: 'Giảm 20% cho thành viên mới (tối đa 50k)' },
  { code: 'THELUC2026', discountPercent: 15, maxDiscount: 40000, minOrderAmount: 100000, desc: 'Giảm 15% tối đa 40k ngày thường' },
  { code: 'CUOITUAN', discountPercent: 15, maxDiscount: 80000, minOrderAmount: 150000, desc: 'Giảm 15% tối đa 80k cuối tuần' },
  { code: 'CUOITUANXU', discountPercent: 0, discountAmount: 25000, minOrderAmount: 150000, desc: 'Giảm ngay 25k cho đơn từ 150k' },
  { code: 'VIPSPORT', discountPercent: 0, discountAmount: 30000, minOrderAmount: 200000, desc: 'Giảm ngay 30k cho khách thân thiết (đơn từ 200k)' },
  { code: 'PICKLE50', discountPercent: 10, maxDiscount: 35000, minOrderAmount: 100000, desc: 'Giảm 10% tối đa 35k cho sân thể thao' },
  { code: 'TRIAN2026', discountPercent: 0, discountAmount: 20000, minOrderAmount: 100000, desc: 'Giảm ngay 20k tri ân khách hàng (đơn từ 100k)' },
  { code: 'THETHAO50', discountPercent: 0, discountAmount: 50000, minOrderAmount: 200000, desc: 'Giảm ngay 50.000đ cho đơn từ 200k' }
];

export const tinhTienGiamVoucherThucTe = (v, tongTien) => {
  if (!v || !tongTien || tongTien <= 0) return 0;
  if (v.minOrderAmount && tongTien < v.minOrderAmount) return 0;
  if (v.discountPercent && Number(v.discountPercent) > 0) {
    const giam = Math.round(tongTien * (Number(v.discountPercent) / 100));
    return v.maxDiscount ? Math.min(giam, Number(v.maxDiscount)) : giam;
  }
  if (v.discountAmount && Number(v.discountAmount) > 0) {
    return Math.min(Number(v.discountAmount), tongTien);
  }
  return 0;
};

// Hàm lấy ngày theo offset
const layNgayTheoOffset = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const nam = d.getFullYear();
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return `${nam}-${thang}-${ngay}`;
};

// Danh sách khung giờ thể thao tiêu chuẩn
const DANH_SACH_KHUNG_GIO = [
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
  { value: '21:00:00', label: '21:00 (Đêm muộn)' },
];

// Hàm kiểm tra khung giờ đã qua so với thời gian thực (ít nhất 15 phút)
const kiemTraGioQuaKhu = (dateStr, timeStr) => {
  const homNay = layNgayTheoOffset(0);
  if (dateStr !== homNay) return false;
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  return slotDate.getTime() - now.getTime() < 15 * 60 * 1000;
};

export default function TrangChiTietSan({ user: propUser }) {
  const { id } = useParams(); // venueId (1, 2, hoặc 3)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Xác định cơ sở
  const venueIdNum = Number(id) || 1;
  const coSoHienTai = THONG_TIN_CO_SO[venueIdNum] || THONG_TIN_CO_SO[1];

  // Danh sách sân con tải trực tiếp từ backend
  const [backendCourts, setBackendCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchVenueData = async () => {
      try {
        setLoadingCourts(true);
        const res = await apiDichVu.layChiTietCumSan(venueIdNum);
        if (active && res.data?.courts) {
          setBackendCourts(res.data.courts);
        }
      } catch (e) {
        console.warn('Không thể tải danh sách sân từ backend:', e);
      } finally {
        if (active) setLoadingCourts(false);
      }
    };
    fetchVenueData();
    return () => { active = false; };
  }, [venueIdNum]);

  // Xác định bộ môn từ URL param (mặc định FOOTBALL nếu không có hoặc không hợp lệ)
  const sportParam = (searchParams.get('sport') || 'FOOTBALL').toUpperCase();
  const maMon = ['FOOTBALL', 'BADMINTON', 'TENNIS', 'BASKETBALL'].includes(sportParam) ? sportParam : 'FOOTBALL';

  // Xác định quy mô từ URL param (với football là 5, 7 hoặc 11)
  const sizeParam = searchParams.get('size') || (maMon === 'FOOTBALL' ? '7' : 'default');
  const courtCodeParam = searchParams.get('courtCode') || '';

  // Danh sách các biến thể sân chuẩn cho môn & quy mô này (3 - 4 thẻ chuẩn, không nhân bản lộn xộn)
  const danhSachSanBienThe = useMemo(() => {
    let templates = [];
    if (maMon === 'FOOTBALL') {
      const sizeKey = ['5', '7', '11'].includes(sizeParam) ? sizeParam : '7';
      templates = BIEN_THE_SAN_CON.FOOTBALL[sizeKey] || BIEN_THE_SAN_CON.FOOTBALL['7'];
    } else {
      templates = BIEN_THE_SAN_CON[maMon]?.default || BIEN_THE_SAN_CON.BADMINTON.default;
    }

    // Lọc các sân thực tế từ backend cùng bộ môn
    const matchingBackendCourts = backendCourts.filter(c => {
      const sName = (c.sportTypeName || '').toLowerCase();
      if (maMon === 'FOOTBALL') return sName.includes('bóng đá') || sName.includes('football') || c.sportTypeId === 2;
      if (maMon === 'BADMINTON') return sName.includes('cầu lông') || sName.includes('badminton') || c.sportTypeId === 1;
      if (maMon === 'TENNIS') return sName.includes('tennis') || c.sportTypeId === 4;
      if (maMon === 'BASKETBALL') return sName.includes('bóng rổ') || sName.includes('basketball') || c.sportTypeId === 5;
      return false;
    });

    // Luôn hiển thị đúng số lượng thẻ mẫu chuẩn (3-4 thẻ), gán ID duy nhất và giá từ backend
    return templates.map((tpl, idx) => {
      // Tìm sân thực tế khớp courtCode hoặc code danh mục hoặc theo vị trí
      let realCourt = null;
      if (courtCodeParam) {
        realCourt = matchingBackendCourts.find(c => c.courtCode === courtCodeParam || (c.name && c.name.includes(courtCodeParam)));
      }
      if (!realCourt && tpl.code) {
        realCourt = matchingBackendCourts.find(c => c.courtCode?.includes(tpl.code) || c.configType?.includes(tpl.code));
      }
      if (!realCourt && matchingBackendCourts.length > 0) {
        realCourt = matchingBackendCourts[idx % matchingBackendCourts.length];
      }

      // Số lượng sân ngẫu nhiên 3, 4, 5 sân theo từng loại
      const counts = [5, 4, 3, 5];
      const availableCount = counts[(idx + venueIdNum) % counts.length];

      return {
        ...tpl,
        id: tpl.id, // ID duy nhất của từng loại sân (101, 102, 103, 104) để không bao giờ bị trùng check
        courtCode: realCourt?.courtCode || tpl.code || courtCodeParam,
        realCourtId: realCourt ? realCourt.id : tpl.id,
        price: realCourt && Number(realCourt.basePrice) > 0 ? Number(realCourt.basePrice) : tpl.price,
        status: realCourt?.status || 'ACTIVE',
        availableCount
      };
    });
  }, [maMon, sizeParam, backendCourts, venueIdNum, courtCodeParam]);

  const [hinhThucThiDau, setHinhThucThiDau] = useState('Đôi (2v2)');

  // State chọn sân con cụ thể (ưu tiên khớp courtCode từ URL nếu có)
  const [selectedCourt, setSelectedCourt] = useState(() => {
    if (courtCodeParam) {
      const found = danhSachSanBienThe.find(c => 
        c.courtCode === courtCodeParam || c.code === courtCodeParam || (c.name && c.name.includes(courtCodeParam))
      );
      if (found) return found;
    }
    return danhSachSanBienThe[0];
  });

  // Cập nhật khi danh sách biến thể thay đổi
  useEffect(() => {
    if (danhSachSanBienThe && danhSachSanBienThe.length > 0) {
      if (courtCodeParam) {
        const found = danhSachSanBienThe.find(c => 
          c.courtCode === courtCodeParam || c.code === courtCodeParam || (c.name && c.name.includes(courtCodeParam))
        );
        if (found) {
          setSelectedCourt(found);
          return;
        }
      }
      setSelectedCourt(danhSachSanBienThe[0]);
    }
  }, [danhSachSanBienThe, courtCodeParam]);

  // State tiện ích kèm theo
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // State thời gian thuê
  const [selectedDate, setSelectedDate] = useState(() => layNgayTheoOffset(0));
  const [startSlot, setStartSlot] = useState(() => {
    // Tự động chọn khung giờ hợp lệ đầu tiên nếu đặt hôm nay
    const homNay = layNgayTheoOffset(0);
    const hopLe = DANH_SACH_KHUNG_GIO.find(s => !kiemTraGioQuaKhu(homNay, s.value));
    return hopLe ? hopLe.value : '18:00:00';
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [previewGia, setPreviewGia] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Tự động điều chỉnh giờ bắt đầu sang khung giờ tương lai khả dụng khi người dùng đổi ngày
  useEffect(() => {
    if (kiemTraGioQuaKhu(selectedDate, startSlot)) {
      const hopLe = DANH_SACH_KHUNG_GIO.find(s => !kiemTraGioQuaKhu(selectedDate, s.value));
      if (hopLe) {
        setStartSlot(hopLe.value);
      }
    }
  }, [selectedDate, startSlot]);

  // Voucher lấy từ Backend & Đồng bộ hệ thống
  const voucherUrlParam = searchParams.get('voucher');
  const [daTuChonVoucher, setDaTuChonVoucher] = useState(!!voucherUrlParam);
  const [vouchers, setVouchers] = useState(DANH_SACH_VOUCHERS_CHUYEN_SAN);
  const [selectedVoucher, setSelectedVoucher] = useState(() => voucherUrlParam || '');

  // Khung giờ khả dụng từ Backend
  const [khungGioKhaDung, setKhungGioKhaDung] = useState([]);

  // Tải danh sách voucher thật từ Database và kết hợp với dữ liệu chuẩn
  useEffect(() => {
    apiDichVu.layDanhSachUuDai()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const map = new Map();
          DANH_SACH_VOUCHERS_CHUYEN_SAN.forEach(v => map.set(v.code, { ...v }));
          res.data.forEach(v => {
            const cur = map.get(v.code) || {};
            map.set(v.code, {
              ...cur,
              ...v,
              desc: v.description || cur.desc || (v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`)
            });
          });
          setVouchers(Array.from(map.values()));
        }
      })
      .catch(() => {});
  }, []);

  // Tải lịch trống khả dụng của sân con đang chọn
  useEffect(() => {
    const courtId = selectedCourt?.realCourtId || selectedCourt?.id;
    if (!courtId) return;

    if (selectedDate) {
      apiDichVu.layKhungGioKhaDung(courtId, selectedDate)
        .then(res => {
          setKhungGioKhaDung(res.data || []);
        })
        .catch(() => {
          setKhungGioKhaDung([]);
        });
    }
  }, [selectedCourt, selectedDate]);

  // Danh mục dịch vụ chuyên biệt cho môn hiện tại
  const danhSachDichVu = useMemo(() => {
    return DICH_VU_THEO_MON[maMon] || DICH_VU_THEO_MON.FOOTBALL;
  }, [maMon]);

  // Tổng tiền các dịch vụ kèm theo đã chọn
  const tongTienDichVu = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const item = danhSachDichVu.find(d => d.id === addonId);
      return sum + (item ? item.price : 0);
    }, 0);
  }, [selectedAddons, danhSachDichVu]);

  // Gọi API tính báo giá Realtime từ Backend Booking Service (chuẩn xác 100% về tiền & voucher & giờ đóng/mở)
  useEffect(() => {
    const courtId = selectedCourt?.realCourtId || selectedCourt?.id;
    if (!courtId || !selectedDate || !startSlot || !durationMinutes) {
      setPreviewGia(null);
      setPreviewError(null);
      return;
    }

    let cancel = false;
    // Ngay khi đổi lựa chọn: vô hiệu hóa báo giá cũ để tránh race condition & hiển thị sai tiền
    setPreviewGia(null);
    setPreviewError(null);
    setPreviewLoading(true);

    const slotFormatted = startSlot.length === 5 ? `${startSlot}:00` : startSlot;

    apiDichVu.tinhBaoGiaSan({
      courtId,
      bookingDate: selectedDate,
      startSlot: slotFormatted,
      durationMinutes: Number(durationMinutes),
      voucherCode: selectedVoucher || null,
      addonAmount: tongTienDichVu,
      addonSummary: selectedAddons.map(id => danhSachDichVu.find(d => d.id === id)?.name).filter(Boolean).join(', ')
    })
      .then(res => {
        if (!cancel && res.data) {
          setPreviewGia(res.data);
          setPreviewError(null);
        }
      })
      .catch(err => {
        if (!cancel) {
          console.warn('Lỗi gọi preview báo giá từ backend:', err);
          const msg = err.response?.data?.message || 'Khung giờ này không khả dụng hoặc vượt quá giới hạn.';
          setPreviewError(msg);
          setPreviewGia(null);
        }
      })
      .finally(() => {
        if (!cancel) setPreviewLoading(false);
      });

    return () => {
      cancel = true;
    };
  }, [selectedCourt?.realCourtId, selectedCourt?.id, selectedDate, startSlot, durationMinutes, selectedVoucher, tongTienDichVu]);

  // Trạng thái submit & hết hạn phiên
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Toggle dịch vụ kèm theo
  const toggleDichVu = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Giờ đóng cửa lấy động từ Backend (hoặc fallback 22:30). Tính thời lượng tối đa cho phép
  const gioDongCuaStr = previewGia?.closeTime || '22:30:00';
  const gioDongCuaPhut = useMemo(() => {
    const [h, m] = gioDongCuaStr.split(':').map(Number);
    return (isNaN(h) ? 22 : h) * 60 + (isNaN(m) ? 30 : m);
  }, [gioDongCuaStr]);

  const thoiLuongToiDaPhut = useMemo(() => {
    const [h, m] = (startSlot || '18:00:00').split(':').map(Number);
    const gioBatDauPhut = (isNaN(h) ? 18 : h) * 60 + (isNaN(m) ? 0 : m);
    const phutConLai = gioDongCuaPhut - gioBatDauPhut;
    return Math.max(30, Math.min(720, phutConLai));
  }, [startSlot, gioDongCuaPhut]);

  // Tự động hạ durationMinutes nếu vượt quá giờ đóng cửa
  useEffect(() => {
    if (durationMinutes > thoiLuongToiDaPhut) {
      setDurationMinutes(thoiLuongToiDaPhut);
    }
  }, [thoiLuongToiDaPhut, durationMinutes]);

  // Tính toán tiền sân: Ưu tiên dữ liệu tính giá từ Backend preview, fallback nếu chưa tải xong
  const donGiaSan = previewGia?.basePrice != null ? Number(previewGia.basePrice) : (selectedCourt?.price || 300000);
  
  const tongTienSan = useMemo(() => {
    if (previewGia?.totalCourtPrice != null) {
      return Number(previewGia.totalCourtPrice);
    }
    let tong = 0;
    const [hGoc, mGoc] = (startSlot || '18:00:00').split(':').map(Number);
    const numBlocks = Math.round(durationMinutes / 30);
    for (let i = 0; i < numBlocks; i++) {
      const phut = hGoc * 60 + (mGoc || 0) + i * 30;
      const blockHour = Math.floor(phut / 60);
      const isPeak = (blockHour >= 17 && blockHour < 21);
      const hourly = isPeak ? donGiaSan * 1.2 : donGiaSan;
      tong += Math.round(hourly / 2);
    }
    return tong;
  }, [previewGia?.totalCourtPrice, donGiaSan, startSlot, durationMinutes]);

  // Tìm voucher tốt nhất cho số tiền thuê sân hiện tại
  const bestVoucherInfo = useMemo(() => {
    if (!tongTienSan || tongTienSan <= 0 || !vouchers.length) return null;
    let best = null;
    let maxGiam = 0;

    for (const v of vouchers) {
      const g = tinhTienGiamVoucherThucTe(v, tongTienSan);
      if (g > maxGiam) {
        maxGiam = g;
        best = v;
      }
    }
    return best ? { voucher: best, discount: maxGiam } : null;
  }, [tongTienSan, vouchers]);

  // Tự động áp dụng mã giảm giá tốt nhất nếu người dùng chưa tự tay chọn hoặc hủy chọn
  useEffect(() => {
    if (!daTuChonVoucher && bestVoucherInfo) {
      setSelectedVoucher(bestVoucherInfo.voucher.code);
    }
  }, [bestVoucherInfo, daTuChonVoucher]);

  // Tiền giảm voucher: Ưu tiên backend preview
  const tienGiam = useMemo(() => {
    if (previewGia?.discountAmount != null) {
      return Number(previewGia.discountAmount);
    }
    if (!selectedVoucher) return 0;
    const v = vouchers.find(x => x.code === selectedVoucher);
    if (!v) return 0;
    const tongTruocGiam = tongTienSan + tongTienDichVu;
    if (v.minOrderAmount && tongTruocGiam < v.minOrderAmount) {
      return 0;
    }
    if (v.discountPercent) {
      const giam = Math.round(tongTruocGiam * (v.discountPercent / 100));
      return v.maxDiscount ? Math.min(giam, v.maxDiscount) : Math.min(giam, 100000);
    }
    if (v.discountAmount) {
      return Math.min(v.discountAmount, tongTruocGiam);
    }
    return 0;
  }, [previewGia?.discountAmount, selectedVoucher, vouchers, tongTienSan, tongTienDichVu]);

  // Tiền thanh toán trọn gói (Tiền sân + Tiền dịch vụ kèm theo - Tiền giảm voucher)
  const tongThanhToan = useMemo(() => {
    if (previewGia?.finalAmount != null) {
      return Number(previewGia.finalAmount);
    }
    return Math.max(0, tongTienSan + tongTienDichVu - tienGiam);
  }, [previewGia?.finalAmount, tongTienSan, tongTienDichVu, tienGiam]);

  // Giờ bắt đầu và kết thúc
  const gioBatDauHienThi = startSlot.slice(0, 5);
  const gioKetThucHienThi = useMemo(() => {
    if (previewGia?.endSlot) {
      return previewGia.endSlot.slice(0, 5);
    }
    const [h, m] = (startSlot || '18:00:00').split(':').map(Number);
    const endMinutes = h * 60 + (m || 0) + durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }, [previewGia?.endSlot, startSlot, durationMinutes]);

  // Hiển thị thời lượng chữ
  const thoiLuongHienThi = useMemo(() => {
    if (durationMinutes % 60 === 0) {
      return `${durationMinutes / 60} tiếng`;
    }
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return h > 0 ? `${h}h${m}p` : `${m} phút`;
  }, [durationMinutes]);

  // Tên bộ môn tiếng Việt
  const tenMonTiengViet = useMemo(() => {
    switch(maMon) {
      case 'FOOTBALL': return 'Bóng Đá';
      case 'BADMINTON': return 'Cầu Lông';
      case 'TENNIS': return 'Tennis';
      case 'BASKETBALL': return 'Bóng Rổ';
      default: return 'Thể Thao';
    }
  }, [maMon]);

  // Icon môn
  const iconMon = useMemo(() => {
    switch(maMon) {
      case 'FOOTBALL': return '⚽';
      case 'BADMINTON': return '🏸';
      case 'TENNIS': return '🎾';
      case 'BASKETBALL': return '🏀';
      default: return '🏆';
    }
  }, [maMon]);

  // Xử lý xác nhận đặt sân & thanh toán
  const handleXacNhanDatSan = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Kiem tra nguoi dung da dang nhap chua
      if (!propUser) {
        setErrorMsg('Vui lòng đăng nhập để tiến hành đặt sân và thanh toán.');
        navigate('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }

      if (!selectedCourt || !selectedCourt.id) {
        setErrorMsg('Vui lòng chọn loại sân con cần đặt.');
        return;
      }

      if (previewLoading) {
        setErrorMsg('Hệ thống đang tính báo giá chính xác. Vui lòng chờ 1-2 giây rồi thử lại.');
        return;
      }

      if (previewError) {
        setErrorMsg(`Không thể đặt sân: ${previewError}`);
        return;
      }

      if (!previewGia) {
        setErrorMsg('Vui lòng đợi hệ thống cập nhật bảng báo giá hợp lệ.');
        return;
      }

      const targetCourtId = selectedCourt.realCourtId || selectedCourt.id;
      if (previewGia.courtId !== targetCourtId || previewGia.bookingDate !== selectedDate || previewGia.durationMinutes !== Number(durationMinutes)) {
        setErrorMsg('Báo giá chưa đồng bộ với lựa chọn mới. Vui lòng đợi trong giây lát để hệ thống cập nhật.');
        return;
      }

      // Kiểm tra đặt sân cách ít nhất 15 phút nếu đặt cho ngày hôm nay
      const homNay = layNgayTheoOffset(0);
      if (selectedDate === homNay) {
        const now = new Date();
        const [h, m] = gioBatDauHienThi.split(':').map(Number);
        const slotDate = new Date();
        slotDate.setHours(h, m, 0, 0);
        if (slotDate.getTime() - now.getTime() < 15 * 60 * 1000) {
          setErrorMsg('Giờ bắt đầu phải cách thời điểm hiện tại ít nhất 15 phút. Vui lòng chọn khung giờ muộn hơn.');
          return;
        }
      }

      // Lưu thông tin đơn đặt tạm vào localStorage để trang Thanh Toán lấy
      const donDatTam = {
        venueId: previewGia?.venueId || venueIdNum,
        venueName: coSoHienTai.tenDayDu,
        venueAddress: coSoHienTai.diaChi,
        sportCode: maMon,
        sportName: tenMonTiengViet,
        courtId: selectedCourt.realCourtId || selectedCourt.id,
        courtName: previewGia?.courtName || selectedCourt.name,
        surface: selectedCourt.surface,
        playFormat: ['BADMINTON', 'TENNIS'].includes(maMon) ? hinhThucThiDau : (maMon === 'FOOTBALL' ? `Sân ${sizeParam} người` : 'Tiêu chuẩn'),
        bookingDate: selectedDate,
        startTime: `${gioBatDauHienThi}:00`,
        endTime: `${gioKetThucHienThi}:00`,
        durationMinutes: durationMinutes,
        durationHours: Number((durationMinutes / 60).toFixed(1)),
        courtPrice: donGiaSan,
        totalCourtPrice: tongTienSan,
        addons: selectedAddons.map(id => danhSachDichVu.find(d => d.id === id)).filter(Boolean),
        addonsPrice: tongTienDichVu,
        voucherCode: selectedVoucher,
        discountAmount: tienGiam,
        finalPrice: tongThanhToan
      };

      localStorage.setItem('esportking_current_booking', JSON.stringify(donDatTam));

      // Đặt chính xác vào sân con khách đã chọn (không tự ý đổi sang sân khác)
      const payloadApi = {
        courtId: targetCourtId,
        bookingDate: selectedDate,
        startSlot: `${gioBatDauHienThi}:00`,
        durationMinutes: Number(durationMinutes),
        slotCount: Math.ceil(durationMinutes / 60),
        voucherCode: selectedVoucher || null,
        addonAmount: tongTienDichVu,
        addonSummary: selectedAddons.map(id => danhSachDichVu.find(d => d.id === id)?.name).filter(Boolean).join(', ')
      };
      const idempotencyKey = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      let res = null;
      try {
        res = await apiDichVu.taoDonDat(payloadApi, idempotencyKey);
      } catch (err) {
        const msg = err.response?.data?.message || '';
        if (err.response?.status === 409 || msg.toLowerCase().includes('khoa') || msg.toLowerCase().includes('da bi')) {
          throw new Error(`Khung giờ ${gioBatDauHienThi} - ${gioKetThucHienThi} tại sân này đã có người đặt trước. Vui lòng chọn khung giờ khác.`);
        }
        throw err;
      }

      if (!res?.data?.id) {
        throw new Error('Hệ thống không trả về mã đơn đặt hợp lệ');
      }

      if (res.data?.id) {
        try {
          localStorage.setItem(`esportking_booking_addons_${res.data.id}`, JSON.stringify(donDatTam));
        } catch {}
        navigate(`/thanh-toan/${res.data.id}`);
        return;
      }

    } catch (err) {
      console.error('Lỗi khi tạo đơn đặt sân:', err);
      const statusCode = err.response?.status;
      const serverMsg = err.response?.data?.message || err.message || '';

      if (statusCode === 401 || serverMsg.toLowerCase().includes('dang nhap')) {
        setErrorMsg('Phiên đăng nhập an toàn của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục hoàn tất đặt chỗ.');
        setIsSessionExpired(true);
      } else if (serverMsg.toLowerCase().includes('15 phut') || serverMsg.toLowerCase().includes('booking_time_invalid')) {
        setErrorMsg('Khung giờ bắt đầu phải cách thời điểm hiện tại ít nhất 15 phút. Vui lòng chọn khung giờ muộn hơn.');
      } else {
        setErrorMsg(serverMsg || 'Có lỗi xảy ra khi xác nhận đặt sân. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7f5] pb-24">
      
      {/* 1. THANH BREADCRUMB & HEADER THÔNG TIN NGỮ CẢNH */}
      <section className="bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
            <button onClick={() => navigate('/tim-san')} className="hover:text-brand-600 transition">
              Tìm Sân
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button onClick={() => navigate(`/tim-san?sport=${maMon}`)} className="hover:text-brand-600 transition">
              {iconMon} Môn {tenMonTiengViet}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{coSoHienTai.ten}</span>
          </nav>

          {/* Tiêu đề & Thông tin cơ sở */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-sm flex items-center gap-1 ${coSoHienTai.badgeClass}`}>
                  {coSoHienTai.icon} {coSoHienTai.ten}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-brand-50 text-brand-700 border border-brand-200">
                  {iconMon} BỘ MÔN: {tenMonTiengViet.toUpperCase()}
                </span>

                {maMon === 'FOOTBALL' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-900 text-white">
                    QUY MÔ: SÂN {sizeParam} NGƯỜI
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {coSoHienTai.tenDayDu}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {coSoHienTai.diaChi}
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  Hotline đặt sân: {coSoHienTai.hotline}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. NỘI DUNG CHÍNH (2 CỘT): TRÁI (LỰA CHỌN SÂN & DỊCH VỤ) - PHẢI (STICKY SUMMARY TÍNH TIỀN) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI (2/3): CÁC BƯỚC CHỌN SÂN & DỊCH VỤ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* =========================================================================
                BƯỚC 1: CHỌN LOẠI SÂN CON & MẶT SÂN VỚI CÁC MỨC GIÁ KHÁC NHAU
                (ĐÃ BỎ HOÀN TOÀN TAB CÁC MÔN KHÁC, CHỈ TẬP TRUNG VÀO CÁC MẶT SÂN)
               ========================================================================= */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <span>Chọn Loại Mặt Sân & Biến Thể Bạn Muốn Thuê</span>
                  </h2>
                  <p className="text-xs text-slate-400 ml-8 mt-0.5">
                    Mỗi sân có đặc tính mặt cỏ, mái che và mức giá thuê theo giờ khác nhau
                  </p>
                </div>

                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                  {danhSachSanBienThe.length} loại sân khả dụng
                </span>
              </div>

              {/* Lưới các biến thể sân con */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {danhSachSanBienThe.map((court) => {
                  const isSelected = selectedCourt?.id === court.id;
                  const isMaintenance = court.status === 'MAINTENANCE' || court.status === 'INACTIVE';

                  return (
                    <div
                      key={court.id}
                      onClick={() => setSelectedCourt(court)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? isMaintenance
                            ? 'border-amber-500 bg-amber-50/40 shadow-md ring-1 ring-amber-400'
                            : 'border-brand-600 bg-brand-50/40 shadow-md ring-1 ring-brand-500/30'
                          : isMaintenance
                            ? 'border-slate-200 bg-slate-50/80 opacity-80 hover:border-amber-300'
                            : 'border-slate-200/90 hover:border-brand-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Tag góc */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isSelected ? (isMaintenance ? 'bg-amber-600 text-white' : 'bg-brand-600 text-white') : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isMaintenance ? 'BẢO TRÌ' : court.tag}
                        </span>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? (isMaintenance ? 'border-amber-600 bg-amber-600 text-white' : 'border-brand-600 bg-brand-600 text-white') : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{court.icon}</span>
                          <h3 className={`text-sm font-black line-clamp-1 ${
                            isSelected ? 'text-brand-900' : 'text-slate-900'
                          }`}>
                            {court.name}
                          </h3>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {court.desc}
                        </p>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                            📍 {court.surface}
                          </div>
                          {isMaintenance ? (
                            <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 flex items-center gap-1">
                              <span>⚠️ Đang bảo trì / Tạm khóa</span>
                            </div>
                          ) : (
                            <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Còn {court.availableCount || 4} sân trống</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Giá thuê */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-400 font-semibold">Đơn giá:</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-black text-rose-600">
                            {court.price.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">đ/giờ</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Tùy chọn Hình Thức Thi Đấu (Đơn 1v1 / Đôi 2v2) cho Cầu Lông & Tennis */}
              {['BADMINTON', 'TENNIS'].includes(maMon) && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>👥 Chọn Hình Thức Thi Đấu Mong Muốn</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cả 2 chế độ thi đấu đều diễn ra trên cùng sân vật lý tiêu chuẩn (dùng chung lịch)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setHinhThucThiDau('Đơn (1v1)')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        hinhThucThiDau === 'Đơn (1v1)'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🏸 Đánh Đơn (1v1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHinhThucThiDau('Đôi (2v2)')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        hinhThucThiDau === 'Đôi (2v2)'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      👥 Đánh Đôi (2v2)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================================
                BƯỚC 2: CHỌN NGÀY & THỜI GIAN THUÊ (SMART TIME SELECTOR)
               ========================================================================= */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Chọn Ngày & Thời Gian Thuê Sân</span>
                </h2>
                <p className="text-xs text-slate-400 ml-8 mt-0.5">Khóa slot thời gian thực, không lo trùng lịch</p>
              </div>

              {/* Chọn Ngày */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <span>Ngày thi đấu:</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[0, 1, 2].map((offset) => {
                    const dateStr = layNgayTheoOffset(offset);
                    const label = offset === 0 ? '⚡ Hôm nay' : offset === 1 ? '🌟 Ngày mai' : '🗓️ Ngày kia';
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={offset}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                          ({dateStr.split('-').slice(1).reverse().join('/')})
                        </span>
                      </button>
                    );
                  })}
                  <input
                    type="date"
                    value={selectedDate}
                    min={layNgayTheoOffset(0)}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Giờ bắt đầu & Thời lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span>Giờ bắt đầu thuê:</span>
                    </span>
                    <span className="text-[10px] text-amber-600 font-semibold">
                      ⚡ 17:00-21:00: Giờ vàng (+20%)
                    </span>
                  </label>
                  <select
                    value={startSlot}
                    onChange={(e) => setStartSlot(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {DANH_SACH_KHUNG_GIO.map((slot) => {
                      const laQuaKhu = kiemTraGioQuaKhu(selectedDate, slot.value);
                      const prefix = slot.value.slice(0, 5);
                      const kg = khungGioKhaDung.find(k => (k.slotStart || '').slice(0, 5) === prefix);
                      const daDat = kg && !kg.available && kg.reason !== 'PAST';
                      const khongKhaDung = laQuaKhu || daDat;

                      let ghiChu = '';
                      if (laQuaKhu) ghiChu = ' ⛔ (Đã qua giờ)';
                      else if (daDat) ghiChu = ' 🔒 (Đã có người đặt)';

                      return (
                        <option
                          key={slot.value}
                          value={slot.value}
                          disabled={khongKhaDung}
                          className={khongKhaDung ? 'text-slate-400 bg-slate-100 italic' : 'text-slate-800'}
                        >
                          {slot.label}{ghiChu}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Thời lượng thuê:</span>
                    </label>

                    {/* Bộ tăng giảm số giờ linh hoạt theo bước 30 phút (tối thiểu 60p theo quy định sân, tối đa tới giờ đóng cửa) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDurationMinutes(prev => Math.max(60, prev - 30))}
                        disabled={durationMinutes <= 60}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition disabled:opacity-30 cursor-pointer shadow-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-brand-700 px-1.5 min-w-[62px] text-center">
                        {thoiLuongHienThi}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDurationMinutes(prev => Math.min(thoiLuongToiDaPhut, prev + 30))}
                        disabled={durationMinutes >= thoiLuongToiDaPhut}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition disabled:opacity-30 cursor-pointer shadow-xs"
                        title={durationMinutes >= thoiLuongToiDaPhut ? `Đã chạm giới hạn giờ đóng cửa ${gioDongCuaStr.slice(0, 5)}` : ""}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Nút bấm chọn nhanh các mốc giờ: 1h, 1.5h (90p), 2h, 3h, 4h, 6h */}
                  <div className="grid grid-cols-6 gap-1">
                    {[
                      { minutes: 60, label: '1h' },
                      { minutes: 90, label: '1.5h' },
                      { minutes: 120, label: '2h' },
                      { minutes: 180, label: '3h' },
                      { minutes: 240, label: '4h' },
                      { minutes: 360, label: '6h' }
                    ].map((item) => {
                      const vuotGioDongCua = item.minutes > thoiLuongToiDaPhut;
                      return (
                        <button
                          type="button"
                          key={item.minutes}
                          disabled={vuotGioDongCua}
                          onClick={() => setDurationMinutes(item.minutes)}
                          title={vuotGioDongCua ? `Vượt quá giờ đóng cửa (${gioDongCuaStr.slice(0, 5)}). Tối đa ${Math.floor(thoiLuongToiDaPhut / 60)}h${thoiLuongToiDaPhut % 60 ? `${thoiLuongToiDaPhut % 60}p` : ''}.` : ''}
                          className={`py-2 rounded-xl text-[11px] font-black transition text-center ${
                            vuotGioDongCua
                              ? 'bg-slate-100 text-slate-300 border border-slate-200/50 cursor-not-allowed opacity-40'
                              : durationMinutes === item.minutes
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.02] cursor-pointer'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  {thoiLuongToiDaPhut < 720 && (
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right italic">
                      ℹ️ Giờ đóng cửa: {gioDongCuaStr.slice(0, 5)} (Tối đa {Math.floor(thoiLuongToiDaPhut / 60)}h{thoiLuongToiDaPhut % 60 ? `${thoiLuongToiDaPhut % 60}p` : ''} từ {gioBatDauHienThi})
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* =========================================================================
                BƯỚC 3: DỊCH VỤ & TIỆN ÍCH KÈM THEO (CHỈ HIỂN THỊ ĐÚNG THEO MÔN ĐÓ)
               ========================================================================= */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-black">
                      3
                    </span>
                    <span>Dịch Vụ & Tiện Ích Kèm Theo (Môn {tenMonTiengViet})</span>
                  </h2>
                  <p className="text-xs text-slate-400 ml-8 mt-0.5">
                    Tick chọn áo thi đấu, dụng cụ thể thao hoặc nước giải khát phục vụ tận sân
                  </p>
                </div>

                {selectedAddons.length > 0 && (
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    Đã chọn {selectedAddons.length} dịch vụ
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {danhSachDichVu.map((item) => {
                  const isChecked = selectedAddons.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleDichVu(item.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-2xl shrink-0 mt-0.5">{item.icon}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-xs font-bold leading-tight ${isChecked ? 'text-amber-950 font-black' : 'text-slate-800'}`}>
                            {item.name}
                          </p>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {item.desc}
                        </p>

                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-xs font-black text-amber-600">
                            +{item.price.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-slate-400">/{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =========================================================================
                ĐÁY TRANG: MỤC ĐẶC QUYỀN & TÍNH NĂNG NỔI BẬT CỦA CỤM SÂN (TIÊU CHUẨN 5 SAO)
               ========================================================================= */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">
                    ✨
                  </span>
                  <span>Đặc Quyền & Tính Năng Nổi Bật Của Cụm Sân</span>
                </h2>
                <p className="text-xs text-slate-400 ml-8 mt-0.5">
                  Tất cả khách đặt sân đều được sử dụng miễn phí các tiện nghi tiêu chuẩn 5 sao
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                {DAC_QUYEN_SAN.map((feat, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 hover:bg-white hover:shadow-sm transition">
                    <div className="text-2xl mb-1.5">{feat.icon}</div>
                    <h4 className="text-xs font-black text-slate-900 mb-0.5">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (1/3): BẢNG TÍNH TIỀN REALTIME & NÚT ĐẶT SÂN (STICKY) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg sticky top-20 space-y-5">
              
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  BẢNG TÍNH TIỀN REALTIME
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Tóm Tắt Đơn Đặt Sân
                </h3>
                <p className="text-xs text-slate-400">{coSoHienTai.tenDayDu}</p>
              </div>

              {/* Chi tiết lựa chọn */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-start py-1 border-b border-slate-50 gap-2">
                  <span className="text-slate-500 shrink-0">Sân đã chọn:</span>
                  <div className="text-right">
                    <p className="font-black text-slate-800">{selectedCourt?.name}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {tenMonTiengViet} • {selectedCourt?.surface}
                    </span>
                  </div>
                </div>

                {['BADMINTON', 'TENNIS'].includes(maMon) && (
                  <div className="flex justify-between py-1 border-b border-slate-50 items-center">
                    <span className="text-slate-500">Hình thức thi đấu:</span>
                    <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
                      ✓ {hinhThucThiDau}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Ngày chơi:</span>
                  <span className="font-bold text-slate-800">{selectedDate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Khung giờ:</span>
                  <span className="font-bold text-slate-800">
                    {gioBatDauHienThi} - {gioKetThucHienThi} ({thoiLuongHienThi})
                  </span>
                </div>

                {/* Danh sách dịch vụ đã chọn */}
                {selectedAddons.length > 0 && (
                  <div className="py-2 border-b border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>Dịch vụ kèm theo ({selectedAddons.length}):</span>
                      <span className="text-amber-700">+{tongTienDichVu.toLocaleString('vi-VN')} đ</span>
                    </div>
                    {selectedAddons.map(id => {
                      const item = danhSachDichVu.find(d => d.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex justify-between text-[11px] text-slate-600 pl-2">
                          <span className="truncate max-w-[170px]">• {item.name}</span>
                          <span className="font-semibold text-slate-700">+{item.price.toLocaleString('vi-VN')} đ</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chọn Voucher & Tự Động Áp Dụng */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-rose-500" />
                    Mã ưu đãi / Voucher giảm giá:
                  </label>
                  {bestVoucherInfo && selectedVoucher !== bestVoucherInfo.voucher.code && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVoucher(bestVoucherInfo.voucher.code);
                        setDaTuChonVoucher(false);
                      }}
                      className="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Dùng mã tốt nhất (-{bestVoucherInfo.discount.toLocaleString('vi-VN')}đ)
                    </button>
                  )}
                </div>

                <select
                  value={selectedVoucher}
                  onChange={(e) => {
                    setSelectedVoucher(e.target.value);
                    setDaTuChonVoucher(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">-- Không áp dụng voucher --</option>
                  {vouchers.map((v) => {
                    const discount = tinhTienGiamVoucherThucTe(v, tongTienSan);
                    const isBest = bestVoucherInfo?.voucher?.code === v.code;
                    const isEligible = discount > 0;

                    let label = `${v.code} - ${v.desc}`;
                    if (isEligible) {
                      label += ` (Giảm ${discount.toLocaleString('vi-VN')} đ)${isBest ? ' ⭐ Tốt nhất' : ''}`;
                    } else if (v.minOrderAmount && tongTienSan < v.minOrderAmount) {
                      label += ` (Cần đơn từ ${Number(v.minOrderAmount).toLocaleString('vi-VN')} đ)`;
                    }

                    return (
                      <option key={v.code} value={v.code}>
                        {label}
                      </option>
                    );
                  })}
                </select>

                {/* Banner tự động áp dụng mã tốt nhất */}
                {selectedVoucher && bestVoucherInfo?.voucher?.code === selectedVoucher && tienGiam > 0 && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Hệ thống đã tự động áp dụng mã giảm giá tốt nhất: <strong>{selectedVoucher}</strong> (-{tienGiam.toLocaleString('vi-VN')} đ)
                    </span>
                  </div>
                )}
              </div>

              {/* Bảng kê tổng chi phí */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span>Tiền thuê sân ({thoiLuongHienThi}):</span>
                    {previewLoading && (
                      <span className="text-[10px] text-brand-600 animate-pulse">(đang tính...)</span>
                    )}
                  </span>
                  <span className="font-bold text-slate-800">{tongTienSan.toLocaleString('vi-VN')} đ</span>
                </div>

                {tongTienDichVu > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold bg-amber-50/80 p-2 rounded-xl border border-amber-200/60">
                    <span>Dịch vụ & tiện ích kèm ({selectedAddons.length}):</span>
                    <span className="font-bold">+{tongTienDichVu.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {tienGiam > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60">
                    <span>Mã giảm giá ({selectedVoucher}):</span>
                    <span>-{tienGiam.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="font-black text-slate-900 text-sm block">Tổng thanh toán:</span>
                    <span className="text-[10px] text-slate-400">
                      {tongTienDichVu > 0 ? 'Trọn gói tiền sân & dịch vụ' : 'Chuyển khoản / Quét VietQR / Ví'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-brand-600">
                    {tongThanhToan.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {tongTienDichVu > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Đã tính trọn gói tiền sân và {selectedAddons.length} dịch vụ đi kèm vào tổng thanh toán.
                  </p>
                )}

                {tienGiam > 0 && (
                  <p className="text-[11px] text-emerald-600 font-bold text-right">
                    🎉 Tiết kiệm được {tienGiam.toLocaleString('vi-VN')} đ!
                  </p>
                )}
              </div>

              {/* Cảnh báo lỗi preview nếu có */}
              {previewError && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span className="leading-relaxed">{previewError}</span>
                </div>
              )}

              {/* Lỗi nếu có */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                  {isSessionExpired && (
                    <button
                      type="button"
                      onClick={() => navigate('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-rose-600/20"
                    >
                      <span>👉 Bấm vào đây để đăng nhập lại ngay</span>
                    </button>
                  )}
                </div>
              )}

              {/* Nút Đặt Sân */}
              {selectedCourt?.status === 'MAINTENANCE' || selectedCourt?.status === 'INACTIVE' ? (
                <div className="w-full py-3.5 px-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-center text-xs font-bold flex items-center justify-center gap-2">
                  <span>⚠️ Sân này hiện đang bảo trì / tạm khóa. Vui lòng chọn sân khác.</span>
                </div>
              ) : (
                <button
                  onClick={handleXacNhanDatSan}
                  disabled={submitting || previewLoading || !previewGia || !!previewError}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span>Đang giữ chỗ...</span>
                  ) : previewLoading ? (
                    <span>Đang tính báo giá...</span>
                  ) : previewError ? (
                    <span>Khung Giờ Không Khả Dụng</span>
                  ) : (
                    <>
                      <span>Xác Nhận Thuê & Thanh Toán</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              <div className="text-center text-[10px] text-slate-400 space-y-0.5">
                <p>🔒 Khóa slot thời gian thực • Không bao giờ trùng sân</p>
                <p>Hỗ trợ đổi/hủy lịch trước giờ thi đấu theo quy định</p>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
