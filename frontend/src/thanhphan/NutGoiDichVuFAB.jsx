/**
 * File: NutGoiDichVuFAB.jsx
 * Muc dich: Widget Tro Ly ESportKing 2-trong-1 co dinh goc duoi ben phai man hinh:
 *  - Tab 1: Chatbot Tro Ly AI (goi Gemini API qua Backend + Fallback thong minh hoi dap & xu ly loi 24/7).
 *  - Tab 2: Goi Dich Vu Phuc Vu Tai San (chi mo khoa khi khach dang o trang thai CHECKED_IN, gui thang toi nhan vien quay).
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
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
  Loader2,
  MessageCircle
} from 'lucide-react';
import { apiDichVu } from '../dichvu/api';
import { DANH_MUC_KIOSK } from '../hangso/danhMucDichVu';

const GOI_Y_MAC_DINH = [
  'Cách đặt sân nhanh?',
  'Mã giảm giá hôm nay',
  'Chính sách hủy & hoàn tiền',
  'Lỗi không quét được QR'
];

export default function NutGoiDichVuFAB({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [moWidget, setMoWidget] = useState(false);
  const [tabWidget, setTabWidget] = useState('AI'); // 'AI' | 'SERVICE'

  // === STATE CHATBOT AI ===
  const [tinNhan, setTinNhan] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Xin chào! Mình là Trợ Lý AI của ESportKing.\nBạn cần hướng dẫn đặt sân, xem ưu đãi, check-in QR hay gặp lỗi trong quá trình sử dụng cứ hỏi trực tiếp nhé!',
      source: 'SMART_FALLBACK'
    }
  ]);
  const [oNhapChat, setONhapChat] = useState('');
  const [dangTraLoi, setDangTraLoi] = useState(false);
  const [goiYCauHoi, setGoiYCauHoi] = useState(GOI_Y_MAC_DINH);
  const cuoiChatRef = useRef(null);

  // === STATE GOI DICH VU TAI SAN ===
  const [tabKiosk, setTabKiosk] = useState('DRINK'); // 'DRINK' | 'FOOD' | 'GEAR' | 'MEDIC'
  const [gioHang, setGioHang] = useState({});
  const [danhSachSanDangChoi, setDanhSachSanDangChoi] = useState([]);
  const [sanDangChon, setSanDangChon] = useState(null);
  const [dangGuiYeuCau, setDangGuiYeuCau] = useState(false);
  const [thongBaoDichVu, setThongBaoDichVu] = useState('');

  // Kiem tra don CHECKED_IN cua khach (khong gioi han chi ngay hom nay de ho tro dat truoc & check-in som)
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
        .catch(() => {
          // Giu nguyen trang thai neu tam mat ket noi
        });
    };

    kiemTraDonCheckIn();
    const interval = setInterval(kiemTraDonCheckIn, 12000);
    window.addEventListener('cap_nhat_ve', kiemTraDonCheckIn);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cap_nhat_ve', kiemTraDonCheckIn);
    };
  }, [user, moWidget]);

  // Lang nghe su kien mo truc tiep tab Phuc Vu Tai San tu cac trang khac
  useEffect(() => {
    const handleMoDichVu = () => {
      setMoWidget(true);
      setTabWidget('SERVICE');
    };
    window.addEventListener('mo_tro_ly_dich_vu', handleMoDichVu);
    return () => window.removeEventListener('mo_tro_ly_dich_vu', handleMoDichVu);
  }, []);

  // Cuon xuong cuoi khung chat moi khi co tin nhan moi
  useEffect(() => {
    if (moWidget && tabWidget === 'AI') {
      cuoiChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tinNhan, dangTraLoi, moWidget, tabWidget]);

  // An widget o trang dang nhap / dang ky
  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/dang-nhap' ||
    location.pathname === '/dang-ky'
  ) {
    return null;
  }

  // === XU LY CHATBOT AI ===
  const guiTinNhanAi = async (noiDungTuyChon) => {
    const text = (noiDungTuyChon !== undefined ? noiDungTuyChon : oNhapChat).trim();
    if (!text || dangTraLoi) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    const nextMessages = [...tinNhan, userMsg];
    setTinNhan(nextMessages);
    setONhapChat('');
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

      setTinNhan(prev => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'model', text: botReply, source }
      ]);
    } catch (err) {
      setTinNhan(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Hiện tại máy chủ Trợ Lý AI đang khởi động lại hoặc tạm gián đoạn. Bạn có thể thử lại sau vài giây, hoặc kiểm tra kết nối backend nhé!',
          source: 'OFFLINE'
        }
      ]);
    } finally {
      setDangTraLoi(false);
    }
  };

  // === XU LY GOI DICH VU TAI SAN ===
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
      setThongBaoDichVu('Vui lòng chọn ít nhất 1 sản phẩm hoặc dịch vụ.');
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
      setThongBaoDichVu(`✅ Đã gửi yêu cầu (${itemSummary}) tới nhân viên quầy! Dự kiến giao tận sân trong < 5 phút.`);
      setTimeout(() => setThongBaoDichVu(''), 6000);
    } catch (err) {
      setThongBaoDichVu(err.response?.data?.message || 'Không thể gửi yêu cầu phục vụ lúc này. Vui lòng thử lại!');
    } finally {
      setDangGuiYeuCau(false);
    }
  };

  const danhSachLocKiosk = DANH_MUC_KIOSK.filter(m => m.danhMuc === tabKiosk);

  return (
    <>
      {/* NUT NOI TRO LY GOC DAY BEN PHAI MAN HINH */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {!moWidget && sanDangChon && (
          <button
            type="button"
            onClick={() => {
              setMoWidget(true);
              setTabWidget('SERVICE');
            }}
            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black shadow-lg shadow-amber-500/30 flex items-center gap-1.5 animate-bounce cursor-pointer border border-white/30"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Gọi đồ Sân #{sanDangChon.courtId}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setMoWidget(prev => !prev)}
          aria-label="Mở Trợ Lý ESportKing"
          className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-full font-black text-xs shadow-2xl shadow-brand-600/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/25"
        >
          <div className="relative flex items-center justify-center">
            {moWidget ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            {!moWidget && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
              </span>
            )}
          </div>
          <span className="hidden sm:inline-block tracking-wide">
            {moWidget ? 'Thu gọn' : 'Trợ Lý AI'}
          </span>
        </button>
      </div>

      {/* KHUNG WIDGET TRO LY 2-TRONG-1 NOI GOC PHAI DUOI */}
      {moWidget && (
        <div className="fixed bottom-22 right-4 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[580px] max-h-[80vh] bg-white rounded-[28px] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header Widget */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-md shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight">Trợ Lý ESportKing</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-400/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Hỏi đáp AI 24/7 & Tiếp tế tận sân
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMoWidget(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2 Tab chuyen doi: Tro Ly AI | Phuc Vu Tai San */}
          <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 border-b border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => setTabWidget('AI')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tabWidget === 'AI'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trợ Lý AI</span>
            </button>
            <button
              type="button"
              onClick={() => setTabWidget('SERVICE')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                tabWidget === 'SERVICE'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Phục Vụ Tại Sân</span>
              {sanDangChon && (
                <span className={`w-2 h-2 rounded-full ${tabWidget === 'SERVICE' ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
              )}
            </button>
          </div>

          {/* ================= TAB 1: CHATBOT TRO LY AI ================= */}
          {tabWidget === 'AI' && (
            <>
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#fbf9f8]">
                {tinNhan.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                          isUser
                            ? 'bg-brand-600 text-white rounded-br-sm font-medium'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm font-medium'
                        }`}
                      >
                        {msg.text}
                        {!isUser && msg.id !== 'welcome' && (
                          <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                            <span>{msg.source === 'GEMINI' ? 'Gemini AI' : 'Trợ lý ESportKing'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {dangTraLoi && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={cuoiChatRef} />
              </div>

              {/* Goi y hoi nhanh */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {goiYCauHoi.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={dangTraLoi}
                    onClick={() => guiTinNhanAi(q)}
                    className="px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0"
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
                className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={oNhapChat}
                  onChange={(e) => setONhapChat(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc lỗi bạn đang gặp..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-500 transition"
                />
                <button
                  type="submit"
                  disabled={!oNhapChat.trim() || dangTraLoi}
                  className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  {dangTraLoi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

          {/* ================= TAB 2: GOI DICH VU PHUC VU TAI SAN ================= */}
          {tabWidget === 'SERVICE' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#fbf9f8]">
              {!sanDangChon ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Chưa có ca sân đang Check-in</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                    Tính năng gọi nước uống, đồ ăn & dụng cụ giao tận sân chỉ mở khóa sau khi bạn <strong>quét mã QR Check-in</strong> nhận sân tại quầy lễ tân.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMoWidget(false);
                      navigate(user ? '/ve-cua-toi' : '/login');
                    }}
                    className="mt-1 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{user ? 'Mở Vé & Mã QR của tôi' : 'Đăng nhập để xem vé'}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Thong tin san dang choi */}
                  <div className="px-3.5 py-2.5 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-[11px] font-black text-amber-900 truncate">
                          Vé #{sanDangChon.id} • Sân #{sanDangChon.courtId}
                        </p>
                        <p className="text-[10px] font-semibold text-amber-700 truncate">
                          {sanDangChon.bookingDate} • {sanDangChon.startSlot} - {sanDangChon.endSlot}
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
                        className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-900 outline-none"
                      >
                        {danhSachSanDangChoi.map(s => (
                          <option key={s.id} value={s.id}>Vé #{s.id} (Sân #{s.courtId})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Thong bao sau khi gui yeu cau */}
                  {thongBaoDichVu && (
                    <div className={`mx-3 mt-2.5 p-2.5 rounded-xl text-[11px] font-bold flex items-start gap-2 shrink-0 ${
                      thongBaoDichVu.startsWith('✅')
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{thongBaoDichVu}</span>
                    </div>
                  )}

                  {/* 4 Danh muc gon */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar shrink-0">
                    {[
                      { key: 'DRINK', label: '⚡ Nước' },
                      { key: 'FOOD', label: '🥪 Đồ ăn' },
                      { key: 'GEAR', label: '🎽 Dụng cụ' },
                      { key: 'MEDIC', label: '🩹 Y tế 0đ' }
                    ].map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTabKiosk(t.key)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer shrink-0 ${
                          tabKiosk === t.key
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Danh sach mon */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {danhSachLocKiosk.map((mon) => {
                      const sl = gioHang[mon.id] || 0;
                      return (
                        <div
                          key={mon.id}
                          className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                            sl > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                              {mon.icon}
                            </span>
                            <div className="min-w-0 text-left">
                              <h5 className="text-xs font-black text-slate-900 truncate">{mon.ten}</h5>
                              <span className="text-[11px] font-extrabold text-amber-600">
                                {mon.mienPhi ? 'Miễn phí' : `${mon.gia.toLocaleString('vi-VN')} đ`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => thayDoiSoLuong(mon.id, -1)}
                              disabled={sl === 0}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                                sl > 0 ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-100 text-slate-300'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-black text-slate-900">{sl}</span>
                            <button
                              type="button"
                              onClick={() => thayDoiSoLuong(mon.id, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer gui yeu cau */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <span className="block text-[10px] font-bold text-slate-400">Đã chọn {tongSoLuong} món</span>
                      <span className="text-sm font-black text-amber-600">{tongTien.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <button
                      type="button"
                      disabled={tongSoLuong === 0 || dangGuiYeuCau}
                      onClick={guiYeuCauPhucVuTaiSan}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {dangGuiYeuCau ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
                      <span>Gửi Nhân Viên Ngay</span>
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
