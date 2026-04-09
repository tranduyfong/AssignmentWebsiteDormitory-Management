import React, { useState } from 'react';
import { 
  Search, Plus, Calendar, Clock, 
  CheckCircle2, XCircle, Edit, Trash2, X, Save, 
  Repeat, LogOut, FileCheck, Download
} from 'lucide-react';

const Contracts = () => {
  // 1. Dữ liệu mẫu danh sách hợp đồng (Đã bỏ field type)
  const [contracts, setContracts] = useState([
    { 
      id: 'HD-2025-001', 
      msv: '20110601', 
      name: 'Nguyễn Văn An', 
      room: 'A1-101',
      startDate: '01/01/2025', 
      endDate: '30/06/2026', 
      status: 'Đang hiệu lực'
    },
    { 
      id: 'HD-2025-002', 
      msv: '21110502', 
      name: 'Trần Thị Bình', 
      room: 'A1-101',
      startDate: '15/08/2025', 
      endDate: '15/02/2026', 
      status: 'Hết hạn'
    },
    { 
      id: 'HD-2026-003', 
      msv: '22110705', 
      name: 'Lê Hoàng Long', 
      room: 'B3-204',
      startDate: '01/01/2026', 
      endDate: '31/12/2026', 
      status: 'Đang hiệu lực'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // 2. Các hàm nghiệp vụ
  const handleTerminate = (id) => {
    if (window.confirm('Xác nhận chấm dứt hợp đồng này? Sinh viên sẽ phải thực hiện thủ tục trả phòng.')) {
      setContracts(contracts.map(c => c.id === id ? { ...c, status: 'Đã chấm dứt' } : c));
    }
  };

  const handleExtend = (id) => {
    if (window.confirm('Bạn có muốn gia hạn hợp đồng này thêm 06 tháng?')) {
      setContracts(contracts.map(c => {
        if (c.id === id) {
          return { ...c, endDate: '31/12/2025', status: 'Đang hiệu lực' };
        }
        return c;
      }));
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.msv.includes(searchQuery);
    const matchesStatus = filterStatus === 'Tất cả' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý Hợp đồng</h1>
          <p className="text-slate-500 font-medium text-sm">Lập mới, theo dõi thời hạn và gia hạn lưu trú sinh viên</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Lập hợp đồng mới
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Hợp đồng hiệu lực" value={contracts.filter(c => c.status === 'Đang hiệu lực').length} icon={FileCheck} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Sắp hết hạn" value="5" icon={Clock} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Đã chấm dứt / Hết hạn" value={contracts.filter(c => c.status !== 'Đang hiệu lực').length} icon={XCircle} color="text-slate-500" bg="bg-slate-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo Tên hoặc Mã sinh viên..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="w-full md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang hiệu lực">Đang hiệu lực</option>
          <option value="Hết hạn">Hết hạn</option>
          <option value="Đã chấm dứt">Đã chấm dứt</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Mã Hợp đồng</th>
                <th className="px-6 py-4">Sinh viên / MSV</th>
                <th className="px-6 py-4 text-center">Phòng</th>
                <th className="px-6 py-4">Thời hạn (Bắt đầu - Kết thúc)</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
                <th className="px-6 py-4 text-right">Thao tác nghiệp vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{c.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-[10px] text-blue-500 font-bold uppercase">{c.msv}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600">{c.room}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-500">{c.startDate}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className={c.status === 'Hết hạn' ? 'text-red-500 font-bold' : 'text-slate-900 font-bold'}>{c.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        {c.status === 'Đang hiệu lực' && (
                            <>
                                <button 
                                    onClick={() => handleExtend(c.id)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center shadow-sm"
                                >
                                    <Repeat size={12} className="mr-1.5" /> Gia hạn
                                </button>
                                <button 
                                    onClick={() => handleTerminate(c.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center shadow-sm"
                                >
                                    <LogOut size={12} className="mr-1.5" /> Chấm dứt
                                </button>
                            </>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                            <Edit size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập hợp đồng mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Khởi tạo hợp đồng lưu trú mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg"><X size={18}/></button>
            </div>
            <form className="p-8 space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mã sinh viên</label>
                        <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Nhập MSV" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Chọn phòng</label>
                        <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="VD: A1-101" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ngày bắt đầu</label>
                        <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ngày kết thúc</label>
                        <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                    </div>
                </div>
                <div className="pt-2">
                    <button type="button" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg uppercase text-xs tracking-widest flex items-center justify-center hover:bg-blue-700 transition-all">
                        <Save size={16} className="mr-2" /> Ký hợp đồng & Lưu trữ
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={20} /></div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Đang hiệu lực': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Hết hạn': 'bg-amber-50 text-amber-600 border-amber-100',
    'Đã chấm dứt': 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

const ArrowRight = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
);

export default Contracts;