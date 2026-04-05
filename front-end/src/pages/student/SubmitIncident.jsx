import React, { useState } from 'react';
import { Send, CheckCircle2, Info } from 'lucide-react';

const SubmitIncident = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gửi phản ánh thành công!</h2>
                <p className="text-slate-500 text-center max-w-md">
                    Ban Quản Lý đã ghi nhận sự cố của phòng bạn và sẽ cử nhân sự xuống kiểm tra/xử lý trong thời gian sớm nhất.
                </p>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-8 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
                >
                    Gửi phản ánh khác
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Gửi phản ánh sự cố</h1>
                <p className="text-slate-500 font-medium text-sm">Báo cáo các sự cố hỏng hóc hoặc vấn đề an ninh tại phòng ở</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
                <Info size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                    Mô tả sự cố càng chi tiết càng giúp BQL chuẩn bị vật tư sửa chữa nhanh chóng hơn. Với các sự cố khẩn cấp (chập cháy, đánh nhau), vui lòng gọi trực tiếp Hotline KTX.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1">Phòng báo cáo</label>
                        <input type="text" disabled value="A1-101" className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1">Danh mục sự cố</label>
                        <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700">
                            <option value="">-- Chọn danh mục --</option>
                            <option value="Điện">Sự cố về Điện (bóng đèn, ổ cắm...)</option>
                            <option value="Nước">Sự cố về Nước (rò rỉ, tắc bồn cầu...)</option>
                            <option value="Cơ sở vật chất">Cơ sở vật chất (giường, tủ, cửa...)</option>
                            <option value="An ninh">An ninh, trật tự</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1">Tiêu đề phản ánh</label>
                    <input type="text" required placeholder="VD: Hỏng bóng đèn tuýp nhà tắm" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium" />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1">Mô tả chi tiết</label>
                    <textarea required rows="4" placeholder="Mô tả rõ tình trạng thiết bị hoặc sự việc xảy ra..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"></textarea>
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">
                        <Send size={18} className="mr-2" /> Gửi báo cáo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitIncident;