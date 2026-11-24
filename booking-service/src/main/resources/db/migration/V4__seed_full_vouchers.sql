-- V4__seed_full_vouchers.sql
-- Bo sung dong bo day du cac ma voucher tren he thong ESportKing
INSERT INTO vouchers (code, description, discount_percent, discount_amount, max_discount, min_order_amount, is_active)
VALUES 
('CHAOBANMOI', 'Giảm 20% cho thành viên mới (tối đa 50k)', 20, 0, 50000, 100000, true),
('THELUC2026', 'Giảm 15% tối đa 40k cho ngày thường (Thứ 2 - Thứ 5)', 15, 0, 40000, 100000, true),
('CUOITUAN', 'Giảm 15% tối đa 80k cho đơn cuối tuần từ 150k', 15, 0, 80000, 150000, true),
('CUOITUANXU', 'Giảm ngay 25k cho đơn cuối tuần từ 150k', 0, 25000, 25000, 150000, true),
('VIPSPORT', 'Giảm ngay 30k cho khách hàng thân thiết đơn từ 200k', 0, 30000, 30000, 200000, true),
('PICKLE50', 'Giảm 10% tối đa 35k cho sân thể thao', 10, 0, 35000, 100000, true),
('TRIAN2026', 'Giảm ngay 20k tri ân khách hàng đơn từ 100k', 0, 20000, 20000, 100000, true),
('THETHAO50', 'Giảm ngay 50k cho đơn từ 200k', 0, 50000, 50000, 200000, true)
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    discount_percent = VALUES(discount_percent),
    discount_amount = VALUES(discount_amount),
    max_discount = VALUES(max_discount),
    min_order_amount = VALUES(min_order_amount),
    is_active = true;
