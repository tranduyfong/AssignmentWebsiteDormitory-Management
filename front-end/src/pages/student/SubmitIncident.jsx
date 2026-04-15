import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, CheckCircle2, Info, Loader2 } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const SubmitIncident = () => {
    // Lấy thông tin sinh viên từ Layout (đã làm ở các bước trước)
    const { user } = useOutletContext();
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        danhMuc: '',
        tieuDe: '',
        noiDung: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // URL có thể là '/student/incidents' hoặc '/incidents' tùy theo cách bạn khai báo route ở server.js
            await axiosClient.post('/student/incidents', formData);
            
            toast.success("Gửi phản ánh thành công!");
            setIsSubmitted(true);
        } catch (error) {
            console.error("Lỗi gửi phản ánh:", error);
            toast.error(error.response?.data?.message || "Không thể gửi phản ánh. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gửi phản ánh thành công!</h2>
                <p className="text-slate-500 text-center max-w-md font-medium">
                    Ban Quản Lý đã ghi nhận các phản ánh sự cố  <span className="text-blue-600 font-bold">{user?.TenPhong || "của bạn"}</span>. 
                    Chúng tôi sẽ kiểm tra và xử lý trong thời gian sớm nhất.
                </p>
                <button
                    onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ danhMuc: '', tieuDe: '', noiDung: '' });
                    }}
                    className="mt-8 px-8 py-3 bg-[#00529C] text-white font-bold rounded-xl hover:bg-blue-800 transition-all uppercase text-xs tracking-widest shadow-lg shadow-blue-200"
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
                <p className="text-slate-500 font-medium text-sm">Báo cáo hỏng hóc cơ sở vật chất hoặc vấn đề an ninh</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                    <Info size={18} className="text-amber-600" />
                </div>
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                    Mô tả sự cố chi tiết giúp BQL chuẩn bị vật tư sửa chữa nhanh hơn. 
                    Đối với các sự cố khẩn cấp (chập điện, rò rỉ nước lớn), vui lòng gọi ngay Hotline KTX.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm space-y-5">
               
                    
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Danh mục sự cố</label>
                        <select 
                            required 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#00529C] focus:ring-4 focus:ring-blue-50 outline-none font-semibold text-slate-700 transition-all"
                            value={formData.danhMuc}
                            onChange={(e) => setFormData({...formData, danhMuc: e.target.value})}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            <option value="Điện">Sự cố về Điện (đèn, quạt, ổ cắm...)</option>
                            <option value="Nước">Sự cố về Nước (vòi sen, bồn cầu...)</option>
                            <option value="Cơ sở vật chất">Cơ sở vật chất (giường, tủ, cửa...)</option>
                            <option value="An ninh">An ninh, trật tự KTX</option>
                            <option value="Khác">Vấn đề khác</option>
                        </select>
                    </div>
                

                <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Tiêu đề phản ánh</label>
                    <input 
                        type="text" 
                        required 
                        placeholder="VD: Hỏng vòi nước nhà tắm" 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#00529C] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold text-slate-800"
                        value={formData.tieuDe}
                        onChange={(e) => setFormData({...formData, tieuDe: e.target.value})}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Mô tả chi tiết</label>
                    <textarea 
                        required 
                        rows="5" 
                        placeholder="Vui lòng mô tả rõ tình trạng thiết bị hoặc vấn đề đang gặp phải..." 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#00529C] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
                        value={formData.noiDung}
                        onChange={(e) => setFormData({...formData, noiDung: e.target.value})}
                    ></textarea>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center px-10 py-3 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all uppercase tracking-widest text-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="mr-2 animate-spin" /> Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send size={18} className="mr-2" /> Gửi phản ánh
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitIncident;