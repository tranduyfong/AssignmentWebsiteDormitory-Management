import React from 'react';
import { Menu, Bell, Settings } from 'lucide-react';

const StudentNavbar = ({ isOpen, setIsOpen, user }) => {
    const fullName = user?.fullName || "Khách";
    const studentId = user?.studentId || "Chưa đăng nhập";

    const getInitials = () => {
        if (!user?.fullName) return "ST";
        const parts = user.fullName.trim().split(' ');
        return parts[parts.length - 1].slice(0, 2).toUpperCase();
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
                <div className="flex items-center bg-slate-50 py-1.5 px-4 rounded-2xl border border-slate-100">
                    <div className="text-right mr-3 hidden sm:block">
                        <p className="text-sm font-black text-slate-900 leading-none">{fullName}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">MSV: {studentId}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-inner border border-blue-200">
                        {getInitials()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;