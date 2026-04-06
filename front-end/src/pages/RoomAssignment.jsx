import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Home, Calendar, X, AlertCircle, Building2 } from 'lucide-react';
import axiosClient from '../utils/axios.interceptor';

const RoomAssignment = () => {
  const [registrations, setRegistrations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReg, setSelectedReg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch dữ liệu Đơn đăng ký và Danh sách phòng
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Lấy đơn chờ duyệt
      const regs = await axiosClient.get('/admin/registrations');
      setRegistrations(regs);

      // Lấy danh sách toàn bộ phòng (sau đó ta sẽ tự filter phòng còn trống)
      const rooms = await axiosClient.get('/admin/rooms');
      setAvailableRooms(rooms.filter(r => r.SoSinhVienHienTai < r.SucChua && r.TrangThai !== 'Bảo trì'));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Xử lý phân phòng (Gọi API Approve)
  const handleAssign = async (maPhong) => {
    try {
      await axiosClient.post('/admin/registrations/approve', {
        maDK: selectedReg.MaDK,
        maSV: selectedReg.MaSV,
        maPhong: maPhong
      });

      alert(`Đã phân sinh viên ${selectedReg.HoTen} vào phòng ${maPhong} thành công!`);
      setSelectedReg(null);
      fetchData(); // Tải lại dữ liệu để cập nhật danh sách
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi phân phòng!');
    }
  };

  // 3. Hàm từ chối đơn (Giả lập cập nhật trạng thái = 2)
  const handleReject = async (id) => {
    if (window.confirm("Xác nhận từ chối đơn đăng ký này?")) {
      // Thực tế nên có API riêng cho Reject, ở đây update UI tạm
      setRegistrations(registrations.filter(reg => reg.MaDK !== id));
      alert('Đã từ chối đơn!');
    }
  };

  const filteredData = registrations.filter(reg =>
    reg.HoTen?.toLowerCase().includes(searchQuery.toLowerCase()) || reg.MaSV?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Xét duyệt & Phân phòng</h1>
          <p className="text-slate-500 font-medium text-sm">Tiếp nhận đăng ký nội trú và điều phối chỗ ở cho sinh viên</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <AlertCircle size={18} className="text-amber-500 mr-2" />
            <span className="text-xs font-bold text-slate-600">
              {registrations.length} đơn mới cần xử lý
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc MSV..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4">Sinh viên</th>
                <th className="px-6 py-4">Giới tính</th>
                <th className="px-6 py-4">Nguyện vọng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-400">Không có đơn đăng ký mới.</td></tr>
              ) : (
                filteredData.map((reg) => (
                  <tr key={reg.MaDK} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 opacity-60" />
                        {new Date(reg.NgayDangKy).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{reg.HoTen}</div>
                      <div className="text-[10px] text-blue-500 font-bold uppercase">{reg.MaSV} • {reg.Lop}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase">
                      {reg.GioiTinh === 1 ? 'Nam' : 'Nữ'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800">{reg.NguyenVongKhu} - {reg.NguyenVongLoaiPhong}</div>
                      {reg.GhiChu && <div className="text-[10px] text-slate-400 italic mt-1">Ghi chú: {reg.GhiChu}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-md shadow-blue-100"
                        >
                          <Home size={14} className="mr-1.5" /> Phân phòng
                        </button>
                        <button
                          onClick={() => handleReject(reg.MaDK)}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100"
                          title="Từ chối"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PHÂN PHÒNG */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-slate-800 font-semibold">
              <span className="uppercase text-xs tracking-widest">Phân phòng cho: {selectedReg.HoTen}</span>
              <button onClick={() => setSelectedReg(null)} className="p-1.5 hover:bg-white rounded-full"><X size={18} /></button>
            </div>

            <div className="p-8">
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Giới tính / Lớp</p>
                  <p className="text-lg font-bold text-blue-700 uppercase">{selectedReg.GioiTinh === 1 ? 'Nam' : 'Nữ'} - {selectedReg.Lop}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Yêu cầu học kỳ</p>
                  <p className="text-sm font-semibold text-blue-700">{selectedReg.HocKy}</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center ">
                <Home size={16} className="mr-2 text-slate-400" /> Danh sách phòng trống ({availableRooms.length} phòng):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto sidebar-scroll pr-2">
                {availableRooms.map(room => (
                  <div
                    key={room.MaPhong}
                    onClick={() => handleAssign(room.MaPhong)}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-white cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Phòng {room.TenPhong}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{room.TenKhu} • {room.TenToaNha}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-700">{room.SoSinhVienHienTai}/{room.SucChua}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Đã ở</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(room.SoSinhVienHienTai / room.SucChua) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setSelectedReg(null)} className="px-5 py-2 text-slate-500 font-bold text-xs uppercase">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAssignment;