import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import StudentSidebar from '../components/StudentSidebar';

const Layout = () => {
    const [isOpen, setIsOpen] = useState(true); // State điều khiển đóng mở
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar nhận isOpen để co giãn */}
            <StudentSidebar isOpen={isOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Navbar nhận setIsOpen để khi bấm nút Menu nó đảo ngược giá trị isOpen */}
                <StudentNavbar
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    user={currentUser}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8fafc]">
                    <Outlet context={{ user: currentUser }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;