import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

const ViewRules = () => {
    const rules = [
        {
            id: 'NQ-01', title: 'Quy định về thời gian ra vào', category: 'Giờ giấc',
            content: 'Sinh viên phải có mặt tại KTX trước 23h00 hàng ngày. Cổng KTX mở cửa từ 05h00 sáng.',
            icon: Clock, color: 'text-blue-600 bg-blue-50'
        },
        {
            id: 'NQ-02', title: 'Quy định sử dụng thiết bị điện', category: 'An toàn',
            content: 'Nghiêm cấm nấu ăn trong phòng. Chỉ được sử dụng các thiết bị điện công suất thấp như sạc điện thoại, laptop, đèn bàn.',
            icon: AlertTriangle, color: 'text-red-600 bg-red-50'
        },
        {
            id: 'NQ-03', title: 'Quy định về vệ sinh chung', category: 'Vệ sinh',
            content: 'Tổ chức vệ sinh phòng ở hàng tuần. Rác thải phải được phân loại và để đúng nơi quy định trước 08h00 sáng.',
            icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Nội quy Ký túc xá</h1>
                <p className="text-slate-500 font-medium text-sm">Vui lòng đọc kỹ và tuân thủ các quy định dưới đây</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rules.map((rule) => {
                    const Icon = rule.icon;
                    return (
                        <div key={rule.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center mb-4">
                                <div className={`p-3 rounded-xl mr-4 ${rule.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{rule.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rule.category}</span>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{rule.content}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ViewRules;