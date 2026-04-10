import React, { useState, useEffect } from 'react';
import { FileSignature, FileX, Download, Calendar, Home, CreditCard, Loader2, ShieldCheck } from 'lucide-react';

const MyContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm gọi API lấy dữ liệu từ Database
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                setLoading(true);
                // Lưu ý: Thay URL này bằng endpoint API thực tế của bạn
                const response = await fetch('http://your-api-url.com/api/student/contracts', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) throw new Error('Không thể tải dữ liệu hợp đồng');

                const data = await response.json();
                setContracts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    // 1. Trạng thái đang tải (Loading)
    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang tải thông tin hợp đồng...</p>
            </div>
        );
    }

    // 2. Trạng thái lỗi (Error)
    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-red-500 text-center px-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FileX size={32} />
                </div>
                <p className="font-bold text-lg">Đã xảy ra lỗi</p>
                <p className="text-sm opacity-80 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // 3. Trạng thái trống (Empty)
    if (contracts.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6">
                    <FileX size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-700">Bạn chưa có hợp đồng nào</h2>
                <p className="text-slate-500 text-sm mt-2">Dữ liệu từ hệ thống chưa ghi nhận hợp đồng của bạn.</p>
            </div>
        );
    }

    // 4. Render danh sách từ Database
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 p-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Hợp đồng của tôi</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Quản lý pháp lý và thời hạn lưu trú tại KTX</p>
                </div>
                <div className="hidden md:flex bg-white px-4 py-2 rounded-2xl border border-slate-200 items-center gap-3 shadow-sm">
                    <ShieldCheck className="text-green-500" size={20} />
                    <span className="text-xs font-bold text-slate-600">Dữ liệu HUMG bảo mật</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {contracts.map(c => (
                    <div key={c.id || c._id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row">

                        {/* Cột trái: ID & Trạng thái */}
                        <div className="bg-slate-900 p-8 md:w-80 text-white relative overflow-hidden transition-colors group-hover:bg-blue-700 flex flex-col justify-between">
                            <FileSignature size={120} className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                                    {c.status}
                                </span>
                                <h3 className="text-3xl font-black mb-1 tracking-tighter">{c.id}</h3>
                                <p className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest">Hợp đồng lưu trú</p>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm font-bold">Ký túc xá Mỏ - Địa chất</p>
                            </div>
                        </div>

                        {/* Cột phải: Chi tiết dữ liệu */}
                        <div className="p-8 flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                        <Home size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Số phòng</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-800">{c.room}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                        <CreditCard size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Đơn giá</span>
                                    </div>
                                    <p className="text-xl font-black text-blue-600">{c.price}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Từ ngày</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{c.startDate}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Đến ngày</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{c.endDate}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-slate-400 italic text-[11px]">
                                    * Hợp đồng có giá trị pháp lý từ ngày ký kết
                                </p>
                                <button
                                    onClick={() => alert(`Đang tải hợp đồng ${c.id}`)}
                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg"
                                >
                                    <Download size={16} className="mr-2" /> Tải bản mềm PDF
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyContracts;