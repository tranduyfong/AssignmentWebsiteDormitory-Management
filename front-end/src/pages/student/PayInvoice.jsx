import React, { useState } from 'react';
import { CreditCard, Banknote, QrCode, CheckCircle2, ShieldCheck, X } from 'lucide-react';

const PayInvoice = () => {
    // Dữ liệu hóa đơn chưa thanh toán
    const [unpaidInvoices, setUnpaidInvoices] = useState([
        { id: 'INV-24002', month: 'Tháng 03/2026', type: 'Điện nước', amount: '125.000đ' }
    ]);

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showCashModal, setShowCashModal] = useState(false);

    const handlePayment = (e) => {
        e.preventDefault();
        if (paymentMethod === 'cash') {
            setShowCashModal(true);
        } else {
            alert("Đang chuyển hướng sang cổng thanh toán VNPay...");
        }
    };

    // Trạng thái đã thanh toán hết
    if (unpaidInvoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Tuyệt vời!</h2>
                <p className="text-slate-500 text-center max-w-md">
                    Bạn đã thanh toán toàn bộ hóa đơn hiện tại. Không có khoản nợ nào cần xử lý.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Thanh toán hóa đơn</h1>
                <p className="text-slate-500 font-medium text-sm">Xử lý các khoản phí chưa thanh toán của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột trái: Danh sách hóa đơn nợ */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Hóa đơn cần thanh toán</h3>
                    {unpaidInvoices.map((inv) => (
                        <div key={inv.id} className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                            <div className="flex justify-between items-start mb-2 pl-2">
                                <div>
                                    <h4 className="font-bold text-slate-800">{inv.type}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.id} • {inv.month}</p>
                                </div>
                                <span className="font-black text-red-600 text-lg">{inv.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cột phải: Phương thức thanh toán */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">Chọn phương thức thanh toán</h3>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div className="space-y-3">
                            <label
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                            >
                                <input type="radio" name="method" value="cash" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-blue-500' : 'border-slate-300'}`}>
                                    {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                                </div>
                                <Banknote size={24} className="text-slate-600 mr-3" />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Thanh toán Tiền mặt</p>
                                    <p className="text-xs text-slate-500">Nộp trực tiếp tại phòng Kế toán KTX</p>
                                </div>
                            </label>

                            <label
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                            >
                                <input type="radio" name="method" value="vnpay" className="hidden" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'vnpay' ? 'border-blue-500' : 'border-slate-300'}`}>
                                    {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                                </div>
                                <QrCode size={24} className="text-slate-600 mr-3" />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Thanh toán qua VNPay</p>
                                    <p className="text-xs text-slate-500">Quét mã QR qua ứng dụng ngân hàng</p>
                                </div>
                            </label>
                        </div>

                        <button type="submit" className="w-full flex items-center justify-center py-3.5 bg-[#00529C] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all uppercase tracking-widest text-xs">
                            <CreditCard size={18} className="mr-2" /> Xác nhận thanh toán
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal Tiền mặt */}
            {showCashModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 text-center p-8">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Banknote size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Hướng dẫn thanh toán</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                            Bạn đã chọn phương thức tiền mặt. Vui lòng mang theo <strong>Mã sinh viên</strong> và di chuyển đến <strong>Phòng Kế toán (Tầng 1 - Tòa nhà Ban Quản Lý)</strong> trong giờ hành chính để thực hiện đóng phí.
                        </p>
                        <button
                            onClick={() => setShowCashModal(false)}
                            className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase text-xs tracking-wider"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayInvoice;