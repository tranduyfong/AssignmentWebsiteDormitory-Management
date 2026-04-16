import React, { useState, useEffect } from 'react';
import { Send, Info, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';

const RoomRegistration = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Lấy thông tin user từ localStorage
    const [userInfo, setUserInfo] = useState({});

    const [formData, setFormData] = useState({
        hocKy: 'Kỳ I (2025-2026)',
        nguyenVongKhu: '',
        nguyenVongLoaiPhong: 'Phòng 4 người',
        ghiChu: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            // Gọi API gửi đơn đăng ký
            await axiosClient.post('/student/register-room', formData);
            setIsSubmitted(true);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Đã có lỗi xảy ra khi gửi đơn đăng ký!');
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500 pt-20">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Gửi đơn đăng ký thành công!</h2>
                <p className="text-slate-500 text-center max-w-md">
                    Đơn đăng ký nội trú của bạn đã được gửi tới Ban Quản Lý. Vui lòng theo dõi thông báo hoặc mục Hợp đồng để xem kết quả xét duyệt.
                </p>
                <button
                    onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ ...formData, ghiChu: '' }); // Reset form
                    }}
                    className="mt-8 px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                    Đăng ký đơn khác
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Đăng ký ở Ký túc xá</h1>
                <p className="text-slate-500 font-medium text-sm">Điền thông tin nguyện vọng để Ban quản lý xếp phòng</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3">
                <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                    Lưu ý: Sinh viên cần điền chính xác thông tin. Việc chọn Khu/Tòa nhà mang tính chất nguyện vọng, BQL sẽ sắp xếp dựa trên tình trạng phòng thực tế.
                </p>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">1. Thông tin cá nhân</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1.5">Họ và Tên</label>
                            <input type="text" disabled value={userInfo.name || ''} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1.5">Mã sinh viên</label>
                            <input type="text" disabled value={userInfo.MaSV || ''} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1.5">Học kỳ đăng ký</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                value={formData.hocKy}
                                onChange={(e) => setFormData({ ...formData, hocKy: e.target.value })}
                            >
                                <option value="Kỳ I (2025-2026)">Kỳ I (2025-2026)</option>
                                <option value="Kỳ II (2025-2026)">Kỳ II (2025-2026)</option>
                                <option value="Kỳ Hè (2025-2026)">Kỳ Hè (2025-2026)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">2. Nguyện vọng xếp phòng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1.5">Chọn Khu vực</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700"
                                value={formData.nguyenVongKhu}
                                onChange={(e) => setFormData({ ...formData, nguyenVongKhu: e.target.value })}
                                required
                            >
                                <option value="">-- Chọn khu --</option>
                                <option value="Khu A">Khu A</option>
                                <option value="Khu B">Khu B</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1.5">Loại phòng</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium text-slate-700"
                                value={formData.nguyenVongLoaiPhong}
                                onChange={(e) => setFormData({ ...formData, nguyenVongLoaiPhong: e.target.value })}
                            >
                                <option value="Phòng 4 người">Phòng 4 người (Tiêu chuẩn)</option>
                                <option value="Phòng 6 người">Phòng 6 người</option>
                                <option value="Phòng 8 người">Phòng 8 người</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1.5">Ghi chú thêm (Nếu có)</label>
                            <textarea
                                rows="3"
                                placeholder="Muốn ở cùng bạn (ghi rõ MSV), tình trạng sức khỏe..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                value={formData.ghiChu}
                                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="flex items-center px-8 py-3 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">
                        <Send size={18} className="mr-2" /> Gửi đơn đăng ký
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomRegistration;