import React, { useState, useEffect } from 'react';
import { FileSignature, FileX, Download, Calendar, Home, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const MyContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const data = await axiosClient.get('/student/my-contracts');
            setContracts(data);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải thông tin hợp đồng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium italic">Hệ thống đang trích xuất hồ sơ hợp đồng...</p>
            </div>
        );
    }

    if (contracts.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
                <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-slate-200">
                    <FileX size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-700 uppercase tracking-tight">Hiện chưa có hợp đồng</h2>
                <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed font-medium">
                    Bạn hiện không có hợp đồng cư trú nào tại Ký túc xá.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">Hợp đồng lưu trú</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Lịch sử và thông tin chi tiết hợp đồng nội trú</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {contracts.map(c => {
                    const isActive = c.TrangThai === 1; // Kiểm tra trạng thái

                    return (
                        <div key={c.MaHopDong} className={`group bg-white rounded-[32px] border ${isActive ? 'border-slate-200' : 'border-slate-100 opacity-90'} shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row`}>

                            {/* Cột trái: Phân biệt màu sắc qua trạng thái */}
                            <div className={`p-8 md:w-80 text-white relative overflow-hidden transition-colors duration-500 flex flex-col justify-between 
                                ${isActive ? 'bg-slate-900 group-hover:bg-[#00529C]' : 'bg-slate-500 group-hover:bg-slate-600'}`}>
                                
                                <FileSignature size={140} className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                                
                                <div>
                                    {/* Badge Trạng thái thay đổi theo màu */}
                                    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border shadow-sm
                                        ${isActive 
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                                        {isActive ? <ShieldCheck size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                                        {isActive ? 'Đang hiệu lực' : 'Đã hết hạn'}
                                    </span>
                                    <p className="text-xs font-medium opacity-60">Mã hợp đồng: #{c.MaHopDong}</p>
                                </div>
                                
                                <div className="mt-8">
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-tighter">
                                        Hợp đồng ký túc xá sinh viên
                                    </p>
                                </div>
                            </div>

                            {/* Cột phải: Chi tiết */}
                            <div className="p-8 flex-1 flex flex-col justify-between">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <Home size={14} className={isActive ? "text-blue-500" : "text-slate-400"} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Phòng cư trú</span>
                                        </div>
                                        <p className={`text-xl font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>P.{c.TenPhong}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <Calendar size={14} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Từ ngày</span>
                                        </div>
                                        <p className={`text-sm font-bold ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>{formatDate(c.NgayBatDau)}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <Calendar size={14} className={isActive ? "text-rose-500" : "text-slate-400"} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Đến ngày</span>
                                        </div>
                                        <p className={`text-sm font-bold ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>{formatDate(c.NgayKetThuc)}</p>
                                    </div>
                                </div>

                                {c.NoiDung && (
                                    <div className={`mb-6 p-4 rounded-2xl border text-sm italic ${isActive ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-slate-50/50 border-slate-50 text-slate-400'}`}>
                                        "{c.NoiDung}"
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-slate-400 text-[11px] font-medium">
                                        {isActive ? '* Hợp đồng đang có giá trị pháp lý từ ngày ký kết.' : '* Hợp đồng này đã kết thúc giá trị lưu trú.'}
                                    </p>
                                    <button
                                        className={`w-full sm:w-auto flex items-center justify-center px-8 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg
                                            ${isActive 
                                                ? 'bg-slate-900 text-white hover:bg-[#00529C] shadow-slate-200' 
                                                : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'}`}
                                        disabled={!isActive}
                                    >
                                        <Download size={16} className="mr-2" /> { 'Tải bản mềm PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyContracts;