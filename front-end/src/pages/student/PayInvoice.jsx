import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, QrCode, ShieldCheck, Loader2, Calendar, Receipt, Calculator, Inbox, Check } from 'lucide-react';
import axiosClient from '../../utils/axios.interceptor';
import toast from 'react-hot-toast';

const PayInvoice = () => {
    const [unpaidInvoices, setUnpaidInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showCashModal, setShowCashModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchUnpaidInvoices = async () => {
        try {
            setIsLoading(true);
            const data = await axiosClient.get('/student/unpaid-invoices');
            setUnpaidInvoices(data);
            setSelectedIds(data.map(inv => inv.MaHoaDon));
        } catch (error) {
            console.error("Lỗi lấy hóa đơn:", error);
            toast.error("Không thể tải danh sách hóa đơn");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnpaidInvoices();
    }, []);

    const totalAmount = unpaidInvoices
        .filter(inv => selectedIds.includes(inv.MaHoaDon))
        .reduce((sum, inv) => sum + Number(inv.SoTien), 0);

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === unpaidInvoices.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(unpaidInvoices.map(inv => inv.MaHoaDon));
        }
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) {
            return toast.error("Vui lòng chọn ít nhất một hóa đơn để thanh toán");
        }
        if (paymentMethod === 'cash') {
            setShowCashModal(true);
        } else {
            alert(`Đang chuyển hướng thanh toán trực tuyến cho ${selectedIds.length} hóa đơn...`);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#00529C] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang kiểm tra dữ liệu hóa đơn...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Thanh toán hóa đơn</h1>
                <p className="text-slate-500 font-medium text-sm">Xử lý các khoản phí chưa thanh toán của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CỘT TRÁI: DANH SÁCH HÓA ĐƠN NỢ */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Chọn Hóa đơn cần thanh toán</h3>
                        {unpaidInvoices.length > 0 && (
                            <button 
                                onClick={toggleSelectAll}
                                className="text-[10px] font-bold text-[#00529C] hover:underline uppercase tracking-widest"
                            >
                                {selectedIds.length === unpaidInvoices.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {unpaidInvoices.length > 0 ? (
                            unpaidInvoices.map((inv) => {
                                const isSelected = selectedIds.includes(inv.MaHoaDon);
                                return (
                                    <div 
                                        key={inv.MaHoaDon} 
                                        onClick={() => toggleSelect(inv.MaHoaDon)}
                                        className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'border-[#00529C] shadow-md ring-1 ring-[#00529C]' : 'border-slate-100 shadow-sm'}`}
                                    >
                                        {/* Vạch màu bên trái mờ khi chưa chọn */}
                                        <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${isSelected ? 'bg-[#00529C]' : 'bg-slate-200 opacity-40'}`}></div>
                                        
                                        <div className="flex justify-between items-center pl-2">
                                            <div className="flex items-center gap-3">
                                                {/* Checkbox: Mờ khi chưa chọn (opacity-30) */}
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-[#00529C] border-[#00529C] opacity-100' : 'border-slate-300 bg-white opacity-30'}`}>
                                                    {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                
                                                {/* Chữ: Luôn rõ nét */}
                                                <div>
                                                    <h4 className="font-bold text-sm uppercase tracking-tight text-slate-800">{inv.LoaiHoaDon}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                        Mã: {inv.MaHoaDon} • {inv.KyHoaDon}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Số tiền: Luôn rõ nét */}
                                            <span className={'font-black text-lg text-red-600'}>
                                                {Number(inv.SoTien).toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white p-10 rounded-[24px] border-2 border border-slate-200 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <Inbox size={32} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Không có hóa đơn nào</p>
                            </div>
                        )}
                    </div>

                    {/* PHẦN TỔNG TIỀN */}
                    <div className="p-5 bg-white rounded-2xl border border-blue-200 flex justify-between items-center mt-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-[#00529C] rounded-lg">
                                <Calculator size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Tổng số tiền cần thanh toán</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-black text-[#00529C] tracking-tighter">
                                {totalAmount.toLocaleString('vi-VN')} 
                                <span className="text-sm ml-1 font-bold">đ</span>
                            </h2>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: PHƯƠNG THỨC THANH TOÁN */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm self-start">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-4">Chọn phương thức thanh toán</h3>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-[#00529C] bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
                                <input type="radio" name="method" value="cash" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#00529C]' : 'border-slate-300 bg-white'}`}>
                                    {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-[#00529C] rounded-full"></div>}
                                </div>
                                <Banknote size={24} className={paymentMethod === 'cash' ? 'text-[#00529C] mr-3' : 'text-slate-400 mr-3'} />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm leading-none">Thanh toán Tiền mặt</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Nộp trực tiếp tại phòng Kế toán KTX</p>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-[#00529C] bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
                                <input type="radio" name="method" value="vnpay" className="hidden" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'vnpay' ? 'border-[#00529C]' : 'border-slate-300 bg-white'}`}>
                                    {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-[#00529C] rounded-full"></div>}
                                </div>
                                <QrCode size={24} className={paymentMethod === 'vnpay' ? 'text-[#00529C] mr-3' : 'text-slate-400 mr-3'} />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm leading-none">Thanh toán qua VNPay</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Quét mã QR qua ứng dụng ngân hàng</p>
                                </div>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={selectedIds.length === 0}
                            className={`w-full flex items-center justify-center py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 uppercase text-[11px] tracking-widest ${selectedIds.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#00529C] text-white hover:bg-blue-800 shadow-blue-500/20'}`}
                        >
                            <CreditCard size={18} className="mr-2" /> Xác nhận thanh toán {selectedIds.length > 0 && `(${selectedIds.length})`}
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal Tiền mặt */}
            {showCashModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 text-center p-8">
                        <div className="w-16 h-16 bg-blue-50 text-[#00529C] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 font-black">
                            <Banknote size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Hướng dẫn thanh toán</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-8 font-medium">
                            Bạn đã chọn thanh toán tiền mặt cho. Vui lòng mang theo <strong>Mã sinh viên</strong> và di chuyển đến <strong>Phòng Kế toán (Tầng 1 - Tòa nhà Ban Quản Lý)</strong> trong giờ hành chính để thực hiện đóng phí.
                        </p>
                        <button onClick={() => setShowCashModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest active:scale-95">Đã hiểu</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayInvoice;