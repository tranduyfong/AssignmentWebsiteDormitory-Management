import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, X, Save, User, Loader2, CreditCard, 
  Search, Calendar, Filter, ChevronLeft, ChevronRight ,Info,ChevronDown
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
    const [studentSearch, setStudentSearch] = useState(''); // State tìm kiếm riêng trong Modal
    const [selectedStudent, setSelectedStudent] = useState(null)

    // --- 1. State cho Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const semesters = generateSemesters();

    const [formData, setFormData] = useState({ 
        maSV: '', 
        maPhong: '', 
        period: semesters[0], 
        amount: 0 
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
    const filteredStudentList = useMemo(() => {
        if (!studentSearch) return studentList;
        return studentList.filter(s => 
            s.HoTen.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.MaSV.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.TenPhong.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [studentList, studentSearch]);

    const handleSelect = (student) => {
        setSelectedStudent(student);
        setFormData({ ...formData, maSV: student.MaSV, maPhong: student.MaPhong });
        setStudentSearch(''); // Reset search sau khi chọn
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
        if (!formData.maSV) return toast.error("Vui lòng chọn sinh viên");
        if (!formData.period) return toast.error("Vui lòng chọn học kỳ");

        const loadingToast = toast.loading("Đang lập hóa đơn...");
        try {
            await axiosClient.post('/admin/invoices', {
                maPhong: formData.maPhong,
                maSV: formData.maSV,
                maDienNuoc: null, // Tiền phòng không có mã điện nước
                loaiHoaDon: 'Tiền phòng',
                kyHoaDon: formData.period,
                soTien: 0 // Gửi 0 vì Backend sẽ tự SELECT HopDong để tính tiền thực tế
            });
            
            toast.success("Hệ thống đã tự động tính phí dựa trên hợp đồng và tạo hóa đơn thành công!", { id: loadingToast, duration: 4000 });
            setIsModalOpen(false);
            refresh();
        } catch (error) { 
            toast.error(error.response?.data?.message || "Lỗi khi tạo hóa đơn tiền phòng", { id: loadingToast }); 
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        
                        {/* Header Modal */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Lập phí phòng</h3>
                            
                            </div>
                            <button 
                                onClick={() => {setIsModalOpen(false); setSelectedStudent(null);}} 
                                className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
                            
                            {/* PHẦN CHỌN SINH VIÊN THÔNG MINH */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                    Chọn sinh viên
                                </label>
                                
                                {selectedStudent ? (
                                    /* Hiển thị khi ĐÃ CHỌN */
                                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                    
                                            <div>
                                                <div className="font-bold text-slate-900">{selectedStudent.HoTen}</div>
                                                <div className="text-xs text-blue-600 font-semibold">MSV: {selectedStudent.MaSV} • Phòng: {selectedStudent.TenPhong}</div>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedStudent(null)}
                                            className="text-xs font-bold text-red-500 hover:underline"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                ) : (
                                    /* Hiển thị Ô TÌM KIẾM khi CHƯA CHỌN */
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="text"
                                                placeholder="Tìm tên, mã sinh viên hoặc phòng..."
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#00529C] transition-all text-sm font-medium"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                            />
                                        </div>

                                        {/* Danh sách kết quả lọc */}
                                        <div className="border border-slate-100 rounded-2xl max-h-48 overflow-y-auto bg-slate-50/30 divide-y divide-slate-100">
                                            {isFetching ? (
                                                <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-slate-300" /></div>
                                            ) : filteredStudentList.length > 0 ? (
                                                filteredStudentList.map(sv => (
                                                    <div 
                                                        key={sv.MaSV}
                                                        onClick={() => handleSelect(sv)}
                                                        className="flex items-center justify-between p-3 hover:bg-white cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-700">{sv.HoTen}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">MSV: {sv.MaSV}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-black text-[#00529C] bg-blue-50 px-2 py-1 rounded-md">P.{sv.TenPhong}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-slate-400 text-xs italic">Không tìm thấy sinh viên phù hợp</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CHỌN HỌC KỲ */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                    Học kỳ
                                </label>
                                <div className="relative group"> {/* Thêm relative ở đây */}
        <select 
            required 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#00529C] font-bold text-slate-700 text-sm appearance-none cursor-pointer transition-all" 
            value={formData.period} 
            onChange={e => setFormData({...formData, period: e.target.value})}
        >
            {semesters.map((s, index) => <option key={index} value={s}>{s}</option>)}
        </select>
        
        {/* ICON CHEVRON XUỐNG */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#00529C] transition-colors">
            <ChevronDown size={18} />
        </div>
    </div>
                            </div>

                            {/* NÚT XÁC NHẬN */}
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={!selectedStudent}
                                    className="w-full py-4 bg-[#00529C] text-white rounded-[20px] font-bold uppercase text-xs shadow-xl shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    Xác nhận lập hóa đơn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFeesTab;