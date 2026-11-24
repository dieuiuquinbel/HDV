/**
 * File: danhMucDichVu.js
 * Muc dich: Danh muc dich vu, tien ich the thao va menu Kiosk tiep te toan he thong ESportKing.
 */

// 1. Dich vu & tien ich chuyen biet theo bo mon khi dat san (tinh gia tron ca dat san hoac mua dut)
export const DICH_VU_THEO_MON = {
  FOOTBALL: [
    {
      id: 'fb_ball',
      name: 'Thuê Thêm Bóng Đá FIFA Pro (Số 5)',
      price: 20000,
      unit: 'quả / trọn ca',
      icon: '⚽',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Sân đã tặng sẵn 1 bóng tiêu chuẩn — thuê thêm bóng đúc FIFA Pro đá sướng chân hơn'
    },
    {
      id: 'fb_bib',
      name: 'Bộ Áo Bib Phân Đội (14 áo 2 màu)',
      price: 30000,
      unit: 'bộ / trọn ca',
      icon: '🎽',
      allowQuantity: true,
      maxQty: 3,
      desc: 'Chia đội rõ ràng, giặt sạch sấy thơm dùng suốt ca thuê'
    },
    {
      id: 'fb_ref',
      name: 'Trọng Tài Có Chứng Chỉ Bắt Trận',
      price: 150000,
      unit: 'trọn ca',
      icon: '🧑‍⚖️',
      allowQuantity: false,
      desc: 'Điều hành công tâm, đúng luật, kiểm soát va chạm suốt khung giờ thuê'
    },
    {
      id: 'fb_water',
      name: 'Thùng Nước Điện Giải Revive (24 chai)',
      price: 120000,
      unit: 'thùng',
      icon: '💧',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Mua đứt — ướp lạnh sẵn tận băng ghế dự bị cho 2 đội thi đấu'
    },
    {
      id: 'fb_camera',
      name: 'Quay Highlight Bàn Thắng AI 4K',
      price: 100000,
      unit: 'gói / trọn ca',
      icon: '📸',
      allowQuantity: false,
      desc: 'Ghi hình & tự động cắt video clip bàn thắng toàn bộ ca đấu'
    },
    {
      id: 'fb_shoes',
      name: 'Thuê Giày Đá Bóng Đinh TF Sân Cỏ',
      price: 40000,
      unit: 'đôi / trọn ca',
      icon: '👟',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Giày đinh TF bám cỏ nhân tạo, đã khử khuẩn sạch thơm dùng suốt ca',
      variants: [
        { id: 'size_39', name: 'Size 39', tag: 'Form ôm chân', price: 40000 },
        { id: 'size_40', name: 'Size 40', tag: 'Phổ thông', price: 40000 },
        { id: 'size_41', name: 'Size 41', tag: 'Phổ thông', price: 40000 },
        { id: 'size_42', name: 'Size 42', tag: 'Chân rộng thoải mái', price: 40000 },
      ]
    },
  ],
  BADMINTON: [
    {
      id: 'bm_racket',
      name: 'Thuê Vợt Cầu Lông Cao Cấp',
      price: 35000,
      unit: 'cây / trọn ca',
      icon: '🏸',
      allowQuantity: true,
      maxQty: 6,
      desc: 'Chọn dòng vợt phù hợp lối đánh, căng cước chuẩn trợ lực dùng suốt ca',
      variants: [
        { id: 'astrox77', name: 'Yonex Astrox 77 Pro', tag: 'Thiên công • 4U', price: 35000 },
        { id: 'nanoflare700', name: 'Yonex Nanoflare 700', tag: 'Phản tạt nhanh', price: 30000 },
        { id: 'halbertec8000', name: 'Li-Ning Halbertec 8000', tag: 'Công thủ toàn diện', price: 30000 },
        { id: 'thrusterk', name: 'Victor Thruster K', tag: 'Trợ lực người mới', price: 25000 },
      ]
    },
    {
      id: 'bm_shuttle',
      name: 'Hộp Cầu Lông Thành Công (12 quả)',
      price: 80000,
      unit: 'hộp',
      icon: '🪶',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Mua đứt — cầu lông chính hãng tốc độ bay chuẩn xác, đánh dư mang về'
    },
    {
      id: 'bm_water',
      name: 'Lốc Nước Điện Giải Pocari Sweat (6 chai)',
      price: 60000,
      unit: 'lốc',
      icon: '🥤',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Mua đứt — bù nước và ion cấp tốc, ướp lạnh giao tận sân'
    },
    {
      id: 'bm_grip',
      name: 'Quấn Cán Vợt Chống Trơn Yonex',
      price: 20000,
      unit: 'cái',
      icon: '🎾',
      allowQuantity: true,
      maxQty: 6,
      desc: 'Mua đứt — hỗ trợ quấn trực tiếp tại quầy trước khi vào sân'
    },
  ],
  TENNIS: [
    {
      id: 'tn_racket',
      name: 'Thuê Vợt Tennis Chuyên Nghiệp',
      price: 55000,
      unit: 'cây / trọn ca',
      icon: '🎾',
      allowQuantity: true,
      maxQty: 4,
      desc: 'Chọn mẫu vợt chính hãng theo lối đánh, sử dụng trọn ca đặt sân',
      variants: [
        { id: 'pure_aero', name: 'Babolat Pure Aero 98', tag: 'Tạo xoáy mạnh', price: 55000 },
        { id: 'pro_staff', name: 'Wilson Pro Staff 97', tag: 'Kiểm soát chuẩn', price: 50000 },
        { id: 'speed_mp', name: 'Head Speed MP', tag: 'Cân bằng, dễ đánh', price: 50000 },
        { id: 'ezone_100', name: 'Yonex EZONE 100', tag: 'Trợ lực, êm tay', price: 45000 },
      ]
    },
    {
      id: 'tn_ball',
      name: 'Hộp Bóng Tennis Wilson US Open (4 banh)',
      price: 90000,
      unit: 'hộp',
      icon: '🎾',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Mua đứt — bóng nỉ mới khui hộp, độ nảy ổn định, dùng dư mang về'
    },
    {
      id: 'tn_ballboy',
      name: 'Nhân Viên Nhặt Bóng (Ballboy)',
      price: 100000,
      unit: 'trọn ca',
      icon: '🏃',
      allowQuantity: false,
      desc: 'Phục vụ nhặt bóng liên tục suốt khung giờ thuê, tiết kiệm tối đa thể lực'
    },
    {
      id: 'tn_machine',
      name: 'Máy Bắn Bóng Tennis Tự Động',
      price: 120000,
      unit: 'trọn ca',
      icon: '🤖',
      allowQuantity: false,
      desc: 'Đặt sẵn tại sân dùng trọn ca tập luyện thuận tay & trái tay'
    },
  ],
  BASKETBALL: [
    {
      id: 'bb_ball',
      name: 'Thuê Thêm Bóng Rổ Molten Da PU (Số 7)',
      price: 20000,
      unit: 'quả / trọn ca',
      icon: '🏀',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Sân đã tặng sẵn 1 bóng tiêu chuẩn — thuê thêm bóng Molten FIBA bám tay cực tốt'
    },
    {
      id: 'bb_bib',
      name: 'Bộ Áo Số Thi Đấu 2 Đội (10 áo)',
      price: 40000,
      unit: 'bộ / trọn ca',
      icon: '🎽',
      allowQuantity: true,
      maxQty: 3,
      desc: 'Áo số thoáng khí phân biệt rõ 2 đội dùng suốt ca đấu'
    },
    {
      id: 'bb_board',
      name: 'Bảng Điểm Điện Tử LED & Còi Trọng Tài',
      price: 50000,
      unit: 'bộ / trọn ca',
      icon: '⏱️',
      allowQuantity: false,
      desc: 'Bấm giờ thi đấu và đếm ngược 24s chuyên nghiệp suốt ca đấu'
    },
    {
      id: 'bb_water',
      name: 'Thùng Nước Khoáng Thể Thao Ướp Lạnh',
      price: 90000,
      unit: 'thùng',
      icon: '💧',
      allowQuantity: true,
      maxQty: 5,
      desc: 'Mua đứt — nước khoáng thiên nhiên ướp lạnh đặt sẵn tại sân'
    },
  ]
};

