import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, CheckCircle2, Wrench, XCircle } from 'lucide-react';
import axiosClient from '../utils/axios.interceptor';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/incidents');
      setIncidents(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách phản ánh:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Xử lý sự cố
  const handleResolve = async (id) => {
    if (window.confirm('Xác nhận đã xử lý xong sự cố này?')) {
      try {
        await axiosClient.put(`/admin/incidents/${id}/resolve`);
        alert('Đã cập nhật trạng thái thành công!');
        fetchIncidents();
      } catch (error) {
        alert('Có lỗi xảy ra khi cập nhật.');
      }
    }
  };

  const filteredData = incidents.filter(item =>
    item.TenSinhVien?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.TenPhong?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Phản ánh & Sự cố</h1>
          <p className="text-slate-500 font-medium text-sm">Tiếp nhận và xử lý các yêu cầu sửa chữa cơ sở vật chất</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo phòng hoặc tên sinh viên..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-amber-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-400">Không có phản ánh nào.</div>
        ) : (
          filteredData.map(inc => (
            <div key={inc.MaPhanAnh} className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between ${inc.TrangThai === 0 ? 'border-amber-200' : 'border-slate-200 opacity-70'}`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inc.TrangThai === 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {inc.TrangThai === 0 ? 'Đang chờ xử lý' : 'Đã xử lý'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{new Date(inc.NgayGui).toLocaleDateString('vi-VN')}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{inc.TieuDe}</h3>
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">"{inc.NoiDung}"</p>
                <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-4">
                  <span>Phòng: <strong className="text-blue-600">{inc.TenPhong || 'N/A'}</strong></span>
                  <span>Người báo: {inc.TenSinhVien}</span>
                </div>
              </div>

              {inc.TrangThai === 0 && (
                <button
                  onClick={() => handleResolve(inc.MaPhanAnh)}
                  className="w-full flex items-center justify-center py-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl font-bold transition-colors text-sm"
                >
                  <Wrench size={16} className="mr-2" /> Đánh dấu đã sửa xong
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Incidents;