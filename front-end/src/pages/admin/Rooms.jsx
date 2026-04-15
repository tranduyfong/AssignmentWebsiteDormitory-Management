import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Home, Users,
  CheckCircle2, Hammer, Building2,
  User, X, LayoutGrid, Loader2, AlertTriangle
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('Tất cả');

  const [formData, setFormData] = useState({
    MaPhong: '',
    MaToaNha: '',
    TenPhong: '',
    LoaiPhong: 'Phòng 4 người',
    SucChua: 4,
    GioiTinh: 1 
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [roomsData, buildingsData] = await Promise.all([
        axiosClient.get('/admin/rooms'),
        axiosClient.get('/admin/buildings')
      ]);
      setRooms(roomsData);
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu từ máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleMaintenance = async (room) => {
    const isMaintenance = room.TrangThai === 'Bảo trì';
    const nextStatus = isMaintenance ? 'Trống' : 'Bảo trì';

    // 1. Nếu muốn bật bảo trì mà phòng đang có người -> Chặn
    if (!isMaintenance && room.SoSinhVienHienTai > 0) {
      toast.error(`Không thể bảo trì! Phòng ${room.TenPhong} đang có ${room.SoSinhVienHienTai} sinh viên ở.`);
      return;
    }

    // 2. Xác nhận thao tác
    const confirmMsg = isMaintenance 
        ? `Kết thúc bảo trì và mở lại phòng ${room.TenPhong}?` 
        : `Xác nhận khóa phòng ${room.TenPhong} để bảo trì?`;

    if (window.confirm(confirmMsg)) {
      try {
        await axiosClient.put(`/admin/rooms/${room.MaPhong}/status`, { 
          trangThai: nextStatus 
        });
        toast.success(`Phòng ${room.TenPhong}: ${nextStatus}`);
        fetchData();
      } catch (error) {
        toast.error("Lỗi khi cập nhật trạng thái");
      }
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        MaPhong: room.MaPhong,
        MaToaNha: room.MaToaNha,
        TenPhong: room.TenPhong,
        LoaiPhong: room.LoaiPhong,
        SucChua: room.SucChua,
        GioiTinh: room.GioiTinh
      });
    } else {
      setEditingRoom(null);
      setFormData({
        MaPhong: '',
        MaToaNha: buildings.length > 0 ? buildings[0].MaToaNha : '',
        TenPhong: '',
        LoaiPhong: 'Phòng 4 người',
        SucChua: 4,
        GioiTinh: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        maToaNha: formData.MaToaNha,
        tenPhong: formData.TenPhong,
        loaiPhong: formData.LoaiPhong,
        sucChua: formData.SucChua,
        gioiTinh: formData.GioiTinh,
        tang: 1, 
        trangThai: editingRoom ? editingRoom.TrangThai : 'Trống'
      };

      if (editingRoom) {
        await axiosClient.put(`/admin/rooms/${editingRoom.MaPhong}`, payload);
        toast.success('Cập nhật phòng thành công!');
      } else {
        await axiosClient.post('/admin/rooms', payload);
        toast.success('Thêm phòng mới thành công!');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id, tenPhong) => {
    if (window.confirm(`Xác nhận xóa phòng ${tenPhong}?`)) {
      try {
        await axiosClient.delete(`/admin/rooms/${id}`);
        setRooms(rooms.filter(r => r.MaPhong !== id));
        toast.success('Đã xóa phòng!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa');
      }
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.TenPhong?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = filterBuilding === 'Tất cả' || r.TenToaNha === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  const isRoomOccupied = editingRoom && editingRoom.SoSinhVienHienTai > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý Phòng ở</h1>
          <p className="text-slate-500 font-medium text-sm italic italic">Quản lý sơ đồ phòng và đối tượng cư trú</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-md hover:bg-blue-800 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Thêm phòng mới
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Tổng số phòng" value={rooms.length} icon={LayoutGrid} color="text-blue-600" bg="bg-blue-50" />
        <QuickStat label="Phòng đã đầy" value={rooms.filter(r => r.TrangThai === 'Đã đầy').length} icon={CheckCircle2} color="text-red-600" bg="bg-red-50" />
        <QuickStat label="Còn chỗ trống" value={rooms.filter(r => r.TrangThai === 'Còn chỗ' || r.TrangThai === 'Trống').length} icon={Users} color="text-emerald-600" bg="bg-emerald-50" />
        <QuickStat label="Bảo trì" value={rooms.filter(r => r.TrangThai === 'Bảo trì').length} icon={Hammer} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full font-medium">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo số phòng..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00529C] outline-none transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto font-semibold text-slate-600">
          <select
            className="flex-1 md:w-44 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="Tất cả">Tất cả Tòa nhà</option>
            {buildings.map(b => (
              <option key={b.MaToaNha} value={b.TenToaNha}>{b.TenToaNha}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-slate-300" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRooms.map((room) => {
            const isMaintenance = room.TrangThai === 'Bảo trì';
            return (
              <div key={room.MaPhong} className={`bg-white rounded-2xl border transition-all group overflow-hidden ${isMaintenance ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${isMaintenance ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                        {isMaintenance ? <Hammer size={20} /> : <Home size={20} />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${isMaintenance ? 'text-amber-800' : 'text-slate-800'}`}>P.{room.TenPhong}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{room.TenKhu} • {room.TenToaNha}</p>
                      </div>
                    </div>
                    <StatusBadge status={room.TrangThai} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Hiện có: {room.SoSinhVienHienTai} SV</span>
                      <span className="text-slate-400">Tối đa: {room.SucChua}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${isMaintenance ? 'bg-amber-400' : room.TrangThai === 'Đã đầy' ? 'bg-red-400' : 'bg-[#00529C]'}`}
                        style={{ width: `${(room.SoSinhVienHienTai / room.SucChua) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center text-[11px] font-bold uppercase">
                      <User size={12} className={`mr-1 ${room.GioiTinh === 1 ? 'text-blue-500' : 'text-rose-500'}`} />
                      <span className={room.GioiTinh === 1 ? 'text-blue-600' : 'text-rose-600'}>
                        {room.GioiTinh === 1 ? 'Nam' : 'Nữ'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {/* NÚT BẢO TRÌ NHANH */}
                      <button 
                        onClick={() => handleToggleMaintenance(room)} 
                        title={isMaintenance ? "Kết thúc bảo trì" : "Bắt đầu bảo trì"}
                        className={`p-1.5 rounded-lg transition-all border ${isMaintenance ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                      >
                        <Hammer size={16} />
                      </button>

                      <button onClick={() => handleOpenModal(room)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-all"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(room.MaPhong, room.TenPhong)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal giữ nguyên như yêu cầu trước của bạn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200 font-sans">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
                {editingRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-sm font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tòa nhà</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  value={formData.MaToaNha}
                  onChange={(e) => setFormData({ ...formData, MaToaNha: parseInt(e.target.value) })}
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map(b => (
                    <option key={b.MaToaNha} value={b.MaToaNha}>{b.TenToaNha} ({b.TenKhu})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số phòng</label>
                <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={formData.TenPhong} onChange={(e) => setFormData({ ...formData, TenPhong: e.target.value })} placeholder="VD: 101" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Giới tính phòng</label>
                <select
                disabled={isRoomOccupied}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 ${isRoomOccupied ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50'}`}
                  value={formData.GioiTinh}
                  onChange={(e) => setFormData({ ...formData, GioiTinh: parseInt(e.target.value) })}
                >
                  <option value={1}>Dành cho Nam</option>
                  <option value={0}>Dành cho Nữ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Loại phòng</label>
                    <select 
                    
                    disabled={isRoomOccupied}
                      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 ${isRoomOccupied ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50'}`}
                    value={formData.LoaiPhong} onChange={(e) => setFormData({ ...formData, LoaiPhong: e.target.value })}>
                        <option value="Phòng 4 người">4 Người</option>
                        <option value="Phòng 6 người">6 Người</option>
                        <option value="Phòng 8 người">8 Người</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sức chứa</label>
                    <input type="number" disabled={isRoomOccupied}
                      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 ${isRoomOccupied ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50'}`} value={formData.SucChua} onChange={(e) => setFormData({ ...formData, SucChua: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase text-[10px]">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-[#00529C] text-white rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickStat = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 transition-all">
    <div className={`p-2.5 rounded-xl ${bg} ${color}`}><Icon size={18} /></div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Đã đầy': 'bg-red-50 text-red-500 border-red-100',
    'Còn chỗ': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Trống': 'bg-blue-50 text-[#00529C] border-blue-100',
    'Bảo trì': 'bg-amber-50 text-amber-500 border-amber-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Rooms;