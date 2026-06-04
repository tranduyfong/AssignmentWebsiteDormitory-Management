import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Home, Users, Eye, X, Building2, Loader2, Info, Lock, AlertCircle } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const RoomList = () => {
    const { user } = useOutletContext();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterArea, setFilterArea] = useState('Tất cả');
    const [filterBuilding, setFilterBuilding] = useState('Tất cả');
    const [selectedRoom, setSelectedRoom] = useState(null);

    // 1. Fetch dữ liệu từ API
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setIsLoading(true);
                const data = await axiosClient.get('/student/rooms');
                setRooms(data);
            } catch (error) {
                toast.error("Không thể tải danh sách phòng");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, []);

    // 2. Logic lọc động
    const filteredRooms = rooms.filter(r => {
        return (filterArea === 'Tất cả' || r.TenKhu === filterArea) &&
            (filterBuilding === 'Tất cả' || r.TenToaNha === filterBuilding);
    });

    // Lấy danh sách Khu và Tòa duy nhất để làm option cho Select
    const uniqueAreas = ['Tất cả', ...new Set(rooms.map(r => r.TenKhu))];
    const uniqueBuildings = ['Tất cả', ...new Set(rooms.filter(r => filterArea === 'Tất cả' || r.TenKhu === filterArea).map(r => r.TenToaNha))];

    // Logic kiểm tra sinh viên đã có phòng hay chưa
    const hasRoom = rooms.some(r => r.isMyRoom === true);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Tra cứu phòng ở</h1>
                <p className="text-slate-500 font-medium text-sm">Xem thông tin và tình trạng chỗ trống các phòng tại KTX</p>
            </div>
            {!hasRoom && (
                <div className="flex items-center justify-center p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in duration-500">
                    <span className="text-red-600 text-sm font-bold flex items-center gap-2">
                        <AlertCircle size={18} /> Sinh viên hiện chưa có phòng ở
                    </span>
                </div>
            )}
            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <select
                    className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
                    value={filterArea}
                    onChange={(e) => { setFilterArea(e.target.value); setFilterBuilding('Tất cả'); }}
                >
                    {uniqueAreas.map(a => (
                        <option key={a} value={a}>{a === 'Tất cả' ? 'Tất cả Khu' : a}</option>
                    ))}
                </select>
                <select
                    className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
                    value={filterBuilding}
                    onChange={(e) => setFilterBuilding(e.target.value)}
                >
                    {uniqueBuildings.map(b => (
                        <option key={b} value={b}>{b === 'Tất cả' ? 'Tất cả Tòa' : b}</option>
                    ))}
                </select>
            </div>

            {/* Danh sách phòng */}
            {isLoading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-slate-300" size={40} /></div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed">Không tìm thấy phòng phù hợp.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => {
                        const isMyRoom = room.MaPhong === user?.MaPhong;

                        return (
                            <div key={room.MaPhong} className={`bg-white rounded-[24px] border transition-all p-5 hover:shadow-md ${isMyRoom ? 'border-blue-500 ring-4 ring-blue-50 shadow-lg' : 'border-slate-200 opacity-90'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2.5 rounded-xl transition-colors ${isMyRoom
                                            ? (room.GioiTinh === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-rose-600 text-white shadow-lg shadow-rose-200')
                                            : (room.GioiTinh === 1 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600')
                                            }`}>
                                            <Home size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-none">
                                                P.{room.TenPhong} {isMyRoom && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-1 uppercase">Đang ở</span>}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">{room.TenKhu} • {room.TenToaNha}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${room.SoSinhVienHienTai >= room.SucChua ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                        {room.SoSinhVienHienTai >= room.SucChua ? 'Hết chỗ' : 'Còn chỗ'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500">Hiện có: {room.SoSinhVienHienTai}/{room.SucChua}</span>
                                        <span className="text-slate-500 uppercase text-[10px]">{room.LoaiPhong}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${isMyRoom ? 'bg-blue-500' : room.SoSinhVienHienTai >= room.SucChua ? 'bg-red-400' : 'bg-emerald-400'}`}
                                            style={{ width: `${(room.SoSinhVienHienTai / room.SucChua) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase">
                                        <Users size={13} className="mr-1" /> {room.GioiTinh === 1 ? 'Dành cho Nam' : 'Dành cho Nữ'}
                                    </div>
                                </div>

                                {/* 4. HIỂN THỊ NÚT DỰA TRÊN ĐIỀU KIỆN */}
                                {isMyRoom && (
                                    <button
                                        onClick={() => setSelectedRoom(room)}
                                        className="w-full py-2.5 flex items-center justify-center bg-[#00529C] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-200 uppercase tracking-widest active:scale-95 hover:bg-blue-800"
                                    >
                                        <Eye size={16} className="mr-2" /> Xem chi tiết phòng đang ở
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Chi tiết Phòng */}
            {selectedRoom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-[#00529C] text-white flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 italic">Thành viên phòng</p>
                                <h3 className="font-black text-2xl flex items-center mt-1 uppercase">Phòng {selectedRoom.TenPhong}</h3>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Vị trí</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedRoom.TenKhu} - {selectedRoom.TenToaNha}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Loại phòng</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedRoom.LoaiPhong}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 flex items-center">
                                    <Users size={16} className="mr-2 text-blue-600" /> Danh sách thành viên ({selectedRoom.SoSinhVienHienTai})
                                </h4>
                                <div className="space-y-2">
                                    {selectedRoom.DanhSachSV ? selectedRoom.DanhSachSV.split(', ').map((name, idx) => (
                                        <div key={idx} className={`px-4 py-3 border rounded-2xl text-sm font-bold flex items-center shadow-sm ${name === user?.name ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 text-slate-600'}`}>
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black mr-3 uppercase border ${name === user?.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-400 border-slate-100'}`}>
                                                {idx + 1}
                                            </div>
                                            {name} {name === user?.name && "(Bạn)"}
                                        </div>
                                    )) : (
                                        <div className="py-4 text-center text-slate-400 text-xs italic">Dữ liệu trống</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomList;