import React, { useState } from 'react';
import { CreditCard, Eye, X, Zap, Droplets, Receipt, CheckCircle2 } from 'lucide-react';

const MyInvoices = () => {
    const [invoices] = useState([
        {
            id: 'INV-24001', month: 'Tháng 03/2026', type: 'Tiền phòng', amount: '750.000đ', status: 'Đã thanh toán', date: '15/03/2026',
            details: { note: 'Thanh toán tiền phòng Kỳ II (Trích từng tháng)' }
        },
        {
            id: 'INV-24002', month: 'Tháng 03/2026', type: 'Điện nước', amount: '125.000đ', status: 'Chưa thanh toán', date: '16/03/2026',
            details: { elecOld: 1200, elecNew: 1350, elecPrice: 3500, waterOld: 50, waterNew: 65, waterPrice: 15000, members: 4 }
        }
    ]);

    const [selectedInvoice, setSelectedInvoice] = useState(null);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Hóa đơn của tôi</h1>
                <p className="text-slate-500 font-medium text-sm">Theo dõi và thanh toán các khoản phí nội trú</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Mã hóa đơn</th>
                            <th className="px-6 py-4">Kỳ/Tháng</th>
                            <th className="px-6 py-4">Số tiền</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{inv.id}</div>
                                    <div className="text-[10px] font-bold uppercase text-slate-500 mt-0.5 flex items-center">
                                        {inv.type === 'Tiền phòng' ? <Receipt size={10} className="mr-1" /> : <Zap size={10} className="mr-1" />}
                                        {inv.type}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-600">{inv.month}</td>
                                <td className="px-6 py-4 font-black text-slate-900">{inv.amount}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter border ${inv.status === 'Đã thanh toán' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedInvoice(inv)}
                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Chi tiết Hóa Đơn */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase tracking-tight">Chi tiết hóa đơn</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{selectedInvoice.id}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-white rounded-lg transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng tiền thanh toán</p>
                                <p className="text-3xl font-black text-blue-600">{selectedInvoice.amount}</p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedInvoice.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedInvoice.status}
                                </span>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm space-y-3">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500 font-medium">Loại hóa đơn</span>
                                    <span className="font-bold text-slate-800">{selectedInvoice.type}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500 font-medium">Kỳ hóa đơn</span>
                                    <span className="font-bold text-slate-800">{selectedInvoice.month}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span className="text-slate-500 font-medium">Ngày lập</span>
                                    <span className="font-bold text-slate-800">{selectedInvoice.date}</span>
                                </div>
                            </div>

                            {selectedInvoice.type === 'Điện nước' && selectedInvoice.details && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Diễn giải số liệu phòng</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                            <div className="flex items-center text-amber-600 text-[10px] font-bold uppercase mb-2"><Zap size={12} className="mr-1" /> Tiền điện</div>
                                            <p className="text-xs text-slate-600 mb-1">Cũ: {selectedInvoice.details.elecOld} - Mới: {selectedInvoice.details.elecNew}</p>
                                            <p className="text-sm font-bold text-slate-800">Dùng: {selectedInvoice.details.elecNew - selectedInvoice.details.elecOld} kWh</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <div className="flex items-center text-blue-600 text-[10px] font-bold uppercase mb-2"><Droplets size={12} className="mr-1" /> Tiền nước</div>
                                            <p className="text-xs text-slate-600 mb-1">Cũ: {selectedInvoice.details.waterOld} - Mới: {selectedInvoice.details.waterNew}</p>
                                            <p className="text-sm font-bold text-slate-800">Dùng: {selectedInvoice.details.waterNew - selectedInvoice.details.waterOld} m³</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-slate-500 italic mt-2">Đã chia đều cho {selectedInvoice.details.members} thành viên trong phòng.</p>
                                </div>
                            )}

                            {selectedInvoice.status !== 'Đã thanh toán' && (
                                <button className="w-full flex items-center justify-center py-3.5 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all uppercase tracking-widest text-xs">
                                    <CreditCard size={18} className="mr-2" /> Thanh toán ngay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyInvoices;