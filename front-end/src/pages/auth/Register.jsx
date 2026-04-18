import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ShieldCheck, Eye, EyeOff, Users, ChevronDown  } from 'lucide-react'; // Thêm Users icon
import axiosClient from '../../utils/axios.interceptor';
import { toast } from 'react-hot-toast'; 

const Register = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        msv: '',
        email: '',
        password: '',
        confirmPassword: '',
        gioiTinh: 1 // Mặc định là 1 (Nam)
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const payload = {
                msv: formData.msv,
                fullname: formData.fullname,
                email: formData.email,
                password: formData.password,
                gioiTinh: formData.gioiTinh // Gửi giới tính lên backend
            };

            await axiosClient.post('/auth/register', payload);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.', { duration: 8000 });
            navigate('/login');

        } catch (error) {
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
                    Cổng thông tin KTX
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-[24px] sm:px-10 border border-slate-100">

                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center animate-in fade-in">
                            {errorMsg}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleRegister}>
                        {/* Họ và Tên */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Họ và Tên
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text" required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Nhập đầy đủ họ tên"
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Row: Mã sinh viên & Giới tính */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    Mã sinh viên
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text" required
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800 uppercase"
                                        placeholder="MSV"
                                        value={formData.msv}
                                        onChange={(e) => setFormData({ ...formData, msv: e.target.value })}
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Giới tính</label>
                                <div className="relative">
                                    {/* Icon bên trái */}
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Users className="h-5 w-5 text-slate-400" />
                                    </div>
                                    
                                    <select
                                        className="block w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800 appearance-none cursor-pointer"
                                        value={formData.gioiTinh}
                                        onChange={(e) => setFormData({ ...formData, gioiTinh: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>Nam</option>
                                        <option value={0}>Nữ</option>
                                    </select>

                                    {/* Icon Mũi tên bên phải (Mới thêm) */}
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email" required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-[#00529C]/10 transition-all font-medium text-slate-800"
                                    placeholder="Nhập email sinh viên"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} required
                                    className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800"
                                    placeholder="Tạo mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00529C]"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"} required
                                    className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#00529C] transition-all font-medium text-slate-800"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00529C]"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#00529C] hover:bg-blue-800 transition-all uppercase tracking-widest active:scale-95"
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