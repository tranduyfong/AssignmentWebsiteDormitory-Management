import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    // Hàm xử lý Đăng xuất
    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.clear(); // Xóa sạch dữ liệu (user, token...)
            navigate('/login'); // Chuyển về trang đăng nhập
        }
    };

    // Cấu trúc dữ liệu Menu để code sạch hơn
    const menuGroups = [
        {
            title: "Quản lý Lưu trú",
            items: [
                { icon: Home, label: "Xem thông tin phòng", to: "/student/rooms" },
                { icon: ClipboardEdit, label: "Đăng ký ở KTX", to: "/student/register-room" },
                { icon: FileSignature, label: "Xem hợp đồng", to: "/student/contracts" },
            ]
        },
        {
            title: "Tài chính",
            items: [
                { icon: Receipt, label: "Xem hóa đơn", to: "/student/invoices" },
                { icon: CreditCard, label: "Thanh toán hóa đơn", to: "/student/pay-invoice" },
            ]
        },
        {
            title: "Nội quy & Phản ánh",
            items: [
                { icon: BookOpen, label: "Xem nội quy", to: "/student/rules" },
                { icon: Gavel, label: "Xem vi phạm", to: "/student/violations" },
                { icon: MessageSquare, label: "Phản ánh", to: "/student/incidents" },
            ]
        }
    ];

    return (
        <aside className={`${isOpen ? 'w-72' : 'w-20'} bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 h-screen border-r border-slate-100 transition-all duration-300 flex-shrink-0`}>

            {/* HEADER - Logo & Title */}
            <div
                style={{ backgroundColor: humgBlue }}
                className={`p-5 flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} shadow-md h-24 flex-shrink-0 transition-all duration-300`}
            >
                <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-lg flex-shrink-0 overflow-hidden">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Truong_Dai_hoc_Mo_-_Dia_chat.jpg"
                        alt="HUMG"
                        className="w-full h-full object-contain"
                    />
                </div>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-white font-black text-lg uppercase whitespace-nowrap tracking-tight">CỔNG SINH VIÊN</span>
                        <span className="text-blue-100 text-[10px] font-medium opacity-80 whitespace-nowrap uppercase tracking-tighter">Hệ thống Quản lý KTX</span>
                    </div>
                )}
            </div>

            {/* NAVIGATION - Render từ mảng dữ liệu */}
            <nav className="flex-1 px-3 mt-6 overflow-y-auto space-y-6 sidebar-scroll">
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx}>
                        <div className={`px-3 mb-2 flex items-center ${!isOpen ? 'justify-center' : ''}`}>
                            {isOpen ? (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.title}</p>
                            ) : (
                                <div className="h-[1px] bg-slate-100 w-full"></div>
                            )}
                        </div>
                        {group.items.map((item, iIdx) => (
                            <SidebarItem
                                key={iIdx}
                                icon={item.icon}
                                label={item.label}
                                to={item.to}
                                collapsed={!isOpen}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            {/* FOOTER - Nút Đăng xuất */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center p-3 text-red-600 bg-red-50 hover:bg-red-100 
                        active:scale-[0.98] transition-all rounded-xl font-bold text-sm
                        ${!isOpen ? 'justify-center' : ''}
                    `}
                    title={!isOpen ? "Đăng xuất" : ""}
                >
                    <LogOut size={18} className={isOpen ? "mr-2" : ""} />
                    {isOpen && <span className="whitespace-nowrap">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;