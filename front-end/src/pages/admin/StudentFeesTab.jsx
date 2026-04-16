import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, X, Save, User, Loader2, CreditCard, 
  Search, Calendar, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const generateSemesters = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 1; i < currentYear; i++) {
        const schoolYear = `${i}-${i + 1}`;
        years.push(`Học kỳ I (${schoolYear})`);
        years.push(`Học kỳ II (${schoolYear})`);
        years.push(`Học kỳ phụ (Hè ${i + 1})`);
    }
    return years.reverse();
};

const StudentFeesTab = ({ data, isLoading, refresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentList, setStudentList] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Tất cả');

    // --- 1. State cho Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const semesters = generateSemesters();

    const [formData, setFormData] = useState({ 
        maSV: '', 
        maPhong: '', 
        period: semesters[0], 
        amount: 2000000 
    });

    // --- 2. Reset về trang 1 khi tìm kiếm hoặc lọc ---
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        try {
            setIsFetching(true);
            const res = await axiosClient.get('/admin/students');
            setStudentList(res.filter(s => s.MaPhong !== null));
        } catch (error) {
            toast.error("Không thể tải danh sách sinh viên");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSelectStudent = (msv) => {
        const student = studentList.find(s => s.MaSV === msv);
        if (student) {
            setFormData({ ...formData, maSV: msv, maPhong: student.MaPhong });
        }
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.TenSinhVien?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.MaSV?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = filterStatus === 'Tất cả' || 
                (filterStatus === 'Đã thanh toán' && item.TrangThaiThanhToan === 1) ||
                (filterStatus === 'Chờ thanh toán' && item.TrangThaiThanhToan === 0);

            return matchesSearch && matchesStatus;
        });
    }, [data, searchQuery, filterStatus]);

    // --- 3. Tính toán dữ liệu hiển thị theo trang ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.maSV || !formData.maPhong) return toast.error("Vui lòng chọn sinh viên");
        
        try {
            await axiosClient.post('/admin/invoices', {
                maPhong: formData.maPhong,
                maSV: formData.maSV,
                loaiHoaDon: 'Tiền phòng',
                kyHoaDon: formData.period,
                soTien: formData.amount
            });
            toast.success("Lập hóa đơn thành công");
            setIsModalOpen(false);
            refresh();
        } catch (error) { 
            toast.error(error.response?.data?.message || "Lỗi khi lưu"); 
        }
    };

    const handleDeleteInvoice = async (id, status) => {
        if (status === 1) {
            return toast.error("Không thể xóa hóa đơn đã hoàn thành thanh toán!");
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn tiền phòng này?")) {
            try {
                await axiosClient.delete(`/admin/invoices/${id}`);
                toast.success("Đã xóa hóa đơn");
                refresh();
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi khi xóa");
            }
        }
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <button 
                    onClick={handleOpenModal} 
                    className="flex items-center justify-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95 text-sm"
                >
                    <Plus size={18} className="mr-2" /> Thêm tiền phòng
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full font-medium">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc mã sinh viên..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00529C] outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={16} className="text-slate-400 hidden md:block" />
                    <select 
                        className="w-full md:w-56 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold text-slate-600 focus:border-[#00529C] cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="Tất cả">Tất cả trạng thái</option>
                        <option value="Đã thanh toán">Đã hoàn thành thanh toán</option>
                        <option value="Chờ thanh toán">Chờ thanh toán (Nợ)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Sinh viên / MSV</th>
                                <th className="px-6 py-4">Học kỳ</th>
                                <th className="px-6 py-4">Số tiền</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300"/></td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400">Chưa có hóa đơn tiền phòng nào.</td></tr>
                            ) : currentItems.map(f => (
                                <tr key={f.MaHoaDon} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{f.TenSinhVien}</div>
                                        <div className="text-[10px] text-blue-500 font-bold uppercase">MSV: {f.MaSV}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex items-center">
                                            <Calendar size={14} className="mr-1.5 opacity-50" /> {f.KyHoaDon}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900">{Number(f.SoTien).toLocaleString()}đ</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-tighter ${f.TrangThaiThanhToan === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {f.TrangThaiThanhToan === 1 ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteInvoice(f.MaHoaDon, f.TrangThaiThanhToan)}
                                            disabled={f.TrangThaiThanhToan === 1}
                                            className={`p-2 rounded-lg transition-all border ${f.TrangThaiThanhToan === 1 ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'}`}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- 4. Giao diện Phân trang --- */}
                {!isLoading && filteredData.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-semibold italic">
                            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} trên {filteredData.length} hóa đơn
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === i + 1 
                                        ? "bg-[#00529C] text-white" 
                                        : "text-slate-600 hover:bg-white"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 uppercase text-xs">Lập phí phòng cá nhân</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={18}/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Chọn sinh viên</label>
                                <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700" value={formData.maSV} onChange={e => handleSelectStudent(e.target.value)}>
                                    <option value="">-- Danh sách sinh viên nội trú --</option>
                                    {studentList.map(sv => (
                                        <option key={sv.MaSV} value={sv.MaSV}>{sv.MaSV} - {sv.HoTen} (P.{sv.TenPhong})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Học kỳ thu phí</label>
                                <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})}>
                                    {semesters.map((s, index) => <option key={index} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số tiền (VNĐ)</label>
                                <div className="relative">
                                    <input readOnly type="number" className="w-full px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl outline-none font-black text-slate-500 cursor-not-allowed" value={formData.amount} />
                                    <CreditCard className="absolute right-3 top-2.5 text-blue-300" size={18} />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-[#00529C] text-white rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-blue-200 active:scale-95 transition-all">Xác nhận tạo hóa đơn</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFeesTab;