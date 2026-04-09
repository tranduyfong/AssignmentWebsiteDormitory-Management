import React, { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, Home, Users, 
  Filter, CheckCircle2, Hammer, Building2, 
  Layers, X, LayoutGrid
} from 'lucide-react';

const Rooms = () => {
  // 1. Dữ liệu mẫu (Gồm Khu, Tòa, Tầng, Phòng)
  const [rooms, setRooms] = useState([
    { id: '101', area: 'Khu A', building: 'Tòa A1', floor: 'Tầng 1', type: 'Phòng 4 người', current: 4, max: 4, status: 'Đã đầy' },
    { id: '102', area: 'Khu A', building: 'Tòa A1', floor: 'Tầng 1', type: 'Phòng 4 người', current: 2, max: 4, status: 'Còn chỗ' },
    { id: '201', area: 'Khu A', building: 'Tòa A1', floor: 'Tầng 2', type: 'Phòng 6 người', current: 0, max: 6, status: 'Trống' },
    { id: '105', area: 'Khu B', building: 'Tòa B3', floor: 'Tầng 1', type: 'Phòng 8 người', current: 7, max: 8, status: 'Còn chỗ' },
    { id: '302', area: 'Khu B', building: 'Tòa B3', floor: 'Tầng 3', type: 'Phòng 4 người', current: 0, max: 4, status: 'Bảo trì' },
    { id: '401', area: 'Khu A', building: 'Tòa A2', floor: 'Tầng 4', type: 'Phòng 6 người', current: 6, max: 6, status: 'Đã đầy' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('Tất cả');

  // 2. State cho Form (Bỏ trường Price)
  const [formData, setFormData] = useState({
    id: '', area: 'Khu A', building: 'Tòa A1', floor: 'Tầng 1', type: 'Phòng 4 người', current: 0, max: 4, status: 'Trống'
  });

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData(room);
    } else {
      setEditingRoom(null);
      setFormData({ id: '', area: 'Khu A', building: 'Tòa A1', floor: 'Tầng 1', type: 'Phòng 4 người', current: 0, max: 4, status: 'Trống' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id, building) => {
    if (window.confirm(`Xác nhận xóa phòng ${id} - ${building}?`)) {
      setRooms(rooms.filter(r => !(r.id === id && r.building === building)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      setRooms(rooms.map(r => (r.id === editingRoom.id && r.building === editingRoom.building) ? formData : r));
    } else {
      setRooms([...rooms, formData]);
    }
    setIsModalOpen(false);
  };

  // 3. Logic lọc
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = filterBuilding === 'Tất cả' || r.building === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">QUẢN LÝ PHÒNG Ở</h1>
          <p className="text-slate-500 font-medium text-sm italic">Quản lý danh sách Khu, Tòa nhà và tình trạng chỗ ở sinh viên</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Thêm phòng mới
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Tổng số phòng" value={rooms.length} icon={LayoutGrid} color="text-blue-600" bg="bg-blue-50" />
        <QuickStat label="Phòng đã đầy" value={rooms.filter(r => r.status === 'Đã đầy').length} icon={CheckCircle2} color="text-red-600" bg="bg-red-50" />
        <QuickStat label="Còn chỗ trống" value={rooms.filter(r => r.status === 'Còn chỗ' || r.status === 'Trống').length} icon={Users} color="text-emerald-600" bg="bg-emerald-50" />
        <QuickStat label="Đang bảo trì" value={rooms.filter(r => r.status === 'Bảo trì').length} icon={Hammer} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Thanh lọc & Tìm kiếm */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo số phòng..."
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-44 p-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="Tất cả">Tất cả Tòa nhà</option>
            <option value="Tòa A1">Tòa A1</option>
            <option value="Tòa A2">Tòa A2</option>
            <option value="Tòa B3">Tòa B3</option>
          </select>
        </div>
      </div>

      {/* Danh sách phòng Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredRooms.map((room, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-100">
                    <Home size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">Phòng {room.id}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{room.area} • {room.building}</p>
                  </div>
                </div>
                <StatusBadge status={room.status} />
              </div>

              {/* Sức chứa */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Hiện có: {room.current} SV</span>
                  <span className="text-slate-400">Tối đa: {room.max}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      room.status === 'Đã đầy' ? 'bg-red-400' : 
                      room.status === 'Bảo trì' ? 'bg-amber-400' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(room.current / room.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center text-[11px] text-slate-500 font-medium">
                  <Layers size={12} className="mr-1" /> {room.floor}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(room)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(room.id, room.building)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-widest">Cấu hình thông tin phòng</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Khu vực</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})}>
                    <option value="Khu A">Khu A</option>
                    <option value="Khu B">Khu B</option>
                    <option value="Khu C">Khu C</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Tòa nhà</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})}>
                    <option value="Tòa A1">Tòa A1</option>
                    <option value="Tòa A2">Tòa A2</option>
                    <option value="Tòa B3">Tòa B3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Tầng</label>
                  <input required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} placeholder="VD: Tầng 1" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Số phòng</label>
                  <input required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} placeholder="VD: 101" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Sức chứa tối đa</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.max} onChange={(e) => setFormData({...formData, max: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Trạng thái phòng</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Trống">Trống</option>
                    <option value="Còn chỗ">Còn chỗ</option>
                    <option value="Đã đầy">Đã đầy</option>
                    <option value="Bảo trì">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-medium hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Thống kê phụ
const QuickStat = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
    <div className={`p-2.5 rounded-xl ${bg} ${color}`}><Icon size={18} /></div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

// Badge Trạng thái
const StatusBadge = ({ status }) => {
  const styles = {
    'Đã đầy': 'bg-red-50 text-red-500 border-red-100',
    'Còn chỗ': 'bg-emerald-50 text-emerald-500 border-emerald-100',
    'Trống': 'bg-blue-50 text-blue-500 border-blue-100',
    'Bảo trì': 'bg-amber-50 text-amber-500 border-amber-100',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Rooms;