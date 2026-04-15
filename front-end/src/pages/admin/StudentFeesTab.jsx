import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, User, Loader2, CreditCard, Search, Calendar } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const generateSemesters = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    // Tạo danh sách cho năm hiện tại và năm trước
    for (let i = currentYear - 1; i < currentYear; i++) {
        const schoolYear = `${i}-${i + 1}`;
        years.push(`Học kỳ I (${schoolYear})`);
        years.push(`Học kỳ II (${schoolYear})`);
        years.push(`Học kỳ phụ (Hè ${i + 1})`);
    }
    return years.reverse(); // Đưa các kỳ mới nhất lên đầu
};

const StudentFeesTab = ({ data, isLoading, refresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentList, setStudentList] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const semesters = generateSemesters();

    const [formData, setFormData] = useState({ 
        maSV: '', 
        maPhong: '', 
        period: semesters[0], // Mặc định chọn kỳ mới nhất
        amount: 2000000 
    });

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

    // --- HÀM XÓA HÓA ĐƠN ---
    const handleDeleteInvoice = async (id, status) => {
        // Nếu đã đóng tiền (TrangThaiThanhToan === 1) thì chặn xóa
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
        <div className="space-y-4 font-sans">
            <div className="flex justify-end">
                <button onClick={handleOpenModal} className="flex items-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-lg hover:bg-blue-800 text-sm transition-all active:scale-95">
                    <Plus size={18} className="mr-2" /> Thêm tiền phòng
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
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
                        ) : data.length === 0 ? (
                            <tr><td colSpan="5" className="py-10 text-center text-slate-400">Chưa có hóa đơn tiền phòng nào.</td></tr>
                        ) : data.map(f => (
                            <tr key={f.MaHoaDon} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{f.TenSinhVien}</div>
                                    <div className="text-[10px] text-blue-500 font-bold uppercase">MSV: {f.MaSV}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 flex items-center">
                                    <Calendar size={14} className="mr-1.5 opacity-50" /> {f.KyHoaDon}
                                </td>
                                <td className="px-6 py-4 font-black text-slate-900">{Number(f.SoTien).toLocaleString()}đ</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-tighter ${f.TrangThaiThanhToan === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {f.TrangThaiThanhToan === 1 ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* NÚT XÓA: Tự động mờ nếu đã thanh toán */}
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

            {/* Modal - Select Student & Semester */}
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
                                    <input readOnly type="number" className="w-full px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl outline-none font-black text-slate-500 cursor-not-allowed" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
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