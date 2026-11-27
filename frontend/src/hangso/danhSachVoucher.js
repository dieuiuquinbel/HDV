/**
 * File: danhSachVoucher.js
 * Muc dich: Danh sach ma giam gia mac dinh va ham tinh so tien giam dung chung (DRY).
 */
export const DANH_SACH_VOUCHERS_CHUAN = [
  {
    code: 'CHAOBANMOI',
    description: 'Giảm 20% cho thành viên mới trong lần đặt sân đầu tiên',
    desc: 'Giảm 20% cho thành viên mới (tối đa 50k)',
    discountPercent: 20,
    maxDiscount: 50000,
    minOrderAmount: 100000,
    tag: 'HOT NHẤT',
    badgeBg: 'bg-rose-500 text-white'
  },
  {
    code: 'THELUC2026',
    description: 'Giảm 15% tối đa 40k cho ngày thường (Thứ 2 - Thứ 5)',
    desc: 'Giảm 15% tối đa 40k ngày thường',
    discountPercent: 15,
    maxDiscount: 40000,
    minOrderAmount: 100000,
    tag: 'NGÀY THƯỜNG',
    badgeBg: 'bg-amber-500 text-white'
  },
  {
    code: 'CUOITUAN',
    description: 'Giảm 15% tối đa 80k cho đơn cuối tuần từ 150k',
    desc: 'Giảm 15% tối đa 80k cuối tuần',
    discountPercent: 15,
    maxDiscount: 80000,
    minOrderAmount: 150000,
    tag: 'CUỐI TUẦN',
    badgeBg: 'bg-emerald-500 text-white'
  },
  {
    code: 'CUOITUANXU',
    description: 'Giảm ngay 25k cho đơn cuối tuần từ 150k',
    desc: 'Giảm ngay 25k cho đơn từ 150k',
    discountPercent: 0,
    discountAmount: 25000,
    minOrderAmount: 150000,
    tag: 'CUỐI TUẦN',
    badgeBg: 'bg-emerald-500 text-white'
  },
  {
    code: 'VIPSPORT',
    description: 'Giảm ngay 30k cho khách hàng thân thiết đơn từ 200k',
    desc: 'Giảm ngay 30k cho khách thân thiết (đơn từ 200k)',
    discountPercent: 0,
    discountAmount: 30000,
    minOrderAmount: 200000,
    tag: 'ĐƠN LỚN',
    badgeBg: 'bg-purple-500 text-white'
  },
  {
    code: 'PICKLE50',
    description: 'Giảm 10% tối đa 35k cho sân thể thao',
    desc: 'Giảm 10% tối đa 35k cho sân thể thao',
    discountPercent: 10,
    maxDiscount: 35000,
    minOrderAmount: 100000,
    tag: 'HOT TREND',
    badgeBg: 'bg-blue-500 text-white'
  },
  {
    code: 'TRIAN2026',
    description: 'Giảm ngay 20k tri ân khách hàng rèn luyện sức khỏe',
    desc: 'Giảm ngay 20k tri ân khách hàng (đơn từ 100k)',
    discountPercent: 0,
    discountAmount: 20000,
    minOrderAmount: 100000,
    tag: 'TRI ÂN',
    badgeBg: 'bg-pink-500 text-white'
  },
  {
    code: 'THETHAO50',
    description: 'Giảm ngay 50k cho đơn từ 200k',
    desc: 'Giảm ngay 50.000đ cho đơn từ 200k',
    discountPercent: 0,
    discountAmount: 50000,
    minOrderAmount: 200000,
    tag: 'TIẾT KIỆM',
    badgeBg: 'bg-indigo-500 text-white'
  }
];

export function tinhTienGiamVoucherThucTe(v, tongTien) {
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
}
