const pool = require('../configs/db.config');
const { vnpay, returnUrl } = require('../configs/vnpay.config');

exports.getRoomList = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                t.TenToaNha, 
                k.TenKhu,
                (SELECT GROUP_CONCAT(HoTen SEPARATOR ', ') 
                 FROM SinhVien 
                 WHERE MaPhong = p.MaPhong) as DanhSachSV
            FROM Phong p
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            JOIN Khu k ON t.MaKhu = k.MaKhu
            WHERE p.TrangThai != 'Bảo trì'
            ORDER BY k.TenKhu ASC, t.TenToaNha ASC, p.TenPhong ASC
        `;
        const [rooms] = await pool.execute(query);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng.' });
    }
};

// 1. Lấy danh sách hợp đồng của sinh viên
exports.getMyContracts = async (req, res) => {
    try {
        const maSV = req.user.id; // Lấy từ Token

        // Join với bảng Phong để lấy thêm tên phòng hiển thị
        const query = `
            SELECT h.*, p.TenPhong 
            FROM HopDong h
            JOIN Phong p ON h.MaPhong = p.MaPhong
            WHERE h.MaSV = ? AND h.TrangThai = 1
        `;
        const [contracts] = await pool.execute(query, [maSV]);
        res.status(200).json(contracts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hợp đồng.' });
    }
};

// 2. Gửi đơn đăng ký phòng
exports.submitRegistration = async (req, res) => {
    try {
        const maSV = req.user.id;
        const { hocKy, nguyenVongKhu, nguyenVongLoaiPhong, ghiChu } = req.body;

        // Lấy ngày hiện tại (Format YYYY-MM-DD)
        const ngayDangKy = new Date().toISOString().split('T')[0];

        // Trạng thái mặc định là 0 (Chờ duyệt)
        const query = `
            INSERT INTO DangKy (MaSV, HocKy, NguyenVongKhu, NguyenVongLoaiPhong, GhiChu, NgayDangKy, TrangThai) 
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        await pool.execute(query, [maSV, hocKy, nguyenVongKhu, nguyenVongLoaiPhong, ghiChu, ngayDangKy]);

        res.status(201).json({ message: 'Đã gửi đơn đăng ký thành công. Vui lòng chờ BQL xét duyệt.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi gửi đơn đăng ký.' });
    }
};

// 3. Lấy danh sách hóa đơn
exports.getMyInvoices = async (req, res) => {
    try {
        const maSV = req.user.id;
        const query = `
            SELECT hd.*, d.ChiSoDienCu, d.ChiSoDienMoi, d.ChiSoNuocCu, d.ChiSoNuocMoi 
            FROM HoaDon hd
            LEFT JOIN DienNuoc d ON hd.MaDienNuoc = d.MaDienNuoc
            WHERE hd.MaSV = ?
            ORDER BY hd.NgayLap DESC
        `;
        const [invoices] = await pool.execute(query, [maSV]);
        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hóa đơn.' });
    }
};
exports.getUnpaidInvoices = async (req, res) => {
    try {
        const maSV = req.user.id; // Lấy từ Token
        const query = `
            SELECT hd.*, d.ChiSoDienCu, d.ChiSoDienMoi, d.ChiSoNuocCu, d.ChiSoNuocMoi 
            FROM HoaDon hd
            LEFT JOIN DienNuoc d ON hd.MaDienNuoc = d.MaDienNuoc
            WHERE hd.MaSV = ? AND hd.TrangThaiThanhToan = 0
            ORDER BY hd.NgayLap DESC
        `;

        const [unpaidInvoices] = await pool.execute(query, [maSV]);
        res.status(200).json(unpaidInvoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hóa đơn chưa thanh toán.' });
    }
};

// 4. Gửi báo cáo sự cố (Phản ánh)
exports.submitIncident = async (req, res) => {
    try {
        const maSV = req.user.id;
        const { danhMuc, tieuDe, noiDung } = req.body;
        const ngayGui = new Date().toISOString().split('T')[0];

        await pool.execute(
            'INSERT INTO PhanAnh (MaSV, DanhMuc, TieuDe, NoiDung, NgayGui, TrangThai) VALUES (?, ?, ?, ?, ?, 0)',
            [maSV, danhMuc, tieuDe, noiDung, ngayGui]
        );
        res.status(201).json({ message: 'Đã gửi phản ánh sự cố.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi gửi phản ánh.' });
    }
};

// 5. Xem lịch sử vi phạm
exports.getMyViolations = async (req, res) => {
    try {
        const maSV = req.user.id;
        const [violations] = await pool.execute('SELECT * FROM ViPham WHERE MaSV = ? ORDER BY NgayViPham DESC', [maSV]);
        res.status(200).json(violations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu vi phạm.' });
    }
};

exports.getRules = async (req, res) => {
    try {
        // Chỉ lấy những nội quy đang áp dụng (TrangThai = 1)
        const query = `
            SELECT MaNoiQuy, TieuDe, DanhMuc, NoiDung, NgayCapNhat 
            FROM NoiQuy 
            WHERE TrangThai = 1 
            ORDER BY NgayCapNhat DESC
        `;
        const [rules] = await pool.execute(query);
        res.status(200).json(rules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nội quy.' });
    }
};

// 1. TẠO URL THANH TOÁN VNPAY (Đã dùng thư viện)
exports.createPaymentUrl = async (req, res) => {
    try {
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const { amount, invoiceIds } = req.body;

        const orderId = new Date().getTime().toString();
        const orderInfo = `THANH_TOAN_HD_${invoiceIds.join('_')}`;

        // Thư viện sẽ tự động format ngày giờ, sắp xếp tham số và tạo mã băm
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount, // Truyền đúng số tiền VNĐ (thư viện sẽ tự nhân 100)
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
            vnp_Locale: 'vn'
        });

        res.status(200).json({ paymentUrl });
    } catch (error) {
        console.error("Lỗi tạo URL VNPay:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo thanh toán.' });
    }
};

// 2. XỬ LÝ KẾT QUẢ VNPAY TRẢ VỀ VÀ CẬP NHẬT DATABASE
exports.vnpayReturn = async (req, res) => {
    const frontendRedirectUrl = 'http://localhost:5173/student/invoices'; // Nhớ đổi thành URL Frontend của bạn

    try {
        // Thư viện tự động xác thực chữ ký (Checksum) cực kỳ an toàn
        const verify = vnpay.verifyReturnUrl(req.query);

        if (!verify.isSuccess) {
            // Dữ liệu bị sai hoặc có người cố tình can thiệp vào URL
            return res.redirect(`${frontendRedirectUrl}?paymentStatus=invalid`);
        }

        // vnp_ResponseCode == '00' là khách đã trừ tiền thành công
        if (req.query.vnp_ResponseCode === '00') {
            const orderInfo = req.query.vnp_OrderInfo; // VD: THANH_TOAN_HD_1_2_3

            // Tách lấy danh sách ID hóa đơn [1, 2, 3]
            const idString = orderInfo.replace('THANH_TOAN_HD_', '');
            const invoiceIds = idString.split('_');

            if (invoiceIds.length > 0) {
                // Cập nhật CSDL: Chuyển hóa đơn sang Đã thanh toán (1)
                await pool.query(
                    'UPDATE HoaDon SET TrangThaiThanhToan = 1 WHERE MaHoaDon IN (?)',
                    [invoiceIds]
                );
            }

            // Chuyển hướng về React
            return res.redirect(`${frontendRedirectUrl}?paymentStatus=success`);
        } else {
            // Khách hàng bấm "Hủy giao dịch" hoặc thẻ không đủ tiền
            return res.redirect(`${frontendRedirectUrl}?paymentStatus=failed`);
        }
    } catch (error) {
        console.error("Lỗi update CSDL sau khi thanh toán:", error);
        res.redirect(`${frontendRedirectUrl}?paymentStatus=error`);
    }
};