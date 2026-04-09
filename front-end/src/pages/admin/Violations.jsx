import React, { useState } from 'react';
import { 
  AlertTriangle, Search, Filter, Plus, 
  Gavel, History, UserX, ShieldAlert, 
  Trash2, Edit, X, FileText, CheckCircle2
} from 'lucide-react';

const Violations = () => {
  // 1. Dữ liệu mẫu hồ sơ vi phạm
  const [violations, setViolations] = useState([
    { 
      id: 'VP-2024-001', 
      msv: '2011060001', 
      studentName: 'Nguyễn Văn An', 
      room: 'A1-102',
      date: '10/03/2024', 
      violationType: 'Sử dụng thiết bị điện cấm', 
      description: 'Sử dụng bếp điện trong phòng gây nguy cơ cháy nổ.',
      handling: 'Cảnh cáo cấp 1',
      status: 'Đã xử lý'
    },
    { 
      id: 'VP-2024-002', 
      msv: '2111050234', 
      studentName: 'Trần Thị Bình', 
      room: 'B3-504',
      date: '12/03/2024', 
      violationType: 'Đi muộn', 
      description: 'Về ký túc xá sau 23h00 không có lý do chính đáng.',
      handling: 'Nhắc nhở',
      status: 'Chờ xác nhận'
    },
    { 
      id: 'VP-2024-003', 
      msv: '1911040112', 
      studentName: 'Lê Hoàng Long', 
      room: 'A2-301',
      date: '14/03/2024', 
      violationType: 'Gây mất trật tự', 
      description: 'Mở nhạc lớn sau 22h ảnh hưởng đến các phòng xung quanh.',
      handling: 'Trừ điểm rèn luyện',
      status: 'Đã xử lý'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');

  // 2. Logic xử lý Form
  const [formData, setFormData] = useState({
    msv: '', studentName: '', room: '', date: '', violationType: '', description: '', handling: 'Nhắc nhở', status: 'Chờ xác nhận'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newViolation = {
      ...formData,
      id: `VP-2024-00${violations.length + 1}`,
      date: formData.date || new Date().toLocaleDateString('vi-VN')
    };
    setViolations([newViolation, ...violations]);
    setIsModalOpen(false);
    setFormData({ msv: '', studentName: '', room: '', date: '', violationType: '', description: '', handling: 'Nhắc nhở', status: 'Chờ xác nhận' });
  };

  const filteredData = violations.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || item.msv.includes(searchQuery);
    const matchesType = filterType === 'Tất cả' || item.violationType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý vi phạm</h1>
          <p className="text-slate-500 font-medium text-sm">Ghi nhận vi phạm và lưu trữ lịch sử kỷ luật sinh viên</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Ghi nhận vi phạm
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStat label="Tổng số vi phạm" value={violations.length} icon={ShieldAlert} color="text-red-600" bg="bg-red-50" />
        <QuickStat label="Cần xử lý" value={violations.filter(v => v.status === 'Chờ xác nhận').length} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <QuickStat label="Đã giải quyết" value={violations.filter(v => v.status === 'Đã xử lý').length} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc MSV sinh viên..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Tất cả">Tất cả loại lỗi</option>
            <option value="Sử dụng thiết bị điện cấm">Sử dụng thiết bị cấm</option>
            <option value="Đi muộn">Đi muộn</option>
            <option value="Gây mất trật tự">Gây mất trật tự</option>
            <option value="Vệ sinh kém">Vệ sinh kém</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Thời gian / Mã đơn</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Sinh viên</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Nội dung vi phạm</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Hình thức xử lý</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px] tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-[11px] tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{v.date}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{v.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{v.studentName}</div>
                    <div className="text-xs text-blue-500 font-medium">{v.msv} • Phòng {v.room}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-medium text-slate-700">{v.violationType}</div>
                    <div className="text-xs text-slate-400 truncate">"{v.description}"</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center font-medium text-red-600">
                      <Gavel size={14} className="mr-1.5 opacity-50" /> {v.handling}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${
                      v.status === 'Đã xử lý' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
    <button className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200" title="Lịch sử xử lý">
      <History size={16} />
    </button>
    <button className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-100" title="Xóa bản ghi">
      <Trash2 size={16} />
    </button>
  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ghi nhận vi phạm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-red-600 uppercase text-xs tracking-widest flex items-center">
                <ShieldAlert size={16} className="mr-2" /> Ghi nhận vi phạm mới
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Mã sinh viên</label>
                  <input required placeholder="Nhập MSV" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-all" value={formData.msv} onChange={(e) => setFormData({...formData, msv: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Số phòng</label>
                  <input required placeholder="VD: A1-101" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Họ và tên sinh viên</label>
                <input required placeholder="Nhập đầy đủ tên" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Loại vi phạm</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 font-medium" value={formData.violationType} onChange={(e) => setFormData({...formData, violationType: e.target.value})}>
                    <option value="">Chọn loại vi phạm</option>
                    <option value="Sử dụng thiết bị điện cấm">Sử dụng thiết bị cấm</option>
                    <option value="Đi muộn">Đi muộn</option>
                    <option value="Gây mất trật tự">Gây mất trật tự</option>
                    <option value="Vệ sinh kém">Vệ sinh kém</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-600 ml-1">Hình thức xử lý</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 font-medium" value={formData.handling} onChange={(e) => setFormData({...formData, handling: e.target.value})}>
                    <option value="Nhắc nhở">Nhắc nhở</option>
                    <option value="Cảnh cáo cấp 1">Cảnh cáo cấp 1</option>
                    <option value="Cảnh cáo cấp 2">Cảnh cáo cấp 2</option>
                    <option value="Trừ điểm rèn luyện">Trừ điểm rèn luyện</option>
                    <option value="Đuổi khỏi ký túc xá">Đuổi khỏi ký túc xá</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Mô tả chi tiết</label>
                <textarea rows="3" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500" placeholder="Mô tả sự việc..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-semibold hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold shadow-md shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95">Lưu vi phạm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const QuickStat = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={22} /></div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default Violations;