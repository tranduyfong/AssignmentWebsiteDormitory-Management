import React, { useState } from 'react';
import { 
  MessageSquare, Search, Filter, Clock, 
  Wrench, CheckCircle2, AlertCircle, 
  Calendar, User, Home, MoreVertical, X, Check
} from 'lucide-react';

const Incidents = () => {
  // 1. Dữ liệu mẫu các phản ánh sự cố
  const [incidents, setIncidents] = useState([
    { 
      id: 'PC-001', 
      room: 'A1-102', 
      student: 'Nguyễn Văn An', 
      category: 'Điện', 
      title: 'Hỏng bóng đèn học', 
      description: 'Bóng đèn ở bàn học số 2 bị nhấp nháy liên tục rồi tắt hẳn từ tối qua.', 
      date: '15/03/2026 08:30', 
      status: 'Đã tiếp nhận',
      priority: 'Trung bình'
    },
    { 
      id: 'PC-002', 
      room: 'B3-504', 
      student: 'Trần Thị Bình', 
      category: 'Nước', 
      title: 'Rò rỉ vòi hoa sen', 
      description: 'Vòi hoa sen trong nhà tắm bị rò rỉ nước gây lãng phí và ẩm ướt sàn nhà.', 
      date: '15/03/2026 09:15', 
      status: 'Đang xử lý',
      priority: 'Cao'
    },
    { 
      id: 'PC-003', 
      room: 'A2-301', 
      student: 'Lê Hoàng Long', 
      category: 'Cơ sở vật chất', 
      title: 'Gãy bản lề cửa sổ', 
      description: 'Cửa sổ phía đông bị gãy bản lề, không thể đóng kín khi trời mưa.', 
      date: '14/03/2024 14:20', 
      status: 'Hoàn thành',
      priority: 'Thấp'
    },
    { 
      id: 'PC-004', 
      room: 'A1-405', 
      student: 'Phạm Thanh Thảo', 
      category: 'Internet', 
      title: 'Mạng wifi chập chờn', 
      description: 'Mạng wifi tại tầng 4 rất yếu, thường xuyên bị ngắt kết nối vào buổi tối.', 
      date: '15/03/2026 10:00', 
      status: 'Đã tiếp nhận',
      priority: 'Trung bình'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // 2. Cập nhật trạng thái xử lý
  const updateStatus = (id, newStatus) => {
    setIncidents(incidents.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    if (selectedIncident?.id === id) {
      setSelectedIncident({ ...selectedIncident, status: newStatus });
    }
  };

  // 3. Logic lọc
  const filteredData = incidents.filter(item => {
    const matchesSearch = item.room.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'Tất cả' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Phản ánh & Sự cố</h1>
        <p className="text-slate-500 font-medium text-sm">Tiếp nhận và theo dõi tiến độ xử lý yêu cầu từ sinh viên</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard 
          label="Chờ tiếp nhận" 
          count={incidents.filter(i => i.status === 'Đã tiếp nhận').length} 
          icon={Clock} 
          color="text-blue-600" bg="bg-blue-50" 
        />
        <StatusCard 
          label="Đang xử lý" 
          count={incidents.filter(i => i.status === 'Đang xử lý').length} 
          icon={Wrench} 
          color="text-amber-600" bg="bg-amber-50" 
        />
        <StatusCard 
          label="Đã hoàn thành" 
          count={incidents.filter(i => i.status === 'Hoàn thành').length} 
          icon={CheckCircle2} 
          color="text-emerald-600" bg="bg-emerald-50" 
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo số phòng hoặc tiêu đề..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-44 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đã tiếp nhận">Đã tiếp nhận</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Incidents Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredData.map((incident) => (
          <div 
            key={incident.id}
            onClick={() => setSelectedIncident(incident)}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${getCategoryColor(incident.category)}`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{incident.title}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Phòng {incident.room} • {incident.category}</p>
                </div>
              </div>
              <StatusBadge status={incident.status} />
            </div>

            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              "{incident.description}"
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center text-xs text-slate-400">
                <Calendar size={14} className="mr-1" />
                {incident.date}
              </div>
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <User size={14} className="mr-1" />
                {incident.student}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal chi tiết & xử lý */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <StatusBadge status={selectedIncident.status} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedIncident.id}</span>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="p-1.5 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"><X size={20}/></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">{selectedIncident.title}</h3>
                <div className="flex items-center text-sm text-blue-600 font-semibold">
                  <Home size={16} className="mr-1.5" /> Phòng {selectedIncident.room} — {selectedIncident.student}
                </div>
                <div className="text-xs text-slate-400 font-medium flex items-center mt-1">
                   <Clock size={12} className="mr-1" /> Gửi lúc: {selectedIncident.date}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Nội dung phản ánh:</p>
                <p className="text-slate-600 text-sm leading-relaxed">"{selectedIncident.description}"</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cập nhật trạng thái xử lý:</p>
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton 
                    label="Tiếp nhận" 
                    active={selectedIncident.status === 'Đã tiếp nhận'} 
                    onClick={() => updateStatus(selectedIncident.id, 'Đã tiếp nhận')}
                    icon={Clock}
                    color="blue"
                  />
                  <ActionButton 
                    label="Đang xử lý" 
                    active={selectedIncident.status === 'Đang xử lý'} 
                    onClick={() => updateStatus(selectedIncident.id, 'Đang xử lý')}
                    icon={Wrench}
                    color="amber"
                  />
                  <ActionButton 
                    label="Hoàn thành" 
                    active={selectedIncident.status === 'Hoàn thành'} 
                    onClick={() => updateStatus(selectedIncident.id, 'Hoàn thành')}
                    icon={CheckCircle2}
                    color="emerald"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedIncident(null)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const StatusCard = ({ label, count, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={22} /></div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{count}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Đã tiếp nhận': 'bg-blue-50 text-blue-600 border-blue-100',
    'Đang xử lý': 'bg-amber-50 text-amber-600 border-amber-100',
    'Hoàn thành': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};

const ActionButton = ({ label, active, onClick, icon: Icon, color }) => {
  const colors = {
    blue: active ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50',
    amber: active ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50',
    emerald: active ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50',
  };
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${colors[color]} ${active ? 'shadow-lg scale-105' : ''}`}
    >
      <Icon size={18} className="mb-1" />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
};

const getCategoryColor = (cat) => {
  switch (cat) {
    case 'Điện': return 'bg-amber-50 text-amber-500';
    case 'Nước': return 'bg-blue-50 text-blue-500';
    case 'Cơ sở vật chất': return 'bg-purple-50 text-purple-500';
    default: return 'bg-slate-50 text-slate-500';
  }
};

export default Incidents;