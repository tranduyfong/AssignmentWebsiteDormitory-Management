import React, { useState } from 'react';
import { 
  PlusCircle, BookOpen, Edit, Trash2, Search, 
  X, Save, FileText, ShieldCheck, AlertCircle, Clock,Plus
} from 'lucide-react';

const DormRules = () => {
  // 1. Dữ liệu mẫu danh sách nội quy
  const [rules, setRules] = useState([
    { 
      id: 'NQ-01', 
      title: 'Quy định về thời gian ra vào', 
      category: 'Giờ giấc',
      content: 'Sinh viên phải có mặt tại KTX trước 23h00 hàng ngày. Cổng KTX mở cửa từ 05h00 sáng.',
      lastUpdated: '10/03/2024',
      status: 'Đang áp dụng'
    },
    { 
      id: 'NQ-02', 
      title: 'Quy định sử dụng thiết bị điện', 
      category: 'An toàn',
      content: 'Nghiêm cấm nấu ăn trong phòng. Chỉ được sử dụng các thiết bị điện công suất thấp như sạc điện thoại, laptop, đèn bàn.',
      lastUpdated: '12/03/2024',
      status: 'Đang áp dụng'
    },
    { 
      id: 'NQ-03', 
      title: 'Quy định về vệ sinh chung', 
      category: 'Vệ sinh',
      content: 'Tổ chức vệ sinh phòng ở hàng tuần. Rác thải phải được phân loại và để đúng nơi quy định trước 08h00 sáng.',
      lastUpdated: '15/03/2024',
      status: 'Đang áp dụng'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. State cho Form
  const [formData, setFormData] = useState({
    title: '', category: 'Chung', content: '', status: 'Đang áp dụng'
  });

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData(rule);
    } else {
      setEditingRule(null);
      setFormData({ title: '', category: 'Chung', content: '', status: 'Đang áp dụng' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('vi-VN');
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...formData, lastUpdated: today } : r));
    } else {
      const newRule = { 
        ...formData, 
        id: `NQ-0${rules.length + 1}`, 
        lastUpdated: today 
      };
      setRules([...rules, newRule]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ nội quy này?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý Nội quy KTX</h1>
          <p className="text-slate-500 font-medium text-sm">Thiết lập và cập nhật các quy định chung cho sinh viên nội trú</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Soạn nội quy mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="relative flex-1 text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nội quy..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-4">
        {rules.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((rule) => (
          <div key={rule.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 text-lg">{rule.title}</h3>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase border border-slate-200 tracking-tighter">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {rule.content}
                  </p>
                  <div className="flex items-center text-[11px] text-slate-400 font-medium pt-2">
                    <Clock size={12} className="mr-1.5" />
                    Cập nhật lần cuối: {rule.lastUpdated} — <span className="ml-1 text-blue-500 font-bold uppercase tracking-tighter">{rule.id}</span>
                  </div>
                </div>
              </div>
              
              {/* Thao tác - Luôn hiện nút không cần hover */}
              <div className="flex md:flex-col gap-2 flex-shrink-0">
                <button 
                  onClick={() => handleOpenModal(rule)}
                  className="flex items-center justify-center p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
                  title="Cập nhật"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(rule.id)}
                  className="flex items-center justify-center p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                  title="Gỡ bỏ"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Soạn thảo nội quy */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.1em] flex items-center">
                <FileText size={16} className="mr-2 text-blue-600" />
                {editingRule ? 'Cập nhật nội quy' : 'Soạn thảo nội quy mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-sm">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Tiêu đề nội quy</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="Ví dụ: Quy định về an toàn cháy nổ"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Danh mục</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Chung">Chung</option>
                    <option value="Giờ giấc">Giờ giấc</option>
                    <option value="An toàn">An toàn</option>
                    <option value="Vệ sinh">Vệ sinh</option>
                    <option value="Tài sản">Tài sản</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Trạng thái</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Đang áp dụng">Đang áp dụng</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Nội dung chi tiết</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium leading-relaxed"
                  placeholder="Nhập nội dung quy định cụ thể tại đây..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors uppercase text-xs"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
                >
                  {editingRule ? 'Lưu cập nhật' : 'Xác nhận tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DormRules;