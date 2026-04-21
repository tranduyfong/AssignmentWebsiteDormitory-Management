import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Trash2, Receipt, Zap, Droplets,
    Calendar, X, Save, CheckCircle2, Loader2, Home, Edit, Search, Filter,
    ChevronLeft, ChevronRight ,ChevronDown
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const RoomUtilityFeesTab = ({ data, rooms, isLoading, refresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
    const [roomSearch, setRoomSearch] = useState('');

    // --- 1. State cho Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số lượng bản ghi trên mỗi trang

    const [formData, setFormData] = useState({
        maPhong: '',
        period: new Date().toISOString().slice(0, 7),
        elecOld: 0,
        elecNew: 0,
        waterOld: 0,
        waterNew: 0
    });

    const autoFillOldNumbers = (roomId, selectedPeriod) => {
        if (!roomId || !selectedPeriod) return;

        // Chuyển period chọn (YYYY-MM) thành Date để so sánh
        const currentSelection = new Date(selectedPeriod + "-01");

        // Tìm trong danh sách 'data' (từ API trả về) bản ghi mới nhất của phòng này 
        // nhưng phải có thời gian trước tháng đang chọn
        const lastRecord = data
            .filter(item => item.MaPhong === parseInt(roomId))
            .filter(item => new Date(item.ThoiGian) < currentSelection)
            .sort((a, b) => new Date(b.ThoiGian) - new Date(a.ThoiGian))[0];

        if (lastRecord) {
            setFormData(prev => ({
                ...prev,
                elecOld: lastRecord.ChiSoDienMoi,
                waterOld: lastRecord.ChiSoNuocMoi
            }));
            // Thông báo nhỏ cho người dùng
            toast.success(`Đã tự động lấy số cũ từ tháng ${new Date(lastRecord.ThoiGian).getMonth() + 1}`);
        } else {
            // Nếu không thấy (phòng mới chưa có dữ liệu tháng trước)
            setFormData(prev => ({ ...prev, elecOld: 0, waterOld: 0 }));
        }
    };
     useEffect(() => {
        if (!editingId && isModalOpen) { // Chỉ tự điền khi Thêm mới, không tự điền khi đang Sửa
            autoFillOldNumbers(formData.maPhong, formData.period);
        }
    }, [formData.maPhong, formData.period, isModalOpen, editingId, autoFillOldNumbers]);

    // --- 2. Reset về trang 1 khi tìm kiếm hoặc lọc ---
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.TenPhong?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'Tất cả' ||
                (filterStatus === 'Chưa chốt' && item.TrangThaiChot === 0) ||
                (filterStatus === 'Đã chốt' && item.TrangThaiChot === 1);

            return matchesSearch && matchesStatus;
        });
    }, [data, searchQuery, filterStatus]);

    // --- 3. Tính toán dữ liệu hiển thị theo trang ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleOpenAddModal = () => {
        setEditingId(null);
        setFormData({
            maPhong: '',
            period: new Date().toISOString().slice(0, 7),
            elecOld: 0,
            elecNew: 0,
            waterOld: 0,
            waterNew: 0
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingId(item.MaDienNuoc);
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
                await axiosClient.put(`/admin/utilities/${editingId}`, payload);
                toast.success("Đã cập nhật chỉ số điện nước");
            } else {
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
            // Hiển thị chính xác lý do Backend từ chối
            toast.error(error.response?.data?.message || "Lỗi khi tạo hóa đơn");
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

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full font-medium">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo số phòng (ví dụ: 101)..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00529C] outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={16} className="text-slate-400 hidden md:block" />
                    <select
                        className="w-full md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold text-slate-600 focus:border-[#00529C] cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="Tất cả">Tất cả trạng thái</option>
                        <option value="Chưa chốt">Chưa chốt phí</option>
                        <option value="Đã chốt">Đã tạo hóa đơn</option>
                    </select>
                </div>
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
                                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400 italic">Chưa có dữ liệu.</td></tr>
                            ) : currentItems.map(f => (
                                <tr key={f.MaDienNuoc} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">Phòng {f.TenPhong}</div>
                                         <div className="text-[10px] text-slate-400 uppercase font-semibold">
        {f.TenKhu} - {f.TenToaNha}
    </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                                        {new Date(f.ThoiGian).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 space-y-1">
                                        <div className="flex items-center text-xs text-amber-600">
                                            <Zap size={12} className="mr-1" /> Điện: {f.ChiSoDienCu} → {f.ChiSoDienMoi} ({f.ChiSoDienMoi - f.ChiSoDienCu})
                                        </div>
                                        <div className="flex items-center text-xs text-blue-600">
                                            <Droplets size={12} className="mr-1" /> Nước: {f.ChiSoNuocCu} → {f.ChiSoNuocMoi} ({f.ChiSoNuocMoi - f.ChiSoNuocCu})
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
                                                    <button onClick={() => handleEdit(f)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-all">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(f.MaDienNuoc)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg flex items-center justify-end italic uppercase border border-emerald-100">
                                                    <CheckCircle2 size={14} className="mr-1.5" /> Đã chốt phí
                                                </div>
                                            )}
                                        </div>
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
                            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} trên {filteredData.length} phòng
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
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
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

            {/* Modal - Giữ nguyên logic cũ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-sans text-slate-700">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest italic">
                                {editingId ? "Cập nhật chỉ số điện nước" : "Ghi điện nước Phòng"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5 text-sm font-semibold">
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center">
                                    <Home size={12} className="mr-1" /> Chọn phòng
                                </label>
                                 <button
        type="button"
        disabled={editingId !== null}
        onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl transition-all font-bold text-sm
            ${editingId !== null 
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-700'
            }`}
    >
        <span className={`truncate ${!formData.maPhong ? 'text-slate-400 font-medium' : 'text-slate-700'}`}>
    {formData.maPhong 
        ? rooms.find(r => r.MaPhong == formData.maPhong)?.TenKhu + " - " + rooms.find(r => r.MaPhong == formData.maPhong)?.TenToaNha + " - Phòng " + rooms.find(r => r.MaPhong == formData.maPhong)?.TenPhong
        : "Chọn phòng"}
</span>
         <ChevronDown 
        size={18} 
        className={`transition-transform duration-300 text-slate-400 ${isRoomDropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
    />
    </button>

    {/* Menu Dropdown */}
    {isRoomDropdownOpen && editingId === null && (
        <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Thanh tìm kiếm nhanh trong dropdown */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                        type="text"
                        placeholder="Tìm Khu, Tòa hoặc Số phòng..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-all"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Danh sách phòng có Scroll */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {[...rooms]
                    .filter(r => 
                        r.TenPhong.toLowerCase().includes(roomSearch.toLowerCase()) ||
                        r.TenToaNha.toLowerCase().includes(roomSearch.toLowerCase()) ||
                        r.TenKhu?.toLowerCase().includes(roomSearch.toLowerCase())
                    )
                    .sort((a, b) => a.TenKhu.localeCompare(b.TenKhu) || a.TenToaNha.localeCompare(b.TenToaNha))
                    .map((room) => (
                        <div
                            key={room.MaPhong}
                            className={`px-4 py-3 text-xs cursor-pointer transition-all flex items-center justify-between
                                ${formData.maPhong == room.MaPhong ? 'bg-blue-50 text-[#00529C]' : 'hover:bg-slate-50 text-slate-600'}`}
                            onClick={() => {
                                setFormData({ ...formData, maPhong: room.MaPhong });
                                setIsRoomDropdownOpen(false);
                                setRoomSearch('');
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold">Phòng {room.TenPhong}</span>
                                <span className="text-[10px] opacity-60 uppercase">{room.TenKhu} - {room.TenToaNha}</span>
                            </div>
                            {formData.maPhong == room.MaPhong && <CheckCircle2 size={14} />}
                        </div>
                    ))}
                
                {/* Trường hợp không tìm thấy */}
                {rooms.length > 0 && roomSearch !== '' && ![...rooms].some(r => r.TenPhong.includes(roomSearch)) && (
                    <div className="p-4 text-center text-slate-400 text-xs italic">Không tìm thấy phòng</div>
                )}
            </div>
        </div>
    )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tháng chốt chỉ số</label>
                                    <input
                                        required
                                        type="month"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-[#00529C]"
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    />
                                </div>

                                <div className="bg-amber-50/50 p-5 rounded-[20px] border border-amber-100 space-y-3 shadow-sm shadow-amber-100/50">
                                    <div className="flex items-center gap-2 text-amber-600 mb-1 font-black uppercase text-[10px] tracking-wider">
                                        <Zap size={14} strokeWidth={3} /> Chỉ số Điện (kWh)
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-amber-500 uppercase ml-1">Số cũ</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-amber-200 rounded-xl outline-none font-bold text-amber-700" value={formData.elecOld} onChange={(e) => setFormData({ ...formData, elecOld: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-amber-500 uppercase ml-1">Số mới</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-amber-200 rounded-xl outline-none focus:border-amber-500 font-bold text-amber-700" value={formData.elecNew} onChange={(e) => setFormData({ ...formData, elecNew: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-5 rounded-[20px] border border-blue-100 space-y-3 shadow-sm shadow-blue-100/50">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1 font-black uppercase text-[10px] tracking-wider">
                                        <Droplets size={14} strokeWidth={3} /> Chỉ số Nước (m³)
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-blue-500 uppercase ml-1">Số cũ</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl outline-none font-bold text-blue-700" value={formData.waterOld} onChange={(e) => setFormData({ ...formData, waterOld: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-blue-500 uppercase ml-1">Số mới</label>
                                            <input type="number" className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-700" value={formData.waterNew} onChange={(e) => setFormData({ ...formData, waterNew: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-200 uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center hover:bg-blue-800"
                            >
                                <Save size={16} className="mr-2" /> {editingId ? "Cập nhật dữ liệu" : "Lưu dữ liệu vào hệ thống"}
                            </button>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default RoomUtilityFeesTab;