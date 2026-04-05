import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home, FileSignature, CreditCard, ClipboardEdit,
    LogOut, ChevronRight, Receipt, BookOpen, Gavel, MessageSquare
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      w-full flex items-center p-3 mb-1 transition-all duration-200 rounded-xl group
      ${isActive
                ? 'bg-blue-50 text-[#00529C] shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#00529C] font-semibold'}
    `}
        title={collapsed ? label : ""}
    >
        {({ isActive }) => (
            <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3 text-[13.5px] whitespace-nowrap">{label}</span>}
                {!collapsed && (
                    <ChevronRight size={14} className={`ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
                )}
            </>
        )}
    </NavLink>
);

const StudentSidebar = ({ isOpen }) => {
    const humgBlue = "#00529C";

    return (
        <aside className={`${isOpen ? 'w-72' : 'w-20'} bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 h-screen border-r border-slate-100 transition-all duration-300 flex-shrink-0`}>
            {/* HEADER */}
            <div style={{ backgroundColor: humgBlue }} className={`p-5 flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} shadow-md h-24 flex-shrink-0 transition-all duration-300`}>
                <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-lg border border-white/20 flex-shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Truong_Dai_hoc_Mo_-_Dia_chat.jpg" alt="HUMG" className="w-full h-full object-contain" />
                </div>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                        <span className="text-white font-black text-lg leading-tight uppercase whitespace-nowrap">CỔNG SINH VIÊN</span>
                        <span className="text-blue-100 text-[10px] font-medium uppercase tracking-[0.1em] opacity-80 whitespace-nowrap">KTX Đại học Mỏ - Địa chất</span>
                    </div>
                )}
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-3 mt-6 overflow-y-auto space-y-1 sidebar-scroll">

                {/* Nhóm 1: Lưu trú */}
                <div className="pt-2 pb-2 px-3 text-center md:text-left">
                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>Quản lý Lưu trú</p>
                    {!isOpen && <div className="h-[1px] bg-slate-100 w-full mt-2"></div>}
                </div>
                <SidebarItem icon={Home} label="Xem thông tin phòng" to="/student/rooms" collapsed={!isOpen} />
                <SidebarItem icon={ClipboardEdit} label="Đăng ký ở KTX" to="/student/register-room" collapsed={!isOpen} />
                <SidebarItem icon={FileSignature} label="Xem hợp đồng" to="/student/contracts" collapsed={!isOpen} />

                {/* Nhóm 2: Tài chính */}
                <div className="pt-4 pb-2 px-3 text-center md:text-left">
                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>Tài chính</p>
                    {!isOpen && <div className="h-[1px] bg-slate-100 w-full mt-2"></div>}
                </div>
                <SidebarItem icon={Receipt} label="Xem hóa đơn" to="/student/invoices" collapsed={!isOpen} />
                <SidebarItem icon={CreditCard} label="Thanh toán hóa đơn" to="/student/pay-invoice" collapsed={!isOpen} />

                {/* Nhóm 3: Nội quy & Phản ánh */}
                <div className="pt-4 pb-2 px-3 text-center md:text-left">
                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>Nội quy & Phản ánh</p>
                    {!isOpen && <div className="h-[1px] bg-slate-100 w-full mt-2"></div>}
                </div>
                <SidebarItem icon={BookOpen} label="Xem nội quy" to="/student/rules" collapsed={!isOpen} />
                <SidebarItem icon={Gavel} label="Xem vi phạm" to="/student/violations" collapsed={!isOpen} />
                <SidebarItem icon={MessageSquare} label="Phản ánh" to="/student/incidents" collapsed={!isOpen} />

                <div className="h-10"></div>
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                <button className={`w-full flex items-center p-3 text-red-600 bg-red-50 hover:bg-red-100 transition-all rounded-xl font-bold text-sm ${!isOpen && 'justify-center'}`} title={!isOpen ? "Đăng xuất" : ""}>
                    <LogOut size={18} className={isOpen ? "mr-2 flex-shrink-0" : "flex-shrink-0"} />
                    {isOpen && <span className="whitespace-nowrap">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;