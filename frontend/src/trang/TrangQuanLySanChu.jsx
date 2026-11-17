/**
 * File: TrangQuanLySanChu.jsx
 * Muc dich: Trang quan ly cum san va san con danh rieng cho chu san (Owner).
 * Chuc nang: Tao moi cum san, them san con, bat/tat trang thai An/Hien (ACTIVE/HIDDEN) va quan ly gia san.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiDichVu } from '../dichvu/api';
import { PlusCircle, Building2, Eye, EyeOff, Plus, CheckCircle2 } from 'lucide-react';

export default function TrangQuanLySanChu({ nguoiDung }) {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [selectedVenueForCourt, setSelectedVenueForCourt] = useState(null);

  // Form tao cum san
  const [newVenue, setNewVenue] = useState({
    name: '',
    address: '',
    district: 'Quận 10',
    latitude: 10.771971,
    longitude: 106.667845,
    description: '',
  });

  // Form tao san con
  const [newCourt, setNewCourt] = useState({
    sportTypeId: 1, // 1: Cầu Lông, 2: Bóng Đá, 3: Pickleball, 4: Tennis
    name: '',
    capacity: 4,
    basePrice: 100000,
  });

  const taiCumSan = async () => {
    try {
      const res = await apiDichVu.layCumSanCuaToi();
      setVenues(res.data || []);
    } catch (e) {
      console.error('Loi tai cum san cua chu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!nguoiDung || (nguoiDung.role !== 'OWNER' && nguoiDung.role !== 'ADMIN')) {
      navigate('/dang-nhap');
      return;
    }
    taiCumSan();
  }, [nguoiDung]);

  const handleTaoCumSan = async (e) => {
    e.preventDefault();
    try {
      await apiDichVu.taoCumSan(newVenue);
      setShowAddVenue(false);
      setNewVenue({ name: '', address: '', district: 'Quận 10', latitude: 10.771971, longitude: 106.667845, description: '' });
      taiCumSan();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo cụm sân.');
    }
  };

  const handleTaoSanCon = async (e) => {
    e.preventDefault();
    if (!selectedVenueForCourt) return;
    try {
      await apiDichVu.taoSanCon(selectedVenueForCourt, newCourt);
      setSelectedVenueForCourt(null);
      setNewCourt({ sportTypeId: 1, name: '', capacity: 4, totalPrice: 100000 });
      taiCumSan();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo sân con.');
    }
  };

  const handleDoiTrangThaiCum = async (venueId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    try {
      await apiDichVu.doiTrangThaiCumSan(venueId, nextStatus);
      taiCumSan();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đổi trạng thái.');
    }
  };

  const handleDoiTrangThaiSanCon = async (courtId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    try {
      await apiDichVu.doiTrangThaiSanCon(courtId, nextStatus);
      taiCumSan();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đổi trạng thái sân con.');
    }
  };

  return (
    <div className="khung-chinh">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Quản Lý Cụm Sân & Sân Con (Chủ Sân)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Thêm sân, thiết lập giá và bật/tắt nhận đơn đặt sân
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddVenue(!showAddVenue)}
          className="nut nut-chinh"
        >
          <PlusCircle size={18} />
          <span>{showAddVenue ? 'Đóng Form' : '+ Thêm Cụm Sân Mới'}</span>
        </button>
      </div>

      {/* Form Tao Cum San */}
      {showAddVenue && (
        <div className="the-chua" style={{ marginBottom: '24px', background: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
            Khởi Tạo Cụm Sân Kinh Doanh Mới
          </h2>
          <form onSubmit={handleTaoCumSan}>
            <div className="luoi-2-cot">
              <div className="nhom-nhap">
                <label>Tên Cụm Sân:</label>
                <input
                  type="text"
                  className="o-nhap"
                  required
                  placeholder="CLB Thể Thao ABC"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                />
              </div>
              <div className="nhom-nhap">
                <label>Quận/Huyện:</label>
                <input
                  type="text"
                  className="o-nhap"
                  required
                  placeholder="Quận 10"
                  value={newVenue.district}
                  onChange={(e) => setNewVenue({ ...newVenue, district: e.target.value })}
                />
              </div>
            </div>

            <div className="nhom-nhap">
              <label>Địa Chỉ Chi Tiết:</label>
              <input
                type="text"
                className="o-nhap"
                required
                placeholder="123 Đường Nguyễn Trãi, Phường 2"
                value={newVenue.address}
                onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
              />
            </div>

            <div className="nhom-nhap">
              <label>Mô Tả / Tiện Ích:</label>
              <textarea
                className="o-nhap"
                rows={2}
                placeholder="Thảm tiêu chuẩn, đèn LED, căn tin, gửi xe miễn phí..."
                value={newVenue.description}
                onChange={(e) => setNewVenue({ ...newVenue, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAddVenue(false)} className="nut nut-phu">
                Hủy
              </button>
              <button type="submit" className="nut nut-chinh">
                Lưu Cụm Sân
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form Tao San Con (Modal / inline) */}
      {selectedVenueForCourt && (
        <div className="the-chua" style={{ marginBottom: '24px', background: '#f0fdf4', border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
            Thêm Sân Con Mới Cho Cụm Sân #{selectedVenueForCourt}
          </h2>
          <form onSubmit={handleTaoSanCon}>
            <div className="luoi-3-cot">
              <div className="nhom-nhap">
                <label>Tên Sân Con:</label>
                <input
                  type="text"
                  className="o-nhap"
                  required
                  placeholder="Sân Cầu Lông Số 3"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                />
              </div>
              <div className="nhom-nhap">
                <label>Môn Thể Thao:</label>
                <select
                  className="o-chon"
                  value={newCourt.sportTypeId}
                  onChange={(e) => setNewCourt({ ...newCourt, sportTypeId: Number(e.target.value) })}
                >
                  <option value={1}>Cầu Lông</option>
                  <option value={2}>Bóng Đá</option>
                  <option value={3}>Pickleball</option>
                  <option value={4}>Tennis</option>
                </select>
              </div>
              <div className="nhom-nhap">
                <label>Giá Cơ Bản (VNĐ/Giờ):</label>
                <input
                  type="number"
                  className="o-nhap"
                  required
                  step={10000}
                  value={newCourt.basePrice}
                  onChange={(e) => setNewCourt({ ...newCourt, basePrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedVenueForCourt(null)} className="nut nut-phu">
                Hủy
              </button>
              <button type="submit" className="nut nut-chinh">
                Thêm Sân Con
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sach cum san va san con */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          Đang nạp danh sách sân của bạn...
        </div>
      ) : venues.length === 0 ? (
        <div className="the-chua" style={{ textAlign: 'center', padding: '48px' }}>
          Bạn chưa có cụm sân nào. Hãy bấm nút "+ Thêm Cụm Sân Mới" để bắt đầu!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {venues.map((v) => (
            <div key={v.id} className="the-chua">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{v.name}</h3>
                    <span className={`nhan-trang-thai nhan-${v.status.toLowerCase()}`}>
                      {v.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {v.address}, {v.district}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleDoiTrangThaiCum(v.id, v.status)}
                    className="nut nut-phu nut-nho"
                  >
                    {v.status === 'ACTIVE' ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{v.status === 'ACTIVE' ? 'Ẩn Cụm Sân' : 'Mở Cụm Sân'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForCourt(v.id)}
                    className="nut nut-chinh nut-nho"
                  >
                    <Plus size={14} />
                    <span>+ Thêm Sân Con</span>
                  </button>
                </div>
              </div>

              {/* Danh sach san con */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  DANH SÁCH SÂN CON ({v.courts?.length || 0}):
                </h4>
                {v.courts?.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Chưa có sân con nào.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {v.courts?.map((c) => (
                      <div key={c.id} style={{
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {c.sportTypeName} - {Number(c.basePrice).toLocaleString('vi-VN')} đ/h
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDoiTrangThaiSanCon(c.id, c.status)}
                          className="nut nut-phu nut-nho"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          {c.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
