import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, UserPlus, Filter, 
  Phone, CreditCard, School, X, Loader2, Eye, EyeOff, Calendar, Mail , ChevronLeft, ChevronRight 
} from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 1. Thêm ngaySinh vào state formData
  const [formData, setFormData] = useState({
    id: '',       
    fullname: '', 
    email: '',
    sdt: '',
    cccd: '',
    gioiTinh: 1,
    ngaySinh: '', // Trường mới
    password: ''  
  });

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/students');
      setStudents(data);
    } catch (error) {
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Hàm phụ trợ để format ngày về dạng YYYY-MM-DD cho ô input type="date"
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleOpenModal = (student = null) => {
    setShowPassword(false);
    if (student) {
      setEditingStudent(student);
      setFormData({
        id: student.MaSV,
        fullname: student.HoTen,
        email: student.Email || '',
        sdt: student.SDT || '',
        cccd: student.CCCD || '',
        gioiTinh: student.GioiTinh !== undefined ? student.GioiTinh : 1,
        ngaySinh: formatDateForInput(student.NgaySinh), // Gán ngày sinh vào form
        password: '' 
      });
    } else {
      setEditingStudent(null);
      setFormData({ id: '', fullname: '', email: '', sdt: '', cccd: '', gioiTinh: 1, ngaySinh: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn bị payload gửi lên backend
      const payload = {
        msv: formData.id,
        fullname: formData.fullname,
        email: formData.email,
        sdt: formData.sdt,
        cccd: formData.cccd,
        gioiTinh: formData.gioiTinh,
        ngaySinh: formData.ngaySinh, // Gửi ngày sinh
        password: formData.password
      };

      if (editingStudent) {
        await axiosClient.put(`/admin/students/${editingStudent.MaSV}`, payload);
        toast.success('Cập nhật thông tin thành công!');
      } else {
        await axiosClient.post('/admin/students', payload);
        toast.success('Thêm sinh viên mới thành công!');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thao tác dữ liệu!');
    }
  };

  const handleDelete = async (msv) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      try {
        await axiosClient.delete(`/admin/students/${msv}`);
        toast.success('Đã xóa sinh viên khỏi hệ thống.');
        fetchStudents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể xóa sinh viên này!');
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.HoTen?.toLowerCase().includes(searchQuery.toLowerCase()) || s.MaSV?.includes(searchQuery);
    let currentStatus = s.TenPhong ? "Đang ở" : "Chưa ở";
    const matchesFilter = filterStatus === 'Tất cả' || currentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Tính toán dữ liệu hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Quản lý Sinh viên</h1>
          <p className="text-slate-500 font-medium text-sm ">Danh sách sinh viên nội trú HUMG</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-5 py-2.5 bg-[#00529C] text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95 text-sm"
        >
          <UserPlus size={18} className="mr-2" /> Thêm sinh viên
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full font-medium">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc MSV..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00529C] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400 hidden md:block" />
          <select 
            className="w-full md:w-48 p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold text-slate-600 focus:border-[#00529C] cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đang ở">Đang ở</option>
            <option value="Chưa ở">Chưa nhận phòng</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm font-medium">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Mã SV</th>
                <th className="px-6 py-4">Họ và Tên</th>
                <th className="px-6 py-4">Ngày sinh</th>
                <th className="px-6 py-4">Liên hệ / CCCD</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Phòng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentStudents.map((student) => (
                <tr key={student.MaSV} className="hover:bg-blue-50/30 transition-colors group font-semibold">
                  <td className="px-6 py-4 font-bold text-[#00529C]">{student.MaSV}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{student.HoTen}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                      {student.GioiTinh === 1 ? 'Nam' : 'Nữ'}
                    </div>
                  </td>
                  {/* CỘT NGÀY SINH MỚI */}
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <div className="flex items-center">
                        <Calendar size={12} className="mr-1.5 text-slate-400" />
                        {student.NgaySinh ? new Date(student.NgaySinh).toLocaleDateString('vi-VN') : '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">
                    <div className="flex items-center"><Phone size={12} className="mr-1 text-slate-400"/> {student.SDT || '---'}</div>
                    <div className="flex items-center mt-1 mr-1"><CreditCard size={12} className="mr-1 text-slate-400"/>{student.CCCD}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 max-w-[150px] truncate">{student.Email}</td>
                  <td className="px-6 py-4 text-center">
                    {student.TenPhong ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 font-bold text-[11px]">
                         P. {student.TenPhong}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Chưa ở</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(student)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.MaSV)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-all"
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
         {!isLoading && filteredStudents.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold italic">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredStudents.length)} trên {filteredStudents.length} sinh viên
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                    ? "bg-[#00529C] text-white shadow-md shadow-blue-100" 
                    : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all border border-transparent"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
                {editingStudent ? 'Cập nhật hồ sơ sinh viên' : 'Thêm hồ sơ sinh viên mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-5 text-sm font-medium text-slate-700">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mã sinh viên</label>
                <input 
                  required disabled={!!editingStudent}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all disabled:opacity-60 font-semibold"
                  value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Họ và tên</label>
                <input 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all font-semibold"
                  value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                />
              </div>

              {/* TRƯỜNG NGÀY SINH TRONG MODAL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ngày sinh</label>
                <input 
                  required
                  type="date"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all font-semibold"
                  value={formData.ngaySinh} onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Giới tính</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] font-semibold"
                  value={formData.gioiTinh} 
                  onChange={(e) => setFormData({...formData, gioiTinh: parseInt(e.target.value)})}
                >
                  <option value={1}>Nam</option>
                  <option value={0}>Nữ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số CCCD</label>
                <input 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all font-semibold"
                  value={formData.cccd} onChange={(e) => setFormData({...formData, cccd: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số điện thoại</label>
                <input 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all font-semibold"
                  value={formData.sdt} onChange={(e) => setFormData({...formData, sdt: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email sinh viên</label>
                <input 
                  required type="email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all font-semibold"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {!editingStudent && (
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mật khẩu đăng nhập</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00529C] focus:bg-white transition-all pr-12 font-semibold"
                      placeholder="Mặc định: 123456aA@"
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00529C] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="col-span-2 pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase text-[10px] hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#00529C] text-white rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Xác nhận thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;