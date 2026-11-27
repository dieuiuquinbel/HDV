/**
 * File: ToastThongBao.jsx
 * Muc dich: Hien thi danh sach Toast thong bao toan cuc (goc tren phai) co animation muot ma.
 */
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { TOAST_EVENT } from '../tienich/thongBao';

const CAU_HINH_LOAI = {
  success: {
    icon: CheckCircle2,
    wrap: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
    badge: 'bg-emerald-50 text-emerald-600'
  },
  error: {
    icon: AlertCircle,
    wrap: 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10',
    badge: 'bg-rose-50 text-rose-600'
  },
  warning: {
    icon: AlertTriangle,
    wrap: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
    badge: 'bg-amber-50 text-amber-600'
  },
  info: {
    icon: Info,
    wrap: 'bg-white border-slate-200 text-slate-800 shadow-slate-500/10',
    badge: 'bg-blue-50 text-blue-600'
  }
};

export default function ToastThongBao() {
  const [danhSach, setDanhSach] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const item = e.detail;
      if (!item?.noiDung) return;
      setDanhSach((prev) => [...prev.slice(-3), item]);
      setTimeout(() => {
        setDanhSach((prev) => prev.filter((t) => t.id !== item.id));
      }, item.thoiLuong || 3800);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  const dongToast = (id) => {
    setDanhSach((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-[9998] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence>
        {danhSach.map((item) => {
          const cfg = CAU_HINH_LOAI[item.loai] || CAU_HINH_LOAI.info;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl ${cfg.wrap}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.badge}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold leading-relaxed flex-1 pt-1 break-words">
                {item.noiDung}
              </p>
              <button
                type="button"
                onClick={() => dongToast(item.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
