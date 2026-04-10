import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ShieldCheck } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';

const Register = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        msv: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errorMsg, setErrorMsg] = useState(''); // State lưu thông báo lỗi
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // Xóa lỗi cũ

        // Kiểm tra mật khẩu xác nhận
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            // Chuẩn bị payload gửi lên Backend
            const payload = {
                msv: formData.msv,
                fullname: formData.fullname,
                email: formData.email,
                password: formData.password
            };

            // Gọi API Đăng ký
            await axiosClient.post('/auth/register', payload);

            // Thông báo thành công và chuyển hướng
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');

        } catch (error) {
            // Bắt lỗi từ Backend (VD: Trùng MSV)
            setErrorMsg(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Tạo tài khoản mới
                </h2>
                <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Cổng thông tin KTX HUMG
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-[24px] sm:px-10 border border-slate-100">

                    {/* Hiển thị thông báo lỗi nếu có */}
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center animate-in fade-in">
                            {errorMsg}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Họ và Tên
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Nhập đầy đủ họ tên"
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Mã sinh viên
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800 uppercase"
                                    placeholder="Nhập mã sinh viên"
                                    value={formData.msv}
                                    onChange={(e) => setFormData({ ...formData, msv: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    {/* Đổi icon thành Mail cho đúng ngữ cảnh */}
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Nhập email sinh viên"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Tạo mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#00529C] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] transition-all uppercase tracking-widest active:scale-95"
                            >
                                Đăng ký ngay
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-slate-500 font-medium">Đã có tài khoản? </span>
                        <Link to="/login" className="text-sm font-bold text-[#00529C] hover:text-blue-800 transition-colors">
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;