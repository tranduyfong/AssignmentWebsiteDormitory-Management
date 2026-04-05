import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, PieChart as PieIcon, Download, FileText, 
  Users, Home, CreditCard, Activity, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

// --- MOCK DATA (Dữ liệu phục vụ báo cáo) ---
const revenueData = [
  { name: 'Tháng 1', phong: 420, dien: 150, nuoc: 85, chi_phi: 120 },
  { name: 'Tháng 2', phong: 450, dien: 180, nuoc: 90, chi_phi: 130 },
  { name: 'Tháng 3', phong: 440, dien: 210, nuoc: 95, chi_phi: 110 },
  { name: 'Tháng 4', phong: 480, dien: 190, nuoc: 88, chi_phi: 140 },
];

const occupancyData = [
  { name: 'Sinh viên đang ở', value: 1420, color: '#3b82f6' },
  { name: 'Chỗ còn trống', value: 180, color: '#10b981' },
  { name: 'Đang bảo trì', value: 45, color: '#f59e0b' },
];

const roomTypeStats = [
  { type: 'Phòng 4 người', total: 100, occupied: 95, empty: 5 },
  { type: 'Phòng 6 người', total: 80, occupied: 72, empty: 8 },
  { type: 'Phòng 8 người', total: 50, occupied: 40, empty: 10 },
];

const Reports = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Thống kê - Báo cáo Quản lý</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Hệ thống báo cáo số liệu thực tế KTX Đại học Mỏ - Địa chất</p>
        </div>
        <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={16} className="mr-2 text-emerald-500"/> Xuất Excel
            </button>
            <button className="flex items-center px-4 py-2 bg-slate-900 rounded-xl text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition-all">
              <FileText size={16} className="mr-2 text-blue-400"/> Báo cáo PDF
            </button>
        </div>
      </div>

      {/* 2. Thống kê nhanh (Quick Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Tổng Sinh viên đang ở" 
          value="1,420" 
          subValue="+12 sv tháng này"
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          label="Tổng số phòng trống" 
          value="180" 
          subValue="Tỉ lệ trống: 11.2%"
          icon={Home} 
          color="emerald" 
        />
        <StatCard 
          label="Doanh thu tháng (Tr.đ)" 
          value="758.5" 
          subValue="+4.2% so với T3"
          icon={CreditCard} 
          color="amber" 
        />
        <StatCard 
          label="Phản ánh chưa xử lý" 
          value="15" 
          subValue="Cần ưu tiên xử lý"
          icon={Activity} 
          color="red" 
        />
      </div>

      {/* 3. Biểu đồ chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Thu chi Tiền phòng, Điện, Nước */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <TrendingUp size={18} className="mr-2 text-blue-500" /> Báo cáo Thu chi & Doanh thu (Triệu VNĐ)
            </h3>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Dữ liệu 4 tháng gần nhất</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} 
                  cursor={{fill: '#f8fafc'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: '600', paddingTop: '20px'}} />
                <Bar dataKey="phong" name="Tiền phòng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dien" name="Tiền điện" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nuoc" name="Tiền nước" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chi_phi" name="Chi phí sửa chữa" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê tình trạng chỗ ở */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center">
            <PieIcon size={18} className="mr-2 text-emerald-500" /> Tình trạng chỗ ở sinh viên
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={occupancyData} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">86%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Đang lấp đầy</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
             {occupancyData.map(i => (
               <div key={i.name} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                 <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: i.color}}></div>
                    <span className="text-[11px] font-semibold text-slate-500">{i.name}</span>
                 </div>
                 <span className="text-xs font-bold text-slate-800">{i.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 4. Bảng thống kê quản lý chi tiết */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phân tích chỗ ở theo loại phòng</h3>
           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Dữ liệu học kỳ 2023.2</span>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loại phòng</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Tổng số phòng</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Đã lấp đầy</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Số phòng trống</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 border-t border-slate-100">
                {roomTypeStats.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.type}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">{item.total}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-center">{item.occupied}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-500 text-center">{item.empty}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="w-24 h-1.5 bg-slate-100 rounded-full inline-block overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{width: `${(item.occupied/item.total)*100}%`}}
                          ></div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: Stat Card ---
const StatCard = ({ label, value, icon: Icon, color, subValue }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-red-600 bg-red-50 border-red-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-xl border ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subValue}</p>
      </div>
    </div>
  );
};

export default Reports;