import React, { useState } from 'react';
import { 
  Plus, Trash2, Receipt, Zap, Droplets, 
  Calendar, X, Save, CheckCircle2, Loader2, Home, Edit 
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const RoomUtilityFeesTab = ({ data, rooms, isLoading, refresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // Quản lý ID đang sửa

    const [formData, setFormData] = useState({ 
        maPhong: '', 
        period: new Date().toISOString().slice(0, 7), 
        elecOld: 0, 
        elecNew: 0, 
        waterOld: 0, 
        waterNew: 0 
    });

    // Hàm mở modal để thêm mới
    const handleOpenAddModal = () => {
        setEditingId(null);
        setFormData({
            maPhong: rooms[0]?.MaPhong || '',
            period: new Date().toISOString().slice(0, 7),
            elecOld: 0,
            elecNew: 0,
            waterOld: 0,
            waterNew: 0
        });
        setIsModalOpen(true);
    };

    // Hàm mở modal để chỉnh sửa
    const handleEdit = (item) => {
        setEditingId(item.MaDienNuoc);
        // Chuyển đổi định dạng ngày từ Database (YYYY-MM-DD) sang định dạng input month (YYYY-MM)
        const dateObj = new Date(item.ThoiGian);
        const monthYear = dateObj.toISOString().slice(0, 7);

        setFormData({
            maPhong: item.MaPhong,
            period: monthYear,
            elecOld: item.ChiSoDienCu,
            elecNew: item.ChiSoDienMoi,
            waterOld: item.ChiSoNuocCu,
            waterNew: item.ChiSoNuocMoi
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const formattedDate = `${formData.period}-01`;
            const payload = {
                maPhong: formData.maPhong,
                chiSoDienCu: formData.elecOld,
                chiSoDienMoi: formData.elecNew,
                chiSoNuocCu: formData.waterOld,
                chiSoNuocMoi: formData.waterNew,
                thoiGian: formattedDate 
            };

            if (editingId) {
                // GỌI API CẬP NHẬT
                await axiosClient.put(`/admin/utilities/${editingId}`, payload);
                toast.success("Đã cập nhật chỉ số điện nước");
            } else {
                // GỌI API THÊM MỚI
                await axiosClient.post('/admin/utilities', payload);
                toast.success("Đã ghi nhận chỉ số điện nước");
            }

            setIsModalOpen(false);
            refresh();
        } catch (error) { 
            toast.error(error.response?.data?.message || "Lỗi khi xử lý dữ liệu"); 
        }
    };

    const handleCreateUtilityInvoice = async (fee) => {
        const ELEC_PRICE = 2500;
        const WATER_PRICE = 15000;
        
        const consumptionElec = fee.ChiSoDienMoi - fee.ChiSoDienCu;
        const consumptionWater = fee.ChiSoNuocMoi - fee.ChiSoNuocCu;
        const totalAmount = (consumptionElec * ELEC_PRICE) + (consumptionWater * WATER_PRICE);

        if (!window.confirm(`Xác nhận chốt hóa đơn cho phòng ${fee.TenPhong}?\nTổng tiền: ${totalAmount.toLocaleString()} VNĐ`)) return;

        try {
            await axiosClient.post('/admin/invoices', {
                maPhong: fee.MaPhong,
                maSV: 'ADMIN_SET', 
                maDienNuoc: fee.MaDienNuoc,
                loaiHoaDon: 'Điện nước',
                kyHoaDon: new Date(fee.ThoiGian).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
                soTien: totalAmount
            });
            toast.success("Đã xuất hóa đơn thành công!");
            refresh();
        } catch (error) { 
            toast.error("Lỗi khi tạo hóa đơn"); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi chỉ số này?")) return;
        try {
            await axiosClient.delete(`/admin/utilities/${id}`);
            toast.success("Đã xóa chỉ số điện nước");
            refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa dữ liệu");
        }
    };

    return (
        <div className="space-y-4 font-sans">
            <div className="flex justify-end">
                <button 
                    onClick={handleOpenAddModal} 
                    className="flex items-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition-all active:scale-95 text-sm"
                >
                    <Plus size={18} className="mr-2" /> Ghi điện nước phòng
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Số phòng / Tòa</th>
                                <th className="px-6 py-4">Giai đoạn</th>
                                <th className="px-6 py-4">Chỉ số (Cũ → Mới)</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {isLoading ? (
                                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300"/></td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400 italic">Chưa có dữ liệu.</td></tr>
                            ) : data.map(f => (
                                <tr key={f.MaDienNuoc} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">Phòng {f.TenPhong}</div>
                                        <div className="text-[10px] text-slate-400 uppercase">{f.TenToaNha}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                                        {new Date(f.ThoiGian).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 space-y-1">
                                        <div className="flex items-center text-xs text-amber-600">
                                            <Zap size={12} className="mr-1"/> Điện: {f.ChiSoDienCu} → {f.ChiSoDienMoi} ({f.ChiSoDienMoi - f.ChiSoDienCu})
                                        </div>
                                        <div className="flex items-center text-xs text-blue-600">
                                            <Droplets size={12} className="mr-1"/> Nước: {f.ChiSoNuocCu} → {f.ChiSoNuocMoi} ({f.ChiSoNuocMoi - f.ChiSoNuocCu})
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-tighter ${f.TrangThaiChot === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {f.TrangThaiChot === 1 ? 'Đã tạo hóa đơn' : 'Chưa chốt'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {f.TrangThaiChot === 0 ? (
                                                <>
                                                    <button onClick={() => handleCreateUtilityInvoice(f)} className="px-3 py-1.5 bg-[#00529C] text-white text-[10px] font-bold rounded-lg hover:bg-blue-800 transition-all flex items-center shadow-md">
                                                        <Receipt size={14} className="mr-1.5" /> Tạo hóa đơn
                                                    </button>
                                                    {/* NÚT SỬA */}
                                                    <button onClick={() => handleEdit(f)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-all">
                                                        <Edit size={16}/>
                                                    </button>
                                                    <button onClick={() => handleDelete(f.MaDienNuoc)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-all">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg flex items-center justify-end italic uppercase border border-emerald-100">
                                                    <CheckCircle2 size={14} className="mr-1.5"/> Đã chốt phí
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Ghi/Sửa điện nước */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-sans text-slate-700">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest italic">
                                {editingId ? "Cập nhật chỉ số điện nước" : "Ghi điện nước Phòng"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors"><X size={18}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-5 text-sm font-semibold">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center">
                                    <Home size={12} className="mr-1"/> Chọn phòng
                                </label>
                                <select 
                                    required 
                                    disabled={editingId !== null}
                                    className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all font-bold 
            ${editingId !== null 
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-[#00529C]' 
            }`}
                                    value={formData.maPhong}
                                    onChange={(e) => setFormData({...formData, maPhong: e.target.value})}
                                >
                                    <option value="">-- Chọn một phòng --</option>
                                    {rooms.map((room) => (
                                        <option key={room.MaPhong} value={room.MaPhong}>
                                            Phòng {room.TenPhong} ({room.TenToaNha})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tháng chốt chỉ số</label>
                                    <input 
                                        required 
                                        type="month" 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-[#00529C]" 
                                        value={formData.period} 
                                        onChange={(e) => setFormData({...formData, period: e.target.value})} 
                                    />
                                </div>

                                {/* Khối nhập ĐIỆN */}
                                <div className="bg-amber-50/50 p-5 rounded-[20px] border border-amber-100 space-y-3 shadow-sm shadow-amber-100/50">
                                    <div className="flex items-center gap-2 text-amber-600 mb-1 font-black uppercase text-[10px] tracking-wider">
                                        <Zap size={14} strokeWidth={3} /> Chỉ số Điện (kWh)
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-amber-500 uppercase ml-1">Số cũ</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-amber-200 rounded-xl outline-none font-bold text-amber-700" value={formData.elecOld} onChange={(e) => setFormData({...formData, elecOld: parseInt(e.target.value) || 0})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-amber-500 uppercase ml-1">Số mới</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-amber-200 rounded-xl outline-none focus:border-amber-500 font-bold text-amber-700" value={formData.elecNew} onChange={(e) => setFormData({...formData, elecNew: parseInt(e.target.value) || 0})} />
                                        </div>
                                    </div>
                                </div>

                                {/* Khối nhập NƯỚC */}
                                <div className="bg-blue-50/50 p-5 rounded-[20px] border border-blue-100 space-y-3 shadow-sm shadow-blue-100/50">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1 font-black uppercase text-[10px] tracking-wider">
                                        <Droplets size={14} strokeWidth={3} /> Chỉ số Nước (m³)
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-blue-500 uppercase ml-1">Số cũ</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl outline-none font-bold text-blue-700" value={formData.waterOld} onChange={(e) => setFormData({...formData, waterOld: parseInt(e.target.value) || 0})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-blue-500 uppercase ml-1">Số mới</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-700" value={formData.waterNew} onChange={(e) => setFormData({...formData, waterNew: parseInt(e.target.value) || 0})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full py-4 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-200 uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center hover:bg-blue-800"
                            >
                                <Save size={16} className="mr-2"/> {editingId ? "Cập nhật dữ liệu" : "Lưu dữ liệu vào hệ thống"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomUtilityFeesTab;