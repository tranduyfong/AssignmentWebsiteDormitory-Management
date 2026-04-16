import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, PieChart as PieIcon, FileText, 
  Users, Home, CreditCard, Activity, Loader2
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';
import { domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';

const Reports = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef();

  // 1. Lấy dữ liệu từ API Backend
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/admin/dashboard/summary');
      setData(res);
    } catch (error) {
      console.error("Lỗi Dashboard API:", error);
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

const handleExportPDF = async () => {
  const element = reportRef.current;
  if (!element) return;

  const downloadBtn = document.getElementById('download-btn');
  const loadingToast = toast.loading("Đang xuất báo cáo PDF...");

  try {

    // 1. Chụp ảnh với scale cao và chiều rộng cố định để đảm bảo chữ to
    const canvas = await domToCanvas(element, {
      scale: 3, // Tăng scale lên 3 để cực kỳ nét
      backgroundColor: '#f8fafc',
      width: element.offsetWidth, // Chụp đúng chiều rộng thực tế của web
      height: element.scrollHeight,
    });

    if (downloadBtn) downloadBtn.style.opacity = '1';

    const imgData = canvas.toDataURL('image/png');
    
    // 2. TẠO PDF KHỔ NGANG (Landscape) - Giúp Dashboard trông to và rộng hơn
    const pdf = new jsPDF({
      orientation: 'landscape', 
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 3. Tính toán kích thước để ảnh lấp đầy chiều rộng trang (trừ đi lề 10mm)
    const margin = 10; 
    const width = pageWidth - (margin * 2);
    const height = (canvas.height * width) / canvas.width;

    // 4. Nếu nội dung quá dài, nó sẽ tự động tràn xuống nhưng ảnh sẽ to rõ
    pdf.addImage(imgData, 'PNG', margin, margin, width, height);
    
    const dateStr = new Date().toLocaleDateString('vi-VN').replaceAll('/', '-');
    pdf.save(`Bao_cao_KTX_${dateStr}.pdf`);
    
    toast.success("Báo cáo đã sẵn sàng!", { id: loadingToast });
  } catch (error) {
    console.error("Lỗi:", error);
    toast.error("Lỗi xử lý PDF", { id: loadingToast });
    if (downloadBtn) downloadBtn.style.opacity = '1';
  }
};

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00529C] animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">Hệ thống đang tổng hợp báo cáo...</p>
      </div>
    );
  }

  // 2. Chuẩn bị dữ liệu cho biểu đồ tròn (Pie Chart)
  const occupancyPieData = [
    { name: 'Đã đầy', value: data?.rooms.fullRooms || 0, color: '#ef4444' },
    { name: 'Còn chỗ/Trống', value: (data?.rooms.availableRooms || 0) + (data?.rooms.emptyRooms || 0), color: '#10b981' },
    { name: 'Bảo trì', value: data?.rooms.maintenanceRooms || 0, color: '#f59e0b' },
  ];

  // 3. Tính toán tỷ lệ lấp đầy tổng quát
  const totalRooms = data?.rooms.totalRooms || 1;
  const occupancyRate = Math.round(((data?.rooms.fullRooms) / totalRooms) * 100);

  return (
    <div  className="space-y-8 animate-in fade-in duration-500 pb-10 font-sans">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase tracking-tighter">Thống kê - Báo cáo</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm ">Số liệu thống kê vận hành KTX thực tế từ hệ thống</p>
        </div>
        <button 
        id="download-btn"
          onClick={handleExportPDF}
          className="flex items-center px-5 py-2.5 bg-white text-black border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 hover:bg-gray-100 uppercase tracking-widest"
        >
          <FileText size={16} className="mr-2 text-blue-500"/> Xuất báo cáo
        </button>
      </div>
      <div ref={reportRef} className="space-y-8 p-4 rounded-[32px]"> 
      {/* 2. Thống kê nhanh (Quick Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Sinh viên đang ở" 
          value={data?.students.totalActive.toLocaleString()} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          label="Phòng còn trống" 
          value={data?.rooms.availableRooms + data?.rooms.emptyRooms} 
          icon={Home} 
          color="emerald" 
        />
        <StatCard 
          label="Đơn đăng ký mới" 
          value={data?.registrations.pending} 
          icon={CreditCard} 
          color="amber" 
        />
        <StatCard 
          label="Sự cố & Vi phạm" 
          value={data?.issues.incidents + data?.issues.violations} 
          icon={Activity} 
          color="red" 
        />
      </div>

      {/* 3. Biểu đồ chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Biểu đồ Doanh thu (Giữ nguyên logic của bạn) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <TrendingUp size={18} className="mr-2 text-[#00529C]" /> Biểu đồ doanh thu (6 tháng gần nhất)
            </h3>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Đơn vị: VNĐ</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}}
                  formatter={(value) => [Number(value).toLocaleString() + ' đ', 'Tổng thu']}
                />
                <Bar dataKey="totalRevenue" name="Doanh thu thực tế" fill="#00529C" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tình trạng phòng (Pie Chart) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center">
            <PieIcon size={18} className="mr-2 text-emerald-500" /> Phân bổ tình trạng phòng
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={occupancyPieData} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value"
                            cx="50%" // Thêm dòng này để đưa vào giữa
          cy="50%" // Thêm dòng này để đưa vào giữa
          animationBegin={0}
          animationDuration={1500}

                >
                  {occupancyPieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{occupancyRate}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tỉ lệ lấp đầy</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
             {occupancyPieData.map(i => (
               <div key={i.name} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                 <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full mr-2" style={{backgroundColor: i.color}}></div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{i.name}</span>
                 </div>
                 <span className="text-xs font-black text-slate-800">{i.value} <span className="text-[12px] font-normal text-slate-600 ml-0.5">phòng</span></span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 4. THAY ĐỔI: Bảng phân tích chỗ ở theo loại phòng */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phân tích chỗ ở theo loại phòng</h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
              <thead className="bg-white">
                <tr className="text-[12px] font-bold text-slate-600 uppercase ">
                  <th className="px-8 py-5">Loại phòng</th>
                  <th className="px-8 py-5 text-center">Tổng số phòng</th>
                  <th className="px-8 py-5 text-center">Đã lấp đầy</th>
                  <th className="px-8 py-5 text-center">Số phòng còn chỗ</th>
                  <th className="px-8 py-5 text-right">Tỉ lệ lấp đầy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-t border-slate-50">
                {data?.roomTypeStats.map((item, index) => {
                  // Tính phần trăm lấp đầy
                  const percentage = item.total > 0 ? Math.round((item.occupied / item.total) * 100) : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-700">{item.type}</td>
                      <td className="px-8 py-5 text-center font-bold text-slate-900">{item.total}</td>
                      <td className="px-8 py-5 text-center font-bold text-rose-500">{item.occupied}</td>
                      <td className="px-8 py-5 text-center font-bold text-emerald-600">{item.available}</td>
                      <td className="px-8 py-5">
                         <div className="flex items-center justify-end gap-3">
                            <span className="text-[12px] font-black text-slate-500">{percentage}%</span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                  className="h-full bg-[#00529C]" 
                                  style={{ width: `${percentage}%` }}
                               ></div>
                            </div>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
           </table>
        </div>
      </div>
      </div>
    </div>
  );
};

// --- Sub-component: Stat Card ---
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-red-600 bg-red-50 border-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
      <div className={`p-3.5 rounded-2xl border ${colors[color]}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value || 0}</p>
      </div>
    </div>
  );
};

export default Reports;