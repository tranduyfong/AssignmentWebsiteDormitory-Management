import React, { useState } from 'react';
import { Search, Home, Users, Eye, X, Building2 } from 'lucide-react';

const RoomList = () => {
    const [rooms] = useState([
        { id: 'A1-101', area: 'Khu A', building: 'Tòa A1', type: 'Phòng 4 người', current: 3, max: 4, price: '750.000đ/tháng', members: ['Nguyễn Văn An', 'Trần Hữu Nam', 'Lê Bách'] },
        { id: 'A1-102', area: 'Khu A', building: 'Tòa A1', type: 'Phòng 4 người', current: 4, max: 4, price: '750.000đ/tháng', members: ['Bùi Dũng', 'Vũ Tuấn', 'Ngô Bảo', 'Phạm Long'] },
        { id: 'B3-205', area: 'Khu B', building: 'Tòa B3', type: 'Phòng 8 người', current: 5, max: 8, price: '450.000đ/tháng', members: ['Đặng Hà', 'Lý Linh', 'Trần Bình', 'Vũ Thảo', 'Hoàng Yến'] },
    ]);

    const [filterArea, setFilterArea] = useState('Tất cả');
    const [filterBuilding, setFilterBuilding] = useState('Tất cả');
    const [selectedRoom, setSelectedRoom] = useState(null);

    const filteredRooms = rooms.filter(r => {
        return (filterArea === 'Tất cả' || r.area === filterArea) &&
            (filterBuilding === 'Tất cả' || r.building === filterBuilding);
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Tra cứu phòng ở</h1>
                <p className="text-slate-500 font-medium text-sm">Xem thông tin và tình trạng chỗ trống các phòng</p>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <select
                    className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
                    value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
                >
                    <option value="Tất cả">Tất cả Khu</option>
                    <option value="Khu A">Khu A</option>
                    <option value="Khu B">Khu B</option>
                </select>
                <select
                    className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
                    value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)}
                >
                    <option value="Tất cả">Tất cả Tòa</option>
                    <option value="Tòa A1">Tòa A1</option>
                    <option value="Tòa B3">Tòa B3</option>
                </select>
            </div>

            {/* Danh sách phòng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Home size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Phòng {room.id}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{room.area} • {room.building}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${room.current === room.max ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                {room.current === room.max ? 'Đã đầy' : 'Còn chỗ'}
                            </span>
                        </div>

                        <div className="space-y-2 mb-5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-500">Người ở: {room.current}/{room.max}</span>
                                <span className="text-slate-600 font-bold">{room.type}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${room.current === room.max ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${(room.current / room.max) * 100}%` }}></div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedRoom(room)}
                            className="w-full py-2.5 flex items-center justify-center bg-slate-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold rounded-xl transition-all border border-blue-100 hover:border-transparent uppercase tracking-widest"
                        >
                            <Eye size={16} className="mr-2" /> Xem chi tiết
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal Chi tiết Phòng */}
            {selectedRoom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Chi tiết phòng</p>
                                <h3 className="font-black text-2xl flex items-center mt-1"><Building2 size={24} className="mr-2 opacity-80" /> {selectedRoom.id}</h3>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khu vực</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedRoom.area} - {selectedRoom.building}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại phòng</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedRoom.type}</p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-200/60">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đơn giá dự kiến</p>
                                    <p className="text-lg font-black text-blue-600">{selectedRoom.price}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                                    <Users size={16} className="mr-2 text-slate-400" /> Thành viên hiện tại ({selectedRoom.current}/{selectedRoom.max})
                                </h4>
                                <div className="space-y-2">
                                    {selectedRoom.members.map((member, idx) => (
                                        <div key={idx} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold mr-3">{idx + 1}</div>
                                            {member}
                                        </div>
                                    ))}
                                    {selectedRoom.current < selectedRoom.max && (
                                        <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-medium text-emerald-600 border-dashed text-center">
                                            Còn trống {selectedRoom.max - selectedRoom.current} giường
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