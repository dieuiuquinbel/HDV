/**
 * File: NutGoiDichVuFAB.jsx
 * Muc dich: Widget Tro Ly ESportKing 2-trong-1 nho gon, lien mach, ho tro keo-tha (Drag & Drop) va nut an (x):
 *  - Mac dinh dat o goc duoi ben trai man hinh; nguoi dung co the nhan giu chuot keo sang bat ky vi tri nao.
 *  - Nut 'x' nho ngay canh logo de an chatbot (hien 1 the mini nho o mep de mo lai bat cu luc nao).
 *  - Tab 1: Chatbot Tro Ly AI 24/7 (Gemini 3.8 Flash + Smart Fallback).
 *  - Tab 2: Phuc Vu Tai San (tu dong mo khoa khi khach da CHECKED_IN, khong con nut thua ben ngoai).
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BellRing,
  X,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  MapPin,
  Lock,
  Ticket,
  Loader2
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import { DANH_MUC_KIOSK } from '../hangso/danhMucDichVu';

// Logo Tro Ly AI ESportKing thiet ke rieng (SVG sac net, hien dai)
function LogoTroLyAI({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ekAiGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <path
        d="M16 3C16.9 9.2 22.8 15.1 29 16C22.8 16.9 16.9 22.8 16 29C15.1 22.8 9.2 16.9 3 16C9.2 15.1 15.1 9.2 16 3Z"
        fill="url(#ekAiGrad)"
      />
      <circle cx="25.5" cy="6.5" r="2.2" fill="#ffffff" opacity="0.95" />
      <circle cx="7" cy="25" r="1.4" fill="#fde68a" opacity="0.9" />
    </svg>
  );
}

const GOI_Y_MAC_DINH = [
  'Cách đặt sân?',
  'Mã giảm giá',
  'Hủy & hoàn tiền',
  'Địa chỉ 3 cơ sở',
  'Giá & giờ vàng',
  'Lỗi QR check-in'
];

// Bo cau tra loi FAQ co san (tra loi tuc thi 0ms, khong ton token AI)
const FAQ_CO_SAN = [
  {
    keys: ['mã giảm giá', 'voucher', 'ưu đãi', 'khuyến mãi'],
    reply:
      'Mã giảm giá đang áp dụng tại ESportKing:\n' +
      '• CHAOBANMOI: Giảm 20% (tối đa 50.000đ) cho thành viên mới.\n' +
      '• THELUC2026: Giảm 15% (tối đa 40.000đ) từ Thứ 2 - Thứ 5.\n' +
      '• CUOITUAN: Giảm 25.000đ cho đơn từ 150.000đ dịp cuối tuần.\n' +
      '• VIPSPORT: Giảm 30.000đ cho đơn từ 200.000đ.\n' +
      'Hệ thống sẽ tự động gợi ý mã lợi nhất khi bạn chọn giờ thuê!'
  },
  {
    keys: ['cách đặt sân', 'đặt sân?', 'thuê sân'],
    reply:
      'Đặt sân tại ESportKing chỉ mất 30 giây:\n' +
      '1. Vào mục "Tìm sân" -> chọn bộ môn (Bóng đá, Cầu lông, Tennis, Bóng rổ) & cơ sở.\n' +
      '2. Chọn loại mặt sân, ngày chơi, khung giờ bắt đầu & thời lượng.\n' +
      '3. Kiểm tra mã giảm giá -> bấm "Xác Nhận Thuê & Thanh Toán".\n' +
      '4. Thanh toán qua Ví SportPay hoặc VietQR để nhận mã QR Check-in ngay!'
  },
  {
    keys: ['hủy & hoàn tiền', 'hủy sân', 'hoàn tiền', 'refund'],
    reply:
      'Chính sách Hủy sân & Hoàn tiền:\n' +
      '• Vào mục "Đặt sân của tôi" -> bấm "Hủy & Hoàn tiền" trên đơn chưa check-in.\n' +
      '• Hệ thống tự động hoàn 50% giá trị đơn ngay lập tức vào Ví SportPay.\n' +
      '• Tiền trong ví có thể dùng đặt sân lần sau hoặc rút về ngân hàng.'
  },
  {
    keys: ['địa chỉ 3 cơ sở', 'địa chỉ', '3 cơ sở', 'ở đâu'],
    reply:
      'Hệ thống 3 cơ sở ESportKing Hà Nội (06:00 - 22:30):\n' +
      '• Cơ Sở 1 (Cầu Giấy): Số 18 Phố Duy Tân, Dịch Vọng Hậu.\n' +
      '• Cơ Sở 2 (Đống Đa): Số 102 Phố Trường Chinh, Phương Mai.\n' +
      '• Cơ Sở 3 (Hà Đông): Số 27 Đường Quang Trung, Hà Đông.\n' +
      'Mỗi cơ sở gồm 10 sân chuẩn thi đấu (Bóng đá, Cầu lông, Tennis, Bóng rổ).'
  },
  {
    keys: ['giá & giờ vàng', 'giờ vàng', 'giá sân', 'đèn led'],
    reply:
      'Cách tính giá thuê sân tại ESportKing:\n' +
      '• Giờ thường (06:00 - 17:00): Tính đúng đơn giá cơ bản của từng sân.\n' +
      '• Giờ vàng (17:00 - 21:00): Cộng phụ phí đèn LED & cao điểm (+50%).\n' +
      '• Dụng cụ kèm theo (bóng, vợt, áo bib) tính trọn gói theo ca, không nhân theo giờ.'
  },
  {
    keys: ['lỗi qr', 'qr check-in', 'không quét được', 'nhầm cơ sở'],
    reply:
      'Hướng dẫn & xử lý lỗi Check-in QR:\n' +
      '• Mở "Đặt sân của tôi" -> bấm "Phóng to đưa nhân viên quét" (hoặc copy mã Token).\n' +
      '• Nếu đi nhầm cơ sở, trạm quầy sẽ tự báo và mở Google Maps chỉ sang đúng cơ sở.\n' +
      '• Nếu báo lỗi đăng nhập (401): Bấm Avatar góc phải -> Đăng xuất rồi Đăng nhập lại.'
  }
];

function traLoiFaqCoSan(text) {
  const q = text.toLowerCase().trim();
  for (const item of FAQ_CO_SAN) {
    if (item.keys.some(k => q === k || (q.length <= 40 && q.includes(k)))) {
      return item.reply;
    }
  }
  return null;
}

const FAB_W = 132;
const FAB_H = 44;
const PANEL_W = 340;
const PANEL_H = 460;
const MARGIN = 16;

function clampPosition(x, y) {
  const maxX = Math.max(MARGIN, (typeof window !== 'undefined' ? window.innerWidth : 1280) - FAB_W - MARGIN);
  const maxY = Math.max(MARGIN, (typeof window !== 'undefined' ? window.innerHeight : 720) - FAB_H - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY)
  };
}

export default function NutGoiDichVuFAB({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [moWidget, setMoWidget] = useState(false);
  const [daAnBot, setDaAnBot] = useState(false);
  const [tabWidget, setTabWidget] = useState('AI'); // 'AI' | 'SERVICE'

  // Vi tri keo-tha cua nut chatbot (mac dinh goc duoi ben trai)
  const [viTri, setViTri] = useState(() => {
    try {
      const saved = localStorage.getItem('esportking_bot_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return clampPosition(parsed.x, parsed.y);
        }
      }
    } catch {}
    const h = typeof window !== 'undefined' ? window.innerHeight : 720;
    return clampPosition(20, h - FAB_H - 20);
  });

  const dragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [dangKeo, setDangKeo] = useState(false);

  // === STATE CHATBOT AI ===
  const [tinNhan, setTinNhan] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Xin chào! Mình là Trợ Lý AI ESportKing.\nBạn cần hỏi cách đặt sân, ưu đãi, check-in QR hay xử lý lỗi cứ nhắn mình nhé!',
      source: 'SMART_FALLBACK'
    }
  ]);
  const [oNhapChat, setONhapChat] = useState('');
  const [dangTraLoi, setDangTraLoi] = useState(false);
  const [goiYCauHoi, setGoiYCauHoi] = useState(GOI_Y_MAC_DINH);
  const cuoiChatRef = useRef(null);

  // === STATE GOI DICH VU TAI SAN ===
  const [tabKiosk, setTabKiosk] = useState('DRINK');
  const [gioHang, setGioHang] = useState({});
  const [danhSachSanDangChoi, setDanhSachSanDangChoi] = useState([]);
  const [sanDangChon, setSanDangChon] = useState(null);
  const [dangGuiYeuCau, setDangGuiYeuCau] = useState(false);
  const [thongBaoDichVu, setThongBaoDichVu] = useState('');

  // Cap nhat lai vi tri khi resize cua so trinh duyet
  useEffect(() => {
    const onResize = () => setViTri(prev => clampPosition(prev.x, prev.y));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Xu ly keo-tha bang chuot / cam ung
  useEffect(() => {
    const onPointerMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.moved = true;
      }
      const next = clampPosition(dragRef.current.origX + dx, dragRef.current.origY + dy);
      setViTri(next);
    };

    const onPointerUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      setDangKeo(false);
      setViTri(prev => {
        try {
          localStorage.setItem('esportking_bot_pos', JSON.stringify(prev));
        } catch {}
        return prev;
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const batDauKeo = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: viTri.x,
      origY: viTri.y
    };
    setDangKeo(true);
  };

  // Kiem tra don CHECKED_IN cua khach
  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') {
      setDanhSachSanDangChoi([]);
      setSanDangChon(null);
      return;
    }

    const kiemTraDonCheckIn = () => {
      apiDichVu.layDonDatCuaToi({ page: 0, size: 20 })
        .then(res => {
          const ds = res.data?.content || [];
          const sanHopLe = ds.filter(d => d.status === 'CHECKED_IN');
          setDanhSachSanDangChoi(sanHopLe);
          if (sanHopLe.length > 0) {
            setSanDangChon(prev => {
              if (prev && sanHopLe.some(s => s.id === prev.id)) return prev;
              return sanHopLe[0];
            });
          } else {
            setSanDangChon(null);
          }
        })
        .catch(() => {});
    };

    kiemTraDonCheckIn();
    const interval = setInterval(kiemTraDonCheckIn, 12000);
    window.addEventListener('cap_nhat_ve', kiemTraDonCheckIn);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cap_nhat_ve', kiemTraDonCheckIn);
    };
  }, [user, moWidget]);

  useEffect(() => {
    const handleMoDichVu = () => {
      setDaAnBot(false);
      setMoWidget(true);
      setTabWidget('SERVICE');
    };
    window.addEventListener('mo_tro_ly_dich_vu', handleMoDichVu);
    return () => window.removeEventListener('mo_tro_ly_dich_vu', handleMoDichVu);
  }, []);

  useEffect(() => {
    if (moWidget && tabWidget === 'AI') {
      cuoiChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tinNhan, dangTraLoi, moWidget, tabWidget]);

  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/dang-nhap' ||
    location.pathname === '/dang-ky'
  ) {
    return null;
  }

  // === CHATBOT AI ===
  const guiTinNhanAi = async (noiDungTuyChon) => {
    const text = (noiDungTuyChon !== undefined ? noiDungTuyChon : oNhapChat).trim();
    if (!text || dangTraLoi) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    const nextMessages = [...tinNhan, userMsg];
    setTinNhan(nextMessages);
    setONhapChat('');

    // Tang 1: Tra loi tuc thi tu bo FAQ co san (0ms, khong ton token AI)
    const faqReply = traLoiFaqCoSan(text);
    if (faqReply) {
      setTinNhan(prev => [
        ...prev,
        { id: `faq-${Date.now()}`, role: 'model', text: faqReply, source: 'FAQ' }
      ]);
      return;
    }

    // Tang 2: Chi goi Gemini AI cho cac cau hoi tu do / phuc tap
    setDangTraLoi(true);
    try {
      const historyPayload = nextMessages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({ role: m.role, text: m.text }));

      const contextParts = [];
      if (user?.fullName) contextParts.push(`Tên khách: ${user.fullName}`);
      if (sanDangChon) {
        contextParts.push(`Khách đang CHECKED_IN tại Vé #${sanDangChon.id}, Sân #${sanDangChon.courtId}`);
      } else {
        contextParts.push('Khách chưa check-in sân nào.');
      }

      const res = await apiDichVu.troChuyenTroLyAi({
        message: text,
        history: historyPayload.slice(0, -1),
        context: contextParts.join('. ')
      });

      const botReply = res.data?.reply || 'Xin lỗi, mình chưa thể xử lý câu hỏi này. Bạn thử hỏi lại nhé!';
      const source = res.data?.source || 'SMART_FALLBACK';
      if (Array.isArray(res.data?.suggestions) && res.data.suggestions.length > 0) {
        setGoiYCauHoi(res.data.suggestions);
      }

      setTinNhan(prev => [...prev, { id: `b-${Date.now()}`, role: 'model', text: botReply, source }]);
    } catch {
      setTinNhan(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Mình chưa kết nối được với máy chủ AI lúc này. Bạn có thể bấm các nút câu hỏi mẫu bên dưới (Cách đặt sân, Mã giảm giá, Hủy & hoàn tiền, Địa chỉ 3 cơ sở...) để nhận câu trả lời ngay lập tức nhé!',
          source: 'FAQ'
        }
      ]);
    } finally {
      setDangTraLoi(false);
    }
  };

  // === GOI DICH VU TAI SAN ===
  const tongSoLuong = Object.values(gioHang).reduce((sum, n) => sum + n, 0);
  const tongTien = Object.entries(gioHang).reduce((sum, [id, sl]) => {
    const item = DANH_MUC_KIOSK.find(m => m.id === id);
    return sum + (item ? item.gia * sl : 0);
  }, 0);

  const thayDoiSoLuong = (id, delta) => {
    setGioHang(prev => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const guiYeuCauPhucVuTaiSan = async () => {
    if (!sanDangChon) return;
    if (tongSoLuong === 0) {
      setThongBaoDichVu('Vui lòng chọn ít nhất 1 món.');
      return;
    }

    const itemSummary = Object.entries(gioHang)
      .map(([id, sl]) => {
        const item = DANH_MUC_KIOSK.find(m => m.id === id);
        return item ? `${sl}x ${item.ten}` : null;
      })
      .filter(Boolean)
      .join(', ');

    setDangGuiYeuCau(true);
    setThongBaoDichVu('');
    try {
      await apiDichVu.taoYeuCauDichVuTaiSan(sanDangChon.id, {
        items: itemSummary,
        totalAmount: tongTien,
        customerName: user?.fullName || 'Khách hàng'
      });
      setGioHang({});
      setThongBaoDichVu(`✅ Đã gửi (${itemSummary}) tới nhân viên quầy! Giao tận sân < 5 phút.`);
      setTimeout(() => setThongBaoDichVu(''), 6000);
    } catch (err) {
      setThongBaoDichVu(err.response?.data?.message || 'Không thể gửi yêu cầu lúc này.');
    } finally {
      setDangGuiYeuCau(false);
    }
  };

  // Tinh toa do khung chat lien mach bam sat nut chatbot
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 720;
  const panelWidth = Math.min(PANEL_W, winW - 24);
  const panelHeight = Math.min(PANEL_H, Math.floor(winH * 0.74));

  const panelLeft = Math.min(
    Math.max(12, viTri.x + FAB_W / 2 > winW / 2 ? viTri.x + FAB_W - panelWidth : viTri.x),
    Math.max(12, winW - panelWidth - 12)
  );
  const openAbove = viTri.y > panelHeight + 20;
  const panelTop = openAbove
    ? Math.max(12, viTri.y - panelHeight - 10)
    : Math.min(winH - panelHeight - 12, viTri.y + FAB_H + 10);

  const danhSachLocKiosk = DANH_MUC_KIOSK.filter(m => m.danhMuc === tabKiosk);

  // Neu nguoi dung da bam nut 'x' an chatbot -> hien 1 the nho xiu o mep trai duoi de goi lai khi can
  if (daAnBot) {
    return (
      <button
        type="button"
        onClick={() => setDaAnBot(false)}
        title="Hiện lại Trợ Lý AI"
        className="fixed bottom-4 left-0 z-40 pl-2 pr-2.5 py-2 bg-gradient-to-r from-brand-600 to-rose-500 hover:from-brand-700 hover:to-rose-600 text-white rounded-r-full shadow-lg transition flex items-center gap-1 cursor-pointer"
      >
        <LogoTroLyAI className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* NUT CHATBOT NHO GON CO THE KEO-THA + NUT X AN NHANH */}
      <div
        style={{ left: `${viTri.x}px`, top: `${viTri.y}px`, touchAction: 'none' }}
        className="fixed z-50 select-none"
      >
        <div className="relative group flex items-center">
          {/* Nut 'x' nho canh logo de an chatbot */}
          {!moWidget && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDaAnBot(true);
              }}
              title="Ẩn Trợ Lý AI"
              className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-slate-800 hover:bg-rose-600 text-white border border-white flex items-center justify-center shadow-md transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Nut chinh: Nhan giu de keo, bam nhanh de mo/dong */}
          <button
            type="button"
            onPointerDown={batDauKeo}
            onClick={() => {
              if (dragRef.current.moved) return;
              setMoWidget(prev => !prev);
            }}
            title="Nhấn để mở Trợ Lý • Nhấn giữ để kéo sang vị trí khác"
            className={`flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-full font-black text-xs shadow-xl shadow-brand-600/30 border border-white/25 transition-transform ${
              dangKeo ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-[1.03]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              {moWidget ? <X className="w-4 h-4" /> : <LogoTroLyAI className="w-4 h-4" />}
              {!moWidget && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-white"></span>
                </span>
              )}
            </div>
            <span className="tracking-wide whitespace-nowrap">
              {moWidget ? 'Thu gọn' : 'Trợ Lý AI'}
            </span>
            {!moWidget && sanDangChon && (
              <span className="w-2 h-2 rounded-full bg-amber-200 animate-pulse" title="Đang Check-in • Có thể gọi đồ tận sân" />
            )}
          </button>
        </div>
      </div>

      {/* KHUNG CHAT 2-TRONG-1 NHO GON, LIEN MACH BAM SAT NUT CHATBOT */}
      {moWidget && (
        <div
          style={{
            left: `${panelLeft}px`,
            top: `${panelTop}px`,
            width: `${panelWidth}px`,
            height: `${panelHeight}px`
          }}
          className="fixed z-50 bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header nho gon */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md shadow-brand-500/30 shrink-0 ring-1 ring-white/25">
                <LogoTroLyAI className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-tight">Trợ Lý ESportKing</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-black">
                    24/7
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  AI hỗ trợ & Phục vụ tận sân
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMoWidget(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2 Tab tich hop */}
          <div className="grid grid-cols-2 gap-1 p-1.5 bg-slate-50 border-b border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => setTabWidget('AI')}
              className={`py-1.5 px-2.5 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tabWidget === 'AI'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trợ Lý AI</span>
            </button>
            <button
              type="button"
              onClick={() => setTabWidget('SERVICE')}
              className={`py-1.5 px-2.5 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tabWidget === 'SERVICE'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Phục Vụ Sân</span>
              {sanDangChon && (
                <span className={`w-1.5 h-1.5 rounded-full ${tabWidget === 'SERVICE' ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
              )}
            </button>
          </div>

          {/* ================= TAB 1: CHATBOT AI ================= */}
          {tabWidget === 'AI' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#fbf9f8]">
                {tinNhan.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[86%] rounded-2xl px-3 py-2 text-[11.5px] leading-relaxed whitespace-pre-line shadow-2xs ${
                          isUser
                            ? 'bg-brand-600 text-white rounded-br-sm font-medium'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm font-medium'
                        }`}
                      >
                        {msg.text}
                        {!isUser && msg.id !== 'welcome' && (
                          <div className="mt-1 pt-1 border-t border-slate-100 flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                            <span>
                              {msg.source === 'GEMINI'
                                ? 'Gemini AI'
                                : msg.source === 'FAQ'
                                ? 'Trả lời nhanh ESportKing'
                                : 'Trợ lý ESportKing'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {dangTraLoi && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={cuoiChatRef} />
              </div>

              {/* Goi y hoi nhanh (wrap gon, khong thanh cuon ngang) */}
              <div className="px-2.5 py-1.5 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1 shrink-0">
                {goiYCauHoi.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={dangTraLoi}
                    onClick={() => guiTinNhanAi(q)}
                    className="px-2 py-1 rounded-full bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 text-[10px] font-bold transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Thanh nhap tin nhan */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  guiTinNhanAi();
                }}
                className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  value={oNhapChat}
                  onChange={(e) => setONhapChat(e.target.value)}
                  placeholder="Hỏi AI hoặc báo lỗi..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-500 transition"
                />
                <button
                  type="submit"
                  disabled={!oNhapChat.trim() || dangTraLoi}
                  className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  {dangTraLoi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
            </>
          )}

          {/* ================= TAB 2: PHUC VU TAI SAN ================= */}
          {tabWidget === 'SERVICE' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#fbf9f8]">
              {!sanDangChon ? (
                <div className="flex-1 flex flex-col items-center justify-center p-5 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Chưa Check-in nhận sân</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Gọi nước, đồ ăn & dụng cụ tận sân chỉ mở khóa sau khi bạn <strong>quét mã QR Check-in</strong> tại quầy lễ tân.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMoWidget(false);
                      navigate(user ? '/ve-cua-toi' : '/login');
                    }}
                    className="mt-1 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{user ? 'Mở Vé & Mã QR' : 'Đăng nhập'}</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-[11px] font-black text-amber-900 truncate">
                          Vé #{sanDangChon.id} • Sân #{sanDangChon.courtId}
                        </p>
                        <p className="text-[9.5px] font-semibold text-amber-700 truncate">
                          {sanDangChon.bookingDate} • {sanDangChon.startSlot}-{sanDangChon.endSlot}
                        </p>
                      </div>
                    </div>
                    {danhSachSanDangChoi.length > 1 && (
                      <select
                        value={sanDangChon.id}
                        onChange={(e) => {
                          const found = danhSachSanDangChoi.find(s => s.id === Number(e.target.value));
                          if (found) setSanDangChon(found);
                        }}
                        className="px-1.5 py-1 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-900 outline-none"
                      >
                        {danhSachSanDangChoi.map(s => (
                          <option key={s.id} value={s.id}>Vé #{s.id}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {thongBaoDichVu && (
                    <div className={`mx-2.5 mt-2 p-2 rounded-xl text-[10.5px] font-bold flex items-start gap-1.5 shrink-0 ${
                      thongBaoDichVu.startsWith('✅')
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{thongBaoDichVu}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-1 px-2.5 py-1.5 bg-white border-b border-slate-100 shrink-0">
                    {[
                      { key: 'DRINK', label: '⚡ Nước' },
                      { key: 'FOOD', label: '🥪 Ăn' },
                      { key: 'GEAR', label: '🎽 Đồ' },
                      { key: 'MEDIC', label: '🩹 Y tế' }
                    ].map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTabKiosk(t.key)}
                        className={`py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                          tabKiosk === t.key
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                    {danhSachLocKiosk.map((mon) => {
                      const sl = gioHang[mon.id] || 0;
                      return (
                        <div
                          key={mon.id}
                          className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 ${
                            sl > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                              {mon.icon}
                            </span>
                            <div className="min-w-0 text-left">
                              <h5 className="text-[11px] font-black text-slate-900 truncate">{mon.ten}</h5>
                              <span className="text-[10px] font-extrabold text-amber-600">
                                {mon.mienPhi ? 'Miễn phí' : `${mon.gia.toLocaleString('vi-VN')} đ`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => thayDoiSoLuong(mon.id, -1)}
                              disabled={sl === 0}
                              className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer ${
                                sl > 0 ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-100 text-slate-300'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-[11px] font-black text-slate-900">{sl}</span>
                            <button
                              type="button"
                              onClick={() => thayDoiSoLuong(mon.id, 1)}
                              className="w-6 h-6 rounded-md bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <span className="block text-[9.5px] font-bold text-slate-400">{tongSoLuong} món</span>
                      <span className="text-xs font-black text-amber-600">{tongTien.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <button
                      type="button"
                      disabled={tongSoLuong === 0 || dangGuiYeuCau}
                      onClick={guiYeuCauPhucVuTaiSan}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white text-[11px] font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {dangGuiYeuCau ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
                      <span>Gửi Nhân Viên</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
