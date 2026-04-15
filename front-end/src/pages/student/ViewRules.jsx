import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertTriangle, Coffee, FileText } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const ViewRules = () => {
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRules = async () => {
        try {
            setIsLoading(true);
            const data = await axiosClient.get('/student/rules');
            setRules(data);
        } catch (error) {
            console.error("Lỗi lấy nội quy:", error);
            toast.error("Không thể tải danh sách nội quy");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const getThemeByCatalog = (danhMuc) => {
        switch (danhMuc) {
            case 'Giờ giấc':
            case 'An ninh':
                return { icon: Clock, color: 'text-blue-600 bg-blue-50' };
            case 'An toàn':
            case 'Điện nước':
                return { icon: AlertTriangle, color: 'text-red-600 bg-red-50' };
            case 'Vệ sinh':
                return { icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' };
            case 'Tiếp khách':
                return { icon: Coffee, color: 'text-amber-600 bg-amber-50' };
            default:
                return { icon: FileText, color: 'text-slate-600 bg-slate-50' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight font-sans">Nội quy Ký túc xá</h1>
                <p className="text-slate-500 font-medium text-sm">Vui lòng đọc kỹ và tuân thủ các quy định dưới đây</p>
            </div>

            {/* Loading & Empty State */}
            {isLoading ? (
                <div className="text-center py-20 text-slate-400">Đang tải nội quy...</div>
            ) : rules.length === 0 ? (
                <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-[24px]">
                    Hiện chưa có nội quy nào được đăng tải.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rules.map((rule) => {
                        const theme = getThemeByCatalog(rule.DanhMuc);
                        const Icon = theme.icon;

                        return (
                            <div key={rule.MaNoiQuy} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start mb-4">
                                    <div className={`p-3 rounded-xl mr-4 flex-shrink-0 ${theme.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{rule.TieuDe}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                                            {rule.DanhMuc}
                                        </span>
                                    </div>
                                </div>
                                {/* Nội dung chi tiết */}
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                                    {rule.NoiDung}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewRules;