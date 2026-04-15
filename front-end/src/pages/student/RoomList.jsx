import React, { useState, useEffect } from 'react';
import { Search, Home, Users, Eye, X, Building2, Loader2, Info } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const RoomList = () => {
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Tra cứu phòng ở</h1>
                <p className="text-slate-500 font-medium text-sm">Xem thông tin và tình trạng chỗ trống các phòng tại HUMG</p>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <select
                    className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
                    value={filterArea} 
                    onChange={(e) => {setFilterArea(e.target.value); setFilterBuilding('Tất cả');}}
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
                    {filteredRooms.map((room) => (
                        <div key={room.MaPhong} className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2.5 rounded-xl ${room.GioiTinh === 1 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <Home size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-none">P.{room.TenPhong}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{room.TenKhu} • {room.TenToaNha}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${room.SoSinhVienHienTai >= room.SucChua ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                    {room.SoSinhVienHienTai >= room.SucChua ? 'Hết chỗ' : 'Còn chỗ'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-5">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-500 uppercase">Hiện có: {room.SoSinhVienHienTai}/{room.SucChua} SV</span>
                                    <span className="text-slate-400 uppercase">{room.LoaiPhong}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${room.SoSinhVienHienTai >= room.SucChua ? 'bg-red-400' : 'bg-emerald-400'}`} 
                                        style={{ width: `${(room.SoSinhVienHienTai / room.SucChua) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase">
                                    <Users size={12} className="mr-1" /> {room.GioiTinh === 1 ? 'Dành cho Nam' : 'Dành cho Nữ'}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedRoom(room)}
                                className="w-full py-2.5 flex items-center justify-center bg-slate-50 hover:bg-[#00529C] hover:text-white text-[#00529C] text-xs font-bold rounded-xl transition-all border border-blue-100 hover:border-transparent uppercase tracking-widest active:scale-95"
                            >
                                <Eye size={16} className="mr-2" /> Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Chi tiết Phòng */}
            {selectedRoom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-[#00529C] text-white flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Thông tin chi tiết</p>
                                <h3 className="font-black text-2xl flex items-center mt-1 uppercase">P.{selectedRoom.TenPhong}</h3>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-6 font-medium">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vị trí</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedRoom.TenKhu} - {selectedRoom.TenToaNha}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại phòng</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedRoom.LoaiPhong}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                    <Users size={16} className="mr-2" /> Thành viên hiện tại ({selectedRoom.SoSinhVienHienTai}/{selectedRoom.SucChua})
                                </h4>
                                <div className="space-y-2">
                                    {selectedRoom.DanhSachSV ? selectedRoom.DanhSachSV.split(', ').map((name, idx) => (
                                         <div key={idx} className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 flex items-center shadow-sm">
                {/* Thay thế chữ cái đầu bằng Số thứ tự (idx + 1) */}
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black mr-3 uppercase border border-blue-100">
                    {idx + 1}
                </div>
                {name}
            </div>
                                    )) : (
                                        <div className="py-4 text-center text-slate-400 text-xs">Phòng hiện đang trống</div>
                                    )}
                                    
                                    {selectedRoom.SoSinhVienHienTai < selectedRoom.SucChua && (
                                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] font-bold text-emerald-600 flex items-center justify-center uppercase tracking-wider">
                                            <Info size={14} className="mr-2"/> Còn trống {selectedRoom.SucChua - selectedRoom.SoSinhVienHienTai} chỗ ở
                                        </div>
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