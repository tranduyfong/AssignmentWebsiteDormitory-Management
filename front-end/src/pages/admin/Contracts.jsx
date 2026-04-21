import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Clock, CheckCircle2, XCircle, 
  Edit, Trash2, X, Save, Repeat, LogOut, 
  FileCheck, Download, Loader2, ArrowRight,
  ChevronLeft, ChevronRight // Thêm icon cho phân trang
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // --- 1. State cho Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số bản ghi trên mỗi trang

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/contracts');
      setContracts(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách hợp đồng:", error);
      toast.error("Không thể tải danh sách hợp đồng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // --- 2. Reset về trang 1 khi thay đổi bộ lọc hoặc tìm kiếm ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleTerminate = async (id, name) => {
    if (window.confirm(`Xác nhận chấm dứt hợp đồng của sinh viên ${name}? Hệ thống sẽ giải phóng chỗ ở ngay lập tức.`)) {
      try {
        await axiosClient.put(`/admin/contracts/${id}/terminate`);
        toast.success('Đã chấm dứt hợp đồng và giải phóng phòng.');
        fetchContracts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi chấm dứt hợp đồng');
      }
    }
  };

  const handleExtend = async (contract) => {
    const currentEndDate = new Date(contract.NgayKetThuc);
    const newEndDate = new Date(currentEndDate.setMonth(currentEndDate.getMonth() + 5))
                        .toISOString().split('T')[0];

    if (window.confirm(`Gia hạn hợp đồng cho ${contract.TenSinhVien} đến ngày ${new Date(newEndDate).toLocaleDateString('vi-VN')}?`)) {
      try {
        await axiosClient.put(`/admin/contracts/${contract.MaHopDong}/extend`, {
          ngayKetThucMoi: newEndDate
        });
        toast.success('Gia hạn hợp đồng thành công!');
        fetchContracts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi gia hạn');
      }
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.TenSinhVien?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.MaSV?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.MaHopDong?.toString().includes(searchQuery);
    
    const statusText = c.TrangThai === 1 ? 'Đang hiệu lực' : 'Đã chấm dứt';
    const matchesStatus = filterStatus === 'Tất cả' || statusText === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // --- 3. Tính toán dữ liệu hiển thị theo trang ---
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý Hợp đồng</h1>
          <p className="text-slate-500 font-medium text-sm">Quản lý thời hạn lưu trú và các nghiệp vụ gia hạn/chấm dứt</p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Hợp đồng hiệu lực" value={contracts.filter(c => c.TrangThai === 1).length} icon={FileCheck} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Hợp đồng đã đóng" value={contracts.filter(c => c.TrangThai === 0).length} icon={XCircle} color="text-slate-500" bg="bg-slate-50" />
        <StatCard label="Tổng lượt lưu trú" value={contracts.length} icon={Calendar} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo Tên, MSV hoặc Mã hợp đồng..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00529C] outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="w-full md:w-56 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold text-slate-600 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang hiệu lực">Đang hiệu lực</option>
          <option value="Đã chấm dứt">Đã chấm dứt / Hết hạn</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Mã Hợp đồng</th>
                <th className="px-6 py-4">Sinh viên / MSV</th>
                <th className="px-6 py-4 text-center">Phòng</th>
                <th className="px-6 py-4">Thời hạn (Bắt đầu - Kết thúc)</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2" /> Đang tải dữ liệu...
                    </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-slate-400 italic font-normal">Không tìm thấy hợp đồng nào phù hợp.</td></tr>
              ) : (
                currentItems.map((c) => (
                    <tr key={c.MaHopDong} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">HD{c.MaHopDong}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{c.TenSinhVien}</div>
                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">{c.MaSV}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold text-xs border border-blue-100 uppercase">
                            P.{c.TenPhong}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-xs font-bold">
                            <span className="text-slate-500">{new Date(c.NgayBatDau).toLocaleDateString('vi-VN')}</span>
                            <ArrowRight size={12} className="text-slate-300" />
                            <span className={c.TrangThai === 0 ? 'text-red-400' : 'text-slate-900'}>
                                {new Date(c.NgayKetThuc).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={c.TrangThai} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            {c.TrangThai === 1 && (
                                <>
                                    <button 
                                        onClick={() => handleExtend(c)}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center shadow-sm"
                                    >
                                        <Repeat size={12} className="mr-1.5" /> Gia hạn
                                    </button>
                                    <button 
                                        onClick={() => handleTerminate(c.MaHopDong, c.TenSinhVien)}
                                        className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center shadow-sm"
                                    >
                                        <LogOut size={12} className="mr-1.5" /> Chấm dứt
                                    </button>
                                </>
                            )}
                            {c.TrangThai === 0 && (
                                <span className="text-[10px] font-bold text-slate-300 uppercase italic">Lưu trữ</span>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- 4. Giao diện Phân trang --- */}
        {!isLoading && filteredContracts.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold italic">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredContracts.length)} trên {filteredContracts.length} hợp đồng
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
    </div>
  );
};

// Sub-components giữ nguyên...
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={20} /></div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-800 leading-none mt-1">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${
        status === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
    }`}>
      {status === 1 ? 'Đang hiệu lực' : 'Đã đóng'}
    </span>
  );
};

export default Contracts;