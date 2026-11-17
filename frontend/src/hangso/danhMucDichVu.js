/**
 * File: danhMucDichVu.js
 * Muc dich: Danh muc dich vu, tien ich the thao va menu Kiosk tiep te toan he thong ESportKing.
 */

// 1. Dich vu & tien ich chuyen biet theo bo mon khi dat san
export const DICH_VU_THEO_MON = {
  FOOTBALL: [
    { id: 'fb_bib', name: 'Bộ Áo Bib Thi Đấu (14 áo 2 màu)', price: 30000, unit: 'bộ/trận', icon: '🎽', desc: 'Chia đội rõ ràng, giặt sạch sấy thơm sau mỗi trận' },
    { id: 'fb_ball', name: 'Bóng Đá FIFA Pro Đúc Tiêu Chuẩn', price: 20000, unit: 'quả/giờ', icon: '⚽', desc: 'Bóng đúc cao cấp số 5, độ nảy và độ đầm chân chuẩn xác' },
    { id: 'fb_ref', name: 'Trọng Tài Có Chứng Chỉ Bắt Trận', price: 150000, unit: 'trận', icon: '🧑‍⚖️', desc: 'Điều hành trận đấu công tâm, đúng luật, kiểm soát va chạm' },
    { id: 'fb_water', name: 'Thùng Nước Điện Giải Revive (24 chai)', price: 120000, unit: 'thùng', icon: '💧', desc: 'Ướp lạnh sẵn tận băng ghế dự bị cho 2 đội thi đấu' },
    { id: 'fb_camera', name: 'Quay Highlight Bàn Thắng AI 4K', price: 100000, unit: 'gói', icon: '📸', desc: 'Tự động cắt video clip bàn thắng chia sẻ lên mạng xã hội' },
  ],
  BADMINTON: [
    { id: 'bm_racket', name: 'Thuê Cặp Vợt Cầu Lông Yonex Cao Cấp', price: 30000, unit: 'cặp/giờ', icon: '🏸', desc: 'Vợt cân bằng, căng cước 10.5kg chuẩn trợ lực' },
    { id: 'bm_shuttle', name: 'Hộp Cầu Lông Thành Công 12 Quả', price: 80000, unit: 'hộp', icon: '🪶', desc: 'Cầu lông chính hãng tốc độ bay chuẩn xác' },
    { id: 'bm_water', name: 'Lốc Nước Điện Giải Pocari Sweat (6 chai)', price: 60000, unit: 'lốc', icon: '🥤', desc: 'Bù nước và ion cấp tốc cho vận động viên' },
    { id: 'bm_grip', name: 'Quấn Cán Vợt Chống Trơn Yonex', price: 20000, unit: 'cái', icon: '🎾', desc: 'Hỗ trợ quấn trực tiếp tại sân thi đấu' },
  ],
  TENNIS: [
    { id: 'tn_racket', name: 'Thuê Vợt Tennis Wilson Pro Staff', price: 50000, unit: 'cây/giờ', icon: '🎾', desc: 'Vợt trợ lực tốt, tay cầm êm ái' },
    { id: 'tn_ball', name: 'Hộp Bóng Tennis Wilson US Open (4 banh)', price: 90000, unit: 'hộp', icon: '🎾', desc: 'Bóng nỉ thi đấu chuyên nghiệp độ nảy ổn định' },
    { id: 'tn_ballboy', name: 'Nhân Viên Nhặt Bóng Nhanh Nhẹn (Ballboy)', price: 80000, unit: 'giờ', icon: '🏃', desc: 'Nhặt bóng liên tục giúp tiết kiệm tối đa thể lực' },
    { id: 'tn_machine', name: 'Máy Bắn Bóng Tennis Tự Động', price: 100000, unit: 'giờ', icon: '🤖', desc: 'Hỗ trợ tập luyện quả đánh thuận tay và trái tay' },
  ],
  BASKETBALL: [
    { id: 'bb_ball', name: 'Bóng Rổ Molten Da PU Tiêu Chuẩn Số 7', price: 20000, unit: 'quả/giờ', icon: '🏀', desc: 'Bóng bám tay, độ nảy chuẩn mặt sân FIBA' },
    { id: 'bb_bib', name: 'Bộ Áo Số Thi Đấu 2 Đội (10 áo)', price: 40000, unit: 'trận', icon: '🎽', desc: 'Áo số thoáng khí phân biệt rõ 2 đội' },
    { id: 'bb_board', name: 'Bảng Điểm Điện Tử LED & Còi Trọng Tài', price: 50000, unit: 'trận', icon: '⏱️', desc: 'Bấm giờ thi đấu và đếm ngược 24s chuyên nghiệp' },
    { id: 'bb_water', name: 'Thùng Nước Khoáng Thể Thao Ướp Lạnh', price: 90000, unit: 'thùng', icon: '💧', desc: 'Nước khoáng thiên nhiên ướp lạnh sẵn' },
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
