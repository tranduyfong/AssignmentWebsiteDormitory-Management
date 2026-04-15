import React, { useState, useEffect } from 'react';
import { Gavel, CheckCircle2, Loader2 } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const MyViolations = () => {
    const [violations, setViolations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Gọi API lấy danh sách vi phạm của cá nhân
    const fetchMyViolations = async () => {
        try {
            setIsLoading(true);
            // Endpoint khớp với router.get('/my-violations', ...)
            const data = await axiosClient.get('/student/my-violations');
            setViolations(data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu vi phạm:", error);
            toast.error("Không thể tải lịch sử vi phạm");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyViolations();
    }, []);

    // 2. Trạng thái đang tải dữ liệu
    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#00529C] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang trích xuất hồ sơ kỷ luật...</p>
            </div>
        );
    }

    // 3. Trạng thái hồ sơ trong sạch (Không có vi phạm)
    if (violations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in-95 duration-700">
                <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mb-6 border-8 border-emerald-100/50 shadow-inner">
                    <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 uppercase tracking-tight">Hồ sơ trong sạch</h2>
                <p className="text-slate-500 text-sm max-w-md text-center leading-relaxed font-medium">
                    Bạn không có bản ghi vi phạm nội quy nào. 
                    Hãy tiếp tục duy trì việc chấp hành quy định của KTX nhé!
                </p>
            </div>
        );
    }

    // 4. Hiển thị danh sách vi phạm thực tế từ Database
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Lịch sử vi phạm</h1>
                <p className="text-slate-500 font-medium text-sm ">Ghi nhận các lỗi vi phạm nội quy KTX của cá nhân</p>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-5">Ngày vi phạm</th>
                                <th className="px-6 py-5">Loại vi phạm</th>
                                <th className="px-6 py-5">Mô tả chi tiết</th>
                                <th className="px-6 py-5 text-center">Hình thức kỷ luật</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {violations.map((v) => (
                                <tr key={v.MaViPham} className="hover:bg-red-50/30 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className=" text-slate-600 font-medium">
                                            {new Date(v.NgayViPham).toLocaleDateString('vi-VN')}
                                        </div>
                                        
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className=" text-red-600 font-bold">
                                            {v.LoaiViPham}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 leading-relaxed text-slate-400 max-w-xs">
                                        {v.NoiDung}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className="flex items-center font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 w-fit">
                                                <Gavel size={14} className="mr-1.5" /> 
                                                {v.HinhThucXuLy}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default MyViolations;