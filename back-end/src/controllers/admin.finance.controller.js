const pool = require('../configs/db.config');

// --- QUẢN LÝ ĐIỆN NƯỚC ---
exports.recordUtilities = async (req, res) => {
    const { maPhong, chiSoDienCu, chiSoDienMoi, chiSoNuocCu, chiSoNuocMoi, thoiGian } = req.body;
    try {
        const query = `
            INSERT INTO DienNuoc (MaPhong, ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi, ThoiGian, TrangThaiChot)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        await pool.execute(query, [maPhong, chiSoDienCu, chiSoDienMoi, chiSoNuocCu, chiSoNuocMoi, thoiGian]);
        res.status(201).json({ message: 'Ghi nhận chỉ số điện nước thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi ghi điện nước.' });
    }
};

// --- QUẢN LÝ HÓA ĐƠN ---
exports.createInvoice = async (req, res) => {
    const { maPhong, maSV, maDienNuoc, loaiHoaDon, kyHoaDon, soTien } = req.body;
    const ngayLap = new Date().toISOString().split('T')[0];

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Tạo hóa đơn
        const queryHoaDon = `
            INSERT INTO HoaDon (MaPhong, MaSV, MaDienNuoc, LoaiHoaDon, KyHoaDon, SoTien, TrangThaiThanhToan, NgayLap)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        `;
        await connection.execute(queryHoaDon, [maPhong, maSV, maDienNuoc || null, loaiHoaDon, kyHoaDon, soTien, ngayLap]);

        // 2. Nếu là hóa đơn điện nước, cập nhật trạng thái đã chốt
        if (maDienNuoc) {
            await connection.execute('UPDATE DienNuoc SET TrangThaiChot = 1 WHERE MaDienNuoc = ?', [maDienNuoc]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Tạo hóa đơn thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo hóa đơn.' });
    } finally {
        connection.release();
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const query = `
            SELECT hd.*, s.HoTen as TenSinhVien, p.TenPhong
            FROM HoaDon hd
            JOIN SinhVien s ON hd.MaSV = s.MaSV
            JOIN Phong p ON hd.MaPhong = p.MaPhong
            ORDER BY hd.NgayLap DESC
        `;
        const [invoices] = await pool.execute(query);
        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách hóa đơn.' });
    }
};