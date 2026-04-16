import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, Plus, Gavel, 
  Trash2, X, CheckCircle2, ShieldAlert, Save, Clock,
  ChevronLeft, ChevronRight // Thêm icon cho phân trang
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // --- 1. State cho Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số bản ghi trên mỗi trang

  const [formData, setFormData] = useState({
    maSV: '', 
    loaiViPham: '', 
    noiDung: '', 
    hinhThucXuLy: 'Nhắc nhở'
  });

  const fetchViolations = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/violations');
      setViolations(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách vi phạm:", error);
      toast.error("Không thể tải danh sách vi phạm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  // --- 2. Reset về trang 1 khi lọc hoặc tìm kiếm ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/violations', formData);
      toast.success('Ghi nhận vi phạm thành công!');
      setIsModalOpen(false);
      setFormData({ maSV: '', loaiViPham: '', noiDung: '', hinhThucXuLy: 'Nhắc nhở' });
      fetchViolations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi ghi nhận vi phạm!');
    }
  };

  const handleProcessViolation = async (id) => {
    if (window.confirm("Xác nhận đã xử lý xong vi phạm này?")) {
      try {
        await axiosClient.put(`/admin/violations/${id}/status`, { trangThai: 1 });
        toast.success("Đã cập nhật trạng thái: Đã xử lý");
        fetchViolations();
      } catch (error) {
        toast.error("Lỗi khi cập nhật trạng thái");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa bản ghi vi phạm này?")) {
        try {
            await axiosClient.delete(`/admin/violations/${id}`);
            toast.success("Đã xóa bản ghi");
            fetchViolations();
        } catch (error) {
            toast.error("Lỗi khi xóa dữ liệu");
        }
    }
  };

  const filteredData = violations.filter(item => {
    const matchesSearch = item.TenSinhVien?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.MaSV?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'Tất cả' || item.LoaiViPham === filterType;
    const matchesStatus = filterStatus === 'Tất cả' || 
                          (filterStatus === 'Chờ xử lý' && item.TrangThai === 0) ||
                          (filterStatus === 'Đã xử lý' && item.TrangThai === 1);
    return matchesSearch && matchesType && matchesStatus;
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
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý vi phạm</h1>
          <p className="text-slate-500 font-medium text-sm">Ghi nhận vi phạm và lưu trữ lịch sử kỷ luật sinh viên</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Ghi nhận vi phạm
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStat label="Tổng vi phạm" value={violations.length} icon={ShieldAlert} color="text-red-600" bg="bg-red-50" />
        <QuickStat label="Chờ xử lý" value={violations.filter(v => v.TrangThai === 0).length} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
        <QuickStat label="Đã xử lý" value={violations.filter(v => v.TrangThai === 1).length} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc MSV sinh viên..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
         <div className="flex flex-1 w-full gap-2">
            <select
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold text-slate-600"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            >
            <option value="Tất cả">Tất cả loại lỗi</option>
            <option value="Sử dụng thiết bị điện cấm">Sử dụng thiết bị cấm</option>
            <option value="Đi muộn">Đi muộn</option>
            <option value="Gây mất trật tự">Gây mất trật tự</option>
            <option value="Vệ sinh kém">Vệ sinh kém</option>
            </select>

            <select
            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold text-slate-600"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đã xử lý">Đã xử lý</option>
            </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Thời gian / Mã</th>
                <th className="px-6 py-4">Sinh viên</th>
                <th className="px-6 py-4">Nội dung vi phạm</th>
                <th className="px-6 py-4">Hình thức xử lý</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 italic font-normal">Đang tải dữ liệu...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 italic font-normal">Không tìm thấy bản ghi nào.</td></tr>
              ) : (
                currentItems.map((v) => (
                  <tr key={v.MaViPham} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{new Date(v.NgayViPham).toLocaleDateString('vi-VN')}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">VP{v.MaViPham}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{v.TenSinhVien}</div>
                      <div className="text-[10px] text-blue-500 font-bold uppercase">{v.MaSV}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-700 text-xs">{v.LoaiViPham}</div>
                      <div className="text-xs text-slate-400 truncate font-normal">"{v.NoiDung}"</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-red-600 font-bold text-[11px] uppercase tracking-tighter">
                        <Gavel size={14} className="mr-1.5 opacity-50" /> {v.HinhThucXuLy}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <StatusBadge status={v.TrangThai} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {v.TrangThai === 0 && (
                           <button 
                            onClick={() => handleProcessViolation(v.MaViPham)}
                            className="px-3 py-1 bg-[#00529C] text-white text-[10px] font-bold rounded-lg hover:bg-blue-800 transition-all uppercase tracking-tighter shadow-md shadow-blue-100"
                           >
                             Xử lý vi phạm
                           </button>
                        )}
                        <button 
                            onClick={() => handleDelete(v.MaViPham)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                        >
                            <Trash2 size={16} />
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
            <p className="text-xs text-slate-500 font-semibold">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} trên tổng {filteredData.length} vi phạm
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              
              {/* Tạo các nút số trang */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                    ? "bg-[#00529C] text-white shadow-md shadow-blue-100" 
                    : "text-slate-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal ghi nhận vi phạm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest flex items-center">
                <ShieldAlert size={16} className="mr-2" /> Ghi nhận vi phạm mới
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-sm font-medium text-slate-700">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mã sinh viên</label>
                <input 
                  required 
                  placeholder="Nhập mã sinh viên" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-semibold" 
                  value={formData.maSV} 
                  onChange={e => setFormData({ ...formData, maSV: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Loại vi phạm</label>
                  <select 
                    required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 font-semibold" 
                    value={formData.loaiViPham} 
                    onChange={e => setFormData({ ...formData, loaiViPham: e.target.value })}
                  >
                    <option value="">Chọn loại lỗi</option>
                    <option value="Sử dụng thiết bị điện cấm">Sử dụng thiết bị cấm</option>
                    <option value="Đi muộn">Đi muộn</option>
                    <option value="Gây mất trật tự">Gây mất trật tự</option>
                    <option value="Vệ sinh kém">Vệ sinh kém</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Hình thức xử lý</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 font-semibold" 
                    value={formData.hinhThucXuLy} 
                    onChange={e => setFormData({ ...formData, hinhThucXuLy: e.target.value })}
                  >
                    <option value="Nhắc nhở">Nhắc nhở</option>
                    <option value="Cảnh cáo cấp 1">Cảnh cáo cấp 1</option>
                    <option value="Trừ điểm rèn luyện">Trừ điểm rèn luyện</option>
                    <option value="Đuổi khỏi ký túc xá">Đuổi khỏi ký túc xá</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mô tả chi tiết</label>
                <textarea 
                  required 
                  rows="4" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-medium" 
                  placeholder="Mô tả cụ thể hành vi vi phạm..." 
                  value={formData.noiDung} 
                  onChange={e => setFormData({ ...formData, noiDung: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors uppercase text-[10px]">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all uppercase text-[10px] flex items-center justify-center">
                  <Save size={16} className="mr-2" /> Lưu vi phạm
                </button>
              </div>
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
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
    return (
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${
            status === 0 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
        }`}>
            {status === 0 ? "Chờ xử lý" : "Đã xử lý"}
        </span>
    );
};

export default Violations;