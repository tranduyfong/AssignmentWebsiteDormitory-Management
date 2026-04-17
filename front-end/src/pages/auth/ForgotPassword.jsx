import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, Lock, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Nhập Email, 2: Nhập OTP, 3: Đổi mật khẩu

    // State lưu trữ dữ liệu các bước
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // BƯỚC 1: Gửi yêu cầu lấy OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Vui lòng nhập email');

        try {
            setIsLoading(true);
            await axiosClient.post('/auth/forgot-password', { email });
            toast.success('Đã gửi mã xác nhận đến Email của bạn!');
            setStep(2); // Chuyển sang bước nhập mã
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể gửi mã xác nhận');
        } finally {
            setIsLoading(false);
        }
    };

    // BƯỚC 2: Xác nhận bấm nút chuyển sang bước 3
    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Mã xác nhận phải gồm 6 chữ số');
        setStep(3); // Tạm thời chuyển sang bước 3, việc check OTP đúng/sai sẽ gộp chung vào lúc Submit mật khẩu
    };

    // BƯỚC 3: Đổi mật khẩu mới
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('Mật khẩu xác nhận không khớp!');
        }

        try {
            setIsLoading(true);
            await axiosClient.post('/auth/reset-password', {
                email,
                otp,
                newPassword: passwords.newPassword
            });

            toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { duration: 5000 });
            navigate('/login');
        } catch (error) {
            // Nếu lỗi ở đây thì có thể là do OTP sai hoặc hết hạn
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
            if (error.response?.status === 400) {
                setStep(2); // Đẩy lùi về bước 2 bắt nhập lại mã
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Khôi phục mật khẩu
                </h2>
                <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Hệ thống Ký túc xá HUMG
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-[24px] sm:px-10 border border-slate-100">

                    {/* BƯỚC 1: NHẬP EMAIL */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-slate-600 font-medium text-center mb-6">
                                Vui lòng nhập địa chỉ Email bạn đã dùng để đăng ký tài khoản. Chúng tôi sẽ gửi một mã số xác nhận gồm 6 chữ số.
                            </p>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    Địa chỉ Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email" required
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800"
                                        placeholder="Nhập email của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button disabled={isLoading} type="submit" className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-[#00529C] hover:bg-blue-800 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50">
                                {isLoading ? 'Đang gửi mã...' : 'Nhận mã xác nhận'} <ArrowRight size={16} className="ml-2" />
                            </button>
                        </form>
                    )}

                    {/* BƯỚC 2: NHẬP MÃ OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="w-16 h-16 bg-blue-50 text-[#00529C] rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-sm">
                                <ShieldCheck size={32} />
                            </div>
                            <p className="text-sm text-slate-600 font-medium text-center mb-6">
                                Mã xác nhận đã được gửi đến <br /><strong className="text-slate-800">{email}</strong>
                            </p>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
                                    Nhập mã 6 chữ số
                                </label>
                                <input
                                    type="text" required maxLength="6"
                                    className="block w-full text-center tracking-[1em] text-2xl py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#00529C] transition-all font-black text-[#00529C]"
                                    placeholder="------"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
                                />
                            </div>
                            <button type="submit" className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-[#00529C] hover:bg-blue-800 transition-all uppercase tracking-widest active:scale-95">
                                Tiếp tục
                            </button>
                            <p className="text-center text-xs text-slate-500 font-medium mt-4">
                                Chưa nhận được mã? <button type="button" onClick={handleRequestOTP} className="text-[#00529C] font-bold hover:underline">Gửi lại</button>
                            </p>
                        </form>
                    )}

                    {/* BƯỚC 3: ĐẶT MẬT KHẨU MỚI */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-slate-600 font-medium text-center mb-6">
                                Mã xác nhận hợp lệ. Vui lòng tạo mật khẩu mới cho tài khoản của bạn.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Mật khẩu mới</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                        <input
                                            type={showPassword ? "text" : "password"} required
                                            className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800"
                                            placeholder="Nhập mật khẩu mới"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00529C]">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><CheckCircle2 className="h-5 w-5 text-slate-400" /></div>
                                        <input
                                            type={showPassword ? "text" : "password"} required
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800"
                                            placeholder="Nhập lại mật khẩu"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button disabled={isLoading} type="submit" className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50">
                                {isLoading ? 'Đang lưu...' : 'Xác nhận đổi mật khẩu'}
                            </button>
                        </form>
                    )}

                    {/* NÚT QUAY LẠI ĐĂNG NHẬP */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <Link to="/login" className="w-full flex justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;