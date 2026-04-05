import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';

const StudentLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
            <StudentSidebar isOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col h-full w-full">
                <StudentNavbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8fafc] custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;