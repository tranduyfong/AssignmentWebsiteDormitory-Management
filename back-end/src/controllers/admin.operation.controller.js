const pool = require('../configs/db.config');

// --- NỘI QUY ---
exports.createRule = async (req, res) => {
    const { tieuDe, danhMuc, noiDung, trangThai } = req.body;
    const ngayCapNhat = new Date().toISOString().split('T')[0];
    try {
        await pool.execute(
            'INSERT INTO NoiQuy (TieuDe, DanhMuc, NoiDung, NgayCapNhat, TrangThai) VALUES (?, ?, ?, ?, ?)',
            [tieuDe, danhMuc, noiDung, ngayCapNhat, trangThai === 'Đang áp dụng' ? 1 : 0]
        );
        res.status(201).json({ message: 'Thêm nội quy thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm nội quy.' });
    }
};

// --- VI PHẠM ---
exports.recordViolation = async (req, res) => {
    const { maSV, loaiViPham, noiDung, hinhThucXuLy } = req.body;
    const ngayViPham = new Date().toISOString().split('T')[0];
    try {
        await pool.execute(
            'INSERT INTO ViPham (MaSV, NgayViPham, LoaiViPham, NoiDung, HinhThucXuLy, TrangThai) VALUES (?, ?, ?, ?, ?, 0)',
            [maSV, ngayViPham, loaiViPham, noiDung, hinhThucXuLy]
        );
        res.status(201).json({ message: 'Ghi nhận vi phạm thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi ghi nhận vi phạm.' });
    }
};

exports.getAllViolations = async (req, res) => {
    try {
        const query = `
            SELECT v.*, s.HoTen as TenSinhVien, p.TenPhong 
            FROM ViPham v
            JOIN SinhVien s ON v.MaSV = s.MaSV
            LEFT JOIN Phong p ON s.MaPhong = p.MaPhong
            ORDER BY v.NgayViPham DESC
        `;
        const [violations] = await pool.execute(query);
        res.status(200).json(violations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách vi phạm.' });
    }
};

// --- PHẢN ÁNH ---
exports.updateIncidentStatus = async (req, res) => {
    const { id } = req.params; // MaPhanAnh
    try {
        await pool.execute('UPDATE PhanAnh SET TrangThai = 1 WHERE MaPhanAnh = ?', [id]);
        res.status(200).json({ message: 'Đã đánh dấu xử lý xong sự cố.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật phản ánh.' });
    }
};

exports.getAllIncidents = async (req, res) => {
    try {
        const query = `
            SELECT pa.*, s.HoTen as TenSinhVien, p.TenPhong 
            FROM PhanAnh pa
            JOIN SinhVien s ON pa.MaSV = s.MaSV
            LEFT JOIN Phong p ON s.MaPhong = p.MaPhong
            ORDER BY pa.NgayGui DESC
        `;
        const [incidents] = await pool.execute(query);
        res.status(200).json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách phản ánh.' });
    }
};