import React from 'react';
import { Link } from 'react-router-dom'; 
import { Menu, Bell, Settings } from 'lucide-react';

const StudentNavbar = ({ isOpen, setIsOpen, user }) => {
    // Cập nhật để lấy đúng trường dữ liệu từ Backend (name và msv)
    const fullName = user?.name || "Khách";
    const studentId = user?.MaSV || "Chưa đăng nhập";

    const getInitials = () => {
        if (!user?.name) return "ST";
        const parts = user.name.trim().split(' ');
        // Lấy chữ cái đầu của 2 từ cuối hoặc 1 từ cuối tùy độ dài tên
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-10">
            <div className="flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)} // Bấm vào đây để đóng/mở Sidebar
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-100 transition-all active:scale-95"
                >
                    <Menu size={24} />
                </button>
                <h2 className="ml-4 text-lg font-bold text-slate-800 hidden sm:block">
                    Cổng thông tin Sinh viên
                </h2>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
                  <Link 
                    to="/student/profile" 
                    className="flex items-center bg-slate-50 py-1.5 px-4 rounded-2xl border border-slate-100 hover:bg-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
                >
                    <div className="text-right mr-3 hidden sm:block">
                        <p className="text-sm font-black text-slate-900 leading-none group-hover:text-[#00529C] transition-colors">
                            {fullName}
                        </p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">
                            MSV: {studentId}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-inner border border-blue-200 group-hover:scale-105 transition-transform">
                        {getInitials()}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default StudentNavbar;