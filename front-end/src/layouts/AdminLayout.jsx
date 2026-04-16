import React, { useState, useEffect  } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/AdminSidebar';
import Navbar from '../components/AdminNavbar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      navigate('/login');
    } else {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 0) {
        navigate('/login');
      } else {
        setUser(userData);
      }
    }
  }, [navigate]);

  if (!user) return <div className="h-screen bg-[#f8fafc]"></div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} user={user}  />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8fafc] custom-scrollbar">
           <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;