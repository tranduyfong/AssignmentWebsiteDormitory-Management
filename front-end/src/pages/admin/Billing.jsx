import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';
import StudentFeesTab from './StudentFeesTab';
import RoomUtilityFeesTab from './RoomUtilityFeesTab';

const Billing = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [studentFees, setStudentFees] = useState([]);
    const [roomUtilityFees, setRoomUtilityFees] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [invoices, utilities, roomsData] = await Promise.all([
                axiosClient.get('/admin/invoices'),
                axiosClient.get('/admin/utilities'),
                axiosClient.get('/admin/rooms')
            ]);
            setStudentFees(invoices.filter(i => i.LoaiHoaDon === 'Tiền phòng'));
            setRoomUtilityFees(utilities);
            setRooms(roomsData);
        } catch (error) {
            toast.error("Không thể tải dữ liệu tài chính");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
            {/* Header chung */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-800 uppercase tracking-tighter">Quản lý thu phí</h1>
                <p className="text-slate-500 font-medium text-sm tracking-tight">Quản lý các khoản phí tiền phòng, tiền điện, tiền nước</p>
            </div>

            {/* Switcher Tabs */}
            <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200">
                <button 
                    onClick={() => setActiveTab('student')} 
                    className={`px-8 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'student' ? 'bg-white text-[#00529C] shadow-sm border border-slate-100' : 'text-slate-500'}`}
                >
                    TIỀN PHÒNG
                </button>
                <button 
                    onClick={() => setActiveTab('room')} 
                    className={`px-8 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'room' ? 'bg-white text-[#00529C] shadow-sm border border-slate-100' : 'text-slate-500'}`}
                >
                    ĐIỆN NƯỚC
                </button>
            </div>

            {/* Hiển thị nội dung dựa trên Tab */}
            {activeTab === 'student' ? (
                <StudentFeesTab 
                    data={studentFees} 
                    rooms={rooms} 
                    isLoading={isLoading} 
                    refresh={fetchData} 
                />
            ) : (
                <RoomUtilityFeesTab 
                    data={roomUtilityFees} 
                    rooms={rooms} 
                    isLoading={isLoading} 
                    refresh={fetchData} 
                />
            )}
        </div>
    );
};

export default Billing;