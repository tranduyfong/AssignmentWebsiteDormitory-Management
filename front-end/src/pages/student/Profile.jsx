import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, ShieldCheck, Lock, Eye, EyeOff, 
  Save, Calendar, School, Home, Loader2, KeyRound, Edit2, Undo2 ,Users
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); // Trạng thái khi đang gọi API lưu
    const [isEditing, setIsEditing] = useState(false); // Trạng thái bật/tắt form sửa
    
    // State cho đổi mật khẩu
    const [showPass, setShowPass] = useState({ old: false, new: false });
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // State cho cập nhật thông tin (Email, SĐT, CCCD)
    const [editFormData, setEditFormData] = useState({
        email: '',
        sdt: '',
        cccd: ''
    });

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await axiosClient.get('/student/profile');
            setProfile(data);
            // Đồng bộ dữ liệu vào form sửa
            setEditFormData({
                email: data.Email || '',
                sdt: data.SDT || '',
                cccd: data.CCCD || ''
            });
        } catch (error) {
            toast.error("Không thể tải thông tin cá nhân");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    // 1. Xử lý cập nhật thông tin cá nhân
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await axiosClient.put('/student/update-profile', editFormData);
            toast.success("Cập nhật thông tin thành công!");
            setIsEditing(false);
            fetchProfile(); // Load lại để hiển thị dữ liệu mới nhất
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
        } finally {
            setIsUpdating(false);
        }
    };

    // 2. Xử lý đổi mật khẩu
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("Mật khẩu xác nhận không khớp!");
        }
        if (passData.newPassword === passData.oldPassword) {
            return toast.error("Mật khẩu mới không được trùng mật khẩu cũ!");
        }

        try {
            await axiosClient.put('/student/change-password', {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            toast.success("Đổi mật khẩu thành công!");
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6  pb-10 font-sans">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Hồ sơ cá nhân</h1>
                    <p className="text-slate-500 font-medium text-sm">Quản lý thông tin hồ sơ và bảo mật tài khoản</p>
                </div>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#00529C] hover:bg-blue-50 transition-all shadow-sm"
                    >
                        <Edit2 size={14} className="mr-2" /> Chỉnh sửa hồ sơ
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        <Undo2 size={14} className="mr-2" /> Hủy bỏ
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CỘT TRÁI: TỔNG QUAN & ĐỔI MẬT KHẨU */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm text-center">
                        <div className="w-20 h-20 bg-blue-50 text-[#00529C] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 font-black text-2xl uppercase">
                            {profile?.HoTen?.split(' ').pop().charAt(0)}
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">{profile?.HoTen}</h2>
                        <p className="text-[#00529C] font-bold text-[11px] uppercase mt-1 tracking-widest">Mã SV: {profile?.MaSV}</p>
                    </div>

                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-slate-800">
                            <KeyRound size={18} className="text-[#00529C]" />
                            <h3 className="font-bold uppercase text-xs tracking-widest">Đổi mật khẩu</h3>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="relative">
                                <input 
                                    type={showPass.old ? "text" : "password"}
                                    placeholder="Mật khẩu hiện tại"
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                                    value={passData.oldPassword}
                                    onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                                    required
                                />
                                <button type="button" onClick={() => setShowPass({...showPass, old: !showPass.old})} className="absolute right-3 top-2.5 text-slate-400">
                                    {showPass.old ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            <div className="relative">
                                <input 
                                    type={showPass.new ? "text" : "password"}
                                    placeholder="Mật khẩu mới"
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                    required
                                />
                                <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-2.5 text-slate-400">
                                    {showPass.new ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            <input 
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                required
                            />
                            <button type="submit" className="w-full py-3 bg-[#00529C] text-white rounded-xl font-bold text-[12px] uppercase shadow-lg hover:bg-blue-800 transition-all active:scale-95">
                                Cập nhật mật khẩu
                            </button>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI: CHI TIẾT HỒ SƠ & FORM CẬP NHẬT */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-[#00529C] rounded-lg"><User size={20} /></div>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Thông tin chi tiết</h3>
                            </div>
                            {isEditing && <span className="text-[10px] font-bold text-amber-500 uppercase border border-amber-500 p-1 rounded-md tracking-widest">Đang chỉnh sửa...</span>}
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                {/* Các trường không thể sửa */}
                                <InfoItem label="Họ và Tên" value={profile?.HoTen} icon={User} isReadOnly />
                                <InfoItem label="Mã sinh viên" value={profile?.MaSV} icon={ShieldCheck} isReadOnly />
                                <InfoItem label="Giới tính" value={profile?.GioiTinh === 1 ? 'Nam' : 'Nữ'} icon={Users} />
                                <InfoItem label="Ngày sinh" value={profile?.NgaySinh ? new Date(profile.NgaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật'} icon={Calendar} isReadOnly />

                                {/* Các trường CÓ THỂ SỬA */}
                                <EditableItem 
                                    label="Địa chỉ Email" 
                                    value={profile?.Email} 
                                    icon={Mail} 
                                    isEditing={isEditing}
                                    inputValue={editFormData.email}
                                    onChange={(val) => setEditFormData({...editFormData, email: val})}
                                />
                                <EditableItem 
                                    label="Số điện thoại" 
                                    value={profile?.SDT || 'Chưa cập nhật'} 
                                    icon={Phone} 
                                    isEditing={isEditing}
                                    inputValue={editFormData.sdt}
                                    onChange={(val) => setEditFormData({...editFormData, sdt: val})}
                                />
                                <EditableItem 
                                    label="Số CCCD" 
                                    value={profile?.CCCD} 
                                    icon={ShieldCheck} 
                                    isEditing={isEditing}
                                    inputValue={editFormData.cccd}
                                    onChange={(val) => setEditFormData({...editFormData, cccd: val})}
                                />
                            </div>

                            {/* Nút lưu khi ở chế độ Edit */}
                            {isEditing && (
                                <div className="pt-4 animate-in slide-in-from-bottom-2 duration-300">
                                    <button 
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full md:w-auto flex items-center justify-center px-10 py-3 bg-[#00529C] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save className="mr-2" size={16}/>}
                                        Lưu thay đổi hồ sơ
                                    </button>
                                </div>
                            )}

                            {/* Thông tin phòng cư trú */}
                            <div className="mt-8 p-5 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-[#00529C]"><Home size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Phòng đang cư trú</p>
                                        <p className="text-base font-bold text-slate-800 uppercase">
                                            {profile?.TenPhong ? `Phòng ${profile.TenPhong} - ${profile.TenToaNha}` : 'Chưa xếp phòng'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${profile?.TenPhong ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {profile?.TenPhong ? 'Nội trú' : 'Chờ xếp'}
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component cho các trường chỉ xem
const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="space-y-1 ">
        <div className="flex items-center text-slate-400 gap-1.5">
            <Icon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 pl-5">{value || "---"}</p>
    </div>
);

// Component cho các trường có thể cập nhật
const EditableItem = ({ label, value, icon: Icon, isEditing, inputValue, onChange }) => (
    <div className="space-y-1.5">
        <div className="flex items-center text-slate-400 gap-1.5">
            <Icon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        {isEditing ? (
            <input 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 transition-all "
                value={inputValue}
                onChange={(e) => onChange(e.target.value)}
            />
        ) : (
            <p className="text-sm font-semibold text-slate-700 pl-5">{value || "---"}</p>
        )}
    </div>
);

export default Profile;