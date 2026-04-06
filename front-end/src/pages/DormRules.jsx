import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import axiosClient from '../utils/axios.interceptor';
import toast from 'react-hot-toast';

const DormRules = () => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ tieuDe: '', danhMuc: 'An ninh', noiDung: '', trangThai: 'Đang áp dụng' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/rules', formData);
      toast.success('Đã thêm nội quy mới!');
      setIsModalOpen(false);
      setFormData({ tieuDe: '', danhMuc: 'An ninh', noiDung: '', trangThai: 'Đang áp dụng' });
      fetchRules();
    } catch (error) {
      toast.error('Lỗi khi lưu nội quy');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Nội quy Ký túc xá</h1>
          <p className="text-slate-500 font-medium text-sm italic">Quản lý các quy định chung và hướng dẫn nội trú</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all text-sm"
        >
          <Plus size={18} className="mr-2" /> Thêm nội quy mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Đang tải...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Chưa có nội quy nào được đăng tải.</div>
        ) : (
          rules.map(rule => (
            <div key={rule.MaNoiQuy} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{rule.TieuDe}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rule.DanhMuc} • Cập nhật: {new Date(rule.NgayCapNhat).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${rule.TrangThai === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {rule.TrangThai === 1 ? 'Đang áp dụng' : 'Ngưng áp dụng'}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{rule.NoiDung}</p>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase">Soạn thảo nội quy mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Tiêu đề</label>
                  <input required className="w-full mt-1 px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" value={formData.tieuDe} onChange={e => setFormData({ ...formData, tieuDe: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Danh mục</label>
                  <select className="w-full mt-1 px-4 py-2 bg-slate-50 border rounded-xl outline-none" value={formData.danhMuc} onChange={e => setFormData({ ...formData, danhMuc: e.target.value })}>
                    <option value="An ninh">An ninh</option>
                    <option value="Vệ sinh">Vệ sinh</option>
                    <option value="Điện nước">Điện nước</option>
                    <option value="Tiếp khách">Tiếp khách</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Nội dung chi tiết</label>
                <textarea required rows="6" className="w-full mt-1 px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" value={formData.noiDung} onChange={e => setFormData({ ...formData, noiDung: e.target.value })}></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">Đăng tải nội quy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DormRules;