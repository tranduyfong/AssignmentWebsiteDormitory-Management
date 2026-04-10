import React, { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle2, Clock, Home, Zap, Receipt, Calendar } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Thống kê tổng quan
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });

  // Hàm gọi API lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/invoices');
      setInvoices(data);

      // Tính toán thống kê
      let total = 0, paid = 0, unpaid = 0;
      data.forEach(inv => {
        const amount = Number(inv.SoTien);
        total += amount;
        if (inv.TrangThaiThanhToan === 1) paid += amount;
        else unpaid += amount;
      });
      setStats({ total, paid, unpaid });

    } catch (error) {
      console.error("Lỗi lấy danh sách hóa đơn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Lọc dữ liệu
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.TenSinhVien?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.MaSV?.includes(searchQuery) ||
      inv.MaHoaDon?.toString().includes(searchQuery);

    // TrangThaiThanhToan: 1 = Đã đóng, 0 = Chưa đóng
    const statusText = inv.TrangThaiThanhToan === 1 ? 'Đã đóng' : 'Chưa đóng';
    const matchesStatus = filterStatus === 'Tất cả' || statusText === filterStatus;

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
        <FinanceCard label="Tổng giá trị hóa đơn" value={formatCurrency(stats.total)} icon={CreditCard} color="text-blue-600" bg="bg-blue-50" />
        <FinanceCard label="Thực thu (Đã đóng)" value={formatCurrency(stats.paid)} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <FinanceCard label="Công nợ (Chưa đóng)" value={formatCurrency(stats.unpaid)} icon={Clock} color="text-red-600" bg="bg-red-50" />
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
                <th className="px-6 py-4">Mã HĐ</th>
                <th className="px-6 py-4">Kỳ Hóa Đơn</th>
                <th className="px-6 py-4">Sinh viên thụ hưởng</th>
                <th className="px-6 py-4">Số tiền thu</th>
                <th className="px-6 py-4">Loại phí</th>
                <th className="px-6 py-4">Phòng</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">Đang tải dữ liệu hóa đơn...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">Không tìm thấy dữ liệu hóa đơn nào...</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.MaHoaDon} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">HD{inv.MaHoaDon}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{inv.KyHoaDon}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{inv.TenSinhVien}</div>
                      <div className="text-[10px] font-bold text-blue-500 uppercase">MSV: {inv.MaSV}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(inv.SoTien)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-[10px] font-bold uppercase">
                        {inv.LoaiHoaDon?.includes('Điện') || inv.LoaiHoaDon?.includes('Nước') ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center">
                            <Zap size={10} className="mr-1" /> {inv.LoaiHoaDon}
                          </span>
                        ) : (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center">
                            <Receipt size={10} className="mr-1" /> {inv.LoaiHoaDon}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center font-semibold text-slate-600">
                        <Home size={14} className="mr-1.5 text-slate-300" /> {inv.TenPhong}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center">
                        <Calendar size={13} className="mr-1.5 opacity-60" />
                        {new Date(inv.NgayLap).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={inv.TrangThaiThanhToan === 1 ? 'Đã đóng' : 'Chưa đóng'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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