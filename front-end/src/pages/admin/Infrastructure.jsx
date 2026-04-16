import React, { useState, useEffect } from 'react';
import { 
  Plus, Building2, Edit, Trash2, Layout, 
  PlusCircle, X, Loader2, Home, Users, CheckCircle2 
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const Infrastructure = () => {
  const [zones, setZones] = useState([]); 
  const [buildings, setBuildings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [activeAreaId, setActiveAreaId] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('area'); 
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  // --- PHẦN MỚI THÊM: QUẢN LÝ MODAL DANH SÁCH PHÒNG ---
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomList, setRoomList] = useState([]);
  const [viewingBuildingName, setViewingBuildingName] = useState('');
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [zonesData, buildingsData] = await Promise.all([
        axiosClient.get('/admin/zones'),
        axiosClient.get('/admin/buildings')
      ]);
      setZones(zonesData);
      setBuildings(buildingsData);
      if (zonesData.length > 0 && !activeAreaId) setActiveAreaId(zonesData[0].MaKhu);
    } catch (error) {
      toast.error("Không thể tải dữ liệu hạ tầng");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HÀM XỬ LÝ XEM DANH SÁCH PHÒNG ---
  const handleViewRooms = async (building) => {
    setViewingBuildingName(building.TenToaNha);
    setShowRoomModal(true);
    setIsRoomsLoading(true);
    try {
      // Gọi API lấy toàn bộ phòng
      const allRooms = await axiosClient.get('/admin/rooms');
      // Lọc ra các phòng thuộc tòa nhà này
      const filtered = allRooms.filter(r => r.MaToaNha === building.MaToaNha);
      setRoomList(filtered);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách phòng");
    } finally {
      setIsRoomsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'area') {
        if (editingItem) {
          await axiosClient.put(`/admin/zones/${editingItem.MaKhu}`, { tenKhu: formData.name });
          toast.success("Đã cập nhật tên Khu");
        } else {
          await axiosClient.post('/admin/zones', { tenKhu: formData.name });
          toast.success("Thêm Khu mới thành công");
        }
      } else {
        if (editingItem) {
          await axiosClient.put(`/admin/buildings/${editingItem.MaToaNha}`, { maKhu: activeAreaId, tenToaNha: formData.name });
          toast.success("Đã cập nhật Tòa nhà");
        } else {
          await axiosClient.post('/admin/buildings', { maKhu: activeAreaId, tenToaNha: formData.name });
          toast.success("Thêm Tòa nhà thành công");
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Lỗi khi lưu dữ liệu"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Xác nhận xóa?`)) return;
    try {
      if (type === 'area') await axiosClient.delete(`/admin/zones/${id}`);
      else await axiosClient.delete(`/admin/buildings/${id}`);
      toast.success("Đã xóa thành công");
      fetchData();
    } catch (error) { toast.error("Không thể xóa (có ràng buộc dữ liệu)"); }
  };

  const filteredBuildings = buildings.filter(b => b.MaKhu === activeAreaId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase tracking-tighter">Quản lý Khu, Tòa nhà</h1>
          <p className="text-slate-500 font-medium text-sm">Thiết lập danh mục hạ tầng hệ thống ký túc xá</p>
        </div>
        <button onClick={() => { setModalType('area'); setEditingItem(null); setFormData({name:''}); setIsModalOpen(true); }} className="flex items-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition-all active:scale-95 text-sm">
          <Plus size={18} className="mr-2" /> Thêm Khu mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: ZONES */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Danh mục Khu vực</h3>
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.MaKhu} onClick={() => setActiveAreaId(zone.MaKhu)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${activeAreaId === zone.MaKhu ? 'border-blue-500 bg-blue-50/50' : 'border-white bg-white hover:border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeAreaId === zone.MaKhu ? 'bg-[#00529C] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Layout size={20} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${activeAreaId === zone.MaKhu ? 'text-blue-700' : 'text-slate-700'}`}>{zone.TenKhu}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{buildings.filter(b => b.MaKhu === zone.MaKhu).length} Tòa nhà</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setModalType('area'); setEditingItem(zone); setFormData({name: zone.TenKhu}); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('area', zone.MaKhu); }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: BUILDINGS */}
        <div className="lg:col-span-8 space-y-4 font-sans">
          <div className="flex justify-between items-center ml-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tòa nhà thuộc {zones.find(z => z.MaKhu === activeAreaId)?.TenKhu || "Khu vực"}</h3>
            {activeAreaId && (
              <button onClick={() => { setModalType('building'); setEditingItem(null); setFormData({name:''}); setIsModalOpen(true); }} className="text-[10px] font-bold text-blue-600 flex items-center hover:text-blue-700 uppercase tracking-wider">
                <Plus size={14} className="mr-1" /> Thêm Tòa
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuildings.map((building) => (
              <div key={building.MaToaNha} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 text-[#00529C] rounded-xl border border-blue-100">
                      <Building2 size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{building.TenToaNha}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setModalType('building'); setEditingItem(building); setFormData({name: building.TenToaNha}); setIsModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-xl"><Edit size={16}/></button>
                    <button onClick={() => handleDelete('building', building.MaToaNha)} className="p-2 text-red-600 bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewRooms(building)}
                  className="w-full mt-2 py-2.5 text-[11px] font-bold text-slate-400 bg-slate-50 hover:bg-[#00529C] hover:text-white hover:shadow-lg rounded-xl transition-all uppercase tracking-widest border border-slate-100"
                >
                  Xem danh sách phòng ở
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL HIỂN THỊ DANH SÁCH PHÒNG TRONG TÒA (YÊU CẦU CỦA BẠN) --- */}
      {showRoomModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
            <div className="p-6 bg-[#00529C] text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Sơ đồ phòng ở</p>
                <h3 className="font-black text-2xl mt-1 uppercase">{viewingBuildingName}</h3>
              </div>
              <button onClick={() => setShowRoomModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8">
              {isRoomsLoading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-slate-300" size={40} /></div>
              ) : roomList.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Tòa nhà này hiện chưa có phòng nào được khởi tạo.</div>
              ) : (
                <div className="overflow-x-auto max-h-[400px] sidebar-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="pb-4 px-2">Phòng</th>
                        <th className="pb-4 px-2">Giới tính</th>
                        <th className="pb-4 px-2">Loại phòng</th>
                        <th className="pb-4 px-2 text-center">Người ở</th>
                        <th className="pb-4 px-2 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {roomList.map((room) => (
                        <tr key={room.MaPhong} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-2 font-bold text-slate-900">P.{room.TenPhong}</td>
                          <td className="py-4 px-2">
                             <span className={`text-[10px] font-bold uppercase ${room.GioiTinh === 1 ? 'text-blue-500' : 'text-rose-500'}`}>
                                {room.GioiTinh === 1 ? 'Nam' : 'Nữ'}
                             </span>
                          </td>
                          <td className="py-4 px-2 text-xs text-slate-500">{room.LoaiPhong}</td>
                          <td className="py-4 px-2 text-center text-xs font-bold text-blue-600">
                             {room.SoSinhVienHienTai} / {room.SucChua}
                          </td>
                          <td className="py-4 px-2 text-right">
                             <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                               room.TrangThai === 'Đã đầy' ? 'bg-red-50 text-red-500 border-red-100' :
                               room.TrangThai === 'Bảo trì' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                             }`}>
                                {room.TrangThai}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowRoomModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg">Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM KHU / TÒA (Giữ nguyên) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 font-sans">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.1em]">
                {editingItem ? 'Cập nhật' : 'Khởi tạo'} {modalType === 'area' ? 'Khu vực' : 'Tòa nhà'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Tên {modalType === 'area' ? 'Khu vực' : 'Tòa nhà'}</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-semibold" value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} />
               </div>
               <button type="submit" className="w-full py-3 bg-[#00529C] text-white rounded-xl font-bold shadow-lg uppercase text-xs tracking-widest active:scale-95 transition-all">Xác nhận</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Infrastructure;