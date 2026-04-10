import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // 1. Import thêm useNavigate
import {
  Building2, Users, Home, FileCheck, CreditCard,
  AlertTriangle, MessageSquare, BarChart3, LogOut,
  FileText, ChevronRight, BookOpen, Receipt, FileSignature
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, collapsed,end = false }) => (
  <NavLink 
    to={to}
    end={end}
    className={({ isActive }) => `
      w-full flex items-center p-3 mb-1 transition-all duration-200 rounded-xl group
      ${isActive
        ? 'bg-blue-50 text-[#00529C] shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-[#00529C]'}
    `}
  >
    {({ isActive }) => (
      <>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {!collapsed && <span className="ml-3 font-semibold text-[13.5px] tracking-wide">{label}</span>}
        {!collapsed && (
          <ChevronRight size={14} className={`ml-auto transition-opacity ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`} />
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = ({ isOpen }) => {
  const humgBlue = "#00529C"; 

  return (
    <aside
      className={`${isOpen ? 'w-72' : 'w-20'} bg-white transition-all duration-300 flex flex-col shadow-xl z-20 h-screen border-r border-slate-100 flex-shrink-0`}
    >
      <div 
        style={{ backgroundColor: humgBlue }}
        className={`p-5 flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} shadow-md transition-all duration-300 h-24 flex-shrink-0`}
      >
        <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex-shrink-0 shadow-lg border border-white/20">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Truong_Dai_hoc_Mo_-_Dia_chat.jpg"
            alt="HUMG"
            className="w-full h-full object-contain rounded-sm"
          />
        </div>
        {isOpen && (
          <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
            <span className="text-white font-black text-lg leading-tight uppercase tracking-tight whitespace-nowrap">
              HUMG DORM
            </span>
            <span className="text-blue-100 text-[10px] font-medium uppercase tracking-[0.1em] opacity-80 whitespace-nowrap">
              Hệ thống quản lý
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 mt-6 overflow-y-auto sidebar-scroll space-y-1">
        
        <SidebarItem icon={FileText} label="Thống kê - Báo cáo" to="/admin" end={true} collapsed={!isOpen} />
        
        <div className="pt-2 pb-2 px-4">
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>
            Quản lý chung
          </p>
          {!isOpen && <div className="h-[1px] bg-slate-100 w-full"></div>}
        </div>

        <SidebarItem icon={Users} label="Quản lý Sinh viên" to="/admin/students" collapsed={!isOpen} />
        <SidebarItem icon={Building2} label="Quản lý Khu, Tòa nhà" to="/admin/infrastructure" collapsed={!isOpen} />
        <SidebarItem icon={Home} label="Quản lý Phòng ở" to="/admin/rooms" collapsed={!isOpen} />
        
        <div className="pt-4 pb-2 px-4">
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>
            Đăng ký & Hợp đồng
          </p>
          {!isOpen && <div className="h-[1px] bg-slate-100 w-full"></div>}
        </div>
        
        <SidebarItem icon={FileCheck} label="Xét duyệt & Phân phòng" to="/admin/registrations" collapsed={!isOpen} />
        <SidebarItem icon={FileSignature} label="Quản lý Hợp đồng" to="/admin/contracts" collapsed={!isOpen} />
        
        <div className="pt-4 pb-2 px-4">
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>
            Tài chính
          </p>
          {!isOpen && <div className="h-[1px] bg-slate-100 w-full"></div>}
        </div>

        <SidebarItem icon={CreditCard} label="Quản lý Thu phí" to="/admin/billing" collapsed={!isOpen} />
        <SidebarItem icon={Receipt} label="Quản lý Hóa đơn" to="/admin/invoices" collapsed={!isOpen} />
        
        <div className="pt-4 pb-2 px-4">
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isOpen && 'hidden'}`}>
            Nội quy & Sự cố
          </p>
          {!isOpen && <div className="h-[1px] bg-slate-100 w-full"></div>}
        </div>

        <SidebarItem icon={BookOpen} label="Quản lý Nội quy" to="/admin/rules" collapsed={!isOpen} />
        <SidebarItem icon={AlertTriangle} label="Quản lý Vi phạm" to="/admin/violations" collapsed={!isOpen} />
        <SidebarItem icon={MessageSquare} label="Phản ánh - Sự cố" to="/admin/incidents" collapsed={!isOpen} />

        <div className="h-10"></div>
      </nav>

      <div className="p-4 border-t border-slate-50 bg-slate-50/50">
        {/* 4. Gắn sự kiện onClick vào nút bấm */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl font-bold ${!isOpen && 'justify-center'}`}
          title={!isOpen ? "Đăng xuất" : ""}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {isOpen && <span className="ml-3 text-[13px] uppercase tracking-wider whitespace-nowrap">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;