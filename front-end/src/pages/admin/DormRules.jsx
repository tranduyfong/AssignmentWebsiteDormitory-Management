import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, FileText, 
  ShieldCheck, Clock, PlusCircle 
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const DormRules = () => {
  // 1. States
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null); // Lưu nội quy đang sửa
  const [searchQuery, setSearchQuery] = useState('');

  // 2. State cho Form (Khớp với backend của bạn)
  const [formData, setFormData] = useState({
    tieuDe: '',
    danhMuc: 'Chung',
    noiDung: '',
    trangThai: 1 // 1: Đang áp dụng, 0: Ngưng
  });

  // 3. Lấy danh sách từ API
  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/rules');
      setRules(data);
    } catch (error) {
      toast.error("Không thể tải danh sách nội quy");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  // 4. Hàm mở Modal (Dùng cho cả Thêm và Sửa)
  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        tieuDe: rule.TieuDe,
        danhMuc: rule.DanhMuc,
        noiDung: rule.NoiDung,
        trangThai: rule.TrangThai
      });
    } else {
      setEditingRule(null);
      setFormData({ tieuDe: '', danhMuc: 'Chung', noiDung: '', trangThai: 1 });
    }
    setIsModalOpen(true);
  };

  // 5. Xử lý Lưu (Thêm mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        // Gọi API cập nhật (PUT)
        await axiosClient.put(`/admin/rules/${editingRule.MaNoiQuy}`, formData);
        toast.success('Cập nhật nội quy thành công!');
      } else {
        // Gọi API thêm mới (POST)
        await axiosClient.post('/admin/rules', formData);
        toast.success('Đã đăng tải nội quy mới!');
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (error) {
      toast.error('Lỗi khi lưu dữ liệu');
    }
  };

  // 6. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ nội quy này?')) {
      try {
        await axiosClient.delete(`/admin/rules/${id}`);
        toast.success('Đã xóa nội quy');
        fetchRules();
      } catch (error) {
        toast.error('Không thể xóa nội quy');
      }
    }
  };

  // 7. Logic lọc tìm kiếm
  const filteredRules = rules.filter(r => 
    r.TieuDe.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.DanhMuc.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          className="flex items-center justify-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-md hover:bg-[#004080] transition-all active:scale-95 text-sm"
        >
          <Plus size={18} className="mr-2" /> Soạn nội quy mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="relative flex-1 text-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nội quy theo tiêu đề hoặc danh mục..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 italic font-medium">Đang tải dữ liệu...</div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic font-medium">Không tìm thấy nội quy nào.</div>
        ) : (
          filteredRules.map((rule) => (
            <div key={rule.MaNoiQuy} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-lg">{rule.TieuDe}</h3>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase border border-slate-200 tracking-tighter">
                        {rule.DanhMuc}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${rule.TrangThai === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {rule.TrangThai === 1 ? 'Đang áp dụng' : 'Ngưng áp dụng'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {rule.NoiDung}
                    </p>
                    <div className="flex items-center text-[11px] text-slate-400 font-medium pt-2">
                      <Clock size={12} className="mr-1.5" />
                      Cập nhật: {new Date(rule.NgayCapNhat).toLocaleDateString('vi-VN')}
                      
                    </div>
                  </div>
                </div>
                
                {/* Thao tác Buttons */}
                <div className="flex md:flex-col gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleOpenModal(rule)}
                    className="flex items-center justify-center p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
                    title="Chỉnh sửa nội quy"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rule.MaNoiQuy)}
                    className="flex items-center justify-center p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                    title="Xóa nội quy"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Soạn thảo / Cập nhật */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.1em] flex items-center">
                <FileText size={16} className="mr-2 text-blue-600" />
                {editingRule ? 'Cập nhật nội quy' : 'Soạn thảo nội quy mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-sm">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Tiêu đề nội quy</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="Ví dụ: Quy định về an toàn cháy nổ"
                  value={formData.tieuDe}
                  onChange={(e) => setFormData({...formData, tieuDe: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Danh mục</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                    value={formData.danhMuc}
                    onChange={(e) => setFormData({...formData, danhMuc: e.target.value})}
                  >
                    <option value="Chung">Chung</option>
                    <option value="Giờ giấc">Giờ giấc</option>
                    <option value="An ninh">An ninh</option>
                    <option value="Vệ sinh">Vệ sinh</option>
                    <option value="Tiếp khách">Tiếp khách</option>
                    <option value="Điện nước">Điện nước</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Trạng thái</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                    value={formData.trangThai}
                    onChange={(e) => setFormData({...formData, trangThai: parseInt(e.target.value)})}
                  >
                    <option value={1}>Đang áp dụng</option>
                    <option value={0}>Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Nội dung chi tiết</label>
                <textarea 
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium leading-relaxed"
                  placeholder="Nhập nội dung quy định cụ thể tại đây..."
                  value={formData.noiDung}
                  onChange={(e) => setFormData({...formData, noiDung: e.target.value})}
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
                  className="flex-1 py-3 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
                >
                  {editingRule ? 'Lưu cập nhật' : 'Xác nhận đăng tải'}
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