import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8fafc] custom-scrollbar">
          {/* Các trang con sẽ hiển thị ở đây */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;