import React from 'react';
import { Menu, Bell, Settings, User } from 'lucide-react';

const AdminNavbar = ({ setSidebarOpen, isSidebarOpen, user }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-100"
        >
          <Menu size={24} />
        </button>
        
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Bell size={22} /></button>
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Settings size={22} /></button>
        </div>
        <div className="flex items-center bg-slate-50 py-1.5 px-4 rounded-2xl border border-slate-100">
          <div className="text-right mr-4 hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">Admin</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">{user?.name || "Chưa có tên"}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;