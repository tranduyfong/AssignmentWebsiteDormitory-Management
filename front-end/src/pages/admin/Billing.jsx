import React, { useState } from 'react';
import { 
  Plus, Search, Trash2, Receipt, Edit,
  X, Save, Zap, Droplets, 
  CheckCircle2, Download, Calendar
} from 'lucide-react';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' hoặc 'room'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Lưu ID đang sửa
  
  // 1 & 3. Dữ liệu mẫu danh sách các khoản phí
  const [studentFees, setStudentFees] = useState([
    { id: 'SV-P01', msv: '20110601', name: 'Nguyễn Văn An', room: 'A1-101', period: 'Kỳ I 2025-2026', amount: '4500000', status: 'Chờ tạo hóa đơn' },
    { id: 'SV-P02', msv: '21110502', name: 'Trần Thị Bình', room: 'A1-101', period: 'Kỳ I 2025-2026', amount: '4500000', status: 'Đã tạo hóa đơn' },
    { id: 'SV-P03', msv: '22110705', name: 'Lê Hoàng Long', room: 'B3-204', period: 'Kỳ I 2025-2026', amount: '3800000', status: 'Chờ tạo hóa đơn' },
  ]);

  const [roomUtilityFees, setRoomUtilityFees] = useState([
    { 
      id: 'DN-2403', room: 'A1-101', period: 'Tháng 03/2026', 
      elec: { old: 1200, new: 1350 }, 
      water: { old: 50, new: 65 },
      status: 'Chờ tạo hóa đơn' 
    },
  ]);

  const [formData, setFormData] = useState({
    msv: '', name: '', room: '', period: '', amount: '4500000', elecOld: 0, elecNew: 0, waterOld: 0, waterNew: 0
  });

  // 4 & 5. Admin thêm khoản phí mới
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ msv: '', name: '', room: '', period: '', amount: '4500000', elecOld: 0, elecNew: 0, waterOld: 0, waterNew: 0 });
    setIsModalOpen(true);
  };

  // Mở Form chỉnh sửa
  const handleEditClick = (fee) => {
    setEditingId(fee.id);
    setFormData({
      msv: fee.msv || '',
      name: fee.name || '',
      room: fee.room,
      period: fee.period,
      amount: fee.amount || '4500000',
      elecOld: fee.elec?.old || 0,
      elecNew: fee.elec?.new || 0,
      waterOld: fee.water?.old || 0,
      waterNew: fee.water?.new || 0,
    });
    setIsModalOpen(true);
  };

  // 6 & 7. Lưu dữ liệu phí (Cả Thêm và Sửa)
  const handleSaveFee = (e) => {
    e.preventDefault();
    if (activeTab === 'student') {
      if (editingId) {
        setStudentFees(studentFees.map(f => f.id === editingId ? { ...f, ...formData } : f));
      } else {
        setStudentFees([{ id: `SV-${Date.now()}`, ...formData, status: 'Chờ tạo hóa đơn' }, ...studentFees]);
      }
    } else {
      if (editingId) {
        setRoomUtilityFees(roomUtilityFees.map(f => f.id === editingId ? { 
            ...f, 
            room: formData.room, 
            period: formData.period,
            elec: { old: formData.elecOld, new: formData.elecNew },
            water: { old: formData.waterOld, new: formData.waterNew }
        } : f));
      } else {
        setRoomUtilityFees([{ 
            id: `DN-${Date.now()}`, 
            room: formData.room, 
            period: formData.period, 
            elec: { old: formData.elecOld, new: formData.elecNew }, 
            water: { old: formData.waterOld, new: formData.waterNew }, 
            status: 'Chờ tạo hóa đơn' 
        }, ...roomUtilityFees]);
      }
    }
    setIsModalOpen(false);
  };

  // Xóa khoản phí
  const handleDelete = (id) => {
    if (window.confirm('Xác nhận xóa khoản phí này?')) {
      if (activeTab === 'student') setStudentFees(studentFees.filter(f => f.id !== id));
      else setRoomUtilityFees(roomUtilityFees.filter(f => f.id !== id));
    }
  };

  // Tạo hóa đơn
  const handleCreateInvoice = (id) => {
    if (activeTab === 'student') {
      setStudentFees(studentFees.map(f => f.id === id ? { ...f, status: 'Đã tạo hóa đơn' } : f));
    } else {
      setRoomUtilityFees(roomUtilityFees.map(f => f.id === id ? { ...f, status: 'Đã tạo hóa đơn' } : f));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase tracking-tighter">Quản lý thu phí</h1>
          <p className="text-slate-500 font-medium text-sm italic tracking-tight">Quản khoản phí tiền phòng, tiền điện, tiền nước</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Thêm khoản phí mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200">
        <button onClick={() => setActiveTab('student')} className={`px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'student' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500'}`}>
          TIỀN PHÒNG 
        </button>
        <button onClick={() => setActiveTab('room')} className={`px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'room' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500'}`}>
          ĐIỆN NƯỚC 
        </button>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              <th className="px-6 py-4">{activeTab === 'student' ? 'Sinh viên / MSV' : 'Số phòng'}</th>
              <th className="px-6 py-4">Giai đoạn</th>
              <th className="px-6 py-4">{activeTab === 'student' ? 'Số tiền đóng' : 'Chỉ số (Điện / Nước)'}</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {(activeTab === 'student' ? studentFees : roomUtilityFees).map(fee => (
              <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{activeTab === 'student' ? fee.name : `Phòng ${fee.room}`}</div>
                  <div className="text-[10px] text-blue-500 font-bold uppercase">{activeTab === 'student' ? fee.msv : fee.id}</div>
                </td>
                <td className="px-6 py-4 italic text-slate-400 text-xs">
                    <div className="flex items-center"><Calendar size={12} className="mr-1.5"/> {fee.period}</div>
                </td>
                <td className="px-6 py-4">
                  {activeTab === 'student' ? (
                    <span className="font-black text-slate-900">{Number(fee.amount).toLocaleString()}đ</span>
                  ) : (
                    <div className="flex gap-4">
                        <div className="flex items-center text-xs text-amber-600 font-semibold"><Zap size={12} className="mr-1"/> {fee.elec.new - fee.elec.old} số</div>
                        <div className="flex items-center text-xs text-blue-600 font-semibold"><Droplets size={12} className="mr-1"/> {fee.water.new - fee.water.old} khối</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${
                    fee.status === 'Đã tạo hóa đơn' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {fee.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {fee.status === 'Chờ tạo hóa đơn' ? (
                      <>
                        <button 
                            onClick={() => handleCreateInvoice(fee.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-md shadow-blue-200"
                        >
                            <Receipt size={14} className="mr-1.5" /> Tạo hóa đơn
                        </button>
                        <button 
                            onClick={() => handleEditClick(fee)}
                            className="p-2 bg-slate-100 text-blue-600 border border-slate-200 rounded-lg hover:bg-blue-50 transition-all"
                            title="Sửa khoản phí"
                        >
                            <Edit size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-lg border border-emerald-100 flex items-center">
                        <CheckCircle2 size={14} className="mr-1.5" /> Đã xuất HĐ
                      </div>
                    )}

                    <button 
                      disabled={fee.status === 'Đã tạo hóa đơn'}
                      onClick={() => handleDelete(fee.id)}
                      className={`p-2 rounded-lg transition-all border ${
                        fee.status === 'Đã tạo hóa đơn' 
                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50' 
                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest italic">
                {editingId ? 'Cập nhật dữ liệu phí' : (activeTab === 'student' ? 'Ghi nhận phí Sinh viên' : 'Ghi điện nước Phòng')}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSaveFee} className="p-8 space-y-4 text-sm font-medium">
                {activeTab === 'student' ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="MSV" value={formData.msv} onChange={(e) => setFormData({...formData, msv: e.target.value})} />
                            <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Họ tên" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Số phòng" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} />
                            <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Học kỳ" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} />
                        </div>
                        <input required type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-black" placeholder="Số tiền đóng" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Số phòng" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} />
                            <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Tháng hóa đơn" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100 font-bold">
                            <input type="number" placeholder="Điện cũ" className="w-full px-3 py-2 rounded-lg" value={formData.elecOld} onChange={(e) => setFormData({...formData, elecOld: parseInt(e.target.value)})} />
                            <input type="number" placeholder="Điện mới" className="w-full px-3 py-2 rounded-lg" value={formData.elecNew} onChange={(e) => setFormData({...formData, elecNew: parseInt(e.target.value)})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 font-bold">
                            <input type="number" placeholder="Nước cũ" className="w-full px-3 py-2 rounded-lg" value={formData.waterOld} onChange={(e) => setFormData({...formData, waterOld: parseInt(e.target.value)})} />
                            <input type="number" placeholder="Nước mới" className="w-full px-3 py-2 rounded-lg" value={formData.waterNew} onChange={(e) => setFormData({...formData, waterNew: parseInt(e.target.value)})} />
                        </div>
                    </div>
                )}
                <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg uppercase text-[10px] tracking-widest flex items-center justify-center">
                    <Save size={16} className="mr-2" /> Lưu dữ liệu phí
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Badge Trạng thái
const StatusBadge = ({ status }) => {
  const styles = {
    'Đã tạo hóa đơn': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Chờ tạo hóa đơn': 'bg-slate-100 text-slate-400 border-slate-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Billing;