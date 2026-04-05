import React, { useState } from 'react';
import { FileSignature, FileX, Download } from 'lucide-react';

const MyContracts = () => {
    // Thay đổi data thành [] để test giao diện "Chưa có hợp đồng"
    const [contracts] = useState([
        {
            id: 'HD-2025-001',
            room: 'A1-101',
            startDate: '01/01/2025',
            endDate: '30/06/2026',
            status: 'Đang hiệu lực',
            price: '750.000đ/tháng'
        }
    ]);

    if (contracts.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in">
                <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <FileX size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Bạn chưa có hợp đồng nào</h2>
                <p className="text-slate-500 text-sm">Hãy tiến hành đăng ký ở KTX để Ban quản lý xét duyệt nhé.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Hợp đồng của tôi</h1>
                <p className="text-slate-500 font-medium text-sm">Quản lý và theo dõi thời hạn lưu trú của bạn</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {contracts.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                        <div className="bg-blue-600 p-6 md:w-1/3 flex flex-col justify-center items-start text-white relative overflow-hidden">
                            <FileSignature size={80} className="absolute -bottom-4 -right-4 opacity-10" />
                            <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                                {c.status}
                            </span>
                            <h3 className="text-2xl font-black mb-1">{c.id}</h3>
                            <p className="text-blue-100 text-sm font-medium">Ký túc xá Đại học Mỏ - Địa chất</p>
                        </div>

                        <div className="p-6 md:w-2/3 grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phòng đang ở</p>
                                <p className="text-lg font-bold text-slate-800">{c.room}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đơn giá</p>
                                <p className="text-lg font-bold text-blue-600">{c.price}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày bắt đầu</p>
                                <p className="text-sm font-semibold text-slate-700">{c.startDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày kết thúc</p>
                                <p className="text-sm font-semibold text-slate-700">{c.endDate}</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-slate-100 flex justify-end">
                                <button className="flex items-center px-4 py-2 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl font-bold text-xs transition-all">
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