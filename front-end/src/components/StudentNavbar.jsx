import React from 'react';
import { Menu, Bell, Settings } from 'lucide-react';

const StudentNavbar = ({ setSidebarOpen, isSidebarOpen }) => {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-10">
            <div className="flex items-center">
                {/* Nút toggle sidebar (Thường dùng cho màn hình nhỏ) */}
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-100"
                >
                    <Menu size={24} />
                </button>
                <h2 className="ml-4 text-lg font-bold text-slate-800 hidden sm:block tracking-tight">
                    Cổng thông tin Sinh viên
                </h2>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                        <Bell size={22} />
                        {/* Chấm đỏ thông báo */}
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Settings size={22} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center bg-slate-50 py-1.5 px-4 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="text-right mr-3 hidden sm:block">
                        <p className="text-sm font-black text-slate-900 leading-none">Nguyễn Văn An</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">MSV: 20110601</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-inner border border-blue-200">
                        AN
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;