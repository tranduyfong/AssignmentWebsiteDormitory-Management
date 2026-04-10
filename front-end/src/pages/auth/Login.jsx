import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errorMsg, setErrorMsg] = useState(''); // Thêm state để chứa thông báo lỗi
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // Xóa lỗi cũ khi bắt đầu request mới

        try {
            // Gọi API Đăng nhập tới Backend
            const response = await axiosClient.post('/auth/login', formData);

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Phân luồng: VaiTro 0 là Admin, 1 là Sinh viên
            if (response.user.role === 0) {
                navigate('/'); // Đẩy vào Dashboard Admin
            } else {
                navigate('/student/rooms'); // Đẩy vào Cổng Sinh viên
            }

        } catch (error) {
            // Lấy câu thông báo lỗi từ Backend trả về (nếu có), hoặc báo lỗi mạng
            setErrorMsg(error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-xl border border-white/20">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Truong_Dai_hoc_Mo_-_Dia_chat.jpg"
                            alt="HUMG Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    HUMG DORM
                </h2>
                <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Hệ thống quản lý Ký túc xá
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-[24px] sm:px-10 border border-slate-100">

                    {/* Hiển thị thông báo lỗi nếu đăng nhập thất bại */}
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center animate-in fade-in">
                            {errorMsg}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Tài khoản / Mã sinh viên
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Nhập tài khoản"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#00529C] focus:ring-[#00529C] border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-bold text-[#00529C] hover:text-blue-800 transition-colors">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#00529C] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529C] transition-all uppercase tracking-widest active:scale-95"
                            >
                                Đăng nhập <ArrowRight size={16} className="ml-2" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-400 font-medium">Bạn chưa có tài khoản?</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/register"
                                className="w-full flex justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all"
                            >
                                Đăng ký tài khoản mới
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;