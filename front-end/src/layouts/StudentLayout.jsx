import React, { useState, useEffect } from 'react';
import { Outlet,useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import StudentSidebar from '../components/StudentSidebar';

const Layout = () => {
    const [isOpen, setIsOpen] = useState(true); 
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login', { replace: true });
        } else {
            setCurrentUser(JSON.parse(savedUser));
        }
    }, [navigate]);
    if (!currentUser) return <div className="h-screen bg-slate-50"></div>;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <StudentSidebar isOpen={isOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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