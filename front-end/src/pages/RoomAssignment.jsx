import React, { useState } from 'react';
import { 
  UserCheck, Search, Filter, CheckCircle2, XCircle, 
  Home, User, Calendar, ArrowRight, Check, X,
  AlertCircle, Building2, MoreHorizontal
} from 'lucide-react';

const RoomAssignment = () => {
  // 1. Dữ liệu mẫu danh sách đăng ký
  const [registrations, setRegistrations] = useState([
    { id: 'REG-001', msv: '21110505', name: 'Vũ Minh Tuấn', gender: 'Nam', semester: 'Kỳ II (2025-2026)', date: '20/03/2026', status: 'Chờ duyệt' },
    { id: 'REG-002', msv: '22110712', name: 'Phạm Thanh Thảo', gender: 'Nữ', semester: 'Kỳ II (2025-2026)', date: '21/03/2026', status: 'Chờ duyệt' },
    { id: 'REG-003', msv: '20110899', name: 'Hoàng Văn Đức', gender: 'Nam', semester: 'Kỳ II (2025-2026)', date: '19/03/2026', status: 'Đã duyệt', room: 'A1-102' },
  ]);

  // 2. Dữ liệu mẫu phòng trống để phân phối
  const [availableRooms] = useState([
    { id: 'A1-101', area: 'Khu A', gender: 'Nam', current: 3, max: 4 },
    { id: 'A1-102', area: 'Khu A', gender: 'Nam', current: 2, max: 4 },
    { id: 'B3-205', area: 'Khu B', gender: 'Nữ', current: 5, max: 8 },
    { id: 'B3-206', area: 'Khu B', gender: 'Nữ', current: 0, max: 6 },
  ]);

  const [selectedReg, setSelectedReg] = useState(null); // Đơn đang được chọn để phân phòng
  const [searchQuery, setSearchQuery] = useState('');

  // Hàm xử lý phân phòng
  const handleAssign = (roomId) => {
    setRegistrations(registrations.map(reg => 
      reg.id === selectedReg.id 
        ? { ...reg, status: 'Đã duyệt', room: roomId } 
        : reg
    ));
    setSelectedReg(null);
    alert(`Đã phân sinh viên ${selectedReg.name} vào phòng ${roomId} thành công!`);
  };

  // Hàm từ chối đơn
  const handleReject = (id) => {
    if(window.confirm("Xác nhận từ chối đơn đăng ký này?")) {
      setRegistrations(registrations.map(reg => 
        reg.id === id ? { ...reg, status: 'Từ chối' } : reg
      ));
    }
  };

  const filteredData = registrations.filter(reg => 
    reg.name.toLowerCase().includes(searchQuery.toLowerCase()) || reg.msv.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Xét duyệt & Phân phòng</h1>
          <p className="text-slate-500 font-medium text-sm">Tiếp nhận đăng ký nội trú và điều phối chỗ ở cho sinh viên</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <AlertCircle size={18} className="text-amber-500 mr-2" />
            <span className="text-xs font-bold text-slate-600">
              {registrations.filter(r => r.status === 'Chờ duyệt').length} đơn mới cần xử lý
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc MSV..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4">Sinh viên</th>
                <th className="px-6 py-4">Giới tính</th>
                <th className="px-6 py-4">Học kỳ</th>
                <th className="px-6 py-4 text-center">Trạng thái / Phòng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center"><Calendar size={14} className="mr-2 opacity-60"/> {reg.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{reg.name}</div>
                    <div className="text-[10px] text-blue-500 font-bold uppercase">{reg.msv}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold uppercase">{reg.gender}</td>
                  <td className="px-6 py-4 text-slate-600">{reg.semester}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge status={reg.status} />
                      {reg.room && (
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          Phòng: {reg.room}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {reg.status === 'Chờ duyệt' ? (
                        <>
                          <button 
                            onClick={() => setSelectedReg(reg)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-md shadow-blue-100"
                          >
                            <Home size={14} className="mr-1.5" /> Phân phòng
                          </button>
                          <button 
                            onClick={() => handleReject(reg.id)}
                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100"
                            title="Từ chối"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button className="p-2 text-slate-400 bg-slate-50 rounded-lg border border-slate-200 cursor-not-allowed">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PHÂN PHÒNG (Hiện ra khi nhấn nút) */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-slate-800 font-semibold">
              <span className="uppercase text-xs tracking-widest">Phân phòng cho: {selectedReg.name}</span>
              <button onClick={() => setSelectedReg(null)} className="p-1.5 hover:bg-white rounded-full"><X size={18}/></button>
            </div>
            
            <div className="p-8">
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Giới tính sinh viên</p>
                  <p className="text-lg font-bold text-blue-700 uppercase">{selectedReg.gender}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Yêu cầu học kỳ</p>
                  <p className="text-sm font-semibold text-blue-700">{selectedReg.semester}</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center ">
                <Home size={16} className="mr-2 text-slate-400" /> Danh sách phòng trống phù hợp:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto sidebar-scroll pr-2">
                {availableRooms
                  .filter(room => room.gender === selectedReg.gender)
                  .map(room => (
                    <div 
                      key={room.id}
                      onClick={() => handleAssign(room.id)}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-white cursor-pointer transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{room.id}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{room.area}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700">{room.current}/{room.max}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Chỗ trống</p>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{width: `${(room.current/room.max)*100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setSelectedReg(null)} className="px-5 py-2 text-slate-500 font-bold text-xs uppercase">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Badge trạng thái
const StatusBadge = ({ status }) => {
  const styles = {
    'Đã duyệt': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Chờ duyệt': 'bg-amber-50 text-amber-600 border-amber-100',
    'Từ chối': 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

export default RoomAssignment;