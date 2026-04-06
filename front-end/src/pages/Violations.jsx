import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, Plus,
  Gavel, History, Trash2, X, CheckCircle2
} from 'lucide-react';
import axiosClient from '../utils/axios.interceptor';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');

  // State cho Form
  const [formData, setFormData] = useState({
    maSV: '', loaiViPham: '', noiDung: '', hinhThucXuLy: 'Nhắc nhở'
  });

  // Lấy dữ liệu
  const fetchViolations = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/violations');
      setViolations(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách vi phạm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  // Ghi nhận vi phạm mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/violations', formData);
      alert('Ghi nhận vi phạm thành công!');
      setIsModalOpen(false);
      setFormData({ maSV: '', loaiViPham: '', noiDung: '', hinhThucXuLy: 'Nhắc nhở' });
      fetchViolations(); // Load lại bảng
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi ghi nhận vi phạm!');
    }
  };

  const filteredData = violations.filter(item => {
    const matchesSearch = item.TenSinhVien?.toLowerCase().includes(searchQuery.toLowerCase()) || item.MaSV?.includes(searchQuery);
    const matchesType = filterType === 'Tất cả' || item.LoaiViPham === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý vi phạm</h1>
          <p className="text-slate-500 font-medium text-sm">Ghi nhận vi phạm và lưu trữ lịch sử kỷ luật sinh viên</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all text-sm"
        >
          <Plus size={18} className="mr-2" /> Ghi nhận vi phạm
        </button>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStat label="Tổng số vi phạm" value={violations.length} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc MSV sinh viên..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex-1 md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Tất cả">Tất cả loại lỗi</option>
            <option value="Sử dụng thiết bị điện cấm">Sử dụng thiết bị cấm</option>
            <option value="Đi muộn">Đi muộn</option>
            <option value="Gây mất trật tự">Gây mất trật tự</option>
            <option value="Vệ sinh kém">Vệ sinh kém</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px]">Mã VP / Ngày</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px]">Sinh viên</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px]">Nội dung vi phạm</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px]">Hình thức xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-400">Không có bản ghi vi phạm nào.</td></tr>
              ) : (
                filteredData.map((v) => (
                  <tr key={v.MaViPham} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{new Date(v.NgayViPham).toLocaleDateString('vi-VN')}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">VP{v.MaViPham}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{v.TenSinhVien}</div>
                      <div className="text-xs text-blue-500 font-medium">{v.MaSV} • {v.TenPhong ? `Phòng ${v.TenPhong}` : 'Chưa phân phòng'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-slate-700">{v.LoaiViPham}</div>
                      <div className="text-xs text-slate-400 truncate">"{v.NoiDung}"</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center font-medium text-red-600">
                        <Gavel size={14} className="mr-1.5 opacity-50" /> {v.HinhThucXuLy}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="font-bold text-red-600 uppercase">Ghi nhận vi phạm mới</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Mã sinh viên</label>
                <input required className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:border-red-500" value={formData.maSV} onChange={e => setFormData({ ...formData, maSV: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Loại vi phạm</label>
                  <select required className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:border-red-500" value={formData.loaiViPham} onChange={e => setFormData({ ...formData, loaiViPham: e.target.value })}>
                    <option value="">Chọn loại</option>
                    <option value="Sử dụng thiết bị điện cấm">Thiết bị cấm</option>
                    <option value="Đi muộn">Đi muộn</option>
                    <option value="Gây mất trật tự">Mất trật tự</option>
                    <option value="Vệ sinh kém">Vệ sinh kém</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Hình thức xử lý</label>
                  <select className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:border-red-500" value={formData.hinhThucXuLy} onChange={e => setFormData({ ...formData, hinhThucXuLy: e.target.value })}>
                    <option value="Nhắc nhở">Nhắc nhở</option>
                    <option value="Cảnh cáo cấp 1">Cảnh cáo 1</option>
                    <option value="Trừ điểm rèn luyện">Trừ điểm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Mô tả chi tiết</label>
                <textarea required rows="3" className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:border-red-500" value={formData.noiDung} onChange={e => setFormData({ ...formData, noiDung: e.target.value })}></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Lưu vi phạm</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickStat = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={22} /></div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default Violations;