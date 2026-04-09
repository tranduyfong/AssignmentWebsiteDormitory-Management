import React, { useState } from 'react';
import { 
  Search, CreditCard, CheckCircle2, Clock, 
  Home, Zap, Receipt, Calendar, FileSpreadsheet
} from 'lucide-react';

const Invoices = () => {
  // 1. Dữ liệu mẫu
  const [invoices] = useState([
    { 
      id: 'INV-24001', 
      studentName: 'Nguyễn Văn An', 
      msv: '20110601',
      room: 'A1-101',
      type: 'Tiền phòng', 
      amount: '4.500.000', 
      createdAt: '15/03/2026',
      status: 'Đã đóng'
    },
    { 
      id: 'INV-24002', 
      studentName: 'Nguyễn Văn An', 
      msv: '20110601',
      room: 'A1-101',
      type: 'Điện nước (Chia đều)', 
      amount: '125.000', 
      createdAt: '15/03/2026',
      status: 'Chưa đóng'
    },
    { 
      id: 'INV-24003', 
      studentName: 'Trần Thị Bình', 
      msv: '21110502',
      room: 'A1-101',
      type: 'Điện nước (Chia đều)', 
      amount: '125.000', 
      createdAt: '15/03/2026',
      status: 'Đã đóng'
    },
    { 
      id: 'INV-24004', 
      studentName: 'Lê Hoàng Long', 
      msv: '22110705',
      room: 'B3-204',
      type: 'Tiền phòng', 
      amount: '3.800.000', 
      createdAt: '14/03/2026',
      status: 'Chưa đóng'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Logic lọc dữ liệu
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.msv.includes(searchQuery) || 
                          inv.id.includes(searchQuery);
    const matchesStatus = filterStatus === 'Tất cả' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Theo dõi Hóa đơn</h1>
          <p className="text-slate-500 font-medium text-sm ">Quản lý tình trạng thanh toán phí nội trú sinh viên</p>
        </div>
      </div>

      {/* Tài chính tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinanceCard label="Tổng giá trị hóa đơn" value="8.550.000đ" icon={CreditCard} color="text-blue-600" bg="bg-blue-50" />
        <FinanceCard label="Thực thu (Đã đóng)" value="4.625.000đ" icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <FinanceCard label="Công nợ (Chưa đóng)" value="3.925.000đ" icon={Clock} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo Tên, MSV hoặc Mã hóa đơn..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="w-full md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-medium text-slate-600"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đã đóng">Đã đóng</option>
          <option value="Chưa đóng">Chưa đóng</option>
        </select>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4 text-center w-16">STT</th>
                <th className="px-6 py-4">Mã hóa đơn</th>
                <th className="px-6 py-4">Sinh viên thụ hưởng</th>
                <th className="px-6 py-4">Số tiền thu</th>
                <th className="px-6 py-4">Loại phí</th>
                <th className="px-6 py-4">Phòng</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv, index) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center text-slate-400 font-bold">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{inv.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{inv.studentName}</div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase">MSV: {inv.msv}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                    {inv.amount}đ
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-[10px] font-bold uppercase">
                        {inv.type.includes('Điện nước') ? (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center">
                                <Zap size={10} className="mr-1"/> Điện nước
                            </span>
                        ) : (
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center">
                                <Receipt size={10} className="mr-1"/> Tiền phòng
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center font-semibold text-slate-600">
                        <Home size={14} className="mr-1.5 text-slate-300"/> {inv.room}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div className="flex items-center"><Calendar size={13} className="mr-1.5 opacity-60"/> {inv.createdAt}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
            <div className="p-20 text-center text-slate-400">Không tìm thấy dữ liệu hóa đơn nào...</div>
        )}
      </div>
    </div>
  );
};

// --- Sub-components ---

const FinanceCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={22} /></div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-slate-800 mt-0.5 tracking-tight">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Đã đóng': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Chưa đóng': 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
        {status}
    </span>
  );
};

export default Invoices;