// 2. Menu rut gon tiep te tai san (Live Dispatcher SLA < 5 phut)
export const MENU_DICH_VU_TAI_SAN = [
  { id: 'revive', ten: 'Chai Nước Điện Giải Revive Ướp Lạnh', gia: 25000, donVi: 'chai', icon: '⚡' },
  { id: 'lavie', ten: 'Chai Nước Khoáng Lavie 500ml', gia: 10000, donVi: 'chai', icon: '💧' },
  { id: 'redbull', ten: 'Lon Nước Tăng Lực RedBull Thái', gia: 20000, donVi: 'lon', icon: '🐂' },
  { id: 'khan_lanh', ten: 'Khăn Lạnh Ướp Đá Hương Bạc Hà', gia: 5000, donVi: 'chiếc', icon: '🧊' },
  { id: 'ao_bib', ten: 'Thuê Bộ 10 Áo Bib Phân Đội Thi Đấu', gia: 30000, donVi: 'bộ', icon: '🎽' },
  { id: 'bong_fifa', ten: 'Thuê Quả Bóng Thi Đấu Chuẩn FIFA Pro', gia: 30000, donVi: 'quả', icon: '⚽' },
  { id: 'xit_lanh', ten: 'Bình Xịt Lạnh Sơ Cứu Chấn Thương', gia: 0, donVi: 'lượt', mienPhi: true, icon: '🩹' }
];

// 3. Danh muc Kiosk ban hang tu dong day du (Smart Vending Kiosk)
export const DANH_MUC_KIOSK = [
  // Đồ uống
  { id: 'revive', danhMuc: 'DRINK', ten: 'Nước Điện Giải Revive Chanh Muối', gia: 25000, donVi: 'chai', icon: '⚡', tag: 'Bán chạy nhất' },
  { id: 'pocari', danhMuc: 'DRINK', ten: 'Nước Bù Khoáng Pocari Sweat 500ml', gia: 25000, donVi: 'chai', icon: '💧', tag: 'Chống mất nước' },
  { id: 'redbull', danhMuc: 'DRINK', ten: 'Nước Tăng Lực RedBull Thái Lan', gia: 20000, donVi: 'lon', icon: '🐂', tag: 'Bùng năng lượng' },
  { id: 'sting', danhMuc: 'DRINK', ten: 'Nước Ngọt Sting Dâu Ướp Lạnh', gia: 15000, donVi: 'chai', icon: '🍓', tag: '' },
  { id: 'lavie', danhMuc: 'DRINK', ten: 'Nước Khoáng Thiên Nhiên Lavie 500ml', gia: 10000, donVi: 'chai', icon: '🧊', tag: '' },
  { id: 'highlands', danhMuc: 'DRINK', ten: 'Cà Phê Lon Highlands Coffee Sữa', gia: 22000, donVi: 'lon', icon: '☕', tag: 'Tỉnh táo' },

  // Đồ ăn năng lượng
  { id: 'chuoi', danhMuc: 'FOOD', ten: 'Chuối Tươi Bổ Sung Kali Chống Chuột Rút', gia: 10000, donVi: 'quả', icon: '🍌', tag: 'Khuyên dùng' },
  { id: 'banhmi_xx', danhMuc: 'FOOD', ten: 'Bánh Mì Kẹp Xúc Xích Nóng Giòn', gia: 25000, donVi: 'chiếc', icon: '🥪', tag: 'Nạp năng lượng' },
  { id: 'xucxich_cp', danhMuc: 'FOOD', ten: 'Xúc Xích Nướng Tiệt Trùng CP', gia: 15000, donVi: 'chiếc', icon: '🌭', tag: '' },
  { id: 'luongkho', danhMuc: 'FOOD', ten: 'Lương Khô Thể Thao Ngũ Cốc Yến Mạch', gia: 12000, donVi: 'gói', icon: '🌾', tag: '' },
  { id: 'snack_lays', danhMuc: 'FOOD', ten: 'Snack Khoai Tây Lay\'s Vị Tự Nhiên', gia: 18000, donVi: 'gói', icon: '🥔', tag: '' },

  // Dụng cụ thi đấu
  { id: 'khan_lanh', danhMuc: 'GEAR', ten: 'Khăn Lạnh Ướp Đá Hương Bạc Hà', gia: 5000, donVi: 'chiếc', icon: '❄️', tag: 'Mát lạnh' },
  { id: 'ao_bib_10', danhMuc: 'GEAR', ten: 'Thuê Bộ 10 Áo Bib Phân Đội Thi Đấu', gia: 30000, donVi: 'bộ', icon: '🎽', tag: 'Bóng đá & Bóng rổ' },
  { id: 'bong_fifa', danhMuc: 'GEAR', ten: 'Thuê Quả Bóng Thi Đấu Chuẩn FIFA Pro', gia: 30000, donVi: 'quả', icon: '⚽', tag: '' },
  { id: 'bang_keo_co', danhMuc: 'GEAR', ten: 'Băng Keo Cơ Kinesiology Giảm Mỏi', gia: 25000, donVi: 'cuộn', icon: '🩹', tag: '' },
  { id: 'quan_can_vot', danhMuc: 'GEAR', ten: 'Quấn Cán Vợt Cầu Lông Thấm Hút Yonex', gia: 15000, donVi: 'chiếc', icon: '🏸', tag: '' },

  // Y tế sơ cứu (Miễn phí 100%)
  { id: 'xit_lanh', danhMuc: 'MEDIC', ten: 'Bình Xịt Lạnh Giảm Đau Chấn Thương', gia: 0, donVi: 'lượt xịt', icon: '❄️', mienPhi: true, tag: 'Y tế miễn phí' },
  { id: 'hop_urgo', danhMuc: 'MEDIC', ten: 'Băng Dán Urgo & Sát Trùng Vết Xước', gia: 0, donVi: 'hộp', icon: '❤️', mienPhi: true, tag: 'Y tế miễn phí' }
];
