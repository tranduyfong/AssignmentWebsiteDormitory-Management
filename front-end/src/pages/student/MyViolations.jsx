import React, { useState } from 'react';
import { Gavel, CheckCircle2 } from 'lucide-react';

const MyViolations = () => {
    // Thay data thành [] để test trạng thái "Không có vi phạm"
    const [violations] = useState([
        {
            id: 'VP-2024-001', date: '10/03/2024', violationType: 'Sử dụng thiết bị điện cấm',
            description: 'Sử dụng ấm siêu tốc trong phòng.', handling: 'Cảnh cáo cấp 1'
        }
    ]);

    if (violations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in">
                <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 border-8 border-blue-100/50">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Hồ sơ trong sạch</h2>
                <p className="text-slate-500 text-sm max-w-md text-center">Bạn không có bản ghi vi phạm nào. Hãy tiếp tục duy trì việc chấp hành tốt nội quy KTX nhé!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Lịch sử vi phạm</h1>
                <p className="text-slate-500 font-medium text-sm">Ghi nhận các lỗi vi phạm nội quy KTX của cá nhân</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Ngày vi phạm</th>
                            <th className="px-6 py-4">Loại vi phạm</th>
                            <th className="px-6 py-4">Mô tả chi tiết</th>
                            <th className="px-6 py-4">Hình thức kỷ luật</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {violations.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-700">{v.date}</td>
                                <td className="px-6 py-4 font-bold text-red-600">{v.violationType}</td>
                                <td className="px-6 py-4 text-slate-500">{v.description}</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 w-fit">
                                        <Gavel size={14} className="mr-1.5" /> {v.handling}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyViolations;