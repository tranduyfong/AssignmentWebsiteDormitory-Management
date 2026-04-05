import React, { useState } from 'react';
import { 
  Plus, Building2, Layers, ChevronRight, 
  Edit, Trash2, Layout, PlusCircle, X 
} from 'lucide-react';

const Infrastructure = () => {
  // 1. Dữ liệu cấu trúc (Đã bỏ Nam/Nữ)
  const [areas, setAreas] = useState([
    {
      id: 'area-a',
      name: 'Khu A',
      buildings: [
        { id: 'b-a1', name: 'Tòa A1', floors: 5, roomPrefix: 'A1' },
        { id: 'b-a2', name: 'Tòa A2', floors: 4, roomPrefix: 'A2' }
      ]
    },
    {
      id: 'area-b',
      name: 'Khu B',
      buildings: [
        { id: 'b-b3', name: 'Tòa B3', floors: 8, roomPrefix: 'B3' }
      ]
    }
  ]);

  const [activeArea, setActiveArea] = useState(areas[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('area'); // 'area' hoặc 'building'

  const handleDeleteArea = (id) => {
    if(window.confirm("Xác nhận xóa Khu này? Mọi dữ liệu Tòa nhà bên trong sẽ bị gỡ bỏ.")) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý Khu, Tòa nhà</h1>
          <p className="text-slate-500 text-sm font-medium">Thiết lập danh mục Khu vực và các Tòa nhà trực thuộc hệ thống KTX</p>
        </div>
        <button 
          onClick={() => { setModalType('area'); setIsModalOpen(true); }}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Thêm Khu mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: DANH SÁCH KHU (AREAS) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Danh mục các Khu</h3>
          <div className="space-y-3">
            {areas.map((area) => (
              <div 
                key={area.id}
                onClick={() => setActiveArea(area.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  activeArea === area.id 
                  ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                  : 'border-white bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeArea === area.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Layout size={20} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${activeArea === area.id ? 'text-blue-700' : 'text-slate-700'}`}>{area.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{area.buildings.length} Tòa nhà</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
   <button className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={14}/></button>
   <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={14}/></button>
</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT TÒA NHÀ (BUILDINGS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center ml-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tòa nhà thuộc {areas.find(a => a.id === activeArea)?.name}</h3>
            <button 
                onClick={() => { setModalType('building'); setIsModalOpen(true); }}
                className="text-[11px] font-bold text-blue-600 flex items-center hover:text-blue-700 uppercase tracking-wider"
            >
                <Plus size={14} className="mr-1" /> Thêm Tòa nhà
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areas.find(a => a.id === activeArea)?.buildings.map((building) => (
              <div key={building.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{building.name}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-tighter">Ký hiệu: {building.roomPrefix}-XXX</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
  <button className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"><Edit size={16}/></button>
  <button className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"><Trash2 size={16}/></button>
</div>
                </div>

                {/* Chỉ giữ lại Số Tầng, đã bỏ Ước tính phòng */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Layers size={18} className="mr-2 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">Quy mô tòa nhà</span>
                  </div>
                  <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    {building.floors} Tầng
                  </p>
                </div>

                <button className="w-full mt-4 py-2.5 text-[11px] font-bold text-slate-400 bg-slate-50 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 rounded-xl transition-all uppercase tracking-widest border border-slate-100 border-dashed group-hover:border-transparent">
                  Danh sách phòng
                </button>
              </div>
            ))}

            {areas.find(a => a.id === activeArea)?.buildings.length === 0 && (
                <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50">
                    <Building2 size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm font-medium text-slate-400 ">Khu vực này hiện chưa được khởi tạo Tòa nhà.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FORM (Đã bỏ Nam/Nữ) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.1em]">
                {modalType === 'area' ? 'Khởi tạo Khu mới' : 'Khởi tạo Tòa nhà'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg transition-colors"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-5 text-sm">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Tên gọi chính thức</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" placeholder={modalType === 'area' ? "Ví dụ: Khu A" : "Ví dụ: Tòa A1"} />
               </div>
               {modalType === 'building' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Số lượng tầng</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" placeholder="VD: 5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Ký hiệu (Tiền tố)</label>
                      <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium uppercase" placeholder="VD: A1" />
                    </div>
                 </div>
               )}
               <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors">Hủy</button>
                  <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Tạo mới</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Infrastructure;