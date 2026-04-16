import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, Home, Calendar, X, AlertCircle, Building2,
  MessageSquare, Filter, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';

const RoomAssignment = () => {
  const [registrations, setRegistrations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReg, setSelectedReg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('Tất cả');

  // --- 1. State cho Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số đơn đăng ký hiển thị trên mỗi trang

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const regs = await axiosClient.get('/admin/registrations');
      setRegistrations(regs);

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

  // --- 2. Reset về trang 1 khi lọc hoặc tìm kiếm ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender]);

  const handleAssign = async (maPhong) => {
    try {
      await axiosClient.post('/admin/registrations/approve', {
        maDK: selectedReg.MaDK,
        maSV: selectedReg.MaSV,
        maPhong: maPhong
      });

      alert(`Đã phân sinh viên ${selectedReg.HoTen} vào phòng ${maPhong} thành công!`);
      setSelectedReg(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi phân phòng!');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Xác nhận từ chối đơn đăng ký này?")) {
      try {
        const response = await axiosClient.put(`/admin/registrations/${id}/reject`);
        alert(response.message || 'Đã từ chối đơn đăng ký thành công!');
        fetchData(); 
      } catch (error) {
        console.error("Lỗi khi từ chối đơn:", error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác này!');
      }
    }
  };

  const filteredData = registrations.filter(reg => {
    const matchesSearch = reg.HoTen?.toLowerCase().includes(searchQuery.toLowerCase()) || reg.MaSV?.includes(searchQuery);
    const matchesGender = filterGender === 'Tất cả' || 
                          (filterGender === 'Nam' && reg.GioiTinh === 1) || 
                          (filterGender === 'Nữ' && reg.GioiTinh === 0);
    return matchesSearch && matchesGender;
  });

  // --- 3. Tính toán dữ liệu hiển thị theo trang ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full font-medium">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc MSV..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400 hidden md:block" />
          <select 
            className="w-full md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold text-slate-600 focus:border-[#00529C] cursor-pointer"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="Tất cả">Giới tính: Tất cả</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
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
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-normal italic"><Loader2 className="animate-spin mx-auto mb-2"/> Đang tải dữ liệu...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-normal italic">Không có đơn đăng ký mới.</td></tr>
              ) : (
                currentItems.map((reg) => (
                  <tr key={reg.MaDK} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 opacity-60" />
                        {new Date(reg.NgayDangKy).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{reg.HoTen}</div>
                      <div className="text-[10px] text-blue-500 font-bold uppercase">{reg.MaSV} </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase">
                      {reg.GioiTinh === 1 ? 'Nam' : 'Nữ'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-semibold">{reg.NguyenVongKhu}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{reg.NguyenVongLoaiPhong}</div>
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

        {/* --- 4. Giao diện Phân trang --- */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold italic">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} trên {filteredData.length} đơn đăng ký
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                    ? "bg-[#00529C] text-white shadow-md shadow-blue-100" 
                    : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PHÂN PHÒNG - Giữ nguyên logic cũ */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-slate-800 font-semibold">
              <span className="uppercase text-xs tracking-widest flex items-center">
                <CheckCircle2 size={16} className="mr-2 text-emerald-500" /> 
                Phân phòng cho: {selectedReg.MaSV} - {selectedReg.HoTen}
              </span>
              <button onClick={() => setSelectedReg(null)} className="p-1.5 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sidebar-scroll">
              <div className="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-100 grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center">Giới tính</p>
                  <p className="text-sm font-bold text-blue-800 uppercase mt-0.5">{selectedReg.GioiTinh === 1 ? 'Nam' : 'Nữ'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Học kỳ đăng ký</p>
                  <p className="text-sm font-bold text-blue-800 mt-0.5">{selectedReg.HocKy}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Khu vực nguyện vọng</p>
                  <p className="text-sm font-bold text-blue-800 mt-0.5">{selectedReg.NguyenVongKhu || 'Không yêu cầu'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Loại phòng nguyện vọng</p>
                  <p className="text-sm font-bold text-blue-800 mt-0.5">{selectedReg.NguyenVongLoaiPhong || 'Không yêu cầu'}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-blue-100">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ghi chú từ sinh viên</p>
                  <p className="text-sm font-medium text-slate-700 mt-1 italic">{selectedReg.GhiChu ? `"${selectedReg.GhiChu}"` : 'Không có ghi chú.'}</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                <Home size={16} className="mr-2 text-slate-400" /> Danh sách phòng trống ({availableRooms.filter(room => room.GioiTinh === selectedReg.GioiTinh).length} phòng):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto sidebar-scroll pr-2">
                {availableRooms.filter(room => room.GioiTinh === selectedReg.GioiTinh).map(room => (
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

            <div className="flex-shrink-0 p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setSelectedReg(null)} className="px-5 py-2 text-slate-500 font-bold text-xs uppercase hover:text-slate-800 transition-colors">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAssignment;