const pool = require('../configs/db.config');

// 1. Lấy danh sách hợp đồng của sinh viên
exports.getMyContracts = async (req, res) => {
    try {
        const maSV = req.user.id; // Lấy từ Token

        // Join với bảng Phong để lấy thêm tên phòng hiển thị
        const query = `
            SELECT h.*, p.TenPhong 
            FROM HopDong h
            JOIN Phong p ON h.MaPhong = p.MaPhong
            WHERE h.MaSV = ?
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