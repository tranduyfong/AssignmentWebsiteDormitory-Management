import React, { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, UserPlus, Filter, 
  Phone, CreditCard, School, X 
} from 'lucide-react';

const Students = () => {
  // 1. Dữ liệu mẫu mở rộng (10 sinh viên)
  const [students, setStudents] = useState([
    { id: '2011060001', name: 'Nguyễn Văn An', gender: 'Nam', class: 'K65 - Địa chất', dept: 'Khoa Địa chất', cccd: '001095001234', contact: '0987.654.321', status: 'Đang ở' },
    { id: '2111050234', name: 'Trần Thị Bình', gender: 'Nữ', class: 'K66 - CNTT', dept: 'Khoa CNTT', cccd: '001096005678', contact: '0912.345.678', status: 'Hết hạn hợp đồng' },
    { id: '1911040112', name: 'Lê Hoàng Long', gender: 'Nam', class: 'K64 - Dầu khí', dept: 'Khoa Dầu khí', cccd: '034094008899', contact: '0866.777.888', status: 'Đã trả phòng' },
    { id: '2211070045', name: 'Phạm Thanh Thảo', gender: 'Nữ', class: 'K67 - Kinh tế', dept: 'Khoa Kinh tế - QTKD', cccd: '035097001122', contact: '0944.555.666', status: 'Đang ở' },
    { id: '2011080099', name: 'Hoàng Văn Đức', gender: 'Nam', class: 'K65 - Trắc địa', dept: 'Khoa Trắc địa - Bản đồ', cccd: '036095003344', contact: '0977.888.999', status: 'Đang ở' },
    { id: '2111050555', name: 'Vũ Minh Tuấn', gender: 'Nam', class: 'K66 - CNTT', dept: 'Khoa CNTT', cccd: '037096007788', contact: '0911.222.333', status: 'Đang ở' },
    { id: '2011090123', name: 'Đặng Thu Hà', gender: 'Nữ', class: 'K65 - Môi trường', dept: 'Khoa Môi trường', cccd: '038095004455', contact: '0933.444.555', status: 'Hết hạn hợp đồng' },
    { id: '1911100789', name: 'Bùi Anh Dũng', gender: 'Nam', class: 'K64 - Cơ điện', dept: 'Khoa Cơ điện', cccd: '039094006677', contact: '0966.777.888', status: 'Đã trả phòng' },
    { id: '2211110012', name: 'Ngô Mỹ Linh', gender: 'Nữ', class: 'K67 - Xây dựng', dept: 'Khoa Xây dựng', cccd: '040097008811', contact: '0988.999.000', status: 'Đang ở' },
    { id: '2111120456', name: 'Lý Gia Bảo', gender: 'Nam', class: 'K66 - Mỏ', dept: 'Khoa Mỏ', cccd: '041096002233', contact: '0922.333.444', status: 'Đang ở' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // 2. Xử lý Form
  const [formData, setFormData] = useState({
    id: '', name: '', gender: 'Nam', class: '', dept: '', cccd: '', contact: '', status: 'Đang ở'
  });

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({ id: '', name: '', gender: 'Nam', class: '', dept: '', cccd: '', contact: '', status: 'Đang ở' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? formData : s));
    } else {
      setStudents([...students, formData]);
    }
    setIsModalOpen(false);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
    const matchesFilter = filterStatus === 'Tất cả' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Sinh viên</h1>
          <p className="text-slate-500 font-medium text-sm ">Hệ thống lưu trữ hồ sơ nội trú - Đại học Mỏ Địa chất</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus size={18} className="mr-2" /> Thêm sinh viên
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc MSV..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400 hidden md:block" />
          <select 
            className="flex-1 md:w-44 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 text-sm focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đang ở">Đang ở</option>
            <option value="Đã trả phòng">Đã trả phòng</option>
            <option value="Hết hạn hợp đồng">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MSV</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Họ và Tên</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lớp / Khoa</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Liên hệ / CCCD</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-blue-600 text-sm">{student.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{student.name}</div>
                    <div className="text-[11px] text-slate-400">{student.gender}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center text-slate-700 font-medium"><School size={12} className="mr-1 text-slate-400"/> {student.class}</div>
                    <div className="text-slate-400 mt-0.5">{student.dept}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center text-slate-600 font-medium"><Phone size={12} className="mr-1 text-slate-400"/> {student.contact}</div>
                    <div className="flex items-center text-slate-500 mt-1"><CreditCard size={12} className="mr-1 text-slate-400"/> {student.cccd}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
      onClick={() => handleOpenModal(student)}
      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
      title="Chỉnh sửa"
    >
      <Edit size={16} />
    </button>
    <button 
      onClick={() => handleDelete(student.id)}
      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
      title="Xóa"
    >
      <Trash2 size={16} />
    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">
                {editingStudent ? 'Cập nhật thông tin' : 'Thêm sinh viên mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Mã sinh viên</label>
                <input 
                  required disabled={!!editingStudent}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none disabled:opacity-60"
                  value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Họ và tên</label>
                <input 
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Giới tính</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium"
                  value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Số CCCD</label>
                <input 
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={formData.cccd} onChange={(e) => setFormData({...formData, cccd: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Lớp</label>
                <input 
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Khoa</label>
                <input 
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Số điện thoại</label>
                <input 
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-600 ml-1">Trạng thái</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium"
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Đang ở">Đang ở</option>
                  <option value="Đã trả phòng">Đã trả phòng</option>
                  <option value="Hết hạn hợp đồng">Hết hạn hợp đồng</option>
                </select>
              </div>

              <div className="col-span-2 pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    'Đang ở': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Đã trả phòng': 'bg-slate-50 text-slate-500 border-slate-200',
    'Hết hạn hợp đồng': 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Students